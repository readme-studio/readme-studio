import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  provider: z.literal("anthropic"),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  messages: z
    .array(z.object({ role: z.string(), content: z.string() }))
    .min(1),
});

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// 简单的内存滑动窗口限流：同 IP 每分钟最多 10 次，防止被当作免费代理滥用。
// 注意：多实例部署下各实例独立计数；生产可替换为集中式限流（如 Upstash）。
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数校验失败（仅支持 anthropic）", code: "VALIDATION" },
      { status: 400 },
    );
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试", code: "RATE_LIMITED" },
      { status: 429 },
    );
  }

  const { model, apiKey, messages } = parsed.data;

  let upstream: Response;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey, // 仅用于本次上游调用，不落库、不记日志
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 300,
        stream: true,
        messages,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "无法连接 Anthropic", code: "UPSTREAM_ERROR" },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `Anthropic 返回错误（${upstream.status}）`, code: "UPSTREAM_ERROR" },
      { status: 502, headers: detail ? { "X-Upstream-Detail": detail.slice(0, 200) } : undefined },
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  // 把 Anthropic 的 SSE 转译为我们的 {delta} 帧，结束发 [DONE]
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() ?? "";
          for (const block of blocks) {
            const dataLine = block
              .split("\n")
              .find((l) => l.startsWith("data:"));
            if (!dataLine) continue;
            const data = dataLine.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as {
                type?: string;
                delta?: { type?: string; text?: string };
              };
              if (
                json.type === "content_block_delta" &&
                json.delta?.type === "text_delta" &&
                json.delta.text
              ) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ delta: json.delta.text })}\n\n`),
                );
              }
            } catch {
              // 忽略无法解析的帧
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "代理转发失败" })}\n\n`),
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
