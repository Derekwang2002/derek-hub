---
title: "增量扫描、Checkpoint 与趋势判定"
summary: "展开 Radar 的运行机制：扫描窗口如何从 checkpoint 推导、失败如何恢复、事件如何去重与打分，以及趋势如何获得完整生命周期。"
---

Radar 的价值不在单次运行，而在长期增量积累。本文依据 revision `00abc421` 的 `AGENTS.md`、`TASK.md` 与 `config/radar.yaml` 整理运行机制。

## 1. 扫描窗口

每次运行先记录 `current_run_started_at`，再从 `state.json` 读取 `last_successful_run_at`，扫描窗口为两者的区间。首次运行默认回看 24 小时（`time_window.initial_lookback_hours` 可调）。检索时允许向前回退一个小的 overlap buffer（默认 3 小时）以对抗索引延迟和时区边界，但 overlap 区间的内容必须去重，不会重复写入。

## 2. Checkpoint 与失败恢复

只有检索、验证、去重、分析、事件存储、日报、趋势、索引全部成功且通过校验后，才推进 `last_successful_run_at`——使用本次运行的**开始时间**而非结束时间，避免执行期间发布的信息被永久漏掉。任一步骤失败则不推进 checkpoint，在 `logs/` 记录失败阶段，下一次运行从上一次成功 checkpoint 重新扫描。

## 3. 去重与事件更新

候选事件通过 `event_fingerprint`、canonical URL、标题、organization、release name 等字段去重。多家媒体报道同一事件只保留一个事件实体：一手来源作为 `primary_source`，媒体报道归入 `secondary_sources`。后续运行发现同一事件的重要新信息时，更新原事件而非创建重复事件。

## 4. 六维评分与雷达推荐

每个事件包含结构化摘要、来源、`why_it_matters`、技术细节，以及 1–5 分的六维评分：

| 维度 | 含义 |
|---|---|
| Technical Impact | 技术创新程度，5 = 可能改变技术路线 |
| Engineering Value | 工程应用价值，5 = 可显著改变开发方式 |
| Adoption Signal | 真实采用信号，5 = 快速真实采用 |
| Maturity | 成熟度，1 = Research Demo，5 = Widely Adopted |
| Verification Cost | 验证成本，5 = 高成本 |
| Risk | license / security / lock-in / 稳定性风险 |

每个重要技术附带 ADOPT / TRIAL / WATCH / IGNORE 之一的技术雷达推荐。

## 5. 趋势生命周期

趋势有完整生命周期管理：`candidate → emerging → strengthening → established`，或 `weakening / invalidated`，维护在 `trends/current.md`。判定依据是多个独立信号的累积：时间持续性、多主体参与、技术收敛、真实 adoption signal 或已发生的工程影响。

## 6. 关注领域

Foundation Models、AI Agent（framework、tool calling、MCP、memory、sandbox、long-running agents）、AI Engineering（RAG、context engineering、evaluation、model serving）、Open Source（有真实增长信号的项目）、Research（有 code、有 benchmark 的论文）、Infrastructure、Developer Tools，以及仅限可能实际改变技术生态的 Business & Policy 事件。
