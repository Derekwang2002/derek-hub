---
title: "CALL-E Agentic Runtime 开发状态与下一步"
summary: "把原六周计划与 revision b36ac02f 的实现对照，区分已经落地、方向变化和仍需完成的工程工作。"
---

原六周计划记录了 CALL-E 从一次电话工具走向持久 Agentic Runtime 的方向。revision `b36ac02f` 已经越过其中多个里程碑，也改变了部分实现路径。本页不再把旧时间表当作未来承诺，而是把它转换成当前状态与下一步清单。

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

## 7. 接下来的优先级

1. **完成延迟分段指标。** 先定位 Bot prepare、Calling 创建、接通与首音频的真实瓶颈。
2. **复用可部署 Voice Artifact。** 让稳定 RunSpec 优先绑定已上线版本，减少每 Run 冷启动。
3. **补齐策略与检索评估。** 为 retrieval、simulation 和 Run outcome 建立可比较数据。
4. **建立 ChangeProposal。** 把高影响策略变化放进显式人工治理。
5. **持续强化 E2E。** 覆盖恢复、重复投递、外部超时、权限、inbound 上线和 Report 交付。

这份状态页应随源码审计更新，而不是重新承诺一个固定六周日期。下一篇[源码地图](/zh/projects/call-e/source-atlas)可以把这些能力定位到当前模块。

