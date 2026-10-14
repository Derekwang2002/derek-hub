import { PrimaryPageNavigation } from "@/components/primary-page-navigation";
import { ProjectsIndex, getProjectsIndexMetadata } from "@/components/project-page";

export const dynamic = "force-static";
export const metadata = await getProjectsIndexMetadata("zh");

export default function ChineseProjectsPage() {
  return <PrimaryPageNavigation locale="zh" current="projects"><ProjectsIndex locale="zh" /></PrimaryPageNavigation>;
}

