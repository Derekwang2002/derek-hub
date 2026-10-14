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
        <p lang="en">
          <span className={styles.education}>MSCS@USC</span>
          <br />
          Agent &amp; Backend Engineering
        </p>
        <ContactLinks locale={locale} about />
      </section>
      <ProfileCode locale={locale} />
    </main>
  );
}
