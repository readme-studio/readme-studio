import { describe, it, expect } from "vitest";
import { templates, getTemplate, type TemplateId } from "../index";
import type { ProfileConfig } from "../../types";

function sample(overrides: Partial<ProfileConfig> = {}): ProfileConfig {
  return {
    name: "张三",
    tagline: "fullstack.dev",
    bio: "坐标杭州，专注于 Web 开发。",
    location: "Hangzhou",
    company: "Acme",
    social: { github: "https://github.com/zhangsan", twitter: "@zhangsan" },
    featuredRepos: [
      {
        name: "readme-studio",
        description: "三分钟生成专业 GitHub 个人主页",
        url: "https://github.com/zhangsan/readme-studio",
        language: "TypeScript",
        stars: 1280,
        useAiSummary: true,
        aiSummary: "一站式生成精美主页。",
      },
    ],
    stats: {
      showStars: true,
      showCommits: true,
      showPRs: true,
      showLanguages: true,
    },
    previewTheme: "light",
    templateId: "minimal",
    ...overrides,
  };
}

describe("模板注册表（13 个）", () => {
  it("注册表包含 13 个模板且覆盖全部 TemplateId", () => {
    const ids = Object.keys(templates) as TemplateId[];
    expect(ids).toHaveLength(13);
    for (const id of ids) {
      expect(getTemplate(id)).toBeDefined();
    }
  });

  it("每个模板都能无异常 render，且输出含姓名（字面或 URL 编码）与尾部换行", () => {
    const nameEncoded = encodeURIComponent("张三");
    for (const [id, tp] of Object.entries(templates)) {
      const out = tp.render(sample({ templateId: id as ProfileConfig["templateId"] }));
      // 部分模板把姓名放进 capsule-render 图片 URL（encodeURIComponent），故两种形态都接受
      expect(out).toSatisfy(
        (s: string) => s.includes("张三") || s.includes(nameEncoded),
      );
      expect(out.endsWith("\n")).toBe(true);
    }
  });

  it("含 GitHub 用户名时，统计类模板正确注入 username", () => {
    for (const tp of Object.values(templates)) {
      const out = tp.render(
        sample({ templateId: tp.id as ProfileConfig["templateId"] }),
      );
      // 凡是引用 github-readme-stats 的，都应带正确 username
      if (out.includes("github-readme-stats.vercel.app")) {
        expect(out).toContain("username=zhangsan");
      }
    }
  });

  it("未填 GitHub 时仍不崩溃（username 回退为 user）", () => {
    for (const tp of Object.values(templates)) {
      const out = tp.render(
        sample({
          templateId: tp.id as ProfileConfig["templateId"],
          social: { twitter: "@zhangsan" },
        }),
      );
      expect(typeof out).toBe("string");
    }
  });
});
