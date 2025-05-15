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
