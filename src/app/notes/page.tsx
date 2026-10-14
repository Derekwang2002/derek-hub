import { PrimaryPageNavigation } from "@/components/primary-page-navigation";
import type { Metadata } from "next";
import { NotesContent } from "@/components/notes-content";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Notes",
  alternates: { canonical: "/notes", languages: { en: "/notes", "zh-CN": "/zh/notes" } }
};
export default function NotesPage() { return <PrimaryPageNavigation locale="en" current="notes"><NotesContent locale="en" /></PrimaryPageNavigation>; }
