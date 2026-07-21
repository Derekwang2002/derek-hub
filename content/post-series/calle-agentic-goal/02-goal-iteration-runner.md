---
title: "追踪 GoalIterationRunner——Lease、Cursor 与恢复如何协作"
summary: "从 needs_dispatch=true 出发，逐段阅读 GoalIterationRunner，理解事件批次、Lease 抢占、Cursor 推进、事务所有权与失败恢复。"
---

本文基于 `prod-dive-in` 提交 `aa7af64`。上一篇停在 `goal_committed` 已经落库、`needs_dispatch=true` 的时刻；这一篇从后台接手开始，沿着 `GoalIterationRunner.run_goal_iteration()` 读完一次 iteration 的生命周期。

如果你刚开始读源码，先记住一句话：**Iteration 不是一通电话，而是 GoalAgent 读取一批新事实、做一次决策并可靠保存结果的工作回合。**

## 1. 这一篇解决什么问题

继续使用餐厅例子。MainAgent 已经把“询问明晚 7 点两人位”提交为 Goal，数据库也已经表示需要派发。现在系统必须回答：

- 两个后台任务同时看到这个 Goal 时，谁来处理？
- GoalAgent 应该读全部历史，还是只读上次之后的新 Event？
- 模型运行需要几十秒时，数据库事务是否一直保持打开？
- 模型失败或进程崩溃后，谁来解除“处理中”状态？
- 怎样确保下次 iteration 从正确位置继续？
- GoalAgent 的输出何时才算产品事实？

这些问题分别对应本篇的四个核心概念：

| 概念 | 回答的问题 |
|---|---|
| `needs_dispatch` / backlog | 现在有没有工作值得做？ |
| Lease | 当前由哪个 iteration 暂时拥有处理权？ |
| Event Cursor | 哪些 Goal Event 已经被消费者处理过？ |
| 事务边界 | 哪些状态已经耐久，哪些仍可整体回滚？ |

这一篇会停在 GoalAgent 产出 `voice_run_ids` 的边界。`RunSpec → Run → VoiceRunExecutor` 怎样真的拨出电话，留给下一篇。

## 2. 先看完整调用链

先把一次成功 iteration 压缩成一张图：

```text
CallEAgent._run_goal_iteration_once(goal_id)
  ▼
GoalIterationRunner.run_goal_iteration(goal_id)
  ├─ 读取 Goal、Dispatch 与最新 Event ID
  ├─ 没有待办事件 → 返回 no_pending_goal_events
  ├─ claim_iteration(...)
  │    ├─ 锁定 Goal / Dispatch 行
  │    ├─ 检查现有 Lease
  │    └─ 写 active_iteration_id、lease_until、running
  ├─ 读取 cursor 之后的新 Event
  ├─ 确保 GoalAgent 专属 Session
  ├─ commit()  ← 先让 Claim 变成耐久事实
  ├─ Runner.run(...) / Runner.run_streamed(...)
  ├─ require_iteration_output(...)
  ├─ apply_iteration_output(...)
  ├─ advance_cursor(...)
  ├─ release_iteration(...)
  └─ 返回 GoalIterationRunResult

CallEAgent（事务所有者）
  ├─ commit()  ← 提交本轮产品状态
  ├─ 发布已经提交的 Session Event
  └─ 后台持久化 OpenAI context
```

这张图有两个不同的 `commit()`。Runner 内部的第一次提交只把“我已经抢到这个 iteration”固定下来；外层 `CallEAgent` 的提交才把本轮 Goal 更新、Cursor、Release 与 Context Delivery 一起变成最终产品状态。把两者混为一谈，会误判失败恢复的行为。

## 3. Runner 不是调度器，而是一次消费尝试

`GoalIterationRunner` 的构造函数接收数据库会话、模型配置、Workspace、Lease TTL、Event 批次大小以及 Session Event 基础设施。它知道怎样完成“一次 iteration”，却不决定系统何时不断轮询所有 Goal。

真正的入口由 `CallEAgent._run_goal_iteration_once()` 调用：

```text
调度层：哪个 goal_id 现在应该尝试？
    ↓
Runner：这个 goal_id 的一次尝试能否 Claim、读取什么、如何提交结果？
```

这种拆分使 `GoalIterationRunResult` 可以明确说明本次尝试的结果：

- `claimed`：有没有抢到处理权；
- `dispatched`：有没有真的运行 GoalAgent；
- `reason`：`dispatched`、`no_pending_goal_events` 或 `goal_iteration_already_claimed`；
- `processed_event_count`：输入批次包含多少新 Event；
- `last_processed_goal_event_id`：完成后 Cursor 到哪里；
- `iteration_status`、`next_wakeup_at`、`summary`：GoalAgent 给出的下一阶段状态；
- `voice_run_ids`、`context_deliveries`：交给其他 runtime 的输出引用。

