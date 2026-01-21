import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";

import { fetchDefectDensityBySprint } from "@/lib/quality-kpi";
import type { DefectDensityPoint } from "@/types/interfaces/quality-kpi";

export const useDefectDensityBySprint = () => {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<DefectDensityPoint[]>({
    queryKey: [QUERY_KEYS.BACKLOG.DEFECT_DENSITY_BY_SPRINT],
    queryFn: fetchDefectDensityBySprint,
  });

  return {
    data: data ?? [],
    isLoading,
    isError,
    error,
  };
};
