import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { notePostSlugs, noteCollectionSlugs, postPath } from "../../lib/content-sections";
import { localePath, type ContentLocale } from "../../lib/locale";
import { getAllPosts } from "../../lib/posts";
import { getLocalizedPostBySlug } from "../../lib/localized-posts";
import { getProjectDefinitions } from "../../lib/projects";
import { BlogPostHeader } from "./blog-post-header";
import { ContentNavigation } from "./content-navigation";
import { getMarkdownHeadings, renderMarkdown } from "./markdown-renderer";
import { PostBodyLayout } from "./post-body-layout";
import { ProjectOverviewPage, ProjectItemPage, ProjectUpdatesPage, getProjectMetadata } from "./project-page";
import styles from "../app/blog/[slug]/page.module.css";

export async function getNoteStaticParams() {
  const posts = await getAllPosts("notes");
  return [
    ...posts.map(post => ({ slug: [post.slug] })),
    ...getProjectDefinitions("notes").filter(collection => collection.status !== "draft").flatMap(collection => [
      { slug: [collection.slug] },
      ...collection.items.filter(item => item.status === "published").map(item => ({ slug: [collection.slug, item.slug] })),
      { slug: [collection.slug, "updates"] }
    ])
  ];
}

export async function getNoteMetadata(slug: string[], locale: ContentLocale): Promise<Metadata> {
  if (slug.length <= 2 && noteCollectionSlugs.includes(slug[0])) {
    return getProjectMetadata(slug[0], slug[1] === "updates" ? null : slug[1] ?? null, locale, slug[1] === "updates");
  }
  const post = slug.length === 1 && notePostSlugs.includes(slug[0])
    ? await getLocalizedPostBySlug(slug[0], locale) : null;
  if (!post) return { title: locale === "zh" ? "笔记未找到" : "Note not found" };
  const pathname = postPath(post.slug);
  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: localePath(locale, pathname),
      languages: { en: pathname, "zh-CN": `/zh${pathname}` }
    },
    openGraph: {
      type: "article", title: post.title, description: post.summary,
      url: localePath(locale, pathname), publishedTime: `${post.date}T00:00:00.000Z`,
      images: [{ url: "/og-default.svg", width: 1200, height: 630, alt: post.title }]
    }
  };
}

export async function NotePage({ slug, locale }: { slug: string[]; locale: ContentLocale }) {
  if (slug.length <= 2 && noteCollectionSlugs.includes(slug[0])) {
    if (slug[1] === "updates") return <ProjectUpdatesPage projectSlug={slug[0]} locale={locale} />;
    if (slug[1]) return <ProjectItemPage projectSlug={slug[0]} itemSlug={slug[1]} locale={locale} />;
    return <ProjectOverviewPage projectSlug={slug[0]} locale={locale} />;
  }
  const post = slug.length === 1 && notePostSlugs.includes(slug[0])
    ? await getLocalizedPostBySlug(slug[0], locale) : null;
  if (!post) notFound();
  const tocItems = getMarkdownHeadings(post.content);
  const content = await renderMarkdown(post.content, tocItems);
  return <main className={`page-enter ${styles.postPage}`} lang={locale === "zh" ? "zh-CN" : "en"}>
    <ContentNavigation section="notes" locale={locale} />
    <PostBodyLayout
      header={<BlogPostHeader post={post} locale={locale} />}
      articleTitle={post.title} locale={locale} tocItems={tocItems}
    >{content}</PostBodyLayout>
  </main>;
}