因此，“调度函数被调用”不等于“模型一定运行”。Runner 先做两道门禁。

## 4. 第一道门：真的有新工作吗

Runner 先读取 Goal、Dispatch 和该 Goal 当前最大的 Event ID。核心判断可以写成下面的等价逻辑：

```python
has_backlog = (
    latest_event_id is not None
    and latest_event_id > dispatch.last_processed_goal_event_id
)

if not dispatch.needs_dispatch and not has_backlog:
    return no_pending_goal_events
```

这里同时检查布尔信号和真实 backlog，而不是只相信 `needs_dispatch`：

| `needs_dispatch` | `latest_event_id > cursor` | 行为 |
|---|---:|---|
| `false` | `false` | 直接返回，没有工作 |
| `true` | 任意 | 尝试 Claim |
| `false` | `true` | 仍尝试 Claim，避免漏掉真实新事件 |

`needs_dispatch` 是便于索引和唤醒的物化信号；Event ID 与 Cursor 的差值则是可以重新计算的事实。两者并用，能让系统在信号没有及时更新时仍看见 backlog。

如果 Dispatch 行还不存在，Runner 把 `last_processed_event_id` 当作 `0`。正常创建 Goal 的路径会同时创建 Dispatch，这个分支仍让边界更稳健。

## 5. 第二道门：用 Lease 防止重复消费

确认有工作后，Runner 生成新的 `iteration_id`，调用：

```python
claimed = await goal_store.claim_iteration(
    goal_id=goal.goal_id,
    iteration_id=iteration_id,
    lease_ttl_seconds=self.lease_ttl_seconds,
)
```

`claim_iteration()` 先锁 Goal 行，再锁 Dispatch 行。锁内如果发现：

```text
active_iteration_id != null
并且 lease_until > now
```

就返回 `false`。否则它把当前 iteration 写成新 Owner：

```text
active_iteration_id = 本次 iteration_id
lease_until         = now + TTL
iteration_status    = running
```

两个 Worker 同时到达时，可以这样理解：

```text
Worker A                数据库行锁                 Worker B
   │ claim                  │                         │ claim
   ├───────────────────────►│                         │
   │ 写入 Lease             │◄────────────────────────┤ 等待锁
   │ flush                  │                         │
   │ 释放锁后               │────────────────────────►│ 读到有效 Lease
   │                        │                         │ 返回 claimed=false
```

数据库行锁解决“同时检查、同时写入”的竞争；Lease 则解决 Worker 拿到所有权后需要跨越较长模型调用的问题。

## 6. 为什么是 Lease，而不是永久锁

如果系统只保存一个永不过期的 `running=true`，Worker 在断电、被强制终止或网络分区后可能永远没有机会清理它。Lease 给所有权增加到期时间：

- 正常完成：Owner 主动 `release_iteration()`；
- 可捕获异常：Runner 回滚本轮写入，再主动释放为 `idle`；
- 进程直接消失：没有清理代码运行，但 `lease_until` 最终过期；
- 后续 Worker：看到过期 Lease 后可以写入新的 `iteration_id`。

这里必须区分“当前实现”和“可扩展能力”。Store 提供 `renew_iteration()`，可以验证 Owner 后延长 TTL；但提交 `aa7af64` 的 `GoalIterationRunner` 主路径没有定时调用它。Runner 默认 TTL 是 300 秒。因此，源码当前依赖 iteration 在 Lease 窗口内完成；若未来允许更长模型或工具流程，就需要把续租接入真实执行路径，而不能只因为 Store 有这个方法就认为系统已经自动续租。

这也是源码阅读的重要方法：**定义了某个能力，不等于主调用链已经使用它。**

## 7. Claim 为什么必须在模型运行前提交

抢到 Lease 后，Runner 读取新事件、协作上下文并确保 GoalAgent 专属 Session。随后在调用模型之前执行：

```python
await self.db_session.commit()
```

原因不是“模型输出已经完成”，而是要让其他数据库连接看见 Claim。如果 Claim 只停留在未提交事务里，然后 Runner 用几十秒调用模型：

- 其他 Worker 可能看不见 Owner；
- 长事务会长时间持有锁与旧快照；
- 模型或外部工具等待会把数据库资源一起拖住。

可以把这一步理解成耐久地挂出一块牌子：

