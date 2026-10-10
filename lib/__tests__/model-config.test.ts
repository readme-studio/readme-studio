import { describe, it, expect } from "vitest";
import { resolveModelConfig } from "../model-config";

// 用对象模拟 process.env，避免依赖真实环境
function env(partial: Record<string, string | undefined>): NodeJS.ProcessEnv {
  return partial as NodeJS.ProcessEnv;
}

describe("resolveModelConfig（免费模型优先级）", () => {
  it("OPENAI_API_KEY 优先，走 OpenAI 兼容配置", () => {
    const cfg = resolveModelConfig(
      env({ OPENAI_API_KEY: "sk-test", OPENAI_MODEL: "gpt-4o-mini" }),
    );
    expect(cfg.source).toBe("openai");
    expect(cfg.apiKey).toBe("sk-test");
    expect(cfg.model).toBe("gpt-4o-mini");
    expect(cfg.baseURL).toBe("https://api.openai.com/v1");
  });

  it("OPENAI_BASE_URL 可指向免费兼容服务（如 DeepSeek）且去除尾部斜杠", () => {
    const cfg = resolveModelConfig(
      env({
        OPENAI_API_KEY: "sk-deepseek",
        OPENAI_BASE_URL: "https://api.deepseek.com/v1/",
        OPENAI_MODEL: "deepseek-chat",
      }),
    );
    expect(cfg.source).toBe("openai");
    expect(cfg.baseURL).toBe("https://api.deepseek.com/v1");
    expect(cfg.model).toBe("deepseek-chat");
  });

  it("无 key 且未禁用 Ollama 时，自动回退到本地 Ollama（零费用）", () => {
    const cfg = resolveModelConfig(env({}));
    expect(cfg.source).toBe("ollama");
    expect(cfg.apiKey).toBe("ollama");
    expect(cfg.model).toBe("qwen2.5:latest");
    expect(cfg.baseURL).toBe("http://localhost:11434/v1");
  });

  it("可自定义 Ollama 模型与地址", () => {
    const cfg = resolveModelConfig(
      env({ OLLAMA_BASE_URL: "http://127.0.0.1:11434/v1/", OLLAMA_MODEL: "llama3.1" }),
    );
    expect(cfg.source).toBe("ollama");
    expect(cfg.baseURL).toBe("http://127.0.0.1:11434/v1");
    expect(cfg.model).toBe("llama3.1");
  });

  it("ENABLE_OLLAMA=false 且无 key 时，source 为 none（由调用方引导）", () => {
    const cfg = resolveModelConfig(env({ ENABLE_OLLAMA: "false" }));
    expect(cfg.source).toBe("none");
    expect(cfg.apiKey).toBe("");
  });

  it("空字符串 key 视为未配置，回退 Ollama", () => {
    const cfg = resolveModelConfig(env({ OPENAI_API_KEY: "   " }));
    expect(cfg.source).toBe("ollama");
  });
});
