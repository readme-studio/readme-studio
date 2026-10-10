import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const blueprintTemplate: Template = {
  id: "blueprint",
  name: "蓝图",
  description: "工程图纸风格，网格线、编号与规格说明",
  thumbnail: "/thumbnails/blueprint.png",
  render(config: ProfileConfig): string {
    const L: string[] = [];
    const un = githubUsername(config.social) ?? "user";

    L.push(
      `<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0a1929,100:1e3a5f&height=140&section=header&text=${encodeURIComponent(config.name)}&fontSize=48&fontColor=64b5f6&desc=${encodeURIComponent(config.tagline || "")}&descAlignY=75&descSize=16" />`,
    );
    L.push("");
    L.push("```");
    L.push("┌─ SPECIFICATION ─────────────────────────┐");
    if (config.bio) L.push(`│  ${config.bio.slice(0, 38).padEnd(38)}│`);
    if (config.location) L.push(`│  LOCATION: ${config.location.padEnd(27)}│`);
    if (config.company) L.push(`│  ORG:      ${config.company.padEnd(27)}│`);
    L.push("└─────────────────────────────────────────┘");
    L.push("```");

    if (config.stats.showStars || config.stats.showCommits) {
      L.push("");
      L.push(
        `<img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(un)}&show_icons=true&theme=blue-green&hide_border=true&bg_color=0a1929&title_color=64b5f6&icon_color=64b5f6&text_color=90caf9" />`,
      );
    }

    if (config.featuredRepos.length > 0) {
      L.push("");
      L.push("### ■ MODULES");
      for (const r of config.featuredRepos) {
        const d = r.useAiSummary && r.aiSummary ? r.aiSummary : r.description;
        L.push(`- \`${r.name}\` — ${d} · [源文件](${r.url})`);
      }
    }

    if (hasSocial(config.social)) {
      L.push("");
      L.push(renderSocial(config.social));
    }
    return L.join("\n") + "\n";
  },
};
