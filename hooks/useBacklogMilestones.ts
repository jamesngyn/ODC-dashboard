import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";

import { getBacklogMilestones } from "@/lib/api/backlog";
import { BacklogMilestone } from "@/types/interfaces/common";
import { useBacklogProjectId } from "./useBacklogProjectId";

export const useBacklogMilestones = (options?: { enabled?: boolean }) => {
  const { enabled = true } = options ?? {};
  const { backlogProjectId } = useBacklogProjectId();

  const { data: milestones, isLoading, isError, error } = useQuery<BacklogMilestone[]>({
    queryKey: [...QUERY_KEYS.BACKLOG.MILESTONES, backlogProjectId ?? "config"],
    queryFn: () => getBacklogMilestones(backlogProjectId),
    enabled,
  });

  return {
    milestones: milestones ?? [],
    isLoading,
    isError,
    error,
  };
};
