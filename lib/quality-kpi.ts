import { HOURS_PER_MAN_MONTH, SEVERITY_WEIGHTS } from "@/constants/common";
import {
  getActualEndDateFromIssue,
  getBacklogIssueTypeIdByName,
  getBacklogIssuesByMilestone,
  getBacklogMilestones,
} from "@/lib/api/backlog";
import { calculateTotalActualHours } from "@/lib/utils";
import { BugType, type BugTypeValue } from "@/types/enums/common";
import type { BacklogIssue } from "@/types/interfaces/common";
import type {
  DefectDensityPoint,
  DefectTrendsByWeek,
  SeverityItem,
} from "@/types/interfaces/quality-kpi";

type SeverityLevel = SeverityItem["level"];

export const BUG_SEVERITY_FIELD = "Bug Severity";
export const BUG_TYPE_FIELD = "Bug Type";

const SEVERITY_LEVELS: SeverityLevel[] = [
  "Crash/Critical",
  "Major",
  "Normal",
  "Low",
];

function getCustomFieldValue(issue: BacklogIssue, fieldName: string): string {
  const c = issue.customFields?.find(
    (f) => (f.name ?? "").trim() === fieldName
  );
  if (!c) return "";
  const val = (c as { value?: unknown }).value;
  if (typeof val === "string") return val.trim();
  if (val != null && typeof val === "object" && "name" in val) {
    const n = (val as { name?: unknown }).name;
    return typeof n === "string" ? String(n).trim() : "";
  }
  return "";
}

function normalizeToSeverityLevel(raw: string): SeverityLevel {
  if (!raw || typeof raw !== "string") return "Normal";
  const v = raw.trim();
  if (!v) return "Normal";
  if (
    v === "Crash/Critical" ||
    /crash|critical/i.test(v) ||
    /^cao$|highest|^4$/i.test(v)
  )
    return "Crash/Critical";
  if (v === "Major" || /major|high/i.test(v) || /^3$/i.test(v)) return "Major";
  if (v === "Normal" || /normal|medium|trung/i.test(v) || /^2$/i.test(v))
    return "Normal";
  if (v === "Low" || /low|thấp|lowest/i.test(v) || /^1$/i.test(v)) return "Low";
  return "Normal";
}

function normalizeToBugType(raw: string): BugTypeValue | null {
  if (!raw || typeof raw !== "string") return null;
  const v = raw.trim();
  if (!v) return null;
  if (/internal\s*bug/i.test(v)) return BugType.InternalBug;
  if (/external\s*bug/i.test(v)) return BugType.ExternalBug;
  if (/leakage/i.test(v)) return BugType.Leakage;
  return null;
}

export function getSeverityFromIssue(issue: BacklogIssue): SeverityLevel {
  const v = getCustomFieldValue(issue, BUG_SEVERITY_FIELD);
  return normalizeToSeverityLevel(v);
}

export function getBugTypeFromIssue(issue: BacklogIssue): BugTypeValue | null {
  const v = getCustomFieldValue(issue, BUG_TYPE_FIELD);
  return normalizeToBugType(v);
}

export function getSeverityCountsFromBugs(
  bugs: BacklogIssue[] | undefined
): SeverityItem[] {
  if (!bugs?.length)
    return SEVERITY_LEVELS.map((level) => ({ level, count: 0 }));

  const internalExternal = bugs.filter((b) => {
    const t = getBugTypeFromIssue(b);
    return t
  });

  const counts: Record<SeverityLevel, number> = {
    "Crash/Critical": 0,
    Major: 0,
    Normal: 0,
    Low: 0,
  };
  for (const b of internalExternal) {
    const level = getSeverityFromIssue(b);
    counts[level] += 1;
  }
  return SEVERITY_LEVELS.map((level) => ({ level, count: counts[level] }));
}

export function getSeverityCountsFromAllBugs(
  bugs: BacklogIssue[] | undefined
): SeverityItem[] {
  if (!bugs?.length)
    return SEVERITY_LEVELS.map((level) => ({ level, count: 0 }));

  const counts: Record<SeverityLevel, number> = {
    "Crash/Critical": 0,
    Major: 0,
    Normal: 0,
    Low: 0,
  };
  for (const b of bugs) {
    const level = getSeverityFromIssue(b);
    counts[level] += 1;
  }
  return SEVERITY_LEVELS.map((level) => ({ level, count: counts[level] }));
}

