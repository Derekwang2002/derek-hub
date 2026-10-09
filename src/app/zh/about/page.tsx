import type { Metadata } from "next";
import { AboutContent } from "@/components/home-content";

export const metadata: Metadata = {
  title: "关于我",
  description: "Derek Wang 的教育背景、实习经历与专业技能。",
  alternates: { canonical: "/zh/about", languages: { en: "/about", "zh-CN": "/zh/about" } }
};

export default function AboutPage() { return <AboutContent locale="zh" />; }
