---
title: "Lecture 1 课件完整翻译"
summary: "Lecture 1 课件的完整中文翻译：监督学习、统计学习的一般框架、PAC 与密度估计、在线学习与多臂老虎机。数学符号、编号与证明结构依照原文保留。"
---

**2026 年秋季学期，授课教师：Haipeng Luo**

> 本文为 Lecture 1 课件的完整中文翻译。数学符号、定理编号、公式编号和证明结构均依照原文保留。

## 1 温和的起点：监督学习

机器学习是人工智能的核心驱动力，并促成了近年来众多人工智能突破。在本课程中，我们将从数学视角研究机器学习，试图理解它在何时有效、为什么有效，以及如何发挥作用。当然，如今机器学习已经发展为一个庞大而多面的领域，本课程只能覆盖其中很小的一部分，但希望这部分足够基础。在第一讲中，我们将重点介绍并形式化定义本课程所要研究的问题，同时也会简要提及一些不在课程范围内的重要主题。

我们从最经典的机器学习问题——监督学习——开始。在监督学习问题中，给定一个由输入—输出对（通常称为样例）组成的训练集，目标是从这些样例中学习输入和输出之间联系的某种规律，并构造一个良好的预测器，使其能够准确预测未见输入的输出。典型例子包括：图像分类（输入 = 图片，输出 = 狗或猫；输入 = MRI 扫描，输出 = 是否有肿瘤）、机器翻译（输入 = 英语，输出 = 法语）、语言模型（输入 = 不完整的句子，输出 = 下一个词）、视频摘要（输入 = 视频，输出 = 字幕）等。

应当依据什么原则设计这样的学习过程？又如何判断这些过程能否成功？为了回答这些问题，首先需要将学习问题形式化。令 $\mathcal X$ 和 $\mathcal Y$ 分别为任意的输入空间和输出空间，训练集由 $n$ 个样例组成：

\[
(x_1,y_1),\ldots,(x_n,y_n)\in\mathcal X\times\mathcal Y.
\]

例如，在图像分类问题中，$\mathcal X$ 可以是所有 $256\times256$ 图像组成的空间，$\mathcal Y$ 包含“狗”和“猫”两个结果。通常进一步抽象这些空间会更方便。例如，可以用 $\mathbb R^d$ 中的向量表示图像，并用 $-1$ 表示“狗”标签、$+1$ 表示“猫”标签，于是

\[
\mathcal X\subseteq\mathbb R^d,
\qquad
\mathcal Y=\{-1,+1\}.
\]

我们的目标是构造一个预测器 $\widehat y\in\mathcal Y^{\mathcal X}$，即一个从输入空间映射到输出空间的函数。对新的未见输入 $x\in\mathcal X$，预测器将 $\widehat y(x)$ 作为输出。例如，$\widehat y$ 可以是线性分类器、决策树或神经网络。

那么，如何衡量 $\widehat y$ 的准确性？假设与 $x$ 对应的真实输出为 $y$，自然应该通过某种方式比较 $y$ 与 $\widehat y(x)$。为此，定义一般的损失函数

\[
\ell:\mathcal Y^{\mathcal X}\times(\mathcal X\times\mathcal Y)\to\mathbb R,
\]

它把一个预测器和一个输入—输出对映射为某个损失值。该值越大，预测器在这个样例上就越不准确。对具体任务而言，某些损失函数可能比其他损失函数更合适。例如，对 $\mathcal Y=\{-1,+1\}$ 的二分类问题（如判断图片中是狗还是猫），一个非常自然的损失是

\[
\ell(\widehat y,(x,y))
=
\mathbb I\{\widehat y(x)\ne y\},
\]

当预测器给出的标签与真实标签不同时取值为 $1$，否则取值为 $0$。这称为 **0-1 损失**。另一方面，对回归问题（例如预测房价），通常有 $\mathcal Y=\mathbb R$，并定义

\[
\ell(\widehat y,(x,y))
=
(\widehat y(x)-y)^2,
\]

即预测值和真实输出之差的平方，称为**平方损失**。

显然，只在单个样例上衡量预测器的准确性或损失并不合理。实践中，我们通常在测试集

\[
(x'_1,y'_1),\ldots,(x'_m,y'_m)\in\mathcal X\times\mathcal Y
\]

上计算平均损失

\[
\frac1m\sum_{i=1}^m
\ell(\widehat y,(x'_i,y'_i)),
\]

