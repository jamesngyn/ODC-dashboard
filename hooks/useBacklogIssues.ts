import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";

import { BacklogIssue, getBacklogIssues } from "@/lib/api/backlog";

export interface UseBacklogIssuesOptions {
  issueTypeIds?: number[];
  count?: number;
  enabled?: boolean;
}

export const useBacklogIssues = (options?: UseBacklogIssuesOptions) => {
  const { issueTypeIds, count = 100, enabled = true } = options ?? {};
  const queryKey = [
    QUERY_KEYS.BACKLOG.ISSUES,
    issueTypeIds?.length
      ? [...issueTypeIds].sort((a, b) => a - b).join(",")
      : "all",
  ] as const;

  const {
    data: issues,
    isLoading,
    isError,
    error,
  } = useQuery<BacklogIssue[]>({
    queryKey,
    queryFn: () => getBacklogIssues({ issueTypeIds, count }),
    enabled,
  });

  return {
    issues,
    isLoading,
    isError,
    error,
  };
};
