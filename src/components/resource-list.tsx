"use client";

import Link from "next/link";
import {
  getResourceTypeLabel,
  isExternalResourceHref
} from "../../lib/resource-display";
import type { Resource } from "../../content/resources";
import styles from "./resource-list.module.css";

type ResourceListProps = {
  resources: Resource[];
  locale?: "en" | "zh";
  title?: string;
  emptyMessage: string;
};

export function ResourceList({
  resources,
  locale = "en",
  title,
  emptyMessage
}: ResourceListProps) {
  return (
    <section className={styles.section} aria-label={title ?? "Resources"}>
      {title ? (
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <span className={styles.count}>{resources.length}</span>
        </div>
      ) : null}

      {resources.length === 0 ? (
        <p className={styles.emptyState}>{emptyMessage}</p>
      ) : (
        <ul className={styles.list}>
          {resources.map((resource) => (
            <li className={`row-highlight ${styles.item}`} key={`${resource.type}-${resource.href}`}>
              <div className={styles.itemContent}>
                <ResourceLink locale={locale} resource={resource} />
                <p className={styles.description}>{resource.description}</p>
              </div>
              <ResourceMeta locale={locale} resource={resource} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ResourceLink({ locale, resource }: { locale: "en" | "zh"; resource: Resource }) {
  const external = isExternalResourceHref(resource.href);

  if (external) {
    return (
      <a className={styles.resourceLink} href={resource.href} rel="noreferrer" target="_blank">
        {resource.title}
      </a>
    );
  }

  if (resource.type === "demo") {
    return (
      <a className={styles.resourceLink} href={resource.href}>
        {resource.title}
        <svg aria-hidden="true" className={styles.demoMark} fill="none" viewBox="0 0 24 24">
          <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </a>
    );
  }

  return (
    <Link className={styles.resourceLink} href={`${locale === "zh" ? "/zh" : ""}${resource.href}`}>
      {resource.title}
    </Link>
  );
}

function ResourceMeta({ locale, resource }: { locale: "en" | "zh"; resource: Resource }) {
  return (
    <div className={styles.meta}>
      <span className="meta-badge">{locale === "zh" && resource.type === "demo" ? "演示" : getResourceTypeLabel(resource.type)}</span>

      {resource.date ? (
        <time className={styles.metaDate} dateTime={resource.date}>
          {resource.date}
        </time>
      ) : null}
    </div>
  );
}
