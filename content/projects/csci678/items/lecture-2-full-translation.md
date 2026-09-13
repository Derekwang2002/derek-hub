---
title: "Lecture 2 课件完整翻译"
summary: "Lecture 2 课件的完整中文翻译：一致收敛与 Rademacher 复杂度、有限类、无限二分类类与 VC 维、Sauer 引理。数学符号、编号与证明结构依照原文保留。"
---

**2026 年秋季学期，授课教师：Haipeng Luo**

> 本文为 Lecture 2 课件的完整中文翻译。数学符号、定理编号、引理编号、命题编号、公式编号和证明结构均依照原文保留。

## 1 一致收敛与 Rademacher 复杂度

本讲重点研究 $\mathcal V^{\mathrm{iid}}(\mathcal F,n)$。如上一讲所述，它完全刻画了类 $\mathcal F$ 在批量/统计学习框架下的可学习性。我们将连续对这一博弈值作上界松弛，得到一个更容易处理的形式，并在最后说明这些上界非常紧。

回顾博弈值的定义：

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
=
\inf_\pi\sup_P
\left(
\mathbb E[L(\widehat y)]
-
\inf_{f\in\mathcal F}L(f)
\right),
\]

其中，$\pi$ 遍历从 $n$ 个训练样本到最终预测器 $\widehat y\in\mathcal D$ 的所有映射或这些映射上的所有分布；$P$ 遍历 $\mathcal Z$ 上的所有数据生成分布。

作为松弛这一博弈值的第一步，我们考虑一个非常简单的算法：输出**经验风险最小化器**（Empirical Risk Minimizer, ERM）：

\[
\widehat y_{\mathrm{ERM}}
\in
\operatorname*{argmin}_{f\in\mathcal F}
\frac1n\sum_{t=1}^n\ell(f,z_t).
\]

这里，经验风险就是训练集上的平均损失。为简化讨论，假设至少存在一个这样的最小化器；这基本不损失一般性。显然，此时

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le
\sup_P
\left(
\mathbb E[L(\widehat y_{\mathrm{ERM}})]
-
\inf_{f\in\mathcal F}L(f)
\right).
\tag{1}
\]

在继续讨论之前，先对 ERM 作两点说明。

第一，寻找 ERM 是一个定义明确的优化问题，并且已有许多成熟的优化算法。上一讲已经提到，这一优化层面不属于本课程范围。一般来说，寻找 ERM 甚至可能是 NP 困难的；这里我们只关注问题在统计意义上是否可学习，而不关注它在计算意义上是否容易求解。

第二，人们可能会问：既然仅最小化训练损失在实践中可能导致过拟合，为什么还要研究这个看似“朴素”、没有“正则化”的算法？答案是，对许多问题而言，正则化 ERM

\[
\operatorname*{argmin}_{f\in\mathcal F}
\left(
\frac1n\sum_{t=1}^n\ell(f,z_t)
+\lambda\Psi(f)
\right)
\]

等价于在更小的函数类上做 ERM：

\[
\operatorname*{argmin}_{f\in\mathcal F,\,\Psi(f)\le c}
\frac1n\sum_{t=1}^n\ell(f,z_t),
\]

其中 $c$ 是另一个常数。因此，正则化本质上是一种隐式地在受限制的类上学习的方法，而这个受限制的类有望在统计意义上更容易学习。

### 1.1 经验过程与一致收敛

下面继续简化式 (1)。令

\[
f^\star\in
\operatorname*{argmin}_{f\in\mathcal F}L(f).
\]

则有[^1]

\[
\begin{aligned}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
&\le
\sup_P
\left(
\mathbb E[L(\widehat y_{\mathrm{ERM}})]
-L(f^\star)
\right)\\
&=
\sup_P
\mathbb E
\left[
L(\widehat y_{\mathrm{ERM}})
-
\frac1n\sum_{t=1}^n\ell(f^\star,z_t)
\right]
&&\text{（由 }L\text{ 的定义）}\\
&\le
\sup_P
\mathbb E
\left[
L(\widehat y_{\mathrm{ERM}})
-
\frac1n\sum_{t=1}^n
\ell(\widehat y_{\mathrm{ERM}},z_t)
\right]
&&\text{（由 }\widehat y_{\mathrm{ERM}}\text{ 的定义）}\\
&\le
\sup_P
\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right].
\tag{2}
\end{aligned}
\]

这里，由 $f\in\mathcal F$ 索引的一族随机变量

\[
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\]

称为一个**经验过程**（empirical process）。这些随机变量中的每一个，都只是函数在从 $P$ 随机抽取的输入上的期望值，与它在一组来自相同分布的 i.i.d. 输入上的经验平均值之差。

显然，这些随机变量均为零均值；根据大数定律，当 $n$ 很大时，每一个都应该很小。然而，要断言式 (2) 很小，在某种意义上必须证明这些随机变量**同时**都小，而这是否成立取决于函数类 $\mathcal F$。

