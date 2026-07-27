---
title: "CALL-E Agentic 技术解析：亮点、难点与框架取舍"
date: 2026-07-27
summary: "从 Goal、Event 和 Run Runtime 出发，梳理 CALL-E Agentic 的技术栈、中间件、设计哲学，以及为什么当前没有选择 LangChain/LangGraph。"
tags: [ai-agent, architecture, call-e]
selected: false
draft: false
---

看到 Agentic 代码时，很多人的第一反应是：这是一个大模型，加上一些工具，再套一个循环。

CALL-E Agentic 的重点并不在于“让模型多调用几次工具”，而在于把一次自然语言请求变成一个可以持续推进、暂停、恢复、审计和交付结果的长期任务。

一句话概括它的设计：

> 用 LLM 做判断，用 Runtime 做编排，用数据库和事件保存事实，用工具和确认机制控制副作用。

## 1. 它解决的是什么问题

CALL-E 不只管理“一通电话”，而是管理用户想完成的一件事：

```text
用户输入
  → MainAgent 理解目标
  → 创建 Goal
  → GoalAgent 生成 RunSpec
  → 创建 Run / RunGroup
  → Botlab + Calling 执行电话
  → 事件、证据和报告回流
  → GoalAgent 决定继续、重试或结束
```

这里有几个不同的概念：

| 概念 | 作用 |
|---|---|
| `Session` | 用户可见的聊天容器 |
| `Goal` | 用户真正想完成的长期任务 |
| `GoalBrief` | 固定“要做什么”、事实、约束和成功标准 |
| `RunSpec` | 描述一次执行应该“怎么做” |
| `Run` | 一次真实执行尝试 |
| `Report` | 汇总结果、指标和证据 |

因此，一次电话失败不一定代表整个 Goal 失败。GoalAgent 可以根据事件和证据决定是否等待、重试、调整方案或停止。

## 2. 技术栈与中间件

| 层次 | 当前技术 |
|---|---|
| 语言与并发 | Python 3.13+、`asyncio` |
| Agent 框架 | OpenAI Agents SDK、`SandboxAgent`、`Runner`、`FunctionTool`、Skills |
| 模型接口 | OpenAI Responses API、`previous_response_id`、reasoning、context compaction |
| Schema | Pydantic v2，工具、事件和状态均采用结构化模型 |
| API | FastAPI、Uvicorn、SSE；同时提供 Typer CLI 和 Ratatui TUI |
| 持久化 | PostgreSQL、SQLAlchemy 2 Async、asyncpg、Alembic、Pydantic JSONB |
| 异步任务 | Taskiq + RabbitMQ/AMQP；Redis 作为 Taskiq result backend |
| 实时事件 | asyncio 内存队列、Redis Streams、SSE |
| 外部执行 | Botlab、Calling、IAMS |
| 观测与评测 | Langfuse、OpenInference、Simulation Judge |

需要特别区分“服务基础设施”和“Agentic 核心调度”：

- Taskiq、RabbitMQ 主要承载 one-shot call、号码、IM 等后台任务。
- Agentic 的 Goal iteration 当前主要通过进程内 `asyncio.create_task` 执行，并使用 PostgreSQL 中的 lease、cursor 和幂等键保证一致性。
- Redis 用于任务结果、锁、限流、Token、Calling DM Stream 等场景；它不是 Agent memory 的权威存储。
- Agentic 的 Session、Goal、Run、Report 和 durable event 主要落在 PostgreSQL。
- Agentic 提供 Redis Stream 事件实现，但当前 API 默认使用进程内的 `MemorySessionEventLiveStream`；多实例部署时才需要明确接入共享实时流。

这意味着它不是“所有东西都扔进消息队列”，而是让队列负责异步唤醒，让数据库负责业务事实。

## 3. 技术亮点

### 3.1 Goal-centric 的长期任务模型

传统 one-shot call 关注一次执行；Agentic 把 Goal 放在更高层，把 Run 当作 Goal 的一次尝试。

这使系统可以表达：多轮补充信息、批量外呼、失败重试、人工确认、报告生成和后续推进，而不是把所有状态塞进一条聊天记录。

### 3.2 Event-driven 与可恢复性

Goal Event、Run Event 和 Session Event 共同组成任务的事实轨迹，并配合：

- append-only 事件；
- cursor 增量消费；
- lease 防止并发 iteration；
- idempotency 防止重复写入和重复执行；
- transaction 保证状态与事件的一致性。

服务重启后，Runtime 可以从 Goal 状态和未消费事件恢复，而不是依赖某个进程内 Agent 对象还活着。

### 3.3 Agent 角色和能力隔离

- `MainAgent` 负责理解目标、澄清、确认和提交 Goal。
- `OutboundGoalAgent` 负责外呼 RunSpec、执行和报告。
- `InboundGoalAgent` 负责知识整理、热线策略、模拟和绑定。
- Runtime 负责状态、事件、租约和事务。
- Tool 负责真实副作用。

