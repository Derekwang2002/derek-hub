import Link from "next/link";
import type { ContentLocale } from "../../lib/locale";
import { collectionSection } from "../../lib/content-sections";
import type { Project } from "../../lib/projects";
import { ContentNavigation } from "./content-navigation";
import styles from "../app/projects/projects.module.css";

export function ProjectNavigation({ activeHref, locale, project }: {
  activeHref: string; locale: ContentLocale; project: Project;
}) {
  const zh = locale === "zh";
  const items = project.sections.flatMap(section => section.items);
  const activeItem = items.find(item => item.href === activeHref);
  return <ContentNavigation section={collectionSection(project.slug)} locale={locale}>
    <div className={styles.projectNavLinks}>
      <Link href={project.href} aria-current={activeHref === project.href ? "page" : undefined}>{zh ? "概览" : "Overview"}</Link>
      <details className={styles.documentMenu} key={activeHref}>
        <summary data-active={Boolean(activeItem)}>{zh ? "文档" : "Documents"}<span className={styles.documentCount}>{items.length}</span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg></summary>
        <ol>{items.map(item => <li key={item.slug}><Link href={item.href} aria-current={activeHref === item.href ? "page" : undefined}>{item.title}</Link></li>)}</ol>
      </details>
      <Link href={`${project.href}/updates`} aria-current={activeHref === `${project.href}/updates` ? "page" : undefined}>{zh ? "动态" : "Updates"}</Link>
    </div>
  </ContentNavigation>;
}
