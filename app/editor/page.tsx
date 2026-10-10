import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { EditorBody } from "@/components/EditorBody";

export default async function EditorPage() {
  const t = await getTranslations("editor");
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="返回">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <span className="font-medium">Step 2/3：{t("title")}</span>
        </div>
        <div className="flex items-center gap-2">
          <AuthButton user={session?.user} />
          <ThemeToggle />
        </div>
      </header>

      <EditorBody loggedIn={Boolean(session?.user)} />
    </main>
  );
}
