import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";

import { getBacklogMilestones } from "@/lib/api/backlog";
import { BacklogMilestone } from "@/types/interfaces/common";

export const useBacklogMilestones = (options?: { enabled?: boolean }) => {
  const { enabled = true } = options ?? {};

  const { data: milestones, isLoading, isError, error } = useQuery<BacklogMilestone[]>({
    queryKey: QUERY_KEYS.BACKLOG.MILESTONES,
    queryFn: getBacklogMilestones,
    enabled,
  });

  return {
    milestones: milestones ?? [],
    isLoading,
    isError,
    error,
  };
};
