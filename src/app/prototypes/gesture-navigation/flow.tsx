"use client";
import { useEffect, useRef, useState } from "react";
import { HomeContent } from "@/components/landing-content";
import type { ContentLocale } from "../../../../lib/locale";
import type { SectionData } from "./data";
import { SectionPreview } from "./section";
import styles from "./motion.module.css";

export function Flow({ locale, sections }: { locale: ContentLocale; sections: SectionData[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("home");
  useEffect(()=>{
    const el=root.current!;
    const hero=el.querySelector<HTMLElement>("[data-hero]")!;
    const intro=hero.querySelector<HTMLElement>("main > section")!;
    const terminal=hero.querySelector<HTMLElement>("figure")!;
    const chapters=[...el.querySelectorAll<HTMLElement>("[data-chapter]")];
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0;
    const paint=()=>{
      frame=0;
      const offset=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--site-header-height"))*parseFloat(getComputedStyle(document.documentElement).fontSize);
      const p=Math.max(0,Math.min(1,(offset-hero.getBoundingClientRect().top)/(innerHeight*.55)));
      intro.style.transform=reduced.matches||p===0?"":`translate3d(0,${-p*90}px,0)`;
      intro.style.opacity=reduced.matches?"":`${1-p*.8}`;
      terminal.style.transform=reduced.matches||p===0?"":`perspective(1100px) translate3d(${p*30}px,${-p*100}px,0) rotateY(${-p*9}deg) scale(${1-p*.12})`;
      terminal.style.opacity=reduced.matches?"":`${1-p*.6}`;
      let current="home";
      chapters.forEach(chapter=>{
        const rect=chapter.getBoundingClientRect();
        const progress=Math.max(0,Math.min(1,(innerHeight*.92-rect.top)/(innerHeight*.55)));
        const content=chapter.firstElementChild as HTMLElement;
        content.style.transform=reduced.matches?"":`translate3d(0,${(1-progress)*80}px,0) scale(${.97+progress*.03})`;
        content.style.opacity=reduced.matches?"":`${.25+progress*.75}`;
        if(rect.top<innerHeight*.5) current=chapter.id;
      });
      setActive(current);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);reduced.addEventListener("change",schedule);paint();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);reduced.removeEventListener("change",schedule);};
  },[]);
  return <div className={styles.flow} ref={root}>
    <div className={styles.flowHero} id="home" data-hero><div className={styles.heroPin}><HomeContent locale={locale}/><a className={styles.scrollHint} href="#notes">{locale==="zh"?"向下滚动，继续探索":"Scroll to explore"}<span aria-hidden="true">↓</span></a></div></div>
    {sections.map((section,index)=><section className={styles.flowChapter} key={section.id} id={section.id} aria-label={section.label} data-chapter><SectionPreview section={section} index={index} locale={locale}/></section>)}
    <nav className={styles.progressRail} aria-label={locale==="zh"?"滚动章节":"Scroll chapters"}>{[{id:"home",label:locale==="zh"?"首页":"Home"},...sections].map(s=><a href={`#${s.id}`} key={s.id} aria-current={active===s.id?"location":undefined}><i/><span>{s.label}</span></a>)}</nav>
  </div>;
}
