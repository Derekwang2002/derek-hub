---
title: "Lecture 5 课件完整翻译"
summary: "完整翻译 Lecture 5 的全部章节、定理、证明及原编号：序列博弈、对偶、鞅差、对称化与序列 Rademacher 复杂度；译注单独说明笔误和适用范围。"
---

**2026 年秋季，授课教师：Haipeng Luo。**

> 对照六页原课件，保留章节、定理 1–2、引理 1–2、公式 (1)–(3)、证明及两条脚注。原课件：lecture5.pdf（本地原课件，未在线发布）。配套：[详细讲解](/zh/projects/csci678/lecture-5-explanation)。方括号内“译注”属于编者补充。原件没有图表或参考文献表。

## 1 从统计学习到在线学习

我们已经建立了相当完整的统计学习图景，现在转向更困难的在线学习。如第 1 讲所述，它完全去除独立同分布假设，刻画许多现代机器学习应用，并对优化、博弈论、隐私等领域有重要影响。虽然在线学习更难，我们仍能借助类似但略为高级的技术，建立类似的可学习性理论。

回顾一般设置：学习者与环境进行序列博弈。每轮 $t=1,\ldots,n$，学习者预测 $\widehat y_t\in\mathcal D$，环境同时选择 $z_t\in\mathcal Z$；随后学习者承受损失 $\ell(\widehat y_t,z_t)$ 并观察 $z_t$。目标是使相对参照类 $\mathcal F\subseteq\mathcal D$ 的遗憾尽量小：

\[
\operatorname{Reg}(\mathcal F,n)=\sum_{t=1}^n\ell(\widehat y_t,z_t)-\inf_{f\in\mathcal F}\sum_{t=1}^n\ell(f,z_t).
\]

序列博弈的值写为：

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)=\inf_\pi\sup_{z_{1:n}}\mathbb E\!\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right].
\]

第 1 讲已证明它不小于 $\mathcal V^{\mathrm{iid}}(\mathcal F,n)$。若它随 $n$ 增大趋于 0，就说 $\mathcal F$ 在线可学习。对自适应环境，$z_t$ 可以依赖过去决策 $\widehat y_{1:t-1}$，博弈值可进一步写成以下嵌套形式。本讲聚焦这种环境，沿统计学习的路线逐步放松博弈值。

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)=\left\langle\!\left\langle\inf_{q_t\in\Delta(\mathcal D)}\sup_{z_t\in\mathcal Z}\mathbb E_{\widehat y_t\sim q_t}\right\rangle\!\right\rangle_{t=1}^n\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right].
\]

> 译注：前式的序列上确界在自适应情形是环境策略的简写；它不应被误读成只对预先固定的数据序列取上确界。双尖括号按时间展开为交替算子，不能任意交换跨轮次的顺序。

## 1.1 带依赖数据的经验过程

统计学习中，放松博弈值的第一步是选择 ERM，然后用经验过程的期望上确界控制它。在线学习有类似方法吗？最自然的尝试是每轮做 ERM：

\[
\widehat y_t\in\operatorname*{argmin}_{f\in\mathcal F}\sum_{\tau=1}^{t-1}\ell(f,z_\tau).
\]

这称为 follow-the-leader（追随领先者）。即使很简单的问题，它也可能产生随轮数线性增长的遗憾，因而一般不是好算法；证明留待算法设计的讲次。我们不继续枚举候选算法，而是直接放松博弈值，不显式构造算法。关键是极小极大定理。先给环境引入随机性，得到等价形式（请自行确认等价性）：

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)=\left\langle\!\left\langle\inf_{q_t\in\Delta(\mathcal D)}\sup_{p_t\in\Delta(\mathcal Z)}\mathbb E_{\widehat y_t\sim q_t,z_t\sim p_t}\right\rangle\!\right\rangle_{t=1}^n\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right].
\]

