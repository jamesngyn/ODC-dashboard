import { QUERY_KEYS } from "@/constants/common";
import configs from "@/constants/config";
import { useQuery } from "@tanstack/react-query";

import { BacklogUser, getBacklogProjectMembers } from "@/lib/api/backlog";

export const useBacklogProjectMembers = (
  excludeGroupMembers: boolean = false
) => {
  const {
    data: members,
    isLoading,
    isError,
    error,
  } = useQuery<BacklogUser[]>({
    queryKey: QUERY_KEYS.BACKLOG.PROJECT_MEMBERS(configs.BACKLOG_PROJECT_ID),
    queryFn: () => getBacklogProjectMembers(excludeGroupMembers),
  });

  return {
    members,
    isLoading,
    isError,
    error,
  };
};
