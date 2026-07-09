import type {
  MarkdownCollectionSource,
  MarkdownSource
} from "../lib/markdown-sources";

export type BlogPostSource = {
  slug: string;
  source: MarkdownSource;
};

export type BlogPostCollection = {
  source: MarkdownCollectionSource;
};

export const blogPostSources = [] satisfies BlogPostSource[];

export const blogPostCollections = [] satisfies BlogPostCollection[];