如果

\[
\limsup_{n\to\infty}
\sup_P
\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
=0,
\]

就称 $\mathcal F$ 满足**一致收敛**（uniform convergence）。也就是说，对任意数据生成分布，只要 $n$ 足够大，经验过程上确界的期望就可以任意小。由式 (2) 显然可知，如果 $\mathcal F$ 满足一致收敛，那么 $\mathcal F$ 可学习。

### 1.2 对称化与 Rademacher 复杂度

对给定的类 $\mathcal F$，怎样判断经验过程的期望上确界是否很小？为了回答这一问题，我们将使用一个重要技巧——**对称化**（symmetrization）——进一步松弛该量，并得到 Rademacher 复杂度。

首先定义一个 Rademacher 随机变量 $\epsilon$：它以相同概率取 $-1$ 和 $+1$。对函数类 $\mathcal H\subseteq\mathbb R^{\mathcal Z}$ 以及任意输入序列 $z_1,\ldots,z_n$，定义 $\mathcal H$ 在这些输入上的**条件 Rademacher 复杂度**：

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal H;z_{1:n})
=
\frac1n
\mathbb E_{\epsilon_{1:n}}
\left[
\sup_{h\in\mathcal H}
\sum_{t=1}^n\epsilon_t h(z_t)
\right],
\]

其中 $\epsilon_{1:n}$ 是 $n$ 个 i.i.d. Rademacher 随机变量。

相对于支撑在 $\mathcal Z$ 上的分布 $P$，$\mathcal H$ 的无条件 Rademacher 复杂度定义为

\[
\begin{aligned}
\mathcal R^{\mathrm{iid}}(\mathcal H)
&=
\mathbb E_{z_{1:n}}
\left[
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal H;z_{1:n})
\right]\\
&=
\frac1n
\mathbb E_{z_{1:n},\epsilon_{1:n}}
\left[
\sup_{h\in\mathcal H}
\sum_{t=1}^n\epsilon_t h(z_t)
\right],
\end{aligned}
\]

其中 $z_{1:n}$ 是来自 $P$ 的 $n$ 个 i.i.d. 样本。

直观上，一个类的 Rademacher 复杂度衡量了它拟合随机符号的能力，因为当 $h(z_t)$ 与 $\epsilon_t$ 同号时，相关项 $\epsilon_t h(z_t)$ 很大。因此，Rademacher 复杂度越大，函数类的表达能力越强。

Rademacher 复杂度与经验过程的期望上确界之间的联系由下面的定理给出。

**定理 1。** 对任意数据生成分布 $P$ 和任意函数类 $\mathcal F$，都有

\[
\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
\le
2\mathcal R^{\mathrm{iid}}(\ell(\mathcal F)),
\]

其中

\[
\ell(\mathcal F)
=
\left\{
h_f\in\mathbb R^{\mathcal Z}:
f\in\mathcal F,
\ h_f(z)=\ell(f,z),\ \forall z
\right\}.
\]

**证明。** 按照定义，把 $L(f)$ 写成

