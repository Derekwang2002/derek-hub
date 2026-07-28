import { promises as fs } from "node:fs";
import path from "node:path";
import { projectDefinitions } from "../content/projects";
import type { ContentLocale } from "./locale";
import { localePath } from "./locale";
import { getAllLocalizedPosts } from "./localized-posts";
import { getPublicResources } from "./resources";
import { localizeResource } from "./localized-resources";

export type ProjectStatus = "draft" | "active" | "archived";
export type ProjectItemStatus = "draft" | "published";
export type ProjectItemKind = "document" | "interactive";

export type ProjectSectionDefinition = {
  slug: string;
  label: Record<ContentLocale, string>;
};

export type ProjectItemDefinition = {
  slug: string;
  sectionSlug: string;
  kind: ProjectItemKind;
  status: ProjectItemStatus;
  updated: string;
  reviewedRevision?: string;
  assetPath?: Record<ContentLocale, string>;
};

export type ProjectDefinition = {
  slug: string;
  status: ProjectStatus;
  overview: {
    updated: string;
    reviewedRevision?: string;
  };
  sections: ProjectSectionDefinition[];
  items: ProjectItemDefinition[];
};

export type ProjectDocument = {
  content: string;
  summary: string;
  title: string;
};

export type ProjectItem = ProjectItemDefinition &
  ProjectDocument & {
    href: string;
    sectionLabel: string;
  };

export type ProjectSection = {
  label: string;
  slug: string;
  items: ProjectItem[];
};

export type Project = {
  href: string;
  lastUpdated: string;
  overview: ProjectDocument;
  reviewedRevision?: string;
  sections: ProjectSection[];
  slug: string;
  status: Exclude<ProjectStatus, "draft">;
};

export type ProjectPagerLink = {
  href: string;
  label: string;
};

export type ProjectPager = {
  next: ProjectPagerLink | null;
  previous: ProjectPagerLink | null;
};

export type ProjectUpdate = {
  content?: string;
  date: string;
  href: string;
  slug: string;
  summary: string;
  title: string;
  type: "project" | "blog" | "demo";
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UPDATE_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;
const RESERVED_ITEM_SLUGS = new Set(["updates"]);

export async function getAllProjects(locale: ContentLocale): Promise<Project[]> {
  validateDefinitions();
  const projects = await Promise.all(
    projectDefinitions
      .filter((definition) => definition.status !== "draft")
      .map((definition) => loadProject(definition, locale))
  );

  return projects.sort((a, b) => {
    const statusOrder = (value: Project["status"]) => (value === "active" ? 0 : 1);
    const statusCompare = statusOrder(a.status) - statusOrder(b.status);
    if (statusCompare !== 0) return statusCompare;
    const dateCompare = b.lastUpdated.localeCompare(a.lastUpdated);
    return dateCompare || a.slug.localeCompare(b.slug, "en");
  });
}

export async function getProject(
  projectSlug: string,
  locale: ContentLocale
): Promise<Project | null> {
  validateDefinitions();
  const definition = projectDefinitions.find(
    (candidate) => candidate.slug === projectSlug && candidate.status !== "draft"
  );
  return definition ? loadProject(definition, locale) : null;
}

export async function getProjectItem(
  projectSlug: string,
  itemSlug: string,
  locale: ContentLocale
): Promise<ProjectItem | null> {
  const project = await getProject(projectSlug, locale);
  return project?.sections.flatMap((section) => section.items).find((item) => item.slug === itemSlug) ?? null;
}

export async function getProjectPager(
  projectSlug: string,
  itemSlug: string | null,
  locale: ContentLocale
): Promise<ProjectPager> {
  const project = await getProject(projectSlug, locale);
  if (!project) return { previous: null, next: null };

  const nodes: ProjectPagerLink[] = [
    { href: project.href, label: project.overview.title },
    ...project.sections.flatMap((section) =>
      section.items.map((item) => ({ href: item.href, label: item.title }))
    )
  ];
  const href = itemSlug
    ? localePath(locale, `/projects/${projectSlug}/${itemSlug}`)
    : localePath(locale, `/projects/${projectSlug}`);
  const index = nodes.findIndex((node) => node.href === href);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: index > 0 ? nodes[index - 1] : null,
    next: index < nodes.length - 1 ? nodes[index + 1] : null
  };
}

