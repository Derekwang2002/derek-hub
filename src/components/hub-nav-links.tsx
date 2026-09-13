"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./hub-nav.module.css";

type HubNavItem = {
  slug: string;
  label: string;
  href: string;
};

type HubNavLinksProps = {
  ariaLabel: string;
  items: HubNavItem[];
};

export function HubNavLinks({ ariaLabel, items }: HubNavLinksProps) {
  const pathname = usePathname();
  const currentPath = pathname.replace(/\/+$/, "");

  return (
    <nav aria-label={ariaLabel} className={styles.nav}>
      {items.map((item) => {
        const isActive = currentPath === item.href;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={isActive ? `${styles.link} ${styles.active}` : styles.link}
            href={item.href}
            key={item.slug}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
