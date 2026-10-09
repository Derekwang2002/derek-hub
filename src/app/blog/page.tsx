import type { Metadata } from "next";
import { BlogExplorer, type BlogExplorerPost } from "@/components/blog-explorer";
import {
  normalizeTagSlug,
  type Post,
  type TagCount
} from "../../../lib/posts";
import { getAllLocalizedPosts } from "../../../lib/localized-posts";
import styles from "./page.module.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Blog",
  description: "Technical articles and engineering practice, organized by topic.",
  alternates: { canonical: "/blog", languages: { en: "/blog", "zh-CN": "/zh/blog" } },
  openGraph: {
    title: "Blog | Derek Hub",
    description: "Technical articles and engineering practice, organized by topic.",
    url: "/blog",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Blog Open Graph Image"
      }
    ]
  }
};

export default async function BlogPage() {
  const allPosts = await loadBlogData();
  const posts = allPosts.map(toExplorerPost);
  const tags = getTagsWithCounts(posts);

  return (
    <main className={`page-enter ${styles.blogPage}`}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Blog</h1>

      </header>

      <BlogExplorer posts={posts} tags={tags} />
    </main>
  );
}

async function loadBlogData(): Promise<Post[]> {
  try {
    return await getAllLocalizedPosts("en");
  } catch {
    return [];
  }
}

function toExplorerPost(post: Post): BlogExplorerPost {
  return {
    date: post.date,
    slug: post.slug,
    tags: post.tags,
    title: post.title
  };
}

function getTagsWithCounts(posts: BlogExplorerPost[]): TagCount[] {
  const tagMap = new Map<string, { count: number; variants: Set<string> }>();

  for (const post of posts) {
    const uniqueTagsInPost = new Set<string>();

    for (const tag of post.tags) {
      const slug = normalizeTagSlug(tag);
      if (!slug || uniqueTagsInPost.has(slug)) {
        continue;
      }

      uniqueTagsInPost.add(slug);
      const existing = tagMap.get(slug);

      if (existing) {
        existing.count += 1;
        existing.variants.add(tag.trim());
      } else {
        tagMap.set(slug, {
          count: 1,
          variants: new Set([tag.trim()])
        });
      }
    }
  }

  return Array.from(tagMap.entries())
    .map(([slug, value]) => ({
      slug,
      count: value.count,
      tag: pickCanonicalTag(value.variants)
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.tag.localeCompare(b.tag, "en", { sensitivity: "base" });
    });
}

function pickCanonicalTag(variants: Set<string>): string {
  return Array.from(variants).sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" })
  )[0];
}
