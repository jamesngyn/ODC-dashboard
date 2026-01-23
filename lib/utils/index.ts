import {
  PHASE_COMPLETION_RATIO,
  PLAN_VALUE_HOURS,
} from "@/constants/common";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { TaskStatus, TaskType } from "@/types/enums/common";
import {
  BacklogIssue,
} from "@/types/interfaces/common";
import { getActualEndDateFromIssue, mapBacklogCategoryToTaskStatus } from "@/lib/api/backlog";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isActualEndDateInRange(
  startDate: string | null,
  dueDate: string | null,
  actualEndDate: string | null
): boolean {
  if (!startDate || !dueDate || !actualEndDate) {
    return false;
  }

  return actualEndDate >= startDate && actualEndDate <= dueDate;
}

/**
 * Tính số giờ thực hiện cho một task
 * - Đối với task đã Closed: lấy actualHours nếu có, nếu không thì tính từ startDate đến actualEndDate
 * - Đối với task chưa done (! Closed): phải có startDate, lấy actualHours và category rồi nhân với tỉ lệ giai đoạn
 */
export function calculateTaskHours(issue: BacklogIssue): number {
  const isClosed = issue.status.name === TaskStatus.Closed;
  const startDate = issue.startDate;

  if (isClosed) {
    // Đối với task đã Closed: ưu tiên lấy actualHours
    if (issue.actualHours !== undefined && issue.actualHours !== null) {
      return Math.max(0, issue.actualHours);
    }

    // Nếu không có actualHours, tính từ startDate đến actualEndDate (từ customFields)
    const actualEndDate = getActualEndDateFromIssue(issue);
    if (!startDate || !actualEndDate) {
      return 0;
    }

    const start = new Date(startDate);
    const end = new Date(actualEndDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60); // Chuyển từ milliseconds sang giờ

    return Math.max(0, diffHours);
  } else {
    // Đối với task chưa done: phải có startDate
    if (!startDate) {
      return 0;
    }

    // Lấy actualHours (nếu có)
    const actualHours = issue.actualHours ?? 0;

    // Lấy tỉ lệ giai đoạn dựa trên category của task
    const taskType = mapBacklogCategoryToTaskStatus(issue.category);
    let phaseRatio: number;

    switch (taskType) {
      case TaskType.Requirement:
        phaseRatio = PHASE_COMPLETION_RATIO.REQUIREMENT;
        break;
      case TaskType.Development:
        phaseRatio = PHASE_COMPLETION_RATIO.DEVELOPMENT;
        break;
      case TaskType.Testing:
        phaseRatio = PHASE_COMPLETION_RATIO.TESTING;
        break;
      case TaskType.UAT:
        phaseRatio = PHASE_COMPLETION_RATIO.UAT;
        break;
      case TaskType.Release:
        phaseRatio = PHASE_COMPLETION_RATIO.RELEASE;
        break;
      default:
        phaseRatio = PHASE_COMPLETION_RATIO.REQUIREMENT;
    }

    // Nhân actualHours với tỉ lệ giai đoạn
    return Math.max(0, actualHours * phaseRatio);
  }
}

/**
 * Tính tổng actual hours (lấy trực tiếp actualHours của mỗi task, không nhân với tỉ lệ)
 */
export function calculateTotalActualHours(issues: BacklogIssue[]): number {
  if (!issues || issues.length === 0) {
    return 0;
  }

  return issues.reduce((sum, issue) => {
    const actualHours = issue.actualHours ?? 0;
    return sum + Math.max(0, actualHours);
  }, 0);
}

/**
 * Tính Estimate Completed: Tổng actual hours / Tổng plan hours
 */
export function calculateEstimateCompleted(issues: BacklogIssue[]): {
  completed: number;
  total: number;
} {
  if (!issues || issues.length === 0) {
    return { completed: 0, total: 0 };
  }

  const totalActualHours = calculateTotalActualHours(issues);
  const totalPlanHours = issues.reduce(
    (sum, issue) => sum + Math.max(0, issue.estimatedHours ?? 0),
    0
  );

  return {
    completed: Math.round(totalActualHours),
    total: Math.round(totalPlanHours),
  };
}

