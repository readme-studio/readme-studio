import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const glassmorphicTemplate: Template = {
  id: "glassmorphic",
  name: "玻璃态",
  description: "高级玻璃拟态效果，柔和渐变与半透明层次",
  thumbnail: "/thumbnails/glassmorphic.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];
    const username = githubUsername(config.social) ?? "user";

    lines.push(
      `<img src="https://capsule-render.vercel.app/api?type=blur&color=0:667eea,100:764ba2&height=180&section=header&text=${encodeURIComponent(config.name)}&fontSize=60&fontColor=ffffff" />`,
    );
    lines.push("");

    if (config.tagline) {
      lines.push(`<p align="center"><em>${config.tagline}</em></p>`);
    }

    lines.push("");
    lines.push(
      `<img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(username)}&show_icons=true&theme=transparent&hide_border=true&title_color=667eea&icon_color=764ba2&text_color=333" />`,
    );

    if (config.featuredRepos.length > 0) {
      lines.push("");
      lines.push("## ✨ 精选");
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
