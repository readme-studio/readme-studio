import { Octokit } from "@octokit/rest";
import type { RepoInfo } from "./types";

export function createOctokit(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

// 列出当前登录用户的公开仓库：过滤 fork/archived，按 star 降序，最多 100 个。
export async function listUserRepos(accessToken: string): Promise<RepoInfo[]> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
  });

  return data
    .filter((r) => !r.fork && !r.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 100)
    .map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description ?? null,
      htmlUrl: r.html_url,
      language: r.language ?? null,
      stargazersCount: r.stargazers_count,
      forksCount: r.forks_count,
      topics: r.topics ?? [],
      updatedAt: r.updated_at ?? "",
      fork: r.fork,
      archived: r.archived,
    }));
}
