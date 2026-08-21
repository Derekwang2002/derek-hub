---
title: "CALL-E Agentic Runtime 开发状态与下一步"
summary: "把原六周计划与 revision b36ac02f 的实现对照，区分已经落地、方向变化和仍需完成的工程工作。"
---

原六周计划记录了 CALL-E 从一次电话工具走向持久 Agentic Runtime 的方向。revision `b36ac02f` 已经越过其中多个里程碑，也改变了部分实现路径。本页不再把旧时间表当作未来承诺，而是把它转换成当前状态与下一步清单。

## 0. 2026-08-12 产品侧基线

知识转移文档 `docs/calle-agentic-knowledge-transfer.md`（基线 2026-08-12）给出了本页之外的几个重要状态修正：

- **当前规模**：长期 Agent 3 个（MainAgent、OutboundGoalAgent、InboundGoalAgent），Subagent 1 个（CallOutcomeJudge），Skill 7 个（6 个生产可用，`collection-strategy` 为 demo 所建、spec 仍是 Draft），Tool 28 个（受保护 2 个：`submit_voice_run`、`bind_hotline`）。Agentic 侧 Instruction 6 个文件 / 352 行；Voice Runtime 另有 11 个文件 / 603 行。模型配置为 gpt-5.6-sol、reasoning=medium。
- **一次确认覆盖多个拨打槽位的自动续拨仍不是生产能力**。今天是 GoalAgent 复盘 → 给建议 → 用户一句话确认 → 复用同一个 Goal 再打；`goal-call-strategy` spec 仍在草稿。
- **可复用 Published Goal 与对外 API 是 Draft**。`publish_goal_run_spec` 发布契约、`POST /v1/goals/{goal_id}/runs` 触发契约（`goal-runs-developer-api-sdk`、`outbound-goal-builder`、`goal-published-run-spec`）均未冻结。
- **评测工具还没有**。`src/calle/agentic/evals/` 只有单测 fixture，没有 runner 和 golden set；「领域评测」「Journey 测试」目前全部人工执行。Simulation 不能顶替回归门槛。
- **Domain DRI 全部空缺**。7 个 Skill、1 个 Judge 的 rubric、版本和效果均无人认领——没有 DRI 就没有上线门槛。
- **其余 Draft 清单**：`batch-outbound` / `rungroup-execution-envelope`（批量外呼）、`response-language-boundaries`（恢复后回复语言）、`calle-web-inbound-number-binding`（Web 端 Inbound 绑定）、`inbound-onboarding-live-progress`（onboarding 实时进度）、`call-e-agentic-memory-policy`（跨任务记忆）、`simulation-bounded-concurrency`（演练有界并发）。
- **开发者旅程 PRD（2026-08-13）**给出了 Goal 从创建、Simulation、Live Test、真实呼叫测试到 API 集成与生产后改进的 P0–P3 任务拆分与验收标准，见 [Goal 的生命周期](/zh/projects/call-e/goal-lifecycle)。其中 Live Test 闭环与 API 交付标为 P3，与「Published Goal 契约仍是 Draft」的实现状态一致。
- Goal 生命周期为 draft / active / paused / retired，visibility 为 hidden / listed。

## 状态总览

| 原阶段 | 当前状态 | 说明 |
|---|---|---|
| W1 Runtime Foundation | 已落地 | Goal、Event、Session、Workspace、MainAgent 和持续 iteration 已形成 |
| W2 Outbound One-shot Wrapper | 已替代 | 当前使用原生 RunSpec/Run/VoiceRunExecutor，不再以旧 one-shot wrapper 作为目标架构 |
| W3 Retrieval + Strategy | 部分落地 | Workspace input、上传内容、不可变 RunSpec 已有；通用 retrieval/strategy 学习仍不完整 |
| W4 Simulation + Inbound | 已形成可运行闭环 | SimulationRunner、inbound candidate、approval 与 hotline binding 已存在 |
| W5 Report + HITL | 部分落地 | 版本化 Report 与 evidence 已有；通用 ChangeProposal/策略审批闭环仍待建设 |
| W6 E2E Hardening | 持续进行 | 行为测试、Tracing、权限边界已有较大覆盖，发布治理仍需长期维护 |

## 1. 已落地：持久 Goal Runtime

当前实现已经具备：

- MainAgent 根据 outbound/inbound planner skill 生成 `GoalBrief`；
- Goal、Goal Event 与 Dispatch cursor 的持久模型；
- iteration claim、lease、增量事件消费和恢复；
- 受控 Workspace、上传内容和 evidence refs；
- durable Session Event、实时 fan-out 与客户端 read model；
- GoalAgent 的 outbound/inbound 分工与 context delivery。

因此，原计划中的 “Operation State” 已被更明确的 Goal、Run 和 Report 领域对象取代。系统不再把一个通用 Operation JSON 当作全部真相。

## 2. 已替代：从 one-shot wrapper 到原生 Run

