/** Message for placeholder pages (feature not yet developed). Use i18n key when translation is added. */
// Deprecated: Use i18n key "common.featureNotDeveloped" instead
export const FEATURE_NOT_DEVELOPED = "Tính năng không phát triển";

// Common query keys for react-query or tanstack-query

export const QUERY_KEYS = {
  AUTH: {
    LOGIN: ["auth", "login"] as const,
    REGISTER: ["auth", "register"] as const,
    PROFILE: ["auth", "profile"] as const,
  },
  USER: {
    LIST: ["user", "list"] as const,
    DETAIL: (id: string | number) => ["user", "detail", id] as const,
  },
  BACKLOG: {
    ISSUES: ["backlog", "issues"] as const,
    ISSUE_TYPES: ["backlog", "issue-types"] as const,
    CATEGORIES: ["backlog", "categories"] as const,
    MILESTONES: ["backlog", "milestones"] as const,
    DEFECT_DENSITY_BY_SPRINT: ["backlog", "defect-density-by-sprint"] as const,
    ISSUES_COUNT: ["backlog", "issues-count"] as const,
    VELOCITY_BY_SPRINT: ["backlog", "velocity-by-sprint"] as const,
    PROJECT_MEMBERS: (projectId: string | number) =>
      ["backlog", "project-members", projectId] as const,
  },
  ACMS: {
    PROJECTS: ["acms", "projects"] as const,
  },
  CUSTOMER_VALUE: {
    TEAM_PERFORMANCE: ["customer-value", "team-performance"] as const,
    ACMS_RESOURCES: ["customer-value", "acms-resources"] as const,
    ACMS_PROJECTS: ["customer-value", "acms-projects"] as const,
    ACMS_TEAMS: ["customer-value", "acms-teams"] as const,
    BACKLOG_STATUSES: ["customer-value", "backlog-statuses"] as const,
    PERFORMANCE_CLOSED_ISSUES: (statusIds: number[]) =>
      ["customer-value", "performance-closed-issues", statusIds] as const,
    LEVELS: ["customer-value", "levels"] as const,
  },
  // Thêm các nhóm key khác nếu cần
} as const;

// Tỉ lệ hoàn thành theo giai đoạn (Overall Completion)
export const PHASE_COMPLETION_RATIO = {
  REQUIREMENT: 0, // Done requirement: 20%
  DEVELOPMENT: 0.2, // Done code: 60%
  TESTING: 0.6, // Done Test: 80%
  UAT: 0.8, // UAT: 80% (tương đương Testing)
  RELEASE: 0.8, // Release: 80%
} as const;

// Plan value tạm thời fix cứng (tính bằng giờ)
export const PLAN_VALUE_HOURS = 600;

// Tổng USP fix cứng
export const TOTAL_USP = 8000;

export const BACKLOG_ROLE_TYPE: Record<number, string> = {
  1: "Admin",
  2: "Normal User",
  3: "Reporter",
  4: "Viewer",
  5: "Guest Reporter",
  6: "Guest Viewer",
} as const;

export function getRoleTypeLabel(roleType: number): string {
  return BACKLOG_ROLE_TYPE[roleType] ?? "Unknown";
}

// Note: For i18n support, use translation key "roles.{roleName}" instead
// This function is kept for backward compatibility

/** Tỉ trọng theo severity để tính Defect Density: sum(count[level] × weight[level]) / manMonth */
export const SEVERITY_WEIGHTS: Record<
  "Crash/Critical" | "Major" | "Normal" | "Low",
  number
> = {
  "Crash/Critical": 10,
  Major: 5,
  Normal: 3,
  Low: 1,
} as const;

/** Tổng số man month dùng cho Defect Density. Cập nhật khi có số liệu. */
export const DEFECT_DENSITY_MAN_MONTHS = 100;

/** Số giờ chuẩn cho 1 man-month (dùng cho defect/leakage density). */
export const HOURS_PER_MAN_MONTH = 160;

/** Số ngày làm việc chuẩn cho 1 man-month. */
export const WORKING_DAYS_PER_MAN_MONTH = 20;

/**
 * Man month tạm thời = (số thành viên × ngày làm việc) / 20.
 * Mặc định 20 ngày làm việc: manMonths = memberCount.
 */
export function getManMonthsForSprint(
  memberCount: number,
  workingDays: number = WORKING_DAYS_PER_MAN_MONTH
): number {
  if (WORKING_DAYS_PER_MAN_MONTH <= 0 || memberCount < 0) return 0;
  return (memberCount * Math.max(0, workingDays)) / WORKING_DAYS_PER_MAN_MONTH;
}
