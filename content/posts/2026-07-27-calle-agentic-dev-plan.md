---
title: "CALL-E Agentic Runtime 六周开发计划"
date: 2026-07-27
summary: "从 Agentic Runtime 基础骨架到 Beta Ready，拆解 CALL-E 未来六周在 Runtime、Outbound、Retrieval、Simulation、HITL 和 E2E Hardening 方向的交付计划。"
tags: [ai-agent, architecture, call-e, roadmap]
selected: false
draft: false
---

这份计划把 CALL-E Agentic Runtime 的建设拆成六周，先跑通可持续推进的 Agent loop，再逐步补齐真实外呼、知识检索、仿真、人工治理和 Beta 发布所需的基础设施。

每周都包含明确的任务、验收标准和暂不包含的范围；`Phase ready` 表示该阶段的最小闭环已经具备，而不是所有相关能力都已完成。

## W1 — Agentic Runtime Foundation

**目标：** 先把 Agentic Runtime 的基础骨架跑通。

这一周不追求真实打电话闭环，重点是让系统从“一次工具调用”升级成一个可以持续推进 Goal 的 Agent loop。

### 范围

- 建立 Agent Runtime、Root Orchestrator、Operation State 和 Event Timeline 的最小结构。
- Root Orchestrator 可以理解用户 Goal，并判断是 `outbound`、`inbound`、`unclear` 还是 `unsupported`。
- 每个 Operation 都有受控 Workspace，用于保存 input、scratch、evidence、report draft 和 export。
- Run Strategy (Voice Agent) Task Base Generation Skill 可以基于当前 Goal 生成 frozen voice instruction draft。
- Voice tool 先使用 mock 或 adapter，让内部 TUI / debug chat 可以触发一次模拟 call，并把结果写入 evidence。

### T1. Agentic Runtime + Operation State 基础（2–3 天）

**目标：** 建立 goal-driven agent loop 的最小骨架。

**产出：** 内部 TUI / debug chat 可以创建 Operation、查看当前状态、继续推进下一步，并看到 Event Timeline。

### T2. Workspace + Voice Instruction + Voice Tool Mock（2–3 天）

**目标：** 补齐 long task 需要的受控工作目录、voice instruction draft 和 mock voice call 能力。

**产出：** 每个 Operation 都有 Workspace，voice instruction 和 mock call result 可以作为 evidence 被追踪。

### 验收标准

- 用户在内部 TUI / debug chat 输入自然语言目标后，系统可以创建 Operation State。
- 内部 TUI / debug chat 能展示当前 status、known facts、open questions、next action 和 Event Timeline。
- Workspace、voice instruction draft 和 mock call result 可以被注册成 evidence。
- 不依赖真实 voice call，也能完成一次 agent loop 的状态推进。

### 暂不包含

- 真实外呼。
- 完整 InboundAgent。
- Report 生成和 HITL。
- 复杂 memory promotion workflow。

### 阶段结果

**Runtime foundation ready。** 系统可以理解 Goal、创建 Operation State、创建 Workspace、生成 voice instruction draft，并通过 mock voice tool 形成 evidence。

## W2 — Outbound One-shot Call Wrapper

**目标：** 把现有 outbound one-shot call 包进 Agentic Operation Lifecycle。

这一周要跑通 Root Orchestrator → OutboundAgent → plan / confirm / run / result → evidence → one-shot report 的最小业务闭环。

### 范围

- Root Orchestrator 可以把 outbound one-shot goal handoff 给 OutboundAgent。
- OutboundAgent 复用现有 `plan_call` / `run_call` / `get_call_run` 能力。
- Planner Skill 只处理 ready 判断、blocking question 和 confirmation summary。
- 最小 historical case retrieval 可以为 Planner 和 Report 提供 case context。
- Confirm gate 接入 Operation Lifecycle，用户确认后才能进入真实执行。
- Call transcript、summary、status 和 one-shot report draft 都写入 Workspace evidence。
- Report Skill 生成 Markdown draft，`report_tool` 负责注册 report record。

### T3. Root Orchestrator → OutboundAgent Handoff（2–3 天）

**目标：** 让 outbound one-shot goal 可以从 Root Orchestrator 进入 OutboundAgent。

**产出：** OutboundAgent 能接收 handoff context，并调用 Planner Skill 判断 ready、need user input 或 blocked；最小 historical case context 可以进入 planning。

### T4. Confirm / Run / Result / One-shot Report 闭环（2–3 天）

