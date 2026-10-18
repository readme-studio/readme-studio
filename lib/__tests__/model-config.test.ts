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

  it("无 key 时，source 为 none（路由改走本地启发式生成器，零费用、离线可用）", () => {
    const cfg = resolveModelConfig(env({}));
    expect(cfg.source).toBe("none");
    expect(cfg.apiKey).toBe("");
    expect(cfg.baseURL).toBe("");
  });

  it("Ollama 经 OPENAI_BASE_URL 接入时仍走 openai 分支（本地 Ollama 的 /v1 端点）", () => {
    const cfg = resolveModelConfig(
      env({
        OPENAI_API_KEY: "ollama",
        OPENAI_BASE_URL: "http://127.0.0.1:11434/v1/",
        OPENAI_MODEL: "llama3.1",
      }),
    );
    expect(cfg.source).toBe("openai");
    expect(cfg.baseURL).toBe("http://127.0.0.1:11434/v1");
    expect(cfg.model).toBe("llama3.1");
  });

  it("空字符串 key 视为未配置，source 为 none", () => {
    const cfg = resolveModelConfig(env({ OPENAI_API_KEY: "   " }));
    expect(cfg.source).toBe("none");
  });
});