\[
L(f)
=
\mathbb E_{z'_1,\ldots,z'_n\sim P}
\left[
\frac1n\sum_{t=1}^n\ell(f,z'_t)
\right],
\]

从而得到

\[
\begin{aligned}
&\mathbb E_{z_{1:n}}
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]\\
&=
\frac1n
\mathbb E_{z_{1:n}}
\left[
\sup_{f\in\mathcal F}
\mathbb E_{z'_{1:n}}
\left[
\sum_{t=1}^n
(\ell(f,z'_t)-\ell(f,z_t))
\right]
\right].
\end{aligned}
\]

把期望 $\mathbb E_{z'_{1:n}}$ 移到上确界之外，得到下面这个对称的上界：

\[
\begin{aligned}
&\frac1n
\mathbb E_{z_{1:n}}
\left[
\sup_{f\in\mathcal F}
\mathbb E_{z'_{1:n}}
\left[
\sum_{t=1}^n
(\ell(f,z'_t)-\ell(f,z_t))
\right]
\right]\\
&\le
\frac1n
\mathbb E_{z_{1:n},z'_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
(\ell(f,z'_t)-\ell(f,z_t))
\right].
\end{aligned}
\]

接下来，我们声称有如下等式：

\[
\begin{aligned}
&\mathbb E_{z_{1:n},z'_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
(\ell(f,z'_t)-\ell(f,z_t))
\right]\\
&=
\mathbb E_{z_{1:n},z'_{1:n},\epsilon_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t(\ell(f,z'_t)-\ell(f,z_t))
\right].
\end{aligned}
\]

这一等式成立，是因为对序列 $\epsilon_{1:n}\in\{-1,+1\}^n$ 的每一种可能取值，

\[
\sum_{t=1}^n(\ell(f,z'_t)-\ell(f,z_t))
\]

与

\[
\sum_{t=1}^n
\epsilon_t(\ell(f,z'_t)-\ell(f,z_t))
\]

之间的差别，仅仅是在 $\epsilon_t=-1$ 时交换样例 $z_t$ 与 $z'_t$。由于 $z_t$ 和 $z'_t$ 服从相同分布，这种交换不会改变期望。

把上确界拆成两部分，可进一步得到上界

\[
\begin{aligned}
&\mathbb E_{z_{1:n},z'_{1:n},\epsilon_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t(\ell(f,z'_t)-\ell(f,z_t))
\right]\\
&\le
\mathbb E_{z_{1:n},z'_{1:n},\epsilon_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n\epsilon_t\ell(f,z'_t)
+
\sup_{f\in\mathcal F}
\sum_{t=1}^n(-\epsilon_t)\ell(f,z_t)
\right]\\
&=
\mathbb E_{z'_{1:n},\epsilon_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n\epsilon_t\ell(f,z'_t)
\right]
+
\mathbb E_{z_{1:n},\epsilon_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n(-\epsilon_t)\ell(f,z_t)
\right].
\end{aligned}
\]

最后，注意 $\epsilon_t$ 与 $-\epsilon_t$ 同分布，因此上面的两项都恰好等于

\[
n\mathcal R^{\mathrm{iid}}(\ell(\mathcal F)).
\]

除以 $n$ 后即得结论。 $\square$

### 1.3 在监督学习中消去损失函数

对许多问题，特别是监督学习问题，分析 $\ell(\mathcal F)$ 的 Rademacher 复杂度时，与损失函数有关的部分实际上并不那么重要，通常可以被消去。

具体而言，考虑 $\mathcal Z=\mathcal X\times\mathcal Y$、$\mathcal F\subseteq\mathcal Y^{\mathcal X}$ 的监督学习问题。在下面两种情况下，可以很容易地联系 $\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))$ 与 $\mathcal R^{\mathrm{iid}}(\mathcal F)$。

**引理 1。** 对 $\mathcal Y=\{-1,+1\}$、使用 0-1 损失的二分类问题，对任意序列 $z_{1:n}$，都有

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})
=
\frac12
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n}),
\]

从而

\[
\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))
=
\frac12\mathcal R^{\mathrm{iid}}(\mathcal F).
\]

**证明。** 根据定义，

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})
&=
\frac1n
\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t\mathbb I\{f(x_t)\ne y_t\}
\right]\\
&=
\frac1n
\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t\frac{1-y_tf(x_t)}2
\right]\\
&=
\frac1{2n}\mathbb E
\left[\sum_{t=1}^n\epsilon_t\right]
+
\frac1{2n}\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n(-\epsilon_ty_t)f(x_t)
\right]\\
&=
\frac12
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n}).
\end{aligned}
\]

最后一步使用了 Rademacher 变量均值为零的事实，以及对任意标签 $y_1,\ldots,y_n$，随机变量

\[
-\epsilon_1y_1,\ldots,-\epsilon_ny_n
\]

仍然是 i.i.d. Rademacher 随机变量这一事实。 $\square$

**引理 2（收缩引理）。** 考虑一个 $\mathcal Y\subseteq\mathbb R$ 的回归问题，损失具有形式

\[
\ell(f,(x,y))
=
\widetilde\ell(f(x),y),
\]

其中 $\widetilde\ell(y',y)$ 关于第一个参数是 $G$-Lipschitz 的，即对任意 $y_1,y_2,y$，有

\[
|\widetilde\ell(y_1,y)-\widetilde\ell(y_2,y)|
\le
G|y_1-y_2|.
\]

则对任意序列 $z_{1:n}$，都有

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})
\le
G\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n}),
\]

从而

\[
\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))
\le
G\mathcal R^{\mathrm{iid}}(\mathcal F).
\]

**证明。** 根据定义，

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})
=
\frac1n
\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t\widetilde\ell(f(x_t),y_t)
\right].
\]

先对最后一个 Rademacher 变量 $\epsilon_n$ 的两个取值求平均，得到

\[
\begin{aligned}
&\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})\\
&=
\frac1{2n}\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\widetilde\ell(f(x_t),y_t)
+\widetilde\ell(f(x_n),y_n)
\right)
\right]\\
&\quad+
\frac1{2n}\mathbb E
\left[
\sup_{g\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\widetilde\ell(g(x_t),y_t)
-\widetilde\ell(g(x_n),y_n)
\right)
\right]\\
&=
\frac1{2n}\mathbb E
\left[
\sup_{f,g\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\bigl(
\widetilde\ell(f(x_t),y_t)
+\widetilde\ell(g(x_t),y_t)
\bigr)
\right.
\right.\\
&\hspace{5.2cm}\left.
\left.
+\widetilde\ell(f(x_n),y_n)
-\widetilde\ell(g(x_n),y_n)
\right)
\right]\\
&\le
\frac1{2n}\mathbb E
\left[
\sup_{f,g\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\bigl(
\widetilde\ell(f(x_t),y_t)
+\widetilde\ell(g(x_t),y_t)
\bigr)
\right.
\right.\\
&\hspace{5.2cm}\left.
\left.
+G|f(x_n)-g(x_n)|
\right)
\right],
\end{aligned}
\]

