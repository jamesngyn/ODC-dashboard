import type { CommonSelectOption } from "@/components/ui/common-select";
import type { AcmsProject } from "@/types/interfaces/acms";

/**
 * Build options cho select Project từ getAcmsProjects.
 * - value = project.id (để gửi project_id lên API)
 * - label = project.name
 * - Mapping qua code: dùng getProjectByCode khi cần tìm project từ code.
 */
export function buildProjectSelectOptions(
  projects: AcmsProject[],
  allValue: string,
  allLabel: string
): CommonSelectOption[] {
  return [
    { value: allValue, label: allLabel },
    ...projects.map((p) => ({
      value: String(p.id),
      label: p.name,
    })),
  ];
}

/**
 * Tìm project theo code (mapping qua trường code).
 * Dùng khi có code (vd từ resource.project) cần lấy project tương ứng.
 */
export function getProjectByCode(
  projects: AcmsProject[],
  code: string
): AcmsProject | undefined {
  if (!code?.trim()) return undefined;
  const normalized = code.trim().toLowerCase();
  return projects.find(
    (p) => p.code?.trim().toLowerCase() === normalized
  );
}
