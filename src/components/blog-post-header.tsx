import type { Post } from "../../lib/posts";
import { localePath, type ContentLocale } from "../../lib/locale";
import { getPostMetadata } from "../../lib/post-metadata";
import { ArticleHeader } from "./article-header";

export async function BlogPostHeader({ post, locale }: { post: Post; locale: ContentLocale }) {
  const { minutes, updated } = await getPostMetadata(post);
  return <ArticleHeader
    title={post.title}
    summary={post.summary}
    date={post.date}
    updated={updated}
    minutes={minutes}
    locale={locale}
    breadcrumbs={[{ label: locale === "zh" ? "博客" : "Blog", href: localePath(locale, "/blog") }]}
  />;
}
