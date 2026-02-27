/** Dữ liệu Busy Rate Member - từ ACMS theo Ngày/Tuần/Tháng, theo Project, Division */
export interface BusyRateMember {
  employeeId: string;
  fullName: string;
  roles: string;
  jobRank: string;
  projectName: string;
  projectId: string;
  calendarEffortHours: number;
  actualEffortHours: number;
  effortDeviationPercent: number;
}

/** Tổng hợp chi phí / hiệu suất (summary card) */
export interface CostPerformanceSummary {
  costPerformance: number;
  totalBill: number;
  totalEarned: number;
}

/** Chỉ số hiệu suất hiển thị trên dashboard (high / under / optimal) */
export interface PerformanceIndicator {
  type: "high" | "under" | "optimal";
  title: string;
  description: string;
}

/** Hiệu suất từng thành viên team (bảng team cost performance) */
export interface TeamMemberPerformance {
  id: string;
  name: string;
  roleType: number;
  billableHours: number;
  earnedHours: number;
  performancePercentage: number;
}

/** Dữ liệu Performance Member (task đã closed) - từ Backlog theo Sprint/Milestone/Project/Division */
export interface PerformanceMember {
  employeeId: string;
  fullName: string;
  roles: string;
  jobRank: string;
  rankCoefficient: number;
  projectName: string;
  estimatedEffortHours: number;
  reEstimateEffortHours: number;
  actualEffortHours: number;
  uspPoint: number;
  performanceByEstimatePercent: number;
  performanceByReEstimatePercent: number;
  performanceByPoint: number;
}
