"use client";

import { useState } from "react";
import styles from "../app/blog/[slug]/page.module.css";

export type TocItem = {
  id: string;
  level: number;
  text: string;
};

type PostTocProps = {
  items: TocItem[];
};

export function PostToc({ items }: PostTocProps) {
  const [open, setOpen] = useState(true);

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className={styles.toc} aria-label="Post table of contents">
      <button
        aria-controls="post-toc-list"
        aria-expanded={open}
        className={styles.tocToggle}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>Contents</span>
        <span aria-hidden="true" className={styles.tocIndicator}>
          {open ? "-" : "+"}
        </span>
      </button>

      {open ? (
        <ol className={styles.tocList} id="post-toc-list">
          {items.map((item) => (
            <li className={styles[`tocLevel${Math.min(item.level, 4)}`]} key={item.id}>
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ol>
      ) : null}
    </aside>
  );
}
