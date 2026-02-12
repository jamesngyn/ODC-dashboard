"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  calculateDefectDensityPerManMonth,
  calculateDefectLeakagePerManMonth,
  calculateRemovalEfficiency,
  computeDefectTrendsByWeek,
  getBugTypeFromIssue,
  getSeverityCountsFromAllBugs,
  getSeverityCountsFromBugs,
  getSeverityCountsFromInternalBugs,
  getSeverityCountsFromLeakageBugs,
} from "@/lib/quality-kpi";
import { BugType } from "@/types/enums/common";
import { calculateTotalActualHours } from "@/lib/utils";
import type {
  QualityMetricCardData,
  TestingCoverageItem,
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
import { useBacklogIssuesCount } from "@/hooks/useBacklogIssuesCount";
import { useBacklogMilestones } from "@/hooks/useBacklogMilestones";
import { CommonSelect } from "@/components/ui/common-select";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const ALL_SPRINT_VALUE = "all";

export function QualityKPIDashboard() {
  const { t } = useTranslation();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(
    null
  );
  const milestoneIds = useMemo<number[] | undefined>(
    () => (selectedMilestoneId !== null ? [selectedMilestoneId] : undefined),
    [selectedMilestoneId]
  );

  const { milestones } = useBacklogMilestones();
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
    milestoneIds,
    enabled: bugId != null,
  });
  const { issues: allIssues, isLoading: isLoadingAllIssues } = useBacklogIssues({
    milestoneIds,
    enabled: true,
  });
  const { count: totalBugCount } = useBacklogIssuesCount({
    issueTypeIds: bugId != null ? [bugId] : undefined,
    milestoneIds,
    enabled: bugId != null,
  });
  const isLoading = isLoadingTypes || isLoadingIssues || isLoadingAllIssues;
  const isError = isErrorTypes || isErrorIssues;

  const sprintSelectValue =
    selectedMilestoneId === null ? ALL_SPRINT_VALUE : String(selectedMilestoneId);
  const handleSprintChange = (value: string) => {
    setSelectedMilestoneId(value === ALL_SPRINT_VALUE ? null : Number(value));
  };
  const sprintOptions = useMemo(
    () => [
      { value: ALL_SPRINT_VALUE, label: t("common.all") },
      ...milestones.map((m) => ({ value: String(m.id), label: m.name })),
    ],
    [milestones, t]
  );

  const testingCoverageData: TestingCoverageItem[] = [
    { label: t("qualityKpi.unitTesting"), value: 94, barColor: "#14b8a6" },
    { label: t("qualityKpi.integration"), value: 87, barColor: "#3b82f6" },
    { label: t("qualityKpi.systemTesting"), value: 76, barColor: "#f97316" },
  ];

  const [qualityInsightsText, setQualityInsightsText] = useState("");

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
  const severityDataInternal = useMemo(
    () => getSeverityCountsFromInternalBugs(issues),
    [issues]
  );

  const totalActualHoursAll = useMemo(
    () => calculateTotalActualHours(allIssues ?? []),
    [allIssues]
  );

  const leakageIssues = useMemo(
    () => (issues ?? []).filter((b) => getBugTypeFromIssue(b) === BugType.Leakage),
    [issues]
  );

  const defectDensity = useMemo(
    () =>
      calculateDefectDensityPerManMonth(severityData, totalActualHoursAll),
    [severityData, totalActualHoursAll]
  );
  const defectLeakage = useMemo(
    () =>
      calculateDefectLeakagePerManMonth(
        severityDataLeakage,
        totalActualHoursAll
      ),
    [severityDataLeakage, totalActualHoursAll]
  );
  const defectTrendsData = useMemo(
    () => computeDefectTrendsByWeek(issues),
    [issues]
  );

  const defectDensityCard: QualityMetricCardData = useMemo(
    () => ({
      value: defectDensity.toFixed(2),
      label: t("qualityKpi.defectDensity"),
      subLabel: t("qualityKpi.perManMonth"),
      target: t("qualityKpi.targetLessThan2"),
      valueColor: defectDensity < 2 ? "green" : "blue",
    }),
    [defectDensity, t]
  );
  const defectLeakageCard: QualityMetricCardData = useMemo(
    () => ({
      value: defectLeakage.toFixed(2),
      label: t("qualityKpi.defectLeakage"),
      subLabel: t("qualityKpi.escapedToProduction"),
      target: t("qualityKpi.targetLessThan5"),
      valueColor: defectLeakage < 0.05 ? "green" : "blue",
    }),
    [defectLeakage, t]
  );

  const removalEfficiency = useMemo(
    () => calculateRemovalEfficiency(severityDataInternal, totalBugCount),
    [severityDataInternal, totalBugCount]
  );
  const removalEfficiencyCard: QualityMetricCardData = useMemo(
    () => ({
      value: `${Math.round(removalEfficiency)}%`,
      label: t("qualityKpi.removalEfficiency"),
      subLabel: t("qualityKpi.removalEfficiencySubLabel"),
      target: t("qualityKpi.removalEfficiencyTarget"),
      valueColor: removalEfficiency >= 80 ? "green" : "blue",
    }),
    [removalEfficiency, t]
  );

  const metricCardsData = useMemo(
    () => [defectDensityCard, defectLeakageCard, removalEfficiencyCard],
    [defectDensityCard, defectLeakageCard, removalEfficiencyCard]
  );

  return (
    <div className="space-y-6">
      {/* Sprint filter: applies to Defect Density, Defect Leakage, Severity Breakdown */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <CommonSelect
          id="quality-kpi-sprint-select"
          value={sprintSelectValue}
          onValueChange={handleSprintChange}
          options={sprintOptions}
          label={t("progressOverview.filterBySprint")}
          triggerClassName="w-[180px]"
        />
      </div>

      {/* Top Row: 2 Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {t("qualityKpi.defectDensityTracking")}
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
                targetValue={2}
              />
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {t("qualityKpi.defectTrendsByPhase")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DefectTrendsByPhaseChart data={defectTrendsData} />
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Defect Density, Defect Leakage, Removal Efficiency */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metricCardsData.map((item) => (
          <QualityMetricCard key={item.label} data={item} />
        ))}
      </div>

      {/* Bottom Row: 3 Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <SeverityBreakdownCard data={severityDataAll} />
        {/* <TestingCoverageCard data={testingCoverageData} /> */}
        <QualityInsightsCard
          value={qualityInsightsText}
          onValueChange={setQualityInsightsText}
        />
      </div>
    </div>
  );
}
