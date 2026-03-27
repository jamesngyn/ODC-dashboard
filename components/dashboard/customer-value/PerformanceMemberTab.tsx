"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TaskStatus } from "@/types/enums/common";
import type { AcmsProject, AcmsResource } from "@/types/interfaces/acms";
import type { BacklogIssue } from "@/types/interfaces/common";
import { getAcmsResources, type AcmsResourcesParams } from "@/lib/api/acms";
import {
  getBacklogIssueTypes,
  getBacklogProjectMembers,
  getBacklogStatuses,
  getBacklogTasksByActualEndDateRange,
} from "@/lib/api/backlog";
import {
  cn,
  getPointFromIssue,
  getReEstimateEffortFromIssue,
} from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ALL_VALUE, type PeriodMode } from "./BusyRateMemberFilters";

interface MemberAggregate {
  estimatedEffortHours: number;
  reEstimateEffortHours: number;
  actualEffortHours: number;
  uspPoint: number;
}

type BacklogProjectMapping = {
  acmsProjectId: number;
  acmsProjectName: string;
  acmsProjectCode: string;
  backlogProjectId: string;
};

type ProjectPerformanceRow = {
  key: string;
  projectId: number;
  projectName: string;
  projectCode: string;
  estimatedEffortHours: number;
  reEstimateEffortHours: number;
  actualEffortHours: number;
  uspPoint: number;
  performanceByEstimatePercent: number | null;
  performanceByReEstimatePercent: number | null;
  performanceByPoint: number | null;
};

type MemberPerformanceRow = {
  key: string;
  employeeId: string;
  fullName: string;
  email: string;
  roles: string;
  jobRank: string;
  rankCoefficient: number;
  projects: ProjectPerformanceRow[];
  estimatedEffortHours: number;
  reEstimateEffortHours: number;
  actualEffortHours: number;
  uspPoint: number;
  performanceByEstimatePercent: number | null;
  performanceByReEstimatePercent: number | null;
  performanceByPoint: number | null;
};

function aggregateClosedIssuesByAssignee(
  issues: BacklogIssue[]
): Map<number, MemberAggregate> {
  const map = new Map<number, MemberAggregate>();

  for (const issue of issues) {
    const assigneeId = issue.assignee?.id;
    if (assigneeId == null) continue;

    const estimated = Math.max(0, issue.estimatedHours ?? 0);
    const reEstimate = getReEstimateEffortFromIssue(issue);
    const actual = Math.max(0, issue.actualHours ?? 0);
    const point = getPointFromIssue(issue);

    const existing = map.get(assigneeId);
    if (existing) {
      existing.estimatedEffortHours += estimated;
      existing.reEstimateEffortHours += reEstimate;
      existing.actualEffortHours += actual;
      existing.uspPoint += point;
    } else {
      map.set(assigneeId, {
        estimatedEffortHours: estimated,
        reEstimateEffortHours: reEstimate,
        actualEffortHours: actual,
        uspPoint: point,
      });
    }
  }

  return map;
}

function buildPerformanceByEstimate(
  estimated: number,
  actual: number,
  rankCoeff: number
): number | null {
  const denom = actual * rankCoeff;
  if (denom <= 0) return null;
  return (estimated / denom) * 100;
}

function buildPerformanceByReEstimate(
  reEstimate: number,
  actual: number,
  rankCoeff: number
): number | null {
  const denom = actual * rankCoeff;
  if (denom <= 0) return null;
  return (reEstimate / denom) * 100;
}

function buildPerformanceByPoint(
  point: number,
  actual: number,
  rankCoeff: number
): number | null {
  const denom = actual * rankCoeff;
  if (denom <= 0) return null;
  return point / denom;
}

export interface PerformanceMemberTabProps {
  periodMode: PeriodMode;
  selectedDate: Date;
  selectedProjectId: string;
  selectedTeamId: string;
  nameFilter: string;
  from: string;
  to: string;
  projects: AcmsProject[];
}

