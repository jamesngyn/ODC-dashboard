"use client";

import { useMemo } from "react";
import { QUERY_KEYS } from "@/constants/common";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TaskStatus } from "@/types/enums/common";
import type { AcmsProject, AcmsResource } from "@/types/interfaces/acms";
import type { BacklogIssue, BacklogUser } from "@/types/interfaces/common";
import type { PerformanceMember } from "@/types/interfaces/customer-value";
import { getAcmsResources, type AcmsResourcesParams } from "@/lib/api/acms";
import {
  getBacklogIssues,
  getBacklogProjectMembers,
  getBacklogStatuses,
} from "@/lib/api/backlog";
import { getPointFromIssue, getReEstimateEffortFromIssue } from "@/lib/utils";
import { useBacklogProjectId } from "@/hooks/useBacklogProjectId";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CommonTable } from "@/components/ui/common-table";
import type { TableColumn } from "@/components/ui/common-table";

import { ALL_VALUE, type PeriodMode } from "./BusyRateMemberFilters";

interface MemberAggregate {
  estimatedEffortHours: number;
  reEstimateEffortHours: number;
  actualEffortHours: number;
  uspPoint: number;
}

function aggregateClosedIssuesByAssignee(
  issues: BacklogIssue[]
): Map<number, MemberAggregate> {
  const map = new Map<number, MemberAggregate>();

  for (const issue of issues) {
    const assigneeId = issue.assignee?.id;
    if (assigneeId == null) continue;

    const estimated = Math.max(0, issue.estimatedHours ?? 0);
    const reEstimate = getReEstimateEffortFromIssue(issue);
    const actual = Math.max(0, issue.actualHours ?? 0);
    const point = getPointFromIssue(issue);

    const existing = map.get(assigneeId);
    if (existing) {
      existing.estimatedEffortHours += estimated;
      existing.reEstimateEffortHours += reEstimate;
      existing.actualEffortHours += actual;
      existing.uspPoint += point;
    } else {
      map.set(assigneeId, {
        estimatedEffortHours: estimated,
        reEstimateEffortHours: reEstimate,
        actualEffortHours: actual,
        uspPoint: point,
      });
    }
  }

  return map;
}

function buildPerformanceByEstimate(
  estimated: number,
  actual: number,
  rankCoeff: number
): number | null {
  const denom = actual * rankCoeff;
  if (denom <= 0) return null;
  return (estimated / denom) * 100;
}

function buildPerformanceByReEstimate(
  reEstimate: number,
  actual: number,
  rankCoeff: number
): number | null {
  const denom = actual * rankCoeff;
  if (denom <= 0) return null;
  return (reEstimate / denom) * 100;
}

function buildPerformanceByPoint(
  point: number,
  actual: number,
  rankCoeff: number
): number | null {
  const denom = actual * rankCoeff;
  if (denom <= 0) return null;
  return point / denom;
}

export interface PerformanceMemberTabProps {
  periodMode: PeriodMode;
  selectedDate: Date;
  selectedProjectId: string;
  selectedTeamId: string;
  from: string;
  to: string;
  projects: AcmsProject[];
}