```text
阶段 A（短事务）
  抢 Lease + 准备 Session
  COMMIT

阶段 B（无长期数据库行锁）
  调用 GoalAgent / 模型 / 工具

阶段 C（产品事务）
  应用输出 + 推进 Cursor + 释放 Lease
  由外层 Owner COMMIT
```

测试 `test_openai_goal_iteration_commits_claim_before_model_and_leaves_final_state_to_owner` 和对应的 non-OpenAI 测试专门验证：模型运行前恰好发生 Claim 提交，而最终产品状态仍由调用者决定提交或回滚。

## 8. Cursor 怎样决定本轮输入

Claim 成功后，Runner 调用：

```python
new_events = await goal_store.list_goal_events_after(
    goal_id=goal.goal_id,
    after_event_id=last_processed_event_id,
    limit=self.max_event_batch_size,
)
```

Cursor 保存在 `calle_goal_dispatches.last_processed_goal_event_id`。它不是“Goal 当前版本”，也不是某个数组下标，而是这个消费者已经确认处理到的最大耐久 Event ID。

假设数据库中有：

```text
Event 41  goal_created
Event 42  goal_committed
Event 43  user_update
Event 44  confirmed
Cursor = 42
```

那么本轮输入是 43、44。成功后 Cursor 才向前；如果本轮失败，Cursor 仍是 42，下次仍能重新读取同一批事实。

第一次 iteration 的 Cursor 为 0，`build_goal_iteration_input()` 会设置：

```json
{
  "dispatch_type": "goal_bootstrap",
  "goal": {
    "goal_id": "goal_restaurant",
    "goal_type": "one_shot_outbound",
    "objective": "询问明晚 7 点的两人位",
    "current_status": "planning"
  },
  "events": [
    { "event_id": 41, "event_type": "goal_created" },
    { "event_id": 42, "event_type": "goal_committed" }
  ]
}
```

后续 iteration 使用 `dispatch_type="goal_events"`，只发送 Cursor 后的 Event，不再重复完整 Goal bootstrap。测试 `test_goal_iteration_runner_sends_only_new_events_after_bootstrap` 正是用两轮调用固定这个契约。

## 9. 输入不只有 Event

`build_goal_iteration_input()` 还做三件容易被忽略的事：

1. 首轮附带 Goal 当前快照，包括 objective、status、version、revision 与 payload；
2. 把 `collaboration_context.response_language` 放进输入；
3. 首轮把 `GoalBrief.source_refs` 中位于 `uploads/` 的文件解析成图片或文件输入。

因此，Cursor 负责增量事实，Goal bootstrap 负责第一次建立工作上下文，GoalAgent 专属 Session / Responses context 则负责模型连续性。它们不是同一种“记忆”：

| 机制 | 保存什么 | 是否是业务事实来源 |
|---|---|---|
| Goal/Event | 产品状态与发生过的事实 | 是 |
| Dispatch Cursor | 消费进度 | 是，属于 runtime 状态 |
| GoalAgent Session/context | 模型对话连续性 | 否，不能替代产品状态 |

## 10. GoalAgent 必须显式完成 iteration

Runner 根据 `goal_type` 构建 `OutboundGoalAgent` 或 `InboundGoalAgent`，然后调用 `Runner.run()`；有实时 Session Event 总线时使用 `Runner.run_streamed()`。

模型返回文本并不代表 iteration 完成。执行期间，`complete_goal_iteration` 工具会产生 `GoalIterationCompletedEvent`。运行结束后：

```python
output = require_iteration_output(completion_events)
```

要求完成事件**恰好一个**：

- 0 个：抛出 `GoalIterationCompletionError`；
- 多于 1 个：同样抛错；
- 恰好 1 个：取得结构化 `GoalIterationResult`。

这条边界阻止系统从模型自然语言中猜测状态。只有结构化完成工具里的 `goal_state_patch`、`events_to_emit`、`iteration_status`、`resume_after_minutes`、`context_deliveries` 等字段才进入后续产品写入。

## 11. 成功路径：先应用输出，再推进 Cursor

`apply_iteration_output()` 使用 `GoalAgent` actor 应用结构化结果：

- 可选更新 Goal state；
- 保护 MainAgent 提交的 `GoalBrief`，不允许 GoalAgent 偷换；
- 追加允许由 GoalAgent 发出的 Event；
- 拒绝伪造由 runtime 拥有的 Event 类型；
- 用 `iteration_id` 派生幂等键。

然后 Runner 重新查询当前最新 Goal Event ID，并调用 `advance_cursor()`。Store 只允许 Cursor 单调增加：

```python
if new_cursor > old_cursor:
    old_cursor = new_cursor
```

