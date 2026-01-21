export interface TeamMemberPerformance {
  id: string;
  name: string;
  roleType: number;
  billableHours: number;
  earnedHours: number;
  performancePercentage: number;
}

export interface CostPerformanceSummary {
  costPerformance: number; // percentage
  totalBill: number; // hours
  totalEarned: number; // hours
}

export interface PerformanceIndicator {
  type: "high" | "under" | "optimal";
  title: string;
  description: string;
  count: number;
}
