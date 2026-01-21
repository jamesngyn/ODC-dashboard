"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { BurndownDayPoint } from "@/types/interfaces/velocity";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface SprintBurndownChartProps {
  data: BurndownDayPoint[];
}

const chartConfig = {
  actual: { label: "Actual", color: "#14b8a6" },
  ideal: { label: "Ideal", color: "#6b7280" },
};

export function SprintBurndownChart({ data }: SprintBurndownChartProps) {
  if (data.length === 0) return null;

  const maxVal = Math.max(
    ...data.flatMap((d) => [d.actual, d.ideal]),
    1
  );
  const yMax = Math.ceil(maxVal * 1.1 / 5) * 5 || 35;

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[280px] w-full aspect-auto"
    >
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          domain={[0, yMax]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip content={<ChartTooltipContent />} cursor={false} />
        <Legend
          wrapperStyle={{ paddingTop: 8 }}
          formatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label ?? value}
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#14b8a6"
          strokeWidth={2}
          dot={{ fill: "#14b8a6", r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="ideal"
          stroke="#6b7280"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
