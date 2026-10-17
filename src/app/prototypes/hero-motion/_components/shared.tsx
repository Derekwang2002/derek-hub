"use client";

import { ContactLinks } from "@/components/contact-links";
import { HoverLetters, ProfileName } from "@/components/profile-name";
import { localePath, type ContentLocale } from "../../../../../lib/locale";
import base from "@/components/landing.module.css";
import styles from "./motion.module.css";
import type { ReactNode } from "react";

export { base, styles };
export type { ContentLocale };
export function Intro({ locale }: { locale: ContentLocale }) {
  return <section className={base.intro} aria-labelledby="home-title">
    <h1 id="home-title"><span className={base.greeting}><HoverLetters text={locale === "zh" ? "你好，我是" : "Hi, I’m"} /></span>{" "}<ProfileName href={localePath(locale, "/about")} title={locale === "zh" ? "关于我" : "About me"} />.</h1>
    <p lang="en"><span className={base.education}>MSCS@USC</span><br />Agent/Backend Engineering</p>
    <ContactLinks locale={locale} about />
  </section>;
}
export function WindowBar({ suffix }: { suffix?: ReactNode }) {
  return <figcaption className={base.windowBar}><span className={base.windowDots} aria-hidden="true"><i /><i /><i /></span><span>derek — zsh</span><span className={styles.windowStatus}>{suffix}</span></figcaption>;
}
export function Command({ children }: { children: ReactNode }) {
  return <div className={base.command}><span aria-hidden="true">❯</span><code>{children}</code></div>;
}
export function Stack() {
  return <dl className={base.terminalStack}><div><dt>languages</dt><dd>Python · Java</dd></div><div><dt>backend</dt><dd>FastAPI · Spring Boot</dd></div><div><dt>data</dt><dd>PostgreSQL · Redis · SQL</dd></div></dl>;
}
export function ProfileGroups() {
  return <><div className={base.commandGroup}><Command>whoami</Command><p className={base.terminalName}>Derek Wang</p></div><div className={base.commandGroup}><Command>cat <span>~/about.txt</span></Command><p>USC · M.S. Computer Science<br />AI Agents · Backend engineering</p></div><div className={base.commandGroup}><Command>cat <span>~/stack.txt</span></Command><Stack /></div></>;
}
