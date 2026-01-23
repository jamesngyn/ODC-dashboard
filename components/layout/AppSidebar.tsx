"use client";

import * as React from "react";
import {
  Briefcase,
  Cpu, // Resource
  Frame,
  Gem, // Value
  Layers, // Internal
  PieChart,
  Target, // KPI
  TrendingUp,
  Zap, // Speed
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { LocaleToggle } from "@/components/locale-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();

  // Menu configuration
  const data = {
    overview: [
      {
        title: t("navigation.progressOverview"),
        url: "/dashboard/progress-overview",
        icon: PieChart,
      },
      {
        title: t("navigation.workload"),
        url: "/dashboard/workload",
        icon: Briefcase,
      },
      {
        title: t("navigation.teamProductivity"),
        url: "/dashboard/team-productivity",
        icon: TrendingUp,
      },
      {
        title: t("navigation.qualityKpi"),
        url: "/dashboard/quality-kpi",
        icon: Target,
      },
    ],
    performance: [
      {
        title: t("navigation.customerValue"),
        url: "/dashboard/customer-value",
        icon: Gem,
      },
      {
        title: t("navigation.teamVelocity"),
        url: "/dashboard/velocity",
        icon: Zap,
      },
      {
        title: t("navigation.resourceUtilization"),
        url: "/dashboard/resource-utilization",
        icon: Cpu,
      },
      {
        title: t("navigation.internalPerformance"),
        url: "/dashboard/internal-performance",
        icon: Layers,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu className="mb-4 flex">
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <SidebarMenuButton size="lg" asChild className="flex-1">
                <a href="/dashboard">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Frame className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {t("app.title")}
                    </span>
                    <span className="truncate text-xs">{t("app.subtitle")}</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Overview Group */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation.overview")}</SidebarGroupLabel>
          <SidebarMenu>
            {data.overview.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Performance Group */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation.performance")}</SidebarGroupLabel>
          <SidebarMenu>
            {data.performance.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-center p-2">
          <LocaleToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
