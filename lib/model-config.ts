// 模型源解析。
//
// 部署目标（Vercel 等）没有本地 Ollama，因此「无 OPENAI_API_KEY」统一视为 none，
// 由路由改走 lib/local-summary.ts 的本地启发式生成器（零依赖、零费用、永不联网失败）。
//
// 想用真·LLM，有两种零/低成本方式：
//   1) 服务端：设置 OPENAI_API_KEY（可选 OPENAI_BASE_URL 指向任意 OpenAI 兼容服务，
//      如 DeepSeek / 硅基流动 / 通义千问 / 本地 Ollama 的 /v1 端点），全员共享；
//   2) 浏览器端 BYOK：用户在自己机器填 Key（见 lib/byok.ts），Key 不落服务器。
//
// 把选择逻辑抽成纯函数，便于在无网络环境下用单测覆盖（无需真正调用模型）。

export type ModelSource = "openai" | "none";

export interface ModelConfig {
  source: ModelSource;
  baseURL: string;
  apiKey: string;
  model: string;
}

const DEFAULT_OPENAI_BASE = "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

function trimTrailingSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

export function resolveModelConfig(
  env: NodeJS.ProcessEnv = process.env,
): ModelConfig {
  const openaiKey = env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return {
      source: "openai",
      baseURL: trimTrailingSlash(env.OPENAI_BASE_URL?.trim() || DEFAULT_OPENAI_BASE),
      apiKey: openaiKey,
      model: env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
    };
  }

  // 无 Key：明确标记为 none（Ollama 等本地服务可经 OPENAI_BASE_URL 接入，
  // 此时会被上面的 openai 分支捕获）。路由据此走本地启发式生成器。
  return { source: "none", baseURL: "", apiKey: "", model: "" };
}
