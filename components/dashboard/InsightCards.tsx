"use client";

import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  SquareArrowUp,
} from "lucide-react";
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
  showBacklogLinks?: boolean;
}

export const InsightCards = ({
  insights,
  backlogLinks,
  showBacklogLinks = true,
}: InsightCardsProps) => {
  const { t } = useTranslation();
  const showBottleneck =
    insights.monitor.count > insights.monitor.threshold;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Card 1 - Đúng tiến độ: pastel green, icon in rounded square, progress bar */}
      <Card className="border-0 bg-green-50 shadow-sm transition-shadow hover:shadow-md dark:bg-green-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {t("progressOverview.onTrack")}
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {insights.onTrack.percentage}%
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            {t("progressOverview.onTrackDescription", {
              count: insights.onTrack.count,
            })}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${insights.onTrack.percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2 - Cần theo dõi: pastel orange, alert box with icon, icon with ring animation */}
      <Card className="border-0 bg-amber-50 shadow-sm transition-shadow hover:shadow-md dark:bg-amber-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {t("progressOverview.needsMonitoring")}
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 ring-2 ring-amber-200/80 dark:bg-amber-900/40 dark:ring-amber-700/50">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {insights.monitor.count}
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            {t("progressOverview.needsMonitoringDescription")}
          </p>
          {showBottleneck && (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-100/80 px-2 py-1.5 dark:border-amber-800 dark:bg-amber-900/30">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                {t("progressOverview.bottleneckDetected")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 3 - Sẵn sàng cho UAT: pastel purple, pill button */}
      <Card className="border-0 bg-purple-50 shadow-sm transition-shadow hover:shadow-md dark:bg-purple-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {t("progressOverview.readyForUat")}
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {insights.uatReady.count}
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            {t("progressOverview.readyForUatDescription")}
          </p>
          {showBacklogLinks && backlogLinks?.uat && (
            <Link
              href={backlogLinks.uat}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-800/50"
            >
              <ArrowUpRight className="h-3 w-3" />
              {t("progressOverview.viewInBacklog")}
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Card 4 - Sẵn sàng Release: pastel blue, pill button */}
      <Card className="border-0 bg-blue-50 shadow-sm transition-shadow hover:shadow-md dark:bg-blue-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {t("progressOverview.readyForRelease")}
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <SquareArrowUp className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {insights.releaseReady.count}
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            {t("progressOverview.readyForReleaseDescription")}
          </p>
          {showBacklogLinks && backlogLinks?.release && (
            <Link
              href={backlogLinks.release}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800/50"
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
