import type { Metadata } from "next";
import { getHomeNavigationSections } from "@/components/home-navigation-data";
import { HomeNavigation } from "@/components/home-navigation";

export const metadata: Metadata = {
  title: "Home",
  description: "Derek Wang's profile, resume, writing, and technical work.",
  alternates: { canonical: "/", languages: { en: "/", "zh-CN": "/zh" } },
  openGraph: { title: "Home | Derek Hub", description: "Derek Wang's profile, resume, writing, and technical work.", url: "/", images: [{ url: "/og-default.svg", width: 1200, height: 630, alt: "Derek Hub Open Graph Image" }] }
};

export default async function HomePage() { return <HomeNavigation locale="en" sections={await getHomeNavigationSections("en")} />; }
