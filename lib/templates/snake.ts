import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const snakeTemplate: Template = {
  id: "snake",
  name: "贪吃蛇",
  description: "将贡献图变成贪吃蛇游戏动画，趣味十足",
  thumbnail: "/thumbnails/snake.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];
    const username = githubUsername(config.social) ?? "user";

    lines.push(`# ${config.name}`);
    if (config.tagline) {
      lines.push(`> ${config.tagline}`);
    }

    lines.push("");
    lines.push("## 🐍 我的贡献");
    lines.push(
      `<img src="https://raw.githubusercontent.com/${username}/${username}/output/github-snake.svg" alt="Snake animation" />`,
    );
    lines.push("");
    lines.push(
      `> 贪吃蛇动画由 [Platane/snk](https://github.com/Platane/snk) 提供。你需要先在自己仓库中配置对应的 GitHub Action。`,
    );

    if (config.featuredRepos.length > 0) {
      lines.push("");
      lines.push("## 🎮 项目");
      for (const repo of config.featuredRepos) {
        const desc =
          repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
        lines.push(`- [${repo.name}](${repo.url}) — ${desc}`);
      }
    }

    if (hasSocial(config.social)) {
      lines.push("");
      lines.push(renderSocial(config.social));
    }

    return lines.join("\n") + "\n";
  },
};
