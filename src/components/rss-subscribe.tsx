"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ContentLocale } from "../../lib/locale";
import { lockPageScroll } from "./scroll-lock";
import styles from "./rss-subscribe.module.css";

const RSS_URL = `${(process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "")}/rss.xml`;

export function RssSubscribe({ locale }: { locale: ContentLocale }) {
  const zh = locale === "zh";
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const backdropDown = useRef(false);
  const id = useId();
  const titleId = useId();
  const copyLabel = status === "copied" ? (zh ? "已复制" : "Copied") : (zh ? "复制 RSS 地址" : "Copy RSS address");

  useLayoutEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current;
    const returnFocus = trigger.current;
    const unlock = lockPageScroll();
    element.showModal();
    element.focus({ preventScroll: true });
    return () => {
      element.close();
      unlock();
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2500);
    return () => clearTimeout(timer);
  }, [status]);

  async function copy() {
    try { await navigator.clipboard.writeText(RSS_URL); setStatus("copied"); }
    catch { input.current?.focus(); input.current?.select(); setStatus("manual"); }
  }

  return <>
    <button ref={trigger} type="button" className={styles.trigger} aria-haspopup="dialog" aria-expanded={open} aria-controls={id}
      onClick={() => { setStatus("idle"); setOpen(true); }}>
      <svg className={styles.rssIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="5" cy="19" r="1.25" fill="currentColor" stroke="none" /><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" /></svg>
      RSS
    </button>
    <dialog ref={dialog} id={id} className={styles.dialog} tabIndex={-1} aria-modal="true" aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); setOpen(false); }}
      onClose={() => { if (!dialog.current?.open) setOpen(false); }}
      onKeyDown={event => {
        event.stopPropagation();
        if (event.key !== "Tab") return;
        const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled),input:not(:disabled),a[href]")];
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus();
        }
      }}
      onPointerDown={event => { backdropDown.current = event.target === event.currentTarget; }}
      onClick={event => { event.stopPropagation(); if (event.target === event.currentTarget && backdropDown.current) setOpen(false); }}>
      <div className={styles.panel}>
        <header className={styles.dialogHeader}>
          <h2 id={titleId}>RSS</h2>
          <button type="button" className={styles.closeButton} aria-label={zh ? "关闭 RSS 弹窗" : "Close RSS dialog"} onClick={() => setOpen(false)}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m5.5 5.5 9 9m0-9-9 9" /></svg>
          </button>
        </header>
        <div className={styles.feedRow}>
          <div className={styles.addressRow}>
            <input ref={input} aria-label={zh ? "RSS 订阅地址" : "RSS feed address"} readOnly value={RSS_URL} onFocus={event => event.currentTarget.select()} />
            <button className={styles.iconButton} type="button" aria-label={copyLabel} title={copyLabel} onClick={copy} data-copied={status === "copied"}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{status === "copied" ? <path d="m4.5 10 3.5 3.5 7.5-7.5" /> : <><rect x="7" y="7" width="9" height="10" rx="1.5" /><path d="M12 7V3H3v10h4" /></>}</svg>
            </button>
          </div>
          <a className={styles.sourceButton} href={RSS_URL} target="_blank" rel="noreferrer" aria-label={zh ? "查看 RSS 源码（新标签页）" : "View RSS source (new tab)"} title={zh ? "查看 RSS 源码" : "View RSS source"}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 6-4 4 4 4m8-8 4 4-4 4M11.5 4l-3 12" /></svg>
          </a>
        </div>
        <span className={styles.status} role="status">{status === "copied" ? (zh ? "RSS 地址已复制" : "RSS address copied") : status === "manual" ? (zh ? "地址已选中，请手动复制。" : "Address selected. Copy it manually.") : ""}</span>
      </div>
    </dialog>
  </>;
}

export function BlogRssFooter({ locale }: { locale: ContentLocale }) {
  const zh = locale === "zh";
  const id = useId();
  return <section className={styles.articleSubscribe} aria-labelledby={id}>
    <span className={styles.eyebrow}>{zh ? "下一篇，在阅读器里见" : "UNTIL THE NEXT ONE"}</span>
    <h2 id={id}>{zh ? "如果这篇对你有用，欢迎继续读。" : "If this helped, there’s more to come."}</h2>
    <p>{zh ? "用 RSS 关注后续文章，按自己的节奏阅读。" : "Follow future articles with RSS, and read at your own pace."}</p>
    <RssSubscribe locale={locale} />
  </section>;
}
