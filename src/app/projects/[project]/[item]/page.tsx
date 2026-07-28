import type { Metadata } from "next";
import { ProjectItemPage, getProjectMetadata } from "@/components/project-page";
import { getProjectDefinitions } from "../../../../../lib/projects";

type Props = { params: Promise<{ project: string; item: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectDefinitions().flatMap((project) =>
    project.status === "draft"
      ? []
      : project.items
          .filter((item) => item.status === "published")
          .map((item) => ({ project: project.slug, item: item.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project, item } = await params;
  return getProjectMetadata(project, item, "en");
}

export default async function ProjectDocumentRoute({ params }: Props) {
  const { project, item } = await params;
  return <ProjectItemPage itemSlug={item} locale="en" projectSlug={project} />;
}

