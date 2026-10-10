import type { ProfileConfig, Template } from "../types";
import { renderSocial, hasSocial, githubUsername } from "./shared";

export const ideTemplate: Template = {
  id: "ide",
  name: "IDE 编辑器",
  description: "模拟代码编辑器界面，带行号与语法高亮块",
  thumbnail: "/thumbnails/ide.png",
  render(config: ProfileConfig): string {
    const L: string[] = [];
    const un = githubUsername(config.social) ?? "user";

    L.push(
      `<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1e1e1e,100:252526&height=100&section=header&text=${encodeURIComponent(config.name)}&fontSize=40&fontColor=cccccc&desc=${encodeURIComponent(config.tagline || "developer.ts")}&descAlignY=70&descSize=14&descColor=858585" />`,
    );
    L.push("");
    L.push("```typescript");
    L.push(`// ${un}.ts`);
    L.push("export const developer = {");
    L.push(`  name: "${config.name}",`);
    if (config.tagline) L.push(`  role: "${config.tagline}",`);
    if (config.location) L.push(`  location: "${config.location}",`);
    if (config.company) L.push(`  company: "${config.company}",`);
    if (config.bio)
      L.push(
        `  bio: "${config.bio.replace(/"/g, '\\"').replace(/\n/g, " ")}",`,
      );
    L.push("};");
    L.push("");
    if (config.featuredRepos.length > 0) {
      L.push("export const projects = [");
      for (const r of config.featuredRepos) {
        const d = r.useAiSummary && r.aiSummary ? r.aiSummary : r.description;
        L.push(
          `  { name: "${r.name}", url: "${r.url}", stars: ${r.stars}, desc: "${d.replace(/"/g, '\\"')}" },`,
        );
      }
      L.push("];");
    }
    L.push("```");

    if (hasSocial(config.social)) {
      L.push("");
      L.push(renderSocial(config.social));
    }
    return L.join("\n") + "\n";
  },
};
