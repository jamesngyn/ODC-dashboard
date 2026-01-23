"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

import type { SprintSummaryData } from "@/types/interfaces/velocity";

interface SprintSummaryCardProps {
  data: SprintSummaryData | null;
}

export function SprintSummaryCard({ data }: SprintSummaryCardProps) {
  const { t } = useTranslation();
  if (!data) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{t("velocity.sprintSummary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("velocity.currentSprint")}</span>
          <span className="font-medium">{data.currentSprint}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("velocity.duration")}</span>
          <span className="font-medium">{data.duration}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("velocity.committed")}</span>
          <span className="font-medium text-foreground">{data.committed} {t("velocity.storyPoints")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("velocity.completed")}</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            {data.completed} {t("velocity.storyPoints")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("velocity.completion")}</span>
          <span
            className={`font-medium ${
              data.completionPercent >= 100
                ? "text-green-600 dark:text-green-400"
                : "text-foreground"
            }`}
          >
            {data.completionPercent}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
