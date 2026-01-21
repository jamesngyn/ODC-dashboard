"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import {
  calculateEstimateCompleted,
  calculateOverallCompletionByEstimate,
  calculateTasksCompleted,
  calculateUSPCompleted,
} from "@/lib/utils";
import type { BacklogIssue } from "@/lib/api/backlog";
import { useBacklogIssues } from "@/hooks/useBacklogIssues";

import { HealthIndicators } from "./HealthIndicators";
import { KeyAchievements } from "./KeyAchievements";
import { MetricCard } from "./MetricCard";

function splitGtasksAndRegularTasks(issues: BacklogIssue[] | undefined) {
  if (!issues || issues.length === 0) {
    return { gtasks: [] as BacklogIssue[], regularTasks: [] as BacklogIssue[] };
  }
  const gtasks: BacklogIssue[] = [];
  const regularTasks: BacklogIssue[] = [];
  for (const issue of issues) {
    const name = issue.issueType?.name?.toLowerCase() ?? "";
    if (name === "gtask" || name.includes("gtask")) {
      gtasks.push(issue);
    } else {
      regularTasks.push(issue);
    }
  }
  return { gtasks, regularTasks };
}

export function WorkloadDashboard() {
  const { issues, isLoading, isError } = useBacklogIssues();

  const { gtasks, regularTasks } = useMemo(
    () => splitGtasksAndRegularTasks(issues),
    [issues]
  );

  const overallCompletion = useMemo(() => {
    if (gtasks.length === 0) return 0;
    return calculateOverallCompletionByEstimate(gtasks);
  }, [gtasks]);

  const estimateCompleted = useMemo(() => {
    if (gtasks.length === 0) return { completed: 0, total: 0 };
    return calculateEstimateCompleted(gtasks);
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
          Có lỗi xảy ra khi tải dữ liệu
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
          title="Overall Completion"
          mainValue={`${completionValue}%`}
          progress={completionValue}
        />
        <MetricCard
          title="Estimate Completed"
          mainValue={estimateCompleted.completed.toString()}
          subValue={estimateCompleted.total.toString()}
          subLabel="Total Hours"
        />
        <MetricCard
          title="Tasks Completed"
          mainValue={tasksCompleted.completed.toString()}
          subValue={tasksCompleted.total.toString()}
          subLabel="Total Tasks"
        />
        <MetricCard
          title="USP Completed"
          mainValue={uspCompleted.completed.toString()}
          subValue={uspCompleted.total.toString()}
          subLabel="Total USP"
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