其中最后一步使用了 $\widetilde\ell$ 的 $G$-Lipschitz 性。由对称性，在 $\sup_{f,g\in\mathcal F}$ 内去掉最后一个表达式中的绝对值并不会改变结果。再次拆开这个上确界，得到

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})
&\le
\frac1{2n}\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\widetilde\ell(f(x_t),y_t)
+Gf(x_n)
\right)
\right]\\
&\quad+
\frac1{2n}\mathbb E
\left[
\sup_{g\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\widetilde\ell(g(x_t),y_t)
-Gg(x_n)
\right)
\right]\\
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\widetilde\ell(f(x_t),y_t)
+\epsilon_nGf(x_n)
\right)
\right].
\end{aligned}
\]

依次对 $t=n-1,\ldots,1$ 重复这一过程，即得结论。 $\square$

注意，常见问题通常都满足 Lipschitz 条件。以平方损失

\[
\widetilde\ell(y',y)
=
\frac12(y'-y)^2
\]

为例。如果 $\mathcal Y=[-1,+1]$，显然该损失是 $2$-Lipschitz 的。

## 2 有限类

先对目前的结果作一个简短总结。通过一系列取上界步骤，我们把统计学习问题的博弈值松弛为函数类的 Rademacher 复杂度：

\[
\begin{aligned}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
&\le
\sup_P\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]\\
&\le
2\sup_P\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))\\
&\le
2G\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F),
\end{aligned}
\]

其中，对二分类问题，$G=1/2$；对回归问题，$G$ 是损失函数的 Lipschitz 常数。

现在已经清楚，要理解一个问题的可学习性，理解函数类的 Rademacher 复杂度 $\mathcal R^{\mathrm{iid}}(\mathcal F)$ 至关重要。那么，应当如何计算它？

我们先从一个简单但基础的情形开始：$\mathcal F$ 是有限类。之后关于无限类的所有讨论，最终都会使用有限类的结果。所需的关键引理是次高斯随机变量的最大值不等式。

回顾：如果零均值随机变量 $U$ 对所有 $\lambda\in\mathbb R$ 都满足

\[
\mathbb E[\exp(\lambda U)]
\le
\exp\left(\frac{\sigma^2\lambda^2}2\right),
\]

即其矩母函数被方差为 $\sigma^2$ 的零均值高斯变量的矩母函数控制，就称 $U$ 是 $\sigma$-次高斯的。例如，任何取值范围为 $[a,b]$ 的零均值随机变量都是 $(b-a)/2$-次高斯的。这就是 Hoeffding 引理。

**引理 3（最大值不等式）。** 设 $\{U_f\}_{f\in\mathcal F}$ 是有限个 $\sigma$-次高斯随机变量，则

\[
\mathbb E
\left[
\max_{f\in\mathcal F}U_f
\right]
\le
\sigma\sqrt{2\ln|\mathcal F|}.
\]

**证明。** 对任意 $\lambda>0$，有

\[
\begin{aligned}
\exp\left(
\lambda\mathbb E
\left[
\max_{f\in\mathcal F}U_f
\right]
\right)
&\le
\mathbb E
\left[
\exp\left(
\lambda\max_{f\in\mathcal F}U_f
\right)
\right]
&&\text{（Jensen 不等式）}\\
&\le
\mathbb E
\left[
\sum_{f\in\mathcal F}\exp(\lambda U_f)
\right]\\
&\le
\sum_{f\in\mathcal F}
\exp\left(\frac{\sigma^2\lambda^2}2\right)
&&\text{（}U_f\text{ 是 }\sigma\text{-次高斯）}\\
&=
|\mathcal F|
\exp\left(\frac{\sigma^2\lambda^2}2\right).
\end{aligned}
\]

整理可得

\[
\mathbb E
\left[
\max_{f\in\mathcal F}U_f
\right]
\le
\frac{\ln|\mathcal F|}{\lambda}
+\frac{\sigma^2\lambda}{2}.
\]

取

\[
\lambda
=
\frac{\sqrt{2\ln|\mathcal F|}}{\sigma},
\]

该选择使上界最小，并得到

\[
\mathbb E
\left[
\max_{f\in\mathcal F}U_f
\right]
\le
\sigma\sqrt{2\ln|\mathcal F|}.
\]

证明完毕。 $\square$

下面应用最大值不等式，控制有限类的 Rademacher 复杂度。

