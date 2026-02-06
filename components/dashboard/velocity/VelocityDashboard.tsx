"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { CommonSelect } from "@/components/ui/common-select";
import { useVelocityBySprint } from "@/hooks/useVelocityBySprint";
import {
  buildBurndownFromSprint,
  buildForecast,
  buildKeyInsights,
  buildSprintSummaryForSprint,
} from "@/lib/velocity";
import { useTranslation } from "react-i18next";

import { ForecastCard } from "./ForecastCard";
import { KeyInsightsCard } from "./KeyInsightsCard";
import { SprintBurndownChart } from "./SprintBurndownChart";
import { SprintSummaryCard } from "./SprintSummaryCard";
import { SprintVelocityTrendChart } from "./SprintVelocityTrendChart";

const REMAINING_WORK_DEFAULT = 160;

export function VelocityDashboard() {
  const { t } = useTranslation();
  const [selectedSprint, setSelectedSprint] = useState<string>("");
  const { data, dataHours, dataUSP, isLoading, isError } = useVelocityBySprint();

  const sprintOptions = useMemo(
    () => data.map((d) => ({ value: d.sprint, label: d.sprint })),
    [data]
  );
  const effectiveSprint = useMemo(
    () =>
      data.length > 0
        ? selectedSprint || data[data.length - 1].sprint
        : null,
    [data, selectedSprint]
  );
  const sprintSummary = useMemo(
    () =>
      effectiveSprint
        ? buildSprintSummaryForSprint(data, effectiveSprint)
        : null,
    [data, effectiveSprint]
  );

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

  const sprintSelectValue =
    effectiveSprint ?? (sprintOptions[0]?.value ?? "");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <CommonSelect
          id="velocity-sprint-select"
          value={sprintSelectValue}
          onValueChange={setSelectedSprint}
          options={sprintOptions}
          label={t("progressOverview.filterBySprint")}
          triggerClassName="w-[180px]"
        />
      </div>

      {/* Top: Chart 1 Hours + Chart 2 USP + Sprint Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <div className="rounded-xl border border-gray-200 bg-card p-4 text-card-foreground">
            <h2 className="mb-4 text-sm font-medium">
              {t("velocity.hoursEstimateBySprint")}
            </h2>
            <SprintVelocityTrendChart data={dataHours} />
          </div>
        </div>
        <div>
          <div className="rounded-xl border border-gray-200 bg-card p-4 text-card-foreground">
            <h2 className="mb-4 text-sm font-medium">
              {t("velocity.uspEstimateBySprint")}
            </h2>
            <SprintVelocityTrendChart data={dataUSP} />
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
