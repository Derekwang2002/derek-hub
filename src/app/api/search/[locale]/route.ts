import { buildSearchIndex } from "../../../../../lib/search-index";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return [{ locale: "en" }, { locale: "zh" }]; }
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en" && locale !== "zh") return new Response(null, { status: 404 });
  return Response.json(await buildSearchIndex(locale), { headers: { "X-Robots-Tag": "noindex" } });
}
