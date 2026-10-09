// Explicit editorial ownership; filenames and tags do not determine a section.
export const notePostSlugs: readonly string[] = ["mysql-notes", "leetcode-notes"];
export const noteCollectionSlugs: readonly string[] = ["csci678"];

export function postSection(slug: string): "blog" | "notes" {
  return notePostSlugs.includes(slug) ? "notes" : "blog";
}

export function collectionSection(slug: string): "projects" | "notes" {
  return noteCollectionSlugs.includes(slug) ? "notes" : "projects";
}

export function postPath(slug: string): string {
  return `/${postSection(slug)}/${slug}`;
}

export function collectionPath(slug: string): string {
  return `/${collectionSection(slug)}/${slug}`;
}
