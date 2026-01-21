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
