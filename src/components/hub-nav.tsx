import type { ReactNode } from "react";
import { RESOURCE_SECTIONS } from "../../lib/resources";
import { HubNavLinks } from "./hub-nav-links";
import { RefreshOnPageRestore } from "./refresh-on-page-restore";

type HubNavProps = {
  locale?: "en" | "zh";
  heading: ReactNode;
};

export function HubNav({ locale = "en", heading }: HubNavProps) {
  const items = RESOURCE_SECTIONS.filter((section) => section.slug !== "all").map((section) => ({
    slug: section.slug,
    label: locale === "zh" ? ({ all: "全部", skills: "Skills", demos: "演示" } as const)[section.slug] : section.label,
    href: `${locale === "zh" ? "/zh" : ""}/hub/${section.slug}`
  }));

  return (
    <>
      <RefreshOnPageRestore />
      <HubNavLinks
        heading={heading}
        ariaLabel={locale === "zh" ? "Hub 分类" : "Hub sections"}
        allHref={`${locale === "zh" ? "/zh" : ""}/hub/all`}
        items={items}
      />
    </>
  );
}
