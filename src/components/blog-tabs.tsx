import Link from "next/link";
import styles from "./blog-tabs.module.css";

export type BlogTab = "all" | "selected";

type BlogTabsProps = {
  activeTab: BlogTab;
  activeTag?: string;
};

export function BlogTabs({ activeTab, activeTag }: BlogTabsProps) {
  return (
    <nav aria-label="Blog filters" className={styles.tabs}>
      <Link
        className={activeTab === "all" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
        href={buildBlogHref("all", activeTag)}
        scroll={false}
      >
        All Posts
      </Link>
      <Link
        className={activeTab === "selected" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
        href={buildBlogHref("selected", activeTag)}
        scroll={false}
      >
        Selected
      </Link>
    </nav>
  );
}

function buildBlogHref(tab: BlogTab, tag: string | undefined): string {
  const params = new URLSearchParams({ tab });

  if (tag) {
    params.set("tag", tag);
  }

  return `/blog?${params.toString()}`;
}