在一些温和的技术条件下（课件称所讨论问题均满足），极小极大定理允许交换上式每一轮的一对 inf 与 sup：

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)=\left\langle\!\left\langle\sup_{p_t\in\Delta(\mathcal Z)}\inf_{q_t\in\Delta(\mathcal D)}\mathbb E_{\widehat y_t\sim q_t,z_t\sim p_t}\right\rangle\!\right\rangle_{t=1}^n\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right].
\]

课件不展开这些技术条件，而关注交换的结果。现在每轮环境先公布 $p_t$，学习者知道这个分布后再选 $q_t$，这称为**对偶博弈**。它看起来更有利于后行动的学习者，但极小极大定理说明最优博弈值完全不变：在这里的混合策略与信息结构下，双方最优行动时的先后差别不改变值。

其次，对偶博弈中的学习者不再需要随机化：最优分布可把全部质量放在最优决策上。因此

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)=\left\langle\!\left\langle\sup_{p_t\in\Delta(\mathcal Z)}\inf_{\widehat y_t\in\mathcal D}\mathbb E_{z_t\sim p_t}\right\rangle\!\right\rangle_{t=1}^n\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right].
\]

环境现在却需要随机性，所以也可以说随机性换了位置。最后，即使知道对偶博弈中学习者的精确最优策略，也不能直接拿来解决原博弈：二者连“类型检查”都通不过。对偶策略需要先看到环境分布，原策略必须先做决策。我们保留了博弈值的信息，却暂时丢失了学习者的算法信息；数周后将讨论怎样弥补。若最优点不取到，上述“最优决策”应理解为任意精度的近似最优决策。

为什么对偶值更易分析？只需再做一次上界放松，就能得到带依赖数据的经验过程。

**定理 1。** 对偶博弈值满足

\[
\begin{aligned}
&\left\langle\!\left\langle\sup_{p_t\in\Delta(\mathcal Z)}\inf_{\widehat y_t\in\mathcal D}\mathbb E_{z_t\sim p_t}\right\rangle\!\right\rangle_{t=1}^n
\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right]\\
&\quad\le\sup_{\mathbf P\in\Delta(\mathcal Z^n)}
\mathbb E_{z_{1:n}\sim\mathbf P}\left[\sup_{f\in\mathcal F}\frac1n\sum_{t=1}^n
\left(\mathbb E_{z'_t\sim\mathbf P(\cdot\mid z_{1:t-1})}\ell(f,z'_t)-\ell(f,z_t)\right)\right].
\end{aligned}\tag{1}
\]

与统计学习中的以下上界比较：

\[
\begin{aligned}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
&\le\sup_P\mathbb E\sup_{f\in\mathcal F}\left(L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)\right)\\
&=\sup_P\mathbb E_{z_{1:n}\sim P^n}\sup_{f\in\mathcal F}\frac1n\sum_{t=1}^n
\left(\mathbb E_{z'_t\sim P}\ell(f,z'_t)-\ell(f,z_t)\right).
\end{aligned}\tag{2}
\]

有两个差别：(2) 中样本从最坏分布 $P$ 独立抽取，而 (1) 中从最坏联合分布 $\mathbf P$ 抽取，不要求独立；(2) 中期望损失对每轮相同，(1) 中则以过去 $z_{1:t-1}$ 为条件，每轮可以不同。将 (1) 的联合分布限制为乘积分布，恰好得到 (2)，所以 (1) 的上界至少一样大。

由 $f$ 索引的这些随机变量构成**带依赖数据的经验过程**。固定 $f$ 时，每个差项给定过去的条件期望是 0，所以它是鞅差序列的平均，应当较小；但对所有 $f$ 取上确界后是否仍小，要由函数类结构决定。

**定理 1 的证明。** 为简化记号，课件取两轮；一般情形按同样方法推进。下面将博弈值乘以 2，并依次改写。为排版清楚，记两轮基准总损失为 B：

\[
B(z_1,z_2)=\inf_{f\in\mathcal F}\{\ell(f,z_1)+\ell(f,z_2)\}.
\]

