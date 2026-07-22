import type { ReactNode } from "react";
import Image from "next/image";

import styles from "../app/page.module.css";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: "linkedin" },
  { label: "Email", href: "mailto:derekwang0282@gmail.com", icon: "email" }
] as const;

export async function HomeContent({ locale }: { locale: "en" | "zh" }) {
  const resume = RESUME[locale];
  return (
    <main className={styles.home} lang={locale === "zh" ? "zh-CN" : "en"}>
      <section className={styles.profile} aria-labelledby="home-title">
        <Image alt="Derek Wang" className={styles.avatar} height={112} priority sizes="112px" src="/avatar.png" width={112} />
        <h1 className={styles.name} id="home-title">Derek Wang</h1>
        <p className={styles.tagline}>USC CS37 / Programmer</p>
        <ul className={styles.socialList}>{SOCIAL_LINKS.map((link) => (
          <li key={link.label}><a href={link.href} rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"} target={link.href.startsWith("mailto:") ? undefined : "_blank"}><SocialIcon icon={link.icon} />{link.label}</a></li>
        ))}</ul>
      </section>
      <section className={styles.resume} aria-labelledby="resume-title">
        <div className={styles.resumeHeader}>
          <p>{locale === "zh" ? "个人简历" : "Resume"}</p>
          <span>{locale === "zh" ? "后端 · AI 工程" : "Backend · AI Engineering"}</span>
        </div>

        <ResumeSection title={resume.educationTitle}>
          {resume.education.map((item) => (
            <article className={styles.educationEntry} key={item.school}>
              <div className={styles.entryHeading}>
                <h3>{item.school}</h3>
                <time>{item.period}</time>
              </div>
              <p className={styles.entrySubline}>{item.degree} <span>{item.gpa}</span></p>
              <p className={styles.coursework}>{item.coursework}</p>
            </article>
          ))}
        </ResumeSection>

        <ResumeSection title={resume.experienceTitle}>
          <article className={styles.experienceEntry}>
            <div className={styles.entryHeading}>
              <h3>Takin.ai <span>{resume.role}</span></h3>
              <time>2024.8 — 2025.12</time>
            </div>
            <p className={styles.experienceIntro}>{resume.experienceIntro}</p>
            <p className={styles.techStack}>{resume.techStack}</p>
            <ul className={styles.achievementList}>
              {resume.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}
            </ul>
          </article>
        </ResumeSection>

        <ResumeSection title={resume.skillsTitle}>
          <dl className={styles.skillList}>
            {resume.skills.map(([label, values]) => <div key={label}><dt>{label}</dt><dd>{values}</dd></div>)}
          </dl>
        </ResumeSection>
      </section>
    </main>
  );
}

function SocialIcon({ icon }: { icon: (typeof SOCIAL_LINKS)[number]["icon"] }) {
  if (icon === "email") return <span aria-hidden="true" className={styles.socialGlyph}>@</span>;
  return <svg aria-hidden="true" className={styles.socialIcon} focusable="false" viewBox="0 0 16 16"><path d={icon === "github" ? GITHUB_MARK_PATH : LINKEDIN_MARK_PATH} /></svg>;
}

function ResumeSection({ children, title }: { children: ReactNode; title: string }) {
  return <section className={styles.resumeSection}>
    <h2>{title}</h2>
    {children}
  </section>;
}

