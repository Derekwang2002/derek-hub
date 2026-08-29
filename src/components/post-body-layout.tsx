"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { PostReadingRail } from "./post-reading-rail";
import { PostToc, type TocItem } from "./post-toc";
import { useActiveHeading } from "./use-active-heading";
import type { ContentLocale } from "../../lib/locale";
import styles from "../app/blog/[slug]/page.module.css";

const TOC_PREFERENCE_KEY = "derek-hub:toc-open";

type ViewportMode = "pending" | "wide" | "medium" | "mobile";

type PostBodyLayoutProps = {
  articleTitle: string;
  children: ReactNode;
  locale?: ContentLocale;
  tocItems: TocItem[];
};

export function PostBodyLayout({
  articleTitle,
  children,
  locale = "en",
  tocItems
}: PostBodyLayoutProps) {
  const [viewportMode, setViewportMode] = useState<ViewportMode>("pending");
  const [wideOpen, setWideOpen] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const activeId = useActiveHeading(tocItems);
  const layoutRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<{ asideX: number; articleX: number } | null>(null);

  useEffect(() => {
    const wideQuery = window.matchMedia("(min-width: 1280px)");
    const mobileQuery = window.matchMedia("(max-width: 920px)");

    try {
      const storedPreference = window.localStorage.getItem(TOC_PREFERENCE_KEY);

      if (storedPreference === "closed") {
        setWideOpen(false);
      } else if (storedPreference === "open") {
        setWideOpen(true);
      }
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }

    function syncViewportMode() {
      const nextMode: ViewportMode = wideQuery.matches
        ? "wide"
        : mobileQuery.matches
          ? "mobile"
          : "medium";

      setViewportMode(nextMode);
      setOverlayOpen(false);
    }

    syncViewportMode();
    wideQuery.addEventListener("change", syncViewportMode);
    mobileQuery.addEventListener("change", syncViewportMode);

    return () => {
      wideQuery.removeEventListener("change", syncViewportMode);
      mobileQuery.removeEventListener("change", syncViewportMode);
    };
  }, []);

  useEffect(() => {
    setOverlayOpen(false);
  }, [articleTitle]);

  const tocOpen = viewportMode === "wide" ? wideOpen : overlayOpen;
  const tocOverlay = viewportMode === "medium" || viewportMode === "mobile";

  const setTocOpen = useCallback(
    (nextOpen: boolean) => {
      if (viewportMode === "wide") {
        const layout = layoutRef.current;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (layout && !reduceMotion) {
          const aside = layout.querySelector("aside");
          const article = layout.querySelector("article");
          if (aside && article) {
            flipRef.current = {
              asideX: aside.getBoundingClientRect().x,
              articleX: article.getBoundingClientRect().x
            };
          }
        }

        setWideOpen(nextOpen);

        try {
          window.localStorage.setItem(TOC_PREFERENCE_KEY, nextOpen ? "open" : "closed");
        } catch {
          // Keep the in-memory preference when storage is unavailable.
        }

        return;
      }

      setOverlayOpen(nextOpen);
    },
    [viewportMode]
  );

  useLayoutEffect(() => {
    const first = flipRef.current;
    flipRef.current = null;
    const layout = layoutRef.current;
    if (!first || !layout) return;

    for (const [selector, fromX] of [["aside", first.asideX], ["article", first.articleX]] as const) {
      const el = layout.querySelector(selector);
      if (!el) continue;
      const dx = fromX - el.getBoundingClientRect().x;
      if (Math.abs(dx) < 1) continue;
      el.animate(
        [{ transform: `translateX(${dx}px)` }, { transform: "none" }],
        { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    }
  }, [tocOpen]);

  return (
    <div ref={layoutRef} className={tocOpen ? styles.bodyLayout : `${styles.bodyLayout} ${styles.bodyLayoutTocCollapsed}`}>
      <div aria-hidden="true" className={styles.layoutRule} />
      <PostToc
        activeId={activeId}
        articleTitle={articleTitle}
        items={tocItems}
        locale={locale}
        onOpenChange={setTocOpen}
        open={tocOpen}
        overlay={tocOverlay}
      />
      <article className={styles.content}>{children}</article>
      <PostReadingRail />
    </div>
  );
}
