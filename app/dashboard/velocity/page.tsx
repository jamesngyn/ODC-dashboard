"use client";

import { VelocityDashboard } from "@/components/dashboard/velocity/VelocityDashboard";
import { useTranslation } from "react-i18next";

export default function VelocityPage() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("navigation.teamVelocity")}</h2>
      </div>
      <VelocityDashboard />
    </div>
  );
}
