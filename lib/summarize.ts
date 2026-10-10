import OpenAI from "openai";
import type { SummarizeRequest } from "./types";

export const SUMMARY_MODEL = "gpt-4o-mini";

// 单仓库总结超时（与文档一致：单仓库 >30s 降级）
const REPO_TIMEOUT_MS = 30_000;
// 描述截断上限，避免超长 description 吃掉 token
const DESC_MAX_CHARS = 2000;

const SYSTEM_PROMPT = `你是 GitHub 个人主页的「项目总结」助手。
用户会给你一个开源仓库的基本信息（名称、描述、主要语言、话题标签）。
请用简洁、专业、有吸引力的一句中文，概括这个项目是做什么的、解决了什么问题或亮点在哪。
要求：
- 只输出项目总结本身，不要寒暄、不要解释、不要使用 Markdown 标题或列表。
- 控制在 40 个汉字以内。
- 语气正式、克制，符合个人主页展示场景。`;

export type RepoInput = SummarizeRequest["repos"][number];

// 单个仓库的提示词：描述按字节截断至 2000 字符
export function buildOneRepoPrompt(repo: RepoInput): string {
  const desc = (repo.description || "（无描述）").slice(0, DESC_MAX_CHARS);
  const topics = repo.topics.length ? `（话题：${repo.topics.join("、")}）` : "";
  return `请为以下项目写一句中文总结：\n1. ${repo.name} — ${desc}；主要语言：${repo.language || "未知"}${topics}`;
}

// SSE 事件：逐仓库回流。delta 为增量片段；error 为该仓库的失败信息
export interface RepoSummaryEvent {
  repo: string;
  delta?: string;
  error?: string;
}

// 单个仓库的 LLM 流：逐 token 产出 {repo, delta}；失败产出 {repo, error}
export async function* summarizeOne(
  repo: RepoInput,
  apiKey: string,
): AsyncGenerator<RepoSummaryEvent> {
  const openai = new OpenAI({ apiKey });
  try {
    const completion = await openai.chat.completions.create(
      {
        model: SUMMARY_MODEL,
        stream: true,
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildOneRepoPrompt(repo) },
        ],
      },
      { signal: AbortSignal.timeout(REPO_TIMEOUT_MS) },
    );
    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield { repo: repo.name, delta };
    }
  } catch (e) {
    const err = e as Error;
    const msg =
      err?.name === "TimeoutError" ? "总结超时（>30s），已跳过" : err?.message || "总结失败";
    yield { repo: repo.name, error: msg };
  }
}

// 把多个异步生成器按到达顺序交错合并（并发总结、逐仓库回流）
async function* mergeGenerators(
  generators: AsyncGenerator<RepoSummaryEvent>[],
): AsyncGenerator<RepoSummaryEvent> {
  const iterators = generators.map((g) => g[Symbol.asyncIterator]());
  const nexts: Array<Promise<IteratorResult<RepoSummaryEvent>> | null> =
    iterators.map((it) => it.next());

  while (true) {
    const pending = nexts
      .map((p, i) => (p ? p.then(() => i) : null))
      .filter((x): x is Promise<number> => x !== null);
    if (pending.length === 0) break;

    const idx = await Promise.race(pending);
    const { value, done } = await nexts[idx]!;
    if (done) {
      nexts[idx] = null;
      continue;
    }
    yield value;
    nexts[idx] = iterators[idx].next();
  }
}

// 并发总结多个仓库，产出逐仓库事件流
export function streamSummaries(
  repos: RepoInput[],
  apiKey: string,
): AsyncGenerator<RepoSummaryEvent> {
  const generators = repos.map((r) => summarizeOne(r, apiKey));
  return mergeGenerators(generators);
}

// ---- SSE 帧封装（纯函数，便于单测） ----

export function frameRepoEvent(event: RepoSummaryEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export const SSE_DONE = `data: [DONE]\n\n`;

// 把逐仓库事件源包装成 SSE 流：每事件一帧，结束发 [DONE]，异常发 error 事件
export function summariesToSse(
  source: AsyncIterable<RepoSummaryEvent>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of source) {
          controller.enqueue(encoder.encode(frameRepoEvent(event)));
        }
        controller.enqueue(encoder.encode(SSE_DONE));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "AI 总结生成失败";
        controller.enqueue(encoder.encode(frameRepoEvent({ repo: "", error: msg })));
        controller.enqueue(encoder.encode(SSE_DONE));
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
