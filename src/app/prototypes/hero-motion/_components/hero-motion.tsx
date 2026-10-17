"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HomeContent } from "@/components/landing-content";
import { FormHero } from "./form";
import { PointerHero } from "./pointer";
import { ConsoleHero } from "./console";
import { LinkedHero } from "./linked";
import { styles, type ContentLocale } from "./shared";
import "../picker.css";

const names = ["Sense", "Console", "Connect", "Form"];
const hints = {
  zh: ["缓缓移动鼠标，观察终端表面的光线与反射。", "点击快捷命令，或输入 projects 后按 Enter；↑↓ 查看历史。", "悬停或聚焦左侧文字，查看对应内容；点击固定，再点取消。", "Form · 黑白工程手册：主视觉、姓名排版与技术档案。"],
  en: ["Move slowly to explore the light and reflection across the terminal.", "Pick a command, or type projects and press Enter. ↑↓ for history.", "Hover or focus the intro to connect it to the terminal. Click to pin or unpin.", "Form · A monochrome study of identity, structure and engineering."]
};
export function HeroMotion({ locale }: { locale: ContentLocale }) {
  const [current, setCurrent] = useState(3);
  const [replay, setReplay] = useState(0);
  const [original, setOriginal] = useState(true);
  const [ready, setReady] = useState(false);
  const picker = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const i = Number(new URLSearchParams(location.search).get("v")) - 1;
    setCurrent(Number.isInteger(i) && i >= 0 && i < names.length ? i : 3);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const url = new URL(location.href); url.searchParams.set("v", String(current + 1)); history.replaceState(null, "", url);
  }, [current, ready]);
  useLayoutEffect(() => {
    const move = () => {
      const button = picker.current?.querySelectorAll<HTMLButtonElement>(".proto-picker-item")[current];
      if (!button || !highlight.current) return;
      highlight.current.style.width = `${button.offsetWidth}px`;
      highlight.current.style.transform = `translateX(${button.offsetLeft}px)`;
    };
    move();
    window.addEventListener("resize", move);
    const frame = requestAnimationFrame(() => picker.current?.setAttribute("data-ready", ""));
    return () => { window.removeEventListener("resize", move); cancelAnimationFrame(frame); };
  }, [current]);
  useEffect(() => {
    function key(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (target.closest("input,textarea,select,[contenteditable=true]") || event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^[1-4]$/.test(event.key)) { event.preventDefault(); setOriginal(false); setCurrent(Number(event.key) - 1); setReplay(0); }
      else if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); setOriginal(false); setCurrent(i => (i + (event.key === "ArrowRight" ? 1 : names.length - 1)) % names.length); setReplay(0); }
      else if (event.key.toLowerCase() === "r") { setReplay(i => i + 1); }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const Variant = [PointerHero, ConsoleHero, LinkedHero, FormHero][current];
  return <div className={styles.surface}>
    <div key={`${current}-${replay}-${original}`} className={replay ? styles.replay : undefined}>
      {original ? <HomeContent locale={locale} /> : <Variant locale={locale} />}
    </div>
    <aside className={styles.instructions} aria-label={locale === "zh" ? "原型说明" : "Prototype instructions"}>
      <p>{original ? (locale === "zh" ? "当前首页 · 原版对照" : "Current homepage · Original") : hints[locale][current]}</p>
      <button aria-pressed={original} onClick={() => setOriginal(value => !value)}>{original ? (locale === "zh" ? "返回交互版" : "Back to interaction") : (locale === "zh" ? "对比原版" : "Compare original")}</button>
    </aside>
    <nav className="proto-picker" aria-label="Prototype variants" ref={picker}>
      <span className="proto-picker-highlight" aria-hidden="true" ref={highlight} />
      {names.map((name, i) => <button key={name} className="proto-picker-item" data-active={current === i ? "" : undefined} aria-current={current === i ? "true" : undefined} onClick={() => { setOriginal(false); setCurrent(i); setReplay(0); }}>{name}</button>)}
      <span className="proto-picker-divider" aria-hidden="true" />
      <button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setReplay(i => i + 1)}>↻</button>
    </nav>
  </div>;
}
