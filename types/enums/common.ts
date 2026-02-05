export enum ApiErrorCode {
  // Các mã lỗi chung
  INVALID_REQUEST = "INVALID_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",

  // Lỗi xác thực
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",

  // Lỗi dữ liệu
}

export enum TaskType {
  Requirement = "Requirement",
  Development = "Development",
  Testing = "Testing",
  UAT = "UAT",
  Release = "Release",
}

export enum BacklogCategory {
  ClearRequirement = "Clear Requirement",
  Coding = "Coding",
  Testing = "Testing",
  UAT = "UAT",
  Release = "Release",
}

export enum TaskStatus {
  Open = "Open",
  InProgress = "In Progress",
  Resolved = "Resolved",
  Pending = "Pending",
  Closed = "Closed",
}

/**
 * Backlog API parentChild filter (Count Issue / Get Issue List).
 * @see https://developer.nulab.com/docs/backlog/api/2/count-issue/
 */
export const BacklogParentChild = {
  /** All (parent + child) */
  All: 0,
  /** Exclude Child Issue (chỉ parent + task không có con) */
  ExcludeChild: 1,
  /** Child Issue only */
  ChildOnly: 2,
  /** Neither Parent nor Child (chỉ task đứng một mình) */
  NeitherParentNorChild: 3,
  /** Parent Issue only (chỉ Gtask / parent) */
  ParentOnly: 4,
} as const;

export type BacklogParentChildType =
  (typeof BacklogParentChild)[keyof typeof BacklogParentChild];