并将其称为**测试误差**。到这里，从实践角度看，我们似乎已经得到一个定义明确的问题：给定训练集，构造一个在测试集上具有较低测试误差的预测器。然而，从理论角度看，这个问题显然仍未定义完整——如果训练集与测试集之间没有任何联系，又怎么可能从训练集学到一个测试误差很小的预测器？

### i.i.d. 假设

实践中通常会从自然界或环境中收集一批样例，再将它们随机划分为训练集和测试集。这通常被建模为独立同分布（independent and identically distributed, i.i.d.）情形：假设自然界中的样例由某个固定但未知、支撑在 $\mathcal X\times\mathcal Y$ 上的分布 $P$ 相互独立地产生。此时，训练集和测试集便紧密相关——它们都是分布 $P$ 的 i.i.d. 样本。

在该假设下，用预测器 $\widehat y$ 的期望测试误差衡量其质量更为合理：

\[
\mathbb E_{(x,y)\sim P}
\left[
\ell(\widehat y,(x,y))
\right],
\]

其中期望针对从分布 $P$ 中随机抽取的一个新样例。这个量也通常称为**风险**（risk）。

对固定预测器 $\widehat y$，测试集上的平均损失显然只是风险的一个无偏估计，并且在实践中易于计算。但在理论分析中，风险更适合作为衡量指标，因为它消除了测试集带来的额外随机性。事实上，对固定预测器 $\widehat y$，

\[
\mathbb E_{(x,y)\sim P}
[\ell(\widehat y,(x,y))]
\]

是固定量，而测试误差

\[
\frac1m\sum_{i=1}^m
\ell(\widehat y,(x'_i,y'_i))
\]

是随机变量。还要强调，在这一表述中 $P$ 是未知的——实践中当然也是如此。否则，寻找小风险预测器将只是一个优化问题，而不再是学习问题。

有了 i.i.d. 假设之后，学习问题是否就完全定义好了？仍然没有，因为问题仍过于一般，以至于没有实际意义。考虑一个二分类问题，假设对每个 $x$ 都有

\[
P(y=+1\mid x)=\frac12,
\]

也就是说，生成样例的分布 $P$ 通过一次公平抛硬币决定每个输入的标签。此时无论 $\widehat y$ 是什么，期望 0-1 损失都等于

\[
\mathbb E_{(x,y)\sim P}
\left[
\mathbb I\{\widehat y(x)\ne y\}
\right]
=\frac12,
\]

因此学习永远不可能实现。

### 经典统计学与统计学习

当然，上述例子非常病态，并不能反映实践中的真实情况。为了使问题有意义，需要加入更多关于问题的先验知识；这也引出了经典统计学与统计学习之间的关键区别。

经典统计学的标准做法是对数据分布 $P$ 假设某种非常具体的结构。以回归为例，可以假设 $\mathcal X$ 上的边缘分布 $P_{\mathcal X}$ 是一个均值和协方差未知的高斯分布，并且条件分布 $P(y\mid x)$ 也是高斯分布，其均值为 $\langle\theta,x\rangle$、方差未知，其中参数 $\theta$ 也未知。在这样的结构假设下，一个自然方法是利用训练集估计所有未知参数，例如使用最大似然估计；得到参数估计后，预测就变得容易。

不难想象，如果关于 $P$ 的假设确实成立，这种方法会表现良好。然而，如果假设与现实相差很远，它通常无法提供任何保证。为避免如此强的假设，统计学习采取了一种截然不同的方法，通常称为**不可知学习**（agnostic）或**分布无关学习**（distribution-free）。它把注意力从数据生成分布转移到某个模型参考类

\[
\mathcal F\subseteq\mathcal Y^{\mathcal X},
\]

并提出如下问题：在不对 $P$ 作任何假设的情况下，能否学到一个与参考类 $\mathcal F$ 中最佳模型相比仍足够好的预测器？

换言之，我们希望保证 $\widehat y$ 的风险与 $\mathcal F$ 中最佳固定预测器的风险之差较小：

\[
\mathbb E[\ell(\widehat y,(x,y))]
-
\inf_{f\in\mathcal F}
\mathbb E[\ell(f,(x,y))],
\]

并且希望该结论对任意分布 $P$ 都成立，因此称为“分布无关”。

这一目标背后的理由是：如果我们相信参考类 $\mathcal F$ 足够好，能够保证较小风险，那么所学到的预测器也会足够好。因此，我们不再把先验知识写入 $P$ 的结构，而是把先验知识体现在选择 $\mathcal F$ 的过程中。重要的是，这在某种意义上是一种更加“稳健”的方法，因为我们从不对 $P$ 施加显式假设，也从不要求“真实规律”属于 $\mathcal F$。

