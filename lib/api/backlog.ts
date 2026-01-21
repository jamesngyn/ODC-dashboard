import configs from "@/constants/config";

import { BacklogCategory, TaskType } from "@/types/enums/common";

import { sendGet } from "./axios";

const BACKLOG_API_KEY = configs.BACKLOG_API_KEY;
const BACKLOG_BASE_URL = configs.BACKLOG_BASE_URL.replace(/\/+$/, "");
const BACKLOG_PROJECT_ID = configs.BACKLOG_PROJECT_ID;

export interface BacklogCategoryItem {
  id: number;
  projectId: number;
  name: string;
  displayOrder: number;
}

export interface BacklogIssue {
  id: number;
  issueKey: string;
  summary: string;
  status: {
    id: number;
    name: string;
  };
  issueType: {
    id: number;
    name: string;
  };
  startDate: string | null;
  dueDate: string | null;
  created?: string;
  updated?: string;
  actualHours?: number | null;
  estimatedHours?: number | null;
  assignee?: {
    id: number;
    userId: string;
    name: string;
  } | null;
  category?: BacklogCategoryItem[];
  priority?: { id: number; name: string };
  customFields?: {
    id: number;
    fieldTypeId: number;
    name: string;
    value: string;
  }[];
}


export const ACTUAL_END_DATE_FIELD_NAME = "Actual End-date";

export function getActualEndDateFromIssue(issue: BacklogIssue): string | null {
  if (!issue.customFields?.length) return null;
  const field = issue.customFields.find(
    (f) => (f.name ?? "").trim() === ACTUAL_END_DATE_FIELD_NAME
  );
  if (!field?.value || typeof field.value !== "string") return null;
  const v = String(field.value).trim();
  return v || null;
}

export interface BacklogIssueType {
  id: number;
  projectId: number;
  name: string;
  color: string;
  displayOrder: number;
  templateSummary: string | null;
  templateDescription: string | null;
}

export interface BacklogMilestone {
  id: number;
  projectId: number;
  name: string;
  description: string;
  startDate: string | null;
  releaseDueDate: string | null;
  archived: boolean;
  displayOrder: number;
}

export interface BacklogUser {
  id: number;
  userId: string; // login ID
  name: string;
  roleType: number;
  lang: string | null;
  nulabAccount?: {
    nulabId: string;
    name: string;
    uniqueId: string;
  };
  mailAddress: string;
  lastLoginTime: string; // ISO 8601 string
}

/**
 * Map Backlog category sang TaskType
 * Mapping rules:
 * - Clear Requirement → Requirement
 * - Coding → Development
 * - Testing → Testing
 * - UAT → UAT
 * - Release → Release
 */
export const mapBacklogCategoryToTaskStatus = (
  categories: BacklogCategoryItem[] | undefined
): TaskType => {
  // Nếu không có category, trả về default
  if (!categories || categories.length === 0) {
    return TaskType.Requirement;
  }

  // Lấy category đầu tiên
  const categoryName = categories[0]?.name;

  if (!categoryName) {
    return TaskType.Requirement;
  }

  // Mapping chính xác theo enum BacklogCategory
  switch (categoryName) {
    case BacklogCategory.ClearRequirement:
      return TaskType.Requirement;
    case BacklogCategory.Coding:
      return TaskType.Development;
    case BacklogCategory.Testing:
      return TaskType.Testing;
    case BacklogCategory.UAT:
      return TaskType.UAT;
    case BacklogCategory.Release:
      return TaskType.Release;
    default:
      // Fallback: check theo tên category (case-insensitive) để xử lý các trường hợp không khớp chính xác
      const normalizedCategory = categoryName.toLowerCase().trim();

      // Clear Requirement → Requirement
      if (
        normalizedCategory === "clear requirement" ||
        normalizedCategory.includes("requirement")
      ) {
        return TaskType.Requirement;
      }

      // Coding → Development
      if (normalizedCategory === "coding") {
        return TaskType.Development;
      }

      // Testing → Testing
      if (normalizedCategory === "testing") {
        return TaskType.Testing;
      }

      // UAT → UAT
      if (normalizedCategory === "uat") {
        return TaskType.UAT;
      }

      // Release → Release
      if (normalizedCategory === "release") {
        return TaskType.Release;
      }

      // Default fallback
      return TaskType.Requirement;
  }
};

/**
 * Get list of issue types in the project (Bug, Task, ...).
 * Dùng để lấy id của "Bug" khi cần filter issues theo issueTypeId.
 */
