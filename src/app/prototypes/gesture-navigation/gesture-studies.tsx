"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ContentLocale } from "../../../../lib/locale";
import type { SectionData } from "./data";
import { Drop } from "./drop";
import { Flow } from "./flow";
import { Swipe } from "./swipe";
import styles from "./motion.module.css";
import "../hero-motion/picker.css";
const names=["Flow","Swipe","Drop"];
export function GestureStudies({locale,sections}:{locale:ContentLocale;sections:SectionData[]}) {
  const [current,setCurrent]=useState(2),[replay,setReplay]=useState(0),[ready,setReady]=useState(false);
  const picker=useRef<HTMLElement>(null),highlight=useRef<HTMLSpanElement>(null);
  useEffect(()=>{const i=Number(new URLSearchParams(location.search).get("v"))-1;setCurrent(Number.isInteger(i)&&i>=0&&i<names.length?i:2);setReady(true);},[]);
  useEffect(()=>{if(!ready)return;const url=new URL(location.href);url.searchParams.set("v",String(current+1));history.replaceState(null,"",url);},[current,ready]);
  useLayoutEffect(()=>{
    const move=()=>{const b=picker.current?.querySelectorAll<HTMLButtonElement>(".proto-picker-item")[current];if(b&&highlight.current){highlight.current.style.width=`${b.offsetWidth}px`;highlight.current.style.transform=`translateX(${b.offsetLeft}px)`;}};
    move();window.addEventListener("resize",move);const f=requestAnimationFrame(()=>picker.current?.setAttribute("data-ready",""));
    return()=>{window.removeEventListener("resize",move);cancelAnimationFrame(f);};
  },[current]);
  const resetPosition=()=>{const url=new URL(location.href);url.hash="";url.searchParams.delete("section");history.replaceState(null,"",url);window.scrollTo({top:0,behavior:"instant"});};
  const choose=(i:number)=>{resetPosition();setCurrent(i);setReplay(0);};
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{
      if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.altKey||(e.target as HTMLElement).closest("input,textarea,select,[contenteditable=true]"))return;
      if(/^[1-3]$/.test(e.key)){e.preventDefault();choose(Number(e.key)-1);}
      else if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();resetPosition();setCurrent(i=>(i+(e.key==="ArrowRight"?1:names.length-1))%names.length);setReplay(0);}
      else if(e.key.toLowerCase()==="r"){resetPosition();setReplay(i=>i+1);}
    };window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
  },[]);
  const Variant=[Flow,Swipe,Drop][current];
  return <div className={styles.surface}>
    <Variant key={`${current}-${replay}`} locale={locale} sections={sections}/>
    <nav className="proto-picker" aria-label="Prototype variants" ref={picker}>
      <span className="proto-picker-highlight" aria-hidden="true" ref={highlight}/>
      {names.map((name,i)=><button key={name} className="proto-picker-item" data-active={current===i?"":undefined} aria-current={current===i?"true":undefined} onClick={()=>choose(i)}>{name}</button>)}
      <span className="proto-picker-divider" aria-hidden="true"/><button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={()=>{resetPosition();setReplay(i=>i+1);}}>↻</button>
    </nav>
  </div>;
}
