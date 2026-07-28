import Link from "next/link";
import type { ContentLocale } from "../../lib/locale";
import type { Project } from "../../lib/projects";
import styles from "../app/projects/projects.module.css";

export function ProjectNavigation({
  activeHref,
  locale,
  project
}: {
  activeHref: string;
  locale: ContentLocale;
  project: Project;
}) {
  const contents = (
    <>
      <Link
        aria-current={activeHref === project.href ? "page" : undefined}
        className={styles.overviewLink}
        href={project.href}
      >
        {locale === "zh" ? "系统概览" : "System overview"}
      </Link>
      {project.sections.map((section) => (
        <section className={styles.navSection} key={section.slug}>
          <h2>{section.label}</h2>
          <ul>
            {section.items.map((item) => (
              <li key={item.slug}>
                <Link
                  aria-current={activeHref === item.href ? "page" : undefined}
                  href={item.href}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <Link
        aria-current={activeHref === `${project.href}/updates` ? "page" : undefined}
        className={styles.updatesLink}
        href={`${project.href}/updates`}
      >
        {locale === "zh" ? "项目动态" : "Updates"}
      </Link>
    </>
  );

  return (
    <>
      <aside
        aria-label={locale === "zh" ? "CALL-E 项目目录" : "CALL-E project contents"}
        className={styles.desktopNav}
      >
        <p className={styles.navEyebrow}>CALL-E</p>
        {contents}
      </aside>
      <details className={styles.mobileNav}>
        <summary>{locale === "zh" ? "项目目录" : "Project contents"}</summary>
        <nav aria-label={locale === "zh" ? "CALL-E 项目目录" : "CALL-E project contents"}>
          {contents}
        </nav>
      </details>
    </>
  );
}

