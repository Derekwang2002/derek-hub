import { PrimaryPageNavigation } from "@/components/primary-page-navigation";
import { ProjectsIndex, getProjectsIndexMetadata } from "@/components/project-page";

export const dynamic = "force-static";
export const metadata = await getProjectsIndexMetadata("en");

export default function ProjectsPage() {
  return <PrimaryPageNavigation locale="en" current="projects"><ProjectsIndex locale="en" /></PrimaryPageNavigation>;
}

