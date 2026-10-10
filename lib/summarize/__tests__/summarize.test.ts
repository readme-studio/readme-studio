import { describe, it, expect } from "vitest";
import {
  frameRepoEvent,
  SSE_DONE,
  summariesToSse,
  buildOneRepoPrompt,
} from "../../summarize";
import type { SummarizeRequest } from "../../types";

const sampleRepos: SummarizeRequest["repos"] = [
  {
    name: "readme-studio",
    description: "生成专业 GitHub 主页",
    language: "TypeScript",
    topics: ["github", "readme"],
  },
];

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

describe("SSE 帧封装（逐仓库事件）", () => {
  it("frameRepoEvent 输出 data: JSON 帧（delta / error）", () => {
    expect(frameRepoEvent({ repo: "a", delta: "你好" })).toBe(
      'data: {"repo":"a","delta":"你好"}\n\n',
    );
    expect(frameRepoEvent({ repo: "a", error: "失败" })).toBe(
      'data: {"repo":"a","error":"失败"}\n\n',
    );
  });

  it("SSE_DONE 为结束帧", () => {
    expect(SSE_DONE).toBe("data: [DONE]\n\n");
  });
});

describe("buildOneRepoPrompt", () => {
  it("包含仓库名、描述、语言与话题", () => {
    const prompt = buildOneRepoPrompt(sampleRepos[0]);
    expect(prompt).toContain("readme-studio");
    expect(prompt).toContain("生成专业 GitHub 主页");
    expect(prompt).toContain("TypeScript");
    expect(prompt).toContain("github");
  });

  it("描述按 2000 字符截断", () => {
    const long = buildOneRepoPrompt({
      name: "x",
      description: "字".repeat(5000),
      language: "Go",
      topics: [],
    });
    // 前缀 + 2000 描述 + 少量后缀
    expect(long.length).toBeLessThanOrEqual(
      '请为以下项目写一句中文总结：\n1. x — '.length + 2000 + 40,
    );
    expect(long).not.toContain("字".repeat(5000));
  });
});

describe("summariesToSse（并发逐仓库回流）", () => {
  it("逐事件封装并以 [DONE] 结束", async () => {
    const stream = summariesToSse(
      (async function* () {
        yield { repo: "a", delta: "一个" };
        yield { repo: "b", delta: "专业" };
      })(),
    );
    const out = await readStream(stream);
    expect(out).toBe(
      'data: {"repo":"a","delta":"一个"}\n\ndata: {"repo":"b","delta":"专业"}\n\ndata: [DONE]\n\n',
    );
  });

  it("源抛错时输出 error 事件帧并以 [DONE] 结束", async () => {
    const stream = summariesToSse(
      (async function* () {
        yield { repo: "a", delta: "部分" };
        throw new Error("boom");
      })(),
    );
    const out = await readStream(stream);
    expect(out).toContain('"error":"boom"');
    expect(out.endsWith("data: [DONE]\n\n")).toBe(true);
  });
});
