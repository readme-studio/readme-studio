import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial } from "./shared";

export const emberTemplate: Template = {
  id: "ember",
  name: "余烬",
  description: "深红琥珀色调，电影感任务控制台风格",
  thumbnail: "/thumbnails/ember.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];

    lines.push(`<h1 align="center">🔥 ${config.name}</h1>`);
    lines.push("");

    if (config.tagline) {
      lines.push(`> *${config.tagline}*`);
      lines.push("");
    }

    if (config.bio) {
      lines.push(config.bio);
      lines.push("");
    }

    if (config.featuredRepos.length > 0) {
      lines.push("## 🎯 任务列表");
      lines.push("");
      for (const repo of config.featuredRepos) {
        const desc =
          repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
        lines.push(`- ☑️ **${repo.name}** — ${desc} ⭐ ${repo.stars}`);
      }
      lines.push("");
    }

    if (config.location || config.company) {
      const meta = [config.location, config.company].filter(Boolean).join(" · ");
      lines.push(`📍 ${meta}`);
      lines.push("");
    }

    if (hasSocial(config.social)) {
      lines.push(renderSocial(config.social));
    }

    return lines.join("\n") + "\n";
  },
};
