import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <main>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.subtitle")}</p>
    </main>
  );
}
