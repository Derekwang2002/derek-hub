import type { Metadata } from "next";
import { HeroMotion } from "./_components/hero-motion";

export const metadata: Metadata = { title: "Hero interaction studies", robots: { index: false, follow: false } };
export default function Page() { return <HeroMotion locale="en" />; }