接着再次比较数据库最新 Event ID。如果最新 Event 已经不大于 Cursor，才把 `needs_dispatch=false`。这意味着清除唤醒信号不是一个盲写动作，而是“消费者已经追上事件流”的结果。

注意当前源码的精确定义：Runner 在应用本轮输出后查询 `latest_goal_event_id`，因此 Cursor 会覆盖本轮处理过程中写入的 Goal Event，而不只是最初输入列表最后一个 Event。阅读并发语义时，应以这段实际代码为准，不要把 `processed_event_count` 误当成 Cursor 的计算依据。

## 12. Release 不等于完成整个 Goal

Cursor 推进后，Runner 根据 `resume_after_minutes` 计算 `next_wakeup_at`，再调用：

```python
await goal_store.release_iteration(
    goal_id=goal.goal_id,
    iteration_id=iteration_id,
    iteration_status=output.iteration_status,
    next_wakeup_at=next_wakeup_at,
)
```

Store 会先断言 `active_iteration_id` 仍等于本轮 ID，避免旧 Worker 释放新 Worker 的 Lease，然后清空 Owner 与到期时间。

`release_iteration()` 只表示**本轮处理权已经归还**。`iteration_status` 可能是等待 Event、等待唤醒或其他中间状态；Goal 本身也可能仍在 `calling`、`needs_confirmation` 等状态。Iteration 完成与 Goal 完成是两个不同层级。

## 13. 最终 commit 属于 CallEAgent

`run_goal_iteration()` 返回时，成功路径上的 Goal patch、Event、Cursor、Release、Session runtime state 与 Context Delivery 仍处于外层产品事务中。`CallEAgent._run_goal_iteration_once()` 随后负责：

```python
try:
    result = await runner.run_goal_iteration(goal_id=goal_id)
    await db_session.commit()
except Exception:
    await db_session.rollback()
    raise
```

这提供一个重要的原子边界：不能只提交“Goal 状态改了”，却没有提交 Cursor；也不能已经推进 Cursor，却丢失本轮结果。

只有产品事务提交以后，`CallEAgent` 才发布 `committed_session_envelopes`。因此实时客户端收到的耐久 Session Event 对应已经提交的数据库事实，而不是之后可能回滚的草稿。

## 14. 失败路径：回滚结果，释放 Lease，不推进 Cursor

如果模型调用、完成事件校验或产品写入中的任一步抛错，Runner 的异常处理执行：

```text
ROLLBACK 当前未提交产品变化
  ↓
release_iteration(iteration_status="idle")
  ↓
COMMIT 释放 Lease
  ↓
重新抛出原异常
```

失败后的关键状态是：

| 字段 | 结果 |
|---|---|
| `active_iteration_id` | `null` |
| `lease_until` | `null` |
| `iteration_status` | `idle` |
| Event Cursor | 不前进 |
| 本轮未提交的 Goal/Event 变化 | 回滚 |

Cursor 不前进，使后续尝试可以重新读取相同输入。显式提交 Lease 释放，则避免正常异常后还要白等 TTL。

`test_goal_iteration_runner_releases_iteration_after_goal_agent_failure` 验证模型失败后的清理；`test_goal_iteration_runner_requires_complete_goal_iteration_tool` 验证模型没有调用完成工具时也走同一恢复路径；`test_goal_iteration_runner_preserves_original_db_error_after_aborted_transaction` 还确保事务已经 aborted 时，先 rollback 再 release，不会用二次数据库错误遮住原始异常。

## 15. 进程崩溃时怎样恢复

异常处理只能处理进程仍然活着、Python 有机会运行 `except` 的情况。如果 Worker 在 Claim 已提交后被直接终止：

```text
耐久状态：active_iteration_id = giter_A
          lease_until = 12:05
          cursor = 42

12:02  Worker A 消失，没有执行 release
12:03  Worker B 尝试，Lease 仍有效 → claimed=false
12:06  Worker C 尝试，Lease 已过期 → 覆盖为 giter_C
       cursor 仍是 42 → 重新读取原事件
```

这是一种“至少再尝试一次”的恢复形态，而不是魔法般从模型的中间 token 继续。系统恢复的是**耐久输入位置与处理所有权**，不是进程内调用栈。

因此，iteration 内的现实副作用必须继续依赖 Run/工具层自己的幂等与状态机。Lease 和 Cursor 防止 Goal Event 消费被轻易丢失，但它们单独不能保证外部电话绝不重复。这正是下一篇需要进入 RunSpec 与 Run runtime 的原因。

## 16. 为什么 OpenAI context 要晚于产品 commit

如果模型配置使用 OpenAI Responses context，Runner 会暂存 `_pending_openai_context`，但不会把 context 持久化混入本轮产品事务。产品 commit 后，`CallEAgent` 才安排：

