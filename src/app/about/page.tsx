import type { Metadata } from "next";
import { AboutContent } from "@/components/home-content";

export const metadata: Metadata = {
  title: "About me",
  description: "Derek Wang’s education, experience, and technical skills.",
  alternates: { canonical: "/about", languages: { en: "/about", "zh-CN": "/zh/about" } }
};

export default function AboutPage() { return <AboutContent locale="en" />; }
