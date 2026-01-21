"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

import type { QualityInsightItem } from "@/types/interfaces/quality-kpi";

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

const iconColorMap = {
  success: "text-green-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

interface QualityInsightsCardProps {
  data: QualityInsightItem[];
}

export function QualityInsightsCard({ data }: QualityInsightsCardProps) {
  return (
    <Card className="bg-card text-card-foreground border-border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Quality Insights (Nghiên cứu sau)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {data.map((item, index) => {
            const Icon = iconMap[item.type];
            const colorClass = iconColorMap[item.type];
            return (
              <li key={index} className="flex items-start gap-2">
                <Icon
                  className={`h-4 w-4 shrink-0 mt-0.5 ${colorClass}`}
                  aria-hidden
                />
                <span className="text-sm text-muted-foreground">{item.text}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
