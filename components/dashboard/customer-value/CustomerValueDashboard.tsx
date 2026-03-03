"use client";

import { useCallback, useMemo, useState } from "react";
import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useTranslation } from "react-i18next";

import type { AcmsTeamListItem } from "@/types/interfaces/acms";
import { getAcmsProjects, getAcmsTeams } from "@/lib/api/acms";
import { buildProjectSelectOptions } from "@/lib/utils/customer-value";
import type { CommonSelectOption } from "@/components/ui/common-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ALL_VALUE, BusyRateMemberFilters, type PeriodMode } from "./BusyRateMemberFilters";
import { BusyRateMemberTab } from "./BusyRateMemberTab";
import { PerformanceMemberFilters } from "./PerformanceMemberFilters";
import { PerformanceMemberTab } from "./PerformanceMemberTab";

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

export function CustomerValueDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("busy-rate");

  // BusyRate tab state
  const [periodMode, setPeriodMode] = useState<PeriodMode>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedProjectId, setSelectedProjectId] = useState<string>(ALL_VALUE);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(ALL_VALUE);

  // Performance tab state (filter theo ngày, tuần, tháng cho API)
  const [performancePeriodMode, setPerformancePeriodMode] =
    useState<PeriodMode>("week");
  const [performanceSelectedDate, setPerformanceSelectedDate] = useState<Date>(
    () => new Date()
  );

  const { data: projectsResponse } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_VALUE.ACMS_PROJECTS,
    queryFn: getAcmsProjects,
  });

  const { data: teamsResponse } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_VALUE.ACMS_TEAMS,
    queryFn: getAcmsTeams,
  });

  const projects = projectsResponse?.projects?.data ?? [];
  const teams = teamsResponse?.teams ?? [];

  const projectOptions: CommonSelectOption[] = useMemo(
    () =>
      buildProjectSelectOptions(
        projects,
        ALL_VALUE,
        t("customerValue.filterAll")
      ),
    [projects, t]
  );

  const teamOptions: CommonSelectOption[] = useMemo(
    () => [
      { value: ALL_VALUE, label: t("customerValue.filterAll") },
      ...teams.map((tItem: AcmsTeamListItem) => ({
        value: String(tItem.id),
        label:
          (tItem.division_name ?? tItem.division?.name)
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

  const handleProjectChange = useCallback((value: string) => {
    setSelectedProjectId(value);
  }, []);
  const handleTeamChange = useCallback((value: string) => {
    setSelectedTeamId(value);
  }, []);
  const handlePeriodModeChange = useCallback((value: PeriodMode) => {
    setPeriodMode(value);
  }, []);
  const handleSelectedDateChange = useCallback((value: Date) => {
    setSelectedDate(value);
  }, []);
  const handlePerformancePeriodModeChange = useCallback((value: PeriodMode) => {
    setPerformancePeriodMode(value);
  }, []);
  const handlePerformanceSelectedDateChange = useCallback((value: Date) => {
    setPerformanceSelectedDate(value);
  }, []);

  const { from, to } = useMemo(
    () => getRangeFromPeriod(selectedDate, periodMode),
    [selectedDate, periodMode]
  );

  const { from: performanceFrom, to: performanceTo } = useMemo(
    () => getRangeFromPeriod(performanceSelectedDate, performancePeriodMode),
    [performanceSelectedDate, performancePeriodMode]
  );

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="busy-rate">
            {t("customerValue.busyRateMember")}
          </TabsTrigger>
          <TabsTrigger value="performance">
            {t("customerValue.performanceMember")}
          </TabsTrigger>
        </TabsList>

        {activeTab === "busy-rate" && (
          <div className="mb-4">
            <BusyRateMemberFilters
              periodMode={periodMode}
              onPeriodModeChange={handlePeriodModeChange}
              selectedDate={selectedDate}
              onSelectedDateChange={handleSelectedDateChange}
              selectedProjectId={selectedProjectId}
              onProjectChange={handleProjectChange}
              selectedTeamId={selectedTeamId}
              onTeamChange={handleTeamChange}
              projectOptions={projectOptions}
              teamOptions={teamOptions}
              periodOptions={periodOptions}
            />
          </div>
        )}

        {activeTab === "performance" && (
          <div className="mb-4">
            <PerformanceMemberFilters
              periodMode={performancePeriodMode}
              onPeriodModeChange={handlePerformancePeriodModeChange}
              selectedDate={performanceSelectedDate}
              onSelectedDateChange={handlePerformanceSelectedDateChange}
              selectedTeamId={selectedTeamId}
              onTeamChange={handleTeamChange}
              teamOptions={teamOptions}
              periodOptions={periodOptions}
            />
          </div>
        )}

        <TabsContent value="busy-rate" className="mt-0">
          <BusyRateMemberTab
            periodMode={periodMode}
            selectedDate={selectedDate}
            selectedProjectId={selectedProjectId}
            selectedTeamId={selectedTeamId}
            from={from}
            to={to}
          />
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <PerformanceMemberTab
            periodMode={performancePeriodMode}
            selectedDate={performanceSelectedDate}
            selectedProjectId={ALL_VALUE}
            selectedTeamId={selectedTeamId}
            from={performanceFrom}
            to={performanceTo}
            projects={projects}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
