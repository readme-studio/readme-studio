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
  // 生产 / 自定义域名（如 rs.yunlou.net.cn）下显式信任 Host，
  // 避免 next-auth v5 在无法识别受信 Host 时抛出 Configuration 错误。
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      // GitHub 已落地 RFC 9207，回调强制携带 iss=https://github.com/login/oauth；
      // 显式声明 issuer 以通过 openid-client 校验（beta.25 的 GitHub provider 无默认 issuer）。
      issuer: "https://github.com/login/oauth",
      // v1.1 文档 4.7 修订项：read:user 单独无法列出仓库，必须加 public_repo（均为只读）。
      // public_repo 同时允许向个人公开仓库（含 username/username 主页仓库）写入 README，供一键发布使用。
      authorization: {
        params: { scope: "read:user public_repo" },
      },
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