export function getLeakageCount(bugs: BacklogIssue[] | undefined): number {
  if (!bugs?.length) return 0;
  return bugs.filter((b) => getBugTypeFromIssue(b) === BugType.Leakage).length;
}

export function getSeverityCountsFromLeakageBugs(
  bugs: BacklogIssue[] | undefined
): SeverityItem[] {
  if (!bugs?.length)
    return SEVERITY_LEVELS.map((level) => ({ level, count: 0 }));

  const leakageBugs = bugs.filter(
    (b) => getBugTypeFromIssue(b) === BugType.Leakage
  );
  const counts: Record<SeverityLevel, number> = {
    "Crash/Critical": 0,
    Major: 0,
    Normal: 0,
    Low: 0,
  };
  for (const b of leakageBugs) {
    const level = getSeverityFromIssue(b);
    counts[level] += 1;
  }
  return SEVERITY_LEVELS.map((level) => ({ level, count: counts[level] }));
}

export function getSeverityCountsFromInternalBugs(
  bugs: BacklogIssue[] | undefined
): SeverityItem[] {
  if (!bugs?.length)
    return SEVERITY_LEVELS.map((level) => ({ level, count: 0 }));

  const internalBugs = bugs.filter(
    (b) => getBugTypeFromIssue(b) === BugType.InternalBug
  );
  const counts: Record<SeverityLevel, number> = {
    "Crash/Critical": 0,
    Major: 0,
    Normal: 0,
    Low: 0,
  };
  for (const b of internalBugs) {
    const level = getSeverityFromIssue(b);
    counts[level] += 1;
  }
  return SEVERITY_LEVELS.map((level) => ({ level, count: counts[level] }));
}

function getFixedClosedDate(issue: BacklogIssue): string {
  const v = getActualEndDateFromIssue(issue);
  if (v) return v;
  return issue.updated ?? "";
}

