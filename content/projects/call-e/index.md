---
title: "CALL-E"
summary: "从一次电话工具到持续拥有用户目标的 Agentic 系统：产品边界、三条典型旅程，以及可恢复、可审计的 Goal Runtime 实现。"
---

CALL-E 不是“会调用电话工具的聊天机器人”。它处理的是一个持续时间可能远长于单次对话的目标：理解用户要什么，确认真实世界副作用，规划一次或多次电话，保存过程证据，并把结果重新交付给用户。今天的 agentic CALL-E 由 OpenAI Agents SDK 驱动（代码在 `calle/agentic`），一次执行就结束的外呼和长任务 Goal 跑在同一套 Goal Runtime 上；旧的无状态 v1 流水线已被吸收为 Runtime 里的一种 RunSpec 和 Run。

本文建立阅读整个 Project 所需的系统模型。产品侧内容依据知识转移文档 `docs/calle-agentic-knowledge-transfer.md`（基线 2026-08-12）；工程侧依据 `s-eleven-mcp` revision `b36ac02f` 的源码审计。实现细节由后续文档展开。

## 1. 一条主链路

```text
用户消息
  → CALL-E API 创建或恢复 Session
  → MainAgent 澄清请求并 commit Goal
  → GoalIterationRunner 恢复 Goal 上下文
  → GoalAgent 发布 RunSpec 并创建 Run
  → VoiceRunExecutor 组装 Botlab Agent 和 Calling 任务
  → 实时事件、转写与结果写回 Run / Evidence
  → GoalAgent 继续、重试、停止或提交 Report
  → Session Event 让前端恢复并展示结果
```

这条链路有两个时间尺度。一次聊天 turn 希望快速响应；一个电话目标却可能等待接听、经历多次尝试，甚至跨越服务重启。因此，系统不能把进度只放在模型上下文或内存任务里。

## 2. 五个核心对象

| 对象 | 回答的问题 |
|---|---|
| `Goal` | 用户最终想完成什么，哪些约束已经确认？跨会话、跨执行持续存在 |
| `RunSpec` | 系统准备怎么做？不可变、可追溯的执行版本（话术 + 契约 + 配置） |
| `Run` | 现实中实际发生了哪次尝试？ |
| `Evidence` / `Artifact` | 为什么得到这个结论？只追加，不改写 |
| `Delivery` | 系统现在要告诉或问用户什么？GoalAgent 声明，Runtime 投递 |

Chat history 帮助模型推理，但 `Goal`、`RunSpec`、`Run` 和 `Evidence` 才是产品事实。`Goal` 不等于一通电话：一项长期目标可以产生多个版本化 `RunSpec` 和多个 `Run`；执行状态也不是 Goal 状态——一次通话失败不会让目标失败，成功也不会让目标完成。

## 3. 四条用户体验边界

系统对用户的承诺只有四条，所有评测用例都对应其中一条：

1. **系统说的状态是真的**——「已保存」「已验证」「已批准」「已执行」「已完成」不许互相顶替；
2. **用户知道系统接下来要做什么**——真实电话和热线绑定前，批准对象是确切动作本身；
3. **系统没有消失**——长任务里用户总能看到进度、等待原因和下次继续时间；
4. **失败不等于重新开始**——崩溃、重启、通话失败都不丢失已确认的 Goal、方案和证据。

这四条由 Goal Runtime 的持久状态、protected-tool approval、delivery 契约和 bounded recovery 兑现，代价是更长的链路、多一跳的事实读取和跨 Agent 排障成本。

## 4. 四个系统边界

| 边界 | 主要职责 | 当前源码位置 |
|---|---|---|
| API | 请求身份、会话接入、消息与事件流 | `calle/apps/api` |
| Agentic Runtime | MainAgent、Goal、Iteration、Run、Report 和持久事件 | `calle/agentic` |
| Voice Runtime | 冻结语音指令、创建语音 Agent、拨号、监控与结果收集 | `calle/voice_runtime` |
| Platform Adapter | Botlab、Calling、IAMS、实时事件等外部能力 | `calle_platform` |

API 层可以结束一次 HTTP 请求，但 Goal 仍可在后台推进。Agentic Runtime 保存业务事实并决定下一步；Voice Runtime 执行一通电话；Platform Adapter 隔离外部系统协议。模型负责判断，确定性代码负责身份、状态转换、幂等、事务和副作用边界。

## 5. 为什么能够恢复和审计

CALL-E 把关键进展写成持久记录：Goal 及其 Event、dispatch cursor、不可变 RunSpec、Run 状态与 Event、Report、Session Event，以及 Workspace 中的证据引用。

`GoalIterationRunner` 通过 claim、lease 和 cursor 避免多个 worker 重复处理同一段 Goal 历史。一次 iteration 只消费已经提交的事实；最终业务状态由外层事务提交，提交后才向用户 Session 发布可见事件和安排 Voice Run。页面刷新、连接中断或进程重启后，系统可以从数据库与事件记录恢复，而不是猜测模型上次做到哪里。

真实电话仍存在外部副作用窗口。CALL-E 能提供稳定的本地身份、状态机、幂等键和证据链，但数据库事务本身不能证明外部供应商永远不会重复执行。文档会明确区分“本地 exactly-once 记录”与“端到端副作用保证”。

## 6. 怎样继续阅读

先读产品层四页：[从「打一通电话」到「持续完成一个 Goal」](/zh/projects/call-e/goal-first-product-design)定义 Goal 与四条体验边界；[三条典型产品旅程](/zh/projects/call-e/product-journeys)展开 Outbound、Published Goal 与 Inbound Hotline 的生命周期；[Goal 的生命周期 PRD](/zh/projects/call-e/goal-lifecycle)给出开发者视角从创建到生产改进的逐步流程与 P0–P3 拆分；[分层定位与迭代 Playbook](/zh/projects/call-e/iteration-playbook)给出 bad case 归属和发布纪律。

再进入工程层：[技术架构与框架取舍](/zh/projects/call-e/technical-architecture)解释为什么选择显式 runtime，[Agentic Goal 架构](/zh/projects/call-e/agentic-goal-architecture)和三篇 Runtime Trace 沿真实调用链查看事务、游标与语音执行。工程章节记录仍然成立的延迟优化方法和当前开发状态。最后的[源码地图](/zh/projects/call-e/source-atlas)用于从领域概念跳回具体模块。项目动态与独立 Blog/Demo 的关联内容集中在 [Updates](/zh/projects/call-e/updates)，不会打乱稳定文档顺序。
