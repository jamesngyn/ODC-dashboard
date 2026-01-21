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

// Menu configuration
const data = {
  overview: [
    {
      title: "Progress Overview",
      url: "/dashboard/progress-overview",
      icon: PieChart,
    },
    {
      title: "Workload",
      url: "/dashboard/workload",
      icon: Briefcase,
    },
    {
      title: "Team Productivity",
      url: "/dashboard/team-productivity",
      icon: TrendingUp,
    },
    {
      title: "Quality KPI",
      url: "/dashboard/quality-kpi",
      icon: Target,
    },
  ],
  performance: [
    {
      title: "Customer Value",
      url: "/dashboard/customer-value",
      icon: Gem,
    },
    {
      title: "Team Velocity",
      url: "/dashboard/velocity",
      icon: Zap,
    },
    {
      title: "Resource Utilization",
      url: "/dashboard/resource-utilization",
      icon: Cpu,
    },
    {
      title: "Internal Performance",
      url: "/dashboard/internal-performance",
      icon: Layers,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                      ODC Dashboard
                    </span>
                    <span className="truncate text-xs">Analytics Platform</span>
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
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
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
          <SidebarGroupLabel>Performance</SidebarGroupLabel>
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
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
