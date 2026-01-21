import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/common";
import { fetchVelocityBySprint } from "@/lib/velocity";
import type { VelocityBySprintPoint } from "@/types/interfaces/velocity";

export function useVelocityBySprint() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<VelocityBySprintPoint[]>({
    queryKey: QUERY_KEYS.BACKLOG.VELOCITY_BY_SPRINT,
    queryFn: fetchVelocityBySprint,
  });

  return {
    data: data ?? [],
    isLoading,
    isError,
    error,
  };
}
