"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { AcmsProject, AcmsResource } from "@/types/interfaces/acms";
import { getAcmsResources, type AcmsResourcesParams } from "@/lib/api/acms";
import { cn } from "@/lib/utils";
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
import { usePerformanceBacklogProjects } from "./performance-member/performance-member.backlog";
import {
  buildBacklogProjectMappings,
  buildPerformanceMemberRows,
} from "./performance-member/performance-member.rows";
import type {
  BacklogProjectMapping,
  MemberPerformanceRow,
} from "./performance-member/performance-member.types";

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

  const backlogProjectMappings = useMemo(
    (): BacklogProjectMapping[] => buildBacklogProjectMappings(projects),
    [projects]
  );

  const {
    data: backlogProjectsResult,
    isLoading: isLoadingBacklogData,
    isError: isErrorBacklog,
  } = usePerformanceBacklogProjects({
    from,
    to,
    selectedProjectId,
    mappings: backlogProjectMappings,
    allValue: ALL_VALUE,
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

  const employeeRows = useMemo(
    (): MemberPerformanceRow[] =>
      buildPerformanceMemberRows({
        acmsByEmail,
        backlogProjectsResult,
        backlogProjectMappings,
        selectedTeamId,
        selectedProjectId,
        allValue: ALL_VALUE,
        nameFilter,
      }),
    [
      acmsByEmail,
      backlogProjectsResult,
      backlogProjectMappings,
      nameFilter,
      selectedProjectId,
      selectedTeamId,
    ]
  );

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
