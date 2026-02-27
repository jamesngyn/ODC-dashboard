import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";

import { getBacklogIssuesCount } from "@/lib/api/backlog";
import { useBacklogProjectId } from "./useBacklogProjectId";

export interface UseBacklogIssuesCountOptions {
  /** Lọc theo issue type IDs (vd: Bug). */
  issueTypeIds?: number[];
  /** Lọc theo milestone IDs. */
  milestoneIds?: number[];
  enabled?: boolean;
}

export const useBacklogIssuesCount = (options?: UseBacklogIssuesCountOptions) => {
  const {
    issueTypeIds,
    milestoneIds,
    enabled = true,
  } = options ?? {};

  const { backlogProjectId } = useBacklogProjectId();

  const queryKey = [
    QUERY_KEYS.BACKLOG.ISSUES_COUNT,
    backlogProjectId ?? "config",
    issueTypeIds?.length
      ? [...issueTypeIds].sort((a, b) => a - b).join(",")
      : "all",
    milestoneIds?.length
      ? [...milestoneIds].sort((a, b) => a - b).join(",")
      : "all",
  ] as const;

  const { data: count, isLoading, isError, error } = useQuery<number>({
    queryKey,
    queryFn: () =>
      getBacklogIssuesCount({
        projectId: backlogProjectId,
        issueTypeIds: issueTypeIds?.length ? issueTypeIds : undefined,
        milestoneIds: milestoneIds?.length ? milestoneIds : undefined,
      }),
    enabled,
  });

  return {
    count: count ?? 0,
    isLoading,
    isError,
    error,
  };
};
