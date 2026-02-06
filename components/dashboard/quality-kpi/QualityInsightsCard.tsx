"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

interface QualityInsightsCardProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function QualityInsightsCard({ value, onValueChange }: QualityInsightsCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-card text-card-foreground border-border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          {t("qualityKpi.qualityInsights")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={t("qualityKpi.qualityInsightsPlaceholder")}
          className="min-h-[120px] resize-y"
          aria-label={t("qualityKpi.qualityInsights")}
        />
      </CardContent>
    </Card>
  );
}
