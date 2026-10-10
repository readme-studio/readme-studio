import { getTranslations } from "next-intl/server";
import { templates } from "@/lib/templates";
import type { TemplateMeta } from "@/lib/types";
import { TemplateCard } from "./TemplateCard";

export async function TemplateGallery() {
  const t = await getTranslations("home");
  const list: TemplateMeta[] = Object.values(templates).map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    thumbnail: template.thumbnail,
  }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold">{t("templates.title")}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            useLabel={t("templates.use")}
          />
        ))}
      </div>
    </section>
  );
}
