"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DefectDensityPoint } from "@/types/interfaces/quality-kpi";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface DefectDensityChartProps {
  data: DefectDensityPoint[];
  targetValue?: number;
}

const chartConfig = {
  value: {
    label: "Defect Density",
    color: "#14b8a6",
  },
  target: {
    label: "Targ",
    color: "#eab308",
  },
};

export function DefectDensityChart({
  data,
  targetValue = 1.5,
}: DefectDensityChartProps) {
  const maxVal =
    data.length > 0
      ? Math.max(...data.map((d) => d.value), targetValue)
      : targetValue;
  const yMax = Math.max(2.5, maxVal * 1.15);

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
          dataKey="sprint"
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
        <ReferenceLine
          y={targetValue}
          stroke="#eab308"
          strokeDasharray="4 4"
          strokeWidth={2}
        />
        <Tooltip content={<ChartTooltipContent />} cursor={false} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#14b8a6"
          strokeWidth={2}
          dot={{ fill: "#14b8a6", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
