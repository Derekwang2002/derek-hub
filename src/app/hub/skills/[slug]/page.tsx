import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceArticle } from "@/components/resource-article";
import { getPublicResourceByHref } from "../../../../../lib/resources";
import { getAllSkillDocSlugs, getSkillDocBySlug } from "../../../../../lib/skill-docs";
import { localizeResource } from "../../../../../lib/localized-resources";

const DEFAULT_OG_IMAGE = "/og-default.svg";

type SkillPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getAllSkillDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SkillPageProps): Promise<Metadata> {
  const { slug } = await params;
  const href = getSkillHref(slug);
  const rawResource = await getPublicResourceByHref(href);
  const resource = rawResource ? localizeResource(rawResource, "en") : undefined;
  const doc = await getSkillDocBySlug(slug, "en");

  if (!resource || !doc) {
    return {
      title: "Skill Not Found",
      description: "The requested skill article could not be found."
    };
  }

  return {
    title: resource.title,
    description: resource.description,
    alternates: {
      canonical: href,
      languages: { en: href, "zh-CN": `/zh${href}` }
    },
    openGraph: {
      type: "article",
      title: resource.title,
      description: resource.description,
      url: href,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${resource.title} Open Graph Image`
        }
      ],
      publishedTime: resource.date ? `${resource.date}T00:00:00.000Z` : undefined
    }
  };
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { slug } = await params;
  const href = getSkillHref(slug);
  const rawResource = await getPublicResourceByHref(href);
  const resource = rawResource ? localizeResource(rawResource, "en") : undefined;
  const doc = await getSkillDocBySlug(slug, "en");

  if (!resource || !doc) {
    notFound();
  }

  return <ResourceArticle resource={resource} doc={doc} locale="en" />;
}

function getSkillHref(slug: string): string {
  return `/hub/skills/${slug}`;
}
