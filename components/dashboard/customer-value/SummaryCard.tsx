"use client";

import type { CostPerformanceSummary } from "@/types/interfaces/customer-value";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  data: CostPerformanceSummary;
}

export function SummaryCard({ data }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <div className={cn("text-3xl font-bold", "text-green-500")}>
              {data.costPerformance}%
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              Cost Performance
            </div>
          </div>
          <div className="flex flex-col">
            <div className={cn("text-3xl font-bold", "text-blue-500")}>
              {data.totalBill}h
            </div>
            <div className="text-muted-foreground mt-1 text-xs">Total Bill</div>
          </div>
          <div className="flex flex-col">
            <div className={cn("text-3xl font-bold", "text-blue-500")}>
              {data.totalEarned}h
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              Total Earned
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