export async function getProjectUpdates(
  projectSlug: string,
  locale: ContentLocale
): Promise<ProjectUpdate[]> {
  const definition = projectDefinitions.find(
    (candidate) => candidate.slug === projectSlug && candidate.status !== "draft"
  );
  if (!definition) return [];

  const directory = getLocalizedProjectDirectory(definition.slug, locale, "updates");
  const fileNames = await listMarkdownFiles(directory);
  if (locale === "en") {
    await assertMirrorParity(
      getLocalizedProjectDirectory(definition.slug, "zh", "updates"),
      directory,
      `Project updates for "${definition.slug}"`
    );
  }

  const authoredUpdates: ProjectUpdate[] = await Promise.all(
    fileNames.map(async (fileName) => {
      const match = UPDATE_FILE_PATTERN.exec(fileName);
      if (!match) {
        throw new Error(
          `Invalid Project update filename "${fileName}". Expected YYYY-MM-DD-lowercase-kebab-slug.md.`
        );
      }
      const [, date, slug] = match;
      validateDate(date, fileName);
      const document = await readProjectMarkdown(path.join(directory, fileName), locale);
      return {
        ...document,
        date,
        href: `${localePath(locale, `/projects/${projectSlug}/updates`)}#${date}-${slug}`,
        slug,
        type: "project" as const
      };
    })
  );
  const [posts, resources] = await Promise.all([
    getAllLocalizedPosts(locale),
    getPublicResources()
  ]);
  const associatedPosts: ProjectUpdate[] = posts
    .filter((post) => post.projects.includes(projectSlug))
    .map((post) => ({
      date: post.date,
      href: localePath(locale, `/blog/${post.slug}`),
      slug: `blog-${post.slug}`,
      summary: post.summary,
      title: post.title,
      type: "blog"
    }));
  const associatedDemos: ProjectUpdate[] = resources
    .filter((resource) => resource.type === "demo" && resource.projectSlugs?.includes(projectSlug))
    .map((resource) => {
      if (!resource.date) {
        throw new Error(`Associated Demo "${resource.href}" requires a date.`);
      }
      const localized = localizeResource(resource, locale);
      return {
        date: resource.date,
        href: localized.href,
        slug: `demo-${resource.href.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`,
        summary: localized.description,
        title: localized.title,
        type: "demo"
      };
    });

  validateAssociations(projectSlug, posts, resources);
  return [...authoredUpdates, ...associatedPosts, ...associatedDemos].sort(
    (a, b) => b.date.localeCompare(a.date) || a.type.localeCompare(b.type, "en") || a.slug.localeCompare(b.slug, "en")
  );
}

export function getProjectDefinitions(): readonly ProjectDefinition[] {
  validateDefinitions();
  return projectDefinitions;
}

async function loadProject(
  definition: ProjectDefinition,
  locale: ContentLocale
): Promise<Project> {
  await assertProjectFileParity(definition);
  const overview = await readProjectMarkdown(
    path.join(getLocalizedProjectDirectory(definition.slug, locale), "index.md"),
    locale
  );
  const publishedItems = definition.items.filter((item) => item.status === "published");
  if (definition.status === "active" && publishedItems.length === 0) {
    throw new Error(`Active Project "${definition.slug}" must have at least one published item.`);
  }

  const loadedItems = await Promise.all(
    publishedItems.map(async (item): Promise<ProjectItem> => {
      const section = definition.sections.find((candidate) => candidate.slug === item.sectionSlug);
      if (!section) {
        throw new Error(`Project item "${definition.slug}/${item.slug}" references unknown section "${item.sectionSlug}".`);
      }
      const document = await readProjectMarkdown(
        path.join(getLocalizedProjectDirectory(definition.slug, locale, "items"), `${item.slug}.md`),
        locale
      );
      return {
        ...item,
        ...document,
        href: localePath(locale, `/projects/${definition.slug}/${item.slug}`),
        sectionLabel: section.label[locale]
      };
    })
  );
  const itemBySlug = new Map(loadedItems.map((item) => [item.slug, item]));
  const sections = definition.sections
    .map((section) => ({
      slug: section.slug,
      label: section.label[locale],
      items: publishedItems
        .filter((item) => item.sectionSlug === section.slug)
        .map((item) => itemBySlug.get(item.slug))
        .filter((item): item is ProjectItem => item !== undefined)
    }))
    .filter((section) => section.items.length > 0);

  const updates = await getProjectUpdates(definition.slug, locale);
  const lastUpdated = [
    definition.overview.updated,
    ...publishedItems.map((item) => item.updated),
    ...updates.filter((update) => update.type === "project").map((update) => update.date)
  ].sort((a, b) => b.localeCompare(a))[0];

  return {
    href: localePath(locale, `/projects/${definition.slug}`),
    lastUpdated,
    overview,
    reviewedRevision: definition.overview.reviewedRevision,
    sections,
    slug: definition.slug,
    status: definition.status as Exclude<ProjectStatus, "draft">
  };
}

