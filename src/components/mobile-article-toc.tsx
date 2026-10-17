"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getVisibleHeadingRange, getVisibleSections } from "../../lib/visible-sections";
import type { TocItem } from "./post-toc";
import { lockPageScroll } from "./scroll-lock";
import { isSearchOpen, SEARCH_CHANGE_EVENT } from "./search-events";
import styles from "./mobile-article-toc.module.css";

export function MobileArticleToc({ items, activeId, visibleIds, locale }: {
  items: TocItem[]; activeId: string; visibleIds: string[]; locale: "en" | "zh";
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [readingSnapshot, setReadingSnapshot] = useState({ activeId, visibleIds });
  const reading = open ? readingSnapshot : { activeId, visibleIds };
  const openContents = useCallback((keyboard: boolean) => {
    // Capture the reading position synchronously, even if a scroll observer is still queued.
    const headings = items.flatMap(item => {
      const element = document.getElementById(item.id);
      return element ? [{ id: item.id, level: item.level, top: element.getBoundingClientRect().top }] : [];
    });
    const article = document.getElementById(items[0]?.id)?.closest("article");
    const top = (document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0) + 24;
    setReadingSnapshot(getVisibleSections(headings, top, innerHeight - 24,
      article?.getBoundingClientRect().bottom ?? document.documentElement.scrollHeight - scrollY));
    setKeyboardOpen(keyboard);
    setOpen(true);
  }, [items]);
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
    if (!open || !dialog.current) return;
    const element = dialog.current;
    element.dataset.ready = "false";
    unlock.current = lockPageScroll();
    element.showModal();
    const active = element.querySelector<HTMLElement>('[aria-current="location"]');
    const contents = element.querySelector("nav");
    // Resolve the active row after the dialog has layout, but before its first paint.
    if (active && contents) {
      contents.scrollTop += active.getBoundingClientRect().top - contents.getBoundingClientRect().top - contents.clientHeight * .3;
    }
    let readyFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      readyFrame = requestAnimationFrame(() => { element.dataset.ready = "true"; });
    });
    return () => {
      cancelAnimationFrame(firstFrame); cancelAnimationFrame(readyFrame);
      closing.current?.cancel(); element.close(); unlock.current?.(); unlock.current = null;
    };
  }, [open]);
  useLayoutEffect(() => {
    if (!open || !list.current) return;
    const element = list.current;
    const measure = () => {
      const range = getVisibleHeadingRange(items.map(item => item.id), reading.visibleIds);
      const first = range ? element.children[range.first] as HTMLElement : null;
      const last = range ? element.children[range.last] as HTMLElement : null;
      setIndicator({ top: first?.offsetTop ?? 0, height: first && last ? last.offsetTop + last.offsetHeight - first.offsetTop : 0 });
    };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(element);
    return () => observer.disconnect();
  }, [open, items, reading.visibleIds]);
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
    const onSearch = () => { if (isSearchOpen()) close(true, false); };
    window.addEventListener(SEARCH_CHANGE_EVENT, onSearch);
    return () => window.removeEventListener(SEARCH_CHANGE_EVENT, onSearch);
  }, [close]);

  useEffect(() => {
    if (!mounted || open) return;
    const article = document.getElementById(items[0]?.id)?.closest("article");
    if (!article) return;
    let swipe: { x: number; y: number; horizontal: boolean } | null = null;
    const begin = (x: number, y: number, target: EventTarget | null) => {
      swipe = null;
      if (isSearchOpen() || !(target instanceof Element) || window.getSelection()?.toString()) return;
      // Leave browser edge gestures, interactive content, and horizontal scrollers alone.
      if (x < 24 || x > innerWidth - 24 || target.closest("a,button,input,textarea,select,pre,table,[contenteditable=true]")) return;
      for (let element: Element | null = target; element && article.contains(element); element = element.parentElement) {
        if (element.scrollWidth > element.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(element).overflowX)) return;
      }
      swipe = { x, y, horizontal: false };
    };
    const move = (x: number, y: number, event: Event) => {
      if (!swipe) return;
      const dx = swipe.x - x, dy = Math.abs(y - swipe.y);
      if (!swipe.horizontal) {
        if ((dy > 10 && dy > dx * .65) || dx < -10) { swipe = null; return; }
        if (dx > 12 && dx > dy * 1.5) swipe.horizontal = true;
      }
      if (swipe?.horizontal && event.cancelable) event.preventDefault();
    };
    const end = (x: number, y: number, event: Event) => {
      const start = swipe; swipe = null;
      if (!start || isSearchOpen() || window.getSelection()?.toString()) return;
      const dx = start.x - x;
      if (dx >= 48 && dx > Math.abs(y - start.y) * 1.5) {
        if (event.cancelable) event.preventDefault();
        openContents(false);
      }
    };
    const cancel = () => { swipe = null; };
    const touchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) { cancel(); return; }
      const touch = event.touches[0]; begin(touch.clientX, touch.clientY, event.target);
    };
    const touchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) { cancel(); return; }
      const touch = event.touches[0]; move(touch.clientX, touch.clientY, event);
    };
    const touchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (touch) end(touch.clientX, touch.clientY, event);
    };
    // Touch events retain native vertical scrolling; pointer events also support a stylus.
    const pointerStart = (event: PointerEvent) => {
      if (event.pointerType !== "pen") return;
      begin(event.clientX, event.clientY, event.target);
      if (swipe) event.preventDefault();
    };
    const pointerMove = (event: PointerEvent) => { if (event.pointerType === "pen") move(event.clientX, event.clientY, event); };
    const pointerEnd = (event: PointerEvent) => { if (event.pointerType === "pen") end(event.clientX, event.clientY, event); };
    const pointerCancel = (event: PointerEvent) => { if (event.pointerType === "pen") cancel(); };
    article.addEventListener("touchstart", touchStart, { passive: true });
    article.addEventListener("touchmove", touchMove, { passive: false });
    article.addEventListener("touchend", touchEnd, { passive: false });
    article.addEventListener("touchcancel", cancel);
    article.addEventListener("pointerdown", pointerStart);
    article.addEventListener("pointermove", pointerMove);
    article.addEventListener("pointerup", pointerEnd);
    article.addEventListener("pointercancel", pointerCancel);
    return () => {
      article.removeEventListener("touchstart", touchStart); article.removeEventListener("touchmove", touchMove);
      article.removeEventListener("touchend", touchEnd); article.removeEventListener("touchcancel", cancel);
      article.removeEventListener("pointerdown", pointerStart); article.removeEventListener("pointermove", pointerMove);
      article.removeEventListener("pointerup", pointerEnd); article.removeEventListener("pointercancel", pointerCancel);
    };
  }, [mounted, open, items, openContents]);

  if (!mounted || !items.length) return null;
  return createPortal(<>
    <button ref={trigger} type="button" className={styles.edge} aria-label={zh ? "展开目录，可向左滑动" : "Open contents, or swipe left"} aria-expanded={open} aria-controls={titleId + "-dialog"}
      onClick={event => { openContents(event.detail === 0); }} onPointerDown={event => {
        if (event.pointerType === "mouse") return;
        gesture.current = { x: event.clientX, y: event.clientY, horizontal: false, dx: 0 };
        event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerUp={event => {
        const start = gesture.current; gesture.current = null;
        if (start && start.x - event.clientX > 24 && Math.abs(start.y - event.clientY) < Math.abs(start.x - event.clientX)) { openContents(false); }
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
        <nav aria-label={zh ? "文章目录" : "Article contents"}><div className={styles.track}><span className={styles.indicator} aria-hidden="true" style={{ transform: `translateY(${indicator.top}px)`, height: indicator.height, opacity: indicator.height ? 1 : 0 }} /><ol ref={list}>{items.map(item => <li key={item.id} data-level={Math.min(item.level, 4)}><a href={`#${item.id}`} aria-current={reading.activeId === item.id ? "location" : undefined} data-visible={reading.visibleIds.includes(item.id)} onClick={event => {
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
