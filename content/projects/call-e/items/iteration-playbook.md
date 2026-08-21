---
title: "分层定位与迭代 Playbook"
summary: "一个 bad case 该改哪一层：Instruction、Skill、Tool、Subagent 还是 Runtime；以及从问题定位到上线的完整迭代纪律。"
---

本文依据知识转移文档 `docs/calle-agentic-knowledge-transfer.md`（基线 2026-08-12）的第 5–8 章与 Product Authoring Playbook 整理。核心原则：产品能自主迭代内容层（Skill、非 Runtime 的 Instruction、评测用例）；触及持久化、副作用、审批、并发和恢复，就得联合工程。

## 1. 竖着看：六类责任边界

| 层 | 回答的问题 | 放什么 | 不放什么 | 谁能改 |
|---|---|---|---|---|
| Instruction | Agent 长期稳定的行为边界 | 角色、原则、沟通方式、Skill 路由、禁止行为 | 单个 bad case、重试次数、状态机 | 产品（Runtime 条款除外） |
| Skill | 一个领域任务该怎么完成 | 步骤、判断标准、询问策略、示例、反例、rubric | 持久化状态、真实副作用、secret | 产品主导 |
| Tool | 系统能安全执行什么动作 | 输入含义、用户能看懂的描述、业务约束 | 纯文本推理和领域方法论 | 联合评审 |
| Subagent | 需要隔离上下文或权限的专业判断 | 判断标准、输出契约、评测样本 | 不是每次模型调用都该是 Subagent | 联合评审 |
| Runtime | 确定性生命周期和可靠性 | 业务要求和可观察结果 | 开放式语义判断 | 工程 |
| Voice Agent | 一次低延迟实时通话 | 对话体验和实时策略 | 长期 Goal 生命周期 | Voice + 产品 |

## 2. 横着看：一个 outcome 跨了哪几层

层级是竖的，用户体验是横的。要问的是「这个体验由哪些能力共同影响」，而不是「我们有几个 Skill」。

- **Outbound（one-shot call & Published Goal）｜ MainAgent + OutboundGoalAgent**：Instruction 为 `root_orchestrator.md + goal/base.md + domain/outbound.md`；Skill 为 `outbound-planner`、`voice-agent-run-strategy`、`outbound-goal-authoring`、`one-shot-call-report`；Tool 含 `prepare_outbound_target`、`create_run_spec`、`run_simulation`、`submit_voice_run` ⚠、`commit_report`。
- **Inbound Hotline｜ MainAgent + InboundGoalAgent**：Skill 为 `inbound-planner`、`inbound-voice-run-strategy`；Tool 含 `upload_intake`、`create_run_spec`、`run_simulation`、`bind_hotline` ⚠。
- **Simulation｜ Runtime 编排 + 三方各自的 prompt**：没有 Skill。一次演练有三个模型在场——被测 Voice Agent 读候选 RunSpec，persona caller 读 `PERSONA_CALLER_INSTRUCTIONS`，Judge 判结果。Runtime 自己不带 prompt：编排、并发、重试和聚合结论都是确定性代码，证据不全一律判「不确定」。
- **Persona｜ 演练时扮演电话对面那个人**：数据在 `simulation/data/builtin_personas.yaml`，8 个内置（合作、忙碌不耐烦、听不懂、怀疑拒绝、打错人、语音信箱挡驾、不感兴趣、分心），支持自定义。演练覆盖到哪些难缠情况全看这份清单——这是产品最该动的地方之一。
- **CallOutcomeJudge｜ Subagent**：单独一份 Instruction，无 Skill、无 Tool、无 session、不改状态。两种模式：给 Simulation 判单场景，给周期复盘判已完成的真实通话。只判单个，不决定整体放不放行。
- **Collection（为 demo 所建）｜ MainAgent + OutboundGoalAgent**：走 Outbound 的 Instruction，Skill 为 `collection-strategy`，支持一通经批准的真实验证电话；不发布、不批量外呼。

⚠ = 受保护动作，执行前必须获得用户明确批准。

Simulation 和 Judge 拆开列，因为两者的边界经常被混：编排、重试和最终结论归 Runtime，语义判断归 Judge——Judge 判每一个场景，Runtime 决定这批算不算通过。能力不必和组件一一对应，不需要为了名字整齐搞一个 SimulationSkill 或 SimulationAgent。

## 3. 失败归属判断

绝大多数返工不是因为改错了内容，而是一开始就把问题定义错了。拿到 bad case 先做归属：

