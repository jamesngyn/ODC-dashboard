"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QUERY_KEYS } from "@/constants/common";
import { HIDDEN_NAV_PATHS_FEATURE_NOT_DEVELOPED } from "@/constants/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Cpu,
  Frame,
  Gem,
  Layers,
  Loader2,
  PieChart,
  Settings,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { getAcmsProjects } from "@/lib/api/acms";
import { useBacklogProjectId } from "@/hooks/useBacklogProjectId";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/sidebar";
import { LocaleToggle } from "@/components/locale-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const hiddenPaths = new Set(HIDDEN_NAV_PATHS_FEATURE_NOT_DEVELOPED);
  const { backlogProjectId, setBacklogProjectId } = useBacklogProjectId();

  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery({
    queryKey: QUERY_KEYS.ACMS.PROJECTS,
    queryFn: getAcmsProjects,
  });

  const projects = projectsResponse?.projects?.data ?? [];
  const projectsWithBacklog = React.useMemo(
    () =>
      projects.filter(
        (p) => p.backlog_project_id != null && p.backlog_project_id !== ""
      ),
    [projects]
  );

  const handleBacklogProjectChange = React.useCallback(
    (value: string) => {
      setBacklogProjectId(value || null);
      window.location.reload();
    },
    [setBacklogProjectId]
  );

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
                <Link href="/dashboard/progress-overview">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Frame className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {t("app.title")}
                    </span>
                    <span className="truncate text-xs">
                      {t("app.subtitle")}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Backlog project select */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {t("navigation.currentBacklogProject")}
          </SidebarGroupLabel>
          <div className="px-2 py-1.5">
            {isLoadingProjects ? (
              <div className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border flex h-9 items-center justify-center rounded-lg border px-3 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Select
                value={
                  backlogProjectId ??
                  projectsWithBacklog[0]?.backlog_project_id ??
                  ""
                }
                onValueChange={handleBacklogProjectChange}
              >
                <SelectTrigger
                  className="h-9 w-full border-2 border-sidebar-border bg-sidebar-accent/50 text-sidebar-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] focus:ring-2 focus:ring-sidebar-ring dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] [&>span]:truncate"
                  id="sidebar-backlog-project"
                >
                  <SelectValue placeholder={t("settings.selectProject")} />
                </SelectTrigger>
                <SelectContent
                  className="border-sidebar-border bg-sidebar max-h-[var(--radix-select-content-available-height)] shadow-lg"
                  sideOffset={4}
                >
                  {projectsWithBacklog.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.backlog_project_id as string}
                      className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
                    >
                      <span className="truncate">
                        {project.name}
                        {project.code ? ` (${project.code})` : ""}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </SidebarGroup>

        {/* Overview Group */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation.overview")}</SidebarGroupLabel>
          <SidebarMenu>
            {data.overview
              .filter((item) => !hiddenPaths.has(item.url))
              .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    className={
                      pathname === item.url
                        ? "!bg-green-100 !text-green-800 dark:!bg-green-900/30 dark:!text-green-200"
                        : undefined
                    }
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Performance Group */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation.performance")}</SidebarGroupLabel>
          <SidebarMenu>
            {data.performance
              .filter((item) => !hiddenPaths.has(item.url))
              .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    className={
                      pathname === item.url
                        ? "!bg-green-100 !text-green-800 dark:!bg-green-900/30 dark:!text-green-200"
                        : undefined
                    }
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={t("navigation.settings")}
                isActive={pathname === "/dashboard/settings"}
                className={
                  pathname === "/dashboard/settings"
                    ? "!bg-green-100 !text-green-800 dark:!bg-green-900/30 dark:!text-green-200"
                    : undefined
                }
              >
                <Link href="/dashboard/settings">
                  <Settings />
                  <span>{t("navigation.settings")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
