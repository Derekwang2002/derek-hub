import type { Metadata } from "next";
import { HubNav } from "@/components/hub-nav";
import { ResourceList } from "@/components/resource-list";
import { getPublicResources } from "../../../lib/resources";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Hub",
  description: "Unified entry point for featured resources, reusable skills, and demos.",
  openGraph: {
    title: "Hub | Personal Website",
    description: "Unified entry point for featured resources, reusable skills, and demos.",
    url: "/hub",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Hub Open Graph Image"
      }
    ]
  }
};

export default function HubPage() {
  const resources = getPublicResources();

  return (
    <main className={styles.hubPage}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Hub</h1>
        <p className={styles.description}>
          One entry point for featured resources, reusable skills, and temporary demos.
        </p>
      </header>

      <HubNav active="all" />

      <ResourceList
        emptyMessage="No public resources yet."
        resources={resources}
        title="All Resources"
      />
    </main>
  );
}
