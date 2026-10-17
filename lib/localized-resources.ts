import type { ContentLocale } from "./locale";
import { getResourcesBySection, type ResourceSection } from "./resources";
import type { Resource } from "../content/resources";

const ENGLISH_COPY: Record<string, Pick<Resource, "title" | "description">> = {
  "/dev-test-uat-prod/index.html": {
    title: "dev -> test -> uat -> prod",
    description: "The release flow from development to production."
  },
  "/docker-runtime/index.html": {
    title: "Docker Runtime Visual Explainer",
    description: "Docker builds, isolation, and networking in motion."
  },
  "/leetcode-cookbook/skiplist-explained.html": {
    title: "Skip List Visual Explainer",
    description: "Skip list search, insertion, and complexity."
  },
  "/leetcode-cookbook/lru-cache-explained.html": {
    title: "LRU Cache Visual Explainer",
    description: "LRU caching with a hash map and linked list."
  },
  "/hub/skills/agent-eval": {
    title: "Agent Eval Skill",
    description: "Code review with bounded reviewer/fixer loops."
  },
  "/hub/skills/sync-post-localizations": {
    title: "Sync Post Localizations Skill",
    description: "Sync multilingual posts and publishing links."
  }
};

export async function getLocalizedResourcesBySection(section: ResourceSection, locale: ContentLocale): Promise<Resource[]> {
  const resources = await getResourcesBySection(section);
  if (locale === "zh") return resources;
  return resources.map((resource) => ({ ...resource, ...(ENGLISH_COPY[resource.href] ?? {}) }));
}

export function localizeResource(resource: Resource, locale: ContentLocale): Resource {
  return locale === "en" ? { ...resource, ...(ENGLISH_COPY[resource.href] ?? {}) } : resource;
}
