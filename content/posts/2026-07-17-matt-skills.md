---
title: "别再让 Agent 一口气“实现并测试”：用 Matt Pocock Skills 把开发拆成五步"
date: 2026-07-17
summary: "一条“实现这个功能并测试”的大 Prompt，容易让编程 Agent 误解需求、扩大范围、事后补测试。Matt Pocock 的 Skills 把开发拆成 grill、spec、tickets、TDD 实现和 code-review 五步，每一步结束都停下来等人确认。本文整理每一步的 Prompt、完成标准和取舍。"
tags: [ai-agent, software-engineering, tdd]
selected: false
draft: false
---

把“实现这个功能并测试”直接丢给编程 Agent，它通常会马上开始写代码。业务规则还没问清，测试是写完功能以后补的，Review 时也只能看测试是否通过，没法对照原始需求。

Matt Pocock 的 [`mattpocock/skills`](https://github.com/mattpocock/skills) 换了一种做法：把这条大 Prompt 拆成 grill、spec、tickets、implement + TDD、code-review 五步，每一步由一个 Skill 负责，结束时停下来等人确认，再进入下一步。另有两个 Skill 处理 Bug 诊断和架构整理。

这些 Skills 不是必须整套照搬的重型框架，也不替代产品判断、技术设计和人工审查。我更愿意把它们看成一组开发规程：每个 Skill 管一个阶段，需求、优先级、架构取舍和最后合不合并，仍由开发者决定。

本文以团队开发为主线，同时说明单人直接在 `main` 上提交时怎么调整。适用于支持 Skills 的编程 Agent，例如 Codex 和 Claude Code。

## 一条大 Prompt 为什么容易让 Agent 失控

一次性交代“实现并测试”，常见的问题有这些：

- **需求理解偏差**：关键业务规则还没确认，Agent 就开始编码。
- **范围失控**：实现过程中加入了 Spec 没要求的功能、抽象或重构。
- **任务过大**：需求、设计、代码和测试挤在同一个上下文里，前后容易不一致。
- **测试滞后**：功能写完才补测试，测试很容易贴着现有实现写，而不是验证真实需求。
- **测试脆弱**：测试私有函数、调用次数或内部结构，正常重构也会让大量测试失败。
- **盲目修 Bug**：没有稳定复现就反复改代码，可能掩盖症状，或者引入新问题。
- **审查缺少基准**：只看测试是否通过，没有检查代码是否真正符合原始需求。

这套流程的思路是分阶段控制：先达成共同理解，再写成 Spec；把大需求拆成可以单独验证的垂直 Ticket；实现时用 TDD 拿到快速反馈；最后分别检查需求符合度和代码质量。

## 五个阶段，各回答一个问题

| 阶段 | Skill | 要回答的问题 | 主要产物 |
|---|---|---|---|
| grill | `/grill-with-docs` | 我们真的理解要解决的问题了吗？ | 已确认的规则、边界、术语和决策 |
| spec | `/to-spec` | 怎样把讨论变成稳定、可审查的实现依据？ | Spec / PRD、验收标准、测试接缝 |
| tickets | `/to-tickets` | 怎样把大需求拆成可以单独交付的工作？ | 垂直切片 Ticket 和依赖关系 |
| implement + TDD | `/implement` + `/tdd` | 怎样在持续反馈中正确实现？ | 代码、行为测试和验证结果 |
| review | `/code-review` | 实现是否符合需求，代码质量是否达标？ | Spec 与 Standards 两类审查结果 |

另外两个 Skill 不在主线上，按需使用：

| 场景 | Skill | 主要产物 |
|---|---|---|
| 出现原因不明的 Bug 或性能回退 | `/diagnosing-bugs` | 稳定复现、根因、回归测试和最小修复 |
| 功能可用，但代码结构开始变差 | `/improve-codebase-architecture` | 架构问题报告和候选改进项 |

主线连起来是这样：

```text
需求
  ↓
grill
  ↓
spec
  ↓
tickets
  ↓
implement + TDD
  ↓
review
  ↓
PR / 合并 / 发布
```

贯穿各阶段的原则只有几条：

- 先明确需求、边界和验收标准，再写代码。
- 先确定测试接缝，再实现功能。
- 中大型需求拆成可以单独验证的垂直 Ticket。
- 实现时一次只完成一个可观察的行为。
- 完成后同时检查“是否符合 Spec”和“代码质量是否合格”。
- 遇到原因不明的 Bug，先建立稳定复现，不要急着改。

第一次在一个仓库里使用这些 Skills 之前，先运行一次 `/setup-matt-pocock-skills`。它会配置 Issue 跟踪的位置、Triage 标签，以及 `CONTEXT.md` 和 ADR 等领域文档放在哪里，后面几个 Skill 都依赖这些约定。

## 小改动不必走完五步

新功能开发、现有功能扩展、Bug 修复、性能回退调查、跨模块或前后端一起改的需求，以及 Agent 参与度高、需要严格控制范围的项目，都适合走完整流程。

文案修改、简单的配置更新、明确的一两行修复，则没必要机械地走完。可以缩短成：

```text
spec → implement/TDD → review
```

问题和修改都非常明确时，还可以更短：

```text
implement → targeted tests → review
```

不同规模的需求，大致可以这样组合：

| 情况 | 流程 |
|---|---|
| 小型修改 | grill → spec → implement + TDD → review |
| 中大型功能 | grill → spec → tickets → 逐个 implement + TDD → review → PR |
| 多人并行开发 | grill → spec → tickets（标明阻塞关系）→ 多个分支并行实现 → 每个分支 code-review → 独立 PR + CI → 按依赖顺序合并 |
| 出现 Bug | diagnosing-bugs → 回归测试 → 最小修复 → 完整测试 → review |
| 已有功能的结构优化 | code-review → improve-codebase-architecture → 选一个优化项 → spec → tickets → implement + TDD → review |

## 团队用功能分支，单人在 main 上记下起点

团队开发和单人开发的区别只在 Git 工作流上，grill → spec → tickets → implement/TDD → review 这条主线不变。差别主要体现在 `/code-review` 拿什么当比较起点。

### 团队开发：功能分支 + PR

通常从最新的主分支创建功能分支：

```bash
git switch main
git pull
git switch -c feature/order-cancellation
```

开发完成后运行：

```text
/code-review main
```

它会审查当前功能分支相对 `main` 合并基点之后的改动。整个过程是：

```text
main
  ↓ 创建功能分支
feature/...
  ↓ 实现与测试
code-review main
  ↓ 修复问题
push
  ↓
创建 PR
  ↓ CI + 人工 Review
合并 main
```

### 单人开发：直接在 main 上提交

单人项目不一定要用功能分支。直接在 `main` 上开发时，开始新功能前先记下当前 Commit：

```bash
git rev-parse HEAD
```

比如得到 `a1b2c3d`，功能完成后运行：

```text
/code-review a1b2c3d
```

也可以打一个本地标签当起点：

```bash
git tag review/order-cancel-start
```

开发完成后：

```text
/code-review review/order-cancel-start
```

审查结束后删掉标签：

```bash
git tag -d review/order-cancel-start
```

## grill：编码前把业务规则问清楚

这一步通过访谈式的追问，确认用户问题和期望行为、业务规则、权限规则、边界情况、错误处理、数据和接口影响、技术限制、验收标准、测试边界，以及哪些内容不在本次范围内。

```text
/grill-with-docs

请围绕以下需求进行澄清：

<填写需求>

重点确认：
- 用户场景和期望行为
- 业务规则与边界情况
- 权限和错误处理
- 技术限制
- 验收标准
- 测试接缝
- Out of Scope

本阶段只做需求澄清和必要的项目文档更新，不修改业务代码。
确认完成后输出总结并停止，等待我运行 /to-spec。
```

Prompt 最后两行很重要。没有“停止”的要求，Agent 很可能问完问题就顺手开始写代码。

进入下一阶段前，应该能回答：

- 什么情况下成功，什么情况下失败。
- 用户最终能观察到什么结果。
- 错误怎样表达和处理。
- 哪些行为必须由自动化测试验证。
- 哪些内容明确不在本次范围内。

## spec：把讨论写成可审查的实现依据

这一步把已经确认的讨论整理成后续开发、测试和 Review 共用的依据。

```text
/to-spec

基于刚才确认的需求生成正式 Spec。

需要包含：
- Problem Statement
- Solution
- User Stories
- Business Rules
- Implementation Decisions
- Testing Decisions
- Acceptance Criteria
- Out of Scope
- 已知风险

明确测试接缝，只测试公共行为，不测试私有实现。
本阶段只生成或更新 Spec，不修改业务代码。
完成后停止，等待我审阅。
```

一份 Spec 至少包含这些部分：

```markdown
## Problem Statement
用户当前遇到的问题。

## Solution
功能完成后的用户体验和系统行为。

## User Stories
1. As a ...
2. As a ...

## Business Rules
- 规则一
- 规则二

## Implementation Decisions
- 模块和接口决策
- 状态转换
- API、Schema 或权限处理

## Testing Decisions
- 测试接缝
- 正常场景
- 异常场景
- 边界场景

## Acceptance Criteria
- [ ] 条件一
- [ ] 条件二

## Out of Scope
- 本次不做的内容
```

小型修改写完 Spec 可以直接进入实现；中大型功能先拆 Tickets。

## tickets：按用户行为垂直拆分，不按技术层拆

功能涉及多个模块、一次 Agent 上下文装不下、有多个可以单独验收的行为、需要多人或多个 Agent 并行，或者任务之间有明确依赖时，就值得拆 Ticket。

```text
/to-tickets <Spec 路径、Issue 或 URL>

把 Spec 拆成可独立实现和验证的垂直切片。

要求：
- 每个 Ticket 交付一个完整用户行为
- 每个 Ticket 能在一个新上下文中完成
- 每个 Ticket 包含验收标准
- 标明 Blocked by
- 不要按数据库、后端、前端、测试水平拆分
- 测试与对应功能放在同一个 Ticket 中

先展示拆分结果，确认后再发布。
发布完成后停止，不要自动实现。
```

按技术层水平拆分，每个 Ticket 单独都交付不了可验证的行为：

```text
Ticket 1：修改数据库
Ticket 2：实现后端
Ticket 3：实现前端
Ticket 4：补测试
```

垂直拆分则让每个 Ticket 都对应一个用户能观察到的结果：

```text
Ticket 1：用户可以完成核心操作
Ticket 2：权限和非法状态得到正确处理
Ticket 3：操作支持幂等或并发保护
Ticket 4：前端提供完整入口和结果反馈
```

每个 Ticket 都应该包含实现这个行为所需的代码、测试和必要文档。

团队并行开发时还要注意：

- 只有没有未完成 Blocker 的 Ticket 才能开始。
- 尽量避免多个 Ticket 同时改同一批文件。
- 跨模块的公共接口先通过 Spec 或 ADR 定下来。
- 每个 Ticket 用独立的分支和 PR，Review 起来更容易。
- 多个并行 Ticket 依赖同一处基础改动时，先单独建一个基础改动（prefactoring）Ticket。

## implement + TDD：一次只让一个测试变绿

```text
/implement <Ticket URL、编号或路径>

只实现当前 Ticket。

要求：
- 阅读 Ticket、父 Spec、CONTEXT.md 和相关 ADR
- 使用 Spec 中确认的测试接缝
- 使用 TDD：red → green
- 一次只实现一个可观察行为
- 不测试私有函数和内部调用次数
- 不添加 Ticket 之外的功能
- 定期运行目标测试和 typecheck

完成后运行：
1. 当前 Ticket 的目标测试
2. 相关测试
3. 完整测试套件
4. typecheck
5. lint
6. build

然后运行 /code-review，并汇报结果。
```

TDD 循环本身很简单：

```text
选择一个行为
  ↓
先写失败测试
  ↓
确认测试因正确原因失败
  ↓
写最少实现
  ↓
测试通过
  ↓
进入下一个行为
```

以一个带权限和状态规则的操作为例：

```text
测试 1：合法用户可以执行操作 → 实现最少代码 → 变绿
测试 2：无权限用户被拒绝 → 增加权限判断 → 变绿
测试 3：非法状态被拒绝 → 增加状态规则 → 变绿
测试 4：重复操作保持幂等 → 增加幂等保护 → 变绿
```

“确认测试因正确原因失败”这一步容易被跳过。测试如果是因为拼错了函数名而失败，后面变绿也证明不了什么。

测试优先覆盖公共行为：

```text
调用 API 后返回正确结果
用户通过 UI 完成操作
系统状态通过真实公共流程正确变化
非法请求返回正确错误
```

避免测试实现细节：

```text
某个私有函数是否被调用
某个 Repository 方法是否调用一次
内部函数调用顺序
私有字段中间状态
```

这一步完成的标准是：当前 Ticket 的验收标准全部满足；测试先失败过再通过；目标测试、相关测试和完整测试套件通过；typecheck、lint、build 通过；没有残留调试日志、临时代码或无关修改。

## code-review：分别对照 Spec 和项目规范

`/code-review` 从两个维度检查已经实现的代码：

1. **Spec Review**：需求是否被正确、完整地实现。
2. **Standards Review**：代码是否符合项目规范和合理的设计原则。

团队开发时：

```text
/code-review main

检查当前功能分支相对于 main 的全部改动。

重点检查：
- 是否完整符合 Spec
- 是否遗漏边界情况
- 是否有 Scope Creep
- 测试是否验证真实外部行为
- 是否存在重复代码
- 是否存在过度抽象
- 模块边界是否合理
- 是否存在明显代码异味

先报告问题，不要立即修改。
```

单人直接在 `main` 上开发时，把 `main` 换成功能开始前记下的 Commit SHA 或 Tag，检查从这个固定点到当前 HEAD 的全部改动，其余要求相同。

“先报告问题，不要立即修改”是为了让人先判断哪些问题确实成立。确认以后再让 Agent 修：

```text
修复 code-review 中确认有效的问题。

修复后重新运行：
- 目标测试
- 相关测试
- 完整测试套件
- typecheck
- lint
- build

然后再次执行 /code-review <原固定点>。
```

## diagnosing-bugs：先有稳定复现，再改代码

功能行为错误、测试失败但原因不明、CI 失败而本地正常、Bug 偶发、并发或时序问题、性能明显下降、修好一处另一处又回归，以及 Agent 开始反复猜测、随意修改时，都应该切换到这个 Skill。

```text
/diagnosing-bugs

问题描述：
<具体症状>

复现步骤或失败命令：
<命令、错误信息、操作路径>

请先建立稳定且最小的失败反馈循环，不要直接猜原因。

然后：
1. 稳定复现
2. 最小化复现
3. 提出可证伪假设
4. 逐个验证
5. 在正确接缝增加回归测试
6. 应用最小修复
7. 重新运行原始复现和完整测试
```

诊断过程大致是：

```text
建立稳定失败信号
  ↓
最小化复现
  ↓
提出 3–5 个假设
  ↓
通过日志、调试器或实验验证
  ↓
先写回归测试
  ↓
应用最小修复
  ↓
运行原始复现
  ↓
运行完整测试
  ↓
code-review
```

这些做法要明确禁止：

- 没有稳定复现就直接改代码。
- 一次同时改多个变量。
- 删除测试来解决失败。
- 跳过测试或放宽断言来解决失败。
- 只确认“没有报错”，却没有验证用户实际遇到的症状。
- 修复后不增加回归测试。

## 功能能用但结构变差：improve-codebase-architecture

功能已经上线，代码却越改越乱时，可以先用 `/code-review` 看需求实现和测试覆盖，再用这个 Skill 看结构：

```text
/improve-codebase-architecture

检查与 <功能名称或模块> 相关的代码结构。

重点寻找：
- 模块边界不清
- 业务逻辑分散
- 过度耦合
- 修改范围扩散
- 难以测试的设计
- 可以形成 deep module 的机会

先生成分析和候选改进项，不要直接进行大规模重构。
```

选中的改进项，重新走一遍 spec → tickets → implement/TDD → review。没有 Spec、验收标准和回归测试的大规模重构，风险和一次没人审过的大 PR 差不多。

## 这套流程的代价

分阶段换来了可控，也有实打实的成本：

- **轮次和时间更多**。每个阶段结束都停下来等人确认，一个小功能可能要来回好几轮。需求本来就清楚时，这些停顿主要是开销，所以前面才建议按规模裁剪。
- **人要在场**。grill 的问题要有人回答，Spec 和 Ticket 要有人审。如果只是把每一步的输出都点“同意”，流程就只剩形式。
- **文档要维护**。`CONTEXT.md`、ADR 和 Spec 会随需求变化而过时，过时的文档会把 Agent 往错误的方向带。
- **Skill 是提示，不是强制**。Agent 仍然可能跳过“确认测试先失败”，或者在实现阶段顺手加功能。Prompt 里的“停止”“只实现当前 Ticket”等要求，加上最后的 review，才是兜底。

## 合并前的检查清单

```text
[ ] 需求已经过 grill 澄清
[ ] 有明确的 Spec，验收标准可观察、可测试
[ ] 中大型功能已拆成垂直 Ticket，依赖关系明确
[ ] 每个行为通过 TDD 实现，测试先失败过
[ ] 没有测试私有实现细节
[ ] 目标测试、相关测试、完整测试套件通过
[ ] typecheck、lint、build 通过
[ ] 已执行 code-review，Spec Review 和 Standards Review 无阻塞问题
[ ] Bug 修复包含回归测试
[ ] 没有残留调试日志或临时代码
[ ] 团队项目的 CI 和人工 Review 已完成，PR 描述与实际改动一致，没有未解决的 Review Comment
```

## 从一个小需求开始试

不必一开始就在大功能上走完整流程。可以挑一个真实但不大的需求，比如给现有接口加一条校验规则，先运行 `/setup-matt-pocock-skills`，再按 grill → spec → implement + TDD → code-review 走一遍。

走完以后，对比一下以前直接让 Agent“实现并测试”的结果：grill 阶段问出了哪些你原本没想到的边界情况，code-review 的 Spec Review 有没有抓到偏离需求的地方。这比读任何流程说明都更能判断这套 Skills 值不值得留在你的项目里。各个 Skill 的完整说明见 [`mattpocock/skills`](https://github.com/mattpocock/skills)。
