import type { ContentLocale } from "./locale";
import { localePath } from "./locale";

export type SearchCategory = "notes" | "blog" | "projects" | "resources" | "pages";
export type SearchDocument = { href: string; title: string; category: SearchCategory; summary: string; text: string; tags: string[]; group?: string };
export type SearchResult = SearchDocument & { score: number; excerpt: string };
export const searchLabels: Record<ContentLocale, Record<SearchCategory, string>> = {
  zh: { notes: "笔记", blog: "博客", projects: "项目", resources: "资源", pages: "页面" },
  en: { notes: "Notes", blog: "Blog", projects: "Projects", resources: "Resources", pages: "Pages" },
};
export function searchShortcuts(locale: ContentLocale): SearchDocument[] {
  return (["notes", "blog", "projects", "resources", "pages"] as const).map(category => ({
    category, href: localePath(locale, category === "resources" ? "/hub/all" : category === "pages" ? "/about" : `/${category}`),
    title: category === "pages" ? (locale === "zh" ? "关于我" : "About me") : searchLabels[locale][category], summary: "", text: "", tags: [],
  }));
}
const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase();
export const queryTerms = (query: string) => [...new Set(normalize(query).trim().split(/\s+/u).filter(Boolean))].slice(0, 8);
export function plainSearchText(markdown: string): string {
  return markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "")
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^[#>\s*-]+/gm, " ").replace(/[`*_~|]/g, " ").replace(/\s+/g, " ").trim();
}
function excerptFor(doc: SearchDocument, terms: string[]): string {
  const source = terms.some(term => normalize(doc.summary).includes(term)) ? doc.summary : doc.text || doc.summary;
  const positions = terms.map(term => normalize(source).indexOf(term)).filter(pos => pos >= 0);
  if (!positions.length) return doc.summary.slice(0, 150) + (doc.summary.length > 150 ? "…" : "");
  const start = Math.max(0, Math.min(...positions) - 38);
  return `${start ? "…" : ""}${source.slice(start, start + 150)}${source.length > start + 150 ? "…" : ""}`;
}
export function searchDocuments(documents: SearchDocument[], query: string, limit = 16): SearchResult[] {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const phrase = normalize(query.trim());
  return documents.flatMap(doc => {
    const title = normalize(doc.title), tags = normalize(doc.tags.join(" ")), summary = normalize(doc.summary), text = normalize(doc.text), group = normalize(doc.group || "");
    let score = title === phrase ? 1000 : title.includes(phrase) ? 250 : 0;
    for (const term of terms) {
      if (title.includes(term)) score += 100;
      else if (tags.includes(term)) score += 60;
      else if (group.includes(term)) score += 40;
      else if (summary.includes(term)) score += 25;
      else if (text.includes(term)) score += 5;
      else return [];
    }
    return [{ ...doc, score, excerpt: excerptFor(doc, terms) }];
  }).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}
