"use client";

import type { TeamMemberPerformance } from "@/types/interfaces/customer-value";
import { getRoleTypeLabel } from "@/constants/common";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommonTable, type TableColumn } from "@/components/ui/common-table";

interface TeamCostPerformanceTableProps {
  data: TeamMemberPerformance[];
}

export function TeamCostPerformanceTable({
  data,
}: TeamCostPerformanceTableProps) {
  const columns: TableColumn<TeamMemberPerformance>[] = [
    {
      key: "name",
      header: "Team Member",
      accessor: (member) => member.name,
      className: "font-medium",
    },
    {
      key: "role",
      header: "Role",
      accessor: (member) => (
        <span className="text-muted-foreground">
          {getRoleTypeLabel(member.roleType)}
        </span>
      ),
    },
    {
      key: "billable",
      header: "Billable (ACMS data)",
      accessor: (member) => `${member.billableHours}h`,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      key: "earned",
      header: "Earned",
      accessor: (member) => `${member.earnedHours}h`,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      key: "performance",
      header: "Per%",
      accessor: (member) => (
        <span
          className={cn(
            "font-medium",
            member.performancePercentage >= 100
              ? "text-green-500"
              : member.performancePercentage >= 90
                ? "text-blue-500"
                : "text-yellow-500"
          )}
        >
          {member.performancePercentage}%
        </span>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Team Cost Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CommonTable
          data={data}
          columns={columns}
          getRowKey={(member) => member.id}
          emptyMessage="Không có dữ liệu hiệu suất"
        />
      </CardContent>
    </Card>
  );
}
