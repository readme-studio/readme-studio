"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { PushDialog } from "@/components/PushDialog";
import { minimalTemplate, getTemplate } from "@/lib/templates";
import { loadConfig } from "@/lib/storage";
import type { ProfileConfig } from "@/lib/types";

export function ResultBody({
  loggedIn,
  userName,
}: {
  loggedIn: boolean;
  userName?: string;
}) {
  const t = useTranslations("result");
  const [config, setConfig] = useState<ProfileConfig | null>(null);
  const [ready, setReady] = useState(false);
  const [pushedUrl, setPushedUrl] = useState<string | null>(null);

  useEffect(() => {
    setConfig(loadConfig());
    setReady(true);
  }, []);

  const markdown = config
    ? (getTemplate(config.templateId) ?? minimalTemplate).render(config)
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  if (ready && !config) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("empty")}</p>
        <Button asChild>
          <Link href="/editor">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("edit")}
          </Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="返回">
            <Link href="/editor">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <span className="font-medium">{t("title")}</span>
        </div>
        <ThemeToggle />
      </header>

      <section className="flex flex-1 flex-col gap-4 p-4">
        <div className="rounded-lg border bg-card p-4">
          <MarkdownPreview markdown={markdown} />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCopy}>{t("copy")}</Button>
          <PushDialog
            markdown={markdown}
            loggedIn={loggedIn}
            userName={userName}
            onPushed={setPushedUrl}
          />
          {pushedUrl && (
            <Button asChild variant="secondary">
              <a href={pushedUrl} target="_blank" rel="noreferrer">
                {t("view")}
              </a>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
