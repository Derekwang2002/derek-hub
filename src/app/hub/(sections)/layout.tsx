import type { ReactNode } from "react";
import { HubNav } from "@/components/hub-nav";
import styles from "../page.module.css";

export default function HubSectionsLayout({ children }: { children: ReactNode }) {
  return (
    <main className={`page-enter ${styles.hubPage}`}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Hub</h1>
        <p className={styles.description}>
          Unified entry point for reusable skills and demos.
        </p>
      </header>

      <HubNav />

      {children}
    </main>
  );
}
