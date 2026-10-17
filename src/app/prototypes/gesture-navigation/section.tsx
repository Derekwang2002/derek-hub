import Link from "next/link";
import type { ContentLocale } from "../../../../lib/locale";
import type { SectionData } from "./data";
import styles from "./motion.module.css";

export function SectionPreview({ section, index, locale }: { section: SectionData; index: number; locale: ContentLocale }) {
  return <div className={styles.chapterContent}>
    <header className={styles.chapterHeading}>
      <span className={styles.ordinal} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <h2>{section.label}</h2><p>{section.summary}</p>
      <Link className={styles.openSection} href={section.href}>{locale === "zh" ? "进入栏目" : "Open section"}<span aria-hidden="true">↗</span></Link>
    </header>
    <ul className={styles.entryList}>{section.entries.map((entry,i)=><li key={`${entry.href}-${i}`}><Link href={entry.href}><h3>{entry.title}</h3><p>{entry.detail}</p><span aria-hidden="true">↗</span></Link></li>)}</ul>
  </div>;
}
