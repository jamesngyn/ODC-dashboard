import {
  getBacklogIssuesByMilestone,
  getBacklogMilestones,
} from "@/lib/api/backlog";
import type { BacklogIssue } from "@/lib/api/backlog";
import { getPointFromIssue } from "@/lib/utils";
import { TaskStatus } from "@/types/enums/common";
import type {
  BurndownDayPoint,
  ForecastData,
  KeyInsightItem,
  SprintSummaryData,
  VelocityBySprintPoint,
} from "@/types/interfaces/velocity";

const VELOCITY_SPRINT_LIMIT = 6;

function isGtask(issue: BacklogIssue): boolean {
  const name = issue.issueType?.name?.toLowerCase() ?? "";
  return name === "gtask" || name.includes("gtask");
}

export async function fetchVelocityBySprint(): Promise<VelocityBySprintPoint[]> {
  const milestones = await getBacklogMilestones();
  const sorted = [...milestones]
    .filter((m) => !m.archived)
    .sort((a, b) => {
      if (!a.releaseDueDate) return 1;
      if (!b.releaseDueDate) return -1;
      return a.releaseDueDate.localeCompare(b.releaseDueDate);
    });
  const last = sorted.slice(-VELOCITY_SPRINT_LIMIT);
  if (last.length === 0) return [];

  const points: VelocityBySprintPoint[] = [];
  for (const m of last) {
    const issues = await getBacklogIssuesByMilestone({
      milestoneIds: [m.id],
      count: 100,
    });
    const gtasks = issues.filter(isGtask);
    const committed = gtasks.reduce(
      (sum, i) => sum + getPointFromIssue(i),
      0
    );
    const completed = gtasks
      .filter((i) => i.status?.name === TaskStatus.Closed)
      .reduce((sum, i) => sum + getPointFromIssue(i), 0);
    points.push({ sprint: m.name, committed, completed });
  }
  return points;
}

export function buildSprintSummary(
  data: VelocityBySprintPoint[]
): SprintSummaryData | null {
  if (data.length === 0) return null;
  const last = data[data.length - 1];
  const completionPercent =
    last.committed > 0
      ? Math.round((last.completed / last.committed) * 100)
      : 0;
  return {
    currentSprint: last.sprint,
    duration: "2 weeks",
    committed: last.committed,
    completed: last.completed,
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
