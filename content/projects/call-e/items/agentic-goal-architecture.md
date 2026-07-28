---
title: "CALL-E Agentic Goal 架构"
summary: "用 Goal、Event、Iteration、RunSpec、Run 和 Report 建立 CALL-E 长任务的完整领域模型。"
---

CALL-E 不把用户的一句话直接交给电话 Bot。它先把自然语言意图固定成可审计的 Goal，再让专门的 GoalAgent 分阶段推进。revision `b36ac02f` 中，这套模型同时支持 outbound 与 inbound 目标，并把模拟、确认、真实执行和结果交付放在同一个持久生命周期里。

## 1. GoalBrief 固定“要做什么”

MainAgent 负责与用户协作。它读取 planner skill，补齐目标、已知事实、限制、成功标准和确认边界，然后调用 `commit_goal`。

`GoalBrief` 保存：

- `goal_type` 与用户目标；
- known facts、constraints、open questions；
- success criteria 与 allowed actions；
- collaboration context，例如给用户回复的语言。

这里的回复语言不是被叫人的通话语言。通话目标、locale、号码与具体指令在 RunSpec/Run 边界再次解析和冻结。

## 2. Goal 是聚合，Event 是历史

一次提交会建立三个互补记录：

| 记录 | 作用 |
|---|---|
| `calle_goals` | 当前 Goal 快照、状态、revision 与 Session 归属 |
| `calle_goal_events` | 追加式事实历史 |
| `calle_goal_dispatches` | 是否需要推进、消费 cursor 与 iteration lease |

Goal 快照让查询当前状态便宜；Event 保留为什么变成当前状态；Dispatch 让 worker 知道哪些新事实还未处理。三者不能互相替代。

用户确认、更新、nudge、停止、Run 终态和 Report 提交都会产生可幂等处理的事件，并把 `needs_dispatch` 重新置为 true。

## 3. Goal iteration 是一次受控推进

`CallEAgent` 读取需要 dispatch 的 Goal，并让 `GoalIterationRunner` 执行一次 iteration：

```text
claim iteration lease
  → 读取 cursor 之后的 committed Goal Events
  → 组合 Goal、Run、上传内容和 Workspace refs
  → 选择 outbound 或 inbound GoalAgent
  → 运行模型与受控工具
  → complete_goal_iteration
  → 提交 Goal patch、Events、cursor 与 lease release
```

Iteration 不是“直到完成为止”的无限循环。它只处理当前可见事实，明确返回下一状态、context delivery 与待调度 Run。若需要等待用户、电话或外部条件，Goal 可以进入等待状态；新事件到达后再启动下一次 iteration。

## 4. RunSpec 与 Run 分离计划和现实

GoalAgent 先生成语音指令 artifact，再调用 `create_run_spec` 发布不可变 RunSpec。RunSpec 描述本次执行方法、输入引用、语音绑定和 schema；新方案通过新版本表达，不在原记录上静默修改。

`submit_voice_run` 解析并冻结目标快照、runtime profile、SIP line 与幂等身份，然后创建 Run 或 RunGroup。

| 对象 | 含义 |
|---|---|
| RunSpec | 可复用、版本化的执行定义 |
| RunGroup | 一次批量提交的逻辑集合 |
| Run | 面向一个目标的一次真实尝试 |
| RunEvent | queued、running、结果与诊断的追加历史 |

一个 Goal 可以有多个 RunSpec 和 Run。Run 终态会回写 Goal Event，使 GoalAgent 基于真实结果决定下一步。

## 5. outbound 与 inbound 共用 Runtime

Outbound GoalAgent 可以创建 RunSpec、提交真实 Voice Run、读取结果并提交 Report。

Inbound GoalAgent 复用 Goal、RunSpec、Report 与 iteration 机制，但增加上线前约束：候选语音配置、ScenarioSuite、SimulationReport、人工批准和 hotline binding。当前 `SimulationRunner` 执行有界文本 rehearsal，冻结 persona、ground truth、trial 与 judge 结果；只有满足策略的候选才能进入真实号码绑定。

两类 Goal 的工具不同，持久化骨架相同，因此客户端不需要为每个目标类型发明一套任务恢复协议。

## 6. Report 与 Context Delivery

Report 不是一段临时模型文本。GoalAgent 先在 Workspace 生成 Markdown（必要时也生成 JSON），`commit_report` 再校验路径、内容完整性、subject 与 schema，并创建版本化 Report 记录和 Goal Event。

一次 iteration 通过 `complete_goal_iteration` 显式返回 context delivery。外层产品事务提交后，`CallEAgent` 才把这份交付转成 MainAgent/用户 Session 可见的 durable event。GoalAgent 的内部推理不会直接泄漏成用户事实。

## 7. 三条必须保持的边界

1. **MainAgent 不执行 Goal。** 它负责理解、确认和提交；GoalAgent 负责长期推进。
2. **Event 不等于当前快照。** Event 提供历史，Goal/Run/Report record 提供当前读取模型。
3. **本地提交不等于外部 exactly-once。** 数据库可以原子更新本地事实，电话供应商仍需要幂等身份、状态核对和补偿。

接下来沿源码走三条路径：[提交 Goal](/zh/projects/call-e/commit-goal)、[运行一次 Goal iteration](/zh/projects/call-e/goal-iteration-runner)，以及[从 RunSpec 到真实 Voice Run](/zh/projects/call-e/voice-run-execution)。