这种不可知学习表述将是本课程的重点，下面还会进一步将其形式化。人们可能会问：问题现在定义完整了吗？这样的不可知方法真的存在吗？答案自然取决于参考类 $\mathcal F$ 的表达能力，而它也决定了学习的样本复杂度——这是本课程的主要主题之一。

## 2 一般框架：统计学习

在监督学习例子的基础上，我们现在引入一个稍微更一般的统计学习框架，它能够涵盖监督学习之外的更多问题。我们不再使用输入—输出对 $(x,y)$ 表示样例，而是使用抽象记号 $z\in\mathcal Z$，其中 $\mathcal Z$ 是某个抽象空间。

一个大小为 $n$ 的训练集通过从某个固定且学习者未知的分布 $P$ 中独立抽取 $n$ 个样本而产生：

\[
z_1,\ldots,z_n\in\mathcal Z.
\]

观察训练集之后，学习者需要在某个任意决策空间 $\mathcal D$ 中给出预测器 $\widehat y\in\mathcal D$。值得指出的是，记号 $\widehat y$ 实际上隐含了它对训练集 $z_{1:n}$ 的依赖。[^1]

现在，损失函数是一个从 $\mathcal D\times\mathcal Z$ 到 $\mathbb R$ 的映射，预测器 $\widehat y$ 的风险定义为

\[
L(\widehat y)
=
\mathbb E_{z\sim P}[\ell(\widehat y,z)].
\]

需要注意，当 $\widehat y$ 是学习者的输出时，$L(\widehat y)$ 是一个随机变量，因为 $\widehat y$ 依赖于随机生成的训练集。因此，$\widehat y$ 的期望风险严格来说应写为

\[
\mathbb E_{z_{1:n}\sim P^n}[L(\widehat y)]
=
\mathbb E_{z_{1:n}\sim P^n}
\left[
\mathbb E_{z\sim P}[\ell(\widehat y,z)]
\right].
\]

不过，只要不引起混淆，我们将简写为 $\mathbb E[L(\widehat y)]$，甚至写成 $\mathbb E[\ell(\widehat y,z)]$。这里的期望覆盖训练集的随机性、未见测试点 $z$ 的随机性，实际上也包括学习者内部的随机性。

根据上一节的讨论，我们把 $\widehat y$ 的期望风险与参考类 $\mathcal F\subseteq\mathcal D$ 能达到的最小风险进行比较。两者之差称为**超额风险**（excess risk），正式定义为

\[
\mathbb E[L(\widehat y)]
-
\inf_{f\in\mathcal F}L(f).
\]

当 $\mathcal F=\mathcal D$ 时，称学习者是**恰当的**（proper）；否则称学习者是**非恰当的**（improper）。本课程主要研究恰当学习者，但之后会讨论一个重要的非恰当学习例子。

学习者的目标是找到一种策略，保证超额风险消失，也就是说，当 $n$ 趋于无穷时，超额风险趋于 $0$。换言之，随着训练样例数量增加，学习者需要找到一个风险可以任意接近 $\mathcal F$ 中最佳预测器风险的预测器。如果存在这样的算法，就称 $\mathcal F$ 是**可学习的**。

举一个具体例子，如果某算法的超额风险量级为 $1/\sqrt n$，那么把类 $\mathcal F$ 学到误差 $\epsilon$ 所需的样本数为

\[
O\left(\frac1{\epsilon^2}\right).
\]

因此，超额风险刻画了学习 $\mathcal F$ 的样本复杂度。

### 2.1 示例

许多常见学习问题都能纳入上述框架。我们已经讨论过不可知监督学习，其中

\[
\mathcal Z=\mathcal X\times\mathcal Y,
\qquad
\mathcal D\subseteq\mathcal Y^{\mathcal X},
\]

而 $\mathcal D$ 由从输入到输出的映射组成，例如决策树或神经网络。对分类问题，$\mathcal Y$ 是离散集合，通常使用 0-1 损失；对回归问题，$\mathcal Y$ 通常是 $\mathbb R$ 的连续子集，并通常使用平方损失。

#### PAC 框架

可能近似正确（Probably Approximately Correct, PAC）是一个基础学习框架，可以视为计算学习理论领域的起点。最基本的 PAC 框架考虑 $\mathcal Y=\{-1,+1\}$ 的监督二分类问题，并假设存在某个 $f^\star\in\mathcal F$，使得

