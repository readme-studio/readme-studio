"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// 小白友好的「一键发布到 GitHub」：
// - 已登录（GitHub OAuth）：直接复用 OAuth token 发布，无需手动创建 PAT；
// - 未登录：一键引导 GitHub 授权，授权后回来即可发布；
// - 高级用户：可展开「改用 Token 发布」使用自己的 PAT。
export function PushDialog({
  markdown,
  loggedIn,
  userName,
  onPushed,
}: {
  markdown: string;
  loggedIn: boolean;
  userName?: string;
  onPushed: (url: string) => void;
}) {
  const tp = useTranslations("result.publish");
  const t = useTranslations("result");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pat, setPat] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [doneUrl, setDoneUrl] = useState<string | null>(null);

  const login = userName ?? "你的用户名";
  const repoName = `${login}/${login}`;
  const profileUrl = `github.com/${login}`;

  const reset = () => {
    setBusy(false);
    setDoneUrl(null);
    setAdvanced(false);
    setPat("");
  };

  const handleConnect = () => {
    // 未登录：直接发起 GitHub 授权，回来后（loggedIn=true）即可一键发布
    void signIn("github", { callbackUrl: "/result" });
  };

  const handlePublish = async () => {
    const token = advanced ? pat.trim() : "";
    if (advanced && !token) {
      toast.error(tp("patRequired"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: markdown, ...(token ? { pat: token } : {}) }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        url?: string;
        error?: string;
      };
      if (!data.success) throw new Error(data.error || "推送失败");
      toast.success(t("pushed"));
      setDoneUrl(data.url ?? "");
      onPushed(data.url ?? "");
    } catch (e) {
      // 把常见错误翻译成小白能看懂的话
      const raw = e instanceof Error ? e.message : "推送失败";
      let msg = raw;
      if (/401|无效|过期/.test(raw)) msg = tp("errAuth");
      else if (/403|权限|scope/.test(raw)) msg = tp("errScope");
      else if (/429|速率|限流/.test(raw)) msg = tp("errRate");
      else if (/network|fetch|网络/.test(raw)) msg = tp("errNetwork");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">{t("push")}</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tp("title")}</DialogTitle>
          <DialogDescription>
            {loggedIn
              ? tp("descLoggedIn", { repo: repoName, url: profileUrl })
              : tp("descLoggedOut")}
          </DialogDescription>
        </DialogHeader>

        {!loggedIn ? (
          // 未登录：引导授权（小白首选路径）
          <div className="space-y-3">
            <Button className="w-full" onClick={handleConnect}>
              <Rocket className="mr-2 h-4 w-4" />
              {tp("connectAndPublish")}
            </Button>
            <p className="text-xs text-muted-foreground">{tp("firstTimeHint")}</p>
          </div>
        ) : doneUrl ? (
          // 发布成功：展示链接 + 快捷操作
          <div className="space-y-3">
            <p className="rounded-md bg-muted p-3 text-sm">{tp("success")}</p>
            <p className="break-all text-xs text-muted-foreground">{doneUrl}</p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <a href={doneUrl} target="_blank" rel="noreferrer">
                  {tp("viewProfile")}
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  void navigator.clipboard.writeText(doneUrl);
                  toast.success(tp("copyLink"));
                }}
              >
                {tp("copyLink")}
              </Button>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {tp("done")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // 已登录：一键发布（推荐）+ 高级 Token 模式
          <div className="space-y-3">
            <Button className="w-full" onClick={handlePublish} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tp("publishing")}
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  {tp("withAccount")}
                </>
              )}
            </Button>

            {!advanced ? (
              <button
                type="button"
                className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => setAdvanced(true)}
              >
                {tp("advanced")}
              </button>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium">{tp("patLabel")}</label>
                <Input
                  type="password"
                  placeholder="github_pat_..."
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">{tp("patDesc")}</p>
                <div className="flex gap-2">
                  <Button onClick={handlePublish} disabled={busy} className="flex-1">
                    {busy ? tp("publishing") : t("push")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAdvanced(false);
                      setPat("");
                    }}
                  >
                    {tp("advancedBack")}
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">{tp("repoHint")}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