export function PerformanceMemberTab({
  periodMode,
  selectedDate,
  selectedProjectId,
  selectedTeamId,
  from,
  to,
  projects,
}: PerformanceMemberTabProps) {
  const { t } = useTranslation();
  const { backlogProjectId } = useBacklogProjectId();
  /** Hiển thị project đã chọn (ID hoặc "—" nếu chưa chọn). */
  const projectName = backlogProjectId ?? "—";

  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: QUERY_KEYS.BACKLOG.PROJECT_MEMBERS(backlogProjectId ?? "config"),
    queryFn: () => getBacklogProjectMembers(false, backlogProjectId),
  });

  const { data: statuses = [], isLoading: isLoadingStatuses } = useQuery({
    queryKey: [
      ...QUERY_KEYS.CUSTOMER_VALUE.BACKLOG_STATUSES,
      backlogProjectId ?? "config",
    ],
    queryFn: () => getBacklogStatuses(backlogProjectId),
  });

  const closedStatusId = useMemo(() => {
    const closed = statuses.find(
      (s) => s.name?.toLowerCase() === TaskStatus.Closed.toLowerCase()
    );
    return closed?.id ?? null;
  }, [statuses]);

  const { data: closedIssues = [], isLoading: isLoadingIssues } = useQuery({
    queryKey: [
      ...QUERY_KEYS.CUSTOMER_VALUE.PERFORMANCE_CLOSED_ISSUES(
        closedStatusId != null ? [closedStatusId] : []
      ),
      backlogProjectId ?? "config",
      from,
      to,
    ],
    queryFn: () =>
      getBacklogIssues({
        projectId: backlogProjectId,
        statusIds: closedStatusId != null ? [closedStatusId] : undefined,
        startDateSince: from,
        startDateUntil: to,
      }),
    enabled: closedStatusId != null,
  });

  const acmsResourceParams = useMemo((): AcmsResourcesParams => {
    const base: AcmsResourcesParams = {
      from,
      to,
      period: "month",
      page: 1,
      limit: 1000,
    };
    if (selectedProjectId !== ALL_VALUE) {
      base.project_id = selectedProjectId;
    }
    if (selectedTeamId !== ALL_VALUE) {
      base["team_ids[]"] = [Number(selectedTeamId)];
    }
    return base;
  }, [from, to, selectedProjectId, selectedTeamId]);

  const { data: acmsResponse, isLoading: isLoadingAcms } = useQuery({
    queryKey: [
      ...QUERY_KEYS.CUSTOMER_VALUE.ACMS_RESOURCES,
      from,
      to,
      "month",
      1,
      1000,
      selectedProjectId,
      selectedTeamId,
    ],
    queryFn: () => getAcmsResources(acmsResourceParams),
  });

  const acmsByEmail = useMemo(() => {
    const list = acmsResponse?.resources?.data ?? [];
    const map = new Map<string, AcmsResource>();
    for (const r of list) {
      if (r.email?.trim()) {
        const normalized = r.email
          .trim()
          .toLowerCase()
          .replace(/\.test(?=@)/, "");
        map.set(normalized, r);
      }
    }
    return map;
  }, [acmsResponse]);

  const aggregatesByAssigneeId = useMemo(
    () => aggregateClosedIssuesByAssignee(closedIssues),
    [closedIssues]
  );

  /** Hiển thị tất cả user từ Backlog; map roles, jobRank, rankCoefficient từ ACMS theo email; lọc theo project/team nếu chọn. */
  const data = useMemo((): PerformanceMember[] => {
    return members
      .filter((user: BacklogUser) => {
        const email = user.mailAddress?.trim() ?? "";
        const acms = email ? acmsByEmail.get(email.toLowerCase()) : undefined;
        if (selectedProjectId !== ALL_VALUE) {
          const project = projects.find(
            (p) => String(p.id) === selectedProjectId
          );
          if (project && (!acms || acms.project !== project.name)) return false;
        }
        if (selectedTeamId !== ALL_VALUE) {
          if (!acms || String(acms.team?.id) !== selectedTeamId) return false;
        }
        return true;
      })
      .map((user: BacklogUser) => {
        const email = user.mailAddress?.trim() ?? "";
        const acms = email ? acmsByEmail.get(email.toLowerCase()) : undefined;

        const role = acms?.position?.name ?? "-";
        const jobRank = acms?.level?.name ?? "-";
        const rankCoefficient = acms?.level?.coefficient ?? 1;

        const agg = aggregatesByAssigneeId.get(user.id) ?? {
          estimatedEffortHours: 0,
          reEstimateEffortHours: 0,
          actualEffortHours: 0,
          uspPoint: 0,
        };

        const perfByEst = buildPerformanceByEstimate(
          agg.estimatedEffortHours,
          agg.actualEffortHours,
          rankCoefficient
        );
        const perfByReEst = buildPerformanceByReEstimate(
          agg.reEstimateEffortHours,
          agg.actualEffortHours,
          rankCoefficient
        );
        const perfByPoint = buildPerformanceByPoint(
          agg.uspPoint,
          agg.actualEffortHours,
          rankCoefficient
        );

        return {
          employeeId: acms?.code ?? user.userId ?? "-",
          fullName: user.name ?? "-",
          roles: role,
          jobRank,
          rankCoefficient,
          projectName,
          estimatedEffortHours: agg.estimatedEffortHours,
          reEstimateEffortHours: agg.reEstimateEffortHours,
          actualEffortHours: agg.actualEffortHours,
          uspPoint: agg.uspPoint,
          performanceByEstimatePercent: perfByEst ?? 0,
          performanceByReEstimatePercent: perfByReEst ?? 0,
          performanceByPoint: perfByPoint ?? 0,
        };
      });
  }, [
    members,
    acmsByEmail,
    aggregatesByAssigneeId,
    projectName,
    selectedProjectId,
    selectedTeamId,
    projects,
  ]);

  const columns = useMemo<TableColumn<PerformanceMember>[]>(
    () => [
      {
        key: "employeeId",
        header: t("customerValue.employeeId"),
        accessor: (r: PerformanceMember) => r.employeeId,
      },
      {
        key: "fullName",
        header: t("customerValue.fullName"),
        accessor: (r: PerformanceMember) => r.fullName,
      },
      {
        key: "roles",
        header: t("customerValue.roles"),
        accessor: (r: PerformanceMember) => r.roles || "-",
      },
      {
        key: "jobRank",
        header: t("customerValue.jobRank"),
        accessor: (r: PerformanceMember) => r.jobRank || "-",
      },
      {
        key: "rankCoefficient",
        header: t("customerValue.rankCoefficient"),
        accessor: (r: PerformanceMember) =>
          r.rankCoefficient != null
            ? r.rankCoefficient.toFixed(2).replace(".", ",")
            : "—",
      },
      {
        key: "projectName",
        header: t("customerValue.projectName"),
        accessor: (r: PerformanceMember) => r.projectName,
      },
      {
        key: "estimatedEffort",
        header: t("customerValue.estimatedEffortHours"),
        accessor: (r: PerformanceMember) => r.estimatedEffortHours,
      },
      {
        key: "reEstimateEffort",
        header: t("customerValue.reEstimateEffortHours"),
        accessor: (r: PerformanceMember) => r.reEstimateEffortHours,
      },
      {
        key: "actualEffort",
        header: t("customerValue.actualEffortHours"),
        accessor: (r: PerformanceMember) => r.actualEffortHours,
      },
      {
        key: "uspPoint",
        header: t("customerValue.uspPoint"),
        accessor: (r: PerformanceMember) => r.uspPoint,
      },
      {
        key: "perfByEstimate",
        header: t("customerValue.performanceByEstimate"),
        accessor: (r: PerformanceMember) =>
          r.performanceByEstimatePercent > 0
            ? r.performanceByEstimatePercent.toFixed(2).replace(".", ",") + "%"
            : "—",
      },
      {
        key: "perfByReEstimate",
        header: t("customerValue.performanceByReEstimate"),
        accessor: (r: PerformanceMember) =>
          r.performanceByReEstimatePercent > 0
            ? r.performanceByReEstimatePercent.toFixed(2).replace(".", ",") +
              "%"
            : "—",
      },
      {
        key: "perfByPoint",
        header: t("customerValue.performanceByPoint"),
        accessor: (r: PerformanceMember) =>
          r.performanceByPoint > 0
            ? r.performanceByPoint.toFixed(3).replace(".", ",")
            : "—",
      },
    ],
    [t]
  );

  const isLoading =
    isLoadingMembers || isLoadingStatuses || isLoadingIssues || isLoadingAcms;

  return (
    <Card className="border-0 bg-zinc-50/50 shadow-none dark:bg-zinc-900/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t("customerValue.performanceMemberTitle")}
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("customerValue.performanceMemberDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : (
          <CommonTable<PerformanceMember>
            data={data}
            columns={columns}
            getRowKey={(r) => `${r.employeeId}-${r.fullName}-${r.roles}`}
            emptyMessage={t("customerValue.emptyTable")}
          />
        )}
      </CardContent>
    </Card>
  );
}