\[
P(y=f^\star(x)\mid x)=1.
\]

换言之，标签由参考类中的某个固定真实函数确定地产生。注意，在 0-1 损失下，此时

\[
\inf_{f\in\mathcal F}L(f)=0,
\]

所以超额风险就是学习者输出 $\widehat y$ 的风险。

PAC 不考察 $\widehat y$ 的期望风险，而是询问能否设计一个算法，使得对任意给定的 $\epsilon>0$、任意置信参数 $\delta>0$、任意边缘分布 $P_{\mathcal X}$ 和任意 $f^\star\in\mathcal F$，在观察

\[
\operatorname{poly}\left(\frac1\epsilon,\frac1\delta\right)
\]

个训练样例后，输出 $\widehat y$ 满足

\[
P(L(\widehat y)\le\epsilon)
\ge 1-\delta.
\]

如果存在这样的算法，就称 $\mathcal F$ 是 **PAC 可学习的**。事实证明，决定一个类能否 PAC 学习的因素，与决定一般统计学习问题能否学习的因素非常相似，因此本课程将重点研究更一般的框架。

#### 密度估计

到目前为止，我们看到的例子都是监督学习。现在考虑一个无监督学习例子：学习者的目标是估计数据生成分布 $P$ 的密度。具体而言，$\mathcal D=\mathcal F$ 由支撑在 $\mathcal Z$ 上的密度函数组成，常用损失函数是对数损失

\[
\ell(\widehat y,z)
=
-\log\widehat y(z).
\]

使用对数损失的理由是，此时超额风险与 Kullback–Leibler（KL）散度相联系。下面略微滥用记号，以同一个符号同时表示分布及其密度：

\[
\begin{aligned}
L(\widehat y)-L(f)
&=-\mathbb E_{z\sim P}[\log\widehat y(z)]
  +\mathbb E_{z\sim P}[\log f(z)]\\
&=\mathbb E_{z\sim P}[\log P(z)]
  -\mathbb E_{z\sim P}[\log\widehat y(z)]\\
&\quad
  +\mathbb E_{z\sim P}[\log f(z)]
  -\mathbb E_{z\sim P}[\log P(z)]\\
&=\operatorname{KL}(P\|\widehat y)
  -\operatorname{KL}(P\|f).
\end{aligned}
\]

### 2.2 博弈的值与“没有免费的午餐”

从博弈论角度看，也可以把学习问题视为学习者与环境之间的零和博弈：学习者首先确定一种学习策略，然后环境选择一个数据生成分布并生成训练集，以超额风险衡量学习者的表现。更准确地说，我们关注如下极小极大量，并称其为该博弈的值：[^2]

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
=
\inf_\pi\sup_P
\left(
\mathbb E[L(\widehat y)]
-
\inf_{f\in\mathcal F}L(f)
\right).
\]

这里，$P$ 遍历 $\mathcal Z$ 上的所有分布；$\pi$ 遍历学习者的所有策略。若学习者没有内部随机性，策略就是从 $n$ 个训练样例到预测器 $\widehat y\in\mathcal D$ 的所有映射；若学习者随机化，则策略是这些映射上的所有分布。

注意，学习者“先行动”非常重要，即顺序是 $\inf\sup$ 而不是 $\sup\inf$。这对应于学习者的策略必须对所有分布都有效这一事实。

显然，$\mathcal F$ 可学习等价于

\[
\limsup_{n\to\infty}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
=0.
\]

换言之，要理解类 $\mathcal F$ 的可学习性，只需研究 $\mathcal V^{\mathrm{iid}}(\mathcal F,n)$。不过，这并不一定会直接给出学习 $\mathcal F$ 的显式算法。

每个类都可学习吗？答案是否定的，这或许并不令人意外。下面的“没有免费的午餐”定理说明，一个过于一般的类无法学习。

**定理 1（没有免费的午餐）。** 考虑一个输入空间 $\mathcal X$ 连续、$\mathcal Y=\{-1,+1\}$ 的二分类问题，并使用 0-1 损失

\[
\ell(\widehat y,(x,y))
=
\mathbb I\{\widehat y(x)\ne y\}.
\]

则

\[
\mathcal V^{\mathrm{iid}}
(\mathcal Y^{\mathcal X},n)
\ge\frac14.
\]

也就是说，由所有可能预测器组成的类 $\mathcal Y^{\mathcal X}$ 不可学习。

