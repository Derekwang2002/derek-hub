import type { MetadataRoute } from "next";
import { getAllPosts } from "../../lib/posts";
import { getAllProjects } from "../../lib/projects";
import {
  RESOURCE_SECTIONS,
  getPublicResources,
  isExternalResourceHref
} from "../../lib/resources";

export const dynamic = "force-static";

function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function toAbsoluteUrl(siteUrl: string, pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteUrl}${normalized}`;
}

function toDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const posts = await getAllPosts();
  const projects = await getAllProjects("en");
  const publicResources = await getPublicResources();

  const latestPostDate = posts.length > 0 ? toDate(posts[0].date) : undefined;
  const latestResourceDate =
    publicResources.reduce<Date | undefined>((latest, resource) => {
      if (!resource.date) {
        return latest;
      }

      const resourceDate = toDate(resource.date);
      return !latest || resourceDate > latest ? resourceDate : latest;
    }, undefined) ?? latestPostDate;

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl(siteUrl, "/"),
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: toAbsoluteUrl(siteUrl, "/blog"),
      lastModified: latestPostDate,
      changeFrequency: "daily",
      priority: 0.9
    }
  ];

  const resourceSectionEntries: MetadataRoute.Sitemap = RESOURCE_SECTIONS.map((section) => ({
    url: toAbsoluteUrl(siteUrl, `/hub/${section.slug}`),
    lastModified: latestResourceDate,
    changeFrequency: "weekly",
    priority: section.slug === "all" ? 0.85 : 0.75
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: toAbsoluteUrl(siteUrl, `/blog/${post.slug}`),
    lastModified: toDate(post.date),
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const projectEntries: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl(siteUrl, "/projects"),
      lastModified: projects[0] ? toDate(projects[0].lastUpdated) : latestPostDate,
      changeFrequency: "weekly",
      priority: 0.85
    },
    ...projects.flatMap((project) => [
      {
        url: toAbsoluteUrl(siteUrl, project.href),
        lastModified: toDate(project.lastUpdated),
        changeFrequency: "weekly" as const,
        priority: 0.85
      },
      ...project.sections.flatMap((section) =>
        section.items.map((item) => ({
          url: toAbsoluteUrl(siteUrl, item.href),
          lastModified: toDate(item.updated),
          changeFrequency: "monthly" as const,
          priority: 0.7
        }))
      ),
      {
        url: toAbsoluteUrl(siteUrl, `${project.href}/updates`),
        lastModified: toDate(project.lastUpdated),
        changeFrequency: "weekly" as const,
        priority: 0.65
      }
    ])
  ];

  const resourceEntries: MetadataRoute.Sitemap = publicResources
    .filter((resource) => !isExternalResourceHref(resource.href))
    .map((resource) => ({
      url: toAbsoluteUrl(siteUrl, resource.href),
      lastModified: resource.date ? toDate(resource.date) : latestResourceDate,
      changeFrequency: "monthly",
      priority: resource.type === "skill" ? 0.7 : 0.6
    }));

  const chineseEntries: MetadataRoute.Sitemap = [
    ...staticEntries.map((entry) => ({ ...entry, url: entry.url === `${siteUrl}/` ? `${siteUrl}/zh` : entry.url.replace(`${siteUrl}/blog`, `${siteUrl}/zh/blog`) })),
    ...resourceSectionEntries.map((entry) => ({ ...entry, url: entry.url.replace(`${siteUrl}/hub`, `${siteUrl}/zh/hub`) })),
    ...resourceEntries.filter((entry) => entry.url.includes("/hub/skills/")).map((entry) => ({ ...entry, url: entry.url.replace(`${siteUrl}/hub`, `${siteUrl}/zh/hub`) })),
    ...postEntries.map((entry) => ({ ...entry, url: entry.url.replace(`${siteUrl}/blog`, `${siteUrl}/zh/blog`) })),
    ...projectEntries.map((entry) => ({ ...entry, url: entry.url.replace(`${siteUrl}/projects`, `${siteUrl}/zh/projects`) }))
  ];

  return [
    ...staticEntries,
    ...resourceSectionEntries,
    ...resourceEntries,
    ...postEntries,
    ...projectEntries,
    ...chineseEntries
  ];
}
