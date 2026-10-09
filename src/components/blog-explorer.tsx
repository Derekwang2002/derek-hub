"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TagCount } from "../../lib/posts";
import styles from "../app/blog/page.module.css";

export type BlogExplorerPost = {
  date: string; slug: string; tags: string[]; title: string;
};

export function BlogExplorer({ locale = "en", posts, tags }: {
  locale?: "en" | "zh"; posts: BlogExplorerPost[]; tags: TagCount[];
}) {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const validTags = useMemo(() => new Set(tags.map(tag => tag.slug)), [tags]);
  const basePath = `${locale === "zh" ? "/zh" : ""}/blog`;
  useEffect(() => {
    function sync() { setActiveTags([...new Set(new URLSearchParams(location.search).getAll("tag"))].filter(tag => validTags.has(tag))); }
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [validTags]);

  function filter(next: string[]) {
    const params = new URLSearchParams();
    next.forEach(tag => params.append("tag", tag));
    window.history.pushState(null, "", next.length ? `${basePath}?${params}` : basePath);
    setActiveTags(next);
  }
  const filtered = posts.filter(post => activeTags.every(tag => post.tags.some(value => normalize(value) === tag)));

  return <>
    <div className={styles.filterBar} aria-label={locale === "zh" ? "按标签筛选" : "Filter by tag"}>
      {tags.map(tag => <button type="button" key={tag.slug} aria-pressed={activeTags.includes(tag.slug)} className={styles.filterTag}
        onClick={() => filter(activeTags.includes(tag.slug) ? activeTags.filter(value => value !== tag.slug) : [...activeTags, tag.slug])}>
        {tag.tag}<span>{tag.count}</span>
      </button>)}
      {activeTags.length ? <button type="button" className={styles.clearFilters} onClick={() => filter([])}>{locale === "zh" ? "清除筛选" : "Clear filters"}</button> : null}
    </div>
    <div className="list-swap" key={activeTags.join(",")}>
      {filtered.length ? <ul className={styles.postList}>{filtered.map(post => <li className={`row-highlight ${styles.postRow}`} key={post.slug}>
        <div className={styles.postHeader}>
          <Link className={styles.postLink} href={`${basePath}/${post.slug}`}>{post.title}</Link>
          <time className={styles.postDate} dateTime={post.date}>{post.date}</time>
        </div>

      </li>)}</ul> : <p className={styles.emptyState} role="status">{locale === "zh" ? "没有符合这些标签的文章。" : "No posts match these tags."}</p>}
    </div>
  </>;
}

function normalize(tag: string) { return tag.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
