import type { Metadata } from "next";
import { HeroMotion } from "../../../prototypes/hero-motion/_components/hero-motion";

export const metadata: Metadata = { title: "Hero 交互原型", robots: { index: false, follow: false } };
export default function Page() { return <HeroMotion locale="zh" />; }
