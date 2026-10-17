import Image from "next/image";
import type { ContentLocale } from "../../lib/locale";
import type { NavigationPreviewSection } from "./home-navigation-data";
import styles from "./home-navigation.module.css";

/** Decorative crops; the real navigation anchors remain the only interactive elements. */
export function HomeNavigationPreview({ section, locale }: { section: NavigationPreviewSection; locale: ContentLocale }) {
  return <div className={styles.previewContent}>
    {section.id === "notes" && <div className={styles.paper}>
      <span>Theoretical Machine Learning</span><strong>{locale === "zh" ? "学习的边界" : "The limits of learning"}</strong>
      <Image src="/projects/csci678/lecture-4/figure-2.png" alt="" fill sizes="640px" className={styles.figure}/>
    </div>}
    {section.id === "blog" && <div className={styles.article}><strong>{section.entries[0]?.title}</strong></div>}
    {section.id === "projects" && <div className={styles.projectImage}><Image src="/projects/ai-intelligence/design/matrix-dark.png" alt="" fill sizes="800px"/></div>}
    {section.id === "resources" && <div className={styles.resourcePrint}>{section.entries.map((entry, i) => <strong key={i}>{entry.title}</strong>)}</div>}
    {section.id === "about" && <div className={styles.schoolIdentity}>
      <div className={styles.schoolMark}><Image src="/schools/usc-seal.svg" alt="" width={240} height={240}/></div>
      <div className={styles.schoolMark}><Image src="/schools/swufe-logo.svg" alt="" width={240} height={240}/></div>
    </div>}
  </div>;
}
