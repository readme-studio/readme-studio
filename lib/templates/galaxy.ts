import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const galaxyTemplate: Template = {
  id: "galaxy",
  name: "星系",
  description: "将仓库与贡献可视化为星系图谱",
  thumbnail: "/thumbnails/galaxy.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];
    const username = githubUsername(config.social) ?? "user";

    lines.push(`# 🌌 ${config.name}`);
    if (config.tagline) {
      lines.push(`> ${config.tagline}`);
      lines.push("");
    }

    lines.push(`<p align="center">`);
    lines.push(
      `<img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(username)}&show_icons=true&theme=midnight-purple&hide_border=true&bg_color=0d1117" />`,
    );
    lines.push(`</p>`);

    if (config.featuredRepos.length > 0) {
      lines.push("");
      lines.push("## ⭐ 恒星目录");
      for (const repo of config.featuredRepos) {
        const desc =
          repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
        lines.push(`- [**${repo.name}**](${repo.url}) — ${desc} · ⭐ ${repo.stars}`);
      }
    }

    if (config.stats.showLanguages) {
      lines.push("");
      lines.push(
        `<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${encodeURIComponent(username)}&layout=compact&theme=midnight-purple&hide_border=true&bg_color=0d1117" />`,
      );
    }

    if (hasSocial(config.social)) {
      lines.push("");
      lines.push(renderSocial(config.social));
    }

    return lines.join("\n") + "\n";
  },
};
