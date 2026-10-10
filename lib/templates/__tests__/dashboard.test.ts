import { describe, it, expect } from "vitest";
import { dashboardTemplate } from "../dashboard";
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
    templateId: "dashboard",
    ...overrides,
  };
}

const noStats = {
  showStars: false,
  showCommits: false,
  showPRs: false,
  showLanguages: false,
} as const;

describe("dashboard template", () => {
  it("输出姓名、tagline、社交与项目表格", () => {
    const out = dashboardTemplate.render(baseConfig());
    expect(out).toContain("# 张三");
    expect(out).toContain("> fullstack.dev");
    expect(out).toContain("## 项目");
    expect(out).toContain("| 项目 | 描述 | Star |");
    expect(out).toContain("[GitHub](https://github.com/zhangsan)");
  });

  it("showLanguages=true 时渲染 top-langs 卡片并含 username", () => {
    const out = dashboardTemplate.render(
      baseConfig({ stats: { ...noStats, showLanguages: true } }),
    );
    expect(out).toContain("## 统计");
    expect(out).toContain("api/top-langs/");
    expect(out).toContain("username=zhangsan");
  });

  it("showStars=true 时渲染主统计卡片并含 show=stars", () => {
    const out = dashboardTemplate.render(
      baseConfig({ stats: { ...noStats, showStars: true } }),
    );
    expect(out).toContain(
      "api?username=zhangsan&show_icons=true&theme=default&show=stars",
    );
  });

  it("Stars/Commits/PRs 合并到 show 参数", () => {
    const out = dashboardTemplate.render(
      baseConfig({
        stats: { showStars: true, showCommits: true, showPRs: true, showLanguages: false },
      }),
    );
    expect(out).toContain("&show=stars,commits,prs");
  });

  it("含第三方服务提示", () => {
    const out = dashboardTemplate.render(
      baseConfig({ stats: { ...noStats, showLanguages: true } }),
    );
    expect(out).toContain("github-readme-stats");
  });

  it("未填 GitHub 用户名时给提示而非破图", () => {
    const out = dashboardTemplate.render(
      baseConfig({
        social: {},
        stats: { ...noStats, showLanguages: true },
      }),
    );
    expect(out).not.toContain("github-readme-stats.vercel.app");
    expect(out).toContain("GitHub");
  });

  it("全部关闭统计时不渲染统计区块", () => {
    const out = dashboardTemplate.render(baseConfig({ social: {}, stats: { ...noStats } }));
    expect(out).not.toContain("## 统计");
  });

  it("previewTheme=dark 时统计卡片 theme=dark", () => {
    const out = dashboardTemplate.render(
      baseConfig({
        previewTheme: "dark",
        stats: { ...noStats, showLanguages: true },
      }),
    );
    expect(out).toContain("theme=dark");
  });
});
