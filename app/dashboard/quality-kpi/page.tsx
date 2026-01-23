"use client";

import { QualityKPIDashboard } from "@/components/dashboard/quality-kpi/QualityKPIDashboard";
import { useTranslation } from "react-i18next";

export default function QualityKPIPage() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("navigation.qualityKpi")}</h2>
      </div>
      <QualityKPIDashboard />
    </div>
  );
}
