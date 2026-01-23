"use client";

import type { CostPerformanceSummary } from "@/types/interfaces/customer-value";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface SummaryCardProps {
  data: CostPerformanceSummary;
}

export function SummaryCard({ data }: SummaryCardProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t("customerValue.summary")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <div className={cn("text-3xl font-bold", "text-green-500")}>
              {data.costPerformance}%
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              {t("customerValue.costPerformance")}
            </div>
          </div>
          <div className="flex flex-col">
            <div className={cn("text-3xl font-bold", "text-blue-500")}>
              {data.totalBill}h
            </div>
            <div className="text-muted-foreground mt-1 text-xs">{t("customerValue.totalBill")}</div>
          </div>
          <div className="flex flex-col">
            <div className={cn("text-3xl font-bold", "text-blue-500")}>
              {data.totalEarned}h
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              {t("customerValue.totalEarned")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
