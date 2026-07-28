import type { Metadata } from "next";
import { ProjectOverviewPage, getProjectMetadata } from "@/components/project-page";
import { getProjectDefinitions } from "../../../../lib/projects";

type Props = { params: Promise<{ project: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectDefinitions()
    .filter((project) => project.status !== "draft")
    .map((project) => ({ project: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getProjectMetadata((await params).project, null, "en");
}

export default async function ProjectPage({ params }: Props) {
  return <ProjectOverviewPage locale="en" projectSlug={(await params).project} />;
}

