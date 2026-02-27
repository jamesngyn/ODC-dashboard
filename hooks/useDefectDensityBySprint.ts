import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";

import { fetchDefectDensityBySprint } from "@/lib/quality-kpi";
import type { DefectDensityPoint } from "@/types/interfaces/quality-kpi";
import { useBacklogProjectId } from "./useBacklogProjectId";

export const useDefectDensityBySprint = () => {
  const { backlogProjectId } = useBacklogProjectId();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<DefectDensityPoint[]>({
    queryKey: [
      ...QUERY_KEYS.BACKLOG.DEFECT_DENSITY_BY_SPRINT,
      backlogProjectId ?? "config",
    ],
    queryFn: () => fetchDefectDensityBySprint(backlogProjectId),
  });

  return {
    data: data ?? [],
    isLoading,
    isError,
    error,
  };
};