- 模型根本没拿到关键事实 → **Runtime 上下文组装 / durable state**。这条最常被误判成 Instruction 问题，永远先排查它。
- 模型知道该做什么但没照做 → **Instruction**。
- 模型不知道这个领域该怎么做 → **Skill**（塞进 Instruction 会让主 prompt 越来越长）。
- 模型够不到外部系统或执行不了动作 → **Tool**（别把纯文本推理也包成 Tool）。
- 判断过程需要隔离上下文或权限 → **Subagent**（别为了显得规范把一次推理拆出去）。
- 顺序、次数、并发、重试、恢复出错 → **Runtime**（别在 Instruction 里写「请重试三次」）。
- 打断、延迟、ASR / TTS 问题 → **Voice Runtime**（别去改话术）。
- 用户看到的状态不准或难懂 → **Delivery 契约 / 产品表达**（别去改 prompt 措辞）。

**先说现状：评测工具还没有。** `src/calle/agentic/evals/` 下今天只有单测用的 fixture，没有 runner，也没有任何领域的 golden set——「领域评测」「Journey 测试」现在都是人工过。Simulation 不能顶替：它拦的是某一个候选上线前的语义问题，不是改动之后的回归。所以本章描述的门槛是要建的门槛，不是今天就能跑的流程。

## 4. 修改纪律

**改的时候只动一层。** 定位到哪一层就只改哪一层，不顺手加兜底。不允许「先加一条 Instruction 顶一下，回头再重构」——临时规则一旦进了 Instruction 就很难删，因为没人能证明删掉是安全的。宁可让这个 bad case 多存在一天，也别在错误的层留下永久债务。

**验证的是行为，不是文案。** 不要验证：Instruction 里是否出现某句话、模型是否用了某个固定措辞、Tool 是否按预想顺序出现在 trace 里。应该验证：是否只问了必要问题、是否遗漏关键事实、信息不足时是否停下来而不是猜、是否选了正确的 Skill、结构化输出是否正确、副作用前是否请求了正确授权、是否留下正确的 artifact 和 event、失败后是否从已有事实恢复、用户看到的状态是否准确。

**每次修改至少四类案例：**

1. **正常** —— 证明主路径仍然成功。例：信息齐全的预约 / 材料齐全的热线上线。
2. **模糊** —— 证明系统会正确追问。例：「明天晚上」没说几点 / 材料里没写退款时效。
3. **阻塞或危险** —— 证明不会猜测或错误执行副作用。例：号码格式不对仍要求拨打 / 演练没过仍要求绑定热线。
4. **反例与邻近领域** —— 证明新规则不污染其他场景。例：改了中文回复之后，英文用户和模拟客户的语言是否还对。

第四类最容易被跳过，也最容易出事。Instruction 变更必须带邻近领域反例：加一条规则治好了眼前这个场景，却把邻近场景带坏，是最常见的连带破坏。

**Simulation 的边界要一直说清楚。** 它能证明语义正确性、话术合理性、场景覆盖、会不会答不该答的、该升级时是否升级；不能证明 ASR、TTS、打断、线路、音频质量和端到端延迟。它是上线前的语义 gate，不是 Voice E2E 证明——对外沟通不能把「演练通过」和「真机通过」混着说。另外，不让单个模型 Judge 独立决定放行：覆盖度和最终结论由确定性代码聚合；证据不全、覆盖不足或 Judge 本身失败，一律判「不确定」并挡住。宁可挡错，不可放错。

## 5. 复杂度阶梯：能停在左边就别往右

统一到 Agentic 路径说的是目标由 Goal 拥有，不是所有逻辑都塞进模型循环。路径内部还是要爬复杂度阶梯：

```text
Level 0 普通代码 → Level 1 一次 LLM 调用 → Level 2 确定性 workflow
  → Level 3 单个 Agent Loop → Level 4 多 Agent
```

CALL-E 自己的例子分别停在哪：

- **Level 0** —— Simulation 的 trial 编排、覆盖度和结论聚合。顺序、次数、聚合规则都能提前写死，且必须可复现，交给模型只会让放行结论不稳定。
- **Level 1** —— 把通话结果结构化成 receipt（Materializer）。输入固定、输出有 schema、不需要工具和多轮，一次调用够了。
- **Level 2** —— Goal 的调度、恢复、审批中断与续跑。这是可靠性不是判断，模型不负责可靠性。
- **Level 3** —— GoalAgent 推进一个目标。路径没法提前写死，要动态决策、用工具、反复修正，这才是 Agent Loop 成立的地方。
- **Level 4** —— CallOutcomeJudge。唯一的例外，需要上下文隔离和独立权限，否则判断会被被判对象污染。

往右一级付出的是：更难复现、更难排障、更贵、更慢。写不出「为什么左边一级不够」，就停在左边。

**见到这些形态应该停下来：**

