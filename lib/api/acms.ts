import configs from "@/constants/config";
import { FAKE_ACMS_PROJECTS } from "@/constants/fake-acms-projects";
import type {
  AcmsDivisionDetail,
  AcmsProject,
  AcmsProjectsResponse,
  AcmsResourcesResponse,
  AcmsTeamsResponse,
} from "@/types/interfaces/acms";
import { sendGet } from "./axios";
import { LevelsResponse } from "@/types/interfaces/project-presentation";

const acmsBase = configs.ACMS_API_URL;
const baseUrl = configs.PROJECT_PRESENTATION_API_URL;

const USE_FAKE_ACMS_PROJECTS =
  process.env.NEXT_PUBLIC_USE_FAKE_ACMS_PROJECTS === "true";

function buildFakeAcmsProjectsResponse(): AcmsProjectsResponse {
  const defaultDivision = {
    id: 0,
    name: "",
    avatar: null,
    type: 0,
    status: 0,
    is_active_project: 0,
    level: 0,
    address: null,
    parent_id: null,
    founding_at: null,
    description: null,
    total_member: 0,
    created_at: null,
    updated_at: null,
    deleted_at: null,
  } as AcmsDivisionDetail;

  const data: AcmsProject[] = FAKE_ACMS_PROJECTS.map((item, index) => ({
    id: index + 1,
    name: item.name,
    code: "",
    status: "1",
    backlog_project_id: item.backlog_project_id,
    parent_id: null,
    division_id: 0,
    team_id: 0,
    contract_type: null,
    project_type: null,
    billable: 0,
    budget: null,
    rank: null,
    customer_type: null,
    industry: null,
    language: null,
    scope: null,
    number_process_apply: null,
    legal: 0,
    communication: null,
    description: null,
    contract_information: null,
    critical: null,
    note: null,
    teams_webhook_url: null,
    start_date: null,
    end_date: null,
    created_at: null,
    updated_at: null,
    deleted_at: null,
    pm_ids: [],
    pqa_ids: [],
    seller_ids: [],
    billable_max: 0,
    customers: [],
    project_managers: [],
    division: defaultDivision,
    ot: 0,
    calendar_effort: 0,
    actual_effort: 0,
    daily_report_effort: 0,
    effort_in_the_future: 0,
    effort_ot: 0,
  }));

  return {
    status: 200,
    message: "OK",
    projects: { current_page: 1, data },
  };
}

export interface AcmsResourcesParams {
  from: string;
  to: string;
  period?: "day" | "week" | "month";
}

export const getAcmsResources = (
  params?: AcmsResourcesParams
): Promise<AcmsResourcesResponse> =>
  sendGet(`${acmsBase}/resources`, params);

export const getAcmsProjects = (): Promise<AcmsProjectsResponse> =>
  USE_FAKE_ACMS_PROJECTS
    ? Promise.resolve(buildFakeAcmsProjectsResponse())
    : sendGet(`${acmsBase}/projects`);

export const getAcmsTeams = (): Promise<AcmsTeamsResponse> =>
  sendGet(`${acmsBase}/teams`, { is_active_project: 1 });



/**
 * Lấy danh sách level và hệ số rank (coefficient) từ Project Presentation API.
 * Dùng để map level (id hoặc name) sang hệ số rank cho Performance Member.
 */
export const getLevels = (): Promise<LevelsResponse> =>
  sendGet(`${baseUrl}/api/levels`);