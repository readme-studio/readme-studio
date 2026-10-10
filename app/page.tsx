import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { TemplateGallery } from "@/components/TemplateGallery";
import { ThemeToggle } from "@/components/ThemeToggle";

const GITHUB_URL = "https://github.com/readme-studio/readme-studio";

export default async function Home() {
  const t = await getTranslations("home");
  const tRoot = await getTranslations();
  const brand = tRoot("brand");

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-lg font-bold">{brand}</span>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild aria-label={t("footer.github")}>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.56 0-.27-.01-1.16-.02-2.1-3.34.71-4.04-1.41-4.04-1.41-.55-1.36-1.34-1.73-1.34-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.79 2.81 1.27 3.5.97.11-.76.42-1.27.76-1.56-2.67-.29-5.47-1.31-5.47-5.82 0-1.29.47-2.34 1.24-3.17-.12-.29-.54-1.46.12-3.05 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 6.01 0c2.29-1.53 3.3-1.21 3.3-1.21.66 1.59.24 2.76.12 3.05.77.83 1.23 1.88 1.23 3.17 0 4.52-2.81 5.52-5.49 5.81.43.36.81 1.08.81 2.18 0 1.57-.01 2.84-.01 3.23 0 .31.21.68.82.56A11.8 11.8 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
              </svg>
            </a>
          </Button>
          <ThemeToggle />
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("hero.title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("hero.subtitle")}</p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/editor">
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <TemplateGallery />

      <footer className="mt-auto border-t px-4 py-6 text-center text-sm text-muted-foreground">
        {t("footer.license")} ·{" "}
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="underline">
          {t("footer.github")}
        </a>
      </footer>
    </main>
  );
}
