"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

import type { ForecastData } from "@/types/interfaces/velocity";

interface ForecastCardProps {
  data: ForecastData;
}

export function ForecastCard({ data }: ForecastCardProps) {
  const { t } = useTranslation();
  const progressPercent = 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {t("velocity.forecast")} ({t("velocity.forecastSubtitle")})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">{t("velocity.remainingWork")}</span>
            <span className="font-medium">{data.remainingWork} {t("velocity.storyPoints")}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        <div>
          <div className="font-medium">{t("velocity.sprintsNeeded", { count: data.sprintsNeeded })}</div>
          <p className="text-xs text-muted-foreground">
            {t("velocity.basedOnAvgVelocity", { avgVelocity: data.avgVelocityPerSprint })}
          </p>
        </div>
        <div>
          <div className="font-medium">{data.predictedCompletion}</div>
          <p className="text-xs text-muted-foreground">{t("velocity.confidenceInterval")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
