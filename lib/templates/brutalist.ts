import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial } from "./shared";

export const brutalistTemplate: Template = {
  id: "brutalist",
  name: "粗野主义",
  description: "超大字号、高对比、零圆角的激进排版",
  thumbnail: "/thumbnails/brutalist.png",
  render(config: ProfileConfig): string {
    const L: string[] = [];

    L.push(
      `<h1 align="center" style="font-size:5em;font-weight:900;letter-spacing:-4px;margin:0;">${config.name.toUpperCase()}</h1>`,
    );
    if (config.tagline) {
      L.push(
        `<p align="center" style="font-size:1.5em;font-weight:700;background:#000;color:#fff;padding:8px;">${config.tagline.toUpperCase()}</p>`,
      );
    }
    L.push("");
    L.push("---");
    if (config.bio) {
      L.push("");
      L.push(`<p style="font-size:1.2em;line-height:1.6;">${config.bio}</p>`);
    }
    if (config.featuredRepos.length > 0) {
      L.push("");
      L.push("## ▓▓▓ WORK");
      for (const r of config.featuredRepos) {
        const d = r.useAiSummary && r.aiSummary ? r.aiSummary : r.description;
        L.push(`### ${r.name.toUpperCase()}`);
        L.push(`${d} → **[${r.url}](${r.url})**`);
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
