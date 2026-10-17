import { PrimaryPageNavigation } from "@/components/primary-page-navigation";
import type { ReactNode } from "react";
import { HubNav } from "@/components/hub-nav";
import styles from "../page.module.css";

export default function HubSectionsLayout({ children }: { children: ReactNode }) {
  return (
    <PrimaryPageNavigation locale="en" current="resources"><main className={`page-enter ${styles.hubPage}`}>
      <HubNav locale="en" heading={<div className={styles.heading}>
          <h1 className={styles.title}>Resources</h1>
        </div>} />



      {children}
    </main></PrimaryPageNavigation>
  );
}
