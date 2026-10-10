import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const bentoTemplate: Template = {
  id: "bento",
  name: "Bento 网格",
  description: "卡片式网格布局，信息密度高，现代仪表盘感",
  thumbnail: "/thumbnails/bento.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];
    const username = githubUsername(config.social) ?? "user";

    lines.push(`<h1 align="center">${config.name}</h1>`);
    if (config.tagline) {
      lines.push(`<p align="center"><em>${config.tagline}</em></p>`);
    }

    lines.push("");
    lines.push(`<table>`);
    lines.push(`<tr>`);
    lines.push(`<td width="50%" valign="top">`);

    if (config.bio) {
      lines.push(`<h3>👤 关于我</h3>`);
      lines.push(`<p>${config.bio}</p>`);
    }

    if (hasSocial(config.social)) {
      lines.push(`<h3>🔗 联系</h3>`);
      lines.push(renderSocial(config.social));
    }

    lines.push(`</td>`);
    lines.push(`<td width="50%" valign="top">`);

    if (config.stats.showStars || config.stats.showCommits) {
      lines.push(`<h3>📊 统计</h3>`);
      lines.push(
        `<img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(username)}&show_icons=true&hide_border=true&theme=transparent" width="100%" />`,
      );
    }

    lines.push(`</td>`);
    lines.push(`</tr>`);
    lines.push(`</table>`);

    if (config.featuredRepos.length > 0) {
      lines.push("");
      lines.push("### 🚀 项目");
      for (const repo of config.featuredRepos) {
        const desc =
          repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
        lines.push(`- **[${repo.name}](${repo.url})** — ${desc} ⭐ ${repo.stars}`);
      }
    }

    return lines.join("\n") + "\n";
  },
};
