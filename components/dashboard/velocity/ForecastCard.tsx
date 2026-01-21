"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import type { ForecastData } from "@/types/interfaces/velocity";

interface ForecastCardProps {
  data: ForecastData;
}

export function ForecastCard({ data }: ForecastCardProps) {
  const progressPercent = 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Forecast (Nghiên cứu sau)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Remaining Work</span>
            <span className="font-medium">{data.remainingWork} SP</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        <div>
          <div className="font-medium">~{data.sprintsNeeded} sprints</div>
          <p className="text-xs text-muted-foreground">
            Based on avg velocity ({data.avgVelocityPerSprint} SP/sprint)
          </p>
        </div>
        <div>
          <div className="font-medium">{data.predictedCompletion}</div>
          <p className="text-xs text-muted-foreground">95% confidence interval</p>
        </div>
      </CardContent>
    </Card>
  );
}
