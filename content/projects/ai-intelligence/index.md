---
title: "AI Intelligence Radar"
summary: "由 AI agent 驱动的本地增量式 AI 情报知识库：把分散的公开信息加工为 Events → Signals → Trends → Decisions，长期沉淀为技术决策依据。"
---

AI Intelligence Radar 不是一个 AI 新闻聚合器。它由 AI coding agent 周期性驱动，持续追踪 AI 模型、Agent、AI Engineering、开源生态、研究、基础设施与开发者工具领域的重要变化，把官方博客、release notes、GitHub、Hugging Face 与论文原文中的一手信息加工为结构化事件、评分、日报与趋势。代码与全部数据都在 [GitHub 仓库](https://github.com/Derekwang2002/ai-intelligence)中；只读站点由 Astro 构建，发布在 [GitHub Pages](https://derekwang2002.github.io/ai-intelligence/)。

本文内容依据仓库 `main` 分支 revision `00abc421` 的 README 与目录结构整理。

## 1. 一条加工链路

```text
公开一手来源
  → Events（结构化事件，带六维评分与雷达推荐）
  → Signals（跨运行去重索引累积出的信号）
  → Trends（有生命周期管理的趋势判定）
  → Decisions（ADOPT / TRIAL / WATCH / IGNORE）
```

单个新闻不构成趋势。趋势至少需要多个独立信号：时间持续性、多主体参与、技术收敛、真实 adoption signal 或已发生的工程影响；证据不足时明确写"本周期没有发现证据充分的新趋势"。

## 2. 六条核心原则

| 原则 | 含义 |
|---|---|
| Signal > Noise | 宁可漏掉一般新闻，也不产生低质量内容 |
| Primary Source > Secondary Reporting | 优先官方博客、release notes、GitHub、Hugging Face、论文原文 |
| Engineering Value > Hype | 关注对架构、成本、延迟、可靠性、开发工作流的实际影响 |
| Impact > Popularity | 转载量和讨论热度本身不构成价值 |
| Incremental Scan > Repeated Full Scan | 每次运行只处理新增信息 |
| Historical Evidence > Single-event Speculation | 趋势必须有多日期、多主体的独立证据支撑 |

## 3. 知识库布局

```text
ai-intelligence/
├── AGENTS.md          # agent 执行规则（增量扫描、去重、评分、持久化、checkpoint）
├── TASK.md            # 单次增量扫描任务说明
├── state.json         # 运行状态与 checkpoint（last_successful_run_at）
├── config/radar.yaml  # 时间窗口、来源分级、关注领域、评分维度、趋势规则
├── events/            # 结构化事件，按事件实际发布日期归属
├── daily/             # 中文日报（当日累计，多次运行合并到同一份）
├── trends/            # 趋势快照与 current.md（追踪中趋势的生命周期状态）
├── index/events.json  # 跨运行事件索引（去重 + 趋势分析）
├── logs/              # 失败日志与恢复信息
└── site/              # 只读静态网站（Astro）：雷达 / 时间线 / 趋势 / 日报
```

## 4. 运行机制

项目设计为由 AI coding agent 执行：agent 读取 `TASK.md`，按 `AGENTS.md` 与 `config/radar.yaml` 的规则执行一次增量扫描，产出事件、日报与趋势更新；只有全部步骤成功并通过校验后，才推进 `state.json` 中的 checkpoint。配合 cron 等定时任务按固定间隔触发，即可持续积累。所有可调参数集中在 `config/radar.yaml`：时间窗口与 overlap、来源分级（Tier 1 官方来源 → Tier 4 社区信号）、关注清单、评分维度与质量门禁。

## 5. 怎样继续阅读

机制细节由[增量扫描、Checkpoint 与趋势判定](/zh/projects/ai-intelligence/incremental-radar)展开：扫描窗口如何推导、失败如何恢复、事件如何去重打分、趋势如何获得生命周期。项目动态集中在 [Updates](/zh/projects/ai-intelligence/updates)。
