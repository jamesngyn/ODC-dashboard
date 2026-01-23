"use client";

import { AlertTriangle, CheckCircle2, Users } from "lucide-react";

import type { PerformanceIndicator } from "@/types/interfaces/customer-value";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface PerformanceIndicatorsProps {
  indicators: PerformanceIndicator[];
}

const indicatorConfig = {
  high: {
    icon: CheckCircle2,
    borderColor: "border-green-500",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  under: {
    icon: AlertTriangle,
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-500/10",
    iconColor: "text-yellow-500",
  },
  optimal: {
    icon: Users,
    borderColor: "border-blue-500",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
} as const;

export function PerformanceIndicators({
  indicators,
}: PerformanceIndicatorsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {indicators.map((indicator) => {
        const config = indicatorConfig[indicator.type];
        const Icon = config.icon;

        return (
          <Card
            key={indicator.type}
            className={cn("border-2", config.borderColor, config.bgColor)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Icon
                  className={cn("h-6 w-6 flex-shrink-0", config.iconColor)}
                />
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold">{indicator.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {indicator.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
