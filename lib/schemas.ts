import { z } from "zod";

// ProfileConfig 的 zod 镜像。约束与类型逐字段对齐 lib/types.ts 的 ProfileConfig，
// 不新增业务字段；消息统一用 i18n key，在组件渲染时通过 t() 翻译。
// 这样「校验失败」时 error.message 是 key，前端再映射到 zh-CN 文案。

export const previewThemeSchema = z.enum(["light", "dark", "auto"]);
export const templateIdSchema = z.enum(["minimal", "terminal", "dashboard"]);

// 社交链接：允许为空串或 undefined，非空必须是合法 URL / 邮箱
export const socialSchema = z.object({
  github: z.string().url("urlInvalid").or(z.literal("")).optional(),
  twitter: z.string().url("urlInvalid").or(z.literal("")).optional(),
  linkedin: z.string().url("urlInvalid").or(z.literal("")).optional(),
  blog: z.string().url("urlInvalid").or(z.literal("")).optional(),
  email: z.string().email("emailInvalid").or(z.literal("")).optional(),
});

export const statsSchema = z.object({
  showStars: z.boolean(),
  showCommits: z.boolean(),
  showPRs: z.boolean(),
  showLanguages: z.boolean(),
});

export const featuredRepoSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string(),
  language: z.string(),
  stars: z.number(),
  aiSummary: z.string().optional(),
  useAiSummary: z.boolean(),
});

export const profileConfigSchema = z.object({
  name: z.string().trim().min(1, "nameRequired").max(50, "nameTooLong"),
  tagline: z.string().max(100, "taglineTooLong"),
  bio: z.string().max(500, "bioTooLong"),
  location: z.string().max(100, "tooLong").optional(),
  company: z.string().max(100, "tooLong").optional(),
  social: socialSchema,
  featuredRepos: z.array(featuredRepoSchema),
  stats: statsSchema,
  previewTheme: previewThemeSchema,
  templateId: templateIdSchema,
});

// 表单可编辑字段的 schema（featuredRepos 由选择器掌控，不参与文本校验）
export const profileFormSchema = profileConfigSchema.omit({ featuredRepos: true });

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileConfigSchema = z.infer<typeof profileConfigSchema>;