不同角色拥有不同的 tools 和 skills，减少上下文污染，也减少模型越权的机会。

### 3.4 语音执行与长期任务解耦

CALL-E Agentic 管理“要完成什么”；Botlab 和 Calling 管理“一通电话中如何实时对话、拨号和回收结果”。

Inbound 场景还要求先用 Persona 和 Scenario 做文本模拟，确认策略通过后，才允许绑定真实热线。这把高风险副作用放到了明确的治理边界之后。

### 3.5 上下文不是唯一事实来源

系统同时使用持久化 Agent session、`GoalBrief`、Goal Event、workspace artifact 和 context compaction：

- Session 保证模型推理连续性；
- Goal/Event/Run 保存业务事实；
- Artifact 保存较大的文档、报告和证据；
- Compaction 控制上下文规模。

模型上下文可以丢失或压缩，但业务事实不能依赖模型记忆来保存。

## 4. 技术难点

### 4.1 非确定性的模型与确定性的业务状态

模型可能重复调用工具、漏掉最终确认或产生不完整输出。因此 Runtime 需要验证工具 schema、限制 `complete_goal_iteration` 的调用次数，并禁止 GoalAgent 修改 Runtime-owned event。

### 4.2 多个外部系统的一致性

一次外呼可能跨越 Agent、PostgreSQL、Botlab、Calling、IAMS 和回调事件。任何一步都可能超时、重复或部分成功，所以不能只靠模型说“执行完成”，必须依赖状态机、幂等、租约和最终对账。

### 4.3 Durable event 与实时事件的平衡

前端需要低延迟，恢复又需要可重放。系统因此区分 durable/transient event，并处理提交前不可见、提交后 fanout、重复事件、游标恢复和 SSE 断线重连。

### 4.4 语音能力本身具有地域和供应商差异

语言、地区、SIP line、号码权限、Botlab version 和 Calling 状态都可能不匹配。系统需要返回结构化 capability gap，而不是用宽泛 fallback 掩盖真实能力缺口。

## 5. 设计哲学

CALL-E 遵循一条很实用的复杂度阶梯：

```text
普通代码 > 单次 LLM 调用 > Workflow > Single Agent > Multi-Agent
```

具体体现为：

1. **模型负责判断，代码负责事实。** 语义理解、意图判断和策略生成交给模型；权限、事务、状态和外部 I/O 由代码控制。
2. **产品状态优先于框架状态。** Goal、Run、Event 和 Report 是权威数据，不能把通用 Agent 框架的 checkpoint 当成业务事实。
3. **副作用必须显式、可确认、可审计。** 发电话、绑定热线和修改外部状态都通过专门工具处理。
4. **Context 是工作集，不是知识仓库。** 大内容按需检索，中间结果写入 artifact，长上下文进行压缩。
5. **Runtime 与 UI 解耦。** Web 和 TUI 只消费 typed event，核心 Runtime 不依赖具体界面。
6. **没有 trace 和 eval，就不能认为 Agent 已经生产可用。** Simulation 和 Langfuse 是可靠性建设的一部分，而不是上线后的附属功能。

## 6. 为什么当前不选择 LangChain/LangGraph

这不是因为 LangChain 或 LangGraph 不好，而是当前的核心问题不需要再增加一层通用编排抽象。

### 6.1 OpenAI Agents SDK 已经贴合当前需求

CALL-E 直接使用 OpenAI Responses API、reasoning、context compaction、流式事件和 SandboxAgent。换成 LangChain 后，仍然需要重新接入这些原生能力，同时增加模型、工具和消息格式的适配层。

### 6.2 CALL-E 已经有自己的业务状态机

LangGraph 擅长 Graph State 和 Checkpoint，但 CALL-E 的权威状态已经是：

```text
Goal → Goal Event → RunSpec → Run → Run Event → Report
```

如果再把 LangGraph State 作为中心，很容易产生两套状态：一套是 Graph checkpoint，一套是 CALL-E 数据库。当前设计选择让框架负责模型执行，让 CALL-E Runtime 负责业务状态。

### 6.3 当前流程不是固定 DAG

GoalAgent 会根据新消息、外呼结果、报告、模拟结果和用户确认动态决定下一步。固定的节点图不能替代这些判断；真正的难点也不是节点跳转，而是幂等、权限、外部副作用和恢复。

### 6.4 未来仍可以局部引入

如果未来出现大量并行分支、复杂 DAG、定时唤醒或可复用子图，LangGraph 可能适合作为 `GoalIterationRunner` 内部的执行适配层。

但它不应取代 Goal、Run、Event、Report 这套产品级协议，也不应成为唯一的事实来源。

## 结语

CALL-E Agentic 的本质不是“换了一个更强的 Agent 框架”，而是把模型决策嵌入一个有状态、有边界、有中间件、有证据链的任务运行时。

它的价值不在于让模型拥有无限自由，而在于让模型在明确的 Goal、Tool、Event、Approval 和 Runtime 约束下，可靠地推进一件可能持续很久的真实工作。
