---
title: "下游模型延迟不可控时，Agentic 层还能优化什么？"
date: 2026-07-24
summary: "以 CALL-E 为例，拆解 Agent 规划、Bot 准备、外部执行和结果回传的延迟边界，并讨论预编译、版本复用、并行预取与实时事件链路。"
tags: [ai-agent, architecture, performance, call-e]
selected: false
draft: false
---

在 Agent 系统里，一旦响应变慢，最容易得到的结论是“下游模型太慢”。这个判断可能没有错，但它通常不够完整。

一次 Agent 任务并不只有模型推理。请求进入系统后，还可能经历目标理解、上下文恢复、执行计划生成、Bot 创建、版本发布、外部系统同步、状态轮询和结果回传。即使下游模型的推理时间完全不可控，Agentic 层仍然可以移除关键路径上的重复工作，并让系统更早开始执行、更早展示进度。

本文以 CALL-E 的 Agentic Goal 与 Voice Run 链路为例，回答三个问题：

1. 当前系统已经做了哪些延迟优化？
2. 哪些设计只改善体感延迟，哪些真正缩短了端到端耗时？
3. 如果下游 Botlab 模型无法继续优化，Agentic 层下一步最值得改什么？

核心结论是：

> **Agentic 层无法直接缩短下游模型的一次推理，但可以减少模型调用前后的串行工作、冷启动、重复计算和结果发现时间。**

## 1. 先把“延迟”拆开

端到端延迟可以粗略表示为：

```text
T_total
  = T_agent
  + T_bot_prepare
  + T_external_submit
  + T_downstream_model
  + T_result_delivery
```

| 阶段 | 主要内容 | Agentic 层可控程度 |
|---|---|---|
| `T_agent` | Goal 理解、上下文恢复、规划和工具调用 | 高 |
| `T_bot_prepare` | Bot 创建、保存、发布、上线和配置同步 | 高 |
| `T_external_submit` | 凭证解析、线路选择、Calling 任务创建 | 中到高 |
| `T_downstream_model` | 通话中 Botlab 模型的单轮推理 | 低 |
| `T_result_delivery` | 终态发现、持久化、事件投影和前端展示 | 高 |

如果指标是“用户提交请求到电话开始执行”，Agentic 层拥有很大的优化空间。如果指标是“对方说完一句话到 Bot 开始回答”，Agentic 层只能通过模型选择、Prompt 长度和工具预取间接影响，主要瓶颈仍在 Botlab 内部。

如果不先明确测量区间，“Botlab 很慢”会把多个完全不同的问题混在一起。

## 2. 当前系统已经具备的降延迟设计

### 2.1 增量事件与上下文复用

`GoalIterationRunner` 不会在每次唤醒时重新处理完整任务历史，而是保存事件游标，只读取上次迭代之后新增的 Goal Event。没有新事件且不需要派发时，Runtime 会直接跳过本轮执行。

对于支持 OpenAI Responses Context 的模型，GoalAgent 还会保存并复用 `previous_response_id`，避免每轮重新提交完整模型上下文。上下文过长时再进行 Compaction，并将压缩结果持久化。

这类优化会真正减少 Agent 层的输入规模、重复计算和无效模型调用，属于实际延迟优化，而不只是 UI 提前显示状态。

### 2.2 异步执行与流式事件

GoalAgent 创建 Voice Run 后不会同步等待整个外部任务完成。Voice Run 在后台继续执行，当前 Iteration 可以释放，MainAgent 和客户端通过事件观察状态。

模型输出、工具进度和执行状态会被转换成流式事件，再通过 SSE 返回给客户端。用户能够先看到“任务已接受”“Bot 正在准备”“外部任务已创建”等进度，而不是等待终态后一次性得到结果。

这种设计显著改善体感延迟，也避免长任务持续占用前台请求；但如果后台仍然执行相同的串行远程调用，它不会自动缩短真实任务耗时。

### 2.3 实时事件与轮询竞速

外部执行完成后，系统不会只依赖固定间隔轮询。实时事件可以经 Kafka Bridge 写入 Redis Streams，Voice Run 同时启动实时事件消费和 Calling Detail 轮询，两条链路中谁先拿到可信终态就优先完成。

```text
                     ┌─ Redis Stream 实时事件 ─┐
Calling Task ────────┤                         ├─ FIRST_COMPLETED
                     └─ Calling Detail 轮询 ───┘
```

实时链路异常时，Calling 最终结果仍然承担权威对账职责。这使 Redis 和 Kafka 成为降低延迟的加速层，而不是业务真相源。

与单纯降低轮询间隔相比，这种“双路径竞速 + 最终对账”不会给下游 API 制造持续高频请求，也能在实时中间件不可用时保持正确性。

### 2.4 执行器内的稳定数据缓存

