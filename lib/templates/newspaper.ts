import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial } from "./shared";

export const newspaperTemplate: Template = {
  id: "newspaper",
  name: "报纸",
  description: "衬线大标题、分栏、报头分隔线的传统报纸排版",
  thumbnail: "/thumbnails/newspaper.png",
  render(config: ProfileConfig): string {
    const L: string[] = [];
    const today = new Date().toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    L.push(
      `<h1 align="center" style="font-family:Georgia,'Times New Roman',serif;font-weight:900;font-size:3em;letter-spacing:2px;margin-bottom:0;">THE ${config.name.toUpperCase()} TIMES</h1>`,
    );
    L.push(
      `<p align="center" style="font-family:Georgia,serif;font-size:0.9em;color:#666;border-top:3px double #333;border-bottom:3px double #333;padding:6px 0;">${today} · Vol. I · 独家报道</p>`,
    );
    L.push("");
    if (config.tagline) {
      L.push(
        `<h2 align="center" style="font-family:Georgia,serif;font-style:italic;font-weight:400;">${config.tagline}</h2>`,
      );
    }
    L.push("");
    if (config.bio) {
      L.push(
        `<p style="font-family:Georgia,serif;text-align:justify;line-height:1.8;column-count:2;column-gap:2em;">${config.bio}</p>`,
      );
    }

    if (config.featuredRepos.length > 0) {
      L.push("");
      L.push("---");
      L.push("");
      L.push("### 专题报道");
      for (const r of config.featuredRepos) {
        const d = r.useAiSummary && r.aiSummary ? r.aiSummary : r.description;
        L.push(`**${r.name}** — ${d}  `);
        L.push(`*[阅读全文](${r.url})* · ⭐ ${r.stars}`);
        L.push("");
      }
    }

    if (hasSocial(config.social)) {
      L.push("---");
      L.push("");
      L.push(
        `<p style="font-family:Georgia,serif;font-size:0.85em;color:#666;">联系方式：</p>`,
      );
      L.push(renderSocial(config.social));
    }
    return L.join("\n") + "\n";
  },
};
