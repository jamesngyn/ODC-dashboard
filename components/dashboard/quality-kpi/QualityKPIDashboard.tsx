"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  calculateDefectDensity,
  calculateDefectLeakage,
  computeDefectTrendsByWeek,
  getBugTypeFromIssue,
  getSeverityCountsFromAllBugs,
  getSeverityCountsFromBugs,
  getSeverityCountsFromLeakageBugs,
} from "@/lib/quality-kpi";
import { calculateTotalActualHours } from "@/lib/utils";
import type {
  QualityMetricCardData,
  TestingCoverageItem,
  QualityInsightItem,
} from "@/types/interfaces/quality-kpi";

import { DefectDensityChart } from "./DefectDensityChart";
import { DefectTrendsByPhaseChart } from "./DefectTrendsByPhaseChart";
import { QualityMetricCard } from "./QualityMetricCard";
import { SeverityBreakdownCard } from "./SeverityBreakdownCard";
import { TestingCoverageCard } from "./TestingCoverageCard";
import { QualityInsightsCard } from "./QualityInsightsCard";
import { useDefectDensityBySprint } from "@/hooks/useDefectDensityBySprint";
import { useBacklogIssueTypes } from "@/hooks/useBacklogIssueTypes";
import { useBacklogIssues } from "@/hooks/useBacklogIssues";
import { Loader2 } from "lucide-react";

const testingCoverageData: TestingCoverageItem[] = [
  { label: "Unit Testing", value: 94, barColor: "#14b8a6" },
  { label: "Integration", value: 87, barColor: "#3b82f6" },
  { label: "System Testing", value: 76, barColor: "#f97316" },
];

const qualityInsightsData: QualityInsightItem[] = [
  { type: "success", text: "Defect density improved 15% from last sprint" },
  { type: "success", text: "Leakage rate within acceptable threshold" },
  { type: "warning", text: "System testing needs improvement" },
  { type: "info", text: "Critical defects require immediate attention" },
];

export function QualityKPIDashboard() {
  const {
    issueTypes,
    isLoading: isLoadingTypes,
    isError: isErrorTypes,
  } = useBacklogIssueTypes();
  const bugId = issueTypes.find((t) => t.name.toLowerCase().trim() === "bug")
    ?.id;
  const {
    issues,
    isLoading: isLoadingIssues,
    isError: isErrorIssues,
  } = useBacklogIssues({
    issueTypeIds: bugId != null ? [bugId] : undefined,
    enabled: bugId != null,
  });
  const isLoading = isLoadingTypes || isLoadingIssues;
  const isError = isErrorTypes || isErrorIssues;

  const {
    data: defectDensityData,
    isLoading: isLoadingDefectDensity,
  } = useDefectDensityBySprint();


  const severityData = useMemo(
    () => getSeverityCountsFromBugs(issues),
    [issues]
  );
  const severityDataAll = useMemo(
    () => getSeverityCountsFromAllBugs(issues),
    [issues]
  );
  const severityDataLeakage = useMemo(
    () => getSeverityCountsFromLeakageBugs(issues),
    [issues]
  );

  const totalActualHours = useMemo(
    () => calculateTotalActualHours(issues ?? []),
    [issues]
  );

  const leakageIssues = useMemo(
    () => (issues ?? []).filter((b) => getBugTypeFromIssue(b) === "Leakage"),
    [issues]
  );
  const totalActualHoursLeakage = useMemo(
    () => calculateTotalActualHours(leakageIssues),
    [leakageIssues]
  );

  const defectDensity = useMemo(
    () => calculateDefectDensity(severityData, totalActualHours),
    [severityData, totalActualHours]
  );
  const defectLeakage = useMemo(
    () =>
      calculateDefectLeakage(severityDataLeakage, totalActualHoursLeakage),
    [severityDataLeakage, totalActualHoursLeakage]
  );
  const defectTrendsData = useMemo(
    () => computeDefectTrendsByWeek(issues),
    [issues]
  );

  const defectDensityCard: QualityMetricCardData = useMemo(
    () => ({
      value: defectDensity.toFixed(2),
      label: "Defect Density",
      subLabel: "Per man month (Internal + External Bug)",
      target: "Target: < 2.0",
      valueColor: defectDensity < 2 ? "green" : "blue",
    }),
    [defectDensity]
  );
  const defectLeakageCard: QualityMetricCardData = useMemo(
    () => ({
      value: `${defectLeakage}`,
      label: "Defect Leakage",
      subLabel: "Escaped to production",
      target: "Target: < 5",
      valueColor: defectLeakage < 0.05 ? "green" : "blue",
    }),
    [defectLeakage]
  );
  const metricCardsData = useMemo(
    () => [defectDensityCard, defectLeakageCard],
    [defectDensityCard, defectLeakageCard]
  );

  return (
    <div className="space-y-6">
      {/* Top Row: 2 Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Defect Density Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDefectDensity ? (
              <div className="flex h-[280px] items-center justify-center">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            ) : (
              <DefectDensityChart
                data={defectDensityData}
                targetValue={1.5}
              />
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Defect Trends by Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DefectTrendsByPhaseChart data={defectTrendsData} />
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: 4 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {metricCardsData.map((item) => (
          <QualityMetricCard key={item.label} data={item} />
        ))}
      </div>

      {/* Bottom Row: 3 Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <SeverityBreakdownCard data={severityDataAll} />
        <TestingCoverageCard data={testingCoverageData} />
        <QualityInsightsCard data={qualityInsightsData} />
      </div>
    </div>
  );
}
