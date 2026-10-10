"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileConfig } from "@/lib/types";

export function ProfileForm({
  value,
  onChange,
}: {
  value: ProfileConfig;
  onChange: (patch: Partial<ProfileConfig>) => void;
}) {
  const t = useTranslations("editor.form");

  const setSocial = (key: keyof ProfileConfig["social"], v: string) =>
    onChange({ social: { ...value.social, [key]: v || undefined } });

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          {t("name")}
        </label>
        <Input
          id="name"
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="tagline" className="mb-1 block text-sm font-medium">
          {t("tagline")}
        </label>
        <Input
          id="tagline"
          value={value.tagline}
          onChange={(e) => onChange({ tagline: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="bio" className="mb-1 block text-sm font-medium">
          {t("bio")}
        </label>
        <Textarea
          id="bio"
          value={value.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="github" className="mb-1 block text-sm font-medium">
          {t("github")}
        </label>
        <Input
          id="github"
          value={value.social.github ?? ""}
          onChange={(e) => setSocial("github", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="twitter" className="mb-1 block text-sm font-medium">
          {t("twitter")}
        </label>
        <Input
          id="twitter"
          value={value.social.twitter ?? ""}
          onChange={(e) => setSocial("twitter", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="blog" className="mb-1 block text-sm font-medium">
          {t("blog")}
        </label>
        <Input
          id="blog"
          value={value.social.blog ?? ""}
          onChange={(e) => setSocial("blog", e.target.value)}
        />
      </div>
    </div>
  );
}
