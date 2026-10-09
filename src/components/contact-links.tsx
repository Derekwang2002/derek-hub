import Link from "next/link";
import { localePath, type ContentLocale } from "../../lib/locale";
import styles from "./contact-links.module.css";

export function ContactLinks({ locale, about = false }: { locale: ContentLocale; about?: boolean }) {
  return <div className={styles.links}>
    <a href="https://github.com/Derekwang2002" target="_blank" rel="noreferrer" className={styles.github}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" /></svg>GitHub
    </a>
    <a href="mailto:derekwang0282@gmail.com" className={styles.email} aria-label="Email: derekwang0282@gmail.com">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3V5Zm2 2v.5l7 5 7-5V7l-7 5-7-5Zm14 3-7 5-7-5v7h14v-7Z" /></svg>Email
    </a>
    {about ? <Link href={localePath(locale, "/about")} className={styles.about}>{locale === "zh" ? "关于我" : "About me"}<span aria-hidden="true">↗</span></Link> : null}
  </div>;
}