export function PerformanceMemberTab({
  selectedProjectId,
  selectedTeamId,
  nameFilter,
  from,
  to,
  projects,
}: PerformanceMemberTabProps) {
  const { t } = useTranslation();
  const [expandedEmployeeKeys, setExpandedEmployeeKeys] = useState<Set<string>>(
    new Set()
  );

  const backlogProjectMappings = useMemo((): BacklogProjectMapping[] => {
    return projects
      .map((project) => ({
        project,
        normalizedBacklogProjectId:
          project.backlog_project_id == null
            ? ""
            : String(project.backlog_project_id).trim(),
      }))
      .filter(({ normalizedBacklogProjectId }) => normalizedBacklogProjectId !== "")
      .map((project) => ({
        acmsProjectId: project.project.id,
        acmsProjectName: project.project.name,
        acmsProjectCode: project.project.code,
        backlogProjectId: project.normalizedBacklogProjectId,
      }));
  }, [projects]);

  const { data: backlogProjectData = [], isLoading: isLoadingBacklogData } =
    useQuery({
      queryKey: [
        ...QUERY_KEYS.CUSTOMER_VALUE.PERFORMANCE_CLOSED_ISSUES([]),
        "all-backlog-projects",
        from,
        to,
        backlogProjectMappings.map((p) => p.acmsProjectId).join(","),
      ],
      enabled: backlogProjectMappings.length > 0,
      queryFn: async () =>
        Promise.all(
          backlogProjectMappings.map(async (mapping) => {
            const [members, statuses, issueTypes] = await Promise.all([
              getBacklogProjectMembers(false, mapping.backlogProjectId),
              getBacklogStatuses(mapping.backlogProjectId),
              getBacklogIssueTypes(mapping.backlogProjectId),
            ]);

            const closedStatusId =
              statuses.find(
                (status) =>
                  status.name?.toLowerCase() === TaskStatus.Closed.toLowerCase()
              )?.id ?? null;
            const taskIssueTypeId =
              issueTypes.find(
                (issueType) => issueType.name?.toLowerCase() === "task"
              )?.id ?? null;

            const issues =
              closedStatusId != null && taskIssueTypeId != null
                ? await getBacklogTasksByActualEndDateRange({
                    projectId: mapping.backlogProjectId,
                    statusIds: [closedStatusId],
                    issueTypeIds: [taskIssueTypeId],
                    from,
                    to,
                  })
                : [];

            return {
              mapping,
              members,
              issues,
            };
          })
        ),
    });

  const acmsResourceParams = useMemo((): AcmsResourcesParams => {
    const base: AcmsResourcesParams = {
      from,
      to,
      period: "month",
      page: 1,
      limit: 1000,
    };
    if (selectedTeamId !== ALL_VALUE) {
      base["team_ids[]"] = [Number(selectedTeamId)];
    }
    return base;
  }, [from, to, selectedTeamId]);

  const { data: acmsResponse, isLoading: isLoadingAcms } = useQuery({
    queryKey: [
      ...QUERY_KEYS.CUSTOMER_VALUE.ACMS_RESOURCES,
      from,
      to,
      "month",
      1,
      1000,
      selectedTeamId,
    ],
    queryFn: () => getAcmsResources(acmsResourceParams),
  });

  const acmsByEmail = useMemo(() => {
    const list = acmsResponse?.resources?.data ?? [];
    const map = new Map<string, AcmsResource>();
    for (const r of list) {
      if (r.email?.trim()) {
        const normalized = r.email.trim().toLowerCase();
        map.set(normalized, r);
      }
    }
    return map;
  }, [acmsResponse]);

  const employeeRows = useMemo((): MemberPerformanceRow[] => {
    const mappingByAcmsProjectId = new Map<number, BacklogProjectMapping>();
    for (const mapping of backlogProjectMappings) {
      mappingByAcmsProjectId.set(mapping.acmsProjectId, mapping);
    }

    const backlogDataByAcmsProjectId = new Map<
      number,
      {
        issueAggregateByAssigneeId: Map<number, MemberAggregate>;
        memberIdByEmail: Map<string, number>;
      }
    >();

    for (const projectData of backlogProjectData) {
      const memberIdByEmail = new Map<string, number>();
      for (const member of projectData.members) {
        const normalizedEmail = member.mailAddress?.trim().toLowerCase();
        if (!normalizedEmail) continue;
        memberIdByEmail.set(normalizedEmail, member.id);
      }

      backlogDataByAcmsProjectId.set(projectData.mapping.acmsProjectId, {
        issueAggregateByAssigneeId: aggregateClosedIssuesByAssignee(
          projectData.issues
        ),
        memberIdByEmail,
      });
    }

    const memberRows: MemberPerformanceRow[] = [];
    const acmsMembers = Array.from(acmsByEmail.values());

    for (const acmsMember of acmsMembers) {
      if (
        selectedTeamId !== ALL_VALUE &&
        String(acmsMember.team?.id) !== selectedTeamId
      ) {
        continue;
      }

      const participatingProjectIds = new Set<number>();

      for (const allocate of acmsMember.allocates ?? []) {
        if (mappingByAcmsProjectId.has(allocate.project_id)) {
          participatingProjectIds.add(allocate.project_id);
        }
      }

      if (acmsMember.project) {
        const fallbackMapping = backlogProjectMappings.find(
          (mapping) => mapping.acmsProjectName === acmsMember.project
        );
        if (fallbackMapping)
          participatingProjectIds.add(fallbackMapping.acmsProjectId);
      }

      const normalizedEmail = acmsMember.email?.trim().toLowerCase() ?? "";

      const rankCoefficient = acmsMember.level?.coefficient ?? 1;
      const projectRows: ProjectPerformanceRow[] = [];

      for (const projectId of Array.from(participatingProjectIds)) {
        const mapping = mappingByAcmsProjectId.get(projectId);
        if (!mapping) continue;

        const backlogData = backlogDataByAcmsProjectId.get(projectId);
        const backlogMemberId = normalizedEmail
          ? backlogData?.memberIdByEmail.get(normalizedEmail)
          : undefined;
        const aggregate =
          backlogMemberId != null
            ? backlogData?.issueAggregateByAssigneeId.get(backlogMemberId)
            : undefined;
        const safeAggregate: MemberAggregate = aggregate ?? {
          estimatedEffortHours: 0,
          reEstimateEffortHours: 0,
          actualEffortHours: 0,
          uspPoint: 0,
        };

        projectRows.push({
          key: `${acmsMember.user_id}-${projectId}`,
          projectId,
          projectName: mapping.acmsProjectName,
          projectCode: mapping.acmsProjectCode || "-",
          estimatedEffortHours: safeAggregate.estimatedEffortHours,
          reEstimateEffortHours: safeAggregate.reEstimateEffortHours,
          actualEffortHours: safeAggregate.actualEffortHours,
          uspPoint: safeAggregate.uspPoint,
          performanceByEstimatePercent: buildPerformanceByEstimate(
            safeAggregate.estimatedEffortHours,
            safeAggregate.actualEffortHours,
            rankCoefficient
          ),
          performanceByReEstimatePercent: buildPerformanceByReEstimate(
            safeAggregate.reEstimateEffortHours,
            safeAggregate.actualEffortHours,
            rankCoefficient
          ),
          performanceByPoint: buildPerformanceByPoint(
            safeAggregate.uspPoint,
            safeAggregate.actualEffortHours,
            rankCoefficient
          ),
        });
      }

      const memberRow: MemberPerformanceRow = {
        key: String(acmsMember.user_id),
        employeeId: acmsMember.code ?? "-",
        fullName: acmsMember.name ?? "-",
        email: acmsMember.email ?? "-",
        roles: acmsMember.position?.name ?? "-",
        jobRank: acmsMember.level?.name ?? "-",
        rankCoefficient,
        projects: projectRows.sort((a, b) => a.projectName.localeCompare(b.projectName)),
        estimatedEffortHours: 0,
        reEstimateEffortHours: 0,
        actualEffortHours: 0,
        uspPoint: 0,
        performanceByEstimatePercent: null,
        performanceByReEstimatePercent: null,
        performanceByPoint: null,
      };

      memberRows.push(memberRow);
    }

    const filteredMemberRows = memberRows
      .map((memberRow) => {
        const filteredProjects =
          selectedProjectId === ALL_VALUE
            ? memberRow.projects
            : memberRow.projects.filter(
                (project) => String(project.projectId) === selectedProjectId
              );

        return {
          ...memberRow,
          projects: filteredProjects,
        };
      })
      .filter((memberRow) => memberRow.projects.length > 0 || selectedProjectId === ALL_VALUE);

    const keyword = nameFilter.trim().toLowerCase();
    const nameFilteredRows = keyword
      ? filteredMemberRows.filter((memberRow) => {
          const candidates = [
            memberRow.fullName,
            memberRow.employeeId,
            memberRow.email,
          ]
            .join(" ")
            .toLowerCase();
          return candidates.includes(keyword);
        })
      : filteredMemberRows;

    const rows = nameFilteredRows.map((memberRow) => {
      const estimatedEffortHours = memberRow.projects.reduce(
        (sum, project) => sum + project.estimatedEffortHours,
        0
      );
      const reEstimateEffortHours = memberRow.projects.reduce(
        (sum, project) => sum + project.reEstimateEffortHours,
        0
      );
      const actualEffortHours = memberRow.projects.reduce(
        (sum, project) => sum + project.actualEffortHours,
        0
      );
      const uspPoint = memberRow.projects.reduce(
        (sum, project) => sum + project.uspPoint,
        0
      );

      return {
        ...memberRow,
        projects: memberRow.projects,
        estimatedEffortHours,
        reEstimateEffortHours,
        actualEffortHours,
        uspPoint,
        performanceByEstimatePercent: buildPerformanceByEstimate(
          estimatedEffortHours,
          actualEffortHours,
          memberRow.rankCoefficient
        ),
        performanceByReEstimatePercent: buildPerformanceByReEstimate(
          reEstimateEffortHours,
          actualEffortHours,
          memberRow.rankCoefficient
        ),
        performanceByPoint: buildPerformanceByPoint(
          uspPoint,
          actualEffortHours,
          memberRow.rankCoefficient
        ),
      };
    });

    rows.sort((a, b) => a.employeeId.localeCompare(b.employeeId));
    return rows;
  }, [
    acmsByEmail,
    backlogProjectData,
    backlogProjectMappings,
    nameFilter,
    projects,
    selectedProjectId,
    selectedTeamId,
  ]);

  useEffect(() => {
    setExpandedEmployeeKeys(new Set());
  }, [from, to, selectedProjectId, selectedTeamId, nameFilter]);

  const handleToggleEmployee = (employeeKey: string) => {
    setExpandedEmployeeKeys((previous) => {
      const next = new Set(previous);
      if (next.has(employeeKey)) next.delete(employeeKey);
      else next.add(employeeKey);
      return next;
    });
  };

  const isLoading = isLoadingBacklogData || isLoadingAcms;
  const formatNumber = (value: number) => value.toFixed(2);
  const formatPercent = (value: number | null) =>
    value == null ? "—" : `${value.toFixed(2).replace(".", ",")}%`;
  const formatPoint = (value: number | null) =>
    value == null ? "—" : value.toFixed(3).replace(".", ",");

  return (
    <Card className="border-0 bg-zinc-50/50 shadow-none dark:bg-zinc-900/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t("customerValue.performanceMemberTitle")}
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("customerValue.performanceMemberDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800/70 dark:bg-zinc-950/30 dark:ring-zinc-50/10">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-200 dark:bg-zinc-900/60">
                  <TableHead>{t("customerValue.employeeId")}</TableHead>
                  <TableHead>{t("customerValue.fullName")}</TableHead>
                  <TableHead>{t("customerValue.email")}</TableHead>
                  <TableHead>{t("customerValue.roles")}</TableHead>
                  <TableHead>{t("customerValue.jobRank")}</TableHead>
                  <TableHead>{t("customerValue.rankCoefficient")}</TableHead>
                  <TableHead>{t("customerValue.projectName")}</TableHead>
                  <TableHead>{t("customerValue.projectId")}</TableHead>
                  <TableHead className="text-right">
                    {t("customerValue.estimatedEffortHours")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("customerValue.reEstimateEffortHours")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("customerValue.actualEffortHours")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("customerValue.uspPoint")}
                  </TableHead>
                  <TableHead>
                    {t("customerValue.performanceByEstimate")}
                  </TableHead>
                  <TableHead>
                    {t("customerValue.performanceByReEstimate")}
                  </TableHead>
                  <TableHead>{t("customerValue.performanceByPoint")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="h-20 text-center">
                      {t("customerValue.emptyTable")}
                    </TableCell>
                  </TableRow>
                ) : (
                  employeeRows.map((employeeRow, employeeIndex) => {
                    const isExpanded = expandedEmployeeKeys.has(
                      employeeRow.key
                    );
                    const isEvenEmployeeRow = employeeIndex % 2 === 0;
                    return (
                      <Fragment key={employeeRow.key}>
                        <TableRow
                          className={cn(
                            isEvenEmployeeRow
                              ? "bg-blue-50/90 dark:bg-blue-950/20"
                              : "bg-indigo-50/40 dark:bg-indigo-950/10",
                            "font-medium"
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleEmployee(employeeRow.key)
                                }
                                disabled={employeeRow.projects.length === 0}
                                aria-expanded={isExpanded}
                                className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-100 disabled:opacity-50"
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 transition-transform",
                                    isExpanded && "rotate-180"
                                  )}
                                />
                              </button>
                              <span>{employeeRow.employeeId}</span>
                            </div>
                          </TableCell>
                          <TableCell>{employeeRow.fullName}</TableCell>
                          <TableCell>{employeeRow.email}</TableCell>
                          <TableCell>{employeeRow.roles}</TableCell>
                          <TableCell>{employeeRow.jobRank}</TableCell>
                          <TableCell>
                            {employeeRow.rankCoefficient
                              .toFixed(2)
                              .replace(".", ",")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            —
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            —
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(employeeRow.estimatedEffortHours)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(employeeRow.reEstimateEffortHours)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(employeeRow.actualEffortHours)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(employeeRow.uspPoint)}
                          </TableCell>
                          <TableCell>
                            {formatPercent(
                              employeeRow.performanceByEstimatePercent
                            )}
                          </TableCell>
                          <TableCell>
                            {formatPercent(
                              employeeRow.performanceByReEstimatePercent
                            )}
                          </TableCell>
                          <TableCell>
                            {formatPoint(employeeRow.performanceByPoint)}
                          </TableCell>
                        </TableRow>

                        {isExpanded &&
                          employeeRow.projects.map(
                            (projectRow, projectIndex) => (
                              <TableRow
                                key={projectRow.key}
                                className={cn(
                                  projectIndex % 2 === 0
                                    ? "bg-zinc-50/80 dark:bg-zinc-900/25"
                                    : "bg-white dark:bg-zinc-950/10"
                                )}
                              >
                                <TableCell className="text-muted-foreground border-l-2 border-zinc-200 pl-8">
                                  {employeeRow.employeeId}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  —
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  —
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  —
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  —
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  —
                                </TableCell>
                                <TableCell>{projectRow.projectName}</TableCell>
                                <TableCell>{projectRow.projectCode}</TableCell>
                                <TableCell className="text-right">
                                  {formatNumber(
                                    projectRow.estimatedEffortHours
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatNumber(
                                    projectRow.reEstimateEffortHours
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatNumber(projectRow.actualEffortHours)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatNumber(projectRow.uspPoint)}
                                </TableCell>
                                <TableCell>
                                  {formatPercent(
                                    projectRow.performanceByEstimatePercent
                                  )}
                                </TableCell>
                                <TableCell>
                                  {formatPercent(
                                    projectRow.performanceByReEstimatePercent
                                  )}
                                </TableCell>
                                <TableCell>
                                  {formatPoint(projectRow.performanceByPoint)}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
