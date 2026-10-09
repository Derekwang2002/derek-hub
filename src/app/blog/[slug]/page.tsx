import { BlogPostHeader } from "@/components/blog-post-header";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarkdownHeadings, renderMarkdown } from "@/components/markdown-renderer";
import { PostBodyLayout } from "@/components/post-body-layout";
import { getAllPosts } from "../../../../lib/posts";
import { getLocalizedPostBySlug } from "../../../../lib/localized-posts";
import styles from "./page.module.css";

const DEFAULT_OG_IMAGE = "/og-default.svg";

const SITE_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
})();

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getLocalizedPostBySlug(slug, "en");

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found."
    };
  }

  const absoluteUrl = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `/blog/${post.slug}`,
      languages: { en: `/blog/${post.slug}`, "zh-CN": `/zh/blog/${post.slug}` }
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url: absoluteUrl,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${post.title} Open Graph Image`
        }
      ],
      publishedTime: `${post.date}T00:00:00.000Z`
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getLocalizedPostBySlug(slug, "en");

  if (!post) {
    notFound();
  }

  const tocItems = getMarkdownHeadings(post.content);
  const renderedContent = await renderMarkdown(post.content, tocItems);

  return (
    <main className={`page-enter ${styles.postPage}`}>
      <PostBodyLayout header={<BlogPostHeader post={post} locale="en" />} articleTitle={post.title} tocItems={tocItems}>
        {renderedContent}
      </PostBodyLayout>
    </main>
  );
}
