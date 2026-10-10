import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial } from "./shared";

export const magazineTemplate: Template = {
  id: "magazine",
  name: "数字杂志",
  description: "大标题、双栏排版、强调视觉冲击力的杂志风格",
  thumbnail: "/thumbnails/magazine.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];

    lines.push(
      `<h1 align="center" style="font-size:3em; letter-spacing:-2px;">${config.name}</h1>`,
    );
    lines.push("");

    if (config.tagline) {
      lines.push(`<p align="center"><strong>${config.tagline}</strong></p>`);
      lines.push("");
    }

    lines.push("---");
    lines.push("");

    if (config.bio) {
      lines.push(config.bio);
      lines.push("");
    }

    if (config.featuredRepos.length > 0) {
      lines.push("## 本期专题");
      lines.push("");
      for (const repo of config.featuredRepos) {
        const desc =
          repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
        lines.push(`### ${repo.name}`);
        lines.push(desc);
        lines.push(`[→ 查看项目](${repo.url}) · ⭐ ${repo.stars}`);
        lines.push("");
      }
    }

    if (hasSocial(config.social)) {
      lines.push("---");
      lines.push("");
      lines.push(renderSocial(config.social));
    }

    return lines.join("\n") + "\n";
  },
};