\[
\begin{aligned}
&\sup_{p_1}\inf_{\widehat y_1}\mathbb E_{z_1}
\left[\sup_{p_2}\inf_{\widehat y_2}\mathbb E_{z_2}
\{\ell(\widehat y_1,z_1)+\ell(\widehat y_2,z_2)-B(z_1,z_2)\}\right]\\
&=\sup_{p_1}\inf_{\widehat y_1}\mathbb E_{z_1}
\left[\ell(\widehat y_1,z_1)+\sup_{p_2}\inf_{\widehat y_2}\mathbb E_{z_2}
\{\ell(\widehat y_2,z_2)-B(z_1,z_2)\}\right]\\
&=\sup_{p_1}\left\{\inf_{\widehat y_1}\mathbb E_{z'_1}\ell(\widehat y_1,z'_1)
+\mathbb E_{z_1}\left[\sup_{p_2}\inf_{\widehat y_2}\mathbb E_{z_2}
\{\ell(\widehat y_2,z_2)-B(z_1,z_2)\}\right]\right\}\\
&=\sup_{p_1}\mathbb E_{z_1}\sup_{p_2}
\left\{\inf_{\widehat y_1}\mathbb E_{z'_1}\ell(\widehat y_1,z'_1)
+\inf_{\widehat y_2}\mathbb E_{z_2}\{\ell(\widehat y_2,z_2)-B(z_1,z_2)\}\right\}\\
&=\sup_{p_1}\mathbb E_{z_1}\sup_{p_2}
\left\{\inf_{\widehat y_1}\mathbb E_{z'_1}\ell(\widehat y_1,z'_1)
+\inf_{\widehat y_2}\mathbb E_{z'_2}\ell(\widehat y_2,z'_2)
-\mathbb E_{z_2}B(z_1,z_2)\right\}\\
&=\sup_{p_1}\mathbb E_{z_1}\sup_{p_2}\mathbb E_{z_2}
\left\{\inf_{\widehat y_1}\mathbb E_{z'_1}\ell(\widehat y_1,z'_1)
+\inf_{\widehat y_2}\mathbb E_{z'_2}\ell(\widehat y_2,z'_2)-B(z_1,z_2)\right\}\\
&=\sup_{p_1}\mathbb E_{z_1}\sup_{p_2}\mathbb E_{z_2}\sup_{f\in\mathcal F}
\left\{\inf_{\widehat y_1}\mathbb E_{z'_1}\ell(\widehat y_1,z'_1)
+\inf_{\widehat y_2}\mathbb E_{z'_2}\ell(\widehat y_2,z'_2)
-\ell(f,z_1)-\ell(f,z_2)\right\}.
\end{aligned}\tag{3}
\]

这里 $z'_1,z'_2$ 分别从 $p_1,p_2$ 抽取，与 $z_1,z_2$ 使用相同分布。注意各项依赖关系，上述每步都是等式。唯一的上界放松是利用 $\mathcal F\subseteq\mathcal D$：对前面的每个 $f$，用这个特定 $f$ 替代两个决策下确界，得到

\[
\sup_{p_1}\mathbb E_{z_1}\sup_{p_2}\mathbb E_{z_2}\sup_{f\in\mathcal F}\{\mathbb E_{z'_1}\ell(f,z'_1)+\mathbb E_{z'_2}\ell(f,z'_2)-\ell(f,z_1)-\ell(f,z_2)\}.
\]

最后，$\mathbb E_{z_1}\sup_{p_2}$ 为每种 $z_1$ 选择一个分布。它等价于先对所有映射 $p_2:\mathcal Z\to\Delta(\mathcal Z)$ 取上确界，再取期望，并让第二轮从 $p_2(\cdot\mid z_1)$ 抽取。于是最后一式等于

\[
\sup_{\mathbf P\in\Delta(\mathcal Z^2)}\mathbb E_{(z_1,z_2)\sim\mathbf P}\sup_{f\in\mathcal F}\{\mathbb E_{z'_1\sim\mathbf P_1}\ell(f,z'_1)+\mathbb E_{z'_2\sim\mathbf P(\cdot\mid z_1)}\ell(f,z'_2)-\ell(f,z_1)-\ell(f,z_2)\}.
\]

