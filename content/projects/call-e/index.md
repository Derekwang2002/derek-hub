---
title: "CALL-E"
summary: "从系统边界和一条真实电话任务的主链路，快速理解 CALL-E 如何把模型判断变成可恢复、可审计的长期执行。"
---

CALL-E 不是“会调用电话工具的聊天机器人”。它处理的是一个持续时间可能远长于单次对话的目标：理解用户要什么，确认真实世界副作用，规划一次或多次电话，保存过程证据，并把结果重新交付给用户。

本文依据 `s-eleven-mcp` revision `b36ac02f` 整理，只建立阅读源码所需的系统模型。实现细节由后续文档展开。

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
| `Session` | 用户在哪个对话中观察和继续任务？ |
| `Goal` | 用户最终想完成什么，哪些约束已经确认？ |
| `RunSpec` | 一次执行准备如何进行？ |
| `Run` | 现实中实际发生了哪次尝试？ |
| `Report` | 系统最终交付了什么结论和证据？ |

`Goal` 不等于一通电话。一项长期目标可以产生多个版本化 `RunSpec` 和多个 `Run`；单次拨号失败也不必直接终结 Goal。`Report` 汇总的是目标结果，而不是简单复制某次通话的状态。

## 3. 四个系统边界

| 边界 | 主要职责 | 当前源码位置 |
|---|---|---|
| API | 请求身份、会话接入、消息与事件流 | `calle/apps/api` |
| Agentic Runtime | MainAgent、Goal、Iteration、Run、Report 和持久事件 | `calle/agentic` |
| Voice Runtime | 冻结语音指令、创建语音 Agent、拨号、监控与结果收集 | `calle/voice_runtime` |
| Platform Adapter | Botlab、Calling、IAMS、实时事件等外部能力 | `calle_platform` |

API 层可以结束一次 HTTP 请求，但 Goal 仍可在后台推进。Agentic Runtime 保存业务事实并决定下一步；Voice Runtime 执行一通电话；Platform Adapter 隔离外部系统协议。模型负责判断，确定性代码负责身份、状态转换、幂等、事务和副作用边界。

## 4. 为什么能够恢复和审计

CALL-E 把关键进展写成持久记录：Goal 及其 Event、dispatch cursor、不可变 RunSpec、Run 状态与 Event、Report、Session Event，以及 Workspace 中的证据引用。

`GoalIterationRunner` 通过 claim、lease 和 cursor 避免多个 worker 重复处理同一段 Goal 历史。一次 iteration 只消费已经提交的事实；最终业务状态由外层事务提交，提交后才向用户 Session 发布可见事件和安排 Voice Run。页面刷新、连接中断或进程重启后，系统可以从数据库与事件记录恢复，而不是猜测模型上次做到哪里。

真实电话仍存在外部副作用窗口。CALL-E 能提供稳定的本地身份、状态机、幂等键和证据链，但数据库事务本身不能证明外部供应商永远不会重复执行。文档会明确区分“本地 exactly-once 记录”与“端到端副作用保证”。

## 5. 怎样继续阅读

先阅读[技术架构与框架取舍](/zh/projects/call-e/technical-architecture)，理解为什么 CALL-E 选择显式 runtime；再进入 [Agentic Goal 架构](/zh/projects/call-e/agentic-goal-architecture)和三篇 Runtime Trace，沿真实调用链查看事务、游标与语音执行。

工程章节记录仍然成立的延迟优化方法和当前开发状态。最后的[源码地图](/zh/projects/call-e/source-atlas)用于从领域概念跳回具体模块。项目动态与独立 Blog/Demo 的关联内容集中在 [Updates](/zh/projects/call-e/updates)，不会打乱稳定文档顺序。

