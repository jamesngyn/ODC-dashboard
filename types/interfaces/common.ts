// Common API request interface
export interface BaseApiRequest {
  // Có thể mở rộng thêm các trường chung cho mọi request nếu cần
}

// Common API response interface
export interface BaseApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// API error response
export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode?: string | number;
  errors?: Record<string, string[]>; // Lỗi theo từng trường
}

// API paginated response
export interface ApiPaginatedResponse<T = unknown>
  extends BaseApiResponse<T[]> {
  page: number;
  pageSize: number;
  total: number;
}

export interface BacklogCategoryItem {
  id: number;
  projectId: number;
  name: string;
  displayOrder: number;
}

export interface BacklogIssue {
  id: number;
  issueKey: string;
  summary: string;
  status: {
    id: number;
    name: string;
  };
  issueType: {
    id: number;
    name: string;
  };
  startDate: string | null;
  dueDate: string | null;
  created?: string;
  updated?: string;
  actualHours?: number | null;
  estimatedHours?: number | null;
  assignee?: {
    id: number;
    userId: string;
    name: string;
  } | null;
  category?: BacklogCategoryItem[];
  priority?: { id: number; name: string };
  customFields?: {
    id: number;
    fieldTypeId: number;
    name: string;
    value: string;
  }[];
}

export interface BacklogIssueType {
  id: number;
  projectId: number;
  name: string;
  color: string;
  displayOrder: number;
  templateSummary: string | null;
  templateDescription: string | null;
}

export interface BacklogMilestone {
  id: number;
  projectId: number;
  name: string;
  description: string;
  startDate: string | null;
  releaseDueDate: string | null;
  archived: boolean;
  displayOrder: number;
}

export interface BacklogStatus {
  id: number;
  name: string;
}

export interface BacklogUser {
  id: number;
  userId: string; // login ID
  name: string;
  roleType: number;
  lang: string | null;
  nulabAccount?: {
    nulabId: string;
    name: string;
    uniqueId: string;
  };
  mailAddress: string;
  lastLoginTime: string; // ISO 8601 string
}
