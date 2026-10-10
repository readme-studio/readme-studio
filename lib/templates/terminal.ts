import type { ProfileConfig, FeaturedRepo, Template } from "../types";
import { renderSocial, renderRepo, hasSocial } from "./shared";

// 终端风格模板：用 bash 代码块模拟命令行，项目列表以 <details> 折叠
export const terminalTemplate: Template = {
  id: "terminal",
  name: "终端风",
  description: "用命令行界面呈现个人主页，whoami / cat / ls 一目了然",
  thumbnail: "/thumbnails/terminal.png",
  render(config: ProfileConfig): string {
    const lines: string[] = [];

    lines.push(`# ${config.name}`);

    // 终端主体：等宽代码块 + $ 提示符
    const term: string[] = [];
    term.push("$ whoami");
    term.push(config.tagline || "");
    term.push("");
    term.push("$ cat bio.txt");
    term.push(config.bio || "");
    if (config.featuredRepos.length > 0) {
      term.push("");
      term.push("$ ls projects/");
      term.push(config.featuredRepos.map((r: FeaturedRepo) => r.name).join("  "));
    }

    lines.push("");
    lines.push("```bash");
    lines.push(term.join("\n"));
    lines.push("```");

    // 项目详情折叠区
    if (config.featuredRepos.length > 0) {
      lines.push("");
      lines.push("<details>");
      lines.push(
        `<summary>📂 ${config.featuredRepos.length} 个项目</summary>`,
      );
      lines.push("");
      for (const repo of config.featuredRepos) {
        lines.push(renderRepo(repo));
      }
      lines.push("");
      lines.push("</details>");
    }

    if (hasSocial(config.social)) {
      lines.push("");
      lines.push("## 联系我");
      lines.push(renderSocial(config.social));
    }

    return lines.join("\n") + "\n";
  },
};
