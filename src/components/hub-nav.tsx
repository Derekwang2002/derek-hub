import Link from "next/link";
import { RESOURCE_SECTIONS, type ResourceSection } from "../../lib/resources";
import styles from "./hub-nav.module.css";

type HubNavProps = {
  active: "all" | ResourceSection;
};

type NavItem = {
  slug: "all" | ResourceSection;
  label: string;
  href: string;
};

export function HubNav({ active }: HubNavProps) {
  const items: NavItem[] = [
    ...RESOURCE_SECTIONS.filter((section) => section.slug === "featured").map((section) => ({
      slug: section.slug,
      label: section.label,
      href: `/hub/${section.slug}`
    })),
    { slug: "all", label: "All", href: "/hub" },
    ...RESOURCE_SECTIONS.map((section) => ({
      slug: section.slug,
      label: section.label,
      href: `/hub/${section.slug}`
    })).filter((item) => item.slug !== "featured")
  ];

  return (
    <nav aria-label="Hub sections" className={styles.nav}>
      {items.map((item) => (
        <Link
          aria-current={active === item.slug ? "page" : undefined}
          className={active === item.slug ? `${styles.link} ${styles.active}` : styles.link}
          href={item.href}
          key={item.slug}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