直观上，这种过于一般的类无法学习，是因为 $\mathcal Y^{\mathcal X}$ 中的最佳预测器可以在未见样例上任意变化，因此训练集几乎不能告诉我们应如何泛化。虽然原因很直观，但要严格证明它，需要进行一些谨慎处理。特别地，证明要使用下界论证中常见的随机化方法，使我们可以忽略学习者的具体行为。

**证明。** 固定 $\mathcal X$ 的任意子集 $\mathcal X'$，其中包含 $2n$ 个不同元素。我们只考虑 $\mathcal X$ 上的边缘分布为 $\mathcal X'$ 上均匀分布的数据分布，并将该均匀分布记为 $Q$。

为了定义 $\mathcal Y$ 上的条件分布，考虑

\[
N=2^{2n}
\]

个不同的“真实”预测器 $f_1,\ldots,f_N$，使它们实现对 $\mathcal X'$ 中 $2n$ 个元素进行标记的全部 $2^{2n}$ 种方式。最后，令 $P_k$ 是 $\mathcal X\times\mathcal Y$ 上的一个候选分布：

\[
P_k(x,y)
=
\frac1{2n}
\mathbb I\{x\in\mathcal X',\ y=f_k(x)\}.
\]

注意，在该分布下

\[
\inf_{f\in\mathcal F}L(f)
=L(f_k)=0,
\]

因此超额风险就是

\[
\mathbb E[L(\widehat y)]
=
\mathbb E_{S\sim Q^n}
\mathbb E_{x\sim Q}
\left[
\mathbb I\{\widehat y(x;S_k)\ne f_k(x)\}
\right].
\]

这里用 $S$ 表示无标签训练集 $\{x_1,\ldots,x_n\}$，用 $S_k$ 表示对应的带标签训练集

\[
S_k
=
\{(x_1,f_k(x_1)),\ldots,(x_n,f_k(x_n))\},
\]

并将 $\widehat y$ 写成 $\widehat y(\cdot;S_k)$，以强调它对 $S_k$ 的依赖。[^3]

下面说明：对任意学习者，这 $N$ 个候选分布中必有一个迫使学习者承受至少 $1/4$ 的超额风险。这显然会推出

\[
\mathcal V^{\mathrm{iid}}
(\mathcal Y^{\mathcal X},n)
\ge\frac14.
\]

为证明这一点，对固定学习者，我们证明

\[
\frac1N\sum_{k=1}^N
\mathbb E_{S\sim Q^n}
\mathbb E_{x\sim Q}
\left[
\mathbb I\{\widehat y(x;S_k)\ne f_k(x)\}
\right]
\ge\frac14.
\]

这已经足够，因为如果关于 $k$ 的平均值至少为 $1/4$，就一定存在一个具体的 $P_k$，使超额风险至少为 $1/4$。事实上，对 $S$ 的每个实现，都有

\[
\begin{aligned}
&\frac1N\sum_{k=1}^N
\mathbb E_{x\sim Q}
\left[
\mathbb I\{\widehat y(x;S_k)\ne f_k(x)\}
\right]\\
&\ge
\Pr[x\notin S]\cdot
\frac1N\sum_{k=1}^N
\mathbb E_{x\sim Q}
\left[
\left.
\mathbb I\{\widehat y(x;S_k)\ne f_k(x)\}
\right|x\notin S
\right]\\
&\ge
\frac1{2N}\sum_{k=1}^N
\mathbb E_{x\sim Q}
\left[
\left.
\mathbb I\{\widehat y(x;S_k)\ne f_k(x)\}
\right|x\notin S
\right]
\qquad(\Pr[x\notin S]\ge 1/2)\\
&=
\mathbb E_{x\sim Q}
\left[
\left.
\frac1{2N}\sum_{k=1}^N
\mathbb I\{\widehat y(x;S_k)\ne f_k(x)\}
\right|x\notin S
\right]\\
&=\frac14.
\tag{1}
\end{aligned}
\]

最后一步成立的原因是：固定 $x\notin S$ 后，可以把 $N$ 个不同的标记函数分成 $N/2$ 对。每一对 $(f_k,f_{k'})$ 中的两个函数只在 $x$ 上不同，因此

\[
\mathbb I\{\widehat y(x;S_k)\ne f_k(x)\}
+
\mathbb I\{\widehat y(x;S_{k'})\ne f_{k'}(x)\}
=1.
\]

这说明式 (1) 中关于 $k$ 的求和恰好为 $N/2$，证明完毕。 $\square$

总之，该定理表明，不可能学习一个表达能力过强的类。更一般地，$\mathcal V^{\mathrm{iid}}(\mathcal F,n)$ 应当依赖于 $\mathcal F$ 的“表达能力”。如何形式化地度量一个类的表达能力，是本课程将回答的核心问题之一。

### 泛化、表示与优化

下一讲将看到，超额风险本质上受 $\mathcal F$ 中任意预测器从训练集推广到未见数据的能力控制，也就是受**泛化误差**控制。表达能力更强的 $\mathcal F$ 要实现良好泛化通常需要更高的样本复杂度；但另一方面，它也会使

\[
\inf_{f\in\mathcal F}L(f)
\]

更小，即类中的最佳预测器能够更好地表示真实规律。这自然引出了泛化误差与**表示误差**之间的权衡。

事实上，下一讲还会讨论：一个可学习类通常可以通过求解某个优化问题来学习，而这又会引入**优化误差**。此外，不同优化算法可能具有不同的隐式偏置，并在 $\mathcal F$ 的不同部分进行搜索，从而在泛化误差、表示误差和优化误差之间形成非常复杂的权衡。

这三种误差中的每一种都在文献中得到广泛研究，甚至都足以单独构成一门课程。本课程只关注泛化误差。

## 3 更困难的框架：在线学习

统计学习的 i.i.d. 假设虽然标准，但在某些情况下可能过强。放松统计学习中这一条件有许多不同方向，例如假设训练集和测试集来自相关但不同的分布，不过这些内容不属于本课程范围。

为超越 i.i.d. 假设，我们将重点研究一个非常不同的框架，称为**在线学习**（online learning），也称序列预测、序列决策或在线优化等。它完全移除了所有分布假设。

我们沿用统计学习框架中的大部分记号。关键区别在于学习协议。统计学习预先获得一批数据，学习本质上是一次性决策，即给出 $\widehat y$。因此，统计学习有时也称为**批量学习**（batch learning）。

在线学习则逐个呈现数据，并要求学习者作出一系列决策。更具体地说，学习过程按轮次进行；对每一轮 $t=1,\ldots,n$：

- 学习者预测 $\widehat y_t\in\mathcal D$，同时环境选择 $z_t\in\mathcal Z$；
- 学习者承受损失 $\ell(\widehat y_t,z_t)$，并观察 $z_t$。

前面针对统计学习讨论的所有例子都有在线版本。在线表述确实能更好地刻画某些现实应用，特别是如今无处不在的互联网应用。例如，垃圾邮件检测、推荐系统、搜索等都更适合用在线框架描述。事实上，在线学习在优化、博弈论和隐私等其他领域也有许多令人意外的应用。

与超额风险的定义非常相似，在线学习使用**遗憾**（regret）衡量学习表现。遗憾是学习者的累计损失与事后看来参考类 $\mathcal F$ 中最佳固定预测器的累计损失之差：[^4]

\[
\operatorname{Reg}(\mathcal F,n)
=
\sum_{t=1}^n\ell(\widehat y_t,z_t)
-
\inf_{f\in\mathcal F}
\sum_{t=1}^n\ell(f,z_t).
\]

因此，平均遗憾与超额风险相似。我们希望设计一个在线学习算法，使平均遗憾随着 $n$ 增大而趋于 $0$。然而，一个非常重要的区别是，通常不对 $z_1,\ldots,z_n$ 的生成方式施加任何分布假设；事实上，它们甚至可以由恶意对手选择。但这在数学上究竟意味着什么？$z_t$ 可以依赖哪些信息？

为了回答这一问题，先明确 $\widehat y_t$ 可以依赖什么。自然地，$\widehat y_t$ 可以依赖 $z_1,\ldots,z_{t-1}$，即第 $t$ 轮之前环境给出的结果。如果学习者随机化——在某些情况下这实际上是必要的——那么 $\widehat y_t$ 还会依赖学习者的内部随机性。

等价地，可以把学习者策略 $\pi$ 定义为一组映射上的分布：

\[
\pi_t:\mathcal Z^{t-1}\to\mathcal D,
\qquad t=1,\ldots,T.
\]

根据 $z_t$ 可以依赖什么，可定义两类环境。

第一类称为**遗忘型环境**（oblivious environment）。其中 $z_1,\ldots,z_T$ 可以依赖于 $\pi$，但不能直接依赖学习者的决策 $\widehat y_1,\ldots,\widehat y_T$。换言之，可以想象环境知道学习者的算法，并在博弈开始之前就决定完整的结果序列 $z_1,\ldots,z_T$。

第二类称为**自适应环境**（adaptive environment）。其中 $z_1,\ldots,z_T$ 同样可以依赖 $\pi$，并且 $z_t$ 还可以依赖第 $t$ 轮之前学习者作出的决策 $\widehat y_1,\ldots,\widehat y_{t-1}$。

从学习者角度看，自适应环境显然比遗忘型环境更困难。自适应环境可以很好地描述对手可能具有恶意的应用，例如垃圾邮件检测。不过，略显意外的是，在大多数情况下，自适应环境与遗忘型环境在可学习性上的差别并不显著。

### 3.1 博弈的值与在线到批量的转换

问题定义之后，应当再次追问：对这样困难的问题，学习是否可能？与统计学习类似，我们关注博弈的值：

\[
\begin{aligned}
\mathcal V^{\mathrm{seq}}(\mathcal F,n)
&=
\inf_\pi\sup_{z_{1:n}}
\mathbb E
\left[
\frac{\operatorname{Reg}(\mathcal F,n)}n
\right]\\
&=
\inf_\pi\sup_{z_{1:n}}
\mathbb E
\left[
\frac1n\sum_{t=1}^n\ell(\widehat y_t,z_t)
-
\inf_{f\in\mathcal F}
\frac1n\sum_{t=1}^n\ell(f,z_t)
\right].
\end{aligned}
\]

这里默认：对遗忘型环境，$z_{1:n}$ 遍历 $\mathcal Z^n$；对自适应环境，每个 $z_t$ 遍历从 $\mathcal D^{t-1}$ 到 $\mathcal Z$ 的所有映射。

如果

\[
\limsup_{n\to\infty}
\mathcal V^{\mathrm{seq}}(\mathcal F,n)
=0,
\]

就称 $\mathcal F$ 是**在线可学习的**。能够保证遗憾随 $n$ 增大而消失的算法有时称为**无遗憾算法**（no-regret algorithm）。

对自适应环境，博弈值实际上可以写成一串极小极大表达式：

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)
=
\inf_{q_1\in\Delta(\mathcal D)}
\sup_{z_1\in\mathcal Z}
\mathbb E_{\widehat y_1\sim q_1}
\cdots
\inf_{q_n\in\Delta(\mathcal D)}
\sup_{z_n\in\mathcal Z}
\mathbb E_{\widehat y_n\sim q_n}
\left[
\frac{\operatorname{Reg}(\mathcal F,n)}n
\right],
\tag{2}
\]

其中 $\Delta(\mathcal D)$ 是 $\mathcal D$ 上的概率单纯形。这里略去这一事实较为繁琐的证明，但读者应当能够说服自己它是正确的。这个博弈值的等价表达式对后续课程中的进一步推导非常重要。

为方便记号，我们采用如下简写，省略冗长的极小极大序列：

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)
=
\left\langle\!\left\langle
\inf_{q_t\in\Delta(\mathcal D)}
\sup_{z_t\in\mathcal Z}
\mathbb E_{\widehat y_t\sim q_t}
\right\rangle\!\right\rangle_{t=1}^n
\left[
\frac{\operatorname{Reg}(\mathcal F,n)}n
\right].
\tag{3}
\]

