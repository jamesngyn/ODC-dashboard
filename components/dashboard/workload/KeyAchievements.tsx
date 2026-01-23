"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

export function KeyAchievements() {
  const { t } = useTranslation();
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("workload.keyAchievements")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder={t("workload.keyAchievementsPlaceholder")}
          className="min-h-[200px] resize-none"
        />
      </CardContent>
    </Card>
  );
}
