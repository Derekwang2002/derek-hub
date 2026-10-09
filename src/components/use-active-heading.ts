"use client";

import { useEffect, useState } from "react";
import { getVisibleSections, type HeadingPosition } from "../../lib/visible-sections";
import type { TocItem } from "./post-toc";

export function useActiveHeadings(items: TocItem[]) {
  const [state, setState] = useState({ activeId: "", visibleIds: [] as string[] });
  useEffect(() => {
    const headings = items.flatMap((item) => {
      const element = document.getElementById(item.id);
      return element ? [{ ...item, element }] : [];
    });
    let frame = 0;
    const article = headings[0]?.element.closest("article");
    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const top = (document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0) + 24;
        const positions: HeadingPosition[] = headings.map(({ id, level, element }) => ({
          id, level, top: element.getBoundingClientRect().top
        }));
        const next = getVisibleSections(positions, top, window.innerHeight - 24,
          article?.getBoundingClientRect().bottom ?? document.documentElement.scrollHeight - window.scrollY);
        setState((previous) => previous.activeId === next.activeId &&
          previous.visibleIds.join("\n") === next.visibleIds.join("\n") ? previous : next);
      });
    }
    const observer = new ResizeObserver(update);
    if (article) observer.observe(article);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("hashchange", update);
    };
  }, [items]);
  return state;
}