function validateDefinitions(): void {
  const projectSlugs = new Set<string>();
  for (const project of projectDefinitions) {
    validateSlug(project.slug, "Project");
    if (projectSlugs.has(project.slug)) throw new Error(`Duplicate Project slug "${project.slug}".`);
    projectSlugs.add(project.slug);
    validateDate(project.overview.updated, `${project.slug} overview`);

    const sectionSlugs = new Set<string>();
    for (const section of project.sections) {
      validateSlug(section.slug, `Section in "${project.slug}"`);
      if (sectionSlugs.has(section.slug)) throw new Error(`Duplicate section slug "${section.slug}" in Project "${project.slug}".`);
      if (!section.label.en.trim() || !section.label.zh.trim()) throw new Error(`Section "${project.slug}/${section.slug}" requires both labels.`);
      sectionSlugs.add(section.slug);
    }

    const itemSlugs = new Set<string>();
    for (const item of project.items) {
      validateSlug(item.slug, `Item in "${project.slug}"`);
      if (RESERVED_ITEM_SLUGS.has(item.slug)) throw new Error(`Project item slug "${item.slug}" is reserved.`);
      if (itemSlugs.has(item.slug)) throw new Error(`Duplicate item slug "${item.slug}" in Project "${project.slug}".`);
      if (!sectionSlugs.has(item.sectionSlug)) throw new Error(`Project item "${project.slug}/${item.slug}" references unknown section "${item.sectionSlug}".`);
      validateDate(item.updated, `${project.slug}/${item.slug}`);
      if (!item.reviewedRevision?.trim()) throw new Error(`Source-backed Project item "${project.slug}/${item.slug}" requires reviewedRevision.`);
      if (item.kind === "interactive" && (!item.assetPath?.en || !item.assetPath.zh)) {
        throw new Error(`Interactive Project item "${project.slug}/${item.slug}" requires both asset paths.`);
      }
      itemSlugs.add(item.slug);
    }
  }
}

function validateAssociations(
  projectSlug: string,
  posts: Awaited<ReturnType<typeof getAllLocalizedPosts>>,
  resources: Awaited<ReturnType<typeof getPublicResources>>
): void {
  const publicProjectSlugs = new Set(
    projectDefinitions.filter((project) => project.status !== "draft").map((project) => project.slug)
  );
  for (const post of posts) {
    for (const associatedSlug of post.projects) {
      if (!publicProjectSlugs.has(associatedSlug)) {
        throw new Error(`Blog post "${post.slug}" associates with unknown or draft Project "${associatedSlug}".`);
      }
    }
  }
  for (const resource of resources) {
    for (const associatedSlug of resource.projectSlugs ?? []) {
      if (!publicProjectSlugs.has(associatedSlug)) {
        throw new Error(`Resource "${resource.href}" associates with unknown or draft Project "${associatedSlug}".`);
      }
    }
  }
  const owner = projectDefinitions.find((project) => project.slug === projectSlug);
  const ownedSlugs = new Set(owner?.items.map((item) => item.slug) ?? []);
  for (const post of posts) {
    if (post.projects.includes(projectSlug) && ownedSlugs.has(post.slug)) {
      throw new Error(`Content "${post.slug}" cannot be owned by and associated with Project "${projectSlug}".`);
    }
  }
}

