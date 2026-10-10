"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ByokProvider } from "@/lib/byok";

export function ByokDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (provider: ByokProvider, key: string) => void;
}) {
  const t = useTranslations("editor.byok");
  const [provider, setProvider] = useState<ByokProvider>("openai");
  const [key, setKey] = useState("");

  const save = () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    onSaved(provider, trimmed);
    setKey("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">{t("provider")}</label>
            <Select
              value={provider}
              onValueChange={(v) => setProvider(v as ByokProvider)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">{t("openai")}</SelectItem>
                <SelectItem value="anthropic">{t("anthropic")}</SelectItem>
                <SelectItem value="gemini">{t("gemini")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t("keyLabel")}</label>
            <Input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              autoComplete="off"
            />
          </div>

          <p className="text-xs text-muted-foreground">{t("note")}</p>
          {provider === "anthropic" && (
            <p className="text-xs text-muted-foreground">{t("noteClaude")}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={save} disabled={!key.trim()}>
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
