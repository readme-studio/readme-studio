import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

const STATS_BASE = "https://github-readme-stats.vercel.app/api";
const TOP_LANGS_BASE = "https://github-readme-stats.vercel.app/api/top-langs/";

// 仪表盘风格模板：姓名 + tagline + 社交，项目表格，底部 github-readme-stats 统计卡片
export const dashboardTemplate: Template = {
  id: "dashboard",
  name: "仪表盘",
  description: "卡片式信息面板，集成 GitHub 官方统计卡片",
  thumbnail: "/thumbnails/dashboard.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];

    lines.push(`# ${config.name}`);
    if (config.tagline) lines.push(`> ${config.tagline}`);
    if (hasSocial(config.social)) {
      lines.push("");
      lines.push(renderSocial(config.social));
    }

    // 项目表格
    if (config.featuredRepos.length > 0) {
      lines.push("");
      lines.push("## 项目");
      lines.push("| 项目 | 描述 | Star |");
      lines.push("| --- | --- | --- |");
      for (const repo of config.featuredRepos) {
        const desc =
          repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
        lines.push(`| [${repo.name}](${repo.url}) | ${desc} | ⭐ ${repo.stars} |`);
      }
    }

    // 统计卡片：仅 dashboard 模板生效，由 config.stats 控制
    const statsOn =
      config.stats.showStars ||
      config.stats.showCommits ||
      config.stats.showPRs;
    const wantStats = statsOn || config.stats.showLanguages;
    const username = githubUsername(config.social);
    const theme = config.previewTheme === "dark" ? "dark" : "default";

    if (wantStats) {
      lines.push("");
      lines.push("## 统计");
      if (username) {
        if (statsOn) {
          const show = ["stars", "commits", "prs"]
            .filter((m) =>
              m === "stars"
                ? config.stats.showStars
                : m === "commits"
                  ? config.stats.showCommits
                  : config.stats.showPRs,
            )
            .join(",");
          const showParam = show ? `&show=${show}` : "";
          lines.push(
            `![统计](${STATS_BASE}?username=${encodeURIComponent(
              username,
            )}&show_icons=true&theme=${theme}${showParam})`,
          );
        }
        if (config.stats.showLanguages) {
          lines.push(
            `![语言分布](${TOP_LANGS_BASE}?username=${encodeURIComponent(
              username,
            )}&layout=compact&theme=${theme})`,
          );
        }
        lines.push("");
        lines.push(
          "> 📊 统计卡片由第三方服务 [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) 提供，可能因限流短暂不可用。",
        );
      } else {
        lines.push(
          "> 在「GitHub」链接中填写用户名后，这里会自动显示 Star / 提交 / PR / 语言分布统计卡片。",
        );
      }
    }

    return lines.join("\n") + "\n";
  },
};
