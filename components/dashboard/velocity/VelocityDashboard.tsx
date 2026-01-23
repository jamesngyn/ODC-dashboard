"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import { useVelocityBySprint } from "@/hooks/useVelocityBySprint";
import {
  buildBurndownFromSprint,
  buildForecast,
  buildKeyInsights,
  buildSprintSummary,
} from "@/lib/velocity";


import { ForecastCard } from "./ForecastCard";
import { KeyInsightsCard } from "./KeyInsightsCard";
import { SprintBurndownChart } from "./SprintBurndownChart";
import { SprintSummaryCard } from "./SprintSummaryCard";
import { SprintVelocityTrendChart } from "./SprintVelocityTrendChart";
import { useTranslation } from "react-i18next";

const REMAINING_WORK_DEFAULT = 160;

export function VelocityDashboard() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useVelocityBySprint();

  const sprintSummary = useMemo(() => buildSprintSummary(data), [data]);

  const burndownData = useMemo(() => {
    if (!sprintSummary) return [];
    return buildBurndownFromSprint(
      sprintSummary.committed,
      sprintSummary.completed,
      10
    );
  }, [sprintSummary]);

  const forecastData = useMemo(
    () => buildForecast(data, REMAINING_WORK_DEFAULT),
    [data]
  );

  const keyInsights = useMemo(() => buildKeyInsights(data), [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground text-sm">
          {t("velocity.errorLoadingData")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
     

      {/* Top: Velocity Trend + Sprint Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-card p-4 text-card-foreground">
            <h2 className="mb-4 text-sm font-medium">
              {t("velocity.sprintVelocityTrend")}
            </h2>
            <SprintVelocityTrendChart data={data} />
          </div>
        </div>
        <div>
          <SprintSummaryCard data={sprintSummary} />
        </div>
      </div>

      {/* Bottom: Burndown + Forecast + Key Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <div className="rounded-xl border border-gray-200 bg-card p-4 text-card-foreground">
            <h2 className="mb-4 text-sm font-medium">
              {t("velocity.sprintBurndown")}
            </h2>
            <SprintBurndownChart data={burndownData} />
          </div>
        </div>
        <div>
          <ForecastCard data={forecastData} />
        </div>
        <div>
          <KeyInsightsCard data={keyInsights} />
        </div>
      </div>
    </div>
  );
}
