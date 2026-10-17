"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./filter-disclosure.module.css";

export function FilterDisclosure({ children, heading, headerAction, locale, count }: { children: ReactNode; heading: ReactNode; headerAction?: ReactNode; locale: "en" | "zh"; count: number }) {
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const id = useId();
  const label = locale === "zh" ? (open ? "收起筛选" : "展开筛选") : (open ? "Hide filters" : "Show filters");

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!dock.current?.contains(event.target as Node)) { setKeyboard(false); setOpen(false); }
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setKeyboard(true); setOpen(false); button.current?.focus();
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return <div ref={dock} className={styles.filters}>
    <header className={styles.header}>
      <div className={styles.heading}>{heading}
        <span className={styles.toggleAnchor}>
          <button ref={button} type="button" className={styles.toggle} aria-expanded={open} aria-controls={id} aria-label={`${label}${count ? (locale === "zh" ? `，已选 ${count} 项` : `, ${count} selected`) : ""}`} title={label} onClick={event => { setKeyboard(event.detail === 0); setOpen(!open); }}>
            <svg viewBox="2 2 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h7l9 9a2 2 0 0 1 0 2.8L15.8 20a2 2 0 0 1-2.8 0l-9-9V4Z"/><circle cx="8" cy="8" r="1.25"/></svg>
            {count > 0 ? <span className={styles.count} aria-hidden="true">{count}</span> : null}
          </button>
        </span>
      </div>
      {headerAction ? <div className={styles.headerAction}>{headerAction}</div> : null}
    </header>
      <div id={id} className={styles.body} data-open={open} data-keyboard={keyboard} aria-hidden={!open} inert={!open}><div className={styles.clip}><div className={styles.content}>{children}</div></div></div>
  </div>;
}
