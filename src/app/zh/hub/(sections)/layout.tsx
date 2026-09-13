import type { ReactNode } from "react";
import { HubNav } from "@/components/hub-nav";
import styles from "../../../hub/page.module.css";

export default function ChineseHubSectionsLayout({ children }: { children: ReactNode }) {
  return (
    <main className={`page-enter ${styles.hubPage}`} lang="zh-CN">
      <header className={styles.hero}>
        <h1 className={styles.title}>Hub</h1>
        <p className={styles.description}>可复用 Skills 与演示的统一入口。</p>
      </header>
      <HubNav locale="zh" />
      {children}
    </main>
  );
}
