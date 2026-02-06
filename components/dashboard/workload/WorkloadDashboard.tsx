"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  calculateOverallCompletionByEstimate,
  calculateTasksCompleted,
  calculateUSPCompleted,
} from "@/lib/utils";
import { BacklogParentChild, TaskStatus } from "@/types/enums/common";
import { useBacklogIssues } from "@/hooks/useBacklogIssues";
import { useBacklogMilestones } from "@/hooks/useBacklogMilestones";
import { CommonSelect } from "@/components/ui/common-select";
import { useTranslation } from "react-i18next";

import { KeyAchievements } from "./KeyAchievements";
import { MetricCard } from "./MetricCard";

const ALL_SPRINT_VALUE = "all";

export function WorkloadDashboard() {
  const { t } = useTranslation();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(
    null
  );
  const milestoneIds = useMemo<number[] | undefined>(
    () => (selectedMilestoneId !== null ? [selectedMilestoneId] : undefined),
    [selectedMilestoneId]
  );

  const { milestones, isLoading: isLoadingMilestones } = useBacklogMilestones();
  const {
    issues,
    isLoading: isLoadingIssues,
    isError: isErrorIssues,
  } = useBacklogIssues({
    milestoneIds,
    parentChild: BacklogParentChild.All,
  });

  const isLoading = isLoadingIssues || isLoadingMilestones;
  const isError = isErrorIssues;

  const issuesList = issues ?? [];

  // Tất cả metric đều tính trên toàn bộ issues trong sprint (không lọc Gtask)
  const overallCompletion = useMemo(() => {
    if (issuesList.length === 0) return 0;
    return calculateOverallCompletionByEstimate(issuesList);
  }, [issuesList]);

  const estimateCompleted = useMemo(() => {
    const sumEstimate = (list: typeof issuesList) =>
      list.reduce((s, issue) => s + Math.max(0, issue.estimatedHours ?? 0), 0);
    const closedIssues = issuesList.filter(
      (issue) => issue.status.name === TaskStatus.Closed
    );
    const completed = sumEstimate(closedIssues);
    const total = sumEstimate(issuesList);
    if (total === 0) return { completed: 0, total: 0 };
    return {
      completed: Math.round(completed),
      total: Math.round(total),
    };
  }, [issuesList]);

  const tasksCompleted = useMemo(
    () => calculateTasksCompleted(issuesList),
    [issuesList]
  );

  const uspCompleted = useMemo(
    () => calculateUSPCompleted(issuesList),
    [issuesList]
  );

  const selectValue =
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

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground text-sm">
          {t("workload.errorLoadingData")}
        </p>
      </div>
    );
  }

  const completionValue = Math.round(overallCompletion);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <CommonSelect
          id="workload-sprint-select"
          value={selectValue}
          onValueChange={handleSprintChange}
          options={sprintOptions}
          label={t("progressOverview.filterBySprint")}
          triggerClassName="w-[180px]"
        />
      </div>
      {/* Top Row: Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t("workload.overallCompletion")}
          mainValue={`${completionValue}%`}
          progress={completionValue}
          accentClassName="border-l-4 border-l-emerald-500"
          formulaInput={t("workload.formulaOverallCompletionInput")}
          formulaExpression={t("workload.formulaOverallCompletionExpression")}
          formulaRatio={t("workload.formulaOverallCompletionRatio")}
        />
        <MetricCard
          title={t("workload.estimateCompleted")}
          mainValue={estimateCompleted.completed.toString()}
          subValue={estimateCompleted.total.toString()}
          subLabel={t("workload.totalHours")}
          accentClassName="border-l-4 border-l-amber-500"
          formulaInput={t("workload.formulaEstimateCompletedInput")}
          formulaExpression={t("workload.formulaEstimateCompletedExpression")}
        />
        <MetricCard
          title={t("workload.tasksCompleted")}
          mainValue={tasksCompleted.completed.toString()}
          subValue={tasksCompleted.total.toString()}
          subLabel={t("workload.totalTasks")}
          accentClassName="border-l-4 border-l-sky-500"
          formulaInput={t("workload.formulaTasksCompletedInput")}
          formulaExpression={t("workload.formulaTasksCompletedExpression")}
        />
        <MetricCard
          title={t("workload.uspCompleted")}
          mainValue={uspCompleted.completed.toString()}
          subValue={uspCompleted.total.toString()}
          subLabel={t("workload.totalUsp")}
          accentClassName="border-l-4 border-l-violet-500"
          formulaInput={t("workload.formulaUspCompletedInput")}
          formulaExpression={t("workload.formulaUspCompletedExpression")}
        />
      </div>

      {/* Bottom Row: Health & Achievements */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* <div className="col-span-3">
          <HealthIndicators />
        </div> */}
        <div className="col-span-4">
          <KeyAchievements />
        </div>
      </div>
    </div>
  );
}
