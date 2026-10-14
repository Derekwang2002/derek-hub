"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import styles from "./filter-disclosure.module.css";

export function FilterDisclosure({ children, heading, locale, count }: { children: ReactNode; heading: ReactNode; locale: "en" | "zh"; count: number }) {
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  const label = locale === "zh" ? (open ? "收起筛选" : "展开筛选") : (open ? "Hide filters" : "Show filters");
  return <div className={styles.filters}>
    <header className={styles.header}>{heading}<button ref={button} type="button" className={styles.toggle} aria-expanded={open} aria-controls={id} aria-label={`${label}${count ? (locale === "zh" ? `，已选 ${count} 项` : `, ${count} selected`) : ""}`} title={label} onClick={event => { setKeyboard(event.detail === 0); setOpen(!open); }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M4 7h9m4 0h3M4 17h3m4 0h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>
      {count > 0 ? <span className={styles.count} aria-hidden="true">{count}</span> : null}
    </button></header>
    <div id={id} className={styles.body} data-open={open} data-keyboard={keyboard} aria-hidden={!open} inert={!open} onKeyDown={event => { if (event.key === "Escape") { setKeyboard(true); setOpen(false); button.current?.focus(); } }}><div className={styles.clip}><div className={styles.content}>{children}</div></div></div>
  </div>;
}
