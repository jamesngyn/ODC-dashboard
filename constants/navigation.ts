/** Path-to-breadcrumb mapping for dashboard routes. */
export const ROUTE_BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/progress-overview": "Progress Overview",
  "/dashboard/workload": "Workload",
  "/dashboard/team-productivity": "Team Productivity",
  "/dashboard/quality-kpi": "Quality KPI",
  "/dashboard/customer-value": "Customer Value",
  "/dashboard/velocity": "Team Velocity",
  "/dashboard/resource-utilization": "Resource Utilization",
  "/dashboard/internal-performance": "Internal Performance",
};

export const DASHBOARD_HREF = "/dashboard";
export const DASHBOARD_LABEL = "Dashboard";

export function getBreadcrumbForPath(pathname: string): string {
  return ROUTE_BREADCRUMBS[pathname] ?? DASHBOARD_LABEL;
}
