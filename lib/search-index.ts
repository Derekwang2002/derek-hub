import { getAllLocalizedPosts } from "./localized-posts";
import { getAllProjects } from "./projects";
import { getLocalizedResourcesBySection } from "./localized-resources";
import { getSkillDocBySlug } from "./skill-docs";
import { collectionSection, postPath, postSection } from "./content-sections";
import { localePath, type ContentLocale } from "./locale";
import { plainSearchText, searchShortcuts, type SearchDocument } from "./search";

/** Deliberately use the same published-content loaders as the public route lists. */
export async function buildSearchIndex(locale: ContentLocale): Promise<SearchDocument[]> {
  const [posts, projects, resources] = await Promise.all([
    getAllLocalizedPosts(locale, "all"), getAllProjects(locale, "all"), getLocalizedResourcesBySection("all", locale),
  ]);
  const documents: SearchDocument[] = searchShortcuts(locale);
  for (const post of posts) documents.push({ href: localePath(locale, postPath(post.slug)), title: post.title, category: postSection(post.slug), summary: post.summary, tags: post.tags, text: plainSearchText(post.content) });
  for (const project of projects) {
    const category = collectionSection(project.slug);
    documents.push({ href: project.href, title: project.name, category, summary: project.summary, text: plainSearchText(project.overview.content), tags: [] });
    for (const section of project.sections) for (const item of section.items) documents.push({ href: item.href, title: item.title, category, group: project.name, summary: item.summary, text: plainSearchText(item.content), tags: [section.label] });
  }
  for (const resource of resources) {
    const slug = /^\/hub\/skills\/([^/]+)$/.exec(resource.href)?.[1];
    const doc = slug ? await getSkillDocBySlug(slug, locale) : null;
    if (slug && !doc) continue;
    documents.push({ href: resource.href.startsWith("/hub/") ? localePath(locale, resource.href) : resource.href, title: resource.title, category: "resources", summary: resource.description, text: doc ? plainSearchText(doc.content) : "", tags: resource.tags });
  }
  return [...new Map(documents.map(doc => [doc.href, doc])).values()];
}
