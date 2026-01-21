"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { TestingCoverageItem } from "@/types/interfaces/quality-kpi";

interface TestingCoverageCardProps {
  data: TestingCoverageItem[];
}

export function TestingCoverageCard({ data }: TestingCoverageCardProps) {
  return (
    <Card className="bg-card text-card-foreground border-border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Testing Coverage (Nghiên cứu sau)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {data.map((item) => (
            <li key={item.label}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {item.value}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: item.barColor,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
