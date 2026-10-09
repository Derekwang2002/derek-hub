import { localePath, type ContentLocale } from "../../lib/locale";
import { ContactLinks } from "./contact-links";
import { ProfileCode } from "./profile-code";
import { HoverLetters, ProfileName } from "./profile-name";
import styles from "./landing.module.css";

export function HomeContent({ locale }: { locale: ContentLocale }) {
  const zh = locale === "zh";
  return (
    <main className={styles.home} lang={zh ? "zh-CN" : "en"}>
      <section className={styles.intro} aria-labelledby="home-title">
        <h1 id="home-title">
          <span className={styles.greeting}><HoverLetters text={zh ? "你好，我是" : "Hi, I’m"} /></span>{" "}
          <ProfileName href={localePath(locale, "/about")} title={zh ? "关于我" : "About me"} />.
        </h1>
        <p>
          {zh ? "USC 计算机科学硕士在读。" : "Computer science master’s student at USC."}
          <br />
          {zh ? "专注 AI Agent 与后端工程。" : "Focused on AI agents and backend engineering."}
        </p>
        <ContactLinks locale={locale} about />
      </section>
      <ProfileCode />
    </main>
  );
}
