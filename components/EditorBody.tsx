"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ProfileForm } from "./ProfileForm";
import { RepoSelector } from "./RepoSelector";
import { MarkdownPreview } from "./MarkdownPreview";
import { ByokDialog } from "./ByokDialog";
import { TemplateSelector } from "./TemplateSelector";
import { PreviewThemeSelect, type PreviewTheme } from "./PreviewThemeSelect";
import { cn } from "@/lib/utils";
import { minimalTemplate, getTemplate, templates, type TemplateId } from "@/lib/templates";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { saveConfig } from "@/lib/storage";
import { profileFormSchema, type ProfileFormValues } from "@/lib/schemas";
import { summarizeWithBYOK, type ByokProvider } from "@/lib/byok";
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

const DEFAULT_FORM: ProfileFormValues = {
  name: DEFAULT_CONFIG.name,
  tagline: DEFAULT_CONFIG.tagline,
  bio: DEFAULT_CONFIG.bio,
  location: DEFAULT_CONFIG.location,
  company: DEFAULT_CONFIG.company,
  social: DEFAULT_CONFIG.social,
  stats: DEFAULT_CONFIG.stats,
  previewTheme: DEFAULT_CONFIG.previewTheme,
  templateId: DEFAULT_CONFIG.templateId,
};

const MAX_SUMMARY = 6;

function toFeatured(r: RepoInfo): FeaturedRepo {
  return {
    name: r.name,
    description: r.description ?? "",
    url: r.htmlUrl,
    language: r.language ?? "",
    stars: r.stargazersCount,
    useAiSummary: false,
  };
}

