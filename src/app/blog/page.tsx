import type { Metadata } from "next";
import Link from "next/link";
import { BlogTabs, type BlogTab } from "@/components/blog-tabs";
import { getAllPosts, getSelectedPosts, type Post } from "../../../lib/posts";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "Chronological timeline of blog posts with all and selected filters.",
  openGraph: {
    title: "Blog | Personal Website",
    description: "Chronological timeline of blog posts with all and selected filters.",
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

type BlogPageProps = {
  searchParams?: Promise<{
    tab?: string | string[];
  }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const activeTab = resolveTab(resolvedSearchParams?.tab);
  const { allPosts, selectedPosts } = await loadBlogData();
  const posts = activeTab === "selected" ? selectedPosts : allPosts;
  const latestPost = allPosts[0];

  return (
    <main className={styles.blogPage}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.description}>
          Writing, study notes, and implementation records collected chronologically.
        </p>
        <dl className={styles.metaStrip} aria-label="Blog summary">
          <div>
            <dt>Posts</dt>
            <dd>{allPosts.length}</dd>
          </div>
          <div>
            <dt>Selected</dt>
            <dd>{selectedPosts.length}</dd>
          </div>
          <div>
            <dt>Latest</dt>
            <dd>{latestPost ? formatPostDate(latestPost.date) : "None"}</dd>
          </div>
        </dl>
      </header>

      <BlogTabs activeTab={activeTab} />

      {posts.length === 0 ? (
        activeTab === "selected" ? (
          <>
            <p className={styles.emptyState}>No selected posts yet.</p>
            <p className={styles.emptyState}>
              <Link href="/blog?tab=all">View all posts</Link>
            </p>
          </>
        ) : (
          <>
            <p className={styles.emptyState}>No posts published yet.</p>
            <p className={styles.emptyState}>
              <Link href="/">Back to Home</Link>
            </p>
          </>
        )
      ) : (
        <ul className={styles.postList}>
          {posts.map((post) => (
            <li className={styles.postRow} key={post.slug}>
              <div className={styles.postHeader}>
                <Link className={styles.postLink} href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
                <time className={styles.postDate} dateTime={post.date}>
                  {formatPostDate(post.date)}
                </time>
              </div>
              <p className={styles.postSummary}>{post.summary}</p>
              <p className={styles.postMeta}>{formatPostMeta(post)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

async function loadBlogData(): Promise<{ allPosts: Post[]; selectedPosts: Post[] }> {
  try {
    const [allPosts, selectedPosts] = await Promise.all([getAllPosts(), getSelectedPosts()]);
    return { allPosts, selectedPosts };
  } catch {
    return { allPosts: [], selectedPosts: [] };
  }
}

function resolveTab(tab: string | string[] | undefined): BlogTab {
  const value = Array.isArray(tab) ? tab[0] : tab;
  return value === "selected" ? "selected" : "all";
}

function formatPostDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(parsed);
}

function formatPostMeta(post: Post): string {
  const parts = [...post.tags];

  if (post.selected) {
    parts.unshift("Selected");
  }

  return parts.join(" · ");
}
