"use client";

import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { TaskType } from "@/types/enums/common";

interface StatusDonutChartProps {
  data: {
    status: TaskType;
    count: number;
    percentage: number;
  }[];
}

const COLORS: Record<TaskType, string> = {
  [TaskType.Requirement]: "#22C55E", // Green
  [TaskType.Development]: "#5C9DFF", // Blue
  [TaskType.Testing]: "#FFC738", // Yellow
  [TaskType.UAT]: "#A687FF", // Purple
  [TaskType.Release]: "#F97316", // Orange
};

export const StatusDonutChart = ({ data }: StatusDonutChartProps) => {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.status,
      value: item.count,
      color: COLORS[item.status],
    }));
  }, [data]);

  return (
    <div className="h-[300px] w-full">
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
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
            itemStyle={{ color: "#fff" }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Absolute Centered Text */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center">
        <div className="text-foreground text-3xl font-bold">
          {data.reduce((acc, curr) => acc + curr.count, 0)}
        </div>
        <div className="text-muted-foreground text-xs tracking-widest uppercase">
          Tasks
        </div>
      </div>
    </div>
  );
};
