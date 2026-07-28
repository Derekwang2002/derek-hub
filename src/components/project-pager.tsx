import type { ContentLocale } from "../../lib/locale";
import type { ProjectPager as ProjectPagerValue } from "../../lib/projects";
import { ProjectPagerMarkup } from "./project-pager-markup";
import styles from "../app/projects/projects.module.css";

export function ProjectPager({
  locale,
  pager
}: {
  locale: ContentLocale;
  pager: ProjectPagerValue;
}) {
  return (
    <ProjectPagerMarkup
      classes={{
        pager: styles.pager,
        next: styles.pagerNext,
        previous: styles.pagerPrevious
      }}
      locale={locale}
      pager={pager}
    />
  );
}
