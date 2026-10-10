"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { templates, type TemplateId } from "@/lib/templates";

// 编辑器内的模板切换器：切换后由父级 setValue 触发预览重渲染（3.3）
export function TemplateSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: TemplateId) => void;
}) {
  const t = useTranslations("editor");
  const list = Object.values(templates);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t("template")}</span>
      <Select value={value} onValueChange={(v) => onChange(v as TemplateId)}>
        <SelectTrigger className="h-8 w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {list.map((tp) => (
            <SelectItem key={tp.id} value={tp.id}>
              {tp.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
