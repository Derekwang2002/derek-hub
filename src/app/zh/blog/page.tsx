import type { Metadata } from "next";
import { BlogExplorer, type BlogExplorerPost } from "@/components/blog-explorer";
import { getAllLocalizedPosts } from "../../../../lib/localized-posts";
import { normalizeTagSlug, type Post, type TagCount } from "../../../../lib/posts";
import styles from "../../blog/page.module.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "博客",
  description: "按时间整理的技术文章与工程实践。",
  alternates: { canonical: "/zh/blog", languages: { en: "/blog", "zh-CN": "/zh/blog" } }
};

export default async function ChineseBlogPage() {
  const allPosts = await loadBlogData();
  const posts = allPosts.map(toExplorerPost);
  const tags = getTagsWithCounts(posts);

  return (
    <main className={`page-enter ${styles.blogPage}`} lang="zh-CN">
      <header className={styles.hero}>
        <h1 className={styles.title}>博客</h1>

      </header>
      <BlogExplorer locale="zh" posts={posts} tags={tags} />
    </main>
  );
}

async function loadBlogData(): Promise<Post[]> {
  try { return await getAllLocalizedPosts("zh"); } catch { return []; }
}

function toExplorerPost(post: Post): BlogExplorerPost {
  return { date: post.date, slug: post.slug, tags: post.tags, title: post.title };
}

function getTagsWithCounts(posts: BlogExplorerPost[]): TagCount[] {
  const tagMap = new Map<string, { count: number; variants: Set<string> }>();
  for (const post of posts) {
    const unique = new Set<string>();
    for (const tag of post.tags) {
      const slug = normalizeTagSlug(tag);
      if (!slug || unique.has(slug)) continue;
      unique.add(slug);
      const current = tagMap.get(slug);
      if (current) { current.count += 1; current.variants.add(tag.trim()); }
      else tagMap.set(slug, { count: 1, variants: new Set([tag.trim()]) });
    }
  }
  return Array.from(tagMap.entries()).map(([slug, value]) => ({
    slug, count: value.count,
    tag: Array.from(value.variants).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))[0]
  })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "en", { sensitivity: "base" }));
}
