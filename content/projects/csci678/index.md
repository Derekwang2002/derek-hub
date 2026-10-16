---
title: "CSCI 678: Theoretical Machine Learning"
summary: "USC CSCI 678（Theoretical Machine Learning，Fall 2026，Haipeng Luo）的课程学习笔记：完整讲义翻译、详细证明讲解与理论机器学习核心概念。"
---

CSCI 678 是 USC 开设的理论机器学习课程（Fall 2026，Haipeng Luo），围绕统计学习理论的核心工具展开：Rademacher complexity、覆盖数、VC 维与伪维数、fat-shattering、chaining，以及神经网络的谱复杂度与 margin，并继续到在线学习、Littlestone 维数、Hedge 与 Perceptron。这里整理课程学习笔记，便于课前学习和课后复习。

## 1. 内容组织

每讲提供完整课件版与详细讲解：保留原章节、定理和编号，并展开定义动机、关键证明、算例、适用条件、常见误区与自测。省略的深层定理明确标注，补充推导和笔误更正单独说明。公式使用 KaTeX 渲染；中英文数学内容同步。

## 2. 当前收录

每讲收录两篇配套文档：讲解报告（逐节展开、补全证明细节）与课件完整翻译（保留原文编号与结构）。

- Lecture 1：[详细讲解报告](/zh/notes/csci678/lecture-1-explanation) ｜ [课件完整翻译](/zh/notes/csci678/lecture-1-full-translation)——学习问题的形式化、统计学习框架、无免费午餐定理、在线与部分信息学习。
- Lecture 2：[详细讲解报告](/zh/notes/csci678/lecture-2-explanation) ｜ [课件完整翻译](/zh/notes/csci678/lecture-2-full-translation)——一致收敛、对称化与 Rademacher 复杂度、增长函数与 VC 维。
- Lecture 3：[预习报告](/zh/notes/csci678/lecture-3-preview) ｜ [课件完整翻译](/zh/notes/csci678/lecture-3-full-translation)——覆盖数、Dudley 熵积分与伪维数。
- Lecture 4：[详细讲解报告](/zh/notes/csci678/lecture-4-explanation) ｜ [课件完整翻译](/zh/notes/csci678/lecture-4-full-translation)——fat-shattering 维数、神经网络覆盖数、谱复杂度与 margin 泛化界，含原始实验图和逐步推导。

- Lecture 5：[详细讲解报告](/zh/notes/csci678/lecture-5-explanation) ｜ [课件完整翻译](/zh/notes/csci678/lecture-5-full-translation)——从极小极大对偶与鞅差过程推导树上的对称化，解释依赖数据、二分类重标号与收缩条件。
- Lecture 6：[详细讲解报告](/zh/notes/csci678/lecture-6-explanation) ｜ [课件完整翻译](/zh/notes/csci678/lecture-6-full-translation)——展开序列 Sauer 引理、阈值与单调函数反例、回归覆盖积分，并明确替代损失的归一化。
- Lecture 7：[详细讲解报告](/zh/notes/csci678/lecture-7-explanation) ｜ [课件完整翻译](/zh/notes/csci678/lecture-7-full-translation)——完整推导指数权重势函数、按错误轮次构造专家和感知机错误界，补充 margin 与维度条件。

后续讲次的笔记会持续加入。笔记更新集中在 [Updates](/zh/notes/csci678/updates)。
