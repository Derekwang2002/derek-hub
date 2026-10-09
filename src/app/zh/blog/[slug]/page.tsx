import { BlogPostHeader } from "@/components/blog-post-header";
import { ContentNavigation } from "@/components/content-navigation";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarkdownHeadings, renderMarkdown } from "@/components/markdown-renderer";
import { PostBodyLayout } from "@/components/post-body-layout";
import { getAllPosts } from "../../../../../lib/posts";
import { getLocalizedPostBySlug } from "../../../../../lib/localized-posts";
import styles from "../../../blog/[slug]/page.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getLocalizedPostBySlug((await params).slug, "zh");
  return post
    ? { title: post.title, description: post.summary, alternates: { canonical: `/zh/blog/${post.slug}` } }
    : { title: "文章未找到" };
}

export default async function ChineseBlogPostPage({ params }: Props) {
  const post = await getLocalizedPostBySlug((await params).slug, "zh");
  if (!post) notFound();
  const tocItems = getMarkdownHeadings(post.content);
  const renderedContent = await renderMarkdown(post.content, tocItems);

  return (
    <main className={`page-enter ${styles.postPage}`} lang="zh-CN">
      <ContentNavigation section="blog" locale="zh" />
      <PostBodyLayout
        header={<BlogPostHeader post={post} locale="zh" />}
        articleTitle={post.title}
        locale="zh"
        tocItems={tocItems}
      >
        {renderedContent}
      </PostBodyLayout>
    </main>
  );
}
