"use client";

import { TaskType } from "@/types/enums/common";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SummaryListProps {
  data: {
    status: TaskType;
    categoryName?: string; // Category name từ Backlog để hiển thị
    count: number;
    percentage: number;
  }[];
}

const COLORS: Record<TaskType, string> = {
  [TaskType.Requirement]: "bg-[#4FD2A8]",
  [TaskType.Development]: "bg-[#5C9DFF]",
  [TaskType.Testing]: "bg-[#FFC738]",
  [TaskType.UAT]: "bg-[#A687FF]",
  [TaskType.Release]: "bg-[#2BC48A]",
};

export const SummaryList = ({ data }: SummaryListProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-foreground text-lg font-semibold">
        {t("progressOverview.statusBreakdown")}
      </h3>
      <div className="flex flex-col gap-3">
        {data.map((item) => (
          <div
            key={item.status}
            className="hover:bg-muted/50 flex items-center justify-between rounded-lg p-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-3 w-3 rounded-full shadow-sm",
                  COLORS[item.status]
                )}
              />
              <span className="text-foreground text-sm font-medium">
                {item.categoryName || item.status}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-foreground text-sm font-bold">
                {item.count}
              </span>
              <span className="text-muted-foreground w-8 text-right text-xs">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
