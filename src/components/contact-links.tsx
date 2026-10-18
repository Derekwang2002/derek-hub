import Link from "next/link";
import { localePath, type ContentLocale } from "../../lib/locale";
import styles from "./contact-links.module.css";

export function ContactLinks({ locale, about = false, compactOnNarrow = false }: { locale: ContentLocale; about?: boolean; compactOnNarrow?: boolean }) {
  const emailLabel = locale === "zh" ? "发送邮件" : "Send email";
  return <div className={`${styles.links}${compactOnNarrow ? ` ${styles.compact}` : ""}`}>
    <a href="https://github.com/Derekwang2002" target="_blank" rel="noreferrer" className={styles.github} aria-label="GitHub" title="GitHub">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" /></svg><span className={styles.label}>GitHub</span>
    </a>
    <a href="https://www.linkedin.com/in/Xingen-Wang-27ng" target="_blank" rel="noreferrer" className={styles.linkedin} aria-label="LinkedIn" title="LinkedIn">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" /></svg><span className={styles.label}>LinkedIn</span>
    </a>
    <a href="mailto:derekwang0282@gmail.com" className={styles.email} aria-label={`${emailLabel}: derekwang0282@gmail.com`} title={emailLabel}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3V5Zm2 2v.5l7 5 7-5V7l-7 5-7-5Zm14 3-7 5-7-5v7h14v-7Z" /></svg><span className={styles.label}>Email</span>
    </a>
    {about ? <Link href={localePath(locale, "/about")} className={styles.about}>{locale === "zh" ? "关于我" : "About me"}<span aria-hidden="true">↗</span></Link> : null}
  </div>;
}