本节最后证明一个直观结论：在线学习比统计学习更困难，即

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le
\mathcal V^{\mathrm{seq}}(\mathcal F,n).
\]

**定理 2。** 对任意 $\mathcal F$ 和任意 $n$，都有

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le
\mathcal V^{\mathrm{seq}}(\mathcal F,n).
\]

**证明。** 该结论通过经典的**在线到批量转换**（online-to-batch conversion）证明。这一转换说明，给定任意在线策略，都可以将其转换为一个批量策略，且批量策略的超额风险不超过在线策略的平均遗憾。这显然可以推出定理。

转换过程如下。给定统计学习框架中的训练集 $z_1,\ldots,z_n$ 以及在线框架中的算法 $\pi$，只需把 $z_1,\ldots,z_n$ 逐个输入 $\pi$，并得到决策

\[
\widehat y_1,\ldots,\widehat y_n.
\]

最后，从这些决策中均匀随机选择一个，作为最终预测器 $\widehat y$。

对任意 $f\in\mathcal F$，有

\[
\begin{aligned}
\mathbb E[L(\widehat y)]-L(f)
&=
\frac1n\sum_{t=1}^n
\mathbb E[L(\widehat y_t)]
-
\frac1n\sum_{t=1}^nL(f)
&&\text{（由 }\widehat y\text{ 的构造）}\\
&=
\mathbb E
\left[
\frac1n\sum_{t=1}^n\ell(\widehat y_t,z_t)
-
\frac1n\sum_{t=1}^n\ell(f,z_t)
\right]\\
&\le
\mathbb E
\left[
\frac1n\sum_{t=1}^n\ell(\widehat y_t,z_t)
-
\inf_{f^\star\in\mathcal F}
\frac1n\sum_{t=1}^n\ell(f^\star,z_t)
\right].
\end{aligned}
\]

