import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";

import {
  BacklogIssueType,
  getBacklogIssueTypes,
} from "@/lib/api/backlog";

export const useBacklogIssueTypes = () => {
  const {
    data: issueTypes,
    isLoading,
    isError,
    error,
  } = useQuery<BacklogIssueType[]>({
    queryKey: [QUERY_KEYS.BACKLOG.ISSUE_TYPES],
    queryFn: getBacklogIssueTypes,
  });

  return {
    issueTypes: issueTypes ?? [],
    isLoading,
    isError,
    error,
  };
};
