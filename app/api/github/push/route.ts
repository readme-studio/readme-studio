import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { pushReadme } from "@/lib/github-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  owner: z.string().min(1).optional(),
  content: z.string().min(1),
  // 可选：手动 Token（兜底）。未提供时使用服务端 GitHub OAuth 会话令牌。
  pat: z.string().min(1).optional(),
});

// 把结构化错误码映射到 HTTP 状态码
function statusForCode(code?: string): number {
  switch (code) {
    case "AUTH":
      return 401;
    case "SCOPE":
      return 403;
    case "RATE":
      return 429;
    default:
      return 502;
  }
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

  // 已登录（GitHub OAuth）时，用会话里的访问令牌发布，无需客户端传递 Token。
  const session = await auth();
  const oauthToken = session?.accessToken;

  const result = await pushReadme({
    owner: parsed.data.owner,
    content: parsed.data.content,
    pat: parsed.data.pat,
    accessToken: oauthToken,
  });
  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "推送失败", code: result.code ?? "PUSH_FAILED" },
      { status: statusForCode(result.code) },
    );
  }

  return NextResponse.json({ success: true, url: result.url });
}
