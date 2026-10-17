"use client";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { HomeContent } from "@/components/landing-content";
import type { ContentLocale } from "../../../../lib/locale";
import type { SectionData } from "./data";
import { SectionPreview } from "./section";
import styles from "./motion.module.css";

export function Swipe({locale,sections}:{locale:ContentLocale;sections:SectionData[]}) {
  const rail=useRef<HTMLDivElement>(null);
  const [current,setCurrent]=useState(0);
  const active=useRef(0);
  const labels=[locale==="zh"?"首页":"Home",...sections.map(s=>s.label)];
  const go=useCallback((i:number)=>{
    const el=rail.current;if(!el)return;
    const index=Math.max(0,Math.min(sections.length,i));
    el.scrollTo({left:index*el.clientWidth,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  },[sections.length]);
  useEffect(()=>{
    const el=rail.current!;
    let frame=0;
    const ids=["home",...sections.map(s=>s.id)];
    const requested=ids.indexOf(new URLSearchParams(location.search).get("section")??"home");
    active.current=Math.max(0,requested);
    el.scrollTo({left:active.current*el.clientWidth,behavior:"instant"});
    setCurrent(active.current);
    const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
      active.current=Math.max(0,Math.min(sections.length,Math.round(el.scrollLeft/el.clientWidth)));
      setCurrent(active.current);
      const url=new URL(location.href);
      if(url.searchParams.get("section")!==ids[active.current]) {
        url.searchParams.set("section",ids[active.current]);
        history.replaceState(null,"",url);
      }
    });};
    const resize=new ResizeObserver(()=>{el.scrollTo({left:active.current*el.clientWidth,behavior:"instant"});update();});
    resize.observe(el);el.addEventListener("scroll",update,{passive:true});
    return()=>{resize.disconnect();el.removeEventListener("scroll",update);cancelAnimationFrame(frame);};
  },[sections]);
  const key=(event:KeyboardEvent)=>{
    if(event.target instanceof HTMLElement && event.target.closest("input,textarea,select,[contenteditable=true]"))return;
    if(event.key!=="ArrowLeft"&&event.key!=="ArrowRight"&&event.key!=="Home"&&event.key!=="End")return;
    event.preventDefault();event.stopPropagation();
    go(event.key==="Home"?0:event.key==="End"?sections.length:current+(event.key==="ArrowRight"?1:-1));
  };
  return <div className={styles.swipe} data-gesture-swipe onKeyDown={key}>
    <div className={styles.swipeRail} ref={rail} tabIndex={0} role="region" aria-roledescription={locale==="zh"?"可左右滑动的栏目":"section carousel"} aria-label={locale==="zh"?"左右滑动切换栏目，上下滚动阅读":"Swipe horizontally between sections; scroll vertically to read"}>
      <section className={styles.slide} aria-label={labels[0]} inert={current!==0}><HomeContent locale={locale}/></section>
      {sections.map((section,index)=><section className={styles.slide} key={section.id} aria-label={section.label} inert={current!==index+1}><SectionPreview section={section} index={index} locale={locale}/></section>)}
    </div>
    <div className={styles.swipeDock}>
      <div className={styles.swipeControls}><button onClick={()=>go(current-1)} disabled={current===0} aria-label={locale==="zh"?"上一栏目":"Previous section"}>←</button><p aria-live="polite"><span>{labels[current]}</span><small>{String(current+1).padStart(2,"0")} / 06</small></p><button onClick={()=>go(current+1)} disabled={current===sections.length} aria-label={locale==="zh"?"下一栏目":"Next section"}>→</button></div>
      <div className={styles.sectionDots} aria-label={locale==="zh"?"栏目位置":"Section position"}>{labels.map((label,i)=><button key={label} onClick={()=>go(i)} aria-label={label} aria-current={current===i?"location":undefined}/>)}</div>
      <p className={styles.swipeHelp}>{locale==="zh"?"左右滑动切换栏目 · 栏目内上下阅读 · 聚焦后可用方向键":"Swipe sideways to switch · Scroll within a section · Arrow keys when focused"}</p>
    </div>
  </div>;
}
