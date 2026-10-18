import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { checkDailySummaryLimit } from "@/lib/rate-limit";
import { resolveModelConfig } from "@/lib/model-config";
import {
  streamSummaries,
  summariesToSse,
  withMeta,
  createSseResponse,
} from "@/lib/summarize";
import { streamSummariesLocal } from "@/lib/local-summary";

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

  const cfg = resolveModelConfig();
  const useLocal = cfg.source !== "openai";

  // 本地启发式兜底：免费、离线、无限额，保证按钮永远可用
  if (useLocal) {
    const stream = summariesToSse(withMeta(streamSummariesLocal(parsed.data.repos), "local"));
    return createSseResponse(stream);
  }

  // 以下为真·LLM 路径：用每日额度做基础防护（真 LLM 有成本）
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

  const stream = summariesToSse(withMeta(streamSummaries(parsed.data.repos, cfg), "openai"));

  return createSseResponse(stream, {
    headers: { "X-RateLimit-Remaining": String(limit.remaining) },
  });
}
