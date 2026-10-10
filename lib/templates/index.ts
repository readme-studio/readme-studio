import type { Template } from "../types";
import { minimalTemplate } from "./minimal";
import { terminalTemplate } from "./terminal";
import { dashboardTemplate } from "./dashboard";
import { neonTemplate } from "./neon";
import { paperTemplate } from "./paper";
import { bentoTemplate } from "./bento";
import { galaxyTemplate } from "./galaxy";
import { terminalGreenTemplate } from "./terminalGreen";
import { glassmorphicTemplate } from "./glassmorphic";
import { magazineTemplate } from "./magazine";
import { aquaTemplate } from "./aqua";
import { emberTemplate } from "./ember";
import { snakeTemplate } from "./snake";

export type TemplateId =
  | "minimal"
  | "terminal"
  | "dashboard"
  | "neon"
  | "paper"
  | "bento"
  | "galaxy"
  | "terminalGreen"
  | "glassmorphic"
  | "magazine"
  | "aqua"
  | "ember"
  | "snake";

export {
  minimalTemplate,
  terminalTemplate,
  dashboardTemplate,
  neonTemplate,
  paperTemplate,
  bentoTemplate,
  galaxyTemplate,
  terminalGreenTemplate,
  glassmorphicTemplate,
  magazineTemplate,
  aquaTemplate,
  emberTemplate,
  snakeTemplate,
};

// 模板注册表：id -> Template 实现
export const templates: Record<TemplateId, Template> = {
  minimal: minimalTemplate,
  terminal: terminalTemplate,
  dashboard: dashboardTemplate,
  neon: neonTemplate,
  paper: paperTemplate,
  bento: bentoTemplate,
  galaxy: galaxyTemplate,
  terminalGreen: terminalGreenTemplate,
  glassmorphic: glassmorphicTemplate,
  magazine: magazineTemplate,
  aqua: aquaTemplate,
  ember: emberTemplate,
  snake: snakeTemplate,
};

// 按 templateId 取模板，未找到返回 undefined
export function getTemplate(id: string): Template | undefined {
  return templates[id as TemplateId];
}
