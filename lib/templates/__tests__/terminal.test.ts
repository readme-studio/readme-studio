import { describe, it, expect } from "vitest";
import { terminalTemplate } from "../terminal";
import type { ProfileConfig } from "../../types";

function baseConfig(overrides: Partial<ProfileConfig> = {}): ProfileConfig {
  return {
    name: "张三",
    tagline: "fullstack.dev",
    bio: "坐标杭州，专注于 Web 开发。",
    social: { github: "https://github.com/zhangsan" },
    featuredRepos: [
      {
        name: "repo-a",
        description: "原始描述文本",
        url: "https://github.com/x/repo-a",
        language: "TypeScript",
        stars: 10,
        useAiSummary: false,
      },
    ],
    stats: { showStars: true, showCommits: false, showPRs: false, showLanguages: false },
    previewTheme: "light",
    templateId: "terminal",
    ...overrides,
  };
}

describe("terminal template", () => {
  it("输出姓名、bash 代码块与 $ 提示符", () => {
    const out = terminalTemplate.render(baseConfig());
    expect(out).toContain("# 张三");
    expect(out).toContain("```bash");
    expect(out).toContain("$ whoami");
    expect(out).toContain("fullstack.dev");
    expect(out).toContain("$ cat bio.txt");
    expect(out).toContain("坐标杭州");
  });

  it("$ ls projects/ 列出仓库名（空格分隔）", () => {
    const out = terminalTemplate.render(
      baseConfig({
        featuredRepos: [
          { name: "repo-a", description: "", url: "", language: "", stars: 1, useAiSummary: false },
          { name: "repo-b", description: "", url: "", language: "", stars: 1, useAiSummary: false },
        ],
      }),
    );
    expect(out).toContain("$ ls projects/");
    expect(out).toContain("repo-a  repo-b");
  });

  it("项目列表以 <details> 折叠，且优先使用 AI 摘要", () => {
    const out = terminalTemplate.render(
      baseConfig({
        featuredRepos: [
          {
            name: "repo-a",
            description: "原始描述文本",
            url: "u",
            language: "TS",
            stars: 5,
            useAiSummary: true,
            aiSummary: "AI 生成的一句话简介",
          },
        ],
      }),
    );
    expect(out).toContain("<details>");
    expect(out).toContain("<summary>");
    expect(out).toContain("AI 生成的一句话简介");
    expect(out).not.toContain("原始描述文本");
  });

  it("含社交链接时输出「联系我」", () => {
    const out = terminalTemplate.render(baseConfig());
    expect(out).toContain("## 联系我");
    expect(out).toContain("[GitHub](https://github.com/zhangsan)");
  });
});