**目标：** 把现有 plan → confirm → run → result → summary 链路包进 Operation Lifecycle。

**产出：** 一次 outbound one-shot 可以产生 call evidence、summary 和 Markdown report draft，并注册 report record。

### 验收标准

- 一个 outbound one-shot goal 可以跑完整个 Agentic Operation 闭环。
- 缺信息时，系统能停在明确的 blocking question，而不是继续执行。
- 执行失败时，可以看到 blocker、last action 和 next action。
- Operation State、Workspace file、evidence refs 和 report record 可以互相追踪。
- 最小 historical case retrieval 可以被追踪到 evidence。
- W2 结束时达到 Phase 1 ready。

### 暂不包含

- 多轮自动 retry。
- SimulationAgent。
- Call Strategy 多版本选择。
- batch outbound 和 progressive outbound。
- user upload / playbook retrieval 的完整 pipeline。

### 阶段结果

**Phase 1 ready。** Outbound one-shot 可以跑通 Root Orchestrator → OutboundAgent → Planner → confirmation → run → result → evidence → report，并能追踪最小 historical case retrieval evidence。

## W3 — Retrieval + Call Strategy

**目标：** 把“这通电话怎么打”从 Prompt 拼接升级成可追踪的 Strategy Layer。

这一周在 Phase 1 的最小 historical case retrieval 基础上扩展，让 OutboundAgent 在 planning 和 voice instruction 生成前，可以引用用户上传知识、historical case 和 playbook context。

### 范围

- `retrieve_tool` 可以检索用户上传知识、historical case 和少量 playbook context。
- Retrieval result 会保存为 evidence，并可被 Planner、Strategy Generation 和 Report 引用。
- 定义 Call Strategy 的最小产品形态，覆盖 voice profile、说话风格、关键事实、success criteria 和 retry / fallback policy。
- Voice Agent final instruction 需要绑定本次使用的 Strategy Version。
- Operation State 可以串起 retrieval、strategy、voice instruction 和 call result。

### T5. User Upload / Retrieval Expansion MVP（2–3 天）

**目标：** 让 planning 和 voice instruction 生成前可以引用用户上传知识和历史 case。

**产出：** Retrieval result 可以被保存为 evidence，并进入 Planner、Strategy Generation 和 Report context。

### T6. Call Strategy + Strategy Version v0（2–3 天）

**目标：** 把“这通电话怎么打”沉淀成可追踪、可版本化的 Call Strategy。

**产出：** 每次 call 都能绑定 Strategy Version，并能追踪 Strategy、voice instruction 和 call result 的关系。

### 验收标准

- 给定一个 outbound goal，系统可以检索到相关上传知识或 historical case。
- Planner Skill 和 Run Strategy (Voice Agent) Task Base Generation Skill 可以引用 retrieval context。
- 每次 call 都能追踪使用的 Call Strategy 和 Strategy Version。
- outbound one-shot 不再只是 Prompt 拼接，而是有明确的 Strategy Layer。

### 暂不包含

- 大规模 playbook 自动生成。
- 自动选择多个 Strategy Version。
- A/B testing。
- 跨 tenant 检索和策略学习。

## W4 — Simulation + Inbound Runtime MVP

**目标：** 补齐执行前自测能力，并让 InboundAgent 具备最小 Runtime 管理能力。

这一周覆盖两个方向：Outbound 在真实 call 前可以做 text-only dry-run；Inbound 可以基于知识库回答客户问题。

### 范围

- SimulationAgent 可以基于 Call Strategy 和 Voice Agent instruction 做 text-only dry-run。
- Simulation result 能输出 risk、blocker、suggested fix 和 transcript preview。
- 高风险 simulation 可以阻断真实 call，并要求重新生成 Strategy 或 instruction。
- InboundAgent 可以准备最小 KB answer 场景所需的 knowledge context 和 inbound voice prompt。
- Inbound interaction 会记录 retrieved knowledge、transcript、answer summary 和 resolution status。

### T7. SimulationAgent Dry-run Preflight（2–3 天）

**目标：** 在真实 call 前提前发现话术、事实、策略和执行风险。

**产出：** Simulation result 可以记录 risk、blocker、suggested fix，并交给 OutboundAgent 判断是否允许进入真实 call。

### T8. InboundAgent KB Answer MVP（2–3 天）

**目标：** 让 InboundAgent 具备支撑知识库问答的最小 Runtime 管理能力。

**产出：** Inbound interaction 可以记录 retrieval、answer summary、transcript 和 resolution status。

### 验收标准

