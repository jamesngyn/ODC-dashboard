"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  calculateEstimateCompleted,
  calculateOverallCompletionByEstimate,
  calculateTasksCompleted,
  calculateUSPCompleted,
} from "@/lib/utils";
import type { BacklogIssue } from "@/types/interfaces/common";
import { TaskStatus } from "@/types/enums/common";
import { useBacklogIssues } from "@/hooks/useBacklogIssues";
import { useBacklogMilestones } from "@/hooks/useBacklogMilestones";
import { CommonSelect } from "@/components/ui/common-select";
import { useTranslation } from "react-i18next";

import { HealthIndicators } from "./HealthIndicators";
import { KeyAchievements } from "./KeyAchievements";
import { MetricCard } from "./MetricCard";

const ALL_SPRINT_VALUE = "all";

function filterOutGtasks(
  allIssues: BacklogIssue[] | undefined,
  gtasks: BacklogIssue[]
): BacklogIssue[] {
  if (!allIssues || allIssues.length === 0) return [];
  if (gtasks.length === 0) return allIssues;

  // Tạo Set các Gtask IDs để lookup nhanh
  const gtaskIds = new Set(gtasks.map((g) => g.id));
  return allIssues.filter((issue) => !gtaskIds.has(issue.id));
}

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
  // Fetch Gtasks trực tiếp với filter theo issueType
  const {
    issues: gtasks,
    isLoading: isLoadingGtasks,
    isError: isErrorGtasks,
  } = useBacklogIssues({ issueTypeName: "Gtask", milestoneIds });
  // Fetch tất cả issues để lấy regularTasks (các issues không phải Gtask)
  const { issues: allIssues, isLoading: isLoadingAll, isError: isErrorAll } =
    useBacklogIssues({ milestoneIds });

  const isLoading =
    isLoadingGtasks || isLoadingAll || isLoadingMilestones;
  const isError = isErrorGtasks || isErrorAll;

  // Lọc regularTasks từ allIssues bằng cách loại bỏ các Gtasks
  const regularTasks = useMemo(
    () => filterOutGtasks(allIssues, gtasks ?? []),
    [allIssues, gtasks]
  );

  const overallCompletion = useMemo(() => {
    const gtaskList = gtasks ?? [];
    if (gtaskList.length === 0) return 0;
    return calculateOverallCompletionByEstimate(gtaskList);
  }, [gtasks]);

  const estimateCompleted = useMemo(() => {
    const gtaskList = gtasks ?? [];
    const closedGtasks = gtaskList.filter(
      (g) => g.status.name === TaskStatus.Closed
    );
    if (closedGtasks.length === 0) return { completed: 0, total: 0 };
    return calculateEstimateCompleted(closedGtasks);
  }, [gtasks]);

  const tasksCompleted = useMemo(() => {
    if (regularTasks.length === 0) return { completed: 0, total: 0 };
    return calculateTasksCompleted(regularTasks);
  }, [regularTasks]);

  const uspCompleted = useMemo(
    () => calculateUSPCompleted(regularTasks),
    [regularTasks]
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
        />
        <MetricCard
          title={t("workload.estimateCompleted")}
          mainValue={estimateCompleted.completed.toString()}
          subValue={estimateCompleted.total.toString()}
          subLabel={t("workload.totalHours")}
        />
        <MetricCard
          title={t("workload.tasksCompleted")}
          mainValue={tasksCompleted.completed.toString()}
          subValue={tasksCompleted.total.toString()}
          subLabel={t("workload.totalTasks")}
        />
        <MetricCard
          title={t("workload.uspCompleted")}
          mainValue={uspCompleted.completed.toString()}
          subValue={uspCompleted.total.toString()}
          subLabel={t("workload.totalUsp")}
        />
      </div>

      {/* Bottom Row: Health & Achievements */}
      <div className="grid gap-4 md:grid-cols-7">
        <div className="col-span-3">
          <HealthIndicators />
        </div>
        <div className="col-span-4">
          <KeyAchievements />
        </div>
      </div>
    </div>
  );
}
