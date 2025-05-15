// Common query keys for react-query or tanstack-query

export const QUERY_KEYS = {
  AUTH: {
    LOGIN: ["auth", "login"] as const,
    REGISTER: ["auth", "register"] as const,
    PROFILE: ["auth", "profile"] as const,
  },
  USER: {
    LIST: ["user", "list"] as const,
    DETAIL: (id: string | number) => ["user", "detail", id] as const,
  },
  // Thêm các nhóm key khác nếu cần
} as const;
