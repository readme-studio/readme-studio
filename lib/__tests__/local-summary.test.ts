import { describe, it, expect } from "vitest";
import {
  localSummaryForRepo,
  streamSummariesLocal,
  type LocalSummaryRepo,
} from "../local-summary";

describe("localSummaryForRepo", () => {
  it("有描述时融合描述与类别，并以句号结尾", () => {
    const repo: LocalSummaryRepo = {
      name: "readme-studio",
      description: "生成专业 GitHub 主页",
      language: "TypeScript",
      topics: ["github", "readme"],
    };
    const out = localSummaryForRepo(repo);
    expect(out).toContain("TypeScript");
    expect(out).toContain("开源项目"); // 无匹配话题 → 默认类别
    expect(out).toContain("生成专业 GitHub 主页");
    expect(out.endsWith("。")).toBe(true);
  });

  it("依据话题推断类别（cli → 命令行工具）", () => {
    const out = localSummaryForRepo({
      name: "mycli",
      description: "A fast cli",
      language: "Go",
      topics: ["cli", "tool"],
    });
    expect(out).toContain("命令行工具");
  });

  it("依据话题推断类别（react → 前端项目）", () => {
    const out = localSummaryForRepo({
      name: "ui-kit",
      description: "组件库",
      language: "TypeScript",
      topics: ["react", "ui"],
    });
    expect(out).toContain("前端项目");
  });

  it("无描述时退化为「名称 + 语言 + 类别」", () => {
    const out = localSummaryForRepo({
      name: "demo",
      description: "",
      language: "Rust",
      topics: [],
    });
    expect(out).toContain("demo");
    expect(out).toContain("Rust");
    expect(out).toContain("开源项目");
  });

  it("缺省语言时回退为「多语言」", () => {
    const out = localSummaryForRepo({
      name: "x",
      description: "做点东西",
      topics: [],
    });
    expect(out).toContain("多语言");
  });
});

describe("streamSummariesLocal", () => {
  it("逐块产出，拼接后与 localSummaryForRepo 一致", async () => {
    const repo: LocalSummaryRepo = {
      name: "demo",
      description: "一个示例",
      language: "Python",
      topics: ["ml"],
    };
    let acc = "";
    for await (const ev of streamSummariesLocal([repo])) {
      expect(ev.repo).toBe("demo");
      acc += ev.delta;
    }
    expect(acc).toBe(localSummaryForRepo(repo));
  });
});
