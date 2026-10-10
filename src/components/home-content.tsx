import Image from "next/image";
import { localePath, type ContentLocale } from "../../lib/locale";
import { ContactLinks } from "./contact-links";
import { ProfileName } from "./profile-name";
import { RESUME } from "./profile-data";
import styles from "../app/page.module.css";

const STACK = [
  { label: { zh: "编程语言", en: "Languages" }, items: [
    { name: "Python", icon: "python" }, { name: "Java", icon: "openjdk" }
  ] },
  { label: { zh: "后端开发", en: "Backend" }, items: [
    { name: "FastAPI", icon: "fastapi" }, { name: "Spring Boot", icon: "springboot" },
    { name: "Spring Security", icon: "spring" }, { name: "SQLAlchemy" }, { name: "MyBatis" }, { name: "Pydantic" }
  ] },
  { label: { zh: "AI 工程", en: "AI engineering" }, items: [
    { name: "OpenAI Agents SDK" }, { name: "Spring AI", icon: "spring" },
    { name: "RAG" }, { name: "Function Calling" }, { name: "ReAct" }
  ] },
  { label: { zh: "数据与查询", en: "Data & querying" }, items: [
    { name: "SQL" },
    { name: "PostgreSQL", icon: "postgresql" }, { name: "MySQL", icon: "mysql" },
    { name: "Redis", icon: "redis" }, { name: "Elasticsearch", icon: "elasticsearch" }, { name: "Milvus" }
  ] },
  { label: { zh: "消息与任务", en: "Messaging & jobs" }, items: [
    { name: "Kafka", icon: "apachekafka" }, { name: "RabbitMQ", icon: "rabbitmq" }, { name: "Taskiq" }
  ] }
] satisfies Array<{ label: Record<ContentLocale, string>; items: Array<{ name: string; icon?: string }> }>;

export function AboutContent({ locale }: { locale: ContentLocale }) {
  const zh = locale === "zh";
  const resume = RESUME[locale];
  return (
    <main className={styles.about} lang={zh ? "zh-CN" : "en"}>
      <header className={styles.intro}>
        <h1>{zh ? "关于我" : "About me"}</h1>
        <p>{zh ? "我是 " : "I’m "}<ProfileName showPortrait={false} href={localePath(locale, "/")} title={zh ? "首页" : "Home"} />{zh ? "，南加利福尼亚大学计算机科学硕士在读，主要做 AI Agent 与后端开发。" : ", a computer science master’s student at the University of Southern California. I work on AI agents and backend systems."}</p>
        <p>{zh ? "参与过语音外呼和运维 Agent 的开发，关注任务执行、工具调用与系统可靠性。这里记录我的学习笔记和工程实践。" : "I’ve worked on voice and operations agents, with a focus on task execution, tool use, and system reliability. This site holds my study notes and engineering work."}</p>
        <ContactLinks locale={locale} />
      </header>

      <section className={styles.section} aria-labelledby="education">
        <h2 id="education">{resume.educationTitle}</h2>
        {resume.education.map((item) => (
          <article className={styles.education} key={item.school}>
            <Image alt="" src={item.logo} width={40} height={40} />
            <div>
              <div className={styles.entryHeading}><h3>{item.school}</h3><time>{item.period}</time></div>
              <p>{item.degree}</p>
              <p className={styles.coursework}>{item.coursework}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.section} aria-labelledby="experience">
        <h2 id="experience">{resume.experienceTitle}</h2>
        {resume.experience.map((job) => (
          <article className={styles.entry} key={job.company}>
            <div className={styles.entryHeading}>
              <h3>{"companyHref" in job ? <a className={styles.resumeLink} href={job.companyHref} target="_blank" rel="noreferrer">{job.company}</a> : job.company}{" "}<span>{job.role}</span></h3>
              <time>{job.period}</time>
            </div>
            <div className={styles.experienceContent}>
              <p>{renderInlineText(job.intro)}</p>
              <p className={styles.techNote}>{job.techStack}</p>
              <ul>{job.achievements.map((achievement) => <li key={achievement}>{renderInlineText(achievement)}</li>)}</ul>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.section} aria-labelledby="tech-stack">
        <h2 id="tech-stack">{zh ? "技术栈" : "Tech stack"}</h2>
        <dl className={styles.stack}>
          {STACK.map((group) => (
            <div className={styles.stackGroup} key={group.label.en}>
              <dt>{group.label[locale]}</dt>
              <dd><ul>{group.items.map((item) => (
                <li key={item.name}>
                  {"icon" in item ? <Image alt="" aria-hidden src={`/tech/${item.icon}.svg`} width={15} height={15} /> : null}
                  {item.name}
                </li>
              ))}</ul></dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}

function renderInlineText(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https:\/\/[^)]+\))/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    const link = /^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/.exec(part);
    return link ? <a className={styles.resumeLink} href={link[2]} key={index} target="_blank" rel="noreferrer">{link[1]}</a> : part;
  });
}
