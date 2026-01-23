"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";

import type { VelocityBySprintPoint } from "@/types/interfaces/velocity";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface SprintVelocityTrendChartProps {
  data: VelocityBySprintPoint[];
}

export function SprintVelocityTrendChart({ data }: SprintVelocityTrendChartProps) {
  const { t } = useTranslation();
  const chartConfig = {
    committed: { label: t("velocity.committed"), color: "#3b82f6" },
    completed: { label: t("velocity.completed"), color: "#14b8a6" },
    average: { label: `- ${t("common.average")}`, color: "#eab308" },
  };

  const avg =
    data.length > 0
      ? Math.round(
          data.reduce((s, d) => s + d.completed, 0) / data.length
        )
      : 0;

  const yMax =
    data.length > 0
      ? Math.max(
          ...data.flatMap((d) => [d.committed, d.completed]),
          avg
        ) * 1.2
      : 35;
  const yDomain = [0, Math.max(35, Math.ceil(yMax / 5) * 5)];

  return (
    <div>
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
            dataKey="sprint"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            domain={yDomain}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip content={<ChartTooltipContent />} cursor={false} />
          <ReferenceLine
            y={avg}
            stroke="#eab308"
            strokeDasharray="4 4"
            strokeWidth={2}
          />
          <Bar dataKey="committed" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          <Bar dataKey="completed" fill="#14b8a6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ChartContainer>
      <div className="flex justify-center gap-4 pt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-[#3b82f6]" />
          {t("velocity.committed")}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-[#14b8a6]" />
          {t("velocity.completed")}
        </span>
        <span className="flex items-center gap-1">
          <span
            className="h-0 w-4 border-t-2 border-dashed border-[#eab308]"
            style={{ transform: "translateY(50%)" }}
          />
          {t("common.average")}
        </span>
      </div>
    </div>
  );
}
