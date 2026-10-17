"use client";

import { base, Intro, styles, type ContentLocale } from "./shared";
import { SenseTerminal } from "./sense-terminal";

export function PointerHero({ locale }: { locale: ContentLocale }) {
  return <div className={styles.pointer}>
    <main className={base.home} lang={locale === "zh" ? "zh-CN" : "en"}>
      <Intro locale={locale} />
      <SenseTerminal />
    </main>
  </div>;
}
