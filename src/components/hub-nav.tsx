import { RESOURCE_SECTIONS } from "../../lib/resources";
import { HubNavLinks } from "./hub-nav-links";
import { RefreshOnPageRestore } from "./refresh-on-page-restore";

type HubNavProps = {
  locale?: "en" | "zh";
};

export function HubNav({ locale = "en" }: HubNavProps) {
  const items = RESOURCE_SECTIONS.map((section) => ({
    slug: section.slug,
    label: locale === "zh" ? ({ all: "全部", skills: "Skills", demos: "演示" } as const)[section.slug] : section.label,
    href: `${locale === "zh" ? "/zh" : ""}/hub/${section.slug}`
  }));

  return (
    <>
      <RefreshOnPageRestore />
      <HubNavLinks
        ariaLabel={locale === "zh" ? "Hub 分类" : "Hub sections"}
        items={items}
      />
    </>
  );
}
