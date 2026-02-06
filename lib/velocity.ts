import {
  getBacklogIssuesByMilestone,
  getBacklogMilestones,
  getBacklogIssueTypeIdByName,
} from "@/lib/api/backlog";
import { getPointFromIssue } from "@/lib/utils";
import { BacklogParentChild, TaskStatus } from "@/types/enums/common";
import type {
  BurndownDayPoint,
  ForecastData,
  KeyInsightItem,
  SprintSummaryData,
  VelocityBySprintPoint,
  VelocityBySprintResult,
} from "@/types/interfaces/velocity";

const VELOCITY_SPRINT_LIMIT = 6;

/** Gtask + Task (parentChild = all). Chỉ tính task có category Release và status Closed. Trả về hours estimate và USP (point) theo sprint. */
export async function fetchVelocityBySprint(): Promise<VelocityBySprintResult> {
  const [milestones, gtaskTypeId, taskTypeId] = await Promise.all([
    getBacklogMilestones(),
    getBacklogIssueTypeIdByName("Gtask"),
    getBacklogIssueTypeIdByName("Task"),
  ]);

  const issueTypeIds: number[] = [];
  if (gtaskTypeId) issueTypeIds.push(gtaskTypeId);
  if (taskTypeId && taskTypeId !== gtaskTypeId) issueTypeIds.push(taskTypeId);
  if (issueTypeIds.length === 0) return { hours: [], usp: [] };

  const sorted = [...milestones]
    .filter((m) => !m.archived)
    .sort((a, b) => {
      if (!a.releaseDueDate) return 1;
      if (!b.releaseDueDate) return -1;
      return a.releaseDueDate.localeCompare(b.releaseDueDate);
    });
  const last = sorted.slice(-VELOCITY_SPRINT_LIMIT);
  if (last.length === 0) return { hours: [], usp: [] };

  const hoursPoints: VelocityBySprintPoint[] = [];
  const uspPoints: VelocityBySprintPoint[] = [];

  for (const m of last) {
    const issues = await getBacklogIssuesByMilestone({
      milestoneIds: [m.id],
      issueTypeIds,
      count: 100,
      parentChild: BacklogParentChild.All,
    });
    // Chỉ tính task vừa có category Release, vừa status Closed
    const closedRelease = issues.filter(
      (i) =>
        i.status?.name === TaskStatus.Closed &&
        (i.category?.some((c) => c.name === "Release") ?? false)
    );

    const hoursClosed = closedRelease.reduce(
      (sum, i) => sum + Math.max(0, i.estimatedHours ?? 0),
      0
    );
    hoursPoints.push({
      sprint: m.name,
      committed: Math.round(hoursClosed * 10) / 10,
      completed: Math.round(hoursClosed * 10) / 10,
    });

    const uspClosed = closedRelease.reduce(
      (sum, i) => sum + getPointFromIssue(i),
      0
    );
    uspPoints.push({
      sprint: m.name,
      committed: uspClosed,
      completed: uspClosed,
    });
  }

  return { hours: hoursPoints, usp: uspPoints };
}

export function buildSprintSummary(
  data: VelocityBySprintPoint[]
): SprintSummaryData | null {
  if (data.length === 0) return null;
  const last = data[data.length - 1];
  return buildSprintSummaryFromPoint(last);
}

/**
 * Build sprint summary for a specific sprint (for filter).
 */
export function buildSprintSummaryForSprint(
  data: VelocityBySprintPoint[],
  sprintName: string
): SprintSummaryData | null {
  const point = data.find((d) => d.sprint === sprintName);
  if (!point) return null;
  return buildSprintSummaryFromPoint(point);
}

function buildSprintSummaryFromPoint(
  point: VelocityBySprintPoint
): SprintSummaryData {
  const completionPercent =
    point.committed > 0
      ? Math.round((point.completed / point.committed) * 100)
      : 0;
  return {
    currentSprint: point.sprint,
    duration: "2 weeks",
    committed: point.committed,
    completed: point.completed,
    completionPercent,
  };
}

export function buildBurndownFromSprint(
  committed: number,
  completed: number,
  days: number = 10
): BurndownDayPoint[] {
  const result: BurndownDayPoint[] = [];
  const idealSlope = committed / Math.max(1, days);
  for (let d = 1; d <= days; d++) {
    const ideal = Math.max(0, committed - idealSlope * d);
    const progress = committed > 0 ? completed / committed : 0;
    const actual = Math.max(0, committed - committed * progress * (d / days));
    result.push({
      day: `Day ${d}`,
      actual: Math.round(actual * 10) / 10,
      ideal: Math.round(ideal * 10) / 10,
    });
  }
  return result;
}

export function buildForecast(
  data: VelocityBySprintPoint[],
  remainingWork: number = 160
): ForecastData {
  const completedList = data.map((d) => d.completed).filter((v) => v > 0);
  const avgVelocity =
    completedList.length > 0
      ? Math.round(
          completedList.reduce((a, b) => a + b, 0) / completedList.length
        )
      : 28;
  const sprintsNeeded =
    avgVelocity > 0 ? Math.ceil(remainingWork / avgVelocity) : 0;
  const now = new Date();
  const predicted = new Date(now);
  predicted.setDate(predicted.getDate() + sprintsNeeded * 14);
  return {
    remainingWork,
    sprintsNeeded,
    avgVelocityPerSprint: avgVelocity,
    predictedCompletion: predicted.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
  };
}

export function buildKeyInsights(data: VelocityBySprintPoint[]): KeyInsightItem[] {
  const insights: KeyInsightItem[] = [];
  if (data.length >= 3) {
    const last3 = data.slice(-3);
    const prev3 = data.slice(-6, -3);
    const avgLast = last3.reduce((s, d) => s + d.completed, 0) / last3.length;
    const avgPrev =
      prev3.length > 0
        ? prev3.reduce((s, d) => s + d.completed, 0) / prev3.length
        : avgLast;
    const pct =
      avgPrev > 0
        ? Math.round(((avgLast - avgPrev) / avgPrev) * 100)
        : 0;
    insights.push({
      id: "velocity-increase",
      text: `Velocity ${pct >= 0 ? "increased" : "decreased"} ${Math.abs(pct)}% over last 3 sprints`,
      type: pct >= 0 ? "success" : "warning",
    });
  }
  const commitmentRate =
    data.length > 0
      ? data.filter((d) => d.committed > 0 && d.completed / d.committed >= 0.9)
          .length / data.length
      : 0;
  insights.push({
    id: "consistent",
    text:
      commitmentRate >= 0.8
        ? "Consistent delivery above 90% commitment"
        : "Delivery below 90% commitment in some sprints",
    type: commitmentRate >= 0.8 ? "info" : "warning",
  });
  if (data.length >= 2) {
    const completed = data.map((d) => d.completed);
    const avg = completed.reduce((a, b) => a + b, 0) / completed.length;
    const variance =
      avg > 0
        ? Math.round(
            (Math.sqrt(
              completed.reduce((s, v) => s + (v - avg) ** 2, 0) / completed.length
            ) /
              avg) *
              100
          )
        : 0;
    insights.push({
      id: "variance",
      text: `Velocity variance: ${variance}% (${variance <= 20 ? "acceptable" : "high"})`,
      type: variance <= 20 ? "info" : "warning",
    });
  }
  insights.push({
    id: "maturity",
    text: "Team maturity improving estimation accuracy",
    type: "info",
  });
  return insights;
}
