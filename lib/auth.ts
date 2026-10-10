import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// 扩展类型：把 GitHub 的 access_token 透传到 JWT 与服务端 session（供 API 路由使用）。
// 客户端组件仅读取 user（name/image），不接触 accessToken，避免在客户端暴露。
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
  interface JWT {
    accessToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 非 Vercel 自托管（含 localhost）下建议开启，避免 host 检测类回调问题
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      // v1.1 文档 4.7 修订项：read:user 单独无法列出仓库，必须加 public_repo（均为只读）。
      authorization: {
        params: { scope: "read:user public_repo" },
      },
      // GitHub 自 2026-04 起在回调强制带 iss（RFC 9207），Auth.js 底层 oauth4webapi
      // 会校验该 iss 与 provider issuer 是否一致；必须显式声明为带 /login/oauth 后缀的地址，
      // 否则回调抛 unexpected "iss" (issuer) response parameter value。
      issuer: "https://github.com/login/oauth",
    }),
  ],
  callbacks: {
    jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      // 透出 GitHub 用户 id，供 /api/summarize 限流 key 使用
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
