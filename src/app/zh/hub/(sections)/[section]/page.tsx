import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceList } from "@/components/resource-list";
import { getLocalizedResourcesBySection } from "../../../../../../lib/localized-resources";
import { RESOURCE_SECTIONS, getResourceSection } from "../../../../../../lib/resources";

type Props = { params: Promise<{ section: string }> };

const DESCRIPTIONS = {
  all: "Hub 中公开发布的全部资源。",
  skills: "面向读者的 Skills 文档，文章中保留仓库链接。",
  demos: "交互式 HTML 演示、讲解与可视化页面。"
} as const;

export const dynamicParams = false;
export function generateStaticParams() { return RESOURCE_SECTIONS.map(({ slug }) => ({ section: slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const section = getResourceSection((await params).section);
  if (!section) return { title: "Hub 分类" };
  return {
    title: section.label,
    description: DESCRIPTIONS[section.slug],
    alternates: {
      canonical: `/zh/hub/${section.slug}`,
      languages: { en: `/hub/${section.slug}`, "zh-CN": `/zh/hub/${section.slug}` }
    }
  };
}

export default async function ChineseHubSectionPage({ params }: Props) {
  const section = getResourceSection((await params).section);
  if (!section) notFound();
  const resources = await getLocalizedResourcesBySection(section.slug, "zh");
  return (
    <div className="list-swap" key={section.slug}>
      <ResourceList emptyMessage={`暂无 ${section.label} 资源。`} locale="zh" resources={resources} />
    </div>
  );
}