export function EditorBody({ loggedIn }: { loggedIn: boolean }) {
  const t = useTranslations("editor");
  const router = useRouter();
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [featured, setFeatured] = useState<FeaturedRepo[]>([]);
  const [loading, setLoading] = useState(loggedIn);
  const [summarizing, setSummarizing] = useState(false);
  const [summarizingNames, setSummarizingNames] = useState<string[]>([]);
  const [quota, setQuota] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<ProfileFormValues>(DEFAULT_FORM);
  const [byok, setByok] = useState<{ provider: ByokProvider; key: string } | null>(null);
  const [byokOpen, setByokOpen] = useState(false);
  const [reposError, setReposError] = useState<null | "network" | "unauthorized">(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: DEFAULT_FORM,
    mode: "onSubmit",
  });

  // 订阅表单变化 → 合并进 formValues（供预览联动，2.2）
  useEffect(() => {
    const sub = form.watch((values) => {
      setFormValues((prev) => ({ ...prev, ...(values as Partial<ProfileFormValues>) }));
    });
    return () => sub.unsubscribe();
  }, [form]);

  // 防抖后的「有效」预览配置：校验失败保留上次有效文本，但选中仓库始终实时反映（2.2）
  const debouncedForm = useDebouncedValue(formValues, 300);
  const [displayConfig, setDisplayConfig] = useState<ProfileConfig>(DEFAULT_CONFIG);
  useEffect(() => {
    const merged: ProfileConfig = {
      ...DEFAULT_CONFIG,
      ...debouncedForm,
      featuredRepos: featured,
    };
    const valid = profileFormSchema.safeParse(debouncedForm).success;
    setDisplayConfig((prev) => (valid ? merged : { ...prev, featuredRepos: featured }));
  }, [debouncedForm, featured]);

  // 进入编辑器时还原模板选择：优先 ?template=，其次 sessionStorage（3.3）
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("template");
    const fromStore = sessionStorage.getItem("readme-studio:template");
    const initial = fromUrl ?? fromStore;
    if (initial && initial in templates) {
      form.setValue("templateId", initial as TemplateId);
    }
  }, [form]);

  // 切换模板：更新表单 → 预览重渲染，并持久化到 URL 与 sessionStorage（3.3）
  const handleTemplateChange = (id: TemplateId) => {
    form.setValue("templateId", id);
    if (typeof window === "undefined") return;
    sessionStorage.setItem("readme-studio:template", id);
    const url = new URL(window.location.href);
    url.searchParams.set("template", id);
    window.history.replaceState({}, "", url.toString());
  };

  // 切换预览主题：仅影响预览容器（3.6）
  const handlePreviewThemeChange = (v: PreviewTheme) => {
    form.setValue("previewTheme", v);
  };

  // 拉取当前用户的公开仓库（可重试；401 提示重新登录，网络错误提示重试）
  const loadRepos = useCallback(async () => {
    if (!loggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setReposError(null);
    try {
      const res = await fetch("/api/github/repos");
      if (res.status === 401) {
        setReposError("unauthorized");
        return;
      }
      if (!res.ok) {
        setReposError("network");
        return;
      }
      const data = (await res.json()) as { repos: RepoInfo[] };
      setRepos(data.repos ?? []);
    } catch {
      setReposError("network");
      toast.error(t("reposLoadFailed"));
    } finally {
      setLoading(false);
    }
  }, [loggedIn, t]);

  useEffect(() => {
    void loadRepos();
  }, [loadRepos]);

  // 多选切换：选中顺序决定预览顺序（2.3）
  const handleSelect = (r: RepoInfo) => {
    setFeatured((cur) => {
      const exists = cur.some((f) => f.name === r.name);
      return exists ? cur.filter((f) => f.name !== r.name) : [...cur, toFeatured(r)];
    });
  };

  // 开始总结前准备：进入 loading，清空参与仓库的 AI 摘要
  const beginSummarize = (toSummarize: FeaturedRepo[]) => {
    const names = new Set(toSummarize.map((f) => f.name));
    setSummarizing(true);
    setSummarizingNames(toSummarize.map((f) => f.name));
    setFeatured((cur) =>
      cur.map((f) =>
        names.has(f.name) ? { ...f, useAiSummary: true, aiSummary: "" } : f,
      ),
    );
    return names;
  };

  const finishSummarize = () => {
    setSummarizing(false);
    setSummarizingNames([]);
  };

  // 服务端总结：/api/summarize，并发总结所有选中仓库，逐仓库 SSE 回流
  const runServerSummarize = async () => {
    const toSummarize = featured.slice(0, MAX_SUMMARY);
    const names = beginSummarize(toSummarize);
    const acc: Record<string, string> = {};
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repos: toSummarize.map((f) => ({
            name: f.name,
            description: f.description,
            language: f.language,
            topics: [],
          })),
        }),
      });

      const remaining = res.headers.get("X-RateLimit-Remaining");
      if (remaining !== null) setQuota(Number(remaining));

      if (res.status === 429) {
        setByokOpen(true); // 额度用完，引导 BYOK
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "今日额度已用完");
      }
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `请求失败（${res.status}）`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
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
              repo?: string;
              delta?: string;
              error?: string;
            };
            if (json.error) {
              toast.error(json.repo ? `${json.repo}：${json.error}` : json.error);
              if (json.repo) {
                setFeatured((cur) =>
                  cur.map((f) =>
                    f.name === json.repo
                      ? { ...f, useAiSummary: false, aiSummary: undefined }
                      : f,
                  ),
                );
              }
              continue;
            }
            if (json.delta && json.repo) {
              acc[json.repo] = (acc[json.repo] ?? "") + json.delta;
              const text = acc[json.repo];
              setFeatured((cur) =>
                cur.map((f) =>
                  f.name === json.repo
                    ? { ...f, aiSummary: text, useAiSummary: true }
                    : f,
                ),
              );
            }
          } catch {
            // 忽略不完整的帧（chunk 边界）
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI 总结失败";
      toast.error(msg);
      setFeatured((cur) =>
        cur.map((f) => {
          if (!names.has(f.name)) return f;
          if (acc[f.name]) {
            return { ...f, aiSummary: acc[f.name], useAiSummary: true };
          }
          return { ...f, useAiSummary: false, aiSummary: undefined };
        }),
      );
    } finally {
      finishSummarize();
    }
  };

  // BYOK 直连：浏览器直接调用 OpenAI/Gemini，或经代理调用 Anthropic；不计入服务端额度
  const runByokSummarize = async (provider: ByokProvider, apiKey: string) => {
    const toSummarize = featured.slice(0, MAX_SUMMARY);
    beginSummarize(toSummarize);
    try {
      const results = await Promise.all(
        toSummarize.map(async (f) => {
          try {
            const text = await summarizeWithBYOK(
              { name: f.name, description: f.description, language: f.language },
              provider,
              apiKey,
            );
            return { name: f.name, text };
          } catch (e) {
            return {
              name: f.name,
              error: e instanceof Error ? e.message : "BYOK 调用失败",
            };
          }
        }),
      );
      for (const r of results) {
        if (r.error) {
          toast.error(`${r.name}：${r.error}`);
          setFeatured((cur) =>
            cur.map((f) =>
              f.name === r.name
                ? { ...f, useAiSummary: false, aiSummary: undefined }
                : f,
            ),
          );
        } else {
          setFeatured((cur) =>
            cur.map((f) =>
              f.name === r.name
                ? { ...f, aiSummary: r.text, useAiSummary: true }
                : f,
            ),
          );
        }
      }
    } finally {
      finishSummarize();
    }
  };

  const handleSummarize = () => {
    if (featured.length === 0 || summarizing) return;
    if (byok) {
      void runByokSummarize(byok.provider, byok.key);
    } else {
      void runServerSummarize();
    }
  };

  const handleNext = async () => {
    const ok = await form.trigger();
    if (!ok) {
      toast.error(t("invalidHint"));
      return;
    }
    const config: ProfileConfig = {
      ...DEFAULT_CONFIG,
      ...form.getValues(),
      featuredRepos: featured,
    };
    saveConfig(config);
    router.push("/result");
  };

  const template = getTemplate(displayConfig.templateId) ?? minimalTemplate;
  const markdown = template.render(displayConfig);
  const previewThemeClass =
    displayConfig.previewTheme === "dark"
      ? "preview-theme-dark"
      : displayConfig.previewTheme === "auto"
        ? "preview-theme-auto"
        : "preview-theme-light";

  return (
    <Form {...form}>
      {!loggedIn && (
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-3 text-sm">
          <span>{t("loginHint")}</span>
          <Button variant="link" className="h-auto px-1 py-0" onClick={() => signIn("github")}>
            {t("login")}
          </Button>
        </div>
      )}
      {reposError === "unauthorized" && (
        <div className="flex flex-wrap items-center gap-1 border-b p-3 text-sm text-destructive">
          <span>{t("relogin")}</span>
          <Button variant="link" className="h-auto px-1 py-0 text-destructive" onClick={() => signIn("github")}>
            {t("login")}
          </Button>
        </div>
      )}

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
        <aside className="space-y-6 border-b p-4 lg:border-b-0 lg:border-r">
          <ProfileForm />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{t("repos.title")}</h3>
              {reposError === "network" && (
                <Button variant="outline" size="sm" onClick={() => void loadRepos()}>
                  {t("retry")}
                </Button>
              )}
            </div>
            <RepoSelector
              repos={repos}
              selected={featured.map((f) => f.name)}
              loading={loading}
              summarizing={summarizingNames}
              onSelect={handleSelect}
            />
          </div>

          <Button
            onClick={handleSummarize}
            disabled={featured.length === 0 || summarizing}
            className="w-full"
          >
            {summarizing ? t("ai.summarizing") : t("ai.summarize")}
          </Button>
          {quota !== null && (
            <p className="text-center text-xs text-muted-foreground">
              {t("ai.quota")}：{quota}
            </p>
          )}

          <Button onClick={handleNext} className="w-full">
            {t("next")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </aside>

        <section className="flex flex-col p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <TemplateSelector
              value={displayConfig.templateId}
              onChange={handleTemplateChange}
            />
            <PreviewThemeSelect
              value={displayConfig.previewTheme}
              onChange={handlePreviewThemeChange}
            />
          </div>
          <div className={cn("rounded-lg border p-4", previewThemeClass)}>
            <MarkdownPreview markdown={markdown} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("previewTheme.hint")}
          </p>
        </section>
      </div>

      <ByokDialog
        open={byokOpen}
        onOpenChange={setByokOpen}
        onSaved={(provider, key) => {
          setByok({ provider, key });
          setByokOpen(false);
          toast.success(t("byok.saved"));
          void runByokSummarize(provider, key);
        }}
      />
    </Form>
  );
}
