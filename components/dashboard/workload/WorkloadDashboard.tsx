"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import {
  calculateEstimateCompleted,
  calculateOverallCompletionByEstimate,
  calculateTasksCompleted,
  calculateUSPCompleted,
} from "@/lib/utils";
import type { BacklogIssue } from "@/types/interfaces/common";
import { useBacklogIssues } from "@/hooks/useBacklogIssues";
import { useTranslation } from "react-i18next";

import { HealthIndicators } from "./HealthIndicators";
import { KeyAchievements } from "./KeyAchievements";
import { MetricCard } from "./MetricCard";

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
  // Fetch Gtasks trực tiếp với filter theo issueType
  const {
    issues: gtasks,
    isLoading: isLoadingGtasks,
    isError: isErrorGtasks,
  } = useBacklogIssues({ issueTypeName: "Gtask" });
  // Fetch tất cả issues để lấy regularTasks (các issues không phải Gtask)
  const { issues: allIssues, isLoading: isLoadingAll, isError: isErrorAll } =
    useBacklogIssues();

  const isLoading = isLoadingGtasks || isLoadingAll;
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
    if (gtaskList.length === 0) return { completed: 0, total: 0 };
    return calculateEstimateCompleted(gtaskList);
  }, [gtasks]);

  const tasksCompleted = useMemo(() => {
    if (regularTasks.length === 0) return { completed: 0, total: 0 };
    return calculateTasksCompleted(regularTasks);
  }, [regularTasks]);

  const uspCompleted = useMemo(
    () => calculateUSPCompleted(regularTasks),
    [regularTasks]
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
