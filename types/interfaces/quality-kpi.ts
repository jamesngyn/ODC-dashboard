export interface DefectDensityPoint {
  sprint: string;
  value: number;
}

export interface DefectTrendsByWeek {
  week: string;
  found: number;
  fixed: number;
  closed: number;
}

export interface QualityMetricCardData {
  value: string;
  label: string;
  subLabel: string;
  target: string;
  valueColor: "green" | "blue" | "purple";
}

export interface SeverityItem {
  level: "Crash/Critical" | "Major" | "Normal" | "Low";
  count: number;
}

export interface TestingCoverageItem {
  label: string;
  value: number;
  barColor: string;
}

export interface QualityInsightItem {
  type: "success" | "warning" | "info";
  text: string;
}
