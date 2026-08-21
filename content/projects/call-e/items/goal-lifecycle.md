---
title: "Goal 的生命周期：开发者旅程 PRD"
summary: "从创建 Goal 到 Simulation、Live Test、真实呼叫测试、API 集成与生产后持续改进的完整开发者流程，以及 P0–P3 的任务拆分与验收标准。"
---

本文依据 PRD《CALL-E | GOAL 的生命周期》（2026-08-13）整理。它描述的是**目标产品体验**——开发者视角下 Goal 从创建到生产迭代的完整旅程；各项的当前实现状态以[开发状态页](/zh/projects/call-e/development-plan)为准，两者不一致时不要把 PRD 当作已交付能力引用。

## 0. 总览：一个循环，不是一条直线

```text
Create Goal → Goal Created
  → Choose Next Step（每次 Goal Updated 后也回到这里）
      → System Test (Simulation) ｜ Live Test (Conversation)
        ｜ Real Call Test (Phone Call) ｜ API Integration
  → Analyze Result / Find Issues → Goal Updated
  → 回到 Choose Next Step
```

关键设计：验证不是一次性的关卡，而是「测试 → 发现问题 → 更新 Goal → 再选下一步」的循环。系统按当前验证状态推荐下一步，但开发者随时可以选别的。

## 1. 创建入口

三个入口：Goal 页面的【Create a goal】按钮、`/create goal` 命令、goal icon。默认引导语明确承诺流程：「CALL-E will simulate calls, find potential issues, and guide you through improvements until your goal is ready to run.」

## 2. Step 1：创建 Goal

**1-1 用户主动创建。** 用户用自然语言描述任务（如「handle customer calls and help them with their requests」）。系统不复述一句话就创建，而是先进入 **Goal Understanding**：展示理解出的 Goal 名称，并列出影响通话质量的关键缺口问题——谁来电？通话结束后该发生什么？CALL-E 能访问哪些系统（订单系统、CRM、人工坐席）？然后给用户两个动作：[Create initial Goal] / [Help me define it]。

创建完成的回执包含 name、goal、assumptions，并明确声明「**No validation has been run yet**」，随后给出状态感知的推荐：Step 1 — Simulation Test，同时保留 [Choose another step] 和 [View API Integration]。这与四条体验边界里「系统说的状态是真的」一致：已创建就是已创建，不说成已可用。

**1-2 系统基于上下文推荐创建。** 当对话中反复出现相同任务（「打给这个客户确认今天能否收货」→「下一个客户同样问」→「这三个客户都一样」），系统主动识别重复模式，建议沉淀为 reusable Goal，并基于上下文生成 Draft：name、goal、behavior 列表和 result fields（如 `customer_reached`、`can_receive_today`、`preferred_receiving_time`、`notes`），用户确认 [Create Goal] / [Edit before creating] / [Cancel] 后才落库。

打扰控制是显式需求：用户选 [Continue manually] 后，当前 session 内不再反复提示；选 [Not now] 后，系统可在后续几轮通话后重新判断，重复模式仍然明显时再次提示。

## 3. Step 2：Simulation Test（系统自测）

低成本自测，不打真电话。系统基于 Goal 从四个维度设计测试：

1. **Core scenarios** —— 主任务能否完成；
2. **Common variations** —— 不同的客户请求能否处理；
3. **Edge cases** —— 意料之外的问题会怎样；
4. **Missing information** —— 完成任务还缺什么信息或规则。

生成的每个 test case 都带客户原话和验证目标；执行结果标记 pass / needs improvement。发现问题时不自动改，而是把决策权交给用户——例如「订单状态查询该怎么处理：1. 询问订单号并记录 2. 接入订单系统 3. 转人工 4. 添加其他指令」——用户选择后把新行为写回 Goal，然后推荐下一步 Live Conversation Test，并明确「不会要求你从 Simulation 重来，除非你选择针对新边界场景重跑」。

## 4. Step 3：Live Conversation Test

在浏览器里直接和 Goal 对话，体验它的真实应对，**不发起电话**。结束后系统分析 transcript、指出问题（「客户问了当前 Goal 没覆盖的信息」）、说明影响（「对话可能中断或需要人工支持」），并给出可选修复：记录后跟进 / 接入更多信息源 / 转人工 / 自定义规则。用户选择后更新 Goal，推荐进入 Real Phone Call Test，同时允许先再跑一轮 Live Test 验证特定场景。

## 5. Step 4：Real Phone Call Test

真实电话验证完整体验——开场、语音表现、用户追问、结果结构化。每通后系统主动汇报发现的问题并提供可选修复：

- 第一通：客户问「哪家公司？」「送的什么？」→ 补充公司介绍与来意说明；
- 第二通：客户问「司机什么时候到？」→ 选择「收集客户可收货时间」而非做不支持的承诺；
- 第三通：客户无法收货 → 系统发现结果难以追踪，建议结构化 outcome 分类（示例：`DISPONIVEL_AGORA`、`NAO_CONSEGUE_RECEBER`、`SEM_ATENDIMENTO` 等）。

每通电话使用最新 Goal；多次通话稳定后，系统汇总改进清单（公司介绍、可收货确认、收货时间收集、问题应对、结构化结果），用户确认 [Update Goal] 一次性写回。之后推荐 API Integration，仍可继续测试增强信心。

## 6. Step 5：API Integration

Goal 验证稳定后，开发者可以把它接入自己的系统。调用时只需提供动态信息，对话逻辑和已沉淀的改进由 Goal 管理：

