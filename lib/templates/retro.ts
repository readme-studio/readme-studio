import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial } from "./shared";

export const retroTemplate: Template = {
  id: "retro",
  name: "复古像素",
  description: "8-bit 像素风，等宽字体与方块字符",
  thumbnail: "/thumbnails/retro.png",
  render(config: ProfileConfig): string {
    const L: string[] = [];
    L.push("```");
    L.push("╔══════════════════════════════════════╗");
    L.push(`║  ${config.name.padEnd(34)}║`);
    if (config.tagline) L.push(`║  ${config.tagline.slice(0, 34).padEnd(34)}║`);
    L.push("╚══════════════════════════════════════╝");
    L.push("```");

    if (config.bio) {
      L.push("");
      L.push(`> ${config.bio}`);
    }

    if (config.featuredRepos.length > 0) {
      L.push("");
      L.push("### ▸ GAME LIBRARY");
      for (const r of config.featuredRepos) {
        const d = r.useAiSummary && r.aiSummary ? r.aiSummary : r.description;
        L.push(`\`[★${String(r.stars).padStart(4, "0")}]\` **[${r.name}](${r.url})** — ${d}`);
      }
    }

    if (hasSocial(config.social)) {
      L.push("");
      L.push(renderSocial(config.social));
    }
    return L.join("\n") + "\n";
  },
};
