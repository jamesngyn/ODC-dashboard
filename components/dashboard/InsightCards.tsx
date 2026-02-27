"use client";

import { CheckCircle2, AlertCircle, Clock, Package, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/types/dashboard";
import { useTranslation } from "react-i18next";

export interface BacklogLinks {
  uat: string | null;
  release: string | null;
}

interface InsightCardsProps {
  insights: DashboardStats["insights"];
  backlogLinks?: BacklogLinks;
  /** When false, hide "View in Backlog" links (UAT and Release). Default true. */
  showBacklogLinks?: boolean;
}

export const InsightCards = ({
  insights,
  backlogLinks,
  showBacklogLinks = true,
}: InsightCardsProps) => {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* On Track Insight */}
      <Card className="bg-card/50 backdrop-blur-sm border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("progressOverview.onTrack")}</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{insights.onTrack.percentage}%</div>
          <p className="text-xs text-muted-foreground">
            {t("progressOverview.onTrackDescription", { count: insights.onTrack.count })}
          </p>
        </CardContent>
      </Card>

      {/* Monitor Insight (Testing) */}
      <Card className="bg-card/50 backdrop-blur-sm border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("progressOverview.needsMonitoring")}</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{insights.monitor.count}</div>
          <p className="text-xs text-muted-foreground">
            {t("progressOverview.needsMonitoringDescription")}
            {insights.monitor.count > insights.monitor.threshold && (
              <span className="text-yellow-600 block mt-1 font-medium">{t("progressOverview.bottleneckDetected")}</span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* UAT Ready Insight */}
      <Card className="bg-card/50 backdrop-blur-sm border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("progressOverview.readyForUat")}</CardTitle>
          <Clock className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{insights.uatReady.count}</div>
          <p className="text-xs text-muted-foreground">
            {t("progressOverview.readyForUatDescription")}
          </p>
          {showBacklogLinks && backlogLinks?.uat && (
            <Link
              href={backlogLinks.uat}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-purple-600 hover:underline"
            >
              <ArrowUpRight className="h-3 w-3" />
              {t("progressOverview.viewInBacklog")}
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Release Ready Insight */}
      <Card className="bg-card/50 backdrop-blur-sm border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("progressOverview.readyForRelease")}</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{insights.releaseReady.count}</div>
          <p className="text-xs text-muted-foreground">
            {t("progressOverview.readyForReleaseDescription")}
          </p>
          {showBacklogLinks && backlogLinks?.release && (
            <Link
              href={backlogLinks.release}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ArrowUpRight className="h-3 w-3" />
              {t("progressOverview.viewInBacklog")}
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
