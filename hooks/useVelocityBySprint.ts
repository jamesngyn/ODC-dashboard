import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/common";
import { fetchVelocityBySprint } from "@/lib/velocity";
import type {
  VelocityBySprintPoint,
  VelocityBySprintResult,
} from "@/types/interfaces/velocity";

const emptyResult: VelocityBySprintResult = { hours: [], usp: [] };

export function useVelocityBySprint() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<VelocityBySprintResult>({
    queryKey: QUERY_KEYS.BACKLOG.VELOCITY_BY_SPRINT,
    queryFn: fetchVelocityBySprint,
  });

  const result = data ?? emptyResult;

  return {
    /** USP (point) by sprint – dùng cho summary, forecast, insights. */
    data: result.usp,
    /** Hours estimate by sprint – chart 1. */
    dataHours: result.hours,
    /** USP (point) by sprint – chart 2. */
    dataUSP: result.usp,
    isLoading,
    isError,
    error,
  };
}
