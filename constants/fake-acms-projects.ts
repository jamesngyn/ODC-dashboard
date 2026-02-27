/**
 * Fake ACMS projects (Tên dự án + Project ID Backlog) dùng tạm thời khi chưa có API.
 * Nguồn: bảng cấu hình dự án (Tên dự án | Project ID Backlog).
 */
export interface FakeAcmsProjectItem {
  name: string;
  backlog_project_id: string | null;
}

export const FAKE_ACMS_PROJECTS: FakeAcmsProjectItem[] = [
  { name: "Shokunin", backlog_project_id: "157932" },
  { name: "Caremaker", backlog_project_id: "157933" },
  { name: "Hupu", backlog_project_id: "157975" },
  { name: "Fax", backlog_project_id: null },
  { name: "LoveRec", backlog_project_id: null },
  { name: "Origin", backlog_project_id: null },
  { name: "Monolith", backlog_project_id: "157974" },
  {
    name: "Apptech - Hệ thống báo giá lắp pin mặt trời",
    backlog_project_id: null,
  },
  { name: "YST Maintain", backlog_project_id: null },
  { name: "F&L Homepage", backlog_project_id: null },
  { name: "Careco", backlog_project_id: null },
  { name: "Crane Course Booking Web", backlog_project_id: "157982" },
  { name: "Video Mail Service", backlog_project_id: "157264" },
  { name: "Performance test", backlog_project_id: "157159" },
];
