import { QUERY_KEYS } from "@/constants/common";
import configs from "@/constants/config";
import { useQuery } from "@tanstack/react-query";

import { getBacklogProjectMembers } from "@/lib/api/backlog";
import { BacklogUser } from "@/types/interfaces/common";

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
