import { getAllLocalizedPosts } from "../../../../lib/localized-posts";
import { getAllProjects } from "../../../../lib/projects";
import { getLocalizedResourcesBySection } from "../../../../lib/localized-resources";
import { localePath, type ContentLocale } from "../../../../lib/locale";
import { postPath } from "../../../../lib/content-sections";
import { RESUME } from "@/components/profile-data";

export type SectionData = { id: string; label: string; summary: string; href: string; entries: { title: string; detail: string; href: string }[] };
export async function getSections(locale: ContentLocale): Promise<SectionData[]> {
  const zh = locale === "zh";
  const [notes, notePosts, posts, projects, resources] = await Promise.all([
    getAllProjects(locale, "notes"), getAllLocalizedPosts(locale, "notes"), getAllLocalizedPosts(locale), getAllProjects(locale), getLocalizedResourcesBySection("all", locale)
  ]);
  return [
    { id: "notes", label: zh ? "笔记" : "Notes", summary: zh ? "课程、概念与学习记录。" : "Courses, concepts and learning notes.", href: localePath(locale,"/notes"), entries: [...notes.map(p=>({title:p.name,detail:p.lastUpdated,href:p.href})),...notePosts.map(p=>({title:p.title,detail:p.date,href:localePath(locale,postPath(p.slug))}))].slice(0,4) },
    { id: "blog", label: zh ? "博客" : "Blog", summary: zh ? "技术文章与工程实践。" : "Writing on software and engineering.", href: localePath(locale,"/blog"), entries: posts.slice(0,4).map(p=>({title:p.title,detail:p.date,href:localePath(locale,postPath(p.slug))})) },
    { id: "projects", label: zh ? "项目" : "Projects", summary: zh ? "项目文档、源码导览与进展记录。" : "Documentation, source guides and project updates.", href: localePath(locale,"/projects"), entries: projects.slice(0,4).map(p=>({title:p.name,detail:p.summary,href:p.href})) },
    { id: "resources", label: zh ? "资源" : "Resources", summary: zh ? "可交互演示与实用工具。" : "Interactive explainers and practical tools.", href: localePath(locale,"/hub/all"), entries: resources.slice(0,4).map(r=>({title:r.title,detail:r.description,href:r.href.startsWith('/hub/')?localePath(locale,r.href):r.href})) },
    { id: "about", label: zh ? "关于我" : "About", summary: "Agent / Backend Engineering", href: localePath(locale,"/about"), entries: RESUME[locale].education.map(e=>({title:e.school,detail:`${e.degree} · ${e.period}`,href:localePath(locale,"/about")})) }
  ];
}
