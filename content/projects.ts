import type { ProjectDefinition } from "../lib/projects";

export const projectDefinitions: ProjectDefinition[] = [
  {
    slug: "call-e",
    name: { en: "CALL-E", zh: "CALL-E" },
    summary: { en: "A voice agent for long-term goals.", zh: "面向长期目标的语音 Agent 运行时。" },
    status: "active",
    overview: {
      updated: "2026-08-21",
      reviewedRevision: "b36ac02f"
    },
    sections: [
      { slug: "product", label: { en: "Product", zh: "产品" } },
      { slug: "architecture", label: { en: "Architecture", zh: "架构" } },
      { slug: "runtime-traces", label: { en: "Runtime Traces", zh: "运行时追踪" } },
      { slug: "engineering", label: { en: "Engineering", zh: "工程实践" } },
      { slug: "explore", label: { en: "Explore", zh: "交互探索" } }
    ],
    items: [
      {
        slug: "goal-first-product-design",
        sectionSlug: "product",
        kind: "document",
        status: "published",
        updated: "2026-08-21",
        reviewedRevision: "calle-agentic-knowledge-transfer@2026-08-12"
      },
      {
        slug: "product-journeys",
        sectionSlug: "product",
        kind: "document",
        status: "published",
        updated: "2026-08-21",
        reviewedRevision: "calle-agentic-knowledge-transfer@2026-08-12"
      },
      {
        slug: "goal-lifecycle",
        sectionSlug: "product",
        kind: "document",
        status: "published",
        updated: "2026-08-21",
        reviewedRevision: "goal-lifecycle-prd@2026-08-13"
      },
      {
        slug: "iteration-playbook",
        sectionSlug: "product",
        kind: "document",
        status: "published",
        updated: "2026-08-21",
        reviewedRevision: "calle-agentic-knowledge-transfer@2026-08-12"
      },
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
        updated: "2026-08-21",
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
        updated: "2026-08-21",
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
  },
  {
    slug: "ai-intelligence",
    name: { en: "MATRIX", zh: "MATRIX" },
    summary: { en: "AI developments and long-term trends.", zh: "追踪 AI 进展与长期趋势。" },
    status: "active",
    overview: {
      updated: "2026-09-27",
      reviewedRevision: "matrix-v2-local-design@2026-09-27"
    },
    sections: [
      { slug: "methodology", label: { en: "Methodology", zh: "方法论" } },
      { slug: "product-design", label: { en: "Product & Design", zh: "产品与设计" } }
    ],
    items: [
      {
        slug: "incremental-radar",
        sectionSlug: "methodology",
        kind: "document",
        status: "published",
        updated: "2026-09-01",
        reviewedRevision: "00abc421"
      },
      {
        slug: "product-and-intelligence-design",
        sectionSlug: "product-design",
        kind: "document",
        status: "published",
        updated: "2026-09-27",
        reviewedRevision: "matrix-v2-local-design@2026-09-27"
      },
      {
        slug: "glass-interface-design",
        sectionSlug: "product-design",
        kind: "document",
        status: "published",
        updated: "2026-09-27",
        reviewedRevision: "matrix-neutral-glass-local@2026-09-27"
      }
    ]
  },
  {
    slug: "csci678",
    name: { en: "CSCI 678", zh: "CSCI 678" },
    summary: { en: "Theoretical ML notes and translations.", zh: "理论机器学习笔记与讲义翻译。" },
    status: "active",
    overview: {
      updated: "2026-09-17",
      reviewedRevision: "lecture4-notes@2026-09-17"
    },
    sections: [
      { slug: "lecture-notes", label: { en: "Lecture Notes", zh: "课程笔记" } }
    ],
    items: [
      {
        slug: "lecture-1-explanation",
        sectionSlug: "lecture-notes",
        kind: "document",
        status: "published",
        updated: "2026-09-14",
        reviewedRevision: "lecture1-explanation-report@2026-09-14"
      },
      {
        slug: "lecture-1-full-translation",
        sectionSlug: "lecture-notes",
        kind: "document",
        status: "published",
        updated: "2026-09-14",
        reviewedRevision: "lecture1-full-translation@2026-09-14"
      },
      {
        slug: "lecture-2-explanation",
        sectionSlug: "lecture-notes",
        kind: "document",
        status: "published",
        updated: "2026-09-14",
        reviewedRevision: "lecture2-explanation-report@2026-09-14"
      },
      {
        slug: "lecture-2-full-translation",
        sectionSlug: "lecture-notes",
        kind: "document",
        status: "published",
        updated: "2026-09-14",
        reviewedRevision: "lecture2-full-translation@2026-09-14"
      },
      {
        slug: "lecture-3-preview",
        sectionSlug: "lecture-notes",
        kind: "document",
        status: "published",
        updated: "2026-09-11",
        reviewedRevision: "lecture3-preview-report@2026-09-11"
      },
      {
        slug: "lecture-3-full-translation",
        sectionSlug: "lecture-notes",
        kind: "document",
        status: "published",
        updated: "2026-09-11",
        reviewedRevision: "lecture3-full-translation@2026-09-11"
      },
      {
        slug: "lecture-4-explanation",
        sectionSlug: "lecture-notes",
        kind: "document",
        status: "published",
        updated: "2026-09-17",
        reviewedRevision: "lecture4-explanation-report@2026-09-17"
      },
      {
        slug: "lecture-4-full-translation",
        sectionSlug: "lecture-notes",
        kind: "document",
        status: "published",
        updated: "2026-09-17",
        reviewedRevision: "lecture4-full-translation@2026-09-17"
      }
    ]
  },
  {
    slug: "derek-hub",
    name: { en: "Derek Hub", zh: "Derek Hub" },
    summary: { en: "Bilingual writing, projects, and demos.", zh: "双语博客、项目文档与交互演示。" },
    status: "active",
    overview: {
      updated: "2026-09-01",
      reviewedRevision: "2fdf7d7c"
    },
    sections: [
      { slug: "architecture", label: { en: "Architecture", zh: "架构" } }
    ],
    items: [
      {
        slug: "content-pipeline",
        sectionSlug: "architecture",
        kind: "document",
        status: "published",
        updated: "2026-09-01",
        reviewedRevision: "2fdf7d7c"
      }
    ]
  }
];
