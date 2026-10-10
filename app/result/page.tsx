import { auth } from "@/lib/auth";
import { ResultBody } from "@/components/ResultBody";

// 结果页需要读取登录态，必须动态渲染（不缓存 session）
export const dynamic = "force-dynamic";

export default async function ResultPage() {
  // 服务端取 GitHub 登录态，透传给客户端发布组件。
  // 这样「一键发布」可直接复用 OAuth token，小白用户无需手动创建 PAT。
  const session = await auth();
  const loggedIn = Boolean(session?.user);
  const userName = session?.user?.name ?? undefined;

  return <ResultBody loggedIn={loggedIn} userName={userName} />;
}
