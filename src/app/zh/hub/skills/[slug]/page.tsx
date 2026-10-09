import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceArticle } from "@/components/resource-article";
import { getPublicResourceByHref } from "../../../../../../lib/resources";
import { getAllSkillDocSlugs, getSkillDocBySlug } from "../../../../../../lib/skill-docs";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export async function generateStaticParams() { return (await getAllSkillDocSlugs()).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const resource = await getPublicResourceByHref(`/hub/skills/${slug}`);
  const doc = await getSkillDocBySlug(slug, "zh");
  return resource && doc
    ? { title: resource.title, description: resource.description, alternates: { canonical: `/zh/hub/skills/${slug}`, languages: { en: `/hub/skills/${slug}`, "zh-CN": `/zh/hub/skills/${slug}` } } }
    : { title: "Skill 未找到" };
}

export default async function ChineseSkillPage({ params }: Props) {
  const slug = (await params).slug;
  const resource = await getPublicResourceByHref(`/hub/skills/${slug}`);
  const doc = await getSkillDocBySlug(slug, "zh");
  if (!resource || !doc) notFound();
  return <ResourceArticle resource={resource} doc={doc} locale="zh" />;
}
