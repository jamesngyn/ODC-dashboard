import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";

import { getBacklogIssueTypes } from "@/lib/api/backlog";
import { BacklogIssueType } from "@/types/interfaces/common";
import { useBacklogProjectId } from "./useBacklogProjectId";

export const useBacklogIssueTypes = () => {
  const { backlogProjectId } = useBacklogProjectId();

  const {
    data: issueTypes,
    isLoading,
    isError,
    error,
  } = useQuery<BacklogIssueType[]>({
    queryKey: [QUERY_KEYS.BACKLOG.ISSUE_TYPES, backlogProjectId ?? "config"],
    queryFn: () => getBacklogIssueTypes(backlogProjectId),
  });

  return {
    issueTypes: issueTypes ?? [],
    isLoading,
    isError,
    error,
  };
};
