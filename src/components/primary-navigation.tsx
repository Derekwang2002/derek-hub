"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath } from "../../lib/locale";

export function PrimaryNavigation() {
  const pathname = usePathname() ?? "/";
  const chinese = pathname === "/zh" || pathname.startsWith("/zh/");
  const locale = chinese ? "zh" : "en";
  const current = chinese ? pathname.slice(3) || "/" : pathname;
  const links = [
    { href: "/notes", label: chinese ? "笔记" : "Notes" },
    { href: "/blog", label: chinese ? "博客" : "Blog" },
    { href: "/projects", label: chinese ? "项目" : "Projects" },
    { href: "/hub/all", match: "/hub", label: chinese ? "资源" : "Resources" },
    { href: "/about", label: chinese ? "关于我" : "About me" }
  ];
  return <div className="site-primary">
    <Link className="site-brand" href={localePath(locale, "/")} aria-label={chinese ? "Derek Hub 首页" : "Derek Hub home"}>
      Derek Wang
    </Link>
    <div className="site-nav-links">{links.map(({ href, match, label }) => {
      const prefix = match ?? href;
      return <Link key={href} href={localePath(locale, href)} aria-current={current === prefix || current.startsWith(`${prefix}/`) ? "page" : undefined}>{label}</Link>;
    })}</div>
  </div>;
}