**定理 2（Massart 引理）。** 设 $\mathcal F\subseteq\mathcal Y^{\mathcal X}$ 是有限类，$x_1,\ldots,x_n\in\mathcal X$ 是任意输入集合，则

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n})
\le
\frac1n
\sqrt{
2
\max_{f\in\mathcal F}
\sum_{t=1}^n f^2(x_t)
\ln|\mathcal F|
}.
\]

因此，如果对某个 $C>0$ 有 $\mathcal Y\subseteq[-C,C]$，那么

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
C\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\]

**证明。** 注意

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n})
=
\frac1n\mathbb E
\left[
\max_{f\in\mathcal F}U_f
\right],
\]

其中

\[
U_f
=
\sum_{t=1}^n\epsilon_t f(x_t).
\]

下面的计算说明 $U_f$ 是 $\sigma$-次高斯的，其中

\[
\sigma
=
\sqrt{
\max_{f\in\mathcal F}
\sum_{t=1}^n f^2(x_t)
}.
\]

事实上，对任意 $\lambda\in\mathbb R$，

\[
\begin{aligned}
\mathbb E[\exp(\lambda U_f)]
&=
\prod_{t=1}^n
\mathbb E
[\exp(\lambda\epsilon_tf(x_t))]\\
&\le
\prod_{t=1}^n
\exp\left(
\frac{f^2(x_t)\lambda^2}{2}
\right)\\
&=
\exp\left(
\frac{\lambda^2}{2}
\sum_{t=1}^n f^2(x_t)
\right)\\
&\le
\exp\left(
\frac{\sigma^2\lambda^2}{2}
\right).
\end{aligned}
\]

第一步使用了 $\epsilon_1,\ldots,\epsilon_n$ 相互独立的事实；第二步使用了 $\epsilon_tf(x_t)$ 是 $|f(x_t)|$-次高斯的事实。应用引理 3 即得结论。 $\square$

上述定理说明，函数值被限制在 $[-C,C]$ 内的有限类都可学习，因为

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le
2G\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
2GC\sqrt{\frac{2\ln|\mathcal F|}{n}}
\longrightarrow0
\]

当 $n$ 趋于无穷时成立。事实上，它还给出了使用 ERM 学习时精确的 $1/\sqrt n$ 收敛量级。

读者可能注意到，也可以把最大值不等式直接应用于经验过程

\[
\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
\]

而得到相同结论。但很快将看到，先在 Rademacher 复杂度上进行这一步为何十分重要。

## 3 无限类：分类

下面研究无限类的 Rademacher 复杂度。第一步考虑 $\mathcal Y=\{-1,+1\}$ 的二分类问题。虽然引理 3 看起来不适用于无限类，但它实际上仍然会发挥关键作用。

主要观察如下：条件 Rademacher 复杂度可等价写成

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n})
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n\epsilon_tf(x_t)
\right]\\
&=
\frac1n\mathbb E
\left[
\max_{v\in\mathcal F|_{x_{1:n}}}
\sum_{t=1}^n\epsilon_tv_t
\right],
\end{aligned}
\]

其中

\[
\mathcal F|_{x_{1:n}}
=
\{(f(x_1),\ldots,f(x_n)):f\in\mathcal F\}
\subseteq
\{-1,+1\}^n
\]

是 $\mathcal F$ 在输入集 $x_{1:n}$ 上的投影。

虽然 $\mathcal F$ 是无限的，但 $\mathcal F|_{x_{1:n}}$ 总是有限的，且其大小至多为 $2^n$。基于这一直觉，定义 $\mathcal F$ 在 $n$ 个输入上的**增长函数**：

\[
\Pi_{\mathcal F}(n)
=
\max_{x_{1:n}}
\left|
\mathcal F|_{x_{1:n}}
\right|.
\]

它表示使用 $\mathcal F$ 中的函数对 $n$ 个样本进行标记时，最多可能得到多少种不同标记。由前面的观察和引理 3，立即得到

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\sqrt{
\frac{2\ln\Pi_{\mathcal F}(n)}{n}
}.
\]

增长函数的平凡上界是 $\Pi_{\mathcal F}(n)\le2^n$。将其代入上式，只会得到一个常数量级的 Rademacher 复杂度。因此，要使 Rademacher 复杂度趋于零，需要函数类具有温和得多的增长函数。下面讨论两个例子。

**命题 1。** 令 $\mathcal X=\mathbb R$，并考虑阈值函数类

\[
\mathcal F
=
\left\{
f_\theta(x)
=
\begin{cases}
+1,&x\le\theta,\\
-1,&\text{其他情况},
\end{cases}
:\theta\in\mathbb R
\right\}.
\]

则

\[
\Pi_{\mathcal F}(n)=n+1,
\]

从而

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le
\sqrt{\frac{2\ln(n+1)}n}.
\]

**证明。** 对任意 $\theta$，$f_\theta(x)$ 把 $\theta$ 左侧的所有点标为 $+1$，把右侧的所有点标为 $-1$。显然，对实线上的任意 $n$ 个不同点，从左到右可以得到的全部 $n+1$ 种标记是

