"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CommonTable } from "@/components/ui/common-table";
import type { PerformanceMember } from "@/types/interfaces/customer-value";
import type { TableColumn } from "@/components/ui/common-table";
import type { AcmsResource } from "@/types/interfaces/acms";
import type { BacklogIssue, BacklogUser } from "@/types/interfaces/common";
import { getAcmsResources } from "@/lib/api/acms";
import {
  getBacklogProjectMembers,
  getBacklogStatuses,
  getBacklogIssues,
} from "@/lib/api/backlog";
import { getLevels } from "@/lib/api/acms";
import { getPointFromIssue, getReEstimateEffortFromIssue } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/common";
import { TaskStatus } from "@/types/enums/common";
import { useBacklogProjectId } from "@/hooks/useBacklogProjectId";

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

export function PerformanceMemberTab() {
  const { t } = useTranslation();
  const { backlogProjectId } = useBacklogProjectId();
  /** Hiển thị project đã chọn (ID hoặc "—" nếu chưa chọn). */
  const projectName = backlogProjectId ?? "—";

  const now = useMemo(() => new Date(), []);
  const from = format(startOfMonth(now), "yyyy-MM-dd");
  const to = format(endOfMonth(now), "yyyy-MM-dd");

  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: QUERY_KEYS.BACKLOG.PROJECT_MEMBERS(
      backlogProjectId ?? "config"
    ),
    queryFn: () =>
      getBacklogProjectMembers(false, backlogProjectId),
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
    ],
    queryFn: () =>
      getBacklogIssues({
        projectId: backlogProjectId,
        statusIds: closedStatusId != null ? [closedStatusId] : undefined,
      }),
    enabled: closedStatusId != null,
  });

  const { data: acmsResponse, isLoading: isLoadingAcms } = useQuery({
    queryKey: [...QUERY_KEYS.CUSTOMER_VALUE.ACMS_RESOURCES, from, to],
    queryFn: () => getAcmsResources({ from, to, period: "month" }),
  });

  const { data: levelsResponse } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_VALUE.LEVELS,
    queryFn: getLevels,
  });

  /** Map level id -> coefficient; fallback map level name -> coefficient (from API levels) */
  const coefficientByLevelId = useMemo(() => {
    const map = new Map<number, number>();
    const list = levelsResponse?.level ?? [];
    for (const item of list) {
      map.set(item.id, item.coefficient);
    }
    return map;
  }, [levelsResponse]);

  const coefficientByLevelName = useMemo(() => {
    const map = new Map<string, number>();
    const list = levelsResponse?.level ?? [];
    for (const item of list) {
      const key = item.name?.trim().toLowerCase() ?? "";
      if (key) map.set(key, item.coefficient);
    }
    return map;
  }, [levelsResponse]);

  const acmsByEmail = useMemo(() => {
    const list = acmsResponse?.resources?.data ?? [];
    const map = new Map<string, AcmsResource>();
    for (const r of list) {
      if (r.email?.trim()) {
        map.set(r.email.trim().toLowerCase(), r);
      }
    }
    return map;
  }, [acmsResponse]);

  const aggregatesByAssigneeId = useMemo(
    () => aggregateClosedIssuesByAssignee(closedIssues),
    [closedIssues]
  );

  const data = useMemo((): PerformanceMember[] => {
    return members.map((user: BacklogUser) => {
      const email = user.mailAddress?.trim() ?? "";
      const acms = email ? acmsByEmail.get(email.toLowerCase()) : undefined;

      const role = acms?.position?.name ?? "—";
      const jobRank = acms?.level?.name ?? "—";
      const rankCoefficient =
        (acms?.level?.id != null
          ? coefficientByLevelId.get(acms.level.id)
          : undefined) ??
        (acms?.level?.name != null
          ? coefficientByLevelName.get(acms.level.name.trim().toLowerCase())
          : undefined) ??
        acms?.level?.coefficient ??
        1;

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
        employeeId: acms?.code ?? user.userId ?? "—",
        fullName: user.name ?? "—",
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
    coefficientByLevelId,
    coefficientByLevelName,
    projectName,
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
        accessor: (r: PerformanceMember) => r.roles,
      },
      {
        key: "jobRank",
        header: t("customerValue.jobRank"),
        accessor: (r: PerformanceMember) => r.jobRank,
      },
      {
        key: "rankCoefficient",
        header: t("customerValue.rankCoefficient"),
        accessor: (r: PerformanceMember) =>
          r.rankCoefficient.toFixed(2).replace(".", ","),
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
            ? r.performanceByReEstimatePercent.toFixed(2).replace(".", ",") + "%"
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
    <Card className="border-0 bg-zinc-50/50 dark:bg-zinc-900/30 shadow-none">
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
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
