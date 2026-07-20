import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarkdownHeadings, renderMarkdown } from "@/components/markdown-renderer";
import { PostBodyLayout } from "@/components/post-body-layout";
import {
  PostSeriesPager,
  type PostSeriesPagerLink
} from "@/components/post-series-pager";
import { formatContentDate } from "../../lib/locale";
import { getLocalizedPostBySlug } from "../../lib/localized-posts";
import { normalizeTagSlug } from "../../lib/posts";
import {
  getPostSeriesDefinition,
  getPostSeriesDocument,
  getPostSeriesDocuments,
  type PostSeriesLocale
} from "../../lib/post-series";
import styles from "../app/blog/[slug]/page.module.css";

const SITE_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
})();

type PostSeriesDocumentPageProps = {
  docSlug: string;
  locale: PostSeriesLocale;
  seriesSlug: string;
};

export async function PostSeriesDocumentPage({
  docSlug,
  locale,
  seriesSlug
}: PostSeriesDocumentPageProps): Promise<JSX.Element> {
  const definition = getPostSeriesDefinition(seriesSlug);
  const documents = definition
    ? await getPostSeriesDocuments(seriesSlug, locale)
    : [];
  const documentIndex = documents.findIndex((candidate) => candidate.slug === docSlug);
  const document = documents[documentIndex];

  if (!definition || !document) {
    notFound();
  }

  const parentPost = await getLocalizedPostBySlug(definition.parentPostSlug, locale);
  if (!parentPost) {
    notFound();
  }

  const localePrefix = locale === "zh" ? "/zh" : "";
  const blogHref = `${localePrefix}/blog`;
  const localizedParentHref = `${blogHref}/${definition.parentPostSlug}`;
  const previous = documents[documentIndex - 1] ?? null;
  const next = documents[documentIndex + 1] ?? null;
  const previousLink: PostSeriesPagerLink = previous
    ? toPagerLink(previous.order, previous.slug, previous.title)
    : {
        href: localizedParentHref,
        label: locale === "zh" ? "第 0 篇：架构总览" : "Part 0: Architecture overview"
      };
  const nextLink = next ? toPagerLink(next.order, next.slug, next.title) : null;
  const tocItems = getMarkdownHeadings(document.content);
  const renderedContent = await renderMarkdown(document.content, tocItems);

  function toPagerLink(order: number, slug: string, title: string): PostSeriesPagerLink {
    const label = locale === "zh"
      ? `第 ${order} 篇：${title}`
      : `Part ${order}: ${title}`;
    return { href: `${blogHref}/${seriesSlug}/${slug}`, label };
  }

  return (
    <main className={styles.postPage} lang={locale === "zh" ? "zh-CN" : "en"}>
      <header className={styles.header}>
        <nav
          aria-label={locale === "zh" ? "系列位置" : "Series position"}
          className={styles.seriesContext}
        >
          <Link href={localizedParentHref}>CALL-E Agentic Goal</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">
            {locale === "zh" ? `第 ${document.order} 篇` : `Part ${document.order}`}
          </span>
        </nav>
        <h1 className={styles.title}>{document.title}</h1>
        <time className={styles.date} dateTime={parentPost.date}>
          {formatContentDate(parentPost.date, locale)}
        </time>
        <ul className={styles.tags}>
          {parentPost.tags.map((tag) => (
            <li key={tag}>
              <Link
                className={styles.tagLink}
                href={`${blogHref}?tag=${normalizeTagSlug(tag)}`}
              >
                {tag}
              </Link>
            </li>
          ))}
        </ul>
      </header>

      <PostBodyLayout
        articleTitle={document.title}
        locale={locale}
        tocItems={tocItems}
      >
        {renderedContent}
      </PostBodyLayout>
      <PostSeriesPager locale={locale} next={nextLink} previous={previousLink} />
    </main>
  );
}

export async function getPostSeriesDocumentMetadata({
  docSlug,
  locale,
  seriesSlug
}: PostSeriesDocumentPageProps): Promise<Metadata> {
  const definition = getPostSeriesDefinition(seriesSlug);
  const document = await getPostSeriesDocument(seriesSlug, docSlug, locale);

  if (!definition || !document) {
    notFound();
  }

  const parentPost = await getLocalizedPostBySlug(definition.parentPostSlug, locale);
  if (!parentPost) {
    notFound();
  }

  const localePrefix = locale === "zh" ? "/zh" : "";
  const pathname = `${localePrefix}/blog/${seriesSlug}/${docSlug}`;

  return {
    title: document.title,
    description: document.summary,
    alternates: {
      canonical: pathname,
      languages: {
        en: `/blog/${seriesSlug}/${docSlug}`,
        "zh-CN": `/zh/blog/${seriesSlug}/${docSlug}`
      }
    },
    openGraph: {
      type: "article",
      title: document.title,
      description: document.summary,
      url: `${SITE_URL}${pathname}`,
      images: [
        {
          url: "/og-default.svg",
          width: 1200,
          height: 630,
          alt: `${document.title} Open Graph Image`
        }
      ],
      publishedTime: `${parentPost.date}T00:00:00.000Z`
    }
  };
}
