import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const vaporwaveTemplate: Template = {
  id: "vaporwave",
  name: "蒸汽波",
  description: "粉紫渐变、日文点缀、80 年代复古未来主义",
  thumbnail: "/thumbnails/vaporwave.png",
  render(config: ProfileConfig): string {
    const L: string[] = [];
    const un = githubUsername(config.social) ?? "user";

    L.push(
      `<img src="https://capsule-render.vercel.app/api?type=waving&color=0:ff71ce,50:b967ff,100:01cdfe&height=200&section=header&text=${encodeURIComponent(config.name)}&fontSize=60&fontColor=ffffff&animation=twinkling" />`,
    );
    L.push("");
    if (config.tagline) {
      L.push(
        `<p align="center"><img src="https://readme-typing-svg.demolab.com?font=VT323&size=26&pause=1000&color=FF71CE&center=true&vCenter=true&width=600&lines=${encodeURIComponent(config.tagline)};%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF" /></p>`,
      );
    }
    L.push("");
    L.push('<div align="center">');
    L.push("");
    L.push("**✦ 未来 ✦ 记忆 ✦ 数据流 ✦**");
    L.push("");
    if (config.bio) L.push(`*${config.bio}*`);
    L.push("");
    L.push("</div>");

    if (config.stats.showStars || config.stats.showCommits) {
      L.push("");
      L.push(
        `<img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(un)}&show_icons=true&theme=omni&hide_border=true&bg_color=2a1a3e&title_color=ff71ce&icon_color=01cdfe&text_color=b967ff" />`,
      );
    }

    if (config.featuredRepos.length > 0) {
      L.push("");
      L.push("### ╰┈➤ アーカイブ");
      for (const r of config.featuredRepos) {
        const d = r.useAiSummary && r.aiSummary ? r.aiSummary : r.description;
        L.push(`- **${r.name}** — ${d} · [→](${r.url})`);
      }
    }

    if (hasSocial(config.social)) {
      L.push("");
      L.push(renderSocial(config.social));
    }
    return L.join("\n") + "\n";
  },
};
