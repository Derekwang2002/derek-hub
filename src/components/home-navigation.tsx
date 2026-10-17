"use client";

import { useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { consumeExpandedNavigation } from "./navigation-locale-state";
import { HomeContent } from "@/components/landing-content";
import { HomeRipple } from "./home-ripple";
import { SiteHeader } from "@/components/site-chrome";
import type { ContentLocale } from "../../lib/locale";
import styles from "./home-navigation.module.css";
import { SEARCH_CHANGE_EVENT, isSearchOpen } from "./search-events";
import { stepSpring, type Spring } from "./home-navigation-spring";

import { HomeNavigationPreview } from "./home-navigation-preview";
import type { NavigationPreviewSection } from "./home-navigation-data";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => n * n * (3 - 2 * n);

const mobileQuery = "(max-width: 800px)";
const subscribeMobile = (notify: () => void) => {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const getMobile = () => window.matchMedia(mobileQuery).matches;
const getServerMobile = () => false;
type HomeNavigationProps = { locale: ContentLocale; sections: NavigationPreviewSection[]; children?: ReactNode; current?: string };

export function HomeNavigation(props: HomeNavigationProps) {
  const mobile = useSyncExternalStore(subscribeMobile, getMobile, getServerMobile);
  if (mobile && props.children !== undefined) return <>{props.children}</>;
  return <AnimatedHomeNavigation {...props} />;
}

/** The same navigation anchors move from the top bar into the section directory. */
function AnimatedHomeNavigation({ locale, sections, children, current }: HomeNavigationProps) {
  const pathname = usePathname();
  const hasContent = children !== undefined;
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const directory = useRef<HTMLDivElement>(null);
  const restoredLocalePath = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (hasContent && getMobile()) return;
    // Keep the consumed handoff through Strict Mode's setup/cleanup replay.
    const restoreExpanded = consumeExpandedNavigation(pathname) || restoredLocalePath.current === pathname;
    restoredLocalePath.current = restoreExpanded ? pathname : null;
    const host = root.current!;
    const bar = header.current!;
    const panel = surface.current!;
    const heroContent = hero.current!;
    const directoryContent = directory.current!;
    const blocks = [...directoryContent.children] as HTMLElement[];
    const brand = bar.querySelector<HTMLElement>(".site-brand")!;
    const controls = bar.querySelector<HTMLElement>(".site-controls")!;
    const links = [...bar.querySelectorAll<HTMLElement>(".site-nav-links a")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let searchPaused = isSearchOpen();
    let needsMeasure = false;
    let frame = 0;
    let lastTime = 0;
    let keyboardScroll = false;
    let scrollDistance = 1;
    let navStart = 0;
    let contentHeight = 0;
    const readingGate = current === "about";
    let directoryUnlocked = restoreExpanded || !readingGate;
    let lastWheelTime = 0;
    const updateRunway = () => {
      host.style.height = `${contentHeight + innerHeight * .5}px`;
    };
    const unlockDirectory = () => {
      if (!readingGate || directoryUnlocked || window.scrollY < navStart - 2) return;
      directoryUnlocked = true;
    };
    let snapTimer = 0;
    let snapTarget: number | null = null;
    let pointerHeld = false;
    let snapFrame = 0;
    let scrollVelocity = 0;
    let previousScroll = window.scrollY;
    let previousScrollTime = performance.now();
    const snapMotion: Spring = { value: 0, velocity: 0 };
    const travel: Spring = { value: 0, velocity: 0 };
    const opening: Spring = { value: 0, velocity: 0 };
    const progress: Spring = { value: 0, velocity: 0 };
    const followers = links.map((): Spring => ({ value: 0, velocity: 0 }));
    let geometry: { start: DOMRect; x: number; y: number; scale: number; el: HTMLElement }[] = [];
    let card = { x: 0, y: 0, width: 0, height: 0, headerHeight: 64 };

    const targets = () => {
      const raw = directoryUnlocked ? clamp((window.scrollY - navStart) / scrollDistance) : 0;
      const p = reduced.matches ? (raw > .35 ? 1 : 0) : raw;
      return {
        p,
        drop: reduced.matches ? p : ease(clamp(p / .72)),
        spread: reduced.matches ? p : ease(clamp((p - .16) / .84)),
      };
    };
    const paint = () => {
      const p = clamp(progress.value);
      const crisp = host.dataset.moving === "false" && p === 1;
      host.dataset.crisp = String(crisp);
      const drop = travel.value;
      const spread = clamp(opening.value);
      // A few pixels of stretch follow speed, then relax with the same spring.
      const stretch = reduced.matches || keyboardScroll ? 1 : 1 + Math.max(-.012, Math.min(.018, travel.velocity * .004));
      for (const [i, { el, start, x, y, scale }] of geometry.entries()) {
        const unfold = i < 2 ? spread : clamp(followers[i - 2].value);
        const localY = start.top + (y - card.y - start.top) * unfold;
        el.style.transform = crisp
          ? `translate(${x - start.left}px, ${y - start.top}px) scale(${scale})`
          : `translate3d(${(x - start.left) * unfold}px, ${card.y * drop + localY * stretch - start.top}px, 0) scale(${1 + (scale - 1) * unfold})`;
      }
      const sx = innerWidth / card.width + (1 - innerWidth / card.width) * spread;
      const sy = (card.headerHeight / card.height + (1 - card.headerHeight / card.height) * spread) * stretch;
      panel.style.transform = `translate3d(${card.x * spread}px,${card.y * drop}px,0) scale(${sx},${sy})`;
      // Long section pages scroll behind this same surface before it unfolds.
      panel.style.opacity = hasContent ? "1" : `${clamp(p * 6)}`;
      // The surface contains the unfolding links, including during a quick reversal.
      bar.style.clipPath = `inset(${Math.max(0, card.y * drop - 6)}px ${Math.max(0, card.x * spread - 6)}px ${Math.max(0, innerHeight - card.y * drop - card.height * sy - 6)}px ${Math.max(0, card.x * spread - 6)}px round 2px)`;
      directoryContent.style.transform = crisp ? "none" : `translate3d(0,${card.y * (drop - 1)}px,0)`;
      blocks.forEach((block, i) => {
        const reveal = ease(clamp((followers[i].value - .55) / .45));
        block.style.opacity = `${reveal}`;
        block.style.transform = crisp ? "none" : `translate3d(0,${(1 - reveal) * 18}px,0)`;
      });
      heroContent.style.opacity = `${1 - ease(clamp(p / .65))}`;
      heroContent.style.transform = reduced.matches ? "" : `translate3d(0,${-p * 65}px,0) scale(${1 - p * .045})`;
      const hidden = p > .66;
      heroContent.inert = hidden;
      heroContent.setAttribute("aria-hidden", String(hidden));
      host.dataset.expanded = String(spread > .98 && followers.every(s => s.value > .98));
    };
    const settle = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      const { p, drop, spread } = targets();
      [progress, travel, opening, ...followers].forEach((s, i) => {
        s.value = i === 0 ? p : i === 1 ? drop : spread;
        s.velocity = 0;
      });
      host.dataset.moving = "false";
      paint();
    };
    const tick = (time: number) => {
      if (searchPaused) { frame = 0; return; }
      const dt = (time - lastTime) / 1000 * 1.55;
      lastTime = time;
      const { p, drop, spread } = targets();
      let moving = stepSpring(progress, p, dt, 300, 32);
      // The bar leads; the surface opens behind it; the lower rows carry more weight.
      moving = stepSpring(travel, drop, dt, 230, 22) || moving;
      moving = stepSpring(opening, spread, dt, 210, 29) || moving;
      followers.forEach((s, i) => {
        moving = stepSpring(s, spread, dt, 200 - i * 14, 28 - i * .8) || moving;
      });
      host.dataset.moving = String(moving);
      paint();
      frame = moving ? requestAnimationFrame(tick) : 0;
    };
    const schedule = () => {
      if (searchPaused) return;
      if (reduced.matches || keyboardScroll) { settle(); return; }
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const cancelSnap = () => {
      window.clearTimeout(snapTimer);
      cancelAnimationFrame(snapFrame);
      if (snapTarget !== null) {
        scrollVelocity = snapMotion.velocity;
        previousScroll = window.scrollY;
        previousScrollTime = performance.now();
      }
      snapTarget = null;
      host.dataset.snapping = "false";
    };
    const glideTo = (destination: number, velocity: number, intent: "scroll" | "dismiss" = "scroll") => {
      cancelSnap();
      const now = performance.now();
      const position = clamp((window.scrollY - navStart) / scrollDistance);
      snapTarget = destination;
      if (reduced.matches || keyboardScroll) {
        window.scrollTo({ top: snapTarget, behavior: "instant" });
        snapTarget = null;
        return;
      }
      snapMotion.value = position;
      snapMotion.velocity = velocity;
      host.dataset.snapping = "true";
      let previousTime = now;
      let elapsed = 0;
      const glide = (time: number) => {
        if (snapTarget === null) return;
        const dt = Math.min((time - previousTime) / 1000 * 1.4, .064);
        previousTime = time;
        elapsed += dt;
        const target = (snapTarget - navStart) / scrollDistance;
        const distance = Math.abs(target - snapMotion.value);
        // An explicit click starts promptly; passive scrolling retains its gentle handoff.
        const attraction = intent === "dismiss" ? 220 : 38 + 42 * ease(clamp(1 - distance / .2));
        const engagement = intent === "dismiss" ? 1 : .18 + .82 * ease(clamp(elapsed / .16));
        const damping = intent === "dismiss" ? 26 : 2 * Math.sqrt(attraction);
        stepSpring(snapMotion, target, dt, attraction * engagement, damping);
        const atBoundary = target === 0 ? snapMotion.value <= 0 : snapMotion.value >= 1;
        const settled = Math.abs(target - snapMotion.value) * scrollDistance < .5
          && Math.abs(snapMotion.velocity) * scrollDistance < 5;
        window.scrollTo({ top: navStart + (atBoundary || settled ? target : snapMotion.value) * scrollDistance, behavior: "instant" });
        if (atBoundary || settled) {
          snapTarget = null;
          scrollVelocity = 0;
          previousScroll = window.scrollY;
          host.dataset.snapping = "false";
          if (readingGate && target === 0) directoryUnlocked = false;
          return;
        }
        snapFrame = requestAnimationFrame(glide);
      };
      snapFrame = requestAnimationFrame(glide);
    };
    const queueSnap = () => {
      window.clearTimeout(snapTimer);
      if (searchPaused || !directoryUnlocked || pointerHeld || snapTarget !== null || document.hidden) return;
      const p = clamp((window.scrollY - navStart) / scrollDistance);
      if (window.scrollY < navStart + 1 || Math.abs(window.scrollY - navStart - scrollDistance) < 1) return;
      snapTimer = window.setTimeout(() => {
        const position = clamp((window.scrollY - navStart) / scrollDistance);
        const velocity = scrollVelocity * Math.exp(-(performance.now() - previousScrollTime) / 180);
        // Momentum helps choose the destination rather than reversing at the midpoint.
        const projected = position + velocity * .2;
        glideTo(navStart + (projected < .5 ? 0 : scrollDistance), velocity);
      }, p < .22 || p > .78 ? 90 : 160);
    };
    const dismissFromBlank = (event: MouseEvent) => {
      if (searchPaused || event.defaultPrevented || event.button !== 0 || host.dataset.expanded !== "true") return;
      if ((event.target as Element).closest("a,button,input,textarea,select,[contenteditable=true],.proto-picker")) return;
      if (window.getSelection()?.toString()) return;
      const bounds = directoryContent.getBoundingClientRect();
      const outside = event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (outside) glideTo(navStart, Math.min(0, scrollVelocity), "dismiss");
    };
    const scroll = () => {
      if (searchPaused) return;
      if (readingGate && !directoryUnlocked && window.scrollY > navStart) {
        window.scrollTo({ top: navStart, behavior: "instant" });
        settle();
        return;
      }
      if (readingGate && directoryUnlocked && window.scrollY < navStart - 1) directoryUnlocked = false;
      schedule();
      if (snapTarget !== null) return;
      const now = performance.now();
      const dt = Math.max((now - previousScrollTime) / 1000, .016);
      const velocity = Math.max(-2.5, Math.min(2.5, (window.scrollY - previousScroll) / scrollDistance / dt));
      scrollVelocity = dt > .16 || velocity * scrollVelocity < 0
        ? velocity : scrollVelocity * .6 + velocity * .4;
      previousScroll = window.scrollY;
      previousScrollTime = now;
      queueSnap();
    };
    const measure = () => {
      if (searchPaused) { needsMeasure = true; return; }
      needsMeasure = false;
      cancelSnap();
      if (hasContent || getMobile()) {
        // Read long pages normally before using the same scroll-driven reveal as home.
        const hostTop = host.getBoundingClientRect().top + window.scrollY;
        contentHeight = Math.max(heroContent.offsetHeight, innerHeight - hostTop);
        navStart = Math.max(0, hostTop + contentHeight - innerHeight);
        updateRunway();
        host.style.setProperty("--page-pin-top", `${Math.min(hostTop, innerHeight - contentHeight)}px`);
      } else {
        navStart = 0;
        host.style.removeProperty("height");
        host.style.removeProperty("--page-pin-top");
      }
      scrollDistance = readingGate ? innerHeight * .5 : Math.max(1, host.getBoundingClientRect().bottom + window.scrollY - innerHeight - navStart);
      if (readingGate && !directoryUnlocked && window.scrollY > navStart) window.scrollTo({ top: navStart, behavior: "instant" });
      host.dataset.crisp = "false";
      // Clear transforms before measuring their original navbar positions.
      [brand, controls, ...links].forEach(el => el.style.removeProperty("transform"));
      const width = innerWidth;
      const mobile = width <= 640;
      const gutter = mobile ? 20 : Math.max(28, width * .03);
      const cardWidth = Math.min(960, width - gutter * 2);
      const cardHeight = Math.min(mobile ? 530 : 510, Math.max(370, innerHeight - 150));
      const x = (width - cardWidth) / 2;
      const y = Math.max(28, (innerHeight - cardHeight - 70) / 2);
      const headerHeight = bar.querySelector(".site-nav")!.getBoundingClientRect().height;
      const brandRect = brand.getBoundingClientRect();
      const controlsRect = controls.getBoundingClientRect();
      const brandScale = width < 380 ? .78 : 1;
      const controlsScale = width < 380 ? .85 : 1;
      card = { x, y, width: cardWidth, height: cardHeight, headerHeight };
      const gap = 10;
      const top = 76;
      const rowHeight = (cardHeight - top - gap * 4) / 5;
      const tiles = links.map((_, i) => ({ x: 0, y: top + i * (rowHeight + gap), w: cardWidth, h: rowHeight }));
      const starts = links.map(el => el.getBoundingClientRect());
      const inset = mobile ? 18 : 24;
      const scale = Math.min(
        34 / 16,
        ...starts.map((start, i) => (tiles[i].w - inset * 2) / start.width),
        ...tiles.map(tile => tile.h / 37),
      );
      geometry = [
        { el: brand, start: brandRect, x, y: y + 14, scale: brandScale },
        { el: controls, start: controlsRect, x: x + cardWidth - controlsRect.width * controlsScale, y: y + 14, scale: controlsScale },
        ...links.map((el, i) => {
          const tile = tiles[i];
          const start = starts[i];
          const titleLeft = inset;
          const titleTop = tile.y + (tile.h - start.height * scale) / 2;
          const block = blocks[i];
          // At rest, paint a full-size label instead of enlarging the navbar glyph raster.
          // The original anchor keeps its full-card hit area and accessible name.
          const label = block.querySelector<HTMLElement>(`.${styles.entryLabel}`)!;
          const type = getComputedStyle(el);
          label.textContent = el.textContent;
          Object.assign(label.style, {
            left: `${inset}px`, fontSize: `${parseFloat(type.fontSize) * scale}px`,
            lineHeight: `${parseFloat(type.lineHeight) * scale}px`, fontWeight: type.fontWeight,
            fontFamily: type.fontFamily,
            letterSpacing: type.letterSpacing === "normal" ? "normal" : `${parseFloat(type.letterSpacing) * scale}px`,
          });
          Object.assign(block.style, { left: `${tile.x}px`, top: `${tile.y}px`, width: `${tile.w}px`, height: `${tile.h}px` });
          // The original anchor remains the only link; its hit area covers its whole block.
          el.style.setProperty("--entry-hit-x", `${-titleLeft / scale}px`);
          el.style.setProperty("--entry-hit-y", `${(tile.y - titleTop) / scale}px`);
          el.style.setProperty("--entry-hit-width", `${tile.w / scale}px`);
          el.style.setProperty("--entry-hit-height", `${tile.h / scale}px`);
          return { el, start, x: x + tile.x + titleLeft, y: y + titleTop, scale };
        }),
      ];
      panel.style.width = `${cardWidth}px`;
      panel.style.height = `${cardHeight}px`;
      directoryContent.style.left = `${x}px`;
      directoryContent.style.top = `${y}px`;
      directoryContent.style.width = `${cardWidth}px`;
      directoryContent.style.height = `${cardHeight}px`;
      settle();
      queueSnap();
    };
    const key = (event: KeyboardEvent) => {
      if (searchPaused) return;
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)
        && !(event.target as HTMLElement).closest("input,textarea,select,[contenteditable=true]")) {
        if (!event.repeat && !event.shiftKey && ["ArrowDown", "PageDown", "End", " "].includes(event.key)) unlockDirectory();
        cancelSnap();
        keyboardScroll = true;
        settle();
      }
    };
    const pointer = (event: Event) => {
      if (searchPaused) return;
      if (event instanceof WheelEvent) {
        if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
        const now = performance.now();
        if (event.defaultPrevented) return;
        if (event.deltaY > 0 && now - lastWheelTime > 260) unlockDirectory();
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
        if (readingGate && !directoryUnlocked && event.deltaY > 0 && window.scrollY + event.deltaY * unit > navStart) {
          event.preventDefault();
          window.scrollTo({ top: navStart, behavior: "instant" });
        }
        lastWheelTime = now;
      }
      if (event.type === "touchstart") unlockDirectory();
      cancelSnap();
      keyboardScroll = false;
      if (event.type === "pointerdown" || event.type === "touchstart") pointerHeld = true;
    };
    const release = () => { pointerHeld = false; queueSnap(); };
    const visibility = () => { if (searchPaused) return; if (document.hidden) { cancelSnap(); settle(); } else queueSnap(); };
    const motionPreference = () => { if (searchPaused) return; cancelSnap(); settle(); queueSnap(); };
    const searchChange = () => {
      searchPaused = isSearchOpen();
      if (searchPaused) {
        cancelSnap(); cancelAnimationFrame(frame); frame = 0; pointerHeld = false;
        host.dataset.moving = "false";
      } else {
        if (needsMeasure) measure();
        schedule(); queueSnap();
      }
    };
    const leaveDirectoryOnNavigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.currentTarget as HTMLAnchorElement;
      const destination = new URL(link.href, window.location.href);
      const samePage = destination.pathname === window.location.pathname && destination.search === window.location.search;
      if (!samePage && host.dataset.expanded !== "true") return;
      // Same routes do not navigate; resource subroutes also retain this layout.
      // Reset the directory before either case can preserve its expanded scroll position.
      if (samePage) event.preventDefault();
      cancelSnap();
      pointerHeld = false;
      keyboardScroll = true;
      window.scrollTo({ top: 0, behavior: "instant" });
      settle();
    };
    const clearPreview = () => { delete host.dataset.active; };
    const previewHandlers = links.map((link, i) => {
      const activate = (event: Event) => { if (event instanceof PointerEvent && event.pointerType !== "mouse") return; host.dataset.active = String(i); };
      link.addEventListener("click", leaveDirectoryOnNavigate);
      link.addEventListener("pointerenter", activate);
      link.addEventListener("focus", activate);
      link.addEventListener("pointerleave", clearPreview);
      link.addEventListener("blur", clearPreview);
      return activate;
    });
    measure();
    if (restoreExpanded) {
      cancelSnap();
      window.scrollTo({ top: navStart + scrollDistance, behavior: "instant" });
      previousScroll = window.scrollY;
      settle();
    }
    const controlsObserver = new ResizeObserver(measure);
    controlsObserver.observe(controls);
    controlsObserver.observe(heroContent);
    window.addEventListener(SEARCH_CHANGE_EVENT, searchChange);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("click", dismissFromBlank);
    window.addEventListener("keydown", key);
    window.addEventListener("wheel", pointer, { passive: !readingGate });
    window.addEventListener("pointerdown", pointer, { passive: true });
    window.addEventListener("touchstart", pointer, { passive: true });
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("touchend", release);
    window.addEventListener("touchcancel", release);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", motionPreference);
    return () => {
      controlsObserver.disconnect();
      window.removeEventListener(SEARCH_CHANGE_EVENT, searchChange);
      cancelSnap();
      cancelAnimationFrame(frame);
      links.forEach((link, i) => {
        link.removeEventListener("click", leaveDirectoryOnNavigate);
        link.removeEventListener("pointerenter", previewHandlers[i]);
        link.removeEventListener("focus", previewHandlers[i]);
        link.removeEventListener("pointerleave", clearPreview);
        link.removeEventListener("blur", clearPreview);
      });
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("click", dismissFromBlank);
      window.removeEventListener("keydown", key);
      window.removeEventListener("wheel", pointer);
      window.removeEventListener("pointerdown", pointer);
      window.removeEventListener("touchstart", pointer);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("touchend", release);
      window.removeEventListener("touchcancel", release);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", motionPreference);
    };
  }, [hasContent, current, locale, pathname]);

  return <div className={styles.dropRoot} data-navigation-root="" data-page={hasContent} ref={root}>
    {!hasContent && <HomeRipple />}
    <div className={styles.heroPin}><div ref={hero}>{children ?? <HomeContent locale={locale}/>}</div></div>
    <div className={styles.panel} ref={surface} aria-hidden="true"/>
    <div className={styles.droppedHeader} ref={header}><SiteHeader/></div>
    <div className={styles.directory} ref={directory} aria-hidden="true">{sections.map(section =>
      <div className={styles.entry} data-current={section.id === current} key={section.id}><div className={styles.art}><HomeNavigationPreview section={section} locale={locale}/></div><span className={styles.entryLabel}/></div>
    )}</div>
  </div>;
}
