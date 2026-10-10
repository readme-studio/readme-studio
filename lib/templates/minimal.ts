import type { ProfileConfig, Template } from "../types";
import { renderSocial, renderRepo, hasSocial } from "./shared";

export const minimalTemplate: Template = {
  id: "minimal",
  name: "极简风",
  description: "干净利落的单栏布局，突出姓名、简介与精选项目",
  thumbnail: "/thumbnails/minimal.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];

    lines.push(`# ${config.name}`);
    if (config.tagline) lines.push(`> ${config.tagline}`);
    if (config.bio) lines.push(config.bio);

    if (config.featuredRepos.length > 0) {
      lines.push("");
      lines.push("## 项目");
      for (const repo of config.featuredRepos) {
        lines.push(renderRepo(repo));
      }
    }

    if (hasSocial(config.social)) {
      lines.push("");
      lines.push("## 联系我");
      lines.push(renderSocial(config.social));
    }

    return lines.join("\n") + "\n";
  },
};
