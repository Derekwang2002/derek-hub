import type { Metadata } from "next";
import { getHomeNavigationSections } from "@/components/home-navigation-data";
import { HomeNavigation } from "@/components/home-navigation";

export const metadata: Metadata = {
  title: "首页",
  description: "Derek 的个人主页、简历、写作与技术作品。",
  alternates: { canonical: "/zh", languages: { en: "/", "zh-CN": "/zh" } }
};

export default async function ChineseHomePage() { return <HomeNavigation locale="zh" sections={await getHomeNavigationSections("zh")} />; }
