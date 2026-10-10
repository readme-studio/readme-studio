"use client";

import type { RepoInfo } from "@/lib/types";

// GitHub 常见语言色板（覆盖常见语言，未列出的用默认灰）
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Swift: "#F05138",
};

function truncate(text: string, n: number) {
  return text.length > n ? text.slice(0, n) + "…" : text;
}

export function RepoSelector({
  repos,
  selected,
  loading,
  onSelect,
}: {
  repos: RepoInfo[];
  selected: string[];
  loading?: boolean;
  onSelect?: (repo: RepoInfo) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-14 animate-pulse rounded-lg border bg-muted" />
        <div className="h-14 animate-pulse rounded-lg border bg-muted" />
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        没有找到公开仓库
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {repos.map((r) => {
        const isSelected = selected.includes(r.name);
        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onSelect?.(r)}
              aria-pressed={isSelected}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                isSelected ? "border-primary bg-primary/5" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.name}</span>
                <span className="text-muted-foreground">⭐ {r.stargazersCount}</span>
              </div>
              {r.description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {truncate(r.description, 60)}
                </p>
              )}
              {r.language && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: LANGUAGE_COLORS[r.language] ?? "#8b949e",
                    }}
                  />
                  {r.language}
                </div>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
