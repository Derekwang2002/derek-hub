import { NotePage, getNoteMetadata, getNoteStaticParams } from "@/components/note-page";

type Props = { params: Promise<{ slug: string[] }> };
export const dynamicParams = false;
export const generateStaticParams = getNoteStaticParams;

export async function generateMetadata({ params }: Props) {
  return getNoteMetadata((await params).slug, "en");
}

export default async function Page({ params }: Props) {
  return <NotePage slug={(await params).slug} locale="en" />;
}