其中第二个等号使用了 $\widehat y_t$ 和 $f$ 都不依赖 $z_t$ 的事实。最后，对左侧的 $f$ 取上确界，得到

\[
\mathbb E[L(\widehat y)]
-
\inf_{f\in\mathcal F}L(f)
\le
\mathbb E
\left[
\frac1n\sum_{t=1}^n\ell(\widehat y_t,z_t)
-
\inf_{f\in\mathcal F}
\frac1n\sum_{t=1}^n\ell(f,z_t)
\right].
\]

也就是说，超额风险永远不会超过期望平均遗憾，正如所需。 $\square$

再过几讲，我们将看到该不等式实际上可以是严格的：存在一些类在统计学习框架中可学习，但在在线学习框架中不可学习。当然，也会看到一些类确实在线可学习，尽管在线学习看上去非常困难。

理解什么决定在线可学习性以及对应的样本复杂度，是本课程的另一个核心主题。

## 4 更困难的框架：部分信息在线学习

最后，我们简要介绍一种更困难的在线学习框架，它将是本课程接近尾声时的重点。这一框架的困难在于，学习者只能获得部分信息。

回顾上一节，我们假设每一轮结束时都会向学习者揭示 $z_t$。如果学习者只能观察 $z_t$ 的部分信息，学习是否仍然可能？

