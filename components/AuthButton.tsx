"use client";

import { useTranslations } from "next-intl";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AuthButton({
  user,
}: {
  user?: { name?: string | null; image?: string | null };
}) {
  const t = useTranslations("editor");

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-7 w-7 rounded-full"
          />
        )}
        <span className="max-w-[120px] truncate text-sm">{user.name}</span>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          {t("logout")}
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" onClick={() => signIn("github")}>
      {t("login")}
    </Button>
  );
}