Calling 执行器会缓存已经获取的 AppKey、账户时区和 Calling Token，避免同一个执行生命周期内重复访问 IAMS 或重新认证。

这项优化的局限在于缓存主要跟随当前 Provider 实例，跨 Run、跨 Worker 的复用能力有限。高并发场景下，不同 Worker 仍可能重复读取相同的租户配置。

## 3. 当前关键路径上的主要瓶颈

Outbound Voice Run 目前仍然倾向于为每个 Run 创建独立 Bot，Bot 名称中包含 `run_id`。一次执行会串行经历：

```text
读取 Botlab 用户信息
  → 创建或更新 Bot
  → 保存 Draft
  → 发布 Version
  → Version Online
  → 等待 Calling 同步 Robot
  → 获取 AppKey / 时区
  → 创建 Calling Task
```

这里包含多个跨服务网络往返，而且后一步通常依赖前一步的结果。即使 Botlab 模型推理很快，Bot 发布和 Robot 同步也可能形成明显的冷启动延迟。

把这段代码放进后台任务，只是让 API 更早返回，并没有移除这条关键路径。真正的优化应当让“创建、发布和上线 Bot”不再发生在每次 Run 的热路径上。

## 4. 核心优化：把 Bot 变成可复用的编译产物

更合适的模型不是“每次执行时创建一个 Bot”，而是：

```text
GoalBrief
  → RunSpec
  → 预编译并上线 Bot Artifact
  → 保存 RunSpecVoiceBinding
  → 多个 Run 直接引用该 Version
```

### 4.1 使用稳定指纹标识 Bot Artifact

Bot Artifact 可以使用以下信息计算稳定指纹：

```text
artifact_key = SHA256(
  tenant_id
  + instruction_checksum
  + voice_profile_version
  + model
  + language
  + speech_settings
)
```

相同租户、相同 Prompt 和相同运行配置应当命中同一个已上线版本。只要其中任意配置变化，就产生新的 Artifact，而不是修改旧版本。

数据库至少需要记录：

| 字段 | 作用 |
|---|---|
| `artifact_key` | 幂等创建与复用键 |
| `tenant_id` | 防止跨租户共享 |
| `run_spec_id` / `checksum` | 绑定不可变执行规格 |
| `bot_id` / `version_id` | 下游 Botlab 标识 |
| `status` | `preparing / ready / failed / retired` |
| `lease_until` | 防止多个 Worker 重复发布 |
| `last_verified_at` | 判断在线状态是否需要刷新 |

CALL-E 已经具备 `RunSpecVoiceBinding` 和基于 RunSpec Lineage 的稳定 Prod Bot 机制。下一步可以将这套能力扩展到 Outbound 执行，使 Run 优先复用已经准备好的 Bot Version。

### 4.2 将准备工作前移到确认之后

合理的准备时机是 RunSpec 已冻结并通过必要确认之后：

1. Runtime 提交不可变 RunSpec。
2. Bot Prepare Worker 根据 `artifact_key` 幂等 Claim。
3. Worker 创建、发布并上线 Bot Version。
4. 成功后将 Binding 写入 RunSpec。
5. 真正执行 Run 时只校验 Binding 状态并创建 Calling Task。

如果用户尚未确认，不应提前产生有成本或外部副作用的资源。确认完成后再预热，可以同时满足低延迟和权限边界。

### 4.3 将动态目标数据移出 Bot Prompt

Bot 能否复用，取决于 Prompt 是否包含本次 Run 独有的数据。

电话号码、联系人姓名和单次执行参数不应固化进 Bot Version，而应作为 Calling 变量或运行期上下文传入。Bot Artifact 只保存稳定策略、语气、工具定义和任务模板。

否则即使建立缓存，每个目标仍然会生成不同 Checksum，最终退化回“一次 Run 一个 Bot”。

### 4.4 处理失效、并发和回收

预编译不能只做一层普通 Cache，还需要明确一致性规则：

- Prompt、模型或 Voice Profile 变化时创建新版本，旧 Run 继续引用旧版本。
- 使用数据库行锁、Lease 或唯一 Artifact Key 防止多个 Worker 重复发布。
- Binding 只在 Botlab Version 确认 Online 后进入 `ready`。
- 执行前进行轻量健康检查，失败时回退到重新准备。
- 旧版本按引用计数、最后使用时间或 TTL 延迟下线，避免正在执行的 Run 被提前回收。

这样，Bot Artifact 才是可审计的部署产物，而不是一个可能失效的内存缓存。

## 5. 关键路径还可以继续缩短

### 5.1 并行预取独立依赖

当前链路中的部分操作并不互相依赖，可以并行执行：

- 解析 Voice Profile；
- 解析 SIP Line；
- 获取 IAMS AppKey；
- 获取账户时区；
- 检查已有 Bot Binding；
- 预热 Botlab 与 Calling HTTP 连接。

