export interface VelocityBySprintPoint {
  sprint: string;
  committed: number;
  completed: number;
}

/** Kết quả velocity theo sprint: hours (estimatedHours) và USP (point). */
export interface VelocityBySprintResult {
  hours: VelocityBySprintPoint[];
  usp: VelocityBySprintPoint[];
}

export interface SprintSummaryData {
  currentSprint: string;
  duration: string;
  committed: number;
  completed: number;
  completionPercent: number;
}

export interface BurndownDayPoint {
  day: string;
  actual: number;
  ideal: number;
}

export interface ForecastData {
  remainingWork: number;
  sprintsNeeded: number;
  avgVelocityPerSprint: number;
  predictedCompletion: string;
}

export interface KeyInsightItem {
  id: string;
  text: string;
  type: "success" | "info" | "warning";
}
