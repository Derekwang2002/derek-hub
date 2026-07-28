---
title: "CALL-E 技术架构与框架取舍"
summary: "解释 CALL-E 为什么把模型循环、持久状态、外部副作用和实时事件拆开，并选择显式 Python Runtime 而非图编排框架。"
---

CALL-E 的难点不在“让模型调用工具”，而在于让一个可能持续很久、包含真实电话副作用的目标可以恢复、并发控制和审计。revision `b36ac02f` 的实现因此把模型能力嵌入显式业务 Runtime，而不是让框架图成为业务事实来源。

## 1. 运行时分层

```text
FastAPI + Session Registry
        ↓
CallEAgent / MainAgent
        ↓
Goal Store + GoalIterationRunner
        ↓
RunSpec Store + Run Registry + Report Store
        ↓
VoiceRunExecutor
        ↓
Botlab / Calling / IAMS adapters
```

API 处理请求身份、会话和事件流。`CallEAgent` 是产品事务与后台调度的门面；MainAgent 只理解用户、补齐约束并提交 Goal。后续执行由 GoalAgent 和确定性 Runtime 推进。

## 2. 模型层为何使用 Agents SDK

当前代码使用 OpenAI Agents SDK 的 `Agent`、`Runner`、`Tool`、`RunConfig`、Session 与 sandbox 能力。`orchestrator.py` 将 MainAgent 组装为 `SandboxAgent`，注入受控 Workspace、内置工具，以及 outbound/inbound planner skills。

SDK 负责模型循环、工具调用与流式事件，但不拥有 CALL-E 的业务状态机。Goal、Run 和 Report 仍由 SQLAlchemy store、数据库约束和显式事务管理。这样可以替换模型配置或 Agent 组装，而不改变业务事实的定义。

## 3. 为什么没有用 LangGraph

CALL-E 的控制流不是一张固定 DAG：

- Goal 可能等待电话、用户确认或外部事件；
- 一次结果可能触发继续、重试、改写 RunSpec 或提交 Report；
- worker 需要跨进程 claim、lease、cursor 和恢复；
- 外部电话副作用不能靠“节点执行过”推断完成。

图框架可以表达步骤，但 CALL-E 已经需要数据库中的领域状态机和事件日志。如果再把 checkpoint 或图节点状态当成第二套真相，会增加恢复语义和事务边界。当前方案直接用领域对象描述事实，用 Runner 描述一次模型计算。

这不是否定图编排框架。当流程稳定、节点有限、状态主要服务工作流本身时，图很合适；这里只是不让它取代已经存在的 Goal/Run 业务模型。

## 4. 持久状态与实时事件分开

系统同时维护两类视图：

1. 数据库中的 Goal、Run、Report、Session Event 等耐久事实；
2. 通过内存、Redis 与 SSE fan-out 的实时体验。

实时流可以丢失或重连，数据库事实不能。客户端用 cursor 回放 durable Session Event，再接上 live stream。`session_read_model.py` 把内部事件折叠成用户可见状态，并在边界处清理不应暴露的内部信息。

## 5. 事务与副作用边界

一次 Goal iteration 不是一个覆盖模型调用和电话供应商的长事务：

- claim 需要先提交，其他 worker 才能看到租约；
- 模型在事务外进行长耗时判断；
- Goal patch、Event、cursor 和释放 lease 在产品事务中一起提交；
- 提交后才调度 Voice Run 和发布可见事件；
- 电话供应商结果通过 Run Event 和 evidence 回写。

这种边界减少数据库锁占用，并明确 crash window。系统使用稳定 Run ID、状态转换和幂等键缩小重复执行风险，但不会把本地事务夸大为外部 exactly-once。

## 6. 外部平台通过端口隔离

`voice_runtime/executor/types.py` 定义 Voice Engine、Dialer 和 Executor 协议。providers 负责：

- 用 Botlab 创建或复用语音 Agent；
- 通过 IAMS 获取调用所需身份；
- 通过 Calling 创建任务、消费实时事件并拉取最终结果；
- 将供应商对象转换成 CALL-E 的 Run、transcript 与 evidence。

Agentic Runtime 只依赖执行能力，不把 Botlab 或 Calling 的响应结构变成领域模型。

## 7. 当前架构的代价

显式 Runtime 提高了可解释性，也带来更多代码：store、record、schema、event、租约和投影都需要维护。数据库迁移与行为测试必须跟上状态模型；同一概念在内部 Event、Session Event 和 UI projection 中也要保持一致。

这项成本换来的是清晰的恢复点和副作用治理。下一篇 [Agentic Goal 架构](/zh/projects/call-e/agentic-goal-architecture)会把这些组件压缩成 Goal 从提交到交付的完整领域模型。

