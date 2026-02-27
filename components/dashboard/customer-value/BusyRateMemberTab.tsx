"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CommonTable } from "@/components/ui/common-table";
import type { CommonSelectOption } from "@/components/ui/common-select";
import type { AcmsResource, AcmsProject } from "@/types/interfaces/acms";
import type { TableColumn } from "@/components/ui/common-table";
import {
  getAcmsResources,
  getAcmsProjects,
  getAcmsTeams,
} from "@/lib/api/acms";
import { QUERY_KEYS } from "@/constants/common";
import {
  BusyRateMemberFilters,
  ALL_VALUE,
  type PeriodMode,
} from "./BusyRateMemberFilters";

function calendarEffortHours(resource: AcmsResource): number {
  if (!resource.day_schedule?.length) return 0;
  return resource.day_schedule.reduce(
    (sum, d) => sum + (d.allocate_effort ?? 0),
    0
  );
}

/** Actual Effort = Log work (total_daily_report) trong khoảng from–to; OT thêm sau khi API có. */
function actualEffortHours(resource: AcmsResource): number {
  if (!resource.day_schedule?.length) return 0;
  return resource.day_schedule.reduce(
    (sum, d) => sum + (d.total_daily_report ?? 0),
    0
  );
}

function effortDeviationPercent(resource: AcmsResource): number | null {
  const calendar = calendarEffortHours(resource);
  if (calendar <= 0) return null;
  const actual = actualEffortHours(resource);
  return Math.round((actual / calendar) * 100);
}

function getRangeFromPeriod(
  date: Date,
  period: PeriodMode
): { from: string; to: string } {
  const ymd = (d: Date) => format(d, "yyyy-MM-dd");
  switch (period) {
    case "day":
      return { from: ymd(date), to: ymd(date) };
    case "week": {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      return { from: ymd(start), to: ymd(end) };
    }
    case "month": {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      return { from: ymd(start), to: ymd(end) };
    }
  }
}

export function BusyRateMemberTab() {
  const { t } = useTranslation();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(ALL_VALUE);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(ALL_VALUE);
  const [periodMode, setPeriodMode] = useState<PeriodMode>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const { from, to } = useMemo(
    () => getRangeFromPeriod(selectedDate, periodMode),
    [selectedDate, periodMode]
  );

  const { data: response, isLoading, isError } = useQuery({
    queryKey: [...QUERY_KEYS.CUSTOMER_VALUE.ACMS_RESOURCES, from, to, periodMode],
    queryFn: () =>
      getAcmsResources({
        from,
        to,
        period: periodMode,
      }),
  });

  const { data: projectsResponse } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_VALUE.ACMS_PROJECTS,
    queryFn: getAcmsProjects,
  });

  const { data: teamsResponse } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_VALUE.ACMS_TEAMS,
    queryFn: getAcmsTeams,
  });

  const projects: AcmsProject[] =
    projectsResponse?.projects?.data ?? [];
  const teams = teamsResponse?.data ?? [];

  const projectOptions: CommonSelectOption[] = useMemo(
    () => [
      { value: ALL_VALUE, label: t("customerValue.filterAll") },
      ...projects.map((p) => ({ value: String(p.id), label: p.name })),
    ],
    [projects, t]
  );

  const teamOptions: CommonSelectOption[] = useMemo(
    () => [
      { value: ALL_VALUE, label: t("customerValue.filterAll") },
      ...teams.map((tItem) => ({
        value: String(tItem.id),
        label:
          tItem.division_name ?? tItem.division?.name
            ? `${tItem.division_name ?? tItem.division?.name ?? ""} - ${tItem.name}`
            : tItem.name,
      })),
    ],
    [teams, t]
  );

  const periodOptions: CommonSelectOption[] = useMemo(
    () => [
      { value: "day", label: t("customerValue.periodDay") },
      { value: "week", label: t("customerValue.periodWeek") },
      { value: "month", label: t("customerValue.periodMonth") },
    ],
    [t]
  );

  const rawData = response?.resources?.data ?? [];
  const data = useMemo(() => {
    let list = rawData;
    if (selectedProjectId !== ALL_VALUE) {
      const project = projects.find((p) => String(p.id) === selectedProjectId);
      if (project) {
        list = list.filter((r: AcmsResource) => r.project === project.name);
      }
    }
    if (selectedTeamId !== ALL_VALUE) {
      list = list.filter(
        (r: AcmsResource) => String(r.team?.id) === selectedTeamId
      );
    }
    return list;
  }, [rawData, selectedProjectId, selectedTeamId, projects]);

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
        <BusyRateMemberFilters
          periodMode={periodMode}
          onPeriodModeChange={setPeriodMode}
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          selectedTeamId={selectedTeamId}
          onTeamChange={setSelectedTeamId}
          projectOptions={projectOptions}
          teamOptions={teamOptions}
          periodOptions={periodOptions}
        />
        <CommonTable<AcmsResource>
          data={data}
          columns={columns}
          getRowKey={(r) => r._id}
          emptyMessage={t("customerValue.emptyTable")}
        />
      </CardContent>
    </Card>
  );
}
