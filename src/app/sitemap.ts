import type { MetadataRoute } from "next";
import { getAllPosts } from "../../lib/posts";
import { RESOURCE_SECTIONS, getPublicResources } from "../../lib/resources";

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
  const publicResources = getPublicResources();

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

  return [...staticEntries, ...resourceSectionEntries, ...postEntries];
}