除以 2 即完成证明。式 (3) 还表明，对偶博弈中最优 $p_t$ 不必依赖学习者过去的决策，但仍依赖过去结果。学习者每轮只需最小化已知分布下的当期预期损失。原因是学习者当前决策只通过当期损失进入遗憾，不进入基准项。这种最优策略的简单结构属于对偶博弈，凸显了极小极大变换的重要性。

## 1.2 对称化与序列 Rademacher 复杂度

沿统计学习的路线，下一步是对称化，把经验过程上确界放松成类似 Rademacher 复杂度的量。关键新对象是 **$\mathcal Z$ 值树**：每个节点取值于 $\mathcal Z$ 的完全二叉树。深度 $n$ 的树 $\mathbf z$ 由 $n$ 个映射组成：

\[
\mathbf z_t:\{-1,+1\}^{t-1}\to\mathcal Z,\qquad t=1,\ldots,n.
\]

路径 $\epsilon=(\epsilon_1,\ldots,\epsilon_n)$ 以 −1 表示左、+1 表示右；路径上的第 $t$ 个值是 $\mathbf z_t(\epsilon_{1:t-1})$。为简洁起见写为 $\mathbf z_t(\epsilon)$，但只允许读取前 $t-1$ 个符号。(原注 1) (原注 2) 对任意 $\mathcal H\subseteq\mathbb R^{\mathcal Z}$，给定树的条件序列 Rademacher 复杂度定义为

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal H;\mathbf z)=\frac1n\mathbb E_\epsilon\left[\sup_{h\in\mathcal H}\sum_{t=1}^n\epsilon_t h(\mathbf z_t(\epsilon))\right].
\]

$\epsilon_1,\ldots,\epsilon_n$ 是独立 Rademacher 随机变量。无条件版本为

\[
\mathcal R^{\mathrm{seq}}(\mathcal H)=\sup_{\mathbf z}\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal H;\mathbf z)=\frac1n\sup_{\mathbf z}\mathbb E_\epsilon\sup_{h\in\mathcal H}\sum_{t=1}^n\epsilon_t h(\mathbf z_t(\epsilon)).
\]

上确界遍历所有深度 $n$ 的树。与统计学习一样，它衡量函数类拟合随机符号的能力；区别是原来的 $n$ 个样本现在成为含 $2^n-1$ 个潜在样本的树，第 $t$ 个输入依赖之前的符号。这表达了结果可依赖全部历史的序列性质。此外，我们对树取最坏情况上确界，而非在某个树分布上取期望，因为在线学习没有数据分布假设。

**定理 2。** 对任意联合分布，其带依赖数据的经验过程满足

\[
\mathbb E_{z_{1:n}\sim\mathbf P}\sup_{f\in\mathcal F}\frac1n\sum_{t=1}^n\left(\mathbb E_{z'_t\sim\mathbf P(\cdot\mid z_{1:t-1})}\ell(f,z'_t)-\ell(f,z_t)\right)\le2\mathcal R^{\mathrm{seq}}(\ell(\mathcal F)),
\]

\[
\ell(\mathcal F)=\{h_f:\mathcal Z\to\mathbb R\mid f\in\mathcal F,\ h_f(z)=\ell(f,z)\} .
\]

