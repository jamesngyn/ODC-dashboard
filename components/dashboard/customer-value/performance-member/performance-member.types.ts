"use client";

import type { BacklogIssue, BacklogUser } from "@/types/interfaces/common";

export interface MemberAggregate {
  estimatedEffortHours: number;
  reEstimateEffortHours: number;
  actualEffortHours: number;
  uspPoint: number;
}

export interface BacklogProjectMapping {
  acmsProjectId: number;
  acmsProjectName: string;
  acmsProjectCode: string;
  backlogProjectId: string;
}

export interface ProjectPerformanceRow {
  key: string;
  projectId: number;
  projectName: string;
  projectCode: string;
  estimatedEffortHours: number;
  reEstimateEffortHours: number;
  actualEffortHours: number;
  uspPoint: number;
  performanceByEstimatePercent: number | null;
  performanceByReEstimatePercent: number | null;
  performanceByPoint: number | null;
}

export interface MemberPerformanceRow {
  key: string;
  employeeId: string;
  fullName: string;
  email: string;
  roles: string;
  jobRank: string;
  rankCoefficient: number;
  projects: ProjectPerformanceRow[];
  estimatedEffortHours: number;
  reEstimateEffortHours: number;
  actualEffortHours: number;
  uspPoint: number;
  performanceByEstimatePercent: number | null;
  performanceByReEstimatePercent: number | null;
  performanceByPoint: number | null;
}

export interface BacklogProjectDataItem {
  mapping: BacklogProjectMapping;
  members: BacklogUser[];
  issues: BacklogIssue[];
}

export interface BacklogProjectsResult {
  items: BacklogProjectDataItem[];
  attemptedCount: number;
  failedCount: number;
}

