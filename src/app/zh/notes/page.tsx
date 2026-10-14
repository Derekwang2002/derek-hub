import { PrimaryPageNavigation } from "@/components/primary-page-navigation";
import type { Metadata } from "next";
import { NotesContent } from "@/components/notes-content";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "笔记",
  alternates: { canonical: "/zh/notes", languages: { en: "/notes", "zh-CN": "/zh/notes" } }
};
export default function NotesPage() { return <PrimaryPageNavigation locale="zh" current="notes"><NotesContent locale="zh" /></PrimaryPageNavigation>; }
