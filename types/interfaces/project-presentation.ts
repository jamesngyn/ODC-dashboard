/** Project Presentation API - GET /api/levels (hệ số rank theo level) */

export interface LevelItem {
  id: number;
  name: string;
  coefficient: number;
}

export interface LevelsResponse {
  status: number;
  message: string;
  level: LevelItem[];
}
