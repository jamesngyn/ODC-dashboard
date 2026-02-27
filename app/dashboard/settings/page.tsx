"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { QUERY_KEYS } from "@/constants/common";
import { useBacklogProjectId } from "@/hooks/useBacklogProjectId";
import { useShowBacklogLinks } from "@/hooks/useShowBacklogLinks";
import { getAcmsProjects } from "@/lib/api/acms";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { showBacklogLinks, setShowBacklogLinks } = useShowBacklogLinks();
  const { backlogProjectId, setBacklogProjectId } = useBacklogProjectId();

  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery({
    queryKey: QUERY_KEYS.ACMS.PROJECTS,
    queryFn: getAcmsProjects,
  });

  const projects = projectsResponse?.projects?.data ?? [];
  const projectsWithBacklog = useMemo(
    () =>
      projects.filter(
        (p) => p.backlog_project_id != null && p.backlog_project_id !== ""
      ),
    [projects]
  );

  useEffect(() => {
    if (projectsWithBacklog.length === 0 || backlogProjectId != null) return;
    setBacklogProjectId(projectsWithBacklog[0].backlog_project_id);
  }, [projectsWithBacklog, backlogProjectId, setBacklogProjectId]);

  const handleProjectChange = (value: string) => {
    setBacklogProjectId(value);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("settings.title")}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t("settings.description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.general")}</CardTitle>
          <CardDescription>{t("settings.generalDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-row items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="space-y-0.5">
              <Label htmlFor="show-backlog-links" className="text-base">
                {t("settings.showBacklogLinks")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.showBacklogLinksDescription")}
              </p>
            </div>
            <Switch
              id="show-backlog-links"
              checked={showBacklogLinks}
              onCheckedChange={setShowBacklogLinks}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-select">{t("settings.backlogProject")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("settings.backlogProjectDescription")}
            </p>
            {isLoadingProjects ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("common.loading")}
              </div>
            ) : (
              <Select
                value={
                  backlogProjectId ??
                  (projectsWithBacklog[0]?.backlog_project_id ?? "")
                }
                onValueChange={handleProjectChange}
              >
                <SelectTrigger id="project-select" className="w-full max-w-md">
                  <SelectValue placeholder={t("settings.selectProject")} />
                </SelectTrigger>
                <SelectContent>
                  {projectsWithBacklog.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.backlog_project_id as string}
                    >
                      {project.name}
                      {project.code ? ` (${project.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