\[
\{-1,-1,\ldots,-1\},
\quad
\{+1,-1,\ldots,-1\},
\quad
\{+1,+1,\ldots,-1\},
\quad\ldots\quad,
\{+1,+1,\ldots,+1\}.
\]

证明完毕。 $\square$

**命题 2。** 令 $\mathcal X=\mathbb R$，并考虑区间函数类

\[
\mathcal F
=
\left\{
f_{\theta_1,\theta_2}(x)
=
\begin{cases}
+1,&\theta_1\le x\le\theta_2,\\
-1,&\text{其他情况},
\end{cases}
:\theta_1\le\theta_2
\right\}.
\]

则

\[
\Pi_{\mathcal F}(n)
=
\binom{n+1}{2}+1
=O(n^2),
\]

从而

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le
O\left(\sqrt{\frac{\ln n}{n}}\right).
\]

**证明。** 任意 $n$ 个不同点把实线分成 $n+1$ 个区域。把区间端点 $\theta_1$ 和 $\theta_2$ 放入其中任意两个不同区域，会得到 $\binom{n+1}{2}$ 种标记。把两个端点放入同一个区域，无论选择哪个区域，都只会额外产生一种所有标签都为 $-1$ 的标记。 $\square$

值得说明的是，在 Rademacher 复杂度定义中，把 $\sup_{f\in\mathcal F}$ 替换为 $\max_{v\in\mathcal F|_{x_{1:n}}}$ 非常直观且直接；但不能对 $\mathcal V^{\mathrm{iid}}(\mathcal F,n)$ 或它的上界

\[
\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
\]

直接进行同样的替换，因为 $L(f)$ 对 $f$ 的依赖并不只通过 $f(x_1),\ldots,f(x_n)$ 体现。

这凸显了通过对称化把上述量松弛为 Rademacher 复杂度的重要性，也解释了为什么在有限类情形下，我们没有直接把最大值不等式应用于经验过程。

### 3.1 VC 维与 Sauer 引理

增长函数是一种刻画函数类复杂度的良好方式，但并不总是容易计算。考虑 $\mathcal X=\mathbb R^d$，以及线性分类器类

\[
\mathcal F
=
\left\{
f_{\theta,b}(x)
=
\operatorname{sign}(\langle x,\theta\rangle+b)
:
\theta\in\mathbb R^d,
\ b\in\mathbb R
\right\},
\tag{3}
\]

其中，当 $y\ge0$ 时 $\operatorname{sign}(y)=+1$，否则为 $-1$。这个类的 $\Pi_{\mathcal F}(n)$ 是多少？

为简化讨论，先从 $d=2$ 开始。很明显，对任意 $n\le3$，都能找到 $n$ 个点，使 $\mathcal F$ 实现全部 $2^n$ 种标记，因此

\[
\Pi_{\mathcal F}(n)=2^n,
\qquad n\le3.
\]

当 $n=4$ 时又如何？首先有 $\Pi_{\mathcal F}(4)<2^4=16$，因为对二维平面中的任意四个点，线性分类器都不可能实现全部 $16$ 种标记。读者可以尝试说服自己这一点。

但是，$\Pi_{\mathcal F}(4)$ 的准确值是多少？花一些时间或许也能算出来；可 $\Pi_{\mathcal F}(5)$、$\Pi_{\mathcal F}(6)$，以及任意 $n$ 时的 $\Pi_{\mathcal F}(n)$ 呢？是否必须逐个求出这些值，进行这样繁琐的计算？

略显意外的是，前面提到的两个事实

\[
\Pi_{\mathcal F}(3)=2^3,
\qquad
\Pi_{\mathcal F}(4)<2^4
\]

已经足以对任意 $n$ 的 $\Pi_{\mathcal F}(n)$ 导出相当紧的上界。为说明这一结果，先给出几个定义。

如果

\[
\mathcal F|_{x_{1:n}}
=
\{-1,+1\}^n,
\]

即 $\mathcal F$ 能实现该输入集的全部 $2^n$ 种标记，就称 $\mathcal F$ **打散**（shatter）输入集 $x_{1:n}$。

$\mathcal F$ 的 Vapnik–Chervonenkis（VC）维定义为能被 $\mathcal F$ 打散的最大输入集大小，即

\[
\operatorname{VCdim}(\mathcal F)
=
\max\{n:\Pi_{\mathcal F}(n)=2^n\}.
\]

如果该集合为空，则定义 $\operatorname{VCdim}(\mathcal F)=0$；如果该集合不是有限的，即对所有 $n$ 都有 $\Pi_{\mathcal F}(n)=2^n$，则定义 $\operatorname{VCdim}(\mathcal F)=\infty$。

例如，前面讨论的二维线性分类器的 VC 维为 $3$。下面这个奠基性结果建立了函数类增长函数与 VC 维之间的联系；证明推迟到下一小节。

