import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const cyberpunkTemplate: Template = {
  id: "cyberpunk",
  name: "赛博朋克",
  description: "黄黑警示色、故障感、义体改造风",
  thumbnail: "/thumbnails/cyberpunk.png",
  render(config: ProfileConfig): string {
    const L: string[] = [];
    const un = githubUsername(config.social) ?? "user";

    L.push(
      `<img src="https://capsule-render.vercel.app/api?type=slice&color=0:fcee0a,100:000000&height=180&section=header&text=${encodeURIComponent(config.name)}&fontSize=70&fontColor=000000&animation=blinking" />`,
    );
    L.push("");
    if (config.tagline) {
      L.push(
        `<p align="center"><code style="background:#fcee0a;color:#000;padding:4px 12px;font-weight:bold;">⚠ ${config.tagline.toUpperCase()} ⚠</code></p>`,
      );
    }
    L.push("");
    L.push("```diff");
    L.push("+ STATUS: ONLINE");
    if (config.location) L.push(`+ SECTOR: ${config.location}`);
    if (config.company) L.push(`+ AFFILIATION: ${config.company}`);
    if (config.bio) L.push(`! ${config.bio.replace(/\n/g, " ")}`);
    L.push("```");

    if (config.stats.showStars || config.stats.showCommits) {
      L.push("");
      L.push(
        `<img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(un)}&show_icons=true&theme=dark&hide_border=true&bg_color=000000&title_color=fcee0a&icon_color=fcee0a&text_color=ffffff" />`,
      );
    }

    if (config.featuredRepos.length > 0) {
      L.push("");
      L.push("### >> 数据档案");
      for (const r of config.featuredRepos) {
        const d = r.useAiSummary && r.aiSummary ? r.aiSummary : r.description;
        L.push(`- \`[${r.name}]\` ${d} · [接入](${r.url}) · ★${r.stars}`);
      }
    }

    if (hasSocial(config.social)) {
      L.push("");
      L.push(`<p align="center"><sub>// 加密频道</sub></p>`);
      L.push(renderSocial(config.social));
    }
    return L.join("\n") + "\n";
  },
};
