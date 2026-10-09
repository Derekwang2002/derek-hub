import Link from "next/link";
import { getAllLocalizedPosts } from "../../lib/localized-posts";
import { getAllProjects } from "../../lib/projects";
import { localePath, type ContentLocale } from "../../lib/locale";
import styles from "../app/blog/page.module.css";

export async function NotesContent({ locale }: { locale: ContentLocale }) {
  const [projects, posts] = await Promise.all([getAllProjects(locale), getAllLocalizedPosts(locale)]);
  const notes = [
    ...projects.filter(project => project.slug.startsWith("csci")).map(project => ({
      title: project.name, date: project.lastUpdated, href: project.href
    })),
    ...posts.filter(post => post.slug.endsWith("-notes")).map(post => ({
      title: post.title, date: post.date, href: localePath(locale, `/blog/${post.slug}`)
    }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  return <main className={`page-enter ${styles.blogPage}`} lang={locale === "zh" ? "zh-CN" : "en"}>
    <header className={styles.hero}><h1 className={styles.title}>{locale === "zh" ? "笔记" : "Notes"}</h1></header>
    <ul className={styles.postList}>{notes.map(note => <li className={`row-highlight ${styles.postRow}`} key={note.href}>
      <div className={styles.postHeader}>
        <Link className={styles.postLink} href={note.href}>{note.title}</Link>
        <time className={styles.postDate} dateTime={note.date}>{note.date}</time>
      </div>
    </li>)}</ul>
  </main>;
}
