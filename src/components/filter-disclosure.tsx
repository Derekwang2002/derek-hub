import type { ReactNode } from "react";
import styles from "./filter-disclosure.module.css";

export function FilterDisclosure({ children, locale, count }: { children: ReactNode; locale: "en" | "zh"; count: number }) {
  return <details className={styles.filters}>
    <summary>{locale === "zh" ? "标签筛选" : "Filter tags"}{count > 0 ? <span className={styles.count}>{locale === "zh" ? `已选 ${count}` : `${count} selected`}</span> : null}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 6 3 3 3-3" /></svg></summary>
    <div className={styles.content}>{children}</div>
  </details>;
}
