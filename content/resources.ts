import type {
  MarkdownCollectionSource,
  MarkdownSource
} from "../lib/markdown-sources";

export type ResourceType = "skill" | "demo";

export type ResourceStatus = "public" | "unlisted" | "draft";

export type Resource = {
  title: string;
  description: string;
  type: ResourceType;
  href: string;
  docSource?: MarkdownSource;
  tags: string[];
  date?: string;
  status: ResourceStatus;
  featured?: boolean;
};

export type ResourceCollectionOverride = Partial<
  Pick<Resource, "title" | "description" | "tags" | "date" | "status" | "featured">
>;

export type ResourceCollection = {
  type: ResourceType;
  hrefPrefix: string;
  source: MarkdownCollectionSource;
  tags: string[];
  status: ResourceStatus;
  date?: string;
  featured?: boolean;
  overrides?: Record<string, ResourceCollectionOverride>;
};

export const resources = [
  {
    title: "数据结构可视化讲解",
    description: "Skip List 与 LRU Cache 的交互式讲解入口，包含动态演示、实现代码和工程取舍。",
    type: "demo",
    href: "/leetcode-cookbook/",
    tags: ["algorithm", "data-structure", "visualization", "leetcode"],
    status: "public",
    featured: true
  },
  {
    title: "Skip List 跳表讲解",
    description: "交互式解释跳表的搜索、插入、层高和复杂度。",
    type: "demo",
    href: "/leetcode-cookbook/skiplist-explained.html",
    tags: ["algorithm", "data-structure", "visualization"],
    status: "public",
    featured: true
  }
] satisfies Resource[];

export const resourceCollections = [
  {
    type: "skill",
    hrefPrefix: "/hub/skills",
    source: {
      type: "githubFolder",
      repository: "Derekwang2002/skills",
      branch: "main",
      path: "docs"
    },
    tags: ["codex", "skill"],
    date: "2026-07-08",
    status: "public",
    overrides: {
      "agent-eval": {
        title: "Agent Eval Skill",
        description: "用于 reviewer/fixer 循环的 Codex skill。",
        tags: ["codex", "skill", "automation"]
      }
    }
  }
] satisfies ResourceCollection[];
