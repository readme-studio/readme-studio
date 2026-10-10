import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const stickerTemplate: Template = {
  id: "sticker",
  name: "贴纸手账",
  description: "彩色徽章、emoji 点缀、手账拼贴风",
  thumbnail: "/thumbnails/sticker.png",
  render(config: ProfileConfig): string {
    const L: string[] = [];
    const un = githubUsername(config.social) ?? "user";

    L.push(`<h1 align="center">✨ ${config.name} ✨</h1>`);
    if (config.tagline) {
      L.push(`<p align="center">🌸 ${config.tagline} 🌸</p>`);
    }
    L.push("");
    L.push(`<p align="center">`);
    L.push(
      `<img src="https://img.shields.io/badge/📍_${encodeURIComponent(config.location || "Earth")}-ffb6c1?style=for-the-badge" />`,
    );
    if (config.company)
      L.push(
        `<img src="https://img.shields.io/badge/💼_${encodeURIComponent(config.company)}-b0e0e6?style=for-the-badge" />`,
      );
    L.push(`</p>`);
    L.push("");

    if (config.bio) {
      L.push(`<div align="center">`);
      L.push("");
      L.push(`📝 ${config.bio}`);
      L.push("");
      L.push(`</div>`);
    }

    if (config.stats.showStars || config.stats.showCommits) {
      L.push("");
      L.push(
        `<img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(un)}&show_icons=true&theme=rose_pine&hide_border=true&bg_color=fff0f5" />`,
      );
    }

    if (config.featuredRepos.length > 0) {
      L.push("");
      L.push("### 🎀 我的手作");
      for (const r of config.featuredRepos) {
        const d = r.useAiSummary && r.aiSummary ? r.aiSummary : r.description;
        L.push(`- 🌷 **[${r.name}](${r.url})** — ${d} \`⭐${r.stars}\``);
      }
    }

    if (hasSocial(config.social)) {
      L.push("");
      L.push(renderSocial(config.social));
    }
    return L.join("\n") + "\n";
  },
};
