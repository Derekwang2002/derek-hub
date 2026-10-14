"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getVisibleHeadingRange } from "../../lib/visible-sections";
import type { TocItem } from "./post-toc";
import { lockPageScroll } from "./scroll-lock";
import { isSearchOpen, SEARCH_CHANGE_EVENT } from "./search-events";
import styles from "./mobile-article-toc.module.css";

export function MobileArticleToc({ items, activeId, visibleIds, locale }: {
  items: TocItem[]; activeId: string; visibleIds: string[]; locale: "en" | "zh";
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const suppressClick = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const gesture = useRef<{ x: number; y: number; horizontal: boolean; dx: number } | null>(null);
  const unlock = useRef<(() => void) | null>(null);
  const closing = useRef<Animation | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const [indicator, setIndicator] = useState({ top: 0, height: 0 });
  useLayoutEffect(() => {
    if (!open || !list.current) return;
    const element = list.current;
    const measure = () => {
      const range = getVisibleHeadingRange(items.map(item => item.id), visibleIds);
      const first = range ? element.children[range.first] as HTMLElement : null;
      const last = range ? element.children[range.last] as HTMLElement : null;
      setIndicator({ top: first?.offsetTop ?? 0, height: first && last ? last.offsetTop + last.offsetHeight - first.offsetTop : 0 });
    };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(element);
    return () => observer.disconnect();
  }, [open, items, visibleIds]);
  const titleId = useId();
  const zh = locale === "zh";
  const close = useCallback((instant = false, restore = true) => {
    const finish = () => {
      dialog.current?.close(); unlock.current?.(); unlock.current = null;
      gesture.current = null;
      if (panel.current) panel.current.style.transform = "";
      setOpen(false);
      if (restore && !isSearchOpen()) trigger.current?.focus({ preventScroll: true });
    };
    closing.current?.cancel();
    if (instant || matchMedia("(prefers-reduced-motion: reduce)").matches || !panel.current) { finish(); return; }
    closing.current = panel.current.animate([{ transform: getComputedStyle(panel.current).transform }, { transform: "translateX(100%)" }], { duration: 170, easing: "cubic-bezier(.32,0,.67,0)", fill: "forwards" });
    closing.current.onfinish = () => { finish(); closing.current?.cancel(); };
  }, []);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current;
    unlock.current = lockPageScroll();
    element.showModal();
    const active = element.querySelector<HTMLElement>('[aria-current="location"]');
    const contents = element.querySelector("nav");
    if (active && contents) contents.scrollTop = Math.max(0, active.offsetTop - contents.clientHeight * .3);
    return () => { closing.current?.cancel(); element.close(); unlock.current?.(); unlock.current = null; };
  }, [open]);
  useEffect(() => {
    const onSearch = () => { if (isSearchOpen()) close(true, false); };
    window.addEventListener(SEARCH_CHANGE_EVENT, onSearch);
    return () => window.removeEventListener(SEARCH_CHANGE_EVENT, onSearch);
  }, [close]);

  if (!mounted || !items.length) return null;
  return createPortal(<>
    <button ref={trigger} type="button" className={styles.edge} aria-label={zh ? "展开目录，可向左滑动" : "Open contents, or swipe left"} aria-expanded={open} aria-controls={titleId + "-dialog"}
      onClick={event => { setKeyboardOpen(event.detail === 0); setOpen(true); }} onPointerDown={event => {
        if (event.pointerType === "mouse") return;
        gesture.current = { x: event.clientX, y: event.clientY, horizontal: false, dx: 0 };
        event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerUp={event => {
        const start = gesture.current; gesture.current = null;
        if (start && start.x - event.clientX > 24 && Math.abs(start.y - event.clientY) < Math.abs(start.x - event.clientX)) { setKeyboardOpen(false); setOpen(true); }
      }} onPointerCancel={() => { gesture.current = null; }}><span aria-hidden="true" /></button>
    <dialog ref={dialog} id={titleId + "-dialog"} className={styles.dialog} aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); close(true); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div ref={panel} className={styles.panel} data-keyboard={keyboardOpen} onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }} onPointerDown={event => {
        if (event.pointerType === "mouse") return;
        suppressClick.current = false;
        gesture.current = { x: event.clientX, y: event.clientY, horizontal: false, dx: 0 };
      }} onPointerMove={event => {
        const start = gesture.current;
        if (!start) return;
        const dx = event.clientX - start.x, dy = event.clientY - start.y;
        if (!start.horizontal && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { gesture.current = null; return; }
        if (!start.horizontal && dx > 10 && dx > Math.abs(dy) * 1.3) { start.horizontal = true; }
        if (start.horizontal) { start.dx = Math.max(0, dx); event.currentTarget.style.transform = `translateX(${start.dx}px)`; }
      }} onPointerUp={event => {
        const start = gesture.current; gesture.current = null;
        if (start?.horizontal) {
          event.preventDefault();
          suppressClick.current = true;
          if (start.dx > 55) close();
          else if (!matchMedia("(prefers-reduced-motion: reduce)").matches) panel.current?.animate([{ transform: `translateX(${start.dx}px)` }, { transform: "translateX(0)" }], { duration: 180, easing: "cubic-bezier(.22,1,.36,1)" });
        }
        event.currentTarget.style.transform = "";
      }} onPointerCancel={event => { gesture.current = null; event.currentTarget.style.transform = ""; }}>
        <header><h2 id={titleId}>{zh ? "目录" : "Contents"}</h2><button type="button" aria-label={zh ? "收起目录" : "Close contents"} onClick={event => close(event.detail === 0)}><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m7 4 6 6-6 6" /></svg></button></header>
        <nav aria-label={zh ? "文章目录" : "Article contents"}><div className={styles.track}><span className={styles.indicator} aria-hidden="true" style={{ transform: `translateY(${indicator.top}px)`, height: indicator.height, opacity: indicator.height ? 1 : 0 }} /><ol ref={list}>{items.map(item => <li key={item.id} data-level={Math.min(item.level, 4)}><a href={`#${item.id}`} aria-current={activeId === item.id ? "location" : undefined} data-visible={visibleIds.includes(item.id)} onClick={event => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          close(true, false);
          requestAnimationFrame(() => {
            const heading = document.getElementById(item.id);
            if (!heading) return;
            heading.scrollIntoView({ block: "start" });
            const hadTabIndex = heading.hasAttribute("tabindex");
            if (!hadTabIndex) heading.tabIndex = -1;
            heading.focus({ preventScroll: true });
            if (!hadTabIndex) heading.addEventListener("blur", () => heading.removeAttribute("tabindex"), { once: true });
          });
        }}>{item.text}</a></li>)}</ol></div></nav>
      </div>
    </dialog>
  </>, document.body);
}
