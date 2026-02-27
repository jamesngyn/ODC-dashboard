import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";

import { getBacklogProjectMembers } from "@/lib/api/backlog";
import { BacklogUser } from "@/types/interfaces/common";
import { useBacklogProjectId } from "./useBacklogProjectId";

export const useBacklogProjectMembers = (
  excludeGroupMembers: boolean = false
) => {
  const { backlogProjectId } = useBacklogProjectId();

  const {
    data: members,
    isLoading,
    isError,
    error,
  } = useQuery<BacklogUser[]>({
    queryKey: QUERY_KEYS.BACKLOG.PROJECT_MEMBERS(
      backlogProjectId ?? "config"
    ),
    queryFn: () =>
      getBacklogProjectMembers(excludeGroupMembers, backlogProjectId),
  });

  return {
    members,
    isLoading,
    isError,
    error,
  };
};
