import Link from "next/link";
import type { ReactNode } from "react";
import { localePath, type ContentLocale } from "../../lib/locale";
import styles from "./content-navigation.module.css";

const sections = {
  blog: { href: "/blog", en: "Blog", zh: "博客" },
  notes: { href: "/notes", en: "Notes", zh: "笔记" },
  projects: { href: "/projects", en: "Projects", zh: "项目" },
  resources: { href: "/hub/all", en: "Resources", zh: "资源" }
};

export function ContentNavigation({ section, locale, children }: {
  section: keyof typeof sections;
  locale: ContentLocale;
  children?: ReactNode;
}) {
  const { href, [locale]: label } = sections[section];
  return (
    <nav className={styles.navigation} aria-label={locale === "zh" ? "内容导航" : "Content navigation"}>
      <Link
        className={styles.backLink}
        href={localePath(locale, href)}
        aria-label={locale === "zh" ? `返回${label}` : `Back to ${label}`}
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m8 5-5 5 5 5M3 10h14" />
        </svg>
        <span>{label}</span>
      </Link>
      {children}
    </nav>
  );
}
