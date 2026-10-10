import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial } from "./shared";

export const zenTemplate: Template = {
  id: "zen",
  name: "禅意",
  description: "大量留白、单色、呼吸感极强的东方极简",
  thumbnail: "/thumbnails/zen.png",
  render(config: ProfileConfig): string {
    const L: string[] = [];

    L.push("");
    L.push(
      `<h1 align="center" style="font-weight:300;letter-spacing:8px;">${config.name}</h1>`,
    );
    L.push("");
    if (config.tagline) {
      L.push(
        `<p align="center" style="color:#999;letter-spacing:2px;">${config.tagline}</p>`,
      );
    }
    L.push("");
    L.push('<div align="center">◦ ◦ ◦</div>');
    L.push("");
    if (config.bio) {
      L.push(
        `<p align="center" style="max-width:600px;margin:auto;line-height:2;">${config.bio}</p>`,
      );
    }
    L.push("");
    L.push('<div align="center">◦ ◦ ◦</div>');

    if (config.featuredRepos.length > 0) {
      L.push("");
      L.push("");
      for (const r of config.featuredRepos) {
        const d = r.useAiSummary && r.aiSummary ? r.aiSummary : r.description;
        L.push(
          `<p align="center"><strong>${r.name}</strong><br/><span style="color:#999;">${d}</span><br/><a href="${r.url}">访问 →</a></p>`,
        );
      }
    }

    if (hasSocial(config.social)) {
      L.push("");
      L.push('<div align="center">');
      L.push("");
      L.push(renderSocial(config.social));
      L.push("");
      L.push("</div>");
    }
    return L.join("\n") + "\n";
  },
};
