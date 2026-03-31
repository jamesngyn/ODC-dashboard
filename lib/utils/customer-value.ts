import { eachDayOfInterval, isWeekend, parseISO } from "date-fns";

import type { AcmsProject, AcmsResource } from "@/types/interfaces/acms";
import type { CommonSelectOption } from "@/components/ui/common-select";

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

export function getCalendarEffortHours(
  resource: AcmsResource,
  from: string,
  to: string,
  filterByProjectId?: string
): number {
  const filterByProject =
    filterByProjectId != null &&
    filterByProjectId !== "" &&
    filterByProjectId !== "__all__";

  const allocates = resource.allocates ?? [];
  if (!allocates.length) return 0;

  const inPeriod = allocates.filter((a) =>
    allocateOverlapsPeriod(a, from, to)
  );
  if (!inPeriod.length) return 0;

  const filteredAllocates = filterByProject
    ? inPeriod.filter(
        (a) => String(a.project_id) === String(filterByProjectId)
      )
    : inPeriod;

  if (!filteredAllocates.length) return 0;

  const totalHours = filteredAllocates.reduce((sum, a) => {
    const overlapFrom = from > a.start_date ? from : a.start_date;
    const overlapTo = to < a.end_date ? to : a.end_date;
    const workingDays = getWorkingDaysInRange(overlapFrom, overlapTo);
    if (workingDays <= 0) return sum;

    const allocationPct = Number(a.allocation) ?? 0;
    if (allocationPct <= 0) return sum;

    const hours =
      workingDays * HOURS_PER_WORKING_DAY * (allocationPct / 100);
    return sum + hours;
  }, 0);

  return Math.round(totalHours * 10) / 10;
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
  return projects.find((p) => p.code?.trim().toLowerCase() === normalized);
}
