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
import type { ByokProvider, CompatibleOptions } from "@/lib/byok";

export function ByokDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (provider: ByokProvider, key: string, opts?: CompatibleOptions) => void;
}) {
  const t = useTranslations("editor.byok");
  const [provider, setProvider] = useState<ByokProvider>("openai");
  const [key, setKey] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [model, setModel] = useState("");

  const save = () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    const opts: CompatibleOptions | undefined =
      provider === "compatible"
        ? { baseURL: baseURL.trim(), model: model.trim() }
        : undefined;
    onSaved(provider, trimmed, opts);
    setKey("");
    setBaseURL("");
    setModel("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
                <SelectItem value="compatible">{t("compatible")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {provider === "compatible" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">{t("baseUrl")}</label>
                <Input
                  type="url"
                  value={baseURL}
                  onChange={(e) => setBaseURL(e.target.value)}
                  placeholder={t("baseUrlPlaceholder")}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t("model")}</label>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={t("modelPlaceholder")}
                  autoComplete="off"
                />
              </div>
            </>
          )}

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
          {provider === "compatible" && (
            <p className="text-xs text-muted-foreground">{t("noteCompatible")}</p>
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
