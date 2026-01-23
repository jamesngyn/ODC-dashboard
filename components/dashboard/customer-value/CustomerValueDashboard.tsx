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
import { useBacklogProjectMembers } from "@/hooks/useBacklogProjectMembers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

import { PerformanceIndicators } from "./PerformanceIndicators";
import { SummaryCard } from "./SummaryCard";
import { TeamCostPerformanceTable } from "./TeamCostPerformanceTable";

type PeriodOption =
  | "all"
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month";

// Helper functions to check date ranges
function getDateRange(period: PeriodOption): {
  start: Date | null;
  end: Date | null;
} {
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  switch (period) {
    case "this-week": {
      const start = new Date(now);
      const dayOfWeek = start.getDay();
      const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    case "last-week": {
      const end = new Date(now);
      const dayOfWeek = end.getDay();
      const diff = end.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday of this week
      end.setDate(diff - 1);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "this-month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    case "last-month": {
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "all":
    default:
      return { start: null, end: null };
  }
}

function isDateInRange(
  dateString: string | null,
  start: Date | null,
  end: Date | null
): boolean {
  if (!dateString) return false;
  if (!start || !end) return true; // All dates if no range specified

  const date = new Date(dateString);
  return date >= start && date <= end;
}


export function CustomerValueDashboard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<PeriodOption>("all");
  const { members, isLoading: isLoadingMembers } = useBacklogProjectMembers();
  const { issues, isLoading: isLoadingIssues } = useBacklogIssues();


  const teamData = useMemo<TeamMemberPerformance[]>(() => {
    if (!members || !issues || members.length === 0 || issues.length === 0) {
      return [];
    }

    const { start, end } = getDateRange(period);

    // Billable: issues có start hoặc actualEnd trong kỳ (tuần/tháng)
    const filteredIssues = issues.filter((issue: BacklogIssue) => {
      return (
        isDateInRange(issue.startDate, start, end) ||
        isDateInRange(getActualEndDateFromIssue(issue), start, end)
      );
    });

    // Earned: các task Closed và được đóng trong kỳ (theo mode) — tổng estimate; ngày đóng chỉ lấy Actual End-date
    const closedInPeriodIssues = issues.filter((issue: BacklogIssue) => {
      if (issue.status?.name !== TaskStatus.Closed) return false;
      const closedDate = getActualEndDateFromIssue(issue);
      return isDateInRange(closedDate, start, end);
    });

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
  }, [members, issues, period]);

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

  if (isLoadingMembers || isLoadingIssues) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (teamData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as PeriodOption)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("common.selectPeriod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="this-week">{t("common.thisWeek")}</SelectItem>
              <SelectItem value="last-week">{t("common.lastWeek")}</SelectItem>
              <SelectItem value="this-month">{t("common.thisMonth")}</SelectItem>
              <SelectItem value="last-month">{t("common.lastMonth")}</SelectItem>
            </SelectContent>
          </Select>
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
      {/* Period Selector */}
      <div className="flex items-center justify-end">
        <Select
          value={period}
          onValueChange={(value) => setPeriod(value as PeriodOption)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("common.selectPeriod")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="this-week">{t("common.thisWeek")}</SelectItem>
            <SelectItem value="last-week">{t("common.lastWeek")}</SelectItem>
            <SelectItem value="this-month">{t("common.thisMonth")}</SelectItem>
            <SelectItem value="last-month">{t("common.lastMonth")}</SelectItem>
          </SelectContent>
        </Select>
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
