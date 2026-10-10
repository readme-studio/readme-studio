import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const terminalGreenTemplate: Template = {
  id: "terminalGreen",
  name: "终端绿",
  description: "经典黑底绿字终端风格，带打字动画效果",
  thumbnail: "/thumbnails/terminalGreen.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];
    const username = githubUsername(config.social) ?? "user";

    lines.push("```bash");
    lines.push(`$ whoami`);
    lines.push(config.name);
    if (config.tagline) {
      lines.push("");
      lines.push(`$ cat tagline.txt`);
      lines.push(config.tagline);
    }
    if (config.bio) {
      lines.push("");
      lines.push(`$ cat about.md`);
      lines.push(config.bio);
    }
    lines.push("```");
    lines.push("");

    if (config.featuredRepos.length > 0) {
      lines.push("```bash");
      lines.push(`$ ls -la ~/projects`);
      for (const repo of config.featuredRepos) {
        const desc =
          repo.useAiSummary && repo.aiSummary ? repo.aiSummary : repo.description;
        lines.push(`${repo.name.padEnd(20)} ${desc} ⭐${repo.stars}`);
      }
      lines.push("```");
      lines.push("");
    }

    if (config.stats.showStars || config.stats.showCommits) {
      lines.push(
        `<img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(username)}&show_icons=true&theme=chartreuse-dark&hide_border=true&bg_color=000000" />`,
      );
      lines.push("");
    }

    if (hasSocial(config.social)) {
      lines.push(renderSocial(config.social));
    }

    return lines.join("\n") + "\n";
  },
};
