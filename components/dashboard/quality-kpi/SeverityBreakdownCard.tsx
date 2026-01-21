"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { SeverityItem } from "@/types/interfaces/quality-kpi";

const severityConfig: Record<
  SeverityItem["level"],
  { label: string; dotColor: string }
> = {
  "Crash/Critical": { label: "Crash/Critical", dotColor: "bg-red-500" },
  Major: { label: "Major", dotColor: "bg-yellow-500" },
  Normal: { label: "Normal", dotColor: "bg-blue-500" },
  Low: { label: "Low", dotColor: "bg-neutral-400" },
};

interface SeverityBreakdownCardProps {
  data: SeverityItem[];
}

export function SeverityBreakdownCard({ data }: SeverityBreakdownCardProps) {
  return (
    <Card className="bg-card text-card-foreground border-border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Severity Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {data.map((item) => {
            const config = severityConfig[item.level];
            return (
              <li
                key={item.level}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${config.dotColor}`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {config.label}
                  </span>
                </div>
                <span className="text-sm font-medium">{item.count}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