```python
await runner.persist_openai_context_after_commit()
```

而且它使用独立数据库 Session。这个顺序表达了明确的优先级：

```text
Goal/Event/Cursor/Lease 等产品终态先提交
                 ↓
模型上下文与 compaction audit 后持久化
```

如果后一步失败，已经完成的产品 iteration 不能被倒带。测试 `test_openai_context_failure_after_product_commit_cannot_roll_back_iteration_terminal` 固定了这条边界。

模型 context 可以帮助下一轮减少重复输入，但系统的恢复真相仍是 Goal、Event、Dispatch 和 Session 等耐久产品记录。

## 17. 用测试反推设计契约

建议不要只顺着实现读，也要把测试当作可执行架构文档：

| 测试 | 固定的契约 |
|---|---|
| `test_goal_iteration_runner_runs_outbound_goal_agent_and_advances_cursor` | 首轮输入、结构化输出、Cursor 与 Release |
| `test_goal_iteration_runner_sends_only_new_events_after_bootstrap` | bootstrap 之后只发送新 Event |
| `test_goal_iteration_runner_respects_active_actor_lease` | 有效 Lease 阻止第二个 GoalAgent 运行 |
| `test_goal_iteration_runner_releases_iteration_after_goal_agent_failure` | 异常后释放 Owner 并回到 idle |
| `test_goal_iteration_runner_requires_complete_goal_iteration_tool` | 不能从普通模型文本推断完成 |
| `test_openai_goal_iteration_commits_claim_before_model_and_leaves_final_state_to_owner` | Claim 先提交，产品终态由外层拥有 |
| `test_openai_context_failure_after_product_commit_cannot_roll_back_iteration_terminal` | 模型 context 失败不能回滚产品事实 |

读测试时尤其关注“何时 commit / rollback”和“另一个 Session 能看到什么”，因为这些断言比单个函数名更能说明真实事务边界。

## 18. 源码阅读清单

建议按照“入口 → Runner 主干 → 输入 → Store 并发原语 → 输出应用 → 事务 Owner → 测试”的顺序阅读：

1. `services/seleven-mcp/src/calle/agentic/agents/calle.py`
   - 找 `_run_goal_iteration_once()` 与 `_run_goal_iteration_post_commit()`。
2. `services/seleven-mcp/src/calle/agentic/runtime/goal_iteration_runner.py`
   - 先只读 `run_goal_iteration()`，再读辅助方法。
3. `services/seleven-mcp/src/calle/agentic/runtime/goal_iteration_input.py`
   - 对照 bootstrap、增量 Event 与上传文件。
4. `services/seleven-mcp/src/calle/agentic/goals/store.py`
   - 阅读 `claim_iteration()`、`renew_iteration()`、`advance_cursor()`、`release_iteration()`。
5. `services/seleven-mcp/src/calle/db/models/goal.py`
   - 对照 Dispatch 的 Owner、Lease、Cursor、status 与索引。
6. `services/seleven-mcp/src/calle/agentic/runtime/iteration.py`
   - 阅读 `require_iteration_output()` 与 `apply_iteration_output()`。
7. `services/seleven-mcp/src/calle/agentic/runtime/models.py`
   - 查看 `GoalIterationRunResult` 和相对唤醒时间。
8. `services/seleven-mcp/tests/test_calle_agentic_goal_runtime.py`
   - 用成功、并发、失败和 context 测试校验心智模型。

源码会继续变化，所以文件路径和符号名比瞬时行号更值得记忆。本文所有结论都以提交 `aa7af64` 为准。

## 19. 本篇心智模型

最后把整篇压缩成六句话：

1. `needs_dispatch` 是唤醒信号，`latest_event_id > cursor` 是可以重新计算的 backlog 事实。
2. Claim 在行锁内写入带期限的 `iteration_id`，阻止两个 Worker 同时消费同一 Goal。
3. Claim 在模型运行前单独提交，避免其他连接看不见 Owner，也避免长时间占用数据库事务。
4. Cursor 只在结构化输出成功应用后推进；失败时不推进，所以相同事件可以重试。
5. 正常异常会显式释放 Lease；进程崩溃则依靠 Lease 过期恢复，但当前主路径没有自动续租。
6. 产品终态由 `CallEAgent` 原子提交，OpenAI context 在 commit 后独立持久化，不能反过来决定业务事实。

下一篇将接住本轮返回的 `voice_run_ids`，追踪 `RunSpec → Run → VoiceRunExecutor` 如何把 GoalAgent 的决定变成一通真实电话，并解释外部副作用自己的状态机与幂等边界。
