import type { ContentLocale } from "../../lib/locale";
import type { ProjectStatus } from "../../lib/projects";
import styles from "../app/projects/projects.module.css";

export function ProjectStatusBadge({ status, locale }: { status: Exclude<ProjectStatus, "draft">; locale: ContentLocale }) {
  const archived = status === "archived";
  const label = archived ? (locale === "zh" ? "已归档" : "Archived") : (locale === "zh" ? "进行中" : "Active");
  return <span className={styles.projectStatus} data-status={status} aria-label={label} title={label}>
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {archived ? <><path d="M4 7v9h12V7M3 4h14v3H3zM8 10h4" /></> : <><circle cx="10" cy="10" r="7" strokeDasharray="31 13" transform="rotate(-90 10 10)" /><path d="M10 6v4l3 2" /></>}
    </svg><span aria-hidden="true">{label}</span>
  </span>;
}