```text
POST /v1/calls
{
  "goal_id": "customer_support_assistant",
  "recipient": { "phone": "+1234567890" },
  "context": { "customer_name": "John", "order_id": "12345" }
}
```

结果以结构化 schema 返回（`status`、`result.customer_intent`、`resolved`、`follow_up_required` 等），并可配置 result format、webhook 通知、call triggers 和 batch calling。

注意：这一态对应知识转移文档里的 Published Goal 路径——对外契约（`goal-runs-developer-api-sdk` 等 spec）截至 2026-08-12 仍是 Draft。PRD 描述的是交付目标，不代表 API 已冻结。

## 7. Step 6：生产后的迭代与持续改进

Goal 上线不是终点。系统持续分析生产通话、检测重复模式（例：「34 位客户询问配送到达时间，当前 Goal 未定义如何回答，21 通需要人工跟进」），并在 Goal Detail 页展示「✨ Improvement available」提醒，而不是在对话里反复打扰。

用户点击 [Review suggestion] 回到 Conversation 页面：系统说明发现的模式、当前行为的缺口、建议的新行为（「解释可用信息、不做无依据的配送承诺、必要时收集跟进请求」），用户选择 [Apply update] / [Edit suggestion] / [Ignore]。改进始终以草稿候选形式出现，不会自动上线——这与 Inbound 周期复盘「默认关闭、产出草稿候选」的治理一致。

## 8. 状态感知的 Next Step 推荐

系统维护每个 Goal 的 validation status，推荐跟随上下文而不是机械从头开始：未测试 → Simulation；Simulation 完成 → Live Test；Live Test 完成 → Real Phone Call；真实电话稳定 → API Integration。每一步都保留 [Choose another step]。这条规则贯穿全链路，是 P1 级需求。

## 9. 任务拆分与优先级

| 优先级 | 任务 | 产品目标 | 验收标准（摘要） | 对应链路 |
|---|---|---|---|---|
| P0 | Goal 创建入口与基础创建流 | 从 Goal 页面、命令或输入框发起自然语言创建 | 生成 draft Goal 并保存 name、goal、assumptions、status；创建后进入状态感知推荐 | Step 1 |
| P0 | Goal Understanding 阶段 | 避免 AI 只复述用户一句话，先展示理解和缺口 | 创建前必须展示 goal name、关键缺口问题、[Create initial Goal] / [Help me define it] | Step 1 / 1-1 |
| P1 | 状态感知的 Next Step 推荐 | 推荐符合当前上下文，不机械重复 | 维护 validation status；按验证进度推荐下一步；保留 [Choose another step] | 全链路 |
| P1 | Simulation Test 闭环 | 低成本自测发现缺失指令和边界场景 | 生成 test cases、执行模拟、标记 pass / needs improvement、向用户要决策并写回 Goal | Step 2 |
| P1 | Goal 更新与版本写回 | 每轮测试发现沉淀为可复用能力 | 每次 update 记录变更来源、内容、影响的测试阶段；更新后重算推荐下一步 | Step 2–4 |
| P1 | 重复任务检测与上下文创建 Goal | 反复手动任务主动沉淀为 reusable Goal | 识别 session 内重复意图；[Continue manually] 后本 session 不再打扰；[Not now] 后可重新判断 | Step 1 / 1-2 |
| P2 | Real Phone Call Test 闭环 | 验证完整电话体验 | 真实电话使用最新 Goal；每通后发现问题、提供可选修复；稳定后可统一更新 Goal | Step 4 |
| P2 | 验证历史与问题追踪 | 开发者知道 Goal 为什么被更新、当前是否可信 | Goal detail 展示各测试阶段结果、发现的问题、采纳的修复和当前 validation status | Step 2–4 |
| P2 | 生产后 Review 触发 | 线上真实问题回流为优化建议 | 检测重复模式；Goal 页展示 Improvement available；回到 Conversation review / apply / edit / ignore | Step 6 |
| P2 | 高级迭代策略与打扰控制 | review 和重测成为有节奏的工作流 | 按问题频率、影响范围、最近是否已忽略决定触发；支持暂缓、忽略、按阶段 rerun | Step 6 / 全链路 |
| P3 | Live Conversation Test 闭环 | 浏览器里体验对话效果，不发电话 | 进入浏览器对话；结束后分析 transcript、指出问题、给出优化选项并更新 Goal | Step 3 |
| P3 | API Integration 交付 | 验证后接入开发者系统 | 提供 goal_id、dynamic context schema、Create Call API 示例、result schema；webhook / trigger / batch 配置入口 | Step 5 |
| P3 | 规模化集成增强 | 支持更复杂的生产使用场景 | 批量拨打、号码连接、结果字段自定义、Webhook retry、失败回放、Goal performance 面板 | Step 5–6 |

## 10. 与产品模型的对应关系

PRD 的旅程与 [三条典型产品旅程](/zh/projects/call-e/product-journeys) 是同一骨架的两种表述：Simulation Test 对应「验证」，Real Phone Call Test 对应交互式 Outbound 的受保护真实拨打，API Integration 对应 Published Goal 的发布契约，生产后 Review 对应周期复盘。差异在视角：PRD 面向开发者的逐步操作与打扰控制，产品旅程页面向系统内部谁来推进、在哪一层批准。

接下来看[分层定位与迭代 Playbook](/zh/projects/call-e/iteration-playbook)：当 PRD 的某个验收标准不达标时，问题该改到哪一层。
