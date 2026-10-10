"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
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

type ErrCode = "AUTH" | "SCOPE" | "RATE" | "NETWORK" | "OTHER" | undefined;

export function PushDialog({
  markdown,
  onPushed,
}: {
  markdown: string;
  onPushed: (url: string) => void;
}) {
  const t = useTranslations("result");
  const tp = useTranslations("result.publish");
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [showPat, setShowPat] = useState(false);
  const [pat, setPat] = useState("");
  const [busy, setBusy] = useState(false);
  const [doneUrl, setDoneUrl] = useState<string | null>(null);

  // 打开时探测登录态（服务端会话，不暴露令牌到客户端）
  useEffect(() => {
    if (!open) return;
    let active = true;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const u = d?.user;
        setLoggedIn(Boolean(u));
        setUserName(u?.name ?? u?.login ?? null);
      })
      .catch(() => active && setLoggedIn(false));
    return () => {
      active = false;
    };
  }, [open]);

  const errMessage = (code?: ErrCode): string => {
    switch (code) {
      case "AUTH":
        return tp("errAuth");
      case "SCOPE":
        return tp("errScope");
      case "RATE":
        return tp("errRate");
      default:
        return tp("errNetwork");
    }
  };

  const handlePush = async () => {
    if (showPat) {
      if (!pat.trim()) {
        toast.error(tp("patRequired"));
        return;
      }
    }
    setBusy(true);
    try {
      const res = await fetch("/api/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: markdown,
          ...(showPat ? { pat: pat.trim() } : {}),
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        url?: string;
        error?: string;
        code?: ErrCode;
      };
      if (!data.success) {
        // 账号模式令牌失效：引导重新登录
        if (data.code === "AUTH" && !showPat) {
          toast.error(tp("errAuth"));
          signIn("github");
          return;
        }
        throw new Error(errMessage(data.code));
      }
      toast.success(tp("success"));
      setDoneUrl(data.url ?? "");
      onPushed(data.url ?? "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tp("errNetwork"));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setDoneUrl(null);
    setPat("");
    setShowPat(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">{t("push")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tp("title")}</DialogTitle>
          <DialogDescription>
            {loggedIn
              ? tp("descLoggedIn", {
                  repo: userName ?? "你的用户名",
                  url: `https://github.com/${userName ?? ""}`,
                })
              : tp("descLoggedOut")}
          </DialogDescription>
        </DialogHeader>

        {doneUrl ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{tp("success")}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href={doneUrl} target="_blank" rel="noreferrer">
                  {tp("viewProfile")}
                </a>
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(doneUrl)}
              >
                {tp("copyLink")}
              </Button>
              <Button variant="ghost" onClick={reset}>
                {tp("done")}
              </Button>
            </div>
          </div>
        ) : showPat ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{tp("patDesc")}</p>
            <Input
              type="password"
              placeholder="github_pat_..."
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              autoComplete="off"
            />
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                variant="link"
                className="px-0"
                onClick={() => setShowPat(false)}
              >
                {tp("advancedBack")}
              </Button>
              <Button onClick={handlePush} disabled={busy}>
                {busy ? tp("publishing") : t("push")}
              </Button>
            </DialogFooter>
          </div>
        ) : loggedIn ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{tp("firstTimeHint")}</p>
            <p className="text-sm text-muted-foreground">{tp("repoHint")}</p>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                variant="link"
                className="px-0"
                onClick={() => setShowPat(true)}
              >
                {tp("advanced")}
              </Button>
              <Button onClick={handlePush} disabled={busy}>
                {busy ? tp("publishing") : tp("withAccount")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                variant="link"
                className="px-0"
                onClick={() => setShowPat(true)}
              >
                {tp("advanced")}
              </Button>
              <Button onClick={() => signIn("github")}>
                {tp("connectAndPublish")}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
