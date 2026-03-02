"use client";

import { TaskType } from "@/types/enums/common";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SummaryListProps {
  data: {
    status: TaskType;
    categoryName?: string;
    count: number;
    percentage: number;
  }[];
}

const BAR_COLORS: Record<TaskType, string> = {
  [TaskType.Requirement]: "bg-[#22C55E]",
  [TaskType.Development]: "bg-[#5C9DFF]",
  [TaskType.Testing]: "bg-[#F97316]",
  [TaskType.UAT]: "bg-[#A687FF]",
  [TaskType.Release]: "bg-[#9333EA]",
};

const DOT_COLORS: Record<TaskType, string> = {
  [TaskType.Requirement]: "bg-[#22C55E]",
  [TaskType.Development]: "bg-[#5C9DFF]",
  [TaskType.Testing]: "bg-[#F97316]",
  [TaskType.UAT]: "bg-[#A687FF]",
  [TaskType.Release]: "bg-[#9333EA]",
};

export const SummaryList = ({ data }: SummaryListProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {t("progressOverview.statusBreakdown")}
      </h3>
      <div className="mt-4 flex flex-col">
        {data.map((item, index) => (
          <div
            key={item.status}
            className={cn(
              "flex items-center gap-3 py-3",
              index < data.length - 1 && "border-b border-zinc-100 dark:border-zinc-800"
            )}
          >
            <div className="flex min-w-0 shrink-0 items-center gap-2 sm:min-w-[120px]">
              <div
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  DOT_COLORS[item.status]
                )}
              />
              <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {item.categoryName || item.status}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width]",
                    BAR_COLORS[item.status]
                  )}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {item.count}
              </span>
              <span className="w-9 text-right text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