export const getBacklogIssueTypes = (): Promise<BacklogIssueType[]> =>
  sendGet(
    `${BACKLOG_BASE_URL}/api/v2/projects/${BACKLOG_PROJECT_ID}/issueTypes`,
    { apiKey: BACKLOG_API_KEY }
  );

export interface GetBacklogIssuesOptions {
  /** Lọc theo loại issue (vd: Bug). Cần lấy id từ getBacklogIssueTypes. */
  issueTypeIds?: number[];
  /** Số bản ghi tối đa (mặc định 100, max 100). */
  count?: number;
}

/**
 * Fetch issues from Backlog
 * @param options - issueTypeIds để chỉ lấy Bug (hoặc loại khác); count để paginate
 */
export const getBacklogIssues = (
  options?: GetBacklogIssuesOptions
): Promise<BacklogIssue[]> => {
  const params: Record<string, string | number | number[] | string[] | undefined> = {
    apiKey: BACKLOG_API_KEY,
    "projectId[]": [BACKLOG_PROJECT_ID],
    count: options?.count ?? 100,
  };
  if (options?.issueTypeIds && options.issueTypeIds.length > 0) {
    params["issueTypeId[]"] = options.issueTypeIds;
  }
  return sendGet(`${BACKLOG_BASE_URL}/api/v2/issues`, params);
};

/**
 * Lấy danh sách chỉ các Bug trong dự án.
 * Gọi getBacklogIssueTypes để tìm id của "Bug", rồi get issues với issueTypeId[].
 * Nếu dự án không có issue type tên "Bug" (không phân biệt hoa thường), trả về [].
 */
export const getBacklogBugs = async (): Promise<BacklogIssue[]> => {
  const types = await getBacklogIssueTypes();
  const bugType = types.find(
    (t) => t.name.toLowerCase().trim() === "bug"
  );
  if (!bugType) return [];
  return getBacklogIssues({ issueTypeIds: [bugType.id], count: 100 });
};

/**
 * Get list of project members (users) from Backlog
 * @param excludeGroupMembers - true to exclude members who are included via project groups/teams; false returns all members. Default: false
 * @returns Array of BacklogUser objects
 */
export const getBacklogProjectMembers = (
  excludeGroupMembers: boolean = false
): Promise<BacklogUser[]> =>
  sendGet(`${BACKLOG_BASE_URL}/api/v2/projects/${BACKLOG_PROJECT_ID}/users`, {
    apiKey: BACKLOG_API_KEY,
    excludeGroupMembers,
  });

/**
 * Get list of milestones (version/milestone) của dự án.
 * Endpoint: GET /api/v2/projects/:id/versions (Backlog dùng chung cho version/milestone).
 */
export const getBacklogMilestones = (): Promise<BacklogMilestone[]> =>
  sendGet(
    `${BACKLOG_BASE_URL}/api/v2/projects/${BACKLOG_PROJECT_ID}/versions`,
    { apiKey: BACKLOG_API_KEY }
  );

export interface GetBacklogIssuesByMilestoneOptions {
  /** ID các milestone cần lấy issues. Bắt buộc. */
  milestoneIds: number[];
  /** Chỉ lấy loại issue (vd: Bug). Lấy id từ getBacklogIssueTypes. */
  issueTypeIds?: number[];
  /** Số bản ghi tối đa (mặc định 100). */
  count?: number;
}

/**
 * Lấy issues theo milestone (Get Issue List với milestoneId[]).
 * API riêng, không mở rộng getBacklogIssues.
 */
/**
 * Lấy issues theo milestone (Get Issue List với milestoneId[] và versionId[]).
 * Gửi cả versionId[] (cùng id từ /versions) để bắt issue gán Version hoặc Milestone.
 */
export const getBacklogIssuesByMilestone = (
  options: GetBacklogIssuesByMilestoneOptions
): Promise<BacklogIssue[]> => {
  const { milestoneIds, issueTypeIds, count = 100 } = options;
  const params: Record<string, string | number | number[] | string[] | undefined> = {
    apiKey: BACKLOG_API_KEY,
    "projectId[]": [BACKLOG_PROJECT_ID],
    "milestoneId[]": milestoneIds,
    // "versionId[]": milestoneIds,
    count,
  };
  if (issueTypeIds && issueTypeIds.length > 0) {
    params["issueTypeId[]"] = issueTypeIds;
  }
  return sendGet(`${BACKLOG_BASE_URL}/api/v2/issues`, params);
};
