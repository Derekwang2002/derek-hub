import type { ReactNode } from "react";
import { HubNav } from "@/components/hub-nav";
import { TitleNote } from "@/components/title-note";
import styles from "../page.module.css";

export default function HubSectionsLayout({ children }: { children: ReactNode }) {
  return (
    <main className={`page-enter ${styles.hubPage}`}>
      <header className={styles.hero}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Resources</h1>
          <TitleNote label="About resources">Reusable skills and interactive demos.</TitleNote>
        </div>
      </header>

      <HubNav />

      {children}
    </main>
  );
}
