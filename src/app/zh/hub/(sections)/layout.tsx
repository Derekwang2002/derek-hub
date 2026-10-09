import type { ReactNode } from "react";
import { HubNav } from "@/components/hub-nav";
import { TitleNote } from "@/components/title-note";
import styles from "../../../hub/page.module.css";

export default function ChineseHubSectionsLayout({ children }: { children: ReactNode }) {
  return (
    <main className={`page-enter ${styles.hubPage}`} lang="zh-CN">
      <header className={styles.hero}>
        <div className={styles.heading}>
          <h1 className={styles.title}>资源</h1>
          <TitleNote label="资源说明">可复用 Skills 与交互演示。</TitleNote>
        </div>
      </header>
      <HubNav locale="zh" />
      {children}
    </main>
  );
}