**引理 4（Sauer 引理）。** 对 VC 维为有限值 $d$ 的函数类 $\mathcal F$，任意 $n>d$ 都满足

\[
\Pi_{\mathcal F}(n)
\le
\sum_{i=0}^d\binom ni
\le
\left(\frac{en}{d}\right)^d.
\]

根据 VC 维的定义，对任意 $n\le d$，显然有 $\Pi_{\mathcal F}(n)=2^n$。Sauer 引理说明，一旦 $n$ 大于 $d$，增长函数就会发生相变：原来的指数增长 $2^n$ 突然变为多项式增长，大约为 $n^d$。

结合前面的讨论，得到

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\sqrt{\frac{2\ln\Pi_{\mathcal F}(n)}n}
\le
\sqrt{
\frac{2d\ln(en/d)}n
},
\]

这说明 VC 维有限的类总是可学习的。

需要强调的是，为证明 $\operatorname{VCdim}(\mathcal F)=d$，恰好需要证明两件事：

1. $\Pi_{\mathcal F}(d)=2^d$。也就是说，给出一个大小为 $d$ 的具体输入集，并证明 $\mathcal F$ 能在该集合上实现所有可能的标记；
2. $\Pi_{\mathcal F}(d+1)<2^{d+1}$。也就是说，证明对任意大小为 $d+1$ 的输入集，都存在一种 $\mathcal F$ 无法实现的标记。

这通常比求任意 $n$ 的增长函数容易，正如在线性分类器例子中所看到的。下面给出更多例子。

**命题 3。** 一个函数类的 VC 维为 $0$，当且仅当它只包含一个函数。

**命题 4。** 命题 1 中定义的阈值函数类的 VC 维为 $1$。

**命题 5。** 命题 2 中定义的区间函数类的 VC 维为 $2$。

这些结论都不难证明。对阈值函数类和区间函数类，前面已经求出了精确的增长函数；可以看到，Sauer 引理给出的上界非常紧。

**命题 6。** 式 (3) 中定义的线性分类器类的 VC 维为 $d+1$。

前面的讨论已经对 $d=2$ 证明了这一结论。一般情形的证明将出现在作业 1 中。

此时读者可能已经注意到，VC 维通常与函数类的参数个数一致。参数数量确实通常可以用来快速猜测 VC 维，而且大多数时候这一猜测都准确。但它并不总是正确。下面的例子中，一个仅有单个参数的函数类却具有无穷 VC 维。直观原因是，当 $\theta$ 足够大时，函数 $\sin(\theta x)$ 可以在一个很小的区间内任意多次振荡。具体证明参见作业 1。

**命题 7。** 令 $\mathcal X=\mathbb R$，并令

\[
\mathcal F
=
\{f_\theta(x)=\operatorname{sign}(\sin(\theta x)):
\theta\in\mathbb R\}.
\]

则

\[
\operatorname{VCdim}(\mathcal F)=\infty.
\]

### 3.2 Sauer 引理的证明

**证明。** 记

\[
g(d,n)
=
\sum_{i=0}^d\binom ni.
\]

我们对 $d+n$ 归纳证明：当 $n>d$ 时，

\[
\Pi_{\mathcal F}(n)
\le
g(d,n).
\]

基础情形 $d+n=1$ 是显然的：唯一可能的配置是 $d=0$、$n=1$，此时

\[
\Pi_{\mathcal F}(n)=1=g(0,1).
\]

接下来假设结论对所有满足 $n'>d'$ 且 $n'+d'<n+d$ 的 $(n',d')$ 都成立，并证明 $\Pi_{\mathcal F}(n)\le g(d,n)$。当 $d=0$ 时结论仍然显然，因此假设

\[
n>d>0.
\]

对任意不同的输入集 $x_{1:n}$，令

\[
\mathcal F_1
=
\mathcal F|_{x_{2:n}}
\]

为 $\mathcal F$ 在 $n-1$ 个输入 $x_{2:n}$ 上的投影；再令 $\mathcal F_2\subseteq\mathcal F_1$ 满足

\[
\mathcal F_2
=
\left\{
v\in\mathcal F_1:
(-1,v),(+1,v)
\in
\mathcal F|_{x_{1:n}}
\right\}.
\]

也就是说，对 $x_{2:n}$ 的任意标记 $v\in\mathcal F_2$，把 $x_1$ 标成任意一个标签后，所得 $x_{1:n}$ 标记都能由 $\mathcal F$ 实现。显然，

\[
\left|\mathcal F|_{x_{1:n}}\right|
=
|\mathcal F_1|+|\mathcal F_2|.
\]

现在，把 $\mathcal F_1$ 和 $\mathcal F_2$ 看作只定义在 $x_{2:n}$ 上的两个函数类，因此每个函数只是 $\{-1,+1\}^{n-1}$ 中的一个向量。显然，

