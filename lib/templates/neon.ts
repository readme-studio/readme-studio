import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const neonTemplate: Template = {
  id: "neon",
  name: "霓虹赛博",
  description: "暗黑霓虹主题，动态头部横幅与打字 SVG 效果",
  thumbnail: "/thumbnails/neon.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];
    const username = githubUsername(config.social) ?? "user";

    lines.push(
      `<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,100:ff00ff&height=200&section=header&text=${encodeURIComponent(config.name)}&fontSize=70&fontColor=ffffff&animation=fadeIn" />`,
    );
    lines.push("");

    if (config.tagline) {
      lines.push(
        `<p align="center"><a href="https://github.com/${username}"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=FF00FF&center=true&vCenter=true&width=600&lines=${encodeURIComponent(config.tagline)}" /></a></p>`,
      );
    }

    if (hasSocial(config.social)) {
      lines.push("");
      lines.push(renderSocial(config.social));
    }

    if (config.featuredRepos.length > 0) {
      lines.push("");
      lines.push("## ⚡ 项目");
      for (const repo of config.featuredRepos) {
        const desc =
          repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
        lines.push(`- [**${repo.name}**](${repo.url}) — ${desc} ⭐ ${repo.stars}`);
      }
    }

    if (config.stats.showStars || config.stats.showCommits) {
      lines.push("");
      lines.push("## 📊 统计");
      lines.push(
        `<img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(username)}&show_icons=true&theme=radical&hide_border=true" />`,
      );
    }

    return lines.join("\n") + "\n";
  },
};
