import type { Template } from "../types";
import { minimalTemplate } from "./minimal";
import { terminalTemplate } from "./terminal";
import { dashboardTemplate } from "./dashboard";

export type TemplateId = "minimal" | "terminal" | "dashboard";

export { minimalTemplate, terminalTemplate, dashboardTemplate };

// 模板注册表：id -> Template 实现
export const templates: Record<TemplateId, Template> = {
  minimal: minimalTemplate,
  terminal: terminalTemplate,
  dashboard: dashboardTemplate,
};

// 按 templateId 取模板，未找到返回 undefined
export function getTemplate(id: string): Template | undefined {
  return templates[id as TemplateId];
}
