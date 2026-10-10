import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial } from "./shared";

export const swissTemplate: Template = {
  id: "swiss",
  name: "瑞士国际主义",
  description: "网格系统、无衬线字体、红黑对比的理性排版",
  thumbnail: "/thumbnails/swiss.png",
  render(config: ProfileConfig): string {
    const L: string[] = [];

    L.push(
      `<h1 style="font-family:Helvetica,Arial,sans-serif;font-weight:700;font-size:2.5em;letter-spacing:-1px;border-bottom:4px solid #e30613;padding-bottom:8px;">${config.name}</h1>`,
    );
    if (config.tagline) {
      L.push(
        `<p style="font-family:Helvetica,Arial,sans-serif;font-size:1.1em;color:#666;">${config.tagline}</p>`,
      );
    }
    L.push("");
    L.push("| | |");
    L.push("|---|---|");
    if (config.location) L.push(`| **Location** | ${config.location} |`);
    if (config.company) L.push(`| **Org** | ${config.company} |`);
    if (config.bio) L.push(`| **About** | ${config.bio.replace(/\n/g, " ")} |`);
    L.push("");

    if (config.featuredRepos.length > 0) {
      L.push("### Selected Work");
      L.push("");
      for (const r of config.featuredRepos) {
        const d = r.useAiSummary && r.aiSummary ? r.aiSummary : r.description;
        L.push(`**${r.name}**  `);
        L.push(`${d}  `);
        L.push(`[${r.url}](${r.url}) · ★ ${r.stars}`);
        L.push("");
      }
    }

    if (hasSocial(config.social)) {
      L.push("---");
      L.push("");
      L.push(renderSocial(config.social));
    }
    return L.join("\n") + "\n";
  },
};
