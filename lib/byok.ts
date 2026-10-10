// 浏览器端 BYOK（Bring Your Own Key）直连逻辑。
// - OpenAI / Gemini：浏览器直接调用官方接口，Key 仅通过 Authorization 头传出，
//   不经过我们的服务器，也不计入服务端每日额度。
// - Anthropic：受 CORS 限制，走 /api/byok/proxy 服务端代理转发（见 app/api/byok/proxy）。
// 提示词与服务端 lib/summarize.ts 的 SYSTEM_PROMPT / buildOneRepoPrompt 保持一致（防幻觉规则）。

export type ByokProvider = "openai" | "anthropic" | "gemini";

const STORAGE_PREFIX = "byok:";

// 与服务端一致的系统提示词
const SYSTEM_PROMPT = `你是 GitHub 个人主页的「项目总结」助手。
用户会给你一个开源仓库的基本信息（名称、描述、主要语言、话题标签）。
请用简洁、专业、有吸引力的一句中文，概括这个项目是做什么的、解决了什么问题或亮点在哪。
要求：
- 只输出项目总结本身，不要寒暄、不要解释、不要使用 Markdown 标题或列表。
- 控制在 40 个汉字以内。
- 语气正式、克制，符合个人主页展示场景。`;

export interface RepoForSummary {
  name: string;
  description: string;
  language: string;
}

function buildPrompt(repo: RepoForSummary): string {
  const desc = (repo.description || "（无描述）").slice(0, 2000);
  return `请为以下项目写一句中文总结：\n1. ${repo.name} — ${desc}；主要语言：${repo.language || "未知"}`;
}

// ---- localStorage 密钥管理（仅浏览器） ----
export function getByokKey(provider: ByokProvider): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_PREFIX + provider);
}
export function setByokKey(provider: ByokProvider, key: string): void {
  localStorage.setItem(STORAGE_PREFIX + provider, key);
}
export function clearByokKey(provider: ByokProvider): void {
  localStorage.removeItem(STORAGE_PREFIX + provider);
}

// 统一入口：根据 provider 选择直连或代理
export async function summarizeWithBYOK(
  repo: RepoForSummary,
  provider: ByokProvider,
  apiKey: string,
): Promise<string> {
  if (provider === "openai") return summarizeOpenAI(repo, apiKey);
  if (provider === "gemini") return summarizeGemini(repo, apiKey);
  return summarizeAnthropicProxy(repo, apiKey);
}

async function summarizeOpenAI(repo: RepoForSummary, apiKey: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(repo) },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI 调用失败（${res.status}）${detail ? "：" + detail.slice(0, 120) : ""}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

async function summarizeGemini(repo: RepoForSummary, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
    apiKey,
  )}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: buildPrompt(repo) }] }],
      generationConfig: { temperature: 0.3 },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini 调用失败（${res.status}）${detail ? "：" + detail.slice(0, 120) : ""}`);
  }
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

// Anthropic 走服务端代理；代理以我们的 SSE 帧（{delta}）回流，这里聚合成完整文本
async function summarizeAnthropicProxy(repo: RepoForSummary, apiKey: string): Promise<string> {
  const res = await fetch("/api/byok/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "anthropic",
      model: "claude-3-5-haiku-latest",
      apiKey,
      messages: [{ role: "user", content: SYSTEM_PROMPT + "\n\n" + buildPrompt(repo) }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Claude 代理调用失败（${res.status}）${detail ? "：" + detail.slice(0, 120) : ""}`);
  }
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data) as { delta?: string; error?: string };
        if (json.error) throw new Error(json.error);
        if (json.delta) text += json.delta;
      } catch {
        // 忽略不完整帧
      }
    }
  }
  return text.trim();
}
