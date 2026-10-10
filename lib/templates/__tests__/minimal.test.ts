import { describe, it, expect } from "vitest";
import { minimalTemplate } from "../minimal";
import type { ProfileConfig } from "../../types";

function baseConfig(overrides: Partial<ProfileConfig> = {}): ProfileConfig {
  return {
    name: "张三",
    tagline: "全栈开发者",
    bio: "坐标杭州，专注于 Web 开发和开发者工具。",
    social: {},
    featuredRepos: [],
    stats: {
      showStars: true,
      showCommits: false,
      showPRs: false,
      showLanguages: false,
    },
    previewTheme: "light",
    templateId: "minimal",
    ...overrides,
  };
}

describe("minimal template", () => {
  it("输出包含 name、tagline、bio", () => {
    const out = minimalTemplate.render(baseConfig());
    expect(out).toContain("# 张三");
    expect(out).toContain("> 全栈开发者");
    expect(out).toContain("坐标杭州");
  });

  it("空 featuredRepos 时不输出 '## 项目'", () => {
    const out = minimalTemplate.render(baseConfig({ featuredRepos: [] }));
    expect(out).not.toContain("## 项目");
  });

  it("空 social 时不输出 '## 联系我'", () => {
    const out = minimalTemplate.render(baseConfig({ social: {} }));
    expect(out).not.toContain("## 联系我");
  });

  it("useAiSummary=true 且 aiSummary 存在时，使用 aiSummary 替代 description", () => {
    const out = minimalTemplate.render(
      baseConfig({
        featuredRepos: [
          {
            name: "repo-a",
            description: "原始描述文本",
            url: "https://github.com/x/repo-a",
            language: "TypeScript",
            stars: 120,
            aiSummary: "AI 生成的一句话简介",
            useAiSummary: true,
          },
        ],
      }),
    );
    expect(out).toContain("## 项目");
    expect(out).toContain("AI 生成的一句话简介");
    expect(out).not.toContain("原始描述文本");
  });

  it("useAiSummary=false 时使用原始 description", () => {
    const out = minimalTemplate.render(
      baseConfig({
        featuredRepos: [
          {
            name: "repo-a",
            description: "原始描述文本",
            url: "https://github.com/x/repo-a",
            language: "TypeScript",
            stars: 120,
            aiSummary: "AI 生成的一句话简介",
            useAiSummary: false,
          },
        ],
      }),
    );
    expect(out).toContain("原始描述文本");
    expect(out).not.toContain("AI 生成的一句话简介");
  });

  it("含社交链接时输出以 · 分隔的 '## 联系我'", () => {
    const out = minimalTemplate.render(
      baseConfig({
        social: { github: "https://github.com/zhangsan", twitter: "@zhangsan" },
      }),
    );
    expect(out).toContain("## 联系我");
    expect(out).toContain("[GitHub](https://github.com/zhangsan)");
    expect(out).toContain("[Twitter](@zhangsan)");
  });
});