这些工作可以通过 `asyncio.gather` 或后台 Prepare Worker 并行完成。AppKey、时区、Voice Profile 和 Botlab 用户信息可以放入带版本与 TTL 的应用级缓存，而不是只保存在单个 Provider 实例中。

真正存在依赖的 `save → publish → online` 仍应保持顺序，不能为了并行而破坏下游状态机。

### 5.2 为交互任务使用独立 Worker 队列

进程内 `asyncio.create_task` 的启动开销低，但会与 API 请求共享 CPU、连接池和事件循环；进程重启时，后台任务也需要额外恢复。

可以将 Bot Prepare 和 Voice Run 放入独立的 Taskiq / RabbitMQ 队列：

- 交互任务使用高优先级队列；
- 长任务与批处理使用独立并发池；
- Worker 保持 HTTP 连接和稳定配置的热缓存；
- PostgreSQL 的 Lease、事件游标和幂等键仍然承担正确性；
- 队列只负责唤醒，不作为任务状态的唯一存储。

这种设计不一定降低单次任务的最小延迟，但能避免批处理或慢任务造成队头阻塞，改善高负载下的 P95 和 P99。

### 5.3 减少不必要的模型跳数

并非每个状态变化都需要重新调用 GoalAgent。

对于结构完整、无歧义的 Goal，可以使用确定性 Fast Path 生成标准 RunSpec；对于 `queued → running → completed` 等机械状态变化，可以由 Reducer 更新状态和用户投影。只有需要重试、修改计划、解释异常或请求用户补充信息时，才重新唤醒模型。

这会减少 MainAgent、Planner、GoalAgent 与下游模型连续串行调用的情况。

### 5.4 提前建立实时事件关联

Agentic Voice 路径可以在 Calling Task ID 返回之前，先建立：

```text
robot_name + callee → run_id
```

Calling Task 创建后再补充：

```text
task_id → run_id
```

这样可以捕获任务创建窗口内提前到达的 Kafka 事件，减少实时进度丢失后回退轮询的概率。Redis Stream 用于低延迟 Fan-out 和短期回放，PostgreSQL 继续保存权威状态，SSE 断线后再按数据库游标补齐。

## 6. 先建立可观测的延迟预算

任何优化开始前，都应记录下面这些时间点：

- `request_received_at`
- `goal_committed_at`
- `run_queued_at`
- `bot_prepare_started_at`
- `bot_online_at`
- `calling_task_created_at`
- `call_connected_at`
- `first_bot_audio_at`
- `terminal_detected_at`
- `result_visible_at`

由此得到：

| 指标 | 回答的问题 |
|---|---|
| 请求 → Run 入队 | Agent 规划是否过慢 |
| Run 入队 → Bot Online | Botlab 冷启动是否为主因 |
| Bot Online → Calling 创建 | IAMS、Robot 同步或 Calling 是否过慢 |
| 接通 → 首次 Bot Audio | 下游模型、ASR 或 TTS 是否过慢 |
| 终态 → 用户可见 | Kafka、Redis、数据库或 SSE 是否过慢 |

可以使用 Prometheus Histogram 统计 P50、P95 和 P99，并在 Langfuse Trace 中记录同一组阶段 Span。指标标签应使用 Provider、模型、Region、Voice Profile 和状态等低基数字段，不要把 `run_id` 或电话号码放进 Metrics Label。

只有完成这一步，系统才能判断下一轮优化应该投入 Bot 预热、Worker 调度、外部 API，还是下游模型。

## 7. 如果慢的是通话中的单轮推理

如果测量结果显示瓶颈确实位于 `call_connected → first_bot_audio`，Agentic 层的作用就会明显变小。此时只能进行间接优化：

- 通过 Voice Profile 选择更低延迟的模型；
- 缩短并稳定 Voice Prompt，减少每轮输入 Token；
- 将 RAG、历史 Case 分析和复杂规划放在通话前完成；
- 提前获取工具所需数据，避免通话中执行慢查询；
- 调整 ASR VAD、LLM Streaming 和 TTS Streaming；
- 为下游调用设置 Deadline、Circuit Breaker 和可控的 Fallback。

Agentic 层不应该用无限重试掩盖模型延迟。重试会放大队列压力和尾延迟，还可能在有外部副作用的场景中造成重复执行。

## 结论

当前系统已经通过增量事件、上下文复用、后台执行、实时事件与轮询竞速降低了一部分 Agent 开销和结果发现时间。不过，Outbound 路径仍然将 Bot 创建、发布、上线和 Robot 同步放在每个 Run 的热路径中。

最有价值的下一步，是把 Bot 从“运行时临时资源”升级为“按 RunSpec 版本管理的可复用部署产物”。配合动态参数分离、并行预取、独立 Worker 队列和分阶段延迟指标，可以在不改变 Botlab 模型推理速度的前提下，明显压缩 Agentic 层能够控制的端到端延迟。
