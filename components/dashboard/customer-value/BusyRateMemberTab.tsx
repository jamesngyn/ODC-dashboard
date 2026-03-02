"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CommonTable } from "@/components/ui/common-table";
import type { AcmsResource, AcmsProject } from "@/types/interfaces/acms";
import type { TableColumn } from "@/components/ui/common-table";
import {
  getAcmsResources,
  getAcmsProjects,
  type AcmsResourcesParams,
} from "@/lib/api/acms";
import { QUERY_KEYS } from "@/constants/common";
import { ALL_VALUE, type PeriodMode } from "./BusyRateMemberFilters";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

export interface BusyRateMemberTabProps {
  periodMode: PeriodMode;
  selectedDate: Date;
  selectedProjectId: string;
  selectedTeamId: string;
  from: string;
  to: string;
}

function calendarEffortHours(resource: AcmsResource): number {
  if (!resource.day_schedule?.length) return 0;
  return resource.day_schedule.reduce(
    (sum, d) => sum + (d.allocate_effort ?? 0),
    0
  );
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

function effortDeviationPercent(resource: AcmsResource): number | null {
  const calendar = calendarEffortHours(resource);
  if (calendar <= 0) return null;
  const actual = actualEffortHours(resource);
  return Math.round((actual / calendar) * 100);
}

export function BusyRateMemberTab({
  periodMode,
  selectedDate,
  selectedProjectId,
  selectedTeamId,
  from,
  to,
}: BusyRateMemberTabProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [from, to, selectedProjectId, selectedTeamId]);

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
    return base;
  }, [from, to, periodMode, page, selectedProjectId, selectedTeamId]);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: [
      ...QUERY_KEYS.CUSTOMER_VALUE.ACMS_RESOURCES,
      from,
      to,
      periodMode,
      page,
      selectedProjectId,
      selectedTeamId,
    ],
    queryFn: () => getAcmsResources(resourceParams),
  });

  const { data: projectsResponse } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_VALUE.ACMS_PROJECTS,
    queryFn: getAcmsProjects,
  });

  const projects: AcmsProject[] =
    projectsResponse?.projects?.data ?? [];

  const data = response?.resources?.data ?? [];
  const currentPage = response?.resources?.current_page ?? 1;
  const lastPage = response?.resources?.last_page;
  const hasNextPage =
    lastPage != null
      ? currentPage < lastPage
      : data.length === 20;
  const hasPrevPage = currentPage > 1;

  const columns = useMemo<TableColumn<AcmsResource>[]>(
    () => [
      {
        key: "code",
        header: t("customerValue.employeeId"),
        accessor: (r: AcmsResource) => r.code,
      },
      {
        key: "name",
        header: t("customerValue.fullName"),
        accessor: (r: AcmsResource) => r.name,
      },
      {
        key: "email",
        header: t("customerValue.email"),
        accessor: (r: AcmsResource) => r.email ?? "-",
      },
      {
        key: "roles",
        header: t("customerValue.roles"),
        accessor: (r: AcmsResource) => r.position?.name ?? "-",
      },
      {
        key: "jobRank",
        header: t("customerValue.jobRank"),
        accessor: (r: AcmsResource) => r.level?.name ?? "-",
      },
      {
        key: "rankCoefficient",
        header: t("customerValue.rankCoefficient"),
        accessor: (r: AcmsResource) => {
          const coeff = r.level?.coefficient;
          return coeff != null
            ? coeff.toFixed(2).replace(".", ",")
            : "—";
        },
      },
      {
        key: "projectName",
        header: t("customerValue.projectName"),
        accessor: (r: AcmsResource) => r.project || "-",
      },
      {
        key: "projectId",
        header: t("customerValue.projectId"),
        accessor: (r: AcmsResource) => {
          const project = projects.find((p) => p.name === r.project);
          return project?.code ?? "-";
        },
      },
      {
        key: "calendarEffort",
        header: t("customerValue.calendarEffortHours"),
        accessor: (r: AcmsResource) => calendarEffortHours(r),
      },
      {
        key: "actualEffort",
        header: t("customerValue.actualEffortHours"),
        accessor: (r: AcmsResource) => actualEffortHours(r),
      },
      {
        key: "effortDeviation",
        header: t("customerValue.effortDeviation"),
        accessor: (r: AcmsResource) => {
          const pct = effortDeviationPercent(r);
          return pct !== null ? `${pct}%` : "-";
        },
        className: "font-medium",
      },
    ],
    [t, projects]
  );

  if (isLoading) {
    return (
      <Card className="border-0 bg-zinc-50/50 dark:bg-zinc-900/30 shadow-none">
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
      <Card className="border-0 bg-zinc-50/50 dark:bg-zinc-900/30 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {t("customerValue.busyRateMember")}
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("customerValue.busyRateMemberDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[200px] items-center justify-center pt-0">
          <p className="text-muted-foreground text-sm">
            {t("common.error")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-zinc-50/50 dark:bg-zinc-900/30 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t("customerValue.busyRateMember")}
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("customerValue.busyRateMemberDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <CommonTable<AcmsResource>
          data={data}
          columns={columns}
          getRowKey={(r) => r._id}
          emptyMessage={t("customerValue.emptyTable")}
        />
        {data.length > 0 && (
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
