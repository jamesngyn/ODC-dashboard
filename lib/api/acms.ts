import configs from "@/constants/config";

import type {
  AcmsProjectsResponse,
  AcmsResourcesResponse,
  AcmsTeamsResponse,
} from "@/types/interfaces/acms";
import { LevelsResponse } from "@/types/interfaces/project-presentation";

import { sendGet } from "./axios";

const baseUrl = configs.ACMS_API_URL;

export interface AcmsResourcesParams {
  from: string;
  to: string;
  period?: "day" | "week" | "month";
  page?: number;
  limit?: number;
  project_id?: number | string;
  /** Tìm theo tên (name/code/email). Gửi sau khi debounce. */
  name?: string;
  "team_ids[]"?: number[];
}

export const getAcmsResources = (
  params?: AcmsResourcesParams
): Promise<AcmsResourcesResponse> => {
  const paramsWithProjectType = {
    ...params,
    "project_type[]": [1, 2],
  };
  return sendGet(`${baseUrl}/resources`, paramsWithProjectType);
};

export const getAcmsProjects = (): Promise<AcmsProjectsResponse> =>
  sendGet(`${baseUrl}/projects`);

export const getAcmsProjectsList = (): Promise<AcmsProjectsResponse> =>
  sendGet(`${baseUrl}/projects`);

export const getAcmsTeams = (): Promise<AcmsTeamsResponse> =>
  sendGet(`${baseUrl}/teams`, { is_active_project: 1 });

/**
 * Lấy danh sách level và hệ số rank (coefficient) từ Project Presentation API.
 * Dùng để map level (id hoặc name) sang hệ số rank cho Performance Member.
 */
export const getLevels = (): Promise<LevelsResponse> =>
  sendGet(`${baseUrl}/api/levels`);
