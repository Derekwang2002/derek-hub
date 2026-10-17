"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FilterDisclosure } from "./filter-disclosure";
import styles from "./hub-nav.module.css";

type HubNavItem = {
  slug: string;
  label: string;
  href: string;
};

type HubNavLinksProps = {
  ariaLabel: string;
  heading: ReactNode;
  allHref: string;
  items: HubNavItem[];
};

export function HubNavLinks({ ariaLabel, allHref, items, heading }: HubNavLinksProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname.replace(/\/+$/, "");

  return (
    <FilterDisclosure heading={heading} locale={allHref.startsWith("/zh") ? "zh" : "en"} count={items.some(item => item.href === currentPath) ? 1 : 0}><div role="group" aria-label={ariaLabel} className={styles.nav}>
      {items.map((item) => {
        const isActive = currentPath === item.href;

        return (
          <button
            type="button"
            aria-pressed={isActive}
            className={styles.filter}
            onClick={() => router.push(isActive ? allHref : item.href, { scroll: false })}
            key={item.slug}
          >
            {item.label}
          </button>
        );
      })}
    </div></FilterDisclosure>
  );
}
