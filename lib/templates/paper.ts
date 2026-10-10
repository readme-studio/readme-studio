import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial } from "./shared";

export const paperTemplate: Template = {
  id: "paper",
  name: "编辑杂志",
  description: "象牙白排版，衬线字体，杂志式视觉层次",
  thumbnail: "/thumbnails/paper.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];

    lines.push(`# ${config.name}`);
    lines.push("");

    if (config.tagline) {
      lines.push(`*${config.tagline}*`);
      lines.push("");
    }

    if (config.bio) {
      lines.push(`> ${config.bio}`);
      lines.push("");
    }

    if (config.location || config.company) {
      const meta = [config.location, config.company].filter(Boolean).join(" · ");
      lines.push(`📍 ${meta}`);
      lines.push("");
    }

    if (hasSocial(config.social)) {
      lines.push("---");
      lines.push("");
      lines.push(renderSocial(config.social));
      lines.push("");
    }

    if (config.featuredRepos.length > 0) {
      lines.push("---");
      lines.push("");
      lines.push("### 精选作品");
      lines.push("");
      for (const repo of config.featuredRepos) {
        const desc =
          repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
        lines.push(`**${repo.name}** — ${desc}`);
        lines.push(`[查看项目 →](${repo.url})`);
        lines.push("");
      }
    }

    return lines.join("\n") + "\n";
  },
};
