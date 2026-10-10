import { Octokit } from "@octokit/rest";
import type { PushRequest, PushResponse } from "./types";

// UTF-8 安全的 Base64 编码（README 含中文时必须按字节编码）
function toBase64Utf8(s: string): string {
  return Buffer.from(s, "utf-8").toString("base64");
}

const MAX_RETRIES = 3;
const COMMIT_MESSAGE = "Update profile README via Readme Studio";

// 对 409（SHA 冲突）与 5xx 做有限重试 + 退避
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const status = (e as { status?: number }).status;
      if (status === 409 || (status !== undefined && status >= 500 && status < 600)) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

// 建库后轮询，直到仓库具备默认分支（初始 commit 完成）再继续，避免 404/冲突
async function waitForRepoReady(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const r = await octokit.repos.get({ owner, repo });
      if (r.data.default_branch) return;
    } catch {
      // 仓库尚未就绪，继续等待
    }
    await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
  }
}

// 把生成的 README 推送到用户的「个人主页特殊仓库」（owner/owner 的 README.md）
export async function pushReadme(req: PushRequest): Promise<PushResponse> {
  const { content, pat, accessToken } = req;
  // PAT 与 OAuth 访问令牌二选一（均为 Bearer，Octokit 通用）
  const token = pat || accessToken;
  if (!content || !token) {
    return {
      success: false,
      error: "缺少 content 或授权令牌（请先登录 GitHub 或提供 Token）",
      code: "AUTH",
    };
  }

  const octokit = new Octokit({ auth: token });

  try {
    // 解析当前 PAT 对应的用户名；未显式传 owner 时使用
    let owner = req.owner;
    if (!owner) {
      const me = await octokit.users.getAuthenticated();
      owner = me.data.login;
    }
    const repo = owner; // 个人主页仓库名必须等同用户名

    // 确保仓库存在：不存在则创建（个人主页特殊仓库）
    let created = false;
    try {
      await octokit.repos.get({ owner, repo });
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 404) {
        // auto_init 生成初始 commit + 默认分支，避免 PUT README 时仓库尚未就绪
        await octokit.repos.createForAuthenticatedUser({
          name: repo,
          auto_init: true,
        });
        created = true;
      } else {
        throw e;
      }
    }

    // 新建仓库后轮询，直到默认分支就绪再写入 README
    if (created) {
      await waitForRepoReady(octokit, owner, repo);
    }

    // 读取已有 README 的 SHA（用于更新而非新建）
    let sha: string | undefined;
    try {
      const existing = await octokit.repos.getContent({ owner, repo, path: "README.md" });
      const data = existing.data;
      if (!Array.isArray(data)) sha = (data as { sha?: string }).sha;
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status !== 404) throw e;
    }

    // 写入 README（冲突 / 5xx 自动重试）
    await withRetry(async () => {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: "README.md",
        message: COMMIT_MESSAGE,
        content: toBase64Utf8(content),
        ...(sha ? { sha } : {}),
      });
    });

    return { success: true, url: `https://github.com/${owner}` };
  } catch (e) {
    const status = (e as { status?: number }).status;
    const isOAuth = Boolean(accessToken) && !pat;
    let error = (e as Error)?.message ?? "推送失败";
    let code: PushResponse["code"] = "OTHER";
    if (status === 401) {
      // OAuth 令牌失效 / PAT 无效
      error = isOAuth
        ? "GitHub 授权无效或已过期，请重新登录后重试"
        : "GitHub Token 无效，请检查后重试";
      code = "AUTH";
    } else if (status === 403) {
      // 权限不足：OAuth 需 public_repo；PAT 需 Contents:write
      error = isOAuth
        ? "GitHub 权限不足（需 public_repo），请重新登录并授权"
        : "GitHub Token 权限不足（需 Contents:write）";
      code = "SCOPE";
    } else if (status === 404 && !req.owner) {
      error = "无法定位目标仓库，请确认登录账号";
      code = "AUTH";
    } else if (status === 429) {
      error = "GitHub 接口限流，请稍后再试";
      code = "RATE";
    } else {
      error = "网络异常，请检查网络后重试";
      code = "NETWORK";
    }
    return { success: false, error, code };
  }
}