**证明。** 仍用 $n=2$ 展示关键思想。把左边乘以 2，记 $\Delta_t(f)=\ell(f,z'_t)-\ell(f,z_t)$。先写出条件期望，再将影子样本的期望移到上确界外面：

\[
\begin{aligned}
&\mathbb E_{z_1\sim\mathbf P_1,z_2\sim\mathbf P(\cdot\mid z_1)}
\sup_f\{\mathbb E_{z'_1\sim\mathbf P_1}\ell(f,z'_1)-\ell(f,z_1)
+\mathbb E_{z'_2\sim\mathbf P(\cdot\mid z_1)}\ell(f,z'_2)-\ell(f,z_2)\}\\
&\le\mathbb E_{z_1,z'_1\sim\mathbf P_1;\ z_2,z'_2\sim\mathbf P(\cdot\mid z_1)}
\sup_f\{\Delta_1(f)+\Delta_2(f)\}\\
&=\mathbb E_{z_1,z'_1\sim\mathbf P_1;\ z_2,z'_2\sim\mathbf P(\cdot\mid z_1),\,\epsilon_2}
\sup_f\{\Delta_1(f)+\epsilon_2\Delta_2(f)\}.
\end{aligned}
\]

最后一步成立，因为给定 $z_1$ 后，第二轮的两个独立样本可交换。很容易想再给第一项乘 $\epsilon_1$，但下面的直接替换是**错误的**：

\[
\mathbb E_{z_1,z'_1\sim\mathbf P_1;\ z_2,z'_2\sim\mathbf P(\cdot\mid z_1),\,\epsilon_{1:2}}
\sup_f\{\epsilon_1\Delta_1(f)+\epsilon_2\Delta_2(f)\}.\qquad(\times)
\]

原因是 $z_1$ 和 $z'_1$ 的角色不对称：后续两个样本都以 $z_1$ 为条件。必须先将第二轮的期望放松为最坏情况，消除这种额外依赖：

\[
\mathbb E_{z_1,z'_1\sim\mathbf P_1}\sup_{z_2,z'_2}\mathbb E_{\epsilon_2}\sup_f\{\Delta_1(f)+\epsilon_2\Delta_2(f)\}.
\]

现在第一轮样本可交换，因此这等于

\[
\mathbb E_{z_1,z'_1\sim\mathbf P_1}\mathbb E_{\epsilon_1}\sup_{z_2,z'_2}\mathbb E_{\epsilon_2}\sup_f\{\epsilon_1\Delta_1(f)+\epsilon_2\Delta_2(f)\}.
\]

继续放松第一轮期望，拆开两组样本，并利用符号对称性：

\[
\begin{aligned}
&\le\sup_{z_1,z'_1}\mathbb E_{\epsilon_1}\sup_{z_2,z'_2}\mathbb E_{\epsilon_2}
\sup_f\{\epsilon_1\Delta_1(f)+\epsilon_2\Delta_2(f)\}\\
&\le\sup_{z_1,z'_1}\mathbb E_{\epsilon_1}\sup_{z_2,z'_2}\mathbb E_{\epsilon_2}
\sup_f\{\epsilon_1\ell(f,z'_1)+\epsilon_2\ell(f,z'_2)\}\\
&\quad+\sup_{z_1,z'_1}\mathbb E_{\epsilon_1}\sup_{z_2,z'_2}\mathbb E_{\epsilon_2}
\sup_f\{-\epsilon_1\ell(f,z_1)-\epsilon_2\ell(f,z_2)\}\\
&=2\sup_{z_1}\mathbb E_{\epsilon_1}\sup_{z_2}\mathbb E_{\epsilon_2}
\sup_f\{\epsilon_1\ell(f,z_1)+\epsilon_2\ell(f,z_2)\}\\
&=2\sup_{\mathbf z}\mathbb E_{\epsilon_{1:2}}\sup_f
\{\epsilon_1\ell(f,\mathbf z_1)+\epsilon_2\ell(f,\mathbf z_2(\epsilon_1))\}.
\end{aligned}
\]

最后一步与定理 1 类似：对 $\epsilon_1=+1$ 和 $-1$ 可分别选择接近上确界的 $z_2$，将这两个选择预先编码为树的第二层即可。除以 $n=2$ 完成证明。证明中把期望变成上确界，导致最终丢失了原联合分布信息，这也是复杂度要对所有树取最坏情况的原因。

## 1.3 消去损失函数

与统计学习类似，许多问题可以在复杂度中略去损失函数，下面两个引理说明这一点。

**引理 1。** 对二分类零一损失，$\mathcal Z=\mathcal X\times\{-1,+1\}$、$\mathcal F\subseteq\{-1,+1\}^{\mathcal X}$。任意结果树 $(\mathbf x,\mathbf y)$ 都存在另一棵输入树 $\mathbf x'$，使得

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\ell(\mathcal F);(\mathbf x,\mathbf y))
=\frac12\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x'),
\qquad \mathcal R^{\mathrm{seq}}(\ell(\mathcal F))\le\frac12\mathcal R^{\mathrm{seq}}(\mathcal F).
\]

