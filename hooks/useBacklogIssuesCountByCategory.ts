import { useQueries } from "@tanstack/react-query";

import { getBacklogIssuesCountByCategory } from "@/lib/api/backlog";
import { QUERY_KEYS } from "@/constants/common";
import { BacklogCategoryItem } from "@/types/interfaces/common";

export interface UseBacklogIssuesCountByCategoriesOptions {
  categories: BacklogCategoryItem[];
  /** Lọc theo milestone (sprint) ID. Không truyền hoặc mảng rỗng = tất cả. */
  milestoneIds?: number[];
  enabled?: boolean;
}

export interface CategoryCount {
  category: BacklogCategoryItem;
  count: number;
}

export const useBacklogIssuesCountByCategories = (
  options: UseBacklogIssuesCountByCategoriesOptions
) => {
  const { categories, milestoneIds, enabled = true } = options;

  const queries = useQueries({
    queries: categories.map((category) => ({
      queryKey: [
        QUERY_KEYS.BACKLOG.ISSUES,
        "count",
        "category",
        category.id,
        milestoneIds?.length
          ? [...milestoneIds].sort((a, b) => a - b).join(",")
          : "all",
      ] as const,
      queryFn: () =>
        getBacklogIssuesCountByCategory(category.id, {
          milestoneIds: milestoneIds?.length ? milestoneIds : undefined,
        }),
      enabled: enabled && category.id > 0,
    })),
  });

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const errors = queries
    .map((query, index) => (query.error ? { category: categories[index], error: query.error } : null))
    .filter((item): item is { category: BacklogCategoryItem; error: Error } => item !== null);

  const categoryCounts: CategoryCount[] = queries.map((query, index) => ({
    category: categories[index],
    count: query.data ?? 0,
  }));

  return {
    categoryCounts,
    isLoading,
    isError,
    errors,
  };
};
