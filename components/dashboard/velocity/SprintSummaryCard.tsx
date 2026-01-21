"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { SprintSummaryData } from "@/types/interfaces/velocity";

interface SprintSummaryCardProps {
  data: SprintSummaryData | null;
}

export function SprintSummaryCard({ data }: SprintSummaryCardProps) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Sprint Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Current Sprint</span>
          <span className="font-medium">{data.currentSprint}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium">{data.duration}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Committed</span>
          <span className="font-medium text-foreground">{data.committed} SP</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Completed</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            {data.completed} SP
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Completion</span>
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
