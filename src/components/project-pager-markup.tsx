import React from "react";
import Link from "next/link";
import type { ContentLocale } from "../../lib/locale";
import type { ProjectPager as ProjectPagerValue } from "../../lib/projects";

export function ProjectPagerMarkup({
  classes,
  locale,
  pager
}: {
  classes: {
    pager: string;
    next: string;
    previous: string;
  };
  locale: ContentLocale;
  pager: ProjectPagerValue;
}) {
  if (!pager.previous && !pager.next) return null;

  return (
    <nav
      aria-label={locale === "zh" ? "项目文档翻页" : "Project documentation pagination"}
      className={classes.pager}
    >
      {pager.previous ? (
        <Link
          aria-label={`${locale === "zh" ? "上一篇" : "Previous"}: ${pager.previous.label}`}
          className={classes.previous}
          href={pager.previous.href}
          rel="prev"
        >
          <span aria-hidden="true">←</span>
          <span>{pager.previous.label}</span>
        </Link>
      ) : null}
      {pager.next ? (
        <Link
          aria-label={`${locale === "zh" ? "下一篇" : "Next"}: ${pager.next.label}`}
          className={classes.next}
          href={pager.next.href}
          rel="next"
        >
          <span>{pager.next.label}</span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </nav>
  );
}
