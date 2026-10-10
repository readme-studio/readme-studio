import type { ProfileConfig, FeaturedRepo } from "../types";

// 社交平台展示标签（key 与 ProfileConfig.social 字段对应）
export const SOCIAL_LABELS: Record<keyof ProfileConfig["social"], string> = {
  github: "GitHub",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  blog: "博客",
  email: "Email",
};

// 把社交链接渲染为以 · 分隔的 Markdown 链接串
export function renderSocial(social: ProfileConfig["social"]): string {
  const parts: string[] = [];
  (
    Object.keys(SOCIAL_LABELS) as Array<keyof ProfileConfig["social"]>
  ).forEach((key) => {
    const value = social[key];
    if (value) {
      const label = SOCIAL_LABELS[key];
      const href = key === "email" ? `mailto:${value}` : value;
      parts.push(`[${label}](${href})`);
    }
  });
  return parts.join(" · ");
}

// 单个项目行：优先使用 AI 摘要（useAiSummary 且存在），否则用原始描述
export function renderRepo(repo: FeaturedRepo): string {
  const desc =
    repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
  return `- **[${repo.name}](${repo.url})**: ${desc} ⭐ ${repo.stars}`;
}

// 某模板是否包含任意社交链接
export function hasSocial(
  social: ProfileConfig["social"],
): boolean {
  return (
    Object.keys(SOCIAL_LABELS) as Array<keyof ProfileConfig["social"]>
  ).some((key) => Boolean(social[key]));
}

// 从 social.github 提取 GitHub 用户名（支持完整 URL、@用户名、纯用户名）
export function githubUsername(social: ProfileConfig["social"]): string | null {
  const raw = social.github?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last ? last : null;
  } catch {
    // 非 URL：可能是 @octocat 或 octocat
    const cleaned = raw.replace(/^@/, "").split("/").pop() ?? "";
    return cleaned || null;
  }
}
