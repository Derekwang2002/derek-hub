import type { Resource } from "../../content/resources";
import { localePath, type ContentLocale } from "../../lib/locale";
import { readingMinutes } from "../../lib/post-metadata";
import type { SkillDoc } from "../../lib/skill-docs";
import { ArticleHeader } from "./article-header";
import { getMarkdownHeadings, renderMarkdown } from "./markdown-renderer";
import { PostBodyLayout } from "./post-body-layout";
import styles from "../app/blog/[slug]/page.module.css";

export async function ResourceArticle({ resource, doc, locale }: {
  resource: Resource;
  doc: SkillDoc;
  locale: ContentLocale;
}) {
  // A standalone document's opening heading is a section beneath the page title.
  const content = doc.content.replace(/^(\s*)#\s+/, "$1## ");
  const tocItems = getMarkdownHeadings(content);
  const renderedContent = await renderMarkdown(content, tocItems);

  return (
    <main className={`page-enter ${styles.postPage}`} lang={locale === "zh" ? "zh-CN" : "en"}>
      <PostBodyLayout
        articleTitle={resource.title}
        locale={locale}
        tocItems={tocItems}
        header={<ArticleHeader
          title={resource.title}
          summary={resource.description}
          date={resource.date}
          minutes={readingMinutes(content)}
          locale={locale}
          breadcrumbs={[
            { label: locale === "zh" ? "资源" : "Resources", href: localePath(locale, "/hub/all") },
            { label: "Skills", href: localePath(locale, "/hub/skills") }
          ]}
        />}
      >
        {renderedContent}
      </PostBodyLayout>
    </main>
  );
}
