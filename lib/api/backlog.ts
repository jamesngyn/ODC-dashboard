import configs from "@/constants/config";

import { BacklogCategory, BacklogParentChildType, TaskType } from "@/types/enums/common";

import { sendGet } from "./axios";
import {
  BacklogIssue,
  BacklogIssueType,
  BacklogMilestone,
  BacklogStatus,
  BacklogUser,
  BacklogCategoryItem,
} from "@/types/interfaces/common";

const BACKLOG_API_KEY = configs.BACKLOG_API_KEY;
const BACKLOG_BASE_URL = configs.BACKLOG_BASE_URL.replace(/\/+$/, "");
const BACKLOG_PROJECT_ID = configs.BACKLOG_PROJECT_ID;

/** Project ID dùng cho request: ưu tiên projectId truyền vào, fallback config. */
function getEffectiveProjectId(projectId?: string | null): string {
  const id =
    projectId != null && String(projectId).trim() !== ""
      ? String(projectId).trim()
      : BACKLOG_PROJECT_ID;
  return id;
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
 
  if (!categories || categories.length === 0) {
    return TaskType.Requirement;
  }

  const categoryName = categories[0]?.name;

  if (!categoryName) {
    return TaskType.Requirement;
  }

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
export const getBacklogIssueTypes = (
  projectId?: string | null
): Promise<BacklogIssueType[]> =>
  sendGet(
    `${BACKLOG_BASE_URL}/api/v2/projects/${getEffectiveProjectId(projectId)}/issueTypes`,
    { apiKey: BACKLOG_API_KEY }
  );

/**
 * Lấy issue type ID theo tên (case-insensitive).
 * @param typeName - Tên issue type cần tìm (vd: "Bug", "Gtask")
 * @returns Issue type ID hoặc null nếu không tìm thấy
 */
export const getBacklogIssueTypeIdByName = async (
  typeName: string,
  projectId?: string | null
): Promise<number | null> => {
  const types = await getBacklogIssueTypes(projectId);
  const foundType = types.find(
    (t) => t.name.toLowerCase().trim() === typeName.toLowerCase().trim()
  );
  return foundType?.id ?? null;
};

/**
 * Get list of categories in the project.
 * Returns list of Categories in the project from Backlog API.
 */
export const getBacklogCategories = (
  projectId?: string | null
): Promise<BacklogCategoryItem[]> =>
  sendGet(
    `${BACKLOG_BASE_URL}/api/v2/projects/${getEffectiveProjectId(projectId)}/categories`,
    { apiKey: BACKLOG_API_KEY }
  );

export const getBacklogStatuses = (
  projectId?: string | null
): Promise<BacklogStatus[]> =>
  sendGet(
    `${BACKLOG_BASE_URL}/api/v2/projects/${getEffectiveProjectId(projectId)}/statuses`,
    { apiKey: BACKLOG_API_KEY }
  );

export interface GetBacklogIssuesOptions {
  /** Backlog project ID (từ Settings). Nếu không truyền dùng config. */
  projectId?: string | null;
  /** Lọc theo loại issue (vd: Bug). Cần lấy id từ getBacklogIssueTypes. */
  issueTypeIds?: number[];
  /** Lọc theo category ID. Cần lấy id từ getBacklogCategories. */
  categoryIds?: number[];
  /** Lọc theo milestone (sprint) ID. Nếu không truyền hoặc mảng rỗng = tất cả. */
  milestoneIds?: number[];
  /** Lọc theo status ID (vd: Closed). Cần lấy id từ getBacklogStatuses. */
  statusIds?: number[];
  /** Số bản ghi tối đa mỗi request (mặc định 100, max 100). Nếu không set, sẽ fetch toàn bộ issues. */
  count?: number;
  /** Offset để paginate. Nếu không set và count không set, sẽ tự động fetch toàn bộ. */
  offset?: number;
  /** Nếu true, chỉ fetch một batch (dùng count và offset). Mặc định false - fetch toàn bộ. */
  singleBatch?: boolean;
  /**
   * Lọc theo quan hệ parent-child. 0=All, 1=Exclude Child, 2=Child only, 3=Neither Parent nor Child, 4=Parent only.
   * @see https://developer.nulab.com/docs/backlog/api/2/count-issue/
   */
  parentChild?: BacklogParentChildType;
}

/**
 * Fetch issues from Backlog
 * Mặc định sẽ tự động fetch toàn bộ issues bằng pagination.
 * @param options - issueTypeIds để filter; count/offset/singleBatch để control pagination
 */
export const getBacklogIssues = async (
  options?: GetBacklogIssuesOptions
): Promise<BacklogIssue[]> => {
  const {
    projectId,
    issueTypeIds,
    categoryIds,
    milestoneIds,
    statusIds,
    count,
    offset,
    singleBatch = false,
    parentChild,
  } = options || {};

  const effectiveProjectId = getEffectiveProjectId(projectId);

  const buildParams = (
    opts: { count: number; offset: number }
  ): Record<string, string | number | number[] | string[] | undefined> => {
    const params: Record<
      string,
      string | number | number[] | string[] | undefined
    > = {
      apiKey: BACKLOG_API_KEY,
      "projectId[]": [effectiveProjectId],
      count: opts.count,
      offset: opts.offset,
    };
    if (issueTypeIds && issueTypeIds.length > 0) {
      params["issueTypeId[]"] = issueTypeIds;
    }
    if (categoryIds && categoryIds.length > 0) {
      params["categoryId[]"] = categoryIds;
    }
    if (milestoneIds && milestoneIds.length > 0) {
      params["milestoneId[]"] = milestoneIds;
    }
    if (statusIds && statusIds.length > 0) {
      params["statusId[]"] = statusIds;
    }
    if (parentChild !== undefined) {
      params.parentChild = parentChild;
    }
    return params;
  };

  // Nếu singleBatch = true hoặc có offset/count được set rõ ràng, chỉ fetch một batch
  if (singleBatch || (count !== undefined && offset !== undefined)) {
    return sendGet(
      `${BACKLOG_BASE_URL}/api/v2/issues`,
      buildParams({ count: count ?? 100, offset: offset ?? 0 })
    );
  }

  // Fetch toàn bộ issues bằng pagination
  const allIssues: BacklogIssue[] = [];
  const batchSize = count ?? 100;
  let currentOffset = 0;
  let hasMore = true;

  while (hasMore) {
    const batch: BacklogIssue[] = await sendGet(
      `${BACKLOG_BASE_URL}/api/v2/issues`,
      buildParams({ count: batchSize, offset: currentOffset })
    );

    allIssues.push(...batch);

    if (batch.length < batchSize) {
      hasMore = false;
    } else {
      currentOffset += batchSize;
    }
  }

  return allIssues;
};

/**
 * Lấy danh sách issues theo tên issue type (generic function).
 * @param typeName - Tên issue type cần lấy (vd: "Bug", "Gtask", "Task")
 * @returns Danh sách issues của loại đó, hoặc [] nếu không tìm thấy issue type
 */
export const getBacklogIssuesByTypeName = async (
  typeName: string,
  projectId?: string | null
): Promise<BacklogIssue[]> => {
  const typeId = await getBacklogIssueTypeIdByName(typeName, projectId);
  if (!typeId) return [];
  return getBacklogIssues({ projectId, issueTypeIds: [typeId] });
};

/**
 * Lấy danh sách chỉ các Bug trong dự án.
 * Sử dụng getBacklogIssuesByTypeName với typeName "Bug".
 * Nếu dự án không có issue type tên "Bug" (không phân biệt hoa thường), trả về [].
 */
export const getBacklogBugs = async (
  projectId?: string | null
): Promise<BacklogIssue[]> => {
  return getBacklogIssuesByTypeName("Bug", projectId);
};

/**
 * Lấy danh sách chỉ các Gtask trong dự án.
 * Sử dụng getBacklogIssuesByTypeName với typeName "Gtask".
 * Nếu dự án không có issue type tên "Gtask" (không phân biệt hoa thường), trả về [].
 */
export const getBacklogGtasks = async (
  projectId?: string | null
): Promise<BacklogIssue[]> => {
  return getBacklogIssuesByTypeName("Gtask", projectId);
};

/**
 * Get list of project members (users) from Backlog
 * @param excludeGroupMembers - true to exclude members who are included via project groups/teams; false returns all members. Default: false
 * @returns Array of BacklogUser objects
 */
export const getBacklogProjectMembers = (
  excludeGroupMembers: boolean = false,
  projectId?: string | null
): Promise<BacklogUser[]> =>
  sendGet(
    `${BACKLOG_BASE_URL}/api/v2/projects/${getEffectiveProjectId(projectId)}/users`,
    {
      apiKey: BACKLOG_API_KEY,
      excludeGroupMembers,
    }
  );

/**
 * Get list of milestones (version/milestone) của dự án.
 * Endpoint: GET /api/v2/projects/:id/versions (Backlog dùng chung cho version/milestone).
 */
export const getBacklogMilestones = (
  projectId?: string | null
): Promise<BacklogMilestone[]> =>
  sendGet(
    `${BACKLOG_BASE_URL}/api/v2/projects/${getEffectiveProjectId(projectId)}/versions`,
    { apiKey: BACKLOG_API_KEY }
  );

export interface GetBacklogIssuesByMilestoneOptions {
  /** Backlog project ID (từ Settings). Nếu không truyền dùng config. */
  projectId?: string | null;
  /** ID các milestone cần lấy issues. Bắt buộc. */
  milestoneIds: number[];
  /** Chỉ lấy loại issue (vd: Bug). Lấy id từ getBacklogIssueTypes. */
  issueTypeIds?: number[];
  /** Số bản ghi tối đa (mặc định 100). */
  count?: number;
  /**
   * Lọc theo quan hệ parent-child. 0=All, 1=Exclude Child, 2=Child only, 3=Neither Parent nor Child, 4=Parent only.
   */
  parentChild?: BacklogParentChildType;
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
  const {
    projectId,
    milestoneIds,
    issueTypeIds,
    count = 100,
    parentChild,
  } = options;
  const params: Record<string, string | number | number[] | string[] | undefined> = {
    apiKey: BACKLOG_API_KEY,
    "projectId[]": [getEffectiveProjectId(projectId)],
    "milestoneId[]": milestoneIds,
    count,
  };
  if (issueTypeIds && issueTypeIds.length > 0) {
    params["issueTypeId[]"] = issueTypeIds;
  }
  if (parentChild !== undefined) {
    params.parentChild = parentChild;
  }
  return sendGet(`${BACKLOG_BASE_URL}/api/v2/issues`, params);
};

export interface GetBacklogIssuesCountOptions {
  /** Backlog project ID (từ Settings). Nếu không truyền dùng config. */
  projectId?: string | null;
  /** Lọc theo loại issue (vd: Bug). Cần lấy id từ getBacklogIssueTypes. */
  issueTypeIds?: number[];
  /** Lọc theo category ID. Cần lấy id từ getBacklogCategories. */
  categoryIds?: number[];
  /** Lọc theo milestone ID. */
  milestoneIds?: number[];
  /** Lọc theo status ID. */
  statusIds?: number[];
  /** Lọc theo priority ID. */
  priorityIds?: number[];
  /** Lọc theo assignee ID. */
  assigneeIds?: number[];
  /** Keyword search. */
  keyword?: string;
  /**
   * Lọc theo quan hệ parent-child. 0=All, 1=Exclude Child, 2=Child only, 3=Neither Parent nor Child, 4=Parent only.
   * @see https://developer.nulab.com/docs/backlog/api/2/count-issue/
   */
  parentChild?: BacklogParentChildType;
}

interface BacklogIssuesCountResponse {
  count: number;
}

/**
 * Đếm số lượng issues với các filter options.
 * Sử dụng API /api/v2/issues/count để đếm hiệu quả mà không cần fetch toàn bộ issues.
 * @param options - Các filter options để đếm issues
 * @returns Số lượng issues thỏa mãn các filter
 */
export const getBacklogIssuesCount = async (
  options?: GetBacklogIssuesCountOptions
): Promise<number> => {
  const projectId = getEffectiveProjectId(options?.projectId);
  const params: Record<string, string | number | number[] | string[] | undefined> = {
    apiKey: BACKLOG_API_KEY,
    "projectId[]": [projectId],
  };

  if (options?.issueTypeIds && options.issueTypeIds.length > 0) {
    params["issueTypeId[]"] = options.issueTypeIds;
  }
  if (options?.categoryIds && options.categoryIds.length > 0) {
    params["categoryId[]"] = options.categoryIds;
  }
  if (options?.milestoneIds && options.milestoneIds.length > 0) {
    params["milestoneId[]"] = options.milestoneIds;
  }
  if (options?.statusIds && options.statusIds.length > 0) {
    params["statusId[]"] = options.statusIds;
  }
  if (options?.priorityIds && options.priorityIds.length > 0) {
    params["priorityId[]"] = options.priorityIds;
  }
  if (options?.assigneeIds && options.assigneeIds.length > 0) {
    params["assigneeId[]"] = options.assigneeIds;
  }
  if (options?.keyword) {
    params.keyword = options.keyword;
  }
  if (options?.parentChild !== undefined) {
    params.parentChild = options.parentChild;
  }

  const response = (await sendGet(
    `${BACKLOG_BASE_URL}/api/v2/issues/count`,
    params
  )) as BacklogIssuesCountResponse;

  return response.count;
};

export interface GetBacklogIssuesCountByCategoryOptions {
  /** Backlog project ID (từ Settings). Nếu không truyền dùng config. */
  projectId?: string | null;
  /** Lọc theo milestone (sprint) ID. Nếu không truyền hoặc mảng rỗng = tất cả. */
  milestoneIds?: number[];
  /** Lọc parent-child (vd: ExcludeChild để chỉ đếm Gtask + task không có con). */
  parentChild?: BacklogParentChildType;
  /** Lọc theo issue type ID (vd: Task, Gtask). */
  issueTypeIds?: number[];
}

/**
 * Đếm số lượng issues theo categoryId.
 * Sử dụng Count API để đếm hiệu quả.
 * @param categoryId - Category ID cần đếm
 * @param options - milestoneIds để lọc theo sprint
 * @returns Số lượng issues thuộc category đó
 */
export const getBacklogIssuesCountByCategory = async (
  categoryId: number,
  options?: GetBacklogIssuesCountByCategoryOptions
): Promise<number> => {
  return getBacklogIssuesCount({
    projectId: options?.projectId,
    categoryIds: [categoryId],
    milestoneIds: options?.milestoneIds,
    parentChild: options?.parentChild,
    issueTypeIds: options?.issueTypeIds,
  });
};
