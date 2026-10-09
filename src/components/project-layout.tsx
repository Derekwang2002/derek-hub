import type { ReactNode } from "react";
import type { ContentLocale } from "../../lib/locale";
import styles from "../app/projects/projects.module.css";

export function ProjectLayout({ children, navigation, locale }: {
  children: ReactNode; navigation: ReactNode; locale: ContentLocale;
}) {
  return <main className={styles.projectPage} lang={locale === "zh" ? "zh-CN" : "en"}>
    {navigation}
    <div className={styles.projectMain}>{children}</div>
  </main>;
}
