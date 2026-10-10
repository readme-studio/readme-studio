"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProfileFormValues } from "@/lib/schemas";

// 展示型表单：表单实例由父级通过 <Form {...methods}> 提供（useFormContext）。
// 校验错误消息以 i18n key 存储于 fieldState.error.message，此处经 t() 翻译。
export function ProfileForm() {
  const t = useTranslations("editor.form");
  const te = useTranslations("editor.form.errors");
  // zod 错误消息存储的是 i18n key 字符串，运行时再翻译；放宽 t() 的键类型约束。
  // 兜底：万一某 key 在 messages 中缺失（如解压不完整），不抛错崩整页，直接回退显示原始文本。
  const teMsg = (msg?: string) => {
    if (!msg) return "";
    try {
      return (te as unknown as (k: string) => string)(msg);
    } catch {
      return msg;
    }
  };
  const { control } = useFormContext<ProfileFormValues>();

  const errClass = (hasError?: boolean) =>
    cn(hasError && "border-destructive focus-visible:ring-destructive");

  const socialField = (name: "social.github" | "social.twitter" | "social.linkedin" | "social.blog" | "social.email", label: string) => (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              className={errClass(!!fieldState.error)}
            />
          </FormControl>
          <FormMessage>{teMsg(fieldState.error?.message)}</FormMessage>
        </FormItem>
      )}
    />
  );

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("name")}</FormLabel>
            <FormControl>
              <Input {...field} className={errClass(!!fieldState.error)} />
            </FormControl>
            <FormMessage>{teMsg(fieldState.error?.message)}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tagline"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("tagline")}</FormLabel>
            <FormControl>
              <Input {...field} className={errClass(!!fieldState.error)} />
            </FormControl>
            <FormMessage>{teMsg(fieldState.error?.message)}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="bio"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("bio")}</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} className={errClass(!!fieldState.error)} />
            </FormControl>
            <FormMessage>{teMsg(fieldState.error?.message)}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="location"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("location")}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} className={errClass(!!fieldState.error)} />
            </FormControl>
            <FormMessage>{teMsg(fieldState.error?.message)}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="company"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("company")}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} className={errClass(!!fieldState.error)} />
            </FormControl>
            <FormMessage>{teMsg(fieldState.error?.message)}</FormMessage>
          </FormItem>
        )}
      />

      {socialField("social.github", t("github"))}
      {socialField("social.twitter", t("twitter"))}
      {socialField("social.linkedin", t("linkedin"))}
      {socialField("social.blog", t("blog"))}
      {socialField("social.email", t("email"))}
    </div>
  );
}
