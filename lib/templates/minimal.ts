import type { ProfileConfig, FeaturedRepo, Template } from "../types";

// 社交平台展示标签（key 与 ProfileConfig.social 字段对应）
const SOCIAL_LABELS: Record<keyof ProfileConfig["social"], string> = {
  github: "GitHub",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  blog: "博客",
  email: "Email",
};

// 把社交链接渲染为以 · 分隔的 Markdown 链接串
function renderSocial(social: ProfileConfig["social"]): string {
  const parts: string[] = [];
  (Object.keys(SOCIAL_LABELS) as Array<keyof ProfileConfig["social"]>).forEach(
    (key) => {
      const value = social[key];
      if (value) {
        const label = SOCIAL_LABELS[key];
        const href = key === "email" ? `mailto:${value}` : value;
        parts.push(`[${label}](${href})`);
      }
    },
  );
  return parts.join(" · ");
}

// 单个项目行：优先使用 AI 摘要（useAiSummary 且存在），否则用原始描述
function renderRepo(repo: FeaturedRepo): string {
  const desc =
    repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
  return `- **[${repo.name}](${repo.url})**: ${desc} ⭐ ${repo.stars}`;
}

export const minimalTemplate: Template = {
  id: "minimal",
  name: "极简风",
  description: "干净利落的单栏布局，突出姓名、简介与精选项目",
  thumbnail: "/thumbnails/placeholder.svg",
  render(config: ProfileConfig): string {
    const lines: string[] = [];

    lines.push(`# ${config.name}`);
    if (config.tagline) lines.push(`> ${config.tagline}`);
    if (config.bio) lines.push(config.bio);

    if (config.featuredRepos.length > 0) {
      lines.push("");
      lines.push("## 项目");
      for (const repo of config.featuredRepos) {
        lines.push(renderRepo(repo));
      }
    }

    const hasSocial = (
      Object.keys(SOCIAL_LABELS) as Array<keyof ProfileConfig["social"]>
    ).some((key) => Boolean(config.social[key]));
    if (hasSocial) {
      lines.push("");
      lines.push("## 联系我");
      lines.push(renderSocial(config.social));
    }

    return lines.join("\n") + "\n";
  },
};