**引理 2（收缩）。** 回归损失为 $\ell(f,(x,y))=\ell'(f(x),y)$，其中 $\ell'$ 对第一个参数是 $G$-Lipschitz，则课件给出

\[
\mathcal R^{\mathrm{seq}}(\ell(\mathcal F))\le G\mathcal R^{\mathrm{seq}}(\mathcal F)\,O(\ln^{3/2}n).
\]

与第 2 讲相比，引理 1 的统计版本在原来固定输入序列上直接等于函数类复杂度的一半；序列版本需要将 $\mathbf x$ 换成 $\mathbf x'$，但不影响最终的最坏情况上界。引理 2 也有这种细微差别，此外多出对数因子。原文称这一损失“最近已被证明一般不可避免”。课件省略引理 2 的证明，下面只证引理 1。

> 译注：保留上述原文表述，但不要据此断言指数 $3/2$ 在所有版本中最优。经典有界类收缩定理还带有适用条件；对数应使用含常数的版本以覆盖 $n=1$。详解列出原论文条件与改进结果的范围，不把此未证明引理当作已证明结论。

**引理 1 的证明。** 由定义及零一损失的代数形式，

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{seq}}(\ell(\mathcal F);(\mathbf x,\mathbf y))
&=\frac1n\mathbb E_\epsilon\sup_f\sum_{t=1}^n\epsilon_t
\mathbf1\{f(\mathbf x_t(\epsilon))\ne\mathbf y_t(\epsilon)\}\\
&=\frac1n\mathbb E_\epsilon\sup_f\sum_{t=1}^n\epsilon_t
\frac{1-\mathbf y_t(\epsilon)f(\mathbf x_t(\epsilon))}{2}\\
&=\frac1{2n}\mathbb E_\epsilon\sum_t\epsilon_t
+\frac1{2n}\mathbb E_\epsilon\sup_f\sum_t-\epsilon_t\mathbf y_t(\epsilon)f(\mathbf x_t(\epsilon))\\
&=\frac1{2n}\mathbb E_\epsilon\sup_f\sum_t-\epsilon_t\mathbf y_t(\epsilon)f(\mathbf x_t(\epsilon)).
\end{aligned}
\]

令 $s_t=-\epsilon_t\mathbf y_t(\epsilon)$。这些 $s_t$ 仍是独立 Rademacher 变量；等价地，$\epsilon\mapsto s$ 是符号立方体上的双射。逆映射递归写为

\[
\epsilon_t=-s_t\mathbf y_t(\epsilon_{1:t-1}).
\]

前面的 $\epsilon_{1:t-1}$ 已能递归表示为 $s_{1:t-1}$ 的函数。因此定义 $\mathbf x'_t(s)=\mathbf x_t(\epsilon)$ 是合法的树，并且

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\ell(\mathcal F);(\mathbf x,\mathbf y))
=\frac1{2n}\mathbb E_s\sup_f\sum_{t=1}^n s_t f(\mathbf x'_t(s))
=\frac12\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x').
\]

两边对结果树取上确界即得结论。$\mathbf x'$ 是依照标签树对原树路径重新排列所得：若标签树所有节点均为 +1，新树是原树的镜像；若仅根节点为 +1，其余均为 −1，则只交换根的左右子树。

## 原课件脚注

**原注 1:** 一条节点路径实际上由前 $n-1$ 个符号完全确定；仍保留第 $n$ 个符号，是因为它还会用于其他目的。

**原注 2:** 之后所有涉及树的讨论，都应画一张示意图来理解不同概念的直觉；接下来还会出现很多这样的概念。
