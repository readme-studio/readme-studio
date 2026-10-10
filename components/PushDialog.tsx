"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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

export function PushDialog({
  markdown,
  onPushed,
}: {
  markdown: string;
  onPushed: (url: string) => void;
}) {
  const t = useTranslations("result");
  const [open, setOpen] = useState(false);
  const [pat, setPat] = useState("");
  const [busy, setBusy] = useState(false);

  const handlePush = async () => {
    const token = pat.trim();
    if (!token) {
      toast.error(t("patHint"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: markdown, pat: token }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        url?: string;
        error?: string;
      };
      if (!data.success) throw new Error(data.error || "推送失败");
      toast.success(t("pushed"));
      onPushed(data.url ?? "");
      setOpen(false);
      setPat("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "推送失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("push")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("push")}</DialogTitle>
          <DialogDescription>{t("patHint")}</DialogDescription>
        </DialogHeader>
        <Input
          type="password"
          placeholder="github_pat_..."
          value={pat}
          onChange={(e) => setPat(e.target.value)}
          autoComplete="off"
        />
        <DialogFooter>
          <Button onClick={handlePush} disabled={busy}>
            {busy ? t("pushing") : t("push")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
