"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { DashboardStats } from "@/types/dashboard";
import { TaskStatus, TaskType } from "@/types/enums/common";
import {
  getActualEndDateFromIssue,
  mapBacklogCategoryToTaskStatus,
} from "@/lib/api/backlog";
import { isActualEndDateInRange } from "@/lib/utils";
import { useBacklogIssues } from "@/hooks/useBacklogIssues";
import { useBacklogCategories } from "@/hooks/useBacklogCategories";
import { useBacklogIssuesCountByCategories } from "@/hooks/useBacklogIssuesCountByCategory";
import { useBacklogMilestones } from "@/hooks/useBacklogMilestones";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CommonSelect } from "@/components/ui/common-select";

import { InsightCards } from "./InsightCards";
import { StatusDonutChart } from "./StatusDonutChart";
import { SummaryList } from "./SummaryList";
import { useTranslation } from "react-i18next";

const ALL_SPRINT_VALUE = "all";

export const ProgressOverviewWidget = () => {
  const { t } = useTranslation();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);

  const { milestones, isLoading: isLoadingMilestones } = useBacklogMilestones();
  const milestoneIds = useMemo<number[] | undefined>(
    () => (selectedMilestoneId !== null ? [selectedMilestoneId] : undefined),
    [selectedMilestoneId]
  );

  const { issues, isLoading: isLoadingIssues, isError: isErrorIssues } = useBacklogIssues({
    milestoneIds,
  });
  const { categories, isLoading: isLoadingCategories } = useBacklogCategories();
  const {
    categoryCounts,
    isLoading: isLoadingCategoryCounts,
    isError: isErrorCategoryCounts,
  } = useBacklogIssuesCountByCategories({
    categories,
    milestoneIds,
    enabled: categories.length > 0,
  });

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

    // 1. Category Distribution Logic - Sử dụng counts từ API với categoryId filter
    // Tạo map từ categoryCounts để lookup nhanh
    const categoryCountMap = new Map(
      categoryCounts.map((item) => [item.category.id, item.count])
    );

    // Sắp xếp categories theo displayOrder
    const sortedCategories = [...categories].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );

    // Tạo category distribution từ counts đã fetch từ API
    const categoryDistribution = sortedCategories.map((category) => {
      const count = categoryCountMap.get(category.id) || 0;
      // Map category sang TaskType để dùng chung màu sắc với SummaryList
      const status = mapBacklogCategoryToTaskStatus([category]);
      return {
        status,
        categoryName: category.name, // Lưu category name để hiển thị
        count,
        percentage:
          totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
      };
    });

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
  }, [issues, categories, categoryCounts]);

  const selectValue =
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

  if (
    isLoadingIssues ||
    isLoadingCategories ||
    isLoadingCategoryCounts ||
    isLoadingMilestones
  ) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isErrorIssues || isErrorCategoryCounts) {
    return (
      <div className="flex items-center justify-center p-12 text-red-500">
        {t("progressOverview.errorLoadingData")}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                {t("progressOverview.title")}
              </CardTitle>
              <CardDescription>
                {t("progressOverview.description")}
              </CardDescription>
            </div>
            <CommonSelect
              id="sprint-select"
              value={selectValue}
              onValueChange={handleSprintChange}
              options={sprintOptions}
              label={t("progressOverview.filterBySprint")}
              triggerClassName="w-[180px]"
            />
          </div>
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
