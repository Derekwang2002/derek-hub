"use client";

import { lockPageScroll } from "./scroll-lock";

import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { queryTerms, searchDocuments, searchLabels, searchShortcuts, type SearchDocument } from "../../lib/search";
import type { ContentLocale } from "../../lib/locale";
import { SEARCH_CHANGE_EVENT } from "./search-events";
import styles from "./global-search.module.css";

const RECENTS_KEY = "derek-search-recents-v1";
const indexCache = new Map<ContentLocale, Promise<SearchDocument[]>>();
function loadIndex(locale: ContentLocale) {
  if (!indexCache.has(locale)) indexCache.set(locale, fetch(`/api/search/${locale}`).then(response => {
    if (!response.ok) throw new Error("Search index unavailable");
    return response.json() as Promise<SearchDocument[]>;
  }).catch(error => { indexCache.delete(locale); throw error; }));
  return indexCache.get(locale)!;
}
function readRecent(): string[] {
  try { const values: unknown = JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]"); return Array.isArray(values) ? values.filter((v): v is string => typeof v === "string" && v.startsWith("/")).slice(0, 12) : []; } catch { return []; }
}
function remember(href: string) {
  try { localStorage.setItem(RECENTS_KEY, JSON.stringify([href, ...readRecent().filter(v => v !== href)].slice(0, 12))); } catch { /* Browsing still works without storage. */ }
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5" strokeLinecap="round"/></svg>;
}
const SearchContext = createContext<{ open: (keyboard?: boolean) => void; shortcut: string; mac: boolean; shown: boolean } | null>(null);
export function SearchTrigger() {
  const context = useContext(SearchContext);
  const pathname = usePathname();
  const zh = pathname === "/zh" || pathname.startsWith("/zh/");
  if (!context) return null;
  return <button type="button" className={styles.trigger} data-search-trigger aria-label={zh ? "搜索全站" : "Search site"} aria-haspopup="dialog" aria-expanded={context.shown} aria-keyshortcuts={context.mac ? "Meta+K" : "Control+K"} onClick={event => context.open(event.detail === 0)}>
    <SearchIcon/><kbd>{context.shortcut}</kbd>
  </button>;
}
function Highlight({ text, query }: { text: string; query: string }) {
  const terms = queryTerms(query).sort((a, b) => b.length - a.length).map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(`(${terms.join("|")})`, "ig");
  return <>{text.split(pattern).map((part, i) => i % 2 ? <mark key={i}>{part}</mark> : part)}</>;
}
export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale: ContentLocale = pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";
  const zh = locale === "zh";
  const [shown, setShown] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [mac, setMac] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<SearchDocument[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const routeAtOpen = useRef(pathname);
  const backdropDown = useRef(false);
  const listId = useId();
  const titleId = useId();
  const shortcut = mac ? "⌘ K" : "Ctrl K";
  const close = useCallback(() => setShown(false), []);
  const open = useCallback((fromKeyboard = false) => {
    restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    routeAtOpen.current = pathname;
    setKeyboard(fromKeyboard); setQuery(""); setActive(0); setRecent(readRecent()); setShown(true);
  }, [pathname]);

  useEffect(() => { setMac(/Mac|iPhone|iPad/.test(navigator.platform)); }, []);
  useEffect(() => {
    if (/^\/(?:zh\/)?(?:blog|notes|projects|hub)(?:\/|$)/.test(pathname) || pathname === "/about" || pathname === "/zh/about") remember(pathname);
    close();
  }, [pathname, close]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.isComposing || event.repeat || event.altKey || event.shiftKey || event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      if (/^\/(?:zh\/)?(?:private|share)(?:\/|$)/.test(pathname)) return;
      event.preventDefault();
      if (shown) close(); else open(true);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [shown, open, close, pathname]);
  useEffect(() => {
    if (!shown) return;
    let cancelled = false;
    setIndex(null); setFailed(false);
    loadIndex(locale).then(value => { if (!cancelled) setIndex(value); }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [shown, locale, attempt]);

  useLayoutEffect(() => {
    if (!shown) return;
    const el = dialog.current!;
    const root = document.documentElement;
    root.dataset.searchOpen = "true";
    window.dispatchEvent(new Event(SEARCH_CHANGE_EVENT));
    const unlock = lockPageScroll();
    el.showModal();
    input.current?.focus({ preventScroll: true });
    const viewport = () => {
      el.style.setProperty("--search-height", `${window.visualViewport?.height ?? innerHeight}px`);
      el.style.setProperty("--search-top", `${window.visualViewport?.offsetTop ?? 0}px`);
    };
    viewport();
    window.visualViewport?.addEventListener("resize", viewport);
    window.visualViewport?.addEventListener("scroll", viewport);
    return () => {
      window.visualViewport?.removeEventListener("resize", viewport);
      window.visualViewport?.removeEventListener("scroll", viewport);
      el.close();
      unlock();
      delete root.dataset.searchOpen;
      window.dispatchEvent(new Event(SEARCH_CHANGE_EVENT));
      if (routeAtOpen.current === location.pathname && restoreFocus.current?.isConnected) restoreFocus.current.focus({ preventScroll: true });
    };
  }, [shown]);

  const groups = useMemo(() => {
    if (!query.trim()) {
      const recentDocs = recent.flatMap(href => index?.find(doc => doc.href === href && href !== pathname) ?? []).slice(0, 4);
      return [ ...(recentDocs.length ? [{ name: zh ? "最近访问" : "Recently visited", entries: recentDocs }] : []), { name: zh ? "快捷入口" : "Quick links", entries: searchShortcuts(locale) } ];
    }
    const results = searchDocuments(index || [], query);
    const grouped = new Map<string, SearchDocument[]>();
    for (const result of results) {
      const name = searchLabels[locale][result.category];
      grouped.set(name, [...(grouped.get(name) || []), { ...result, summary: result.excerpt }]);
    }
    return [...grouped].map(([name, entries]) => ({ name, entries }));
  }, [index, query, locale, recent, pathname, zh]);
  const entries = useMemo(() => groups.flatMap(group => group.entries), [groups]);
  const selected = Math.min(active, Math.max(0, entries.length - 1));
  const navigate = (doc: SearchDocument) => {
    remember(doc.href); close();
    // Static demos need a normal document navigation; app pages use the router.
    if (/^https?:\/\//.test(doc.href) || /\.html(?:[?#]|$)/.test(doc.href)) window.location.assign(doc.href);
    else router.push(doc.href);
  };
  useEffect(() => {
    if (shown) document.getElementById(`${listId}-${selected}`)?.scrollIntoView({ block: "nearest" });
  }, [selected, shown, listId]);
  let ordinal = 0;
  return <SearchContext.Provider value={{ open, shortcut, mac, shown }}>
    {children}
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} onKeyDown={event => {
      if (event.key !== "Tab") return;
      const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>("input,button:not(:disabled),[tabindex='0']")].filter(element => element.getClientRects().length > 0);
      if (!focusable.length) return;
      event.preventDefault();
      const position = focusable.indexOf(document.activeElement as HTMLElement);
      focusable[(position + (event.shiftKey ? focusable.length - 1 : 1)) % focusable.length].focus({ preventScroll: true });
    }} onCancel={event => { event.preventDefault(); close(); }} onPointerDown={event => { backdropDown.current = event.target === event.currentTarget; }} onClick={event => { event.stopPropagation(); if (event.target === event.currentTarget && backdropDown.current) close(); }}>
      <div className={styles.panel} data-keyboard={keyboard}>
        <h2 id={titleId} className={styles.srOnly}>{zh ? "全站搜索" : "Search the site"}</h2>
        <div className={styles.inputRow}>
          <SearchIcon/>
          <input ref={input} type="text" role="combobox" aria-label={zh ? "搜索内容" : "Search content"} aria-autocomplete="list" aria-expanded="true" aria-controls={listId} aria-activedescendant={entries.length ? `${listId}-${selected}` : undefined} placeholder={zh ? "搜索笔记、文章、项目…" : "Search notes, writing, projects…"} autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={120} enterKeyHint="go" value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={event => {
            if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); event.stopPropagation(); setActive(entries.length ? (selected + (event.key === "ArrowDown" ? 1 : entries.length - 1)) % entries.length : 0); }
            if (event.key === "Enter" && entries[selected]) { event.preventDefault(); event.stopPropagation(); navigate(entries[selected]); }
          }}/>
          {query && <button type="button" className={styles.clear} aria-label={zh ? "清空搜索" : "Clear search"} onClick={() => { setQuery(""); setActive(0); input.current?.focus(); }}>×</button>}
          <button type="button" className={styles.close} aria-label={zh ? "关闭搜索" : "Close search"} onClick={close}><span className={styles.desktop}>Esc</span><span className={styles.mobile}>{zh ? "取消" : "Cancel"}</span></button>
        </div>
        <div className={styles.results}>
          {failed ? <div className={styles.empty}><p>{zh ? "搜索暂时未能加载" : "Search could not be loaded"}</p><button type="button" onClick={() => { setAttempt(value => value + 1); input.current?.focus(); }}>{zh ? "重试" : "Try again"}</button></div> : query.trim() && !index ? <div className={styles.empty}>{zh ? "正在加载搜索…" : "Loading search…"}</div> : query.trim() && !entries.length ? <div className={styles.empty}><strong>{zh ? "没有找到相关内容" : "No matching content"}</strong><p>{zh ? "试试更短的关键词，或换一个说法。" : "Try a shorter keyword or a different phrase."}</p></div> : null}
          <div role="listbox" id={listId} aria-label={zh ? "搜索结果" : "Search results"} aria-busy={!index && !failed}>
            {(!query.trim() || index) && !failed && groups.map(group => <div role="group" aria-label={group.name} key={group.name}>
              <div className={styles.groupTitle} aria-hidden="true">{group.name}</div>
              {group.entries.map(doc => {
                const position = ordinal++;
                return <div role="option" aria-selected={position === selected} id={`${listId}-${position}`} key={doc.href} className={styles.result} onPointerMove={event => { if (event.pointerType === "mouse") setActive(position); }} onMouseDown={event => event.preventDefault()} onClick={() => navigate(doc)}>
                  <div className={styles.resultText}><div className={styles.resultTitle}><Highlight text={doc.title} query={query}/></div>{query.trim() && (doc.group || doc.summary) && <div className={styles.excerpt}>{doc.group && <span>{doc.group} · </span>}<Highlight text={doc.summary} query={query}/></div>}</div>
                  <span className={styles.return} aria-hidden="true">↵</span>
                </div>;
              })}
            </div>)}
          </div>
        </div>
        <div className={styles.footer}><span>{zh ? "搜索本站公开内容" : "Search public site content"}</span><span className={styles.desktop}><kbd>↑</kbd><kbd>↓</kbd> {zh ? "选择" : "select"}<kbd>↵</kbd> {zh ? "打开" : "open"}</span></div>
        <p role="status" aria-live="polite" className={styles.srOnly}>{failed ? (zh ? "搜索加载失败" : "Search unavailable") : query.trim() && index ? (zh ? `${entries.length} 条搜索结果` : `${entries.length} ${entries.length === 1 ? "result" : "results"}`) : ""}</p>
      </div>
    </dialog>
  </SearchContext.Provider>;
}
