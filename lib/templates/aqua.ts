import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const aquaTemplate: Template = {
  id: "aqua",
  name: "深海青蓝",
  description: "深青与电光薄荷色系，数据密集型展示",
  thumbnail: "/thumbnails/aqua.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];
    const username = githubUsername(config.social) ?? "user";

    lines.push(
      `<img src="https://capsule-render.vercel.app/api?type=rect&color=0:006d77,100:83c5be&height=120&section=header&text=${encodeURIComponent(config.name)}&fontSize=50&fontColor=ffffff" />`,
    );
    lines.push("");

    if (config.tagline) {
      lines.push(`> ${config.tagline}`);
      lines.push("");
    }

    lines.push("| | |");
    lines.push("|---|---|");

    if (config.bio) {
      lines.push(`| **关于** | ${config.bio} |`);
    }
    if (config.location) {
      lines.push(`| **位置** | ${config.location} |`);
    }
    if (config.company) {
      lines.push(`| **公司** | ${config.company} |`);
    }

    lines.push("");
    lines.push(
      `<img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(username)}&show_icons=true&theme=blue-green&hide_border=true" />`,
    );

    if (config.featuredRepos.length > 0) {
      lines.push("");
      lines.push("## 🚢 项目");
      for (const repo of config.featuredRepos) {
        const desc =
          repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
        lines.push(`- [${repo.name}](${repo.url}) — ${desc}`);
      }
    }

    if (hasSocial(config.social)) {
      lines.push("");
      lines.push(renderSocial(config.social));
    }

    return lines.join("\n") + "\n";
  },
};
