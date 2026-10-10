"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./ProfileForm";
import { RepoSelector } from "./RepoSelector";
import { MarkdownPreview } from "./MarkdownPreview";
import { minimalTemplate, getTemplate } from "@/lib/templates";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { saveConfig } from "@/lib/storage";
import type { RepoInfo, ProfileConfig, FeaturedRepo } from "@/lib/types";

const DEFAULT_CONFIG: ProfileConfig = {
  name: "张三",
  tagline: "全栈开发者",
  bio: "坐标杭州，专注于 Web 开发和开发者工具。",
  social: {},
  featuredRepos: [],
  stats: {
    showStars: true,
    showCommits: false,
    showPRs: false,
    showLanguages: false,
  },
  previewTheme: "light",
  templateId: "minimal",
};

export function EditorBody({ loggedIn }: { loggedIn: boolean }) {
  const t = useTranslations("editor");
  const router = useRouter();
  const [config, setConfig] = useState<ProfileConfig>(DEFAULT_CONFIG);
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [selected, setSelected] = useState<RepoInfo | null>(null);
  const [loading, setLoading] = useState(loggedIn);
  const [summarizing, setSummarizing] = useState(false);

  // 表单输入频繁变动，预览用 300ms 防抖后的配置，避免每键重渲染
  const previewConfig = useDebouncedValue(config, 300);

  const update = (patch: Partial<ProfileConfig>) =>
    setConfig((c) => ({ ...c, ...patch }));

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/github/repos")
      .then(async (res) => {
        if (!res.ok) return [];
        const data = (await res.json()) as { repos: RepoInfo[] };
        return data.repos;
      })
      .then((data) => {
        if (!cancelled) {
          setRepos(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  // 单选仓库：选中则加入 featuredRepos，再次点击取消
  const handleSelect = (r: RepoInfo) => {
    const willSelect = selected?.name !== r.name;
    setSelected(willSelect ? r : null);
    setConfig((c) => {
      if (!willSelect) {
        return {
          ...c,
          featuredRepos: c.featuredRepos.filter((f) => f.name !== r.name),
        };
      }
      if (c.featuredRepos.some((f) => f.name === r.name)) return c;
      const fr: FeaturedRepo = {
        name: r.name,
        description: r.description ?? "",
        url: r.htmlUrl,
        language: r.language ?? "",
        stars: r.stargazersCount,
        useAiSummary: false,
      };
      return { ...c, featuredRepos: [...c.featuredRepos, fr] };
    });
  };

  // 调用 /api/summarize，用 fetch + ReadableStream 消费 SSE，实时回填 aiSummary
  const handleSummarize = async () => {
    if (!selected || summarizing) return;
    const repo = selected;
    setSummarizing(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repos: [
            {
              name: repo.name,
              description: repo.description ?? "",
              language: repo.language ?? "",
              topics: repo.topics,
            },
          ],
        }),
      });

      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `请求失败（${res.status}）`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      setConfig((c) => ({
        ...c,
        featuredRepos: c.featuredRepos.map((f) =>
          f.name === repo.name ? { ...f, useAiSummary: true, aiSummary: "" } : f,
        ),
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data) as {
              delta?: string;
              error?: string;
            };
            if (json.error) throw new Error(json.error);
            if (json.delta) {
              acc += json.delta;
              setConfig((c) => ({
                ...c,
                featuredRepos: c.featuredRepos.map((f) =>
                  f.name === repo.name
                    ? { ...f, aiSummary: acc, useAiSummary: true }
                    : f,
                ),
              }));
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI 总结失败";
      toast.error(msg);
      // 失败回退到原始描述
      setConfig((c) => ({
        ...c,
        featuredRepos: c.featuredRepos.map((f) =>
          f.name === repo.name
            ? { ...f, useAiSummary: false, aiSummary: undefined }
            : f,
        ),
      }));
    } finally {
      setSummarizing(false);
    }
  };

  const template = getTemplate(previewConfig.templateId) ?? minimalTemplate;
  const markdown = template.render(previewConfig);

  const handleNext = () => {
    saveConfig(config);
    router.push("/result");
  };

  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
      <aside className="space-y-6 border-b p-4 lg:border-b-0 lg:border-r">
        <ProfileForm value={config} onChange={update} />

        <div>
          <h3 className="mb-2 font-semibold">{t("repos.title")}</h3>
          <RepoSelector
            repos={repos}
            selected={selected ? [selected.name] : []}
            loading={loading}
            onSelect={handleSelect}
          />
        </div>

        <Button
          onClick={handleSummarize}
          disabled={!selected || summarizing}
          className="w-full"
        >
          {summarizing ? t("ai.summarizing") : t("ai.summarize")}
        </Button>

        <Button onClick={handleNext} className="w-full">
          {t("next")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </aside>

      <section className="flex flex-col p-4">
        <div className="mb-2 text-sm text-muted-foreground">
          {t("template")}：极简风
        </div>
        <div className="rounded-lg border bg-card p-4">
          <MarkdownPreview markdown={markdown} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("previewHint")}</p>
      </section>
    </div>
  );
}
