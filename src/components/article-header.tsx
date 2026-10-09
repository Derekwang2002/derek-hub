import { Fragment } from "react";
import Link from "next/link";
import { formatContentDate, localePath, type ContentLocale } from "../../lib/locale";
import styles from "../app/blog/[slug]/page.module.css";

type ArticleHeaderProps = {
  title: string;
  summary: string;
  date?: string;
  updated?: string | null;
  minutes: number;
  locale: ContentLocale;
  breadcrumbs: Array<{ label: string; href: string }>;
};

export function ArticleHeader({ title, summary, date, updated, minutes, locale, breadcrumbs }: ArticleHeaderProps) {
  const zh = locale === "zh";

  return (
    <header className={styles.header}>
      <nav className={styles.breadcrumb} aria-label={zh ? "面包屑" : "Breadcrumb"}>
        {breadcrumbs.map(({ label, href }) => (
          <Fragment key={href}>
            <Link href={href}>{label}</Link>
            <span aria-hidden="true">›</span>
          </Fragment>
        ))}
        <span aria-current="page">{title}</span>
      </nav>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.articleBadges}>
        <Link href={localePath(locale, "/about")} className={styles.authorBadge} aria-label={zh ? "作者：Derek Wang" : "Author: Derek Wang"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 5h17" /></svg>
          Derek Wang
        </Link>
        <span className={styles.readingBadge}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>
          {zh ? `${minutes} 分钟阅读` : `${minutes} min read`}
        </span>
      </div>
      <p className={styles.summary}>{summary}</p>
      {date || updated ? (
        <div className={styles.articleDates}>
          {date ? <time dateTime={date}>{formatContentDate(date, locale)}</time> : null}
          {date && updated ? <span aria-hidden="true">·</span> : null}
          {updated ? <span>{zh ? "最后更新于 " : "Updated "}<time dateTime={updated}>{formatContentDate(updated, locale)}</time></span> : null}
        </div>
      ) : null}
    </header>
  );
}
