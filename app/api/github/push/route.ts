import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { pushReadme } from "@/lib/github-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  owner: z.string().min(1).optional(),
  content: z.string().min(1),
  // PAT 可选：不传时回退到登录用户的 GitHub OAuth token（小白一键发布路径）
  pat: z.string().min(1).optional(),
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

  // 优先使用用户自带 PAT（高级模式）；否则复用登录态的 OAuth token（public_repo 即可创建并写入公开仓库）
  const session = await auth();
  const pat = parsed.data.pat?.trim() || session?.accessToken;
  if (!pat) {
    return NextResponse.json(
      {
        error: "未登录 GitHub，也未提供 Token。请先点击「用 GitHub 账号连接并发布」。",
        code: "UNAUTHORIZED",
      },
      { status: 401 },
    );
  }

  const result = await pushReadme({ ...parsed.data, pat });
  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "推送失败", code: "PUSH_FAILED" },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, url: result.url });
}
