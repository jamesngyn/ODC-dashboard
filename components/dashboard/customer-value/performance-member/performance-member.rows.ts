"use client";

import type { AcmsResource } from "@/types/interfaces/acms";
import type { BacklogIssue } from "@/types/interfaces/common";
import { getPointFromIssue, getReEstimateEffortFromIssue } from "@/lib/utils";

import type {
  BacklogProjectMapping,
  BacklogProjectsResult,
  MemberAggregate,
  MemberPerformanceRow,
  ProjectPerformanceRow,
} from "./performance-member.types";

function aggregateClosedIssuesByAssignee(
  issues: BacklogIssue[]
): Map<number, MemberAggregate> {
  const map = new Map<number, MemberAggregate>();

  for (const issue of issues) {
    const assigneeId = issue.assignee?.id;
    if (assigneeId == null) continue;

    const estimated = Math.max(0, issue.estimatedHours ?? 0);
    const reEstimate = getReEstimateEffortFromIssue(issue);
    const actual = Math.max(0, issue.actualHours ?? 0);
    const point = getPointFromIssue(issue);

    const existing = map.get(assigneeId);
    if (existing) {
      existing.estimatedEffortHours += estimated;
      existing.reEstimateEffortHours += reEstimate;
      existing.actualEffortHours += actual;
      existing.uspPoint += point;
    } else {
      map.set(assigneeId, {
        estimatedEffortHours: estimated,
        reEstimateEffortHours: reEstimate,
        actualEffortHours: actual,
        uspPoint: point,
      });
    }
  }

  return map;
}

function buildPerformanceByEstimate(
  estimated: number,
  actual: number,
  rankCoeff: number
): number | null {
  const denom = actual * rankCoeff;
  if (denom <= 0) return null;
  return (estimated / denom) * 100;
}

function buildPerformanceByReEstimate(
  reEstimate: number,
  actual: number,
  rankCoeff: number
): number | null {
  const denom = actual * rankCoeff;
  if (denom <= 0) return null;
  return (reEstimate / denom) * 100;
}

function buildPerformanceByPoint(
  point: number,
  actual: number,
  rankCoeff: number
): number | null {
  const denom = actual * rankCoeff;
  if (denom <= 0) return null;
  return point / denom;
}

export function buildBacklogProjectMappings(
  projects: { id: number; name: string; code: string; backlog_project_id: string | number | null }[]
): BacklogProjectMapping[] {
  return projects
    .map((project) => ({
      project,
      normalizedBacklogProjectId:
        project.backlog_project_id == null
          ? ""
          : String(project.backlog_project_id).trim(),
    }))
    .filter(({ normalizedBacklogProjectId }) => normalizedBacklogProjectId !== "")
    .map((item) => ({
      acmsProjectId: item.project.id,
      acmsProjectName: item.project.name,
      acmsProjectCode: item.project.code,
      backlogProjectId: item.normalizedBacklogProjectId,
    }));
}

