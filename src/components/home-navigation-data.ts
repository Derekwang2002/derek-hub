import { getAllLocalizedPosts } from "../../lib/localized-posts";
import { getLocalizedResourcesBySection } from "../../lib/localized-resources";
import type { ContentLocale } from "../../lib/locale";

export type NavigationPreviewSection = { id: string; entries: { title: string }[] };

/** Only preview titles cross into the homepage client component. */
export async function getHomeNavigationSections(locale: ContentLocale): Promise<NavigationPreviewSection[]> {
  const [posts, resources] = await Promise.all([
    getAllLocalizedPosts(locale), getLocalizedResourcesBySection("skills", locale),
  ]);
  return [
    { id: "notes", entries: [] },
    { id: "blog", entries: posts.slice(0, 1).map(({ title }) => ({ title })) },
    { id: "projects", entries: [] },
    { id: "resources", entries: resources.slice(0, 3).map(({ title }) => ({ title })) },
    { id: "about", entries: [] },
  ];
}
