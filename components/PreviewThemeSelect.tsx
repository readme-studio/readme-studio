"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PreviewTheme = "light" | "dark" | "auto";

// 预览区主题切换：仅影响编辑器内预览容器，不影响全局站点（3.6）
export function PreviewThemeSelect({
  value,
  onChange,
}: {
  value: PreviewTheme;
  onChange: (v: PreviewTheme) => void;
}) {
  const t = useTranslations("editor.previewTheme");

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t("label")}</span>
      <Select value={value} onValueChange={(v) => onChange(v as PreviewTheme)}>
        <SelectTrigger className="h-8 w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">{t("light")}</SelectItem>
          <SelectItem value="dark">{t("dark")}</SelectItem>
          <SelectItem value="auto">{t("auto")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