- 真实 call 前可以运行 simulation，并把结果写入 evidence。
- simulation 失败时，Operation State 可以记录风险、修复建议和后续动作。
- Inbound 场景可以基于知识库回答客户问题。
- missing knowledge 时能标记缺失知识，而不是胡答。
- W4 结束时达到 Phase 2 ready。

### 暂不包含

- 复杂多角色仿真。
- 完整 hotline setup。
- Inbound weekly report。
- missed knowledge 自动入库。

### 阶段结果

**Phase 2 ready。** 系统具备 retrieval、Call Strategy、simulation preflight、Inbound KB answer 和 audit event 的最小闭环。

## W5 — Report, HITL & Strategy Iteration

**目标：** 基于多通电话的 evidence 做分析、优化建议和人工治理。

这一周让 Dynamic Strategy 形成可追踪迭代：Report 只能提出建议，关键策略变化必须进入 human approval。

### 范围

- OfflineAnalysisAgent 可以基于 Workspace 和 evidence refs 分析多通电话效果。
- Report Skill 可以生成包含 result summary、failure pattern、strategy effect 和 recommendation 的 Report。
- Report recommendation 可以落成 ChangeProposal。
- HITL approval 可以对关键 Run Strategy / Call Strategy 变更做 approve、reject 或 edit。
- Approved proposal 可以生成新的 Strategy Version，并保留 v1 → v2 的证据链。

### T9. OfflineAnalysisAgent + Strategy Analysis Report（2–3 天）

**目标：** 基于多通电话 evidence 分析结果、失败模式和 Strategy Effect。

**产出：** Report 可以给出可追溯到 evidence 的 recommendation。

### T10. ChangeProposal + HITL Approval（2–3 天）

**目标：** 把关键 Strategy / Prompt 变更放到 human approval gate 后面。

**产出：** Approved proposal 可以生成新的 Strategy Version，未审批 proposal 不影响 active strategy。

### 验收标准

- 系统可以基于多通电话生成 Strategy Analysis Report。
- 每条 recommendation 都能追溯到 evidence refs。
- 每个 ChangeProposal 都包含当前版本、目标版本、diff、reason 和 evidence refs。
- 未 approved 的 proposal 不能修改 active strategy。
- W5 结束时达到 Phase 3 ready。

### 暂不包含

- 全自动策略上线。
- 多 reviewer workflow。
- 大规模 A/B testing。
- 跨 tenant 策略学习。

### 阶段结果

**Phase 3 ready。** 系统可以基于多通电话生成 Report，形成 recommendation，经 HITL approval 后生成新的 Strategy Version。

## W6 — E2E Hardening + Beta Ready

**目标：** 把前 5 周能力收敛到可 demo、可排查、可灰度的 Beta 状态。

这一周不再扩新 feature，重点是 E2E、trace、权限边界、feature flag、rollback 和 runbook。

### 范围

- 补齐 outbound success、missing info、call failed、simulation failed、report proposal 和 inbound KB answer 的 E2E 场景。
- 从 Goal 可以追踪到 call、evidence、report、proposal 和 Strategy Version。
- Workspace、evidence、report 和 proposal 都有 tenant / project / operation 边界。
- 关键能力都有 feature flag 和 rollback path。
- 准备 beta checklist、demo script 和最小 ops runbook。

### T11. E2E / Tracing / Permission Hardening（2–3 天）

**目标：** 把核心 happy path 和 failure path 都变成可验证、可排查、可受控的流程。

**产出：** E2E matrix、trace correlation、Workspace permission guard 和 audit event 都覆盖核心链路。

### T12. Beta Rollout / Runbook / Cleanup（2–3 天）

**目标：** 整理 Beta 所需的开关、回滚、演示脚本、运维手册和文档收尾。

**产出：** Beta checklist、feature flags、rollback path、demo scripts 和最小 ops runbook。

### 验收标准

- 核心 E2E 场景可以跑通，或者给出明确 blocker。
- Trace 可以从 Goal 查到 call、evidence、report、proposal 和 Strategy Version。
- Workspace 越权访问会被阻断。
- Report、proposal 和 strategy apply 都有 audit event。
- Beta checklist、demo script、rollback plan 和 runbook 准备完成。

### 暂不包含

- 新业务 feature。
- 大规模性能优化。
- 完整 admin / ops console。
- 跨 tenant analytics。

### 阶段结果

**Beta ready。** E2E、trace、Workspace permission、audit、rollback 和 runbook 都达到受控 Beta 要求。
