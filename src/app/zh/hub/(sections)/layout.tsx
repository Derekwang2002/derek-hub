import { PrimaryPageNavigation } from "@/components/primary-page-navigation";
import type { ReactNode } from "react";
import { HubNav } from "@/components/hub-nav";
import styles from "../../../hub/page.module.css";

export default function ChineseHubSectionsLayout({ children }: { children: ReactNode }) {
  return (
    <PrimaryPageNavigation locale="zh" current="resources"><main className={`page-enter ${styles.hubPage}`} lang="zh-CN">
      <HubNav locale="zh" heading={<div className={styles.heading}>
          <h1 className={styles.title}>资源</h1>
        </div>} />

      {children}
    </main></PrimaryPageNavigation>
  );
}