const RESUME = {
  zh: {
    educationTitle: "教育背景",
    experienceTitle: "实习经历",
    skillsTitle: "专业技能",
    role: "后端开发实习生",
    education: [
      { school: "南加利福尼亚大学", degree: "计算机科学（硕士）", gpa: "GPA: 3.6 / 4.0", period: "2025.1 — 2027.5", coursework: "主修课程：算法分析、操作系统、数据库系统、信息检索" },
      { school: "西南财经大学", degree: "信息管理与信息系统（信息系统与数据管理方向）（学士）", gpa: "GPA: 3.9 / 4.0（6 / 60）", period: "2020.9 — 2024.6", coursework: "主修课程：数据结构、计算机网络、数据库原理、面向对象程序设计（Java）" }
    ],
    experienceIntro: "作为核心开发，负责内部运维 Agent 平台后端研发，将告警诊断端到端耗时从 15–30 分钟压缩至 60 秒内。",
    techStack: "技术栈：Java、Spring Boot、Spring AI、DashScope、Milvus、SSE、ReAct、Function Calling",
    achievements: [
      "三级 Agent 协作架构：基于 Plan-Execute-Replan 设计 Planner → Executor → Supervisor 协作链路；Supervisor 校验结果并触发自动重试与策略切换，在 200+ 条真实告警样本下将工具调用成功率从 70% 提升至 95%。",
      "Agentic RAG 检索优化：基于 Milvus 搭建内部知识库，融合 MQE 多路召回、小块检索与父块返回的双层索引、Reflection 结果校验与 query 改写；在 150 条内部问答评测集上，召回率提升约 25%，检索准确率从 65% 提升至 90%。",
      "Function Calling 工具框架：采用 Spring AI @Tool 注解与 ToolCallback 构建工具注册与路由层，支持运行时按意图匹配工具组合与热插拔；集成 Prometheus 查询、日志检索等工具，新增工具无需改动诊断链路。",
      "ReAct 推理链路：通过状态机增量解析 LLM 流式输出，实时拆解 Thought-Action-Observation 并经 SSE 推送前端；配合心跳保活与断连重试保障长连接稳定性，推理 trace 全量落库支持 Bad Case 分析。"
    ],
    skills: [["语言", "Java、Python、SQL"], ["后端框架", "Spring Boot、Spring AI、Spring Security、MyBatis"], ["中间件", "Redis、Kafka、Elasticsearch、MySQL、Milvus"], ["AI 工程", "RAG、Function Calling、ReAct"]]
  },
  en: {
    educationTitle: "Education",
    experienceTitle: "Experience",
    skillsTitle: "Technical Skills",
    role: "Backend Engineering Intern",
    education: [
      { school: "University of Southern California", degree: "M.S. in Computer Science", gpa: "GPA: 3.6 / 4.0", period: "Jan 2025 — May 2027", coursework: "Coursework: Analysis of Algorithms, Operating Systems, Database Systems, Information Retrieval" },
      { school: "Southwestern University of Finance and Economics", degree: "B.S. in Information Management and Information Systems", gpa: "GPA: 3.9 / 4.0 (6 / 60)", period: "Sep 2020 — Jun 2024", coursework: "Coursework: Data Structures, Computer Networks, Database Principles, Object-Oriented Programming (Java)" }
    ],
    experienceIntro: "Core backend contributor for an internal operations Agent platform, reducing end-to-end alert diagnosis from 15–30 minutes to under 60 seconds.",
    techStack: "Stack: Java, Spring Boot, Spring AI, DashScope, Milvus, SSE, ReAct, Function Calling",
    achievements: [
      "Three-tier Agent collaboration: designed a Planner → Executor → Supervisor flow around Plan-Execute-Replan. Supervisor validation triggers automatic retries and strategy changes, increasing tool-call success from 70% to 95% across 200+ production alert samples.",
      "Agentic RAG retrieval: built an internal knowledge base on Milvus with MQE multi-path recall, child-chunk retrieval with parent-chunk returns, Reflection validation, and query rewriting. On 150 internal Q&A evaluations, recall improved by about 25% and retrieval accuracy rose from 65% to 90%.",
      "Function Calling framework: built a registration and routing layer with Spring AI @Tool and ToolCallback, enabling intent-based tool composition and hot-plugging. Integrated Prometheus queries and log search without changing the diagnostic flow for each new tool.",
      "ReAct reasoning flow: incrementally parsed streamed LLM output with a state machine, delivered Thought-Action-Observation events through SSE, and persisted complete traces for Bad Case analysis while using heartbeats and reconnects for stable long-lived connections."
    ],
    skills: [["Languages", "Java, Python, SQL"], ["Backend", "Spring Boot, Spring AI, Spring Security, MyBatis"], ["Infrastructure", "Redis, Kafka, Elasticsearch, MySQL, Milvus"], ["AI Engineering", "RAG, Function Calling, ReAct"]]
  }
} as const;

const GITHUB_MARK_PATH = "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A6.93 6.93 0 0 1 8 3.36c.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z";
const LINKEDIN_MARK_PATH = "M0 1.15C0 .51.53 0 1.18 0h13.64C15.47 0 16 .51 16 1.15v13.7c0 .64-.53 1.15-1.18 1.15H1.18C.53 16 0 15.49 0 14.85V1.15zm4.94 12.24V6.17h-2.4v7.22h2.4zM3.74 5.18c.84 0 1.36-.55 1.36-1.25-.02-.7-.52-1.24-1.34-1.24-.82 0-1.36.54-1.36 1.24 0 .7.52 1.25 1.33 1.25h.01zm4.91 8.21V9.36c0-.22.02-.43.08-.59.17-.43.57-.87 1.23-.87.87 0 1.22.66 1.22 1.63v3.86h2.4V9.25c0-2.22-1.18-3.25-2.76-3.25-1.27 0-1.85.7-2.17 1.19v.03h-.02l.02-.03V6.17h-2.4c.03.68 0 7.22 0 7.22h2.4z";