旧计划希望把 `plan_call / run_call / get_call_run` 包进 Agent 生命周期。当前主链路已经采用：

```text
GoalAgent
  → create_run_spec
  → submit_voice_run
  → CalleRunRegistry
  → VoiceRunExecutor
  → Run Event / Evidence
```

这不是简单重命名。RunSpec 冻结执行定义，Run/RunGroup 表达真实尝试，终态事件再唤醒 Goal。旧 one-shot 能力仍可作为独立产品路径存在，但不再决定 Agentic Runtime 的领域模型。

## 3. 已落地：Simulation 与 Inbound 上线门

当前 `SimulationRunner` 支持有界文本 rehearsal：

- 冻结候选 RunSpec、persona、ScenarioSuite 与 ground truth；
- 为 trial 建立稳定身份并保存 evidence；
- 通过 judge 生成 risk、coverage、blocker 与建议；
- 提交 canonical SimulationReport；
- 将终态写入 Goal 与 Session Event。

Inbound onboarding 在此基础上增加候选检查、人工 approval、号码选择和 hotline binding。真实号码绑定不应绕过 simulation 与授权边界。

## 4. 已落地：版本化 Report

GoalAgent 在 Workspace 中生成报告 artifact，`commit_report` 校验：

- artifact 必须位于当前 Goal 的允许目录；
- Markdown 必须存在；
- JSON 若存在则满足选定 schema；
- subject identity、version 与 lineage 一致；
- evidence refs 可以追溯。

Report commit 产生持久记录和 Goal Event，再通过 context delivery 回到用户 Session。这已经覆盖原计划中“报告不能只是聊天文本”的核心要求。

## 5. 部分落地：Retrieval 与策略层

上传内容、Workspace refs、RunSpec input refs 和 planner skills 已经提供了受控输入路径，但以下能力仍不应宣称完成：

- 通用、可评估的 retrieval pipeline；
- historical case 与 playbook 的稳定召回协议；
- 跨多次 Run 的策略效果比较；
- 可复用 Voice Artifact 的完整生命周期；
- 自动生成但受治理的 Strategy Version。

下一步应先定义检索证据、版本身份和离线评估，再增加自动化；不能让模型把未经记录的上下文直接写进 Prompt。

## 6. 仍需建设：ChangeProposal 与治理闭环

当前代码有用户确认、inbound approval、状态约束和审计 Event，但原 W5 描述的通用策略变更闭环仍不完整：

```text
Report finding
  → ChangeProposal
  → human approve / reject / edit
  → new Strategy or RunSpec lineage
  → measured rollout
```

这项能力需要独立的身份、diff、证据引用、审批状态和回滚语义。它不应通过直接修改 active Prompt 来模拟。

### W5 要求的完整结果

W5 不是“生成一份带建议的报告”，而是完成以下受控链路：

```text
多通电话 evidence
  → 有判据的策略分析
  → committed analysis report
  → 结构化 ChangeProposal
  → human approve / reject / edit
  → candidate RunSpec
  → Simulation
  → Runtime 强制校验 approval
  → 激活新版本
  → 完整审计链
```

其中 T9 要求系统基于同一 Goal、RunGroup 或时间窗口内的多通电话，输出 result summary、failure
pattern、strategy effect 和 recommendation；每条 recommendation 都必须指向具体 evidence refs。T10
要求 recommendation 先落成独立、结构化的 ChangeProposal，包含当前版本、目标版本或 candidate、diff、reason
和 evidence refs，再由人类 approve、reject 或 edit。只有 exact proposal 获批且后续 Runtime 校验通过，新的
RunSpec/Strategy version 才能生效。

W5 明确不包含全自动上线、多 reviewer、大规模 A/B testing 和跨 tenant 策略学习。

### 当前代码已经提供的底座

- `calle_reports` 已有 Goal/tenant/session/Run/RunGroup scope、lineage、version、supersede 和 evidence refs。
- `commit_report` 会验证 Workspace scope、Markdown/JSON artifact、checksum 和 schema，随后写 Goal Event 与
  durable `report.committed` Session Event。
- Report schema 已支持 one-shot Run、batch RunGroup 和 inbound day/week/onboarding subject。
- `calle_run_specs` 已有 lineage、version、status、instruction ref/checksum 和
  `supersedes_run_spec_id`；当前 Strategy Version 最自然的产品载体就是 RunSpec version。
- Simulation 已有 candidate identity、canonical evidence、suite checksum、verdict 和 durable
  `simulation_completed` event。
- canonical confirmation 已能把 authenticated user decision 绑定到 exact immutable subject，并校验幂等重放。
- TUI `/report` 与 Session Report API 已能按 owner scope 读取并验证 committed report。

对现有 Report、Report skill、Goal confirmation、Simulation 和 TUI Report 的聚焦测试在本次审计中为
`87 passed`。因此 W5 的主要问题是尚未实现的产品契约和治理接线，而不是上述底座当前失效。

