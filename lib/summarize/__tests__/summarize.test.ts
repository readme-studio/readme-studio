import { describe, it, expect } from "vitest";
import {
  frameDelta,
  SSE_DONE,
  frameError,
  summarizeToSse,
  buildUserPrompt,
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

describe("SSE 帧封装", () => {
  it("frameDelta 输出 data: JSON 帧", () => {
    expect(frameDelta("你好")).toBe('data: {"delta":"你好"}\n\n');
  });

  it("SSE_DONE 为结束帧", () => {
    expect(SSE_DONE).toBe("data: [DONE]\n\n");
  });

  it("frameError 输出 error 事件帧", () => {
    expect(frameError("出错了")).toBe('event: error\ndata: {"error":"出错了"}\n\n');
  });
});

describe("buildUserPrompt", () => {
  it("包含仓库名、描述、语言与话题", () => {
    const prompt = buildUserPrompt(sampleRepos);
    expect(prompt).toContain("readme-studio");
    expect(prompt).toContain("生成专业 GitHub 主页");
    expect(prompt).toContain("TypeScript");
    expect(prompt).toContain("github");
  });
});

describe("summarizeToSse", () => {
  it("把片段流逐帧封装并以 [DONE] 结束", async () => {
    const stream = summarizeToSse(
      (async function* () {
        yield "一个";
        yield "专业";
      })(),
    );
    const out = await readStream(stream);
    expect(out).toBe(
      'data: {"delta":"一个"}\n\ndata: {"delta":"专业"}\n\ndata: [DONE]\n\n',
    );
  });

  it("源抛错时输出 error 事件帧", async () => {
    const stream = summarizeToSse(
      (async function* () {
        yield "部分";
        throw new Error("AI 总结生成失败");
      })(),
    );
    const out = await readStream(stream);
    expect(out).toContain('event: error\ndata: {"error":"AI 总结生成失败"}');
  });
});
