/** ACMS API - response resources (Busy Rate) */

export interface AcmsDivision {
  id: number;
  name: string;
}

export interface AcmsTeam {
  id: number;
  name: string;
}

export interface AcmsLevel {
  id: number;
  name: string;
  coefficient: number;
}

export interface AcmsPosition {
  id: number;
  name: string;
}

export interface AcmsSkill {
  id: number;
  user_id: number;
  skill_id: number;
  skill: string;
  is_main: number;
  experience: number;
  months_experience: number | null;
  position_id: number;
  position_name: string;
}

export interface AcmsDayScheduleItem {
  work_date: string;
  total_daily_report: number;
  daily_report_effort: number;
  allocate_effort: number;
  actual_effort: number;
}

export interface AcmsResource {
  _id: string;
  user_id: number;
  email: string;
  name: string;
  code: string;
  status: number;
  checkout_date: string | null;
  division: AcmsDivision;
  team: AcmsTeam;
  onboard_date: string;
  skills: AcmsSkill[];
  level: AcmsLevel;
  position: AcmsPosition;
  completed_projects: unknown[];
  project: string;
  allocates: unknown[];
  unpaid_leave: unknown[];
  day_schedule: AcmsDayScheduleItem[];
}

export interface AcmsResourcesPayload {
  current_page: number;
  data: AcmsResource[];
}

export interface AcmsResourcesResponse {
  status: number;
  message: string;
  resources: AcmsResourcesPayload;
}

/** Project manager item trong GET /api/projects */
export interface AcmsProjectManager {
  id: number;
  name: string;
  avatar: string | null;
}

/** Division object trong GET /api/projects (chi tiết) */
export interface AcmsDivisionDetail {
  id: number;
  name: string;
  avatar: string | null;
  type: number;
  status: number;
  is_active_project: number;
  level: number;
  address: string | null;
  parent_id: number | null;
  founding_at: string | null;
  description: string | null;
  total_member: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

/** Project - GET /api/projects (theo response API) */
export interface AcmsProject {
  id: number;
  name: string;
  code: string;
  status: string;
  backlog_project_id: string | null;
  parent_id: number | null;
  division_id: number;
  team_id: number;
  contract_type: string | null;
  project_type: string | null;
  billable: number;
  budget: number | null;
  rank: string | null;
  customer_type: string | null;
  industry: string | null;
  language: string | null;
  scope: string | null;
  number_process_apply: string | null;
  legal: number;
  communication: string | null;
  description: string | null;
  contract_information: string | null;
  critical: string | null;
  note: string | null;
  teams_webhook_url: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  pm_ids: number[];
  pqa_ids: number[];
  seller_ids: number[];
  billable_max: number;
  customers: unknown[];
  project_managers: AcmsProjectManager[];
  division: AcmsDivisionDetail;
  ot: number;
  calendar_effort: number;
  actual_effort: number;
  daily_report_effort: number;
  effort_in_the_future: number;
  effort_ot: number;
}

/** Team item từ GET /api/teams (lọc resource theo Division/Team) */
export interface AcmsTeamListItem {
  id: number;
  name: string;
  division_id?: number;
  division_name?: string;
  division?: AcmsDivision;
}

export interface AcmsProjectsPayload {
  current_page: number;
  data: AcmsProject[];
}

export interface AcmsProjectsResponse {
  status: number;
  message: string;
  projects: AcmsProjectsPayload;
}

export interface AcmsTeamsResponse {
  data: AcmsTeamListItem[];
}