function parseDateOrNull(s: string): Date | null {
  if (!s || typeof s !== "string") return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function isDateInWeek(d: Date | null, weekStart: Date, weekEnd: Date): boolean {
  if (!d) return false;
  const t = d.getTime();
  return t >= weekStart.getTime() && t <= weekEnd.getTime();
}

export function computeDefectTrendsByWeek(
  bugs: BacklogIssue[] | undefined,
  weekCount: number = 4
): DefectTrendsByWeek[] {
  const now = new Date();
  const result: { week: string; found: number; fixed: number; closed: number }[] = [];
  const weekStarts: Date[] = [];
  const weekEnds: Date[] = [];

  for (let i = 0; i < weekCount; i++) {
    result.push({ week: `Week ${i + 1}`, found: 0, fixed: 0, closed: 0 });
  }

  if (!bugs?.length) return result;

  for (let i = 0; i < weekCount; i++) {
    const k = weekCount - 1 - i;
    const we = new Date(now);
    we.setDate(we.getDate() - k * 7);
    we.setHours(23, 59, 59, 999);
    const ws = new Date(now);
    ws.setDate(ws.getDate() - (k + 1) * 7 + 1);
    ws.setHours(0, 0, 0, 0);
    weekStarts.push(ws);
    weekEnds.push(we);
  }

  for (const b of bugs) {
    const statusName = (b.status?.name ?? "").toLowerCase();
    const isFixed = /resolve|closed/i.test(statusName);
    const isClosed = /^closed$/i.test(statusName);

    const createdDate = parseDateOrNull(b.created ?? "");
    for (let i = 0; i < weekCount; i++) {
      if (isDateInWeek(createdDate, weekStarts[i], weekEnds[i])) {
        result[i].found += 1;
        break;
      }
    }

    if (isFixed) {
      const fixedDate = parseDateOrNull(getFixedClosedDate(b));
      for (let i = 0; i < weekCount; i++) {
        if (isDateInWeek(fixedDate, weekStarts[i], weekEnds[i])) {
          result[i].fixed += 1;
          break;
        }
      }
    }

    if (isClosed) {
      const closedDate = parseDateOrNull(getFixedClosedDate(b));
      for (let i = 0; i < weekCount; i++) {
        if (isDateInWeek(closedDate, weekStarts[i], weekEnds[i])) {
          result[i].closed += 1;
          break;
        }
      }
    }
  }

  return result;
}

function getWeightedSum(severityCounts: SeverityItem[]): number {
  return severityCounts.reduce(
    (sum, { level, count }) => sum + count * (SEVERITY_WEIGHTS[level] ?? 0),
    0
  );
}

export type DefectMetricType = "defect" | "leakage";

/**
 * Công thức chung: weightedSum(severityCounts) / totalActualHours.
 * - defect: severityCounts = Internal + External bugs
 * - leakage: severityCounts = chỉ Leakage bugs
 */
export function calculateWeightedRate(
  _type: DefectMetricType,
  severityCounts: SeverityItem[],
  totalActualHours: number
): number {
  if (totalActualHours <= 0) return 0;
  return getWeightedSum(severityCounts) / totalActualHours;
}

export function calculateDefectDensity(
  severityCounts: SeverityItem[],
  totalActualHours: number
): number {
  return calculateWeightedRate("defect", severityCounts, totalActualHours);
}

export function calculateDefectLeakage(
  severityCounts: SeverityItem[],
  totalActualHours: number
): number {
  return calculateWeightedRate("leakage", severityCounts, totalActualHours);
}

/**
 * Defect density theo man-month: weightedBugs / (totalActualHoursAll / 160).
 * Mẫu số = tổng actual hours của tất cả các task có tính bug (kể cả bug closed) / 160.
 */
export function calculateDefectDensityPerManMonth(
  severityCounts: SeverityItem[],
  totalActualHoursAll: number
): number {
  if (totalActualHoursAll <= 0) return 0;
  const manMonths = totalActualHoursAll / HOURS_PER_MAN_MONTH;
  return getWeightedSum(severityCounts) / manMonths;
}

/**
 * Leakage density theo man-month: weightedLeakage / (totalActualHoursAll / 160).
 * Mẫu số = tổng actual hours của tất cả các task có tính bug (kể cả bug closed) / 160.
 */
export function calculateDefectLeakagePerManMonth(
  severityCounts: SeverityItem[],
  totalActualHoursAll: number
): number {
  if (totalActualHoursAll <= 0) return 0;
  const manMonths = totalActualHoursAll / HOURS_PER_MAN_MONTH;
  return getWeightedSum(severityCounts) / manMonths;
}

function getTotalCount(severityCounts: SeverityItem[]): number {
  return severityCounts.reduce((sum, item) => sum + item.count, 0);
}

/**
 * Removal Efficiency = (số bug nội bộ / tổng số bug từ API count) * 100.
 * Chỉ đếm số lượng, không nhân trọng số. totalBugCount lấy từ API count theo issueType (Bug).
 */
export function calculateRemovalEfficiency(
  severityInternal: SeverityItem[],
  totalBugCount: number
): number {
  const countInternal = getTotalCount(severityInternal);
  if (totalBugCount <= 0) return 0;
  return (countInternal / totalBugCount) * 100;
}

const DEFECT_DENSITY_SPRINT_LIMIT = 6;

export async function fetchDefectDensityBySprint(): Promise<DefectDensityPoint[]> {
  const [milestones, bugTypeId] = await Promise.all([
    getBacklogMilestones(),
    getBacklogIssueTypeIdByName("Bug"),
  ]);

  const sorted = [...milestones]
    .filter((m) => !m.archived)
    .sort((a, b) => {
      if (!a.releaseDueDate) return 1;
      if (!b.releaseDueDate) return -1;
      return a.releaseDueDate.localeCompare(b.releaseDueDate);
    });

  const last = sorted.slice(-DEFECT_DENSITY_SPRINT_LIMIT);

  if (last.length === 0) return [];

  const points: DefectDensityPoint[] = [];
  for (const m of last) {
    const allIssues = await getBacklogIssuesByMilestone({
      milestoneIds: [m.id],
      count: 100,
    });
    const bugs =
      bugTypeId != null
        ? allIssues.filter((i) => i.issueType?.id === bugTypeId)
        : [];

    const severity = getSeverityCountsFromBugs(bugs);
    const totalActualHoursAll = calculateTotalActualHours(allIssues);
    const value = calculateDefectDensityPerManMonth(
      severity,
      totalActualHoursAll
    );

    points.push({ sprint: m.name, value: Number(value.toFixed(2)) });
  }
  return points;
}
