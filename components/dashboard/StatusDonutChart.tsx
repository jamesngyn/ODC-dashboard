"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { TaskType } from "@/types/enums/common";

interface StatusDonutChartProps {
  data: {
    status: TaskType;
    count: number;
    percentage: number;
  }[];
  /** When provided, show floating alert card when count > threshold */
  monitorCount?: number;
  monitorThreshold?: number;
}

const COLORS: Record<TaskType, string> = {
  [TaskType.Requirement]: "#22C55E", // Green
  [TaskType.Development]: "#5C9DFF", // Blue
  [TaskType.Testing]: "#FFC738", // Yellow
  [TaskType.UAT]: "#A687FF", // Purple
  [TaskType.Release]: "#F97316", // Orange
};

export const StatusDonutChart = ({
  data,
  monitorCount = 0,
  monitorThreshold = 0,
}: StatusDonutChartProps) => {
  const { t } = useTranslation();
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.status,
      value: item.count,
      color: COLORS[item.status],
    }));
  }, [data]);

  const totalTasks = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="relative h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              color: "#18181b",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
            }}
            itemStyle={{ color: "#18181b" }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Absolute Centered Text - "19 TASKS" */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center">
        <div className="text-2xl font-bold text-zinc-900">
          {totalTasks} TASKS
        </div>
      </div>
    </div>
  );
};
