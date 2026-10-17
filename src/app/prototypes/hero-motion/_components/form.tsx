"use client";

import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { localePath, type ContentLocale } from "../../../../../lib/locale";
import styles from "./form.module.css";

export function FormHero({ locale }: { locale: ContentLocale }) {
  const zh = locale === "zh";
  const artwork = useRef<HTMLImageElement>(null);
  const reset = () => { artwork.current?.style.removeProperty("transform"); };
  const move = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    if (artwork.current) artwork.current.style.transform = `translate(${x * 12}px,${y * 8}px) rotate(${x * 3}deg)`;
  };
  return <main className={styles.hero} lang={zh ? "zh-CN" : "en"}>
    <section className={styles.intro} aria-labelledby="home-title">
      <p className={styles.greeting}>{zh ? "你好，我是" : "Hi, I’m"}</p>
      <h1 id="home-title"><Link href={localePath(locale, "/about")} aria-label="Derek Wang"><span>Derek</span><span>Wang<span className={styles.period}>.</span></span></Link></h1>
      <p className={styles.education}>MSCS <span aria-hidden="true">/</span> USC</p>
      <p className={styles.focus} lang="en">Agent &amp; Backend<br /><span>Engineering.</span></p>
      <nav className={styles.links} aria-label={zh ? "个人链接" : "Personal links"}>
        <Link href={localePath(locale, "/about")}>{zh ? "关于我" : "About me"}<span aria-hidden="true">↗</span></Link>
        <a href="https://github.com/Derekwang2002" target="_blank" rel="noreferrer">GitHub</a>
        <a href="mailto:derekwang0282@gmail.com">Email</a>
      </nav>
    </section>
    <section className={styles.visual} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset} aria-label={zh ? "技术档案" : "Technical profile"}>
      <div className={styles.artwork} aria-hidden="true">
        <Image ref={artwork} src="/prototypes/hero-motion/assets/folded-form.png" alt="" width={1280} height={1280} sizes="(max-width: 800px) 90vw, 550px" priority />
      </div>
      <div className={styles.index}>
        <p className={styles.indexTitle}><span>{zh ? "技术栈" : "TECH STACK"}</span><span aria-hidden="true">↙</span></p>
        <dl>
          <div><dt>Languages</dt><dd>Python · Java</dd></div>
          <div><dt>Backend</dt><dd>FastAPI · Spring Boot</dd></div>
          <div><dt>Data</dt><dd>PostgreSQL · Redis · SQL</dd></div>
        </dl>
      </div>
    </section>
  </main>;
}
