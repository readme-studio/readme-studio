import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listUserRepos } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json(
      { error: "未登录或缺少 GitHub 访问令牌", code: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  try {
    const repos = await listUserRepos(token);
    return NextResponse.json({ repos });
  } catch (err: unknown) {
    const status =
      typeof err === "object" && err !== null && "status" in err
        ? (err as { status?: number }).status
        : undefined;

    if (status === 403) {
      return NextResponse.json(
        {
          error: "GitHub 授权范围不足，需 read:user + public_repo",
          code: "FORBIDDEN",
        },
        { status: 403 },
      );
    }
    if (status === 429) {
      return NextResponse.json(
        { error: "GitHub API 速率限制，请稍后再试", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "获取仓库列表失败", code: "UPSTREAM_ERROR" },
      { status: 500 },
    );
  }
}
