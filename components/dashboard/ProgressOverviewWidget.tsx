"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import { DashboardStats } from "@/types/dashboard";
import { BacklogCategory, TaskStatus, TaskType } from "@/types/enums/common";
import {
  getActualEndDateFromIssue,
  mapBacklogCategoryToTaskStatus,
} from "@/lib/api/backlog";
import { isActualEndDateInRange } from "@/lib/utils";
import { useBacklogIssues } from "@/hooks/useBacklogIssues";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { InsightCards } from "./InsightCards";
import { StatusDonutChart } from "./StatusDonutChart";
import { SummaryList } from "./SummaryList";

export const ProgressOverviewWidget = () => {
  const { issues, isLoading, isError } = useBacklogIssues();

  const { data, categoryDistribution } = useMemo<{
    data: DashboardStats | null;
    categoryDistribution: {
      status: TaskType;
      categoryName: string;
      count: number;
      percentage: number;
    }[];
  }>(() => {
    if (!issues || !Array.isArray(issues)) {
      return { data: null, categoryDistribution: [] };
    }

    const totalTasks = issues.length;

    // 1. Category Distribution Logic - Phân loại và đếm theo category gốc từ Backlog
    const categoryCounts = issues.reduce(
      (acc, issue) => {
        // Lấy category đầu tiên từ mảng category
        const categoryName =
          issue.category && issue.category.length > 0
            ? issue.category[0].name
            : "Unknown";

        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Tạo category distribution với thứ tự theo BacklogCategory enum
    const categoryDistribution = Object.values(BacklogCategory).map(
      (category) => {
        const count = categoryCounts[category] || 0;
        // Map category sang TaskType để dùng chung màu sắc với SummaryList
        const status = mapBacklogCategoryToTaskStatus([
          { id: 0, projectId: 0, name: category, displayOrder: 0 },
        ]);
        return {
          status,
          categoryName: category, // Lưu category name để hiển thị
          count,
          percentage:
            totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
        };
      }
    );

    // 2. Status Distribution Logic (cho chart và insights)
    const statusCounts = issues.reduce(
      (acc, issue) => {
        const status = mapBacklogCategoryToTaskStatus(issue.category);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<TaskType, number>
    );

    const distribution = Object.values(TaskType).map((status) => ({
      status,
      count: statusCounts[status] || 0,
      percentage:
        totalTasks > 0
          ? Math.round(((statusCounts[status] || 0) / totalTasks) * 100)
          : 0,
    }));

    // 2. Key Insights Logic
    const onTrackCount = issues.filter((issue) => {
      const actualEndDate = getActualEndDateFromIssue(issue);
      // Task đúng hạn: có startDate, dueDate và ngày Actual End Date phải nằm trong khoảng đó và task đã Closed hoặc Resolved
      if (
        !issue.startDate ||
        !issue.dueDate ||
        !actualEndDate ||
        (issue.status.name !== TaskStatus.Closed &&
          issue.status.name !== TaskStatus.Resolved)
      ) {
        return false;
      }

      return isActualEndDateInRange(
        issue.startDate,
        issue.dueDate,
        actualEndDate
      );
    }).length;

    const monitorCount = issues.filter((issue) => {
      if (!issue.startDate || !issue.dueDate) {
        return false;
      }

      const isClosedOrResolved =
        issue.status.name === TaskStatus.Closed ||
        issue.status.name === TaskStatus.Resolved;

      if (!isClosedOrResolved) {
        return true;
      }

      const actualEndDate = getActualEndDateFromIssue(issue);
      if (!actualEndDate) {
        return true;
      }

      // Nếu đã Closed/Resolved và có actualEndDate nhưng không nằm trong khoảng [startDate, dueDate] -> cần monitoring
      return !isActualEndDateInRange(
        issue.startDate,
        issue.dueDate,
        actualEndDate
      );
    }).length;
    const uatReadyCount = statusCounts[TaskType.UAT] || 0;

    return {
      data: {
        distribution,
        totalTasks,
        insights: {
          onTrack: {
            count: onTrackCount,
            percentage:
              totalTasks > 0
                ? Math.round((onTrackCount / totalTasks) * 100)
                : 0,
          },
          monitor: {
            count: monitorCount,
            threshold: 5,
          },
          uatReady: {
            count: uatReadyCount,
          },
        },
      },
      categoryDistribution,
    };
  }, [issues]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-12 text-red-500">
        Failed to load data from Backlog API.
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Project Progress Overview
          </CardTitle>
          <CardDescription>
            Real-time snapshot of task distribution and bottlenecks from
            Backlog.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-10">
            {/* Chart Section (70% - span 7) */}
            <div className="bg-card relative rounded-xl border border-zinc-200 p-6 shadow-sm lg:col-span-7">
              <StatusDonutChart data={data.distribution} />
            </div>

            {/* Summary List Section (30% - span 3) */}
            <div className="bg-card rounded-xl border border-zinc-200 p-6 shadow-sm lg:col-span-3">
              <SummaryList data={categoryDistribution} />
            </div>
          </div>

          {/* Key Insights Section */}
          <InsightCards insights={data.insights} />
        </CardContent>
      </Card>
    </div>
  );
};
