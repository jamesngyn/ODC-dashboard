"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { AcmsProject, AcmsResource } from "@/types/interfaces/acms";
import {
  getAcmsProjects,
  getAcmsResources,
  type AcmsResourcesParams,
} from "@/lib/api/acms";
import { cn } from "@/lib/utils";
import {
  allocateOverlapsPeriod,
  getCalendarEffortHours,
} from "@/lib/utils/customer-value";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ALL_VALUE, type PeriodMode } from "./BusyRateMemberFilters";

export interface BusyRateMemberTabProps {
  periodMode: PeriodMode;
  selectedDate: Date;
  selectedProjectId: string;
  selectedTeamId: string;
  nameFilter: string;
  from: string;
  to: string;
}

/** Actual Effort = Log work (total_daily_report) + total_ot trong khoảng from–to. */
function actualEffortHours(resource: AcmsResource): number {
  const fromSchedule =
    resource.day_schedule?.reduce(
      (sum, d) => sum + (d.total_daily_report ?? 0),
      0
    ) ?? 0;
  const ot = resource.total_ot ?? 0;
  return fromSchedule + ot;
}

function effortDeviationPercent(
  resource: AcmsResource,
  from: string,
  to: string,
  filterByProjectId?: string
): number | null {
  const calendar = getCalendarEffortHours(
    resource,
    from,
    to,
    filterByProjectId
  );
  if (calendar <= 0) return null;
  const actual = actualEffortHours(resource);
  return Math.round((actual / calendar) * 100);
}

