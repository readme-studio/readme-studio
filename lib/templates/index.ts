import type { Template } from "../types";
import { minimalTemplate } from "./minimal";

export { minimalTemplate };

// 模板注册表：id -> Template 实现
export const templates: Record<string, Template> = {
  minimal: minimalTemplate,
};

// 按 templateId 取模板，未找到返回 undefined
export function getTemplate(id: string): Template | undefined {
  return templates[id];
}

export type TemplateId = keyof typeof templates;
