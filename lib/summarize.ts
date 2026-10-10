import OpenAI from "openai";
import type { SummarizeRequest } from "./types";

export const SUMMARY_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `你是 GitHub 个人主页的「项目总结」助手。
用户会给你一个或多个开源仓库的基本信息（名称、描述、主要语言、话题标签）。
请用简洁、专业、有吸引力的一句中文，概括这个项目是做什么的、解决了什么问题或亮点在哪。
要求：
- 只输出项目总结本身，不要寒暄、不要解释、不要使用 Markdown 标题或列表。
- 控制在 40 个汉字以内。
- 语气正式、克制，符合个人主页展示场景。`;

// 根据仓库列表拼装用户提示词
export function buildUserPrompt(repos: SummarizeRequest["repos"]): string {
  const lines = repos.map((r, i) => {
    const topics = r.topics.length ? `（话题：${r.topics.join("、")}）` : "";
    return `${i + 1}. ${r.name} — ${r.description || "（无描述）"}；主要语言：${r.language || "未知"}${topics}`;
  });
  return `请为以下项目写一句中文总结：\n${lines.join("\n")}`;
}

// 真实调用 OpenAI，逐 token 产出摘要片段（delta）
export async function* streamSummary(
  repos: SummarizeRequest["repos"],
  apiKey: string,
): AsyncGenerator<string> {
  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: SUMMARY_MODEL,
    stream: true,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(repos) },
    ],
  });

  for await (const chunk of completion) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

// ---- SSE 帧封装（纯函数，便于单测） ----

export function frameDelta(delta: string): string {
  return `data: ${JSON.stringify({ delta })}\n\n`;
}

export const SSE_DONE = `data: [DONE]\n\n`;

export function frameError(message: string): string {
  return `event: error\ndata: ${JSON.stringify({ error: message })}\n\n`;
}

// 把任意异步片段源包装成 SSE 流：每个片段一帧，结束发 [DONE]，异常发 error 事件
export function summarizeToSse(
  source: AsyncIterable<string>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of source) {
          controller.enqueue(encoder.encode(frameDelta(delta)));
        }
        controller.enqueue(encoder.encode(SSE_DONE));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "AI 总结生成失败";
        controller.enqueue(encoder.encode(frameError(msg)));
      } finally {
        controller.close();
      }
    },
  });
}

// 统一的 SSE 响应头
export function createSseResponse(
  stream: ReadableStream<Uint8Array>,
  init?: ResponseInit,
): Response {
  return new Response(stream, {
    ...init,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      ...(init?.headers ?? {}),
    },
  });
}
