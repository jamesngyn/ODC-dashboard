"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import type {
  CostPerformanceSummary,
  PerformanceIndicator,
  TeamMemberPerformance,
} from "@/types/interfaces/customer-value";
import {
  getActualEndDateFromIssue,
} from "@/lib/api/backlog";
import { BacklogIssue } from "@/types/interfaces/common";
import { TaskStatus } from "@/types/enums/common";
import { getRoleTypeLabel } from "@/constants/common";
import { useBacklogIssues } from "@/hooks/useBacklogIssues";
import { useBacklogMilestones } from "@/hooks/useBacklogMilestones";
import { useBacklogProjectMembers } from "@/hooks/useBacklogProjectMembers";
import { CommonSelect } from "@/components/ui/common-select";
import { useTranslation } from "react-i18next";

const ALL_SPRINT_VALUE = "all";

import { PerformanceIndicators } from "./PerformanceIndicators";
import { SummaryCard } from "./SummaryCard";
import { TeamCostPerformanceTable } from "./TeamCostPerformanceTable";

export function CustomerValueDashboard() {
  const { t } = useTranslation();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(
    null
  );
  const milestoneIds = useMemo<number[] | undefined>(
    () => (selectedMilestoneId !== null ? [selectedMilestoneId] : undefined),
    [selectedMilestoneId]
  );

  const { members, isLoading: isLoadingMembers } = useBacklogProjectMembers();
  const { milestones, isLoading: isLoadingMilestones } = useBacklogMilestones();
  const { issues, isLoading: isLoadingIssues } = useBacklogIssues({
    milestoneIds,
  });


  const teamData = useMemo<TeamMemberPerformance[]>(() => {
    if (!members || !issues || members.length === 0 || issues.length === 0) {
      return [];
    }

    // Billable: tất cả issues (không lọc theo kỳ)
    const filteredIssues = issues;

    // Earned: các task Closed — tổng estimate theo Actual End-date
    const closedInPeriodIssues = issues.filter(
      (issue: BacklogIssue) => issue.status?.name === TaskStatus.Closed
    );

    const billableMap = new Map<number, number>();
    filteredIssues.forEach((issue: BacklogIssue) => {
      if (!issue.assignee) return;
      const assigneeId = issue.assignee.id;
      const estimateHours = issue.estimatedHours ?? 0;
      billableMap.set(
        assigneeId,
        (billableMap.get(assigneeId) ?? 0) + estimateHours
      );
    });

    const earnedMap = new Map<number, number>();
    closedInPeriodIssues.forEach((issue: BacklogIssue) => {
      if (!issue.assignee) return;
      const assigneeId = issue.assignee.id;
      const estimateHours = issue.estimatedHours ?? 0;
      earnedMap.set(assigneeId, (earnedMap.get(assigneeId) ?? 0) + estimateHours);
    });

    return members
      .map((member) => {
        const billableHours = Math.round(billableMap.get(member.id) ?? 0);
        const earnedHours = Math.round(earnedMap.get(member.id) ?? 0);
        const performancePercentage =
          billableHours > 0
            ? Math.round((earnedHours / billableHours) * 100)
            : 0;

        return {
          id: String(member.id),
          name: member.name,
          roleType: member.roleType,
          billableHours,
          earnedHours,
          performancePercentage,
        };
      })
      .filter((member) => member.billableHours > 0 || member.earnedHours > 0);
  }, [members, issues]);

  const summary = useMemo<CostPerformanceSummary>(() => {
    if (teamData.length === 0) {
      return {
        costPerformance: 0,
        totalBill: 0,
        totalEarned: 0,
      };
    }

    const totalBill = teamData.reduce(
      (sum, member) => sum + member.billableHours,
      0
    );
    const totalEarned = teamData.reduce(
      (sum, member) => sum + member.earnedHours,
      0
    );
    const costPerformance =
      totalBill > 0 ? Math.round((totalEarned / totalBill) * 100) : 0;

    return {
      costPerformance,
      totalBill,
      totalEarned,
    };
  }, [teamData]);

  const indicators = useMemo<PerformanceIndicator[]>(() => {
    if (teamData.length === 0) {
      return [
        {
          type: "high",
          title: t("customerValue.highPerformance"),
          description: t("customerValue.highPerformanceDescription", { count: 0 }),
          count: 0,
        },
        {
          type: "under",
          title: t("customerValue.underPerformance"),
          description: t("customerValue.underPerformanceDescription", { count: 0 }),
          count: 0,
        },
        {
          type: "optimal",
          title: t("customerValue.optimalPerformance"),
          description: t("customerValue.optimalPerformanceDescription", { count: 0 }),
          count: 0,
        },
      ];
    }

    const highCount = teamData.filter(
      (member) => member.performancePercentage > 100
    ).length;
    const underCount = teamData.filter(
      (member) => member.performancePercentage < 90
    ).length;
    const optimalCount = teamData.filter(
      (member) =>
        member.performancePercentage >= 90 &&
        member.performancePercentage <= 100
    ).length;

    return [
      {
        type: "high",
        title: t("customerValue.highPerformance"),
        description: t("customerValue.highPerformanceDescription", { count: highCount }),
        count: highCount,
      },
      {
        type: "under",
        title: t("customerValue.underPerformance"),
        description: t("customerValue.underPerformanceDescription", { count: underCount }),
        count: underCount,
      },
      {
        type: "optimal",
        title: t("customerValue.optimalPerformance"),
        description: t("customerValue.optimalPerformanceDescription", { count: optimalCount }),
        count: optimalCount,
      },
    ];
  }, [teamData, t]);

  const sprintSelectValue =
    selectedMilestoneId === null ? ALL_SPRINT_VALUE : String(selectedMilestoneId);
  const handleSprintChange = (value: string) => {
    setSelectedMilestoneId(value === ALL_SPRINT_VALUE ? null : Number(value));
  };
  const sprintOptions = useMemo(
    () => [
      { value: ALL_SPRINT_VALUE, label: t("common.all") },
      ...milestones.map((m) => ({ value: String(m.id), label: m.name })),
    ],
    [milestones, t]
  );

  if (isLoadingMembers || isLoadingIssues || isLoadingMilestones) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (teamData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <CommonSelect
            id="customer-value-sprint-select"
            value={sprintSelectValue}
            onValueChange={handleSprintChange}
            options={sprintOptions}
            label={t("progressOverview.filterBySprint")}
            triggerClassName="w-[180px]"
          />
        </div>
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground text-sm">
            {t("customerValue.noPerformanceData")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sprint Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        <CommonSelect
          id="customer-value-sprint-select"
          value={sprintSelectValue}
          onValueChange={handleSprintChange}
          options={sprintOptions}
          label={t("progressOverview.filterBySprint")}
          triggerClassName="w-[180px]"
        />
      </div>

      {/* Main Content: Table and Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TeamCostPerformanceTable data={teamData} />
        </div>
        <div className="lg:col-span-1">
          <SummaryCard data={summary} />
        </div>
      </div>

      {/* Performance Indicators */}
      <PerformanceIndicators indicators={indicators} />
    </div>
  );
}
