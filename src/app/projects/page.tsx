import { ProjectsIndex, getProjectsIndexMetadata } from "@/components/project-page";

export const dynamic = "force-static";
export const metadata = await getProjectsIndexMetadata("en");

export default function ProjectsPage() {
  return <ProjectsIndex locale="en" />;
}

