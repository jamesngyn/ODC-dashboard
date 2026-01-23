import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";

import { getBacklogCategories } from "@/lib/api/backlog";
import { BacklogCategoryItem } from "@/types/interfaces/common";

export const useBacklogCategories = () => {
  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = useQuery<BacklogCategoryItem[]>({
    queryKey: [QUERY_KEYS.BACKLOG.CATEGORIES],
    queryFn: getBacklogCategories,
  });

  return {
    categories: categories ?? [],
    isLoading,
    isError,
    error,
  };
};
