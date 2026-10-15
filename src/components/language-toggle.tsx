"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { retainExpandedNavigation } from "./navigation-locale-state";

import { useSegmentedDrag } from "./use-segmented-drag";

const STORAGE_KEY = "content-locale";

function toOtherLocalePath(pathname: string): string {
  if (pathname === "/zh") return "/";
  if (pathname.startsWith("/zh/")) return pathname.slice(3);
  return pathname === "/" ? "/zh" : `/zh${pathname}`;
}

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const chinese = pathname === "/zh" || pathname.startsWith("/zh/");
  const query = searchParams.toString();
  const href = `${toOtherLocalePath(pathname)}${query ? `?${query}` : ""}`;

  const drag = useSegmentedDrag<HTMLAnchorElement>(chinese ? 0 : 1, next => {
    try { localStorage.setItem(STORAGE_KEY, next === 0 ? "zh" : "en"); } catch {}
    router.push(href, { scroll: !retainExpandedNavigation(href) });
  });

  useEffect(() => {
    document.documentElement.lang = chinese ? "zh-CN" : "en";
  }, [chinese]);

  return (
    <Link
      {...drag}
      draggable={false}
      aria-label={chinese ? "Switch content language to English" : "切换内容语言为中文"}
      className="language-toggle"
      data-locale={chinese ? "zh" : "en"}
      href={href}
      onClick={event => {
        try {
          localStorage.setItem(STORAGE_KEY, chinese ? "en" : "zh");
        } catch {
          // The URL remains the source of truth when storage is unavailable.
        }
        if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
          && retainExpandedNavigation(href)) {
          event.preventDefault();
          router.push(href, { scroll: false });
        }
      }}
    >
      <svg className="language-toggle-mobile" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <text x="12" y="12" dy=".35em" textAnchor="middle" fontSize={chinese ? 19 : 14} fontWeight="600" fontFamily="inherit">{chinese ? "中" : "EN"}</text>
      </svg><span aria-hidden="true">中</span><span aria-hidden="true">EN</span>
    </Link>
  );
}