- 每个 bad case 增加一条 Instruction → 先做归属判断；
- 每个领域动作创建一个新 Agent → 先拿出上下文污染、权限隔离或并行需求的实测证据；
- 每次结构化推理都创建 Subagent → 一次结构化输出推理就是一次推理；
- 把纯文本判断包装成 Tool → Tool 需要外部 I/O、持久化状态转移或审批边界之一；
- 用 Prompt 管理重试、次数和并发 → 交给 Runtime；
- 为一个调用者提前建 factory / registry / framework → 抽象需要两个当前调用者；
- 在多个层级重复加同一条 guard → 如果 guard 只为兜住本次改动引入的过宽能力，说明该能力本身要收窄；
- 只看模型输出不验证用户可观察结果 → 按行为测；
- 维护「Skill 建设 backlog」却没有对应 outcome → 没有 outcome 就不立项。

这些形态背后是同一个习惯：把 Instruction 当成所有 Agent 问题的默认修复位置。加一条规则最快，也最难删——没人能证明删掉是安全的。也不做「为了完整性」的组件：没有当前调用者、没有当前用户 outcome、没有具体事故证据的，一律不建。「将来可能需要」不是理由。

## 6. 每个人能推的那一块

说到底只有两种人：一种把机器造得更结实，一种把「机器该做什么」定义得更准。两边都不用等对方先动。

- **擅长工程的** —— 让系统在用户不在场时仍然可信：durable state、事件、调度、幂等、恢复、权限、Tool 执行、审批边界，以及实时通话层的 ASR / TTS、turn-taking、barge-in。检验标准很硬：崩了能不能接着跑，同一个动作会不会执行两次，批准的是不是那一次动作本身。
- **擅长定义问题的** —— 让系统做对的事，并且能证明它做对了：用户 outcome、旅程、Skill 内容、示例与反例、验收标准、bad case 归属、golden set 和回归，以及这次改动到底怎么推动北极星指标。检验标准是：说不说得出这个改动服务哪个 outcome，拿不拿得出它有效的证据。

还有一顶帽子跟工种无关：**Domain DRI** —— 某个 Skill 或 Judge 的 rubric、版本和效果归谁管。两边的人都能戴，但今天 7 个 Skill、1 个 Judge 一顶都没人戴。没有 DRI 就没有 rubric、没有 golden set、没有上线门槛，而这直接决定一个 bad case 最后被修在哪一层。

- **产品可以自主推进**：Skill 里的领域方法、阻塞问题的询问策略、示例与反例、非 Runtime 的 Instruction 条款、用户状态表达措辞、评测用例、报告内容结构。
- **必须联合工程评审**：Tool schema、新的外部副作用、审批粒度、durable state、RunSpec schema、Tool 权限、新 Subagent、Runtime 重试并发恢复、自动续拨或批量执行策略。

这条线不是限制谁，是让「产品自己迭代」这句话能兑现：产品拥有内容和评测闭环，运行边界由工程守着，两边都不用猜对方会不会动同一个地方。

## 7. Playbook 模板速查

**Skill 模板（八段，缺一段就是没写完）**：name / description（决定模型什么时候加载它，写触发场景不写功能罗列）→ Outcome（用户可观察的结果，不写内部产物）→ When to use / not → Required inputs（必须存在 / 允许推导 / 不得猜测，三类分开）→ Procedure（步骤 + 可执行的判断标准）→ Output contract（ready / 待补充 / 阻塞各自的含义和触发条件）→ Boundaries（不创建什么状态、不执行什么副作用、不声称完成了什么）→ Examples（至少四个：正常、模糊、阻塞、反例）→ Evaluation（golden cases 位置、判断标准、上线门槛）。Skill 里不能出现：持久化状态、真实副作用、secret、「我已经创建了 / 已经发送了」这类声称、对 Runtime 重试和并发的要求。

**Instruction 模板（短比长好）**：角色 → 长期目标（一句话）→ 稳定原则（写不出「哪些场景不适用」的原则，多半是特例伪装的）→ Skill 路由（Instruction 最有价值的部分）→ Tool 使用边界 → 沟通规则 → 明确禁止（每条对应一个真实风险）。加一条之前先问：这条跨场景成立吗？会不会跟已有规则冲突？三个月后有人想删掉它，能证明删除是安全的吗？

**Bad case triage 卡**：先对照四条体验承诺说清破了哪一条；然后填——实际发生了什么（用户原话 + 系统当时做了什么 + 当时的目标）、本该发生什么（能判对错的一句话）、能否复现、归属初判 + 理由、**模型当时到底有没有拿到这个事实**（先答这个，再谈改哪层）、影响面。

**发布前 checklist**：已还原用户可观察的失败；已做归属判断且只改了一层；四类案例齐全含邻近领域反例；领域评测与 Journey 测试通过；没有为了通过测试而扩大 Tool 权限或放宽审批；用户可见措辞已复核（没把「已保存」说成「已完成」，没把「演练通过」说成「已成功」）；涉及副作用、durable state 或审批粒度的已完成工程联合评审；已确定观察指标和回滚条件。

接下来回到工程视角：[技术架构与框架取舍](/zh/projects/call-e/technical-architecture)解释这套产品模型为什么落在显式 Python Runtime 上。
