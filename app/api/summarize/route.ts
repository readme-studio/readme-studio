import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { checkDailySummaryLimit } from "@/lib/rate-limit";
import { resolveModelConfig } from "@/lib/model-config";
import {
  streamSummaries,
  summariesToSse,
  createSseResponse,
} from "@/lib/summarize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const repoSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  language: z.string(),
  topics: z.array(z.string()),
});
const requestSchema = z.object({
  repos: z.array(repoSchema).min(1).max(10),
});

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function dayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "请求体不是合法 JSON", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "参数校验失败",
        code: "VALIDATION",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  // 限流 key 优先用登录用户 id（文档要求 summarize:{userId}:{date}），
  // 未登录时回退到 IP，避免 NAT 共享/换 IP 绕过的问题在登录态下发生。
  const session = await auth();
  const date = dayKey();
  const idKey = session?.user?.id;
  const limitKey = idKey
    ? `summarize:${idKey}:${date}`
    : `summarize:ip:${clientIp(req)}:${date}`;

  const limit = await checkDailySummaryLimit(limitKey);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "今日 AI 总结次数已用完（每日 3 次）", code: "RATE_LIMITED" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  // 解析可用模型：优先 OPENAI_API_KEY / OPENAI_BASE_URL（任意 OpenAI 兼容免费云），
  // 否则回退到本地 Ollama（零费用）；两者皆无则给出引导，不消耗额度。
  const model = resolveModelConfig();
  if (model.source === "none") {
    return NextResponse.json(
      {
        error:
          "未配置 AI 模型：可在本地运行 Ollama（ollama pull qwen2.5 后保持运行），" +
          "或在 .env 中填写 OPENAI_BASE_URL + OPENAI_API_KEY（DeepSeek / 通义 / 智谱等免费兼容服务）。",
        code: "CONFIG_MISSING",
      },
      { status: 500 },
    );
  }

  const stream = summariesToSse(streamSummaries(parsed.data.repos, model));

  return createSseResponse(stream, {
    headers: { "X-RateLimit-Remaining": String(limit.remaining) },
  });
}