async function assertProjectFileParity(definition: ProjectDefinition): Promise<void> {
  await assertMirrorParity(
    getLocalizedProjectDirectory(definition.slug, "zh"),
    getLocalizedProjectDirectory(definition.slug, "en"),
    `Project "${definition.slug}"`
  );
  await assertMirrorParity(
    getLocalizedProjectDirectory(definition.slug, "zh", "items"),
    getLocalizedProjectDirectory(definition.slug, "en", "items"),
    `Project items for "${definition.slug}"`
  );

  const canonicalItems = new Set(
    await listMarkdownFiles(getLocalizedProjectDirectory(definition.slug, "zh", "items"))
  );
  const expectedItems = new Set(definition.items.map((item) => `${item.slug}.md`));
  for (const fileName of expectedItems) {
    if (!canonicalItems.has(fileName)) throw new Error(`Missing Project item file "${definition.slug}/${fileName}".`);
  }
  for (const fileName of canonicalItems) {
    if (!expectedItems.has(fileName)) throw new Error(`Orphan Project item file "${definition.slug}/${fileName}".`);
  }

  for (const item of definition.items.filter((candidate) => candidate.kind === "interactive")) {
    for (const locale of ["en", "zh"] as const) {
      const assetPath = item.assetPath?.[locale];
      if (!assetPath) continue;
      const absolutePath = path.join(process.cwd(), "public", assetPath.replace(/^\//, ""));
      try {
        await fs.access(absolutePath);
      } catch {
        throw new Error(`Missing ${locale} interactive asset for "${definition.slug}/${item.slug}": ${assetPath}`);
      }
      if (locale === "en") {
        const source = await fs.readFile(absolutePath, "utf8");
        assertEnglishContent(source, absolutePath);
      }
    }
  }
}

async function assertMirrorParity(
  canonicalDirectory: string,
  englishDirectory: string,
  label: string
): Promise<void> {
  const canonical = await listMarkdownFiles(canonicalDirectory);
  const english = await listMarkdownFiles(englishDirectory);
  const canonicalSet = new Set(canonical);
  const englishSet = new Set(english);
  const missing = canonical.find((fileName) => !englishSet.has(fileName));
  if (missing) throw new Error(`${label}: missing English translation "${missing}".`);
  const orphan = english.find((fileName) => !canonicalSet.has(fileName));
  if (orphan) throw new Error(`${label}: orphan English translation "${orphan}".`);
}

async function listMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "en"));
}

function getLocalizedProjectDirectory(
  projectSlug: string,
  locale: ContentLocale,
  child?: "items" | "updates"
): string {
  const root =
    locale === "zh"
      ? path.join(process.cwd(), "content", "projects", projectSlug)
      : path.join(process.cwd(), "content", "translations", "en", "projects", projectSlug);
  return child ? path.join(root, child) : root;
}

async function readProjectMarkdown(
  fileName: string,
  locale: ContentLocale
): Promise<ProjectDocument> {
  const source = (await fs.readFile(fileName, "utf8")).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/.exec(source);
  if (!match) throw new Error(`${fileName}: expected YAML frontmatter.`);
  const title = readFrontmatterString(match[1], "title", fileName);
  const summary = readFrontmatterString(match[1], "summary", fileName);
  const content = match[2].trim();
  if (!content) throw new Error(`${fileName}: body is empty.`);
  if (locale === "en") assertEnglishContent(`${title}\n${summary}\n${content}`, fileName);
  return { title, summary, content };
}

function assertEnglishContent(source: string, fileName: string): void {
  if (/[\u3400-\u9fff]/u.test(source)) {
    throw new Error(`${fileName}: English Project content contains CJK characters.`);
  }
}

function readFrontmatterString(block: string, key: "title" | "summary", fileName: string): string {
  const line = block.split("\n").find((candidate) => candidate.trimStart().startsWith(`${key}:`));
  const raw = line?.slice(line.indexOf(":") + 1).trim() ?? "";
  const value = unquote(raw).trim();
  if (!value) throw new Error(`${fileName}: ${key} is empty or missing.`);
  return value;
}

function unquote(value: string): string {
  if (value.length >= 2 && value[0] === value[value.length - 1] && (value[0] === `"` || value[0] === `'`)) {
    return value.slice(1, -1);
  }
  return value;
}

function validateSlug(value: string, label: string): void {
  if (!SLUG_PATTERN.test(value)) throw new Error(`${label} slug "${value}" must be lowercase kebab-case.`);
}

function validateDate(value: string, label: string): void {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error(`${label}: invalid date "${value}". Expected YYYY-MM-DD.`);
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`${label}: invalid date "${value}". Expected YYYY-MM-DD.`);
  }
}
