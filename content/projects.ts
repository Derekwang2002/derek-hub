import type { ProjectDefinition } from "../lib/projects";

export const projectDefinitions: ProjectDefinition[] = [
  {
    slug: "call-e",
    status: "active",
    overview: {
      updated: "2026-07-28",
      reviewedRevision: "b36ac02f"
    },
    sections: [
      { slug: "architecture", label: { en: "Architecture", zh: "架构" } },
      { slug: "runtime-traces", label: { en: "Runtime Traces", zh: "运行时追踪" } },
      { slug: "engineering", label: { en: "Engineering", zh: "工程实践" } },
      { slug: "explore", label: { en: "Explore", zh: "交互探索" } }
    ],
    items: [
      {
        slug: "technical-architecture",
        sectionSlug: "architecture",
        kind: "document",
        status: "published",
        updated: "2026-07-28",
        reviewedRevision: "b36ac02f"
      },
      {
        slug: "agentic-goal-architecture",
        sectionSlug: "architecture",
        kind: "document",
        status: "published",
        updated: "2026-07-28",
        reviewedRevision: "b36ac02f"
      },
      {
        slug: "commit-goal",
        sectionSlug: "runtime-traces",
        kind: "document",
        status: "published",
        updated: "2026-07-28",
        reviewedRevision: "b36ac02f"
      },
      {
        slug: "goal-iteration-runner",
        sectionSlug: "runtime-traces",
        kind: "document",
        status: "published",
        updated: "2026-07-28",
        reviewedRevision: "b36ac02f"
      },
      {
        slug: "voice-run-execution",
        sectionSlug: "runtime-traces",
        kind: "document",
        status: "published",
        updated: "2026-07-28",
        reviewedRevision: "b36ac02f"
      },
      {
        slug: "latency-optimization",
        sectionSlug: "engineering",
        kind: "document",
        status: "published",
        updated: "2026-07-28",
        reviewedRevision: "b36ac02f"
      },
      {
        slug: "development-plan",
        sectionSlug: "engineering",
        kind: "document",
        status: "published",
        updated: "2026-07-28",
        reviewedRevision: "b36ac02f"
      },
      {
        slug: "source-atlas",
        sectionSlug: "explore",
        kind: "interactive",
        status: "published",
        updated: "2026-07-28",
        reviewedRevision: "b36ac02f",
        assetPath: {
          en: "/projects/call-e/source-atlas/en/index.html",
          zh: "/projects/call-e/source-atlas/zh/index.html"
        }
      }
    ]
  }
];