### 当前缺口与关键风险

1. **没有多通策略分析能力。** 当前只有 `one-shot-call-report`；没有 `batch-call-report`、
   `inbound-report`、strategy-analysis instruction/output schema 或 OfflineAnalysisAgent。
2. **没有受控的分析输入。** 底层可以查询 Runs，但 GoalAgent 工具面没有一个按 RunGroup、RunSpec version
   或时间窗口读取有界结构化 evidence snapshot 的入口。分析不能依赖整段 transcript 注入或直接访问数据库。
3. **没有 strategy effect 判据。** success、比较窗口、baseline、样本量、provider failure 排除规则，以及
   “因果效果”还是“关联观察”都尚未定义。未定义 ground truth 前不能让模型自由宣称 v2 优于 v1。
4. **ChangeProposal 完全缺失。** 当前没有 schema、ORM/store、migration、lifecycle、events、API/TUI
   projection 或测试。
5. **现有确认 subject 不支持策略变更。** canonical confirmation 目前只覆盖 voice run、测试 binding 和
   inbound hotline binding，没有 proposal/candidate subject，也没有 edit/revision 语义。
6. **当前 RunSpec activation 不能作为 W5 gate。** Agent-facing `create_run_spec` 默认
   `activate=true`，Store 也允许直接将 draft 切成 active；这些基础接口不会验证 proposal、approval、
   Simulation 或 candidate checksum。W5 需要独立、不可绕过的 governed activation command。
7. **没有 proposal 展示和恢复路径。** 当前 durable client event 只覆盖 Report、Simulation 等既有终态；
   用户还无法查看 exact proposal 并在恢复后的 Session 中继续 decision。

### 规格冲突

当前 long-task spec 要求 ChangeProposal 独立结构化保存、不得从 Report Markdown 反解析；但 Report v0.1.0
一方面把 ChangeProposal 放在未来范围，另一方面建议以后通过 grep `## Recommendations` 再结构化。这与
“recommendation 不自动执行、不从 Markdown 反解析”的治理不变量冲突。

实施 W5 前应先收敛 active spec：`commit_report` 继续只负责提交报告；分析阶段同时产出结构化
recommendation candidates；显式 proposal command 消费这些结构化数据，不解析报告 prose。

### 推荐实施顺序

1. **W5-0：收敛规格。** 选择首个 domain，定义 strategy effect 判据、candidate identity、edit/revision
   语义、approval 与 Simulation 顺序，以及并发版本漂移规则。
2. **W5-1：完成 T9。** 先实现有界 analysis snapshot 和一个真实聚合主体，优先 RunGroup；产出结构化
   findings/recommendations，再复用 `commit_report`。只有重 context、独立 eval 或失败隔离成为真实需求时，
   才拆 OfflineAnalysisAgent。
3. **W5-2：建立 ChangeProposal lifecycle。** 增加独立身份、source report、current/candidate RunSpec、
   diff、reason、evidence refs、revision 与 decision audit。
4. **W5-3：扩展 canonical confirmation。** 审批必须绑定 proposal、source report、current/candidate
   checksum；edit 产生新 revision/candidate，旧 approval 自动失效。
5. **W5-4：建立 governed activation。** Runtime 在 apply 时重新校验 proposal、owner scope、当前版本、
   candidate checksum 和对应 Simulation；通过 compare-and-swap 激活 version+1。
6. **W5-5：补齐最小 E2E。** 覆盖 pending/reject 不改 active、edit 使旧审批失效、stale baseline 拒绝、
   Simulation failure 不上线、跨 scope 不可见，以及恢复后的 report/proposal/decision。

只有完成这条链路，CALL-E 才能称为 W5 / Phase 3 ready。

## 7. 接下来的优先级

1. **认领 Domain DRI 并建立评测门槛。** 7 个 Skill 与 1 个 Judge 先有人认领，再补 golden set、runner 与发布 gate——目前 `evals/` 下只有 fixture，回归全靠人工。
2. **完成延迟分段指标。** 先定位 Bot prepare、Calling 创建、接通与首音频的真实瓶颈。
3. **复用可部署 Voice Artifact。** 让稳定 RunSpec 优先绑定已上线版本，减少每 Run 冷启动。
4. **收敛 Published Goal 契约。** `goal-call-strategy`、`outbound-goal-builder`、`goal-published-run-spec` 与对外 Runs API 都还在 Draft，先冻结再放量。
5. **补齐策略与检索评估。** 为 retrieval、simulation 和 Run outcome 建立可比较数据。
6. **建立 ChangeProposal。** 把高影响策略变化放进显式人工治理。
7. **持续强化 E2E。** 覆盖恢复、重复投递、外部超时、权限、inbound 上线和 Report 交付。

这份状态页应随源码审计更新，而不是重新承诺一个固定六周日期。下一篇[源码地图](/zh/projects/call-e/source-atlas)可以把这些能力定位到当前模块。
