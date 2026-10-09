import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarkdownHeadings, renderMarkdown } from "./markdown-renderer";
import { ProjectLayout } from "./project-layout";
import { PostBodyLayout } from "./post-body-layout";
import { ProjectNavigation } from "./project-navigation";
import { ProjectPager } from "./project-pager";
import { TitleNote } from "./title-note";
import { ArticleHeader } from "./article-header";
import { collectionPath, collectionSection } from "../../lib/content-sections";
import { readingMinutes } from "../../lib/post-metadata";
import { formatContentDate, localePath, type ContentLocale } from "../../lib/locale";
import {
  getAllProjects,
  getProject,
  getProjectItem,
  getProjectPager,
  getProjectUpdates,
  type Project,
  type ProjectItem
} from "../../lib/projects";
import styles from "../app/projects/projects.module.css";

const DEFAULT_OG_IMAGE = "/og-default.svg";

export async function ProjectsIndex({ locale }: { locale: ContentLocale }) {
  const projects = await getAllProjects(locale);
  return (
    <main className={`page-enter ${styles.indexPage}`} lang={locale === "zh" ? "zh-CN" : "en"}>
      <header className={styles.indexHero}>
        <div className={styles.indexHeading}>
          <h1>{locale === "zh" ? "项目" : "Projects"}</h1>
          <TitleNote label={locale === "zh" ? "项目说明" : "About projects"}>
            {locale === "zh" ? "项目文档、源码导览与进展记录。" : "Project documentation, source guides, and progress updates."}
          </TitleNote>
        </div>
      </header>
      <ul className={styles.projectList}>
        {projects.map((project) => (
          <li className="row-highlight" key={project.slug}>
            <Link href={project.href}>
              <span className={styles.projectDescription}>
                <strong>{project.overview.title}</strong>
                <small>{project.summary}</small>
              </span>
              <span className={styles.projectMeta}>
                {project.status === "archived"
                  ? locale === "zh" ? "已归档" : "Archived"
                  : locale === "zh" ? "进行中" : "Active"}
                {" · "}
                {formatContentDate(project.lastUpdated, locale)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export async function ProjectOverviewPage({
  locale,
  projectSlug
}: {
  locale: ContentLocale;
  projectSlug: string;
}) {
  const project = await getProject(projectSlug, locale);
  if (!project) notFound();
  const pager = await getProjectPager(projectSlug, null, locale);
  const updates = (await getProjectUpdates(projectSlug, locale)).slice(0, 3);
  const tocItems = getMarkdownHeadings(project.overview.content);
  const rendered = await renderMarkdown(project.overview.content, tocItems);

  return (
    <ProjectPageShell activeHref={project.href} locale={locale} project={project}>
      <PostBodyLayout articleTitle={project.overview.title} locale={locale} tocItems={tocItems} header={<ProjectHeader
        locale={locale}
        project={project}
        title={project.overview.title}
        summary={project.overview.summary}
      />}>{rendered}</PostBodyLayout>
      <section aria-labelledby="project-map-title" className={styles.directory}>
        <div className={styles.sectionHeading}>
          <h2 id="project-map-title">{locale === "zh" ? "文档" : "Documents"}</h2>
        </div>
        <ProjectDirectory project={project} />
      </section>
      <section aria-labelledby="latest-updates-title" className={styles.latestUpdates}>
        <div className={styles.sectionHeading}>
          <h2 id="latest-updates-title">{locale === "zh" ? "最近动态" : "Latest updates"}</h2>
        </div>
        {updates.length > 0 ? (
          <UpdateList locale={locale} updates={updates} />
        ) : (
          <p className={styles.emptyUpdates}>
            {locale === "zh" ? "暂无动态。" : "No updates yet."}
          </p>
        )}
        <Link className={styles.textLink} href={`${project.href}/updates`}>
          {locale === "zh" ? "查看全部动态 →" : "View all updates →"}
        </Link>
      </section>
      {collectionSection(project.slug) === "projects" ? <ProjectRevision locale={locale} revision={project.reviewedRevision} /> : null}
      <ProjectPager locale={locale} pager={pager} />
    </ProjectPageShell>
  );
}

export async function ProjectItemPage({
  itemSlug,
  locale,
  projectSlug
}: {
  itemSlug: string;
  locale: ContentLocale;
  projectSlug: string;
}) {
  const [project, item, pager] = await Promise.all([
    getProject(projectSlug, locale),
    getProjectItem(projectSlug, itemSlug, locale),
    getProjectPager(projectSlug, itemSlug, locale)
  ]);
  if (!project || !item) notFound();
  const tocItems = getMarkdownHeadings(item.content);
  const rendered = await renderMarkdown(item.content, tocItems);

  return (
    <ProjectPageShell activeHref={item.href} locale={locale} project={project}>
      {item.kind === "interactive" ? <>
        <ProjectHeader
        item={item}
        locale={locale}
        project={project}
        summary={item.summary}
        title={item.title}
      />
        <InteractiveProjectItem item={item} locale={locale} />
      </> : <PostBodyLayout articleTitle={item.title} locale={locale} tocItems={tocItems} header={<ProjectHeader
        item={item}
        locale={locale}
        project={project}
        summary={item.summary}
        title={item.title}
      />}>{rendered}</PostBodyLayout>}
      {collectionSection(project.slug) === "projects" ? <ProjectRevision locale={locale} revision={item.reviewedRevision} /> : null}
      <ProjectPager locale={locale} pager={pager} />
    </ProjectPageShell>
  );
}

export async function ProjectUpdatesPage({
  locale,
  projectSlug
}: {
  locale: ContentLocale;
  projectSlug: string;
}) {
  const project = await getProject(projectSlug, locale);
  if (!project) notFound();
  const updates = await getProjectUpdates(projectSlug, locale);
  const href = `${project.href}/updates`;
  const notes = collectionSection(project.slug) === "notes";
  return (
    <ProjectPageShell activeHref={href} locale={locale} project={project}>
      <header className={styles.updatesHero}>
        <h1>{notes ? (locale === "zh" ? "笔记更新" : "Note updates") : (locale === "zh" ? "项目动态" : "Project updates")}</h1>
        <p>
          {locale === "zh"
            ? "里程碑、发布与关联内容，按时间倒序整理。"
            : "Milestones, releases, and associated publications in reverse chronological order."}
        </p>
      </header>
      {updates.length > 0 ? (
        <UpdateList locale={locale} updates={updates} />
      ) : (
        <p className={styles.emptyUpdates}>{locale === "zh" ? "暂无动态。" : "No updates yet."}</p>
      )}
    </ProjectPageShell>
  );
}

function ProjectPageShell({
  activeHref,
  children,
  locale,
  project
}: {
  activeHref: string;
  children: React.ReactNode;
  locale: ContentLocale;
  project: Project;
}) {
  return (
    <ProjectLayout locale={locale} navigation={<ProjectNavigation activeHref={activeHref} locale={locale} project={project} />}>
      {children}
    </ProjectLayout>
  );
}

function ProjectHeader({
  item,
  locale,
  project,
  summary,
  title
}: {
  item?: ProjectItem;
  locale: ContentLocale;
  project: Project;
  summary: string;
  title: string;
}) {
  if (collectionSection(project.slug) === "notes") {
    return <ArticleHeader
      title={title} summary={summary} updated={item?.updated ?? project.lastUpdated}
      minutes={readingMinutes(item?.content ?? project.overview.content)} locale={locale}
      breadcrumbs={[
        { label: locale === "zh" ? "笔记" : "Notes", href: localePath(locale, "/notes") },
        ...(item ? [{ label: project.name, href: project.href }] : [])
      ]}
    />;
  }
  return (
    <header className={styles.projectHero}>
      <h1>{title}</h1>
      <p>{summary}</p>
      <div className={styles.heroMeta}>
        <span>{project.status === "archived" ? (locale === "zh" ? "已归档" : "Archived") : (locale === "zh" ? "进行中" : "Active")}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={item?.updated ?? project.lastUpdated}>
          {locale === "zh" ? "更新于 " : "Updated "}
          {formatContentDate(item?.updated ?? project.lastUpdated, locale)}
        </time>
      </div>
    </header>
  );
}

function ProjectDirectory({ project }: { project: Project }) {
  return <ul className={styles.documentList}>{project.sections.flatMap(section => section.items.map(item =>
    <li key={item.slug}><Link href={item.href}><span>{item.title}</span><small>{section.label}</small></Link></li>
  ))}</ul>;
}

function InteractiveProjectItem({ item, locale }: { item: ProjectItem; locale: ContentLocale }) {
  const source = item.assetPath?.[locale];
  if (!source) return null;
  return (
    <section className={styles.interactive}>
      <div className={styles.interactiveIntro}>
        <div>{item.content}</div>
        <a href={source} rel="nofollow" target="_blank">
          {locale === "zh" ? "全屏打开 ↗" : "Open full screen ↗"}
        </a>
      </div>
      <iframe
        allow="fullscreen"
        className={styles.interactiveFrame}
        loading="lazy"
        sandbox="allow-scripts"
        src={source}
        title={item.title}
      />
    </section>
  );
}

function UpdateList({
  locale,
  updates
}: {
  locale: ContentLocale;
  updates: Awaited<ReturnType<typeof getProjectUpdates>>;
}) {
  return (
    <ol className={styles.updateList}>
      {updates.map((update) => (
        <li id={`${update.date}-${update.slug}`} key={`${update.date}-${update.slug}`}>
          <div className={styles.updateMeta}>
            <span>
              {update.type === "project"
                ? locale === "zh" ? "更新" : "Update"
                : update.type === "blog" ? "Blog" : "Demo"}
            </span>
            <time dateTime={update.date}>{formatContentDate(update.date, locale)}</time>
          </div>
          <h3>
            {update.type === "project" ? update.title : <Link href={update.href}>{update.title}</Link>}
          </h3>
          <p>{update.summary}</p>
          {update.content ? <div className={styles.updateBody}>{update.content}</div> : null}
        </li>
      ))}
    </ol>
  );
}

function ProjectRevision({
  locale,
  revision
}: {
  locale: ContentLocale;
  revision?: string;
}) {
  if (!revision) return null;
  return (
    <p className={styles.revision}>
      {locale === "zh" ? "源码审计版本" : "Reviewed against revision"}{" "}
      <code>{revision}</code>
    </p>
  );
}

export async function getProjectsIndexMetadata(locale: ContentLocale): Promise<Metadata> {
  const pathname = localePath(locale, "/projects");
  const title = "Projects";
  const description = locale === "zh"
    ? "围绕长期项目组织的稳定文档、源码导览与项目动态。"
    : "Stable documentation, source guides, and updates for long-running work.";
  return localizedMetadata(title, description, pathname, "/projects");
}

export async function getProjectMetadata(
  projectSlug: string,
  itemSlug: string | null,
  locale: ContentLocale,
  updates = false
): Promise<Metadata> {
  const project = await getProject(projectSlug, locale);
  if (!project) return { title: locale === "zh" ? "项目未找到" : "Project not found" };
  if (updates) {
    const title = locale === "zh" ? `${project.overview.title} 更新` : `${project.overview.title} Updates`;
    return localizedMetadata(title, locale === "zh" ? `${project.name} 更新与关联内容。` : `${project.name} updates and associated publications.`, `${project.href}/updates`, `${collectionPath(projectSlug)}/updates`);
  }
  const item = itemSlug ? await getProjectItem(projectSlug, itemSlug, locale) : null;
  if (itemSlug && !item) return { title: locale === "zh" ? "文档未找到" : "Document not found" };
  const title = item?.title ?? project.overview.title;
  const description = item?.summary ?? project.overview.summary;
  return localizedMetadata(title, description, item?.href ?? project.href, `${collectionPath(projectSlug)}${itemSlug ? `/${itemSlug}` : ""}`);
}

function localizedMetadata(
  title: string,
  description: string,
  pathname: string,
  unlocalizedPath: string
): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: pathname,
      languages: { en: unlocalizedPath, "zh-CN": `/zh${unlocalizedPath}` }
    },
    openGraph: {
      title,
      description,
      url: pathname,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${title} Open Graph Image` }]
    }
  };
}
