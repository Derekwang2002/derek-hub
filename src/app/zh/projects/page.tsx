import { ProjectsIndex, getProjectsIndexMetadata } from "@/components/project-page";

export const dynamic = "force-static";
export const metadata = await getProjectsIndexMetadata("zh");

export default function ChineseProjectsPage() {
  return <ProjectsIndex locale="zh" />;
}

