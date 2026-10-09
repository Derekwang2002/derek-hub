import Link from "next/link";
import { localePath, type ContentLocale } from "../../lib/locale";
import { collectionSection } from "../../lib/content-sections";
import type { Project } from "../../lib/projects";
import styles from "../app/projects/projects.module.css";

export function ProjectNavigation({ activeHref, locale, project }: {
  activeHref: string; locale: ContentLocale; project: Project;
}) {
  const zh = locale === "zh";
  const notes = collectionSection(project.slug) === "notes";
  const items = project.sections.flatMap(section => section.items);
  const activeItem = items.find(item => item.href === activeHref);
  return <nav className={styles.projectNav} aria-label={zh ? `${project.name} ${notes ? "笔记" : "项目"}导航` : `${project.name} navigation`}>
    <Link href={localePath(locale, notes ? "/notes" : "/projects")} className={styles.projectName}>← {notes ? (zh ? "笔记" : "Notes") : project.name}</Link>
    <div className={styles.projectNavLinks}>
      <Link href={project.href} aria-current={activeHref === project.href ? "page" : undefined}>{zh ? "概览" : "Overview"}</Link>
      <details className={styles.documentMenu} key={activeHref}>
        <summary data-active={Boolean(activeItem)}>{zh ? "文档" : "Documents"}<span className={styles.documentCount}>{items.length}</span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg></summary>
        <ol>{items.map(item => <li key={item.slug}><Link href={item.href} aria-current={activeHref === item.href ? "page" : undefined}>{item.title}</Link></li>)}</ol>
      </details>
      <Link href={`${project.href}/updates`} aria-current={activeHref === `${project.href}/updates` ? "page" : undefined}>{zh ? "动态" : "Updates"}</Link>
    </div>
  </nav>;
}
