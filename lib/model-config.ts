// 免费 / 可配置模型解析。
// 让本地测试无需付费 key 即可跑通 AI 总结：
//   1) 若设置了 OPENAI_API_KEY（或 OPENAI_BASE_URL 指向任意 OpenAI 兼容服务，
//      如 DeepSeek / SiliconFlow(通义千问) / 智谱 GLM 等免费云），优先使用它；
//   2) 否则若未显式禁用（ENABLE_OLLAMA !== "false"），自动回退到本地 Ollama
//      （零配置、零费用、可离线，适合小白本地测试）；
//   3) 两者皆无时 source = "none"，由调用方给出友好的引导提示。
//
// 把选择逻辑抽成纯函数，便于在无网络环境下用单测覆盖（无需真正调用模型）。

export type ModelSource = "openai" | "ollama" | "none";

export interface ModelConfig {
  source: ModelSource;
  baseURL: string;
  apiKey: string;
  model: string;
}

const DEFAULT_OPENAI_BASE = "https://api.openai.com/v1";
const DEFAULT_OLLAMA_BASE = "http://localhost:11434/v1";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_OLLAMA_MODEL = "qwen2.5:latest";

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

  if (env.ENABLE_OLLAMA === "false") {
    return { source: "none", baseURL: "", apiKey: "", model: "" };
  }

  return {
    source: "ollama",
    baseURL: trimTrailingSlash(env.OLLAMA_BASE_URL?.trim() || DEFAULT_OLLAMA_BASE),
    apiKey: "ollama", // Ollama 本地服务不校验 key，任意非空值即可
    model: env.OLLAMA_MODEL?.trim() || DEFAULT_OLLAMA_MODEL,
  };
}
