"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import styles from "./filter-disclosure.module.css";

export function FilterDisclosure({ children, heading, locale, count }: { children: ReactNode; heading: ReactNode; locale: "en" | "zh"; count: number }) {
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const id = useId();
  const label = locale === "zh" ? (open ? "收起筛选" : "展开筛选") : (open ? "Hide filters" : "Show filters");
  return <div className={styles.filters}>
    <header className={styles.header}>{heading}<button ref={button} type="button" className={styles.toggle} aria-expanded={open} aria-controls={id} aria-label={`${label}${count ? (locale === "zh" ? `，已选 ${count} 项` : `, ${count} selected`) : ""}`} title={label} onClick={event => {
      const trigger = event.currentTarget.getBoundingClientRect();
      const panel = body.current;
      if (panel) {
        const bounds = panel.getBoundingClientRect();
        panel.style.setProperty("--filter-origin-x", `${trigger.left + trigger.width / 2 - bounds.left}px`);
        panel.style.setProperty("--filter-origin-y", `${trigger.top + trigger.height / 2 - bounds.top}px`);
      }
      setKeyboard(event.detail === 0); setOpen(!open);
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h7l9 9a2 2 0 0 1 0 2.8L15.8 20a2 2 0 0 1-2.8 0l-9-9V4Z"/><circle cx="8" cy="8" r="1.25"/></svg>
      {count > 0 ? <span className={styles.count} aria-hidden="true">{count}</span> : null}
    </button></header>
    <div ref={body} id={id} className={styles.body} data-open={open} data-keyboard={keyboard} aria-hidden={!open} inert={!open} onKeyDown={event => { if (event.key === "Escape") { setKeyboard(true); setOpen(false); button.current?.focus(); } }}><div className={styles.clip}><div className={styles.content}>{children}</div></div></div>
  </div>;
}
