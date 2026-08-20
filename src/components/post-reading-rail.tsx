"use client";

import { useEffect, useState } from "react";
import styles from "../app/blog/[slug]/page.module.css";

export function PostReadingRail() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  }

  return (
    <aside aria-label="Reading tools" className={`${styles.readingRail} ${visible ? styles.railVisible : ""}`}>
      <button aria-label="Back to top" className={styles.topButton} onClick={scrollToTop} tabIndex={visible ? 0 : -1} type="button">
        <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </aside>
  );
}
