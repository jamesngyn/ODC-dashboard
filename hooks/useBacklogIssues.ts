import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getBacklogIssues, getBacklogIssueTypeIdByName } from "@/lib/api/backlog";
import { BacklogIssue } from "@/types/interfaces/common";
import { useBacklogIssueTypes } from "./useBacklogIssueTypes";

export interface UseBacklogIssuesOptions {
  /** Lọc theo issue type IDs. Nếu có cả issueTypeName và issueTypeIds, ưu tiên issueTypeIds. */
  issueTypeIds?: number[];
  /** Lọc theo tên issue type (vd: "Bug", "Gtask"). Sẽ tự động resolve thành issueTypeIds. */
  issueTypeName?: string;
  /** Lọc theo milestone (sprint) ID. Không truyền hoặc mảng rỗng = tất cả. */
  milestoneIds?: number[];
  count?: number;
  enabled?: boolean;
}

export const useBacklogIssues = (options?: UseBacklogIssuesOptions) => {
  const {
    issueTypeIds: providedIssueTypeIds,
    issueTypeName,
    milestoneIds,
    count = 100,
    enabled = true,
  } = options ?? {};

  const { issueTypes, isLoading: isLoadingTypes } = useBacklogIssueTypes();

  // Resolve issueTypeName thành issueTypeIds nếu có
  const resolvedIssueTypeIds = useMemo(() => {
    // Nếu đã có issueTypeIds, dùng luôn
    if (providedIssueTypeIds) return providedIssueTypeIds;

    // Nếu có issueTypeName, tìm ID từ issueTypes
    if (issueTypeName && issueTypes.length > 0) {
      const foundType = issueTypes.find(
        (t) => t.name.toLowerCase().trim() === issueTypeName.toLowerCase().trim()
      );
      return foundType ? [foundType.id] : undefined;
    }

    return undefined;
  }, [providedIssueTypeIds, issueTypeName, issueTypes]);

  const queryKey = [
    QUERY_KEYS.BACKLOG.ISSUES,
    resolvedIssueTypeIds?.length
      ? [...resolvedIssueTypeIds].sort((a, b) => a - b).join(",")
      : issueTypeName ?? "all",
    milestoneIds?.length
      ? [...milestoneIds].sort((a, b) => a - b).join(",")
      : "all",
  ] as const;

  const {
    data: issues,
    isLoading: isLoadingIssues,
    isError,
    error,
  } = useQuery<BacklogIssue[]>({
    queryKey,
    queryFn: () =>
      getBacklogIssues({
        issueTypeIds: resolvedIssueTypeIds,
        milestoneIds: milestoneIds?.length ? milestoneIds : undefined,
        count,
      }),
    enabled: enabled && (resolvedIssueTypeIds !== undefined || !issueTypeName),
  });

  return {
    issues,
    isLoading: isLoadingTypes || isLoadingIssues,
    isError,
    error,
  };
};
