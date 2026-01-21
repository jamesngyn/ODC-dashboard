"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DefectTrendsByWeek } from "@/types/interfaces/quality-kpi";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface DefectTrendsByPhaseChartProps {
  data: DefectTrendsByWeek[];
}

const chartConfig = {
  found: { label: "Found", color: "#ef4444" },
  fixed: { label: "Fixed", color: "#f97316" },
  closed: { label: "Closed", color: "#14b8a6" },
};

export function DefectTrendsByPhaseChart({ data }: DefectTrendsByPhaseChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-[280px] w-full aspect-auto"
    >
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        barGap={4}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          domain={[0, 25]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip content={<ChartTooltipContent />} cursor={false} />
        <Legend
          wrapperStyle={{ paddingTop: 16 }}
          formatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label ?? value}
        />
        <Bar dataKey="found" fill="#ef4444" radius={[2, 2, 0, 0]} />
        <Bar dataKey="fixed" fill="#f97316" radius={[2, 2, 0, 0]} />
        <Bar dataKey="closed" fill="#14b8a6" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