/**
 * Lấy point từ customFields của issue (field name "point").
 * Dùng cho Gtask velocity và USP.
 */
export function getPointFromIssue(issue: BacklogIssue): number {
  if (!issue.customFields || issue.customFields.length === 0) {
    return 0;
  }

  const pointField = issue.customFields.find(
    (field) => field.name?.toLowerCase() === "point"
  );

  if (!pointField || !pointField.value || pointField.value.length === 0) {
    return 0;
  }

  const pointValue = pointField.value;
  const point = parseFloat(pointValue);
  return isNaN(point) ? 0 : Math.max(0, point);
}

/**
 * Tính USP Completed: Tổng point của các task đã Closed / Tổng USP fix cứng
 */
export function calculateUSPCompleted(issues: BacklogIssue[]): {
  completed: number;
  total: number;
} {
  if (!issues || issues.length === 0) {
    return { completed: 0, total: 0 };
  }

  // Lọc các task đã Closed và tính tổng point
  const closedTasks = issues.filter(
    (issue) => issue.status.name === TaskStatus.Closed
  );

  const completed = closedTasks.reduce(
    (sum, issue) => sum + getPointFromIssue(issue),
    0
  );
  const total = issues.reduce(
    (sum, issue) => sum + getPointFromIssue(issue),
    0
  );

  return {
    completed: Math.round(completed),
    total: Math.round(total),
  };
}

/**
 * Tính Tasks Completed: Số task đã Closed / Tổng số task
 */
export function calculateTasksCompleted(issues: BacklogIssue[]): {
  completed: number;
  total: number;
} {
  if (!issues || issues.length === 0) {
    return { completed: 0, total: 0 };
  }

  const closedCount = issues.filter(
    (issue) => issue.status.name === TaskStatus.Closed
  ).length;

  return {
    completed: closedCount,
    total: issues.length,
  };
}

/**
 * Tính Overall Completion dựa trên tổng số giờ đang thực hiện / tổng plan value
 */
export function calculateOverallCompletion(issues: BacklogIssue[]): number {
  if (!issues || issues.length === 0) {
    return 0;
  }

  const totalActualHours = issues.reduce((sum, issue) => {
    return sum + calculateTaskHours(issue);
  }, 0);

  const completion = (totalActualHours / PLAN_VALUE_HOURS) * 100;

  return Math.min(100, Math.max(0, completion));
}

function getPhaseRatioForIssue(issue: BacklogIssue): number {
  const taskType = mapBacklogCategoryToTaskStatus(issue.category);
  switch (taskType) {
    case TaskType.Requirement:
      return PHASE_COMPLETION_RATIO.REQUIREMENT;
    case TaskType.Development:
      return PHASE_COMPLETION_RATIO.DEVELOPMENT;
    case TaskType.Testing:
      return PHASE_COMPLETION_RATIO.TESTING;
    case TaskType.UAT:
      return PHASE_COMPLETION_RATIO.UAT;
    case TaskType.Release:
      return PHASE_COMPLETION_RATIO.RELEASE;
    default:
      return PHASE_COMPLETION_RATIO.REQUIREMENT;
  }
}

/**
 * Tính Overall Completion theo công thức:
 * tổng (số giờ estimate của task × tỉ lệ category) / tổng số giờ estimate.
 * Tỉ lệ category lấy từ PHASE_COMPLETION_RATIO (Requirement 20%, Development 60%, Testing 80%, UAT 80%, Release 100%).
 * Trả về 0–100 (%).
 */
export function calculateOverallCompletionByEstimate(
  issues: BacklogIssue[]
): number {
  if (!issues?.length) return 0;

  let sumWeighted = 0;
  let sumEstimate = 0;

  for (const issue of issues) {
    const est = issue.estimatedHours ?? 0;
    sumWeighted += est * getPhaseRatioForIssue(issue);
    sumEstimate += est;
  }

  if (sumEstimate === 0) return 0;
  return Math.min(100, Math.max(0, (sumWeighted / sumEstimate) * 100));
}
