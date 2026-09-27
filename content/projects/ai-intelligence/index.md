---
title: "MATRIX · AI Intelligence"
summary: "持续积累、可追溯证据的 AI 情报产品：几分钟掌握重要变化，长期追踪项目，并从证据理解趋势。"
---

MATRIX 是 AI Intelligence Radar 的阅读产品。AI coding agent 持续处理公开一手信息，将它沉淀为 **Events → Signals → Trends → Decisions**；只读网站帮助用户快速阅读变化、持续跟踪项目、核对外部证据。

代码与知识库位于 [GitHub 仓库](https://github.com/Derekwang2002/ai-intelligence)，公开站点入口为 [GitHub Pages](https://derekwang2002.github.io/ai-intelligence/)。本概览同步至 2026-09-27 本地 v2 设计与实现，不声明线上站点已更新。早期机制文档仍保留 revision `00abc421` 的历史说明。

## 1. 产品要解决什么

用户不必在多个平台重复翻看噪音，也不必只接受一段无法追溯的总结。首页提供有限长度的简报；事件详情提供事实与原文；项目、趋势和研究专题把单次消息接入连续判断。

主导航为今日、事件、项目、洞察、关注。日报归档与来源覆盖放在次级入口。今天、最近七天、自上次读完支持不同阅读节奏；关注、收藏、已读各自独立，偏好保存在当前浏览器。

## 2. 不变的六条原则

| 原则 | 含义 |
| --- | --- |
| Signal > Noise | 宁可少收一般新闻，也不堆砌低质量内容 |
| Primary Source > Secondary Reporting | 优先官方材料，同时区分发布声明与独立验证 |
| Engineering Value > Hype | 关注架构、成本、延迟、可靠性与开发流程 |
| Impact > Popularity | 讨论热度与转载数量不能替代真实影响 |
| Incremental Scan > Repeated Full Scan | 从成功 checkpoint 增量处理，重跑必须去重 |
| Historical Evidence > Single-event Speculation | 趋势需要跨日期、多主体的独立证据 |

## 3. 产品与生产体系一起维护

事件、来源、证据、项目、趋势、专题和稳定变化记录互相关联。每次扫描消费到期复核，生成中英文内容与简报，校验成功后最后原子推进 checkpoint。普通编辑和无新信息复核不刷新未读与雷达活跃度。

JSON / Markdown 是唯一事实来源。Astro 在构建期生成页面和索引，GitHub Pages 提供静态阅读；没有账号、数据库、在线模型调用或通知服务。历史迁移保留永久地址，不伪造过去的变化。

## 4. 最终界面方向

全站使用分层液态玻璃，首页采用更新流与研究侧栏组成的紧凑工作台。浅色为暖白与银灰，深色为石墨灰与烟色玻璃。深蓝背景和蓝紫光晕已从本地方案移除；蓝色只作少量交互强调。

导航、控件、列表、研究详情和归档共享材质规则。手机保持完整操作路径，日历和历史按需展开。统一折叠动效尊重减少动态设置，透明度偏好和不支持模糊的浏览器有实色降级。

## 5. 文档阅读顺序

1. [增量扫描、Checkpoint 与趋势判定](/zh/projects/ai-intelligence/incremental-radar)：早期机制基础。
2. [MATRIX：从重要变化到持续判断](/zh/projects/ai-intelligence/product-and-intelligence-design)：当前产品路径、证据契约和生产闭环。
3. [中性色液态玻璃与产品界面规范](/zh/projects/ai-intelligence/glass-interface-design)：最终视觉取舍、双主题截图、组件和交互规范。

项目变更记录见 [Updates](/zh/projects/ai-intelligence/updates)。Derek Hub 保存解释与设计决策；动态情报继续由源仓库维护。
