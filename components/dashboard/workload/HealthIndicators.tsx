"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface HealthStatus {
  categoryKey: string;
  statusKey: string;
  color: string;
}

const HEALTH_DATA: HealthStatus[] = [
  { categoryKey: "workload.schedule", statusKey: "workload.onTrack", color: "text-green-500" },
  { categoryKey: "workload.budget", statusKey: "workload.underBudget", color: "text-cyan-500" },
  { categoryKey: "workload.quality", statusKey: "workload.meetingTarget", color: "text-green-500" },
  { categoryKey: "workload.scope", statusKey: "workload.controlled", color: "text-cyan-500" },
];

export function HealthIndicators() {
  const { t } = useTranslation();
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          {t("workload.healthIndicators")} ({t("workload.healthIndicatorsSubtitle")})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {HEALTH_DATA.map((item) => (
            <div
              key={item.categoryKey}
              className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0"
            >
              <span className="text-muted-foreground font-medium">
                {t(item.categoryKey)}
              </span>
              <span className={`font-semibold ${item.color}`}>
                {t(item.statusKey)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
