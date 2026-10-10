import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pushReadme } from "@/lib/github-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  owner: z.string().min(1).optional(),
  content: z.string().min(1),
  pat: z.string().min(1),
});

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

  const result = await pushReadme(parsed.data);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "推送失败", code: "PUSH_FAILED" },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, url: result.url });
}
