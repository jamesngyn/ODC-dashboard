"use client";

import { AlertTriangle, CheckCircle2, Users } from "lucide-react";

import type { PerformanceIndicator } from "@/types/interfaces/customer-value";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {indicators.map((indicator) => {
        const config = indicatorConfig[indicator.type];
        const Icon = config.icon;

        const getTitle = () => {
          if (indicator.type === "high") return "High Performance";
          if (indicator.type === "under") return "Under Performance";
          return "Optimal Performance";
        };

        const getDescription = () => {
          if (indicator.type === "high")
            return `${indicator.count} members earned value> 100%..`;
          if (indicator.type === "under")
            return `${indicator.count} members below 90%. Consider reassigning tasks.`;
          return `${indicator.count} members within target range (90-100%).`;
        };

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
                  <h3 className="mb-2 text-lg font-bold">{getTitle()}</h3>
                  <p className="text-muted-foreground text-sm">
                    {getDescription()}
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