export function buildPerformanceMemberRows(options: {
  acmsByEmail: Map<string, AcmsResource>;
  backlogProjectsResult: BacklogProjectsResult | undefined;
  backlogProjectMappings: BacklogProjectMapping[];
  selectedTeamId: string;
  selectedProjectId: string;
  allValue: string;
  nameFilter: string;
}): MemberPerformanceRow[] {
  const {
    acmsByEmail,
    backlogProjectsResult,
    backlogProjectMappings,
    selectedTeamId,
    selectedProjectId,
    allValue,
    nameFilter,
  } = options;

  const mappingByAcmsProjectId = new Map<number, BacklogProjectMapping>();
  for (const mapping of backlogProjectMappings) {
    mappingByAcmsProjectId.set(mapping.acmsProjectId, mapping);
  }

  const backlogDataByAcmsProjectId = new Map<
    number,
    {
      issueAggregateByAssigneeId: Map<number, MemberAggregate>;
      memberIdByEmail: Map<string, number>;
    }
  >();

  const backlogProjectData = backlogProjectsResult?.items ?? [];
  for (const projectData of backlogProjectData) {
    const memberIdByEmail = new Map<string, number>();
    for (const member of projectData.members) {
      const normalizedEmail = member.mailAddress?.trim().toLowerCase();
      if (!normalizedEmail) continue;
      memberIdByEmail.set(normalizedEmail, member.id);
    }

    backlogDataByAcmsProjectId.set(projectData.mapping.acmsProjectId, {
      issueAggregateByAssigneeId: aggregateClosedIssuesByAssignee(projectData.issues),
      memberIdByEmail,
    });
  }

  const memberRows: MemberPerformanceRow[] = [];
  const acmsMembers = Array.from(acmsByEmail.values());

  for (const acmsMember of acmsMembers) {
    if (selectedTeamId !== allValue && String(acmsMember.team?.id) !== selectedTeamId) {
      continue;
    }

    const participatingProjectIds = new Set<number>();
    for (const allocate of acmsMember.allocates ?? []) {
      if (mappingByAcmsProjectId.has(allocate.project_id)) {
        participatingProjectIds.add(allocate.project_id);
      }
    }

    if (acmsMember.project) {
      const fallbackMapping = backlogProjectMappings.find(
        (mapping) => mapping.acmsProjectName === acmsMember.project
      );
      if (fallbackMapping) participatingProjectIds.add(fallbackMapping.acmsProjectId);
    }

    const normalizedEmail = acmsMember.email?.trim().toLowerCase() ?? "";
    const rankCoefficient = acmsMember.level?.coefficient ?? 1;
    const projectRows: ProjectPerformanceRow[] = [];

    for (const projectId of Array.from(participatingProjectIds)) {
      const mapping = mappingByAcmsProjectId.get(projectId);
      if (!mapping) continue;

      const backlogData = backlogDataByAcmsProjectId.get(projectId);
      const backlogMemberId = normalizedEmail
        ? backlogData?.memberIdByEmail.get(normalizedEmail)
        : undefined;
      const aggregate =
        backlogMemberId != null
          ? backlogData?.issueAggregateByAssigneeId.get(backlogMemberId)
          : undefined;
      const safeAggregate: MemberAggregate = aggregate ?? {
        estimatedEffortHours: 0,
        reEstimateEffortHours: 0,
        actualEffortHours: 0,
        uspPoint: 0,
      };

      projectRows.push({
        key: `${acmsMember.user_id}-${projectId}`,
        projectId,
        projectName: mapping.acmsProjectName,
        projectCode: mapping.acmsProjectCode || "-",
        estimatedEffortHours: safeAggregate.estimatedEffortHours,
        reEstimateEffortHours: safeAggregate.reEstimateEffortHours,
        actualEffortHours: safeAggregate.actualEffortHours,
        uspPoint: safeAggregate.uspPoint,
        performanceByEstimatePercent: buildPerformanceByEstimate(
          safeAggregate.estimatedEffortHours,
          safeAggregate.actualEffortHours,
          rankCoefficient
        ),
        performanceByReEstimatePercent: buildPerformanceByReEstimate(
          safeAggregate.reEstimateEffortHours,
          safeAggregate.actualEffortHours,
          rankCoefficient
        ),
        performanceByPoint: buildPerformanceByPoint(
          safeAggregate.uspPoint,
          safeAggregate.actualEffortHours,
          rankCoefficient
        ),
      });
    }

    const memberRow: MemberPerformanceRow = {
      key: String(acmsMember.user_id),
      employeeId: acmsMember.code ?? "-",
      fullName: acmsMember.name ?? "-",
      email: acmsMember.email ?? "-",
      roles: acmsMember.position?.name ?? "-",
      jobRank: acmsMember.level?.name ?? "-",
      rankCoefficient,
      projects: projectRows.sort((a, b) => a.projectName.localeCompare(b.projectName)),
      estimatedEffortHours: 0,
      reEstimateEffortHours: 0,
      actualEffortHours: 0,
      uspPoint: 0,
      performanceByEstimatePercent: null,
      performanceByReEstimatePercent: null,
      performanceByPoint: null,
    };

    memberRows.push(memberRow);
  }

  const filteredMemberRows = memberRows
    .map((memberRow) => {
      const filteredProjects =
        selectedProjectId === allValue
          ? memberRow.projects
          : memberRow.projects.filter((project) => String(project.projectId) === selectedProjectId);
      return { ...memberRow, projects: filteredProjects };
    })
    .filter((memberRow) => memberRow.projects.length > 0 || selectedProjectId === allValue);

  const keyword = nameFilter.trim().toLowerCase();
  const nameFilteredRows = keyword
    ? filteredMemberRows.filter((memberRow) => {
        const candidates = [memberRow.fullName, memberRow.employeeId, memberRow.email]
          .join(" ")
          .toLowerCase();
        return candidates.includes(keyword);
      })
    : filteredMemberRows;

  const rows = nameFilteredRows.map((memberRow) => {
    const estimatedEffortHours = memberRow.projects.reduce(
      (sum, project) => sum + project.estimatedEffortHours,
      0
    );
    const reEstimateEffortHours = memberRow.projects.reduce(
      (sum, project) => sum + project.reEstimateEffortHours,
      0
    );
    const actualEffortHours = memberRow.projects.reduce(
      (sum, project) => sum + project.actualEffortHours,
      0
    );
    const uspPoint = memberRow.projects.reduce((sum, project) => sum + project.uspPoint, 0);

    return {
      ...memberRow,
      projects: memberRow.projects,
      estimatedEffortHours,
      reEstimateEffortHours,
      actualEffortHours,
      uspPoint,
      performanceByEstimatePercent: buildPerformanceByEstimate(
        estimatedEffortHours,
        actualEffortHours,
        memberRow.rankCoefficient
      ),
      performanceByReEstimatePercent: buildPerformanceByReEstimate(
        reEstimateEffortHours,
        actualEffortHours,
        memberRow.rankCoefficient
      ),
      performanceByPoint: buildPerformanceByPoint(uspPoint, actualEffortHours, memberRow.rankCoefficient),
    };
  });

  rows.sort((a, b) => a.employeeId.localeCompare(b.employeeId));
  return rows;
}