function effortDeviationPercentFromTotals(
  calendar: number,
  actual: number
): number | null {
  if (calendar <= 0) return null;
  return Math.round((actual / calendar) * 100);
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

const DEBOUNCE_NAME_MS = 1000;

type ProjectEffortRow = {
  key: string;
  projectName: string;
  projectCode: string;
  calendarEffortHours: number;
  actualEffortHours: number;
  effortDeviationPercent: number | null;
};

type EmployeeEffortRow = {
  key: string;
  userId: number;
  employeeId: string;
  fullName: string;
  email: string;
  roles: string;
  jobRank: string;
  rankCoefficient: string;
  projects: ProjectEffortRow[];
  calendarEffortHours: number;
  actualEffortHours: number;
  effortDeviationPercent: number | null;
};

export function BusyRateMemberTab({
  periodMode,
  selectedDate,
  selectedProjectId,
  selectedTeamId,
  nameFilter,
  from,
  to,
}: BusyRateMemberTabProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [expandedEmployeeKeys, setExpandedEmployeeKeys] = useState<Set<string>>(
    new Set()
  );
  const debouncedName = useDebounce(nameFilter.trim(), DEBOUNCE_NAME_MS);

  useEffect(() => {
    setPage(1);
  }, [from, to, selectedProjectId, selectedTeamId, debouncedName]);

  const resourceParams = useMemo((): AcmsResourcesParams => {
    const base: AcmsResourcesParams = {
      from,
      to,
      period: periodMode,
      page,
      limit: 20,
    };
    if (selectedProjectId !== ALL_VALUE) {
      base.project_id = selectedProjectId;
    }
    if (selectedTeamId !== ALL_VALUE) {
      base["team_ids[]"] = [Number(selectedTeamId)];
    }
    if (debouncedName) {
      base.name = debouncedName;
    }
    return base;
  }, [
    from,
    to,
    periodMode,
    page,
    selectedProjectId,
    selectedTeamId,
    debouncedName,
  ]);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      ...QUERY_KEYS.CUSTOMER_VALUE.ACMS_RESOURCES,
      from,
      to,
      periodMode,
      page,
      selectedProjectId,
      selectedTeamId,
      debouncedName,
    ],
    queryFn: () => getAcmsResources(resourceParams),
  });

  const { data: projectsResponse } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_VALUE.ACMS_PROJECTS,
    queryFn: getAcmsProjects,
  });

  const projects: AcmsProject[] = projectsResponse?.projects?.data ?? [];

  const data = response?.resources?.data ?? [];
  const currentPage = response?.resources?.current_page ?? 1;
  const lastPage = response?.resources?.last_page;
  const hasNextPage =
    lastPage != null ? currentPage < lastPage : data.length === 20;
  const hasPrevPage = currentPage > 1;

  const employeeRows = useMemo((): EmployeeEffortRow[] => {
    const projectsById = new Map<number, AcmsProject>();
    for (const project of projects) projectsById.set(project.id, project);

    const employeesByUserId = new Map<number, EmployeeEffortRow>();

    for (const resource of data) {
      const userId = resource.user_id;
      const employeeId = resource.code;
      const fullName = resource.name;
      const email = resource.email ?? "-";
      const roles = resource.position?.name ?? "-";
      const jobRank = resource.level?.name ?? "-";
      const rankCoefficient =
        resource.level?.coefficient != null
          ? resource.level.coefficient.toFixed(2).replace(".", ",")
          : "—";

      const employeeRow = employeesByUserId.get(userId);
      if (!employeeRow) {
        employeesByUserId.set(userId, {
          key: String(userId),
          userId,
          employeeId,
          fullName,
          email,
          roles,
          jobRank,
          rankCoefficient,
          projects: [],
          calendarEffortHours: 0,
          actualEffortHours: roundOneDecimal(actualEffortHours(resource)),
          effortDeviationPercent: null,
        });
      } else {
        employeeRow.actualEffortHours = roundOneDecimal(
          employeeRow.actualEffortHours + actualEffortHours(resource)
        );
      }

      // Build project child rows from allocates (tách theo project_id).
      const allocates = resource.allocates ?? [];
      const allocatesInRange = allocates.filter((a) =>
        allocateOverlapsPeriod(a, from, to)
      );

      const selectedProjectIdFilter =
        selectedProjectId !== ALL_VALUE ? selectedProjectId : null;

      const relevantProjectIds = new Set<string>();
      for (const a of allocatesInRange) {
        if (a.project_id == null) continue;
        const projectId = String(a.project_id);
        if (selectedProjectIdFilter && projectId !== selectedProjectIdFilter)
          continue;
        relevantProjectIds.add(projectId);
      }

      let projectIdsToRender = Array.from(relevantProjectIds);

      // Fallback: nếu không có allocates overlap (hiếm), render theo selectedProjectId hoặc resource.project
      if (projectIdsToRender.length === 0) {
        if (selectedProjectIdFilter) {
          projectIdsToRender = [selectedProjectIdFilter];
        } else if (resource.project) {
          const matched = projects.find((p) => p.name === resource.project);
          if (matched) projectIdsToRender = [String(matched.id)];
        }
      }

      const currentEmployee = employeesByUserId.get(userId);
      if (!currentEmployee) continue;

      for (const projectId of projectIdsToRender) {
        const matchedProject = projectsById.get(Number(projectId));
        const projectName =
          matchedProject?.name ??
          allocatesInRange.find((a) => String(a.project_id) === projectId)
            ?.project ??
          resource.project ??
          "-";
        const projectCode = matchedProject?.code ?? "-";

        const childKey = `${userId}-${projectId}`;

        const calendarEffortHours = roundOneDecimal(
          getCalendarEffortHours(resource, from, to, projectId)
        );

        const actualEffortByProject = roundOneDecimal(
          (resource.day_schedule ?? []).reduce((sum, d) => {
            const byProject = d.total_daily_report_by_project ?? [];
            const projectSum = byProject.reduce((innerSum, p) => {
              if (String(p.project_id) !== String(projectId)) return innerSum;
              return innerSum + (p.total_daily_report ?? 0);
            }, 0);
            return sum + projectSum;
          }, 0)
        );

        const existingChild = currentEmployee.projects.find(
          (p) => p.key === childKey
        );

        if (!existingChild) {
          currentEmployee.projects.push({
            key: childKey,
            projectName,
            projectCode,
            calendarEffortHours,
            actualEffortHours: actualEffortByProject,
            effortDeviationPercent: effortDeviationPercentFromTotals(
              calendarEffortHours,
              actualEffortByProject
            ),
          });
        } else {
          existingChild.calendarEffortHours = roundOneDecimal(
            existingChild.calendarEffortHours + calendarEffortHours
          );
          existingChild.actualEffortHours = roundOneDecimal(
            existingChild.actualEffortHours + actualEffortByProject
          );
          existingChild.effortDeviationPercent =
            effortDeviationPercentFromTotals(
              existingChild.calendarEffortHours,
              existingChild.actualEffortHours
            );
          existingChild.projectName = projectName;
          existingChild.projectCode = projectCode;
        }
      }
    }

    const result = Array.from(employeesByUserId.values()).map((employee) => {
      const projectsSorted = [...employee.projects].sort((a, b) =>
        a.projectName.localeCompare(b.projectName)
      );
      const calendarSum = roundOneDecimal(
        projectsSorted.reduce((sum, p) => sum + p.calendarEffortHours, 0)
      );
      const actualSum = roundOneDecimal(employee.actualEffortHours);

      return {
        ...employee,
        projects: projectsSorted,
        calendarEffortHours: calendarSum,
        actualEffortHours: actualSum,
        effortDeviationPercent: effortDeviationPercentFromTotals(
          calendarSum,
          actualSum
        ),
      };
    });

    result.sort((a, b) => a.employeeId.localeCompare(b.employeeId));
    return result;
  }, [data, from, projects, selectedProjectId, to]);

  useEffect(() => {
    setExpandedEmployeeKeys(new Set());
  }, [from, to, selectedProjectId, selectedTeamId, debouncedName]);

  const handleToggleEmployee = (employeeKey: string) => {
    setExpandedEmployeeKeys((prev) => {
      const next = new Set(prev);
      if (next.has(employeeKey)) next.delete(employeeKey);
      else next.add(employeeKey);
      return next;
    });
  };

  const formatDeviation = (pct: number | null): string => {
    if (pct == null) return "-";
    return `${pct.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Card className="border-0 bg-zinc-50/50 shadow-none dark:bg-zinc-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {t("customerValue.busyRateMember")}
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("customerValue.busyRateMemberDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[200px] items-center justify-center pt-0">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-0 bg-zinc-50/50 shadow-none dark:bg-zinc-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {t("customerValue.busyRateMember")}
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("customerValue.busyRateMemberDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[200px] items-center justify-center pt-0">
          <p className="text-muted-foreground text-sm">{t("common.error")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-zinc-50/50 shadow-none dark:bg-zinc-900/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t("customerValue.busyRateMember")}
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("customerValue.busyRateMemberDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800/70 dark:bg-zinc-950/30 dark:ring-zinc-50/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-200 dark:bg-zinc-900/60">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {t("customerValue.employeeId")}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {t("customerValue.fullName")}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {t("customerValue.email")}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {t("customerValue.roles")}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {t("customerValue.jobRank")}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {t("customerValue.rankCoefficient")}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {t("customerValue.projectName")}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {t("customerValue.projectId")}
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {t("customerValue.calendarEffortHours")}
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {t("customerValue.actualEffortHours")}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {t("customerValue.effortDeviation")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {employeeRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-muted-foreground h-24 text-center"
                >
                  {t("customerValue.emptyTable")}
                </TableCell>
              </TableRow>
            ) : (
              employeeRows.map((employee, employeeIndex) => {
                const isExpanded = expandedEmployeeKeys.has(employee.key);
                const hasProjects = employee.projects.length > 0;
                const isEvenEmployeeRow = employeeIndex % 2 === 0;
                return (
                  <Fragment key={employee.key}>
                    <TableRow
                      className={cn(
                        "font-medium",
                        "border-l-4 border-l-transparent",
                        isEvenEmployeeRow
                          ? "bg-blue-50/90 dark:bg-blue-950/20"
                          : "bg-indigo-50/40 dark:bg-indigo-950/10",
                        isExpanded && "border-l-blue-500",
                        "hover:bg-blue-100/70 dark:hover:bg-blue-950/30"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleEmployee(employee.key)}
                            disabled={!hasProjects}
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                          >
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </button>
                          <span>{employee.employeeId}</span>
                        </div>
                      </TableCell>
                      <TableCell>{employee.fullName}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.roles}</TableCell>
                      <TableCell>{employee.jobRank}</TableCell>
                      <TableCell>{employee.rankCoefficient}</TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell className="text-right">
                        {employee.calendarEffortHours.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        {employee.actualEffortHours.toFixed(1)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatDeviation(employee.effortDeviationPercent)}
                      </TableCell>
                    </TableRow>

                    {isExpanded &&
                      employee.projects.map((project, projectIndex) => {
                        const isEvenProjectRow = projectIndex % 2 === 0;
                        return (
                          <TableRow
                            key={project.key}
                            className={cn(
                              isEvenProjectRow
                                ? "bg-zinc-50/80 dark:bg-zinc-900/25"
                                : "bg-white dark:bg-zinc-950/10",
                              "hover:bg-zinc-100/70 dark:hover:bg-zinc-900/35"
                            )}
                          >
                            <TableCell className="text-muted-foreground border-l-2 border-zinc-200 pl-8">
                              {employee.employeeId}
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
                            <TableCell>{project.projectName}</TableCell>
                            <TableCell>{project.projectCode}</TableCell>
                            <TableCell className="text-muted-foreground text-right">
                              {project.calendarEffortHours.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-right">
                              {project.actualEffortHours.toFixed(1)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatDeviation(project.effortDeviationPercent)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </Fragment>
                );
              })
            )}
            </TableBody>
          </Table>
        </div>

        {employeeRows.length > 0 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label={t("common.previous")}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">
                    {t("common.previous")}
                  </span>
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="text-muted-foreground px-2 text-sm">
                  {t("common.page")} {currentPage}
                  {lastPage != null && lastPage > 1 ? ` / ${lastPage}` : ""}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label={t("common.next")}
                >
                  <span className="sr-only sm:not-sr-only sm:mr-1">
                    {t("common.next")}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}
