"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { QualityMetricCardData } from "@/types/interfaces/quality-kpi";

const valueColorClass: Record<QualityMetricCardData["valueColor"], string> = {
  green: "text-green-500",
  blue: "text-blue-500",
  purple: "text-purple-500",
};

interface QualityMetricCardProps {
  data: QualityMetricCardData;
  className?: string;
}

export function QualityMetricCard({ data, className }: QualityMetricCardProps) {
  const colorClass = valueColorClass[data.valueColor];

  return (
    <Card
      className={cn(
        "bg-card text-card-foreground border-border border-gray-200",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", colorClass)}>
          {data.value}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{data.subLabel}</p>
        <p className={cn("text-xs font-medium mt-2", colorClass)}>
          {data.target}
        </p>
      </CardContent>
    </Card>
  );
}
