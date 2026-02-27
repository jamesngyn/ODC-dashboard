"use client";

import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusyRateMemberTab } from "./BusyRateMemberTab";
import { PerformanceMemberTab } from "./PerformanceMemberTab";

export function CustomerValueDashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="busy-rate" className="w-full">
        <TabsList className="mb-4 w-full justify-start rounded-lg border bg-transparent p-0 h-auto flex-wrap gap-0">
          <TabsTrigger
            value="busy-rate"
            className="rounded-lg border-b-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {t("customerValue.busyRateMember")}
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="rounded-lg border-b-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {t("customerValue.performanceMember")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="busy-rate" className="mt-0">
          <BusyRateMemberTab />
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <PerformanceMemberTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
