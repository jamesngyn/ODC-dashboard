import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";

import { getBacklogCategories } from "@/lib/api/backlog";
import { BacklogCategoryItem } from "@/types/interfaces/common";
import { useBacklogProjectId } from "./useBacklogProjectId";

export const useBacklogCategories = () => {
  const { backlogProjectId } = useBacklogProjectId();

  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = useQuery<BacklogCategoryItem[]>({
    queryKey: [QUERY_KEYS.BACKLOG.CATEGORIES, backlogProjectId ?? "config"],
    queryFn: () => getBacklogCategories(backlogProjectId),
  });

  return {
    categories: categories ?? [],
    isLoading,
    isError,
    error,
  };
};
