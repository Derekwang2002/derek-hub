import Link from "next/link";
import type { Post } from "../../lib/posts";
import { formatContentDate, localePath, type ContentLocale } from "../../lib/locale";
import { getPostMetadata } from "../../lib/post-metadata";
import styles from "../app/blog/[slug]/page.module.css";

export async function BlogPostHeader({ post, locale }: { post: Post; locale: ContentLocale }) {
  const { minutes, updated } = await getPostMetadata(post);
  const zh = locale === "zh";
  return <header className={styles.header}>
    <nav className={styles.breadcrumb} aria-label={zh ? "面包屑" : "Breadcrumb"}><Link href={localePath(locale, "/blog")}>{zh ? "博客" : "Blog"}</Link><span aria-hidden="true">›</span><span aria-current="page">{post.title}</span></nav>
    <h1 className={styles.title}>{post.title}</h1>
    <div className={styles.articleBadges}>
      <Link href={localePath(locale, "/about")} className={styles.authorBadge} aria-label={zh ? "作者：Derek Wang" : "Author: Derek Wang"}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 5h17" /></svg>Derek Wang</Link>
      <span className={styles.readingBadge}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>{zh ? `${minutes} 分钟阅读` : `${minutes} min read`}</span>
    </div>
    <p className={styles.summary}>{post.summary}</p>
    <div className={styles.articleDates}><time dateTime={post.date}>{formatContentDate(post.date, locale)}</time>{updated ? <><span aria-hidden="true">·</span><span>{zh ? "最后更新于 " : "Updated "}<time dateTime={updated}>{formatContentDate(updated, locale)}</time></span></> : null}</div>
  </header>;
}
