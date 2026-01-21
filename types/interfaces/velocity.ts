export interface VelocityBySprintPoint {
  sprint: string;
  committed: number;
  completed: number;
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