### 多臂老虎机

作为例子，考虑如下问题实例：

\[
\mathcal D=\mathcal F=\{1,\ldots,K\},
\qquad
\mathcal Z=[0,1]^K,
\]

并且

\[
\ell(\widehat y,z)=z(\widehat y),
\]

即 $z$ 的第 $\widehat y$ 个坐标。换言之，每次学习者都需要从 $K$ 个项目中选择一个，记为 $\widehat y_t$；与此同时，环境通过指定损失向量 $z_t$，决定选择每个项目所产生的损失。学习者的损失就是所选项目的损失 $z_t(\widehat y_t)$。

重要的是，不再向学习者揭示整个向量 $z_t$，而考虑一个更困难的框架，其中学习者只能观察 $z_t(\widehat y_t)$ 的值。这正是著名的**多臂老虎机**（Multi-armed Bandits, MAB）问题。

这种学习表述有许多现实应用。例如，推荐系统可以自然地写成一个 MAB 实例：$K$ 个项目对应一组电影、商品或新闻文章，选择某个项目对应于将它推荐给用户。之后，系统观察关于此次推荐的反馈，并可将反馈编码为某种损失或奖励。例如，如果用户观看了推荐的电影，则损失为 $0$；否则损失为 $1$。

重要的是，系统无法观察没有被推荐的项目所对应的损失，这正好符合 MAB 的部分信息特征。

MAB 只是部分信息在线学习的一个典型例子，之后还会讨论更多例子。虽然仍可像式 (2) 那样形式化定义这类博弈的值，但要真正“求解”如此复杂的极小极大问题会困难得多。特别地，没有明显的方法能像式 (3) 那样把它写成一串极小极大表达式——读者可以尝试一下。

尽管如此，本课程仍将讨论部分信息结构究竟如何影响可学习性，以及当学习可行时，如何为这些问题设计无遗憾算法。

[^1]: 全文使用记号 $a_{1:n}$ 表示集合或序列 $\{a_1,\ldots,a_n\}$。
[^2]: 记号 $\mathcal V^{\mathrm{iid}}(\mathcal F,n)$ 突出了两个重要因素 $\mathcal F$ 和 $n$，但它实际上也依赖损失 $\ell$、样例空间 $\mathcal Z$ 和决策空间 $\mathcal D$。
[^3]: 如果学习者的策略随机化，还需要对其内部随机性取期望；这不会影响后续论证。
[^4]: 记号 $\operatorname{Reg}(\mathcal F,n)$ 同样只显式写出对 $\mathcal F$ 和 $n$ 的依赖，而省略了其他对象。
