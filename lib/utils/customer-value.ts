import type { CommonSelectOption } from "@/components/ui/common-select";
import type { AcmsProject, AcmsResource } from "@/types/interfaces/acms";
import { eachDayOfInterval, isWeekend, parseISO } from "date-fns";

export const HOURS_PER_WORKING_DAY = 8;

/** Số ngày làm việc (trừ T7, CN) trong khoảng from–to (yyyy-MM-dd). */
export function getWorkingDaysInRange(from: string, to: string): number {
  try {
    const start = parseISO(from);
    const end = parseISO(to);
    const days = eachDayOfInterval({ start, end });
    return days.filter((d) => !isWeekend(d)).length;
  } catch {
    return 0;
  }
}

/** Allocate có nằm trong khoảng [from, to] (giao với kỳ chọn). */
export function allocateOverlapsPeriod(
  a: { start_date: string; end_date: string },
  from: string,
  to: string
): boolean {
  return a.start_date <= to && a.end_date >= from;
}

/**
 * Calendar effort (giờ): ưu tiên API (calendar_effort), sau đó công thức
 * số ngày làm việc (from–to) × 8h × (allocation/100) với allocation = tổng % từ allocates trùng kỳ.
 */
export function getCalendarEffortHours(
  resource: AcmsResource,
  from: string,
  to: string
): number {
  if (
    resource.calendar_effort != null &&
    Number.isFinite(resource.calendar_effort)
  ) {
    return resource.calendar_effort;
  }
  const allocates = resource.allocates;
  if (allocates?.length) {
    const workingDays = getWorkingDaysInRange(from, to);
    if (workingDays > 0) {
      const totalAllocationPct = allocates
        .filter((a) => allocateOverlapsPeriod(a, from, to))
        .reduce((sum, a) => sum + (Number(a.allocation) ?? 0), 0);
      if (totalAllocationPct > 0) {
        const hours =
          workingDays *
          HOURS_PER_WORKING_DAY *
          (totalAllocationPct / 100);
        return Math.round(hours * 10) / 10;
      }
    }
  }
  if (!resource.day_schedule?.length) return 0;
  const fromSchedule = resource.day_schedule.reduce(
    (sum, d) => sum + (d.allocate_effort ?? 0),
    0
  );
  return Math.round(fromSchedule * 10) / 10;
}

/**
 * Build options cho select Project từ getAcmsProjects.
 * - value = project.id (để gửi project_id lên API)
 * - label = project.name
 * - Mapping qua code: dùng getProjectByCode khi cần tìm project từ code.
 */
export function buildProjectSelectOptions(
  projects: AcmsProject[],
  allValue: string,
  allLabel: string
): CommonSelectOption[] {
  return [
    { value: allValue, label: allLabel },
    ...projects.map((p) => ({
      value: String(p.id),
      label: p.name,
    })),
  ];
}

/**
 * Tìm project theo code (mapping qua trường code).
 * Dùng khi có code (vd từ resource.project) cần lấy project tương ứng.
 */
export function getProjectByCode(
  projects: AcmsProject[],
  code: string
): AcmsProject | undefined {
  if (!code?.trim()) return undefined;
  const normalized = code.trim().toLowerCase();
  return projects.find(
    (p) => p.code?.trim().toLowerCase() === normalized
  );
}
