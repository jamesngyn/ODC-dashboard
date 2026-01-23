"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { KeyInsightItem } from "@/types/interfaces/velocity";

const iconMap: Record<
  KeyInsightItem["type"],
  React.ComponentType<{ className?: string }>
> = {
  success: TrendingUp,
  info: CheckCircle2,
  warning: AlertTriangle,
};

const iconColorMap: Record<KeyInsightItem["type"], string> = {
  success: "text-green-500",
  info: "text-blue-500",
  warning: "text-yellow-500",
};

interface KeyInsightsCardProps {
  data: KeyInsightItem[];
}

export function KeyInsightsCard({ data }: KeyInsightsCardProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {t("velocity.keyInsights")} ({t("velocity.keyInsightsSubtitle")})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {data.map((item) => {
            const Icon = iconMap[item.type];
            const colorClass = iconColorMap[item.type];
            return (
              <li key={item.id} className="flex items-start gap-2">
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
