export const RESUME = {
  zh: {
    educationTitle: "教育背景",
    experienceTitle: "实习经历",
    skillsTitle: "专业技能",
    education: [
      { school: "南加利福尼亚大学", logo: "/schools/usc-seal.svg", degree: "计算机科学（硕士）", gpa: "GPA: 3.6 / 4.0", period: "2025.1 — 2027.5", coursework: "主修课程：算法分析、操作系统、数据库系统、信息检索" },
      { school: "西南财经大学", logo: "/schools/swufe-logo.svg", degree: "信息管理与信息系统（信息系统与数据管理方向）（学士）", gpa: "GPA: 3.9 / 4.0（6 / 60）", period: "2020.9 — 2024.6", coursework: "主修课程：数据结构、计算机网络、数据库原理、面向对象程序设计（Java）" }
    ],
    experience: [
      {
        company: "AI Rudder",
        companyHref: "https://airudder.com/",
        role: "Agent 开发实习生",
        period: "2026.6 — 2026.9",
        intro: "参与 [CALL-E](https://www.heycall-e.com/) goal-oriented 语音外呼 Agent 运行时的核心链路设计与开发，负责[开源社区](https://github.com/CALLE-AI/call-e-integrations)的生态搭建，系统服务 1w+ 线上用户。",
        techStack: "技术栈：Python、FastAPI、OpenAI Agents SDK、PostgreSQL、Redis、RabbitMQ、Taskiq、Pydantic、SSE",
        achievements: [
          "**多角色 Agent 边界与副作用确认门：**MainAgent 持有用户会话（单 Foreground Turn 串行化），GoalAgent 经独立 goal-scoped session 持有长任务生命周期，两者仅通过 Runtime 的 typed event 通信，禁用 SDK handoff / agent-as-tool；外呼等真实副作用 100% 经结构化 Goal Confirmation 确认门（spec 级不变量），授权主体由服务端持有并重新校验，杜绝模型伪造授权。",
          "**Goal → RunSpec → Run 持久化执行模型：**Goal 持有不可变、版本单调递增的 RunSpec，Run 负责确定精确版本与输入快照；终态 Goal Status 与 Goal Result（summary + evidence_refs）在同一 PostgreSQL 事务（Durable Boundary）原子提交，commit 后才经 Redis Streams 做 SSE 实时投递，支撑 1w+ 用户的会话与结果投递，丢失或重复不影响正确性。",
          "**Execution Lease fencing 与 Provider Reconciliation：**Taskiq worker 以带单调递增 fencing epoch 的 Execution Lease 认领任务，durable write 前精确比对 lease 身份，隔离僵尸 worker；外呼提交结果不确定时按稳定 provider task name 做 Provider Reconciliation 而非盲目重拨，worker 故障恢复路径的重复外呼降为 0（机制保证）。"
        ]
      },
      {
        company: "Takin.ai",
        role: "后端开发实习生",
        period: "2024.8 — 2025.12",
        intro: "负责内部运维 Agent 平台后端研发，将告警诊断端到端耗时从 15–30 分钟**压缩至 60 秒内**。",
        techStack: "技术栈：Java、Spring Boot、Spring AI、DashScope、Milvus、ReAct、Function Calling、SSE",
        achievements: [
          "**三级 Agent 协作架构：**基于 Plan-Execute-Replan 范式设计 Planner → Executor → Supervisor 协作链路；Supervisor 校验结果并触发自动重试与策略切换，在 200+ 条真实告警样本下将工具调用成功率从 **70% 提升至 95%**。",
          "**Agentic RAG 检索优化：**搭建基于 Milvus 的内部知识库，融合 MQE 多路召回、小块检索与父块返回的双层索引、Reflection 结果校验与 query 改写；在 150 条内部问答评测集上，召回率提升约 25%，检索准确率从 **65% 提升至 90%**。"
        ]
      }
    ],
  },
  en: {
    educationTitle: "Education",
    experienceTitle: "Experience",
    skillsTitle: "Technical Skills",
    education: [
      { school: "University of Southern California", logo: "/schools/usc-seal.svg", degree: "M.S. in Computer Science", gpa: "GPA: 3.6 / 4.0", period: "Jan 2025 — May 2027", coursework: "Coursework: Analysis of Algorithms, Operating Systems, Database Systems, Information Retrieval" },
      { school: "Southwestern University of Finance and Economics", logo: "/schools/swufe-logo.svg", degree: "B.S. in Information Management and Information Systems", gpa: "GPA: 3.9 / 4.0 (6 / 60)", period: "Sep 2020 — Jun 2024", coursework: "Coursework: Data Structures, Computer Networks, Database Principles, Object-Oriented Programming (Java)" }
    ],
    experience: [
      {
        company: "AI Rudder",
        companyHref: "https://airudder.com/",
        role: "Agent Engineering Intern",
        period: "Jun 2026 — Sep 2026",
        intro: "Contributed to the core execution paths of the [CALL-E](https://www.heycall-e.com/) goal-oriented outbound voice Agent runtime, serving 10k+ online users. Built its [open-source community ecosystem](https://github.com/CALLE-AI/call-e-integrations).",
        techStack: "Stack: Python, FastAPI, OpenAI Agents SDK, PostgreSQL, Redis, RabbitMQ, Taskiq, Pydantic, SSE",
        achievements: [
          "**Multi-role Agent boundaries and side-effect gates:** MainAgent owns the user chat session (serialized to a single Foreground Turn), while GoalAgent owns long-task lifecycles through an independent goal-scoped session; the two communicate only through Runtime typed events — no SDK handoff or agent-as-tool calls. 100% of real side effects such as outbound calls pass a structured Goal Confirmation gate (a spec-level invariant), with the authorization subject held and re-validated server-side, preventing model-forged authorization.",
          "**Goal → RunSpec → Run durable execution model:** Goals own immutable, monotonically versioned RunSpecs, and each Run determines the exact version and input snapshot. The terminal Goal Status and Goal Result (summary + evidence_refs) commit atomically in one PostgreSQL transaction (the Durable Boundary); SSE live delivery over Redis Streams happens only after commit, so lost or duplicated delivery never affects correctness for 10k+ users.",
          "**Execution Lease fencing and Provider Reconciliation:** Taskiq workers claim work with leases carrying monotonically increasing fencing epochs, verified exactly on every durable write to fence off zombie workers. Uncertain call submissions are resolved through Provider Reconciliation against a stable provider task name instead of blind redial, driving duplicate calls on the worker-failure recovery path to zero (guaranteed by design)."
        ]
      },
      {
        company: "Takin.ai",
        role: "Backend Engineering Intern",
        period: "Aug 2024 — Dec 2025",
        intro: "Developed the backend for an internal operations Agent platform, reducing end-to-end alert diagnosis **from 15–30 minutes to under 60 seconds**.",
        techStack: "Stack: Java, Spring Boot, Spring AI, DashScope, Milvus, ReAct, Function Calling, SSE",
        achievements: [
          "**Three-tier Agent collaboration:** designed a Planner → Executor → Supervisor flow using the Plan-Execute-Replan pattern. Supervisor validation triggers automatic retries and strategy changes, increasing tool-call success **from 70% to 95%** across 200+ production alert samples.",
          "**Agentic RAG retrieval:** built an internal knowledge base on Milvus with MQE multi-path recall, child-chunk retrieval with parent-chunk returns, Reflection validation, and query rewriting. On 150 internal Q&A evaluations, recall improved by about 25% and retrieval accuracy rose **from 65% to 90%**."
        ]
      }
    ],
  }
} as const;