\[
|\mathcal F_1|
=
\left|\mathcal F_1|_{x_{2:n}}\right|
\le
\Pi_{\mathcal F_1}(n-1)
\le
g(d,n-1),
\]

其中最后一步使用了归纳假设，以及 $\mathcal F_1$ 的 VC 维不可能大于 $\mathcal F$ 的 VC 维这一事实。

另一方面，

\[
|\mathcal F_2|
=
\left|\mathcal F_2|_{x_{2:n}}\right|
\le
\Pi_{\mathcal F_2}(n-1)
\le
g(d-1,n-1),
\]

其中最后一步使用了归纳假设，以及 $\mathcal F_2$ 的 VC 维至多为 $d-1$ 这一事实。

确实，如果 $\mathcal F_2$ 的 VC 维大于 $d-1$，那么 $x_{2:n}$ 中就存在一个大小为 $d$、可被 $\mathcal F_2$ 打散的子集。根据 $\mathcal F_2$ 的构造，把 $x_1$ 加到该子集中，就会得到一个大小为 $d+1$、可被 $\mathcal F$ 打散的集合，这与条件 $\operatorname{VCdim}(\mathcal F)=d$ 矛盾。

综合以上结果，

\[
\begin{aligned}
\left|\mathcal F|_{x_{1:n}}\right|
&\le
g(d,n-1)+g(d-1,n-1)\\
&=
\sum_{i=0}^d\binom{n-1}{i}
+
\sum_{i=0}^{d-1}\binom{n-1}{i}\\
&=
\sum_{i=0}^d\binom{n-1}{i}
+
\sum_{i=1}^{d}\binom{n-1}{i-1}\\
&=
\sum_{i=0}^d\binom ni\\
&=
g(d,n).
\end{aligned}
\]

因为该式对任意 $x_{1:n}$ 都成立，所以

\[
\Pi_{\mathcal F}(n)
\le
g(d,n),
\]

归纳证明完成。

引理中的第二个不等式成立，是因为

\[
\begin{aligned}
g(d,n)
&=
\left(\frac nd\right)^d
\sum_{i=0}^d
\left(\frac dn\right)^d
\binom ni\\
&\le
\left(\frac nd\right)^d
\sum_{i=0}^d
\left(\frac dn\right)^i
\binom ni
&& (d<n)\\
&\le
\left(\frac nd\right)^d
\sum_{i=0}^n
\left(\frac dn\right)^i
\binom ni\\
&=
\left(\frac nd\right)^d
\left(1+\frac dn\right)^n\\
&\le
\left(\frac{en}{d}\right)^d,
&& (1+x\le e^x,\ \forall x\in\mathbb R).
\end{aligned}
\]

证明完毕。 $\square$

## 4 总结与闭环

本讲可以用下面这一系列取上界步骤概括：

\[
\begin{aligned}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
&\le
\sup_P\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
&&\text{（使用 ERM）}\\
&\le
2\sup_P\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))
&&\text{（对称化）}\\
&\le
2G\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
&&\text{（消去损失函数）}\\
&\le
\begin{cases}
2GC\sqrt{\dfrac{2\ln|\mathcal F|}{n}},
&\text{有限类},\\[1.2ex]
\sqrt{\dfrac{2\ln\Pi_{\mathcal F}(n)}n}
\le
\sqrt{\dfrac{2d\ln(en/d)}n},
&\text{二分类}.
\end{cases}
\end{aligned}
\]

其中，对二分类问题，$G=1/2$；对回归问题，$G$ 是损失的 Lipschitz 常数；$C$ 是函数值绝对值的上界；$d=\operatorname{VCdim}(\mathcal F)$。

最终，我们发现：对二分类问题，有限 VC 维是可学习性的充分条件。但它是否也是必要条件？换言之，这一系列取上界步骤是否足够紧？

答案是肯定的：有限 VC 维也是可学习性的必要条件，因此我们基本形成了一个闭环。

事实上，如果函数类 $\mathcal F$ 具有无穷 VC 维，那么对任意 $n$，都能找到一个含 $2n$ 个元素、可被 $\mathcal F$ 打散的子集 $\mathcal X'\subseteq\mathcal X$。也就是说，$\mathcal F$ 在该集合上的行为与 $\mathcal Y^{\mathcal X'}$ 相同。

因此，完全复用第 1 讲“没有免费的午餐”定理的论证，可以得到：对任意算法，都能找到一个支撑在 $\mathcal X'\times\mathcal Y$ 上的分布 $P$，使该算法承受至少 $1/4$ 的超额风险。这说明 $\mathcal F$ 不可学习。

这也意味着，对二分类问题，如果一个函数类可学习，那么它一定可以通过简单的 ERM 算法学习。

最后说明一点：对一般统计学习问题，这一结论并不总是成立。

[^1]: 为简化讨论，我们忽略 $\operatorname*{argmin}$ 可能不存在的问题；该问题可以很容易地处理。
