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
