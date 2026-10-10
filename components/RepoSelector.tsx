"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import type { RepoInfo } from "@/lib/types";

// GitHub 常见语言色板
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
  summarizing = [],
  onSelect,
}: {
  repos: RepoInfo[];
  selected: string[];
  loading?: boolean;
  summarizing?: string[];
  onSelect?: (repo: RepoInfo) => void;
}) {
  const t = useTranslations("editor.repos");
  const count = selected.length;

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
        {t("empty")}
        <div className="mt-1">{t("emptyManual")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t("selected", { count })}
        </span>
      </div>
      {count > 6 && (
        <p className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          {t("maxSummaryHint")}
        </p>
      )}

      <ul className="space-y-2">
        {repos.map((r) => {
          const isSelected = selected.includes(r.name);
          const isSummarizing = summarizing.includes(r.name);
          return (
            <li key={r.id}>
              <label
                className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${
                  isSelected ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onSelect?.(r)}
                  className="mt-0.5"
                  aria-label={r.name}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{r.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      ⭐ {r.stargazersCount}
                    </span>
                  </div>
                  {r.description && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {truncate(r.description, 60)}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {r.language && (
                      <span className="flex items-center gap-1">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: LANGUAGE_COLORS[r.language] ?? "#8b949e",
                          }}
                        />
                        {r.language}
                      </span>
                    )}
                    {isSummarizing && (
                      <span className="flex items-center gap-1 text-primary">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                        {t("summarizing")}
                      </span>
                    )}
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
