---
title: "Lecture 3 课件完整翻译"
summary: "Lecture 3 课件的完整中文翻译：覆盖函数、覆盖投影、Dudley 熵积分与 chaining 技巧、伪维数。数学符号、定理编号与证明结构均依照原文保留。"
---

**2026 年秋季学期，授课教师：Haipeng Luo**

> 本文为 Lecture 3 课件的完整中文翻译。数学符号、定理编号、命题编号和证明结构均依照原文保留。

## 1 无限函数类：回归

在本讲中，我们继续研究如何刻画统计学习的可学习性。回顾上一讲，通过一系列取上界的步骤，我们得到

\[
\begin{aligned}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
&\le
\sup_P\mathbb E\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
&&\text{（使用 ERM）}\\
&\le 2\sup_P\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))
&&\text{（对称化）}\\
&\le 2G\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
&&\text{（去掉损失函数）}.
\end{aligned}
\]

其中，对于二分类问题，$G=1/2$；对于回归损失，$G$ 是其 Lipschitz 常数。对于函数值被限制在 $[-C,C]$ 内的有限函数类，我们应用最大值不等式，得到

\[
\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
\le C\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\]

基于这个结果，我们还讨论了如下事实：对于二分类问题
$\mathcal Y=\{-1,+1\}$，真正重要的只有投影

\[
\mathcal F|_{x_{1:n}}
=
\{(f(x_1),\ldots,f(x_n)):f\in\mathcal F\}
\subseteq\{-1,+1\}^n.
\]

因此，可以通过引入函数类的增长函数和 VC 维，把无限类的情形化为有限类的情形。具体而言，我们证明了：若
$d=\operatorname{VCdim}(\mathcal F)$，则

\[
\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\sqrt{\frac{2\ln\Pi_{\mathcal F}(n)}{n}}
\le
\sqrt{\frac{2d\ln(en/d)}{n}}.
\]

本讲将注意力转向具有实值函数类的回归问题。不失一般性，我们假设输出已被归一化，使得

\[
\mathcal Y=[-1,+1],
\qquad
\mathcal F\subseteq[-1,+1]^{\mathcal X}.
\]

显然，关键仍然是理解 Rademacher complexity
$\mathcal R^{\mathrm{iid}}(\mathcal F)$。然而，因为 $\mathcal F$ 是一个实值函数类，它的投影

\[
\mathcal F|_{x_{1:n}}\subseteq[-1,+1]^n
\]

通常也是无限集合，因此我们不能直接应用有限类的结果。

解决这个问题的一个相当自然的想法，是用有限的离散化来近似无限函数类。实现这种想法有多种不同方式，下面讨论其中两种。

### 1.1 覆盖函数

第一种想法是构造一个有限函数类 $\mathcal H$，使得对于每一个
$f\in\mathcal F$，都存在一个对应的代表函数 $h\in\mathcal H$，且 $h$ 与
$f$ 很接近。例如，可以用两个函数之间最大的逐点差异

\[
\sup_{x\in\mathcal X}|f(x)-h(x)|
\]

来衡量它们的接近程度。

基于这一直觉，我们定义：如果有限函数类
$\mathcal H\subseteq[-1,+1]^{\mathcal X}$ 满足，对于任意
$f\in\mathcal F$，都存在 $h\in\mathcal H$，使得对所有
$x\in\mathcal X$ 都有

\[
|f(x)-h(x)|\le\alpha,
\]

那么称 $\mathcal H$ 是 $\mathcal F$ 的一个**逐点
$\alpha$-覆盖**。相应地，$\mathcal F$ 的逐点 $\alpha$-覆盖数定义为

\[
\mathcal N(\mathcal F,\alpha)
=
\min\left\{
|\mathcal H|:
\mathcal H\text{ 是 }\mathcal F\text{ 的逐点 }\alpha\text{-覆盖}
\right\}.
\]

如果不存在这样的有限覆盖，则将覆盖数定义为无穷大。显然，
$\mathcal N(\mathcal F,\alpha)$ 关于 $\alpha$ 单调不增。

借助这个定义，我们可以再次把无限类的情形化为有限类的情形，并立即得到下面的结果。

**定理 1。** 对任意
$\mathcal F\subseteq[-1,+1]^{\mathcal X}$，都有

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\min_{\alpha\ge0}
\left(
\alpha+
\sqrt{\frac{2\ln\mathcal N(\mathcal F,\alpha)}{n}}
\right).
\]

**证明。** 固定任意 $\alpha\ge0$。令 $\mathcal H$ 是
$\mathcal F$ 的一个逐点 $\alpha$-覆盖，其大小为
$\mathcal N(\mathcal F,\alpha)$。对于每个 $f\in\mathcal F$，令
$h_f\in\mathcal H$ 表示 $f$ 的“代表”，满足

\[
\sup_x|f(x)-h_f(x)|\le\alpha.
\]

于是有

\[
\begin{aligned}
\mathcal R^{\mathrm{iid}}(\mathcal F)
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n\epsilon_t f(x_t)
\right]\\
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t\bigl(f(x_t)-h_f(x_t)+h_f(x_t)\bigr)
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t\bigl(f(x_t)-h_f(x_t)\bigr)
\right]
+
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n\epsilon_t h_f(x_t)
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
|f(x_t)-h_f(x_t)|
\right]
+
\frac1n\mathbb E
\left[
\sup_{h\in\mathcal H}
\sum_{t=1}^n\epsilon_t h(x_t)
\right]\\
&\le
\alpha+\mathcal R^{\mathrm{iid}}(\mathcal H)\\
&\le
\alpha+
\sqrt{\frac{2\ln\mathcal N(\mathcal F,\alpha)}{n}},
\end{aligned}
\]

其中最后一步使用了 Massart 引理。因为这个结论对任意
$\alpha\ge0$ 都成立，所以定理得证。 $\square$

自然地，这个上界体现了近似尺度 $\alpha$ 与覆盖大小之间的某种权衡。那么，逐点覆盖数可能有多大呢？

首先考虑线性情形：

\[
\mathcal X=B_q^d,
\qquad
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\]

其中 $p\ge1$、$q\ge1$，并且

\[
\frac1p+\frac1q=1.
\]

这里

\[
B_q^d=\{x\in\mathbb R^d:\|x\|_q\le1\}
\]

是 $d$ 维 $q$-范数单位球，$B_p^d$ 的定义类似。条件
$1/p+1/q=1$ 意味着 $\|\cdot\|_p$ 是
$\|\cdot\|_q$ 的对偶范数，反之亦然。由 Hölder 不等式，

\[
|f_\theta(x)|
=|\langle\theta,x\rangle|
\le\|\theta\|_p\|x\|_q
\le1.
\]

这个函数类涵盖了许多常见问题，例如带正则化的线性回归。我们先考察
$p=\infty$（从而 $q=1$）时逐点覆盖数的大小。

**命题 1。** 令

\[
\mathcal X=B_1^d,
\qquad
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_\infty^d\}.
\]

对于任意 $0\le\alpha\le1$，都有

\[
\mathcal N(\mathcal F,\alpha)
\le\left(\frac1\alpha\right)^d.
\]

此外，当 $n\ge d$ 时，

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=
O\left(
\sqrt{\frac{d\ln(n/d)}{n}}
\right).
\]

**证明。** 注意 $B_\infty^d$ 就是一个边长为 2 的
$d$ 维超立方体。固定任意 $0\le\alpha\le1$。我们把这个超立方体“均匀地”离散成

\[
\left(\frac1\alpha\right)^d
\]

个互不相交、边长为 $2\alpha$ 的小超立方体，并令
$\mathcal H\subseteq\mathcal F$ 为由这些小超立方体的中心参数化的线性函数集合。

显然，$\mathcal H$ 是 $\mathcal F$ 的逐点 $\alpha$-覆盖。事实上，对任意
$f_\theta\in\mathcal F$，令 $\theta'$ 是包含 $\theta$ 的小超立方体的中心，并令
$h_{\theta'}\in\mathcal H$ 为相应的线性函数。于是，对任意
$x\in B_1^d$，都有

\[
\begin{aligned}
|f_\theta(x)-h_{\theta'}(x)|
&=
|\langle\theta-\theta',x\rangle|\\
&\le
\|\theta-\theta'\|_\infty\|x\|_1\\
&\le\alpha.
\end{aligned}
\]

这就证明了第一个结论。第二个结论通过应用定理 1，并取

\[
\alpha=\sqrt{\frac dn}
\]

得到。 $\square$

> **脚注 1。** 严格地说，$(1/\alpha)^d$ 应写为
> $\lceil1/\alpha\rceil^d$。我们忽略这一细微差别，因为它不会造成实质影响。

这意味着上面的线性函数类是可学习的；通过 ERM 可以得到大约
$\sqrt{d/n}$ 的学习速率。

对于一般的 $p$，容易看出

\[
B_p^d\subseteq B_\infty^d.
\]

因此，如果仍然使用命题 1 的证明中构造的函数类 $\mathcal H$ 作为逐点覆盖，那么对任意
$f_\theta$ 及其代表 $h_{\theta'}$，以及任意
$x\in B_q^d$，都有

\[
\begin{aligned}
|f_\theta(x)-h_{\theta'}(x)|
&=
|\langle\theta-\theta',x\rangle|\\
&\le
\|\theta-\theta'\|_p\|x\|_q\\
&\le
d^{1/p}\|\theta-\theta'\|_\infty\\
&\le d^{1/p}\alpha.
\end{aligned}
\]

这意味着 $\mathcal H$ 是一个逐点 $d^{1/p}\alpha$-覆盖，从而逐点覆盖数满足

\[
\mathcal N(\mathcal F,\alpha)
\le
\left(\frac{d^{1/p}}{\alpha}\right)^d.
\]

因此，对任意 $p$，这个线性函数类都是可学习的。

不过，在处理 $p$-范数球 $B_p^d$ 时，直觉上我们也应该用小的
$p$-范数球来离散化它，而不是使用小超立方体。这样也许能够得到更小的覆盖。下一个命题表明，这一想法确实正确；但是，显式构造这样的覆盖似乎相当困难。幸运的是，证明会说明：有时即使不显式构造覆盖，也能给出覆盖数的上界。

**命题 2。** 若

\[
\mathcal X=B_q^d,
\qquad
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\]

其中 $p\ge1$、$q\ge1$，且 $1/p+1/q=1$，则对于任意
$0\le\alpha\le1$，都有

\[
\mathcal N(\mathcal F,\alpha)
\le
\left(\frac2\alpha+1\right)^d.
\]

此外，当 $n\ge d$ 时，

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=
O\left(
\sqrt{\frac{d\ln(n/d)}{n}}
\right).
\]

**证明。** 固定任意 $0\le\alpha\le1$。记 $rB_p^d$ 为半径为
$r\ge0$ 的 $p$-范数球。关键想法是：在球 $B_p^d$ 中放入尽可能多的、半径为
$\alpha/2$ 的小球 $(\alpha/2)B_p^d$。

形式化地，令 $S\subseteq B_p^d$ 是满足下述条件的最大子集：对任意两个不同的点
$\theta,\theta'\in S$，都有

\[
\|\theta-\theta'\|_p>\alpha.
\]

这称为 $B_p^d$ 的一个 $\alpha$-packing。

首先证明，相应的函数类

\[
\mathcal H=
\{h_\theta(x)=\langle\theta,x\rangle:\theta\in S\}
\]

是 $\mathcal F$ 的一个逐点 $\alpha$-覆盖。事实上，对于任意
$\theta\in B_p^d$，必然存在 $\theta'\in S$，使得

\[
\|\theta-\theta'\|_p\le\alpha.
\]

否则，仍可把 $\theta$ 加入 $S$，同时保持 $S$ 是一个
$\alpha$-packing，这与 $S$ 的最大性矛盾。于是，对任意
$x\in B_q^d$，显然有

\[
|f_\theta(x)-h_{\theta'}(x)|\le\alpha.
\]

剩下只需证明

\[
|S|\le\left(\frac2\alpha+1\right)^d.
\]

为此，设想以 $S$ 中的每个点为圆心，放置一个半径为
$\alpha/2$ 的 $p$-范数球。由 $S$ 的定义，这些球两两不相交。另一方面，它们全部包含在更大的球

\[
\left(1+\frac\alpha2\right)B_p^d
\]

之中。因此，所有小球的体积之和不超过大球的体积：

\[
|S|\operatorname{Vol}\left(\frac\alpha2B_p^d\right)
\le
\operatorname{Vol}\left(
\left(1+\frac\alpha2\right)B_p^d
\right).
\]

利用

\[
\operatorname{Vol}(rB_p^d)
=r^d\operatorname{Vol}(B_p^d)
\]

并整理，可得

\[
|S|\le\left(\frac2\alpha+1\right)^d.
\]

最后，再次应用定理 1 并取

\[
\alpha=\sqrt{\frac dn},
\]

便得到关于 $\mathcal R^{\mathrm{iid}}(\mathcal F)$ 的上界。 $\square$

在作业 1 中，你还将使用类似的体积论证，证明对于这个线性函数类，量级为

\[
O\left(\frac1{\alpha^d}\right)
\]

的覆盖数是紧的。

接下来考虑一个非参数例子：$\mathcal X=\mathbb R$，并令
$\mathcal F$ 为所有单调不减函数的集合。这个函数类常见于所谓的**等序回归**问题；在这类问题中，假设输出随输入单调变化是十分自然的。例如，可以把儿童身高预测为年龄的函数。

在这种情况下，$\mathcal F$ 看起来是一个表达能力很强的函数类。事实上，如下面的命题所示，它的逐点覆盖数是无穷大。

**命题 3。** 若

\[
\mathcal X=\mathbb R,
\qquad
\mathcal Y=[-1,+1],
\]

且 $\mathcal F\subseteq\mathcal Y^{\mathcal X}$ 是所有单调不减函数的集合，则对于任意
$\alpha<1$，都有

\[
\mathcal N(\mathcal F,\alpha)=\infty.
\]

**证明。** 考虑 $\mathcal F$ 的如下无穷子集：

\[
\{f_m(x)=\operatorname{sign}(x-m):m\text{ 是整数}\}.
\]

不可能用同一个函数 $h$ 逐点覆盖其中任意两个不同的函数
$f_m$ 和 $f_{m'}$。这是因为

\[
\left|
f_m\left(\frac{m+m'}2\right)
-
f_{m'}\left(\frac{m+m'}2\right)
\right|
=2,
\]

因此，$h((m+m')/2)$ 不可能同时与
$f_m((m+m')/2)$ 和 $f_{m'}((m+m')/2)$ 的距离都不超过
$\alpha<1$。这说明 $\mathcal F$ 不存在有限的逐点覆盖。 $\square$

这是否意味着该函数类不可学习呢？答案是否定的，下一节将说明这一点。重要的是，这表明逐点覆盖事实上并不是正确的复杂度度量，或者至少不是一个紧的复杂度度量。

### 1.2 覆盖投影

回顾一下：与分类问题中一样，对称化使我们只需要关注投影
$\mathcal F|_{x_{1:n}}$，而不必关注整个函数类
$\mathcal F$。这促使我们近似离散化 $n$ 维空间
$\mathcal F|_{x_{1:n}}$，而不是离散化 $\mathcal F$ 本身。

形式化地，如果 $V\subseteq[-1,+1]^n$ 满足：对任意
$f\in\mathcal F|_{x_{1:n}}$，都存在 $v\in V$，使得

\[
\|f-v\|_\infty\le\alpha,
\]

那么称 $V$ 是 $\mathcal F|_{x_{1:n}}$ 关于
$\ell_\infty$ 范数的一个 $\alpha$-覆盖。

注意，这里略微滥用了符号 $f$：此时它表示一个 $n$ 维向量，而在前文中它也表示
$\mathcal F$ 中的函数。关于 $\ell_\infty$ 范数的
$\alpha$-覆盖数
$\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)$，定义为最小
$\ell_\infty$ 范数 $\alpha$-覆盖的大小。

事实上，更仔细地检查定理 1 的证明后可以发现，我们不一定需要
$\ell_\infty$ 覆盖。为此，对于任意 $p>0$，如果
$V\subseteq[-1,+1]^n$ 满足：对任意
$f\in\mathcal F|_{x_{1:n}}$，都存在 $v\in V$，使得

\[
\|f-v\|_p\le n^{1/p}\alpha,
\]

或者等价地，

\[
\left(
\frac1n\sum_{t=1}^n|f_t-v_t|^p
\right)^{1/p}
\le\alpha,
\]

那么称 $V$ 是 $\mathcal F|_{x_{1:n}}$ 关于
$\ell_p$ 范数的一个 $\alpha$-覆盖。

类似地，相应的 $\alpha$-覆盖数
$\mathcal N_p(\mathcal F|_{x_{1:n}},\alpha)$，定义为最小
$\ell_p$ 范数 $\alpha$-覆盖的大小。

注意，这个定义中存在一个看起来有些“奇怪”但实际上是惯例的归一化。这个归一化保证

\[
\left(
\frac1n\sum_{t=1}^n|f_t-v_t|^p
\right)^{1/p}
\]

是 $p$ 的单调递增函数；你可以通过 Hölder 不等式证明这一点。因此，

\[
\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)
\le
\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)
\le\cdots\le
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha).
\]

使用与定理 1 的证明相似的论证，可以得到下面的结果。

**定理 2。** 对任意
$\mathcal F\subseteq[-1,+1]^{\mathcal X}$ 以及输入
$x_{1:n}$，都有

\[
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
\le
\min_{\alpha\ge0}
\left(
\alpha+
\sqrt{
\frac{
2\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)
}{n}
}
\right).
\]

**证明。** 固定任意 $\alpha\ge0$。令 $V$ 是
$\mathcal F|_{x_{1:n}}$ 的一个 $\alpha$-覆盖，其大小为
$\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)$。对于每个
$f\in\mathcal F|_{x_{1:n}}$，令 $v_f\in V$ 是它的“代表”，满足

\[
\|f-v_f\|_1\le n\alpha.
\]

记 $\epsilon=(\epsilon_1,\ldots,\epsilon_n)$，则

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,f\rangle
\right]\\
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,f-v_f+v_f\rangle
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,f-v_f\rangle
\right]
+
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,v_f\rangle
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\|f-v_f\|_1
\right]
+
\frac1n\mathbb E
\left[
\sup_{v\in V}
\langle\epsilon,v\rangle
\right]\\
&\le
\alpha+
\sqrt{
\frac{
2\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)
}{n}
}.
\end{aligned}
\]

最后一步使用了 Massart 引理。因为这个结论对任意
$\alpha\ge0$ 都成立，所以定理得证。 $\square$

现在来看为什么覆盖投影优于覆盖函数。

首先，由于 $\mathcal F|_{x_{1:n}}$ 位于
$[-1,+1]^n$ 中，类似上一节的做法，把
$[-1,+1]^n$ 离散成小超立方体，就可以很容易地证明

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le
\left(\frac1\alpha\right)^n
\]

总是成立。然而，这个上界没有用处，因为把它代入定理 2 的上界后，只能得到 Rademacher complexity 的常数级上界。

其次，如果 $\mathcal H$ 是 $\mathcal F$ 的逐点
$\alpha$-覆盖，那么根据定义，
$\mathcal H|_{x_{1:n}}$ 也是
$\mathcal F|_{x_{1:n}}$ 关于 $\ell_\infty$ 范数的
$\alpha$-覆盖。因此，

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le
\mathcal N(\mathcal F,\alpha).
\]

也就是说，覆盖投影永远不会比覆盖函数更差。

所以，对于前面讨论的线性函数类

\[
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\]

同样有

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le
\left(\frac2\alpha+1\right)^d.
\]

事实上，不难看出，更一般地，只要
$\mathcal F|_{x_{1:n}}$ 位于 $[-1,+1]^n$ 的某个
$d$ 维子空间中，它的覆盖数大致就是

\[
O\left(\left(\frac1\alpha\right)^d\right)
\]

的量级；参见作业 1。

最后，我们回到单调不减函数类，并说明：虽然
$\mathcal N(\mathcal F,\alpha)=\infty$，但
$\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)$ 是有限的。这意味着，覆盖投影严格优于覆盖函数。

**命题 4。** 若

\[
\mathcal X=\mathbb R,
\qquad
\mathcal Y=[-1,+1],
\]

且 $\mathcal F\subseteq\mathcal Y^{\mathcal X}$ 是所有单调不减函数的集合，则对于任意
$\alpha<1$，都有

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le
(n+1)^{1/\alpha}.
\]

因此，

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\min_{0\le\alpha\le1}
\left(
\alpha+
\sqrt{\frac{2\ln(n+1)}{\alpha n}}
\right)
=
O\left(
\left(\frac{\ln n}{n}\right)^{1/3}
\right).
\]

**证明。** 不失一般性，假设

\[
x_1\le\cdots\le x_n.
\]

令 $S\subseteq[-1,+1]$ 是尺度为 $2\alpha$ 的一个有限离散化，使得

\[
|S|\le\frac1\alpha,
\]

并且对于任意 $y\in[-1,+1]$，都存在 $y'\in S$，满足

\[
|y-y'|\le\alpha.
\]

令

\[
V=
\{v\in S^n:v_1\le\cdots\le v_n\}.
\]

根据构造，显然 $V$ 是
$\mathcal F|_{x_{1:n}}$ 关于 $\ell_\infty$ 范数的一个
$\alpha$-覆盖。剩下只需计算 $V$ 的大小。

不难看出，$|V|$ 恰好等于方程

\[
\sum_{i=1}^{|S|}m_i=n
\]

的非负整数解 $(m_1,\ldots,m_{|S|})$ 的数量，其中
$m_i$ 表示 $S$ 中第 $i$ 小的元素在序列中出现的次数。解的精确数量是

\[
\binom{n+|S|-1}{|S|-1},
\]

不过，只需注意每个 $m_i$ 最多有 $n+1$ 种可能取值，就可以得到粗略估计

\[
|V|
\le
(n+1)^{|S|}
\le
(n+1)^{1/\alpha}.
\]

关于 Rademacher complexity 的上界，则通过直接应用定理 2 并选取最优的
$\alpha$ 得到。 $\square$

这个结果说明，虽然所有单调不减函数组成的类看起来表达能力很强，但它事实上仍然可以通过 ERM 学习。这也再次展示了对称化技巧的重要性：它使我们只需关注函数类在样本上的投影，而不是函数本身。

最后需要指出，无论使用哪一种覆盖，覆盖论证都只出现在分析中，而不出现在算法本身。算法始终只是 ERM；即使对于等序回归这样的任务，ERM 也可能非常高效。

## 2 Dudley 熵积分

读者可能已经注意到，命题 4 给出的收敛速率大约是
$1/n^{1/3}$，慢于此前其他例子中常见的
$1/\sqrt n$ 速率。

这是否真的意味着，学习单调不减函数需要更多样本？还是仅仅因为我们的上界太松？事实证明，后者才是正确答案。为了改进这个上界，需要使用一种更紧的分析，即所谓的 **Dudley 熵积分**。

**定理 3。** 对任意
$\mathcal F\subseteq[-1,+1]^{\mathcal X}$ 以及输入
$x_{1:n}$，都有

\[
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
\le
\min_{0\le\alpha\le1}
\left(
4\alpha+
\frac{12}{\sqrt n}
\int_\alpha^1
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta
\right).
\]

证明推迟到下一小节。上述定理中的上界被称为函数类
$\mathcal F$ 的 Dudley 熵积分。“对数覆盖数”经常被称为**度量熵**，这也是该名称的由来。

这个上界使用的是 $\ell_2$ 覆盖数，原因将在证明中变得清楚；此外，它同时考察多个不同尺度下的覆盖数。

忽略常数以及 $\mathcal N_1$ 和 $\mathcal N_2$ 之间的差别，这个上界不会比定理 2 给出的上界更差。原因是

\[
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\]

关于 $\delta$ 单调不增，因此

\[
\begin{aligned}
\int_\alpha^1
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta
&\le
(1-\alpha)
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)
}\\
&\le
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)
}.
\end{aligned}
\]

不过，它有可能严格更好，下面两个例子就说明了这一点。

**命题 5。** 若

\[
\mathcal X=B_q^d,
\qquad
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\]

其中 $p\ge1$、$q\ge1$，并且 $1/p+1/q=1$，则

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\left(\sqrt{\frac dn}\right).
\]

**证明。** 使用上界

\[
\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
\le
\mathcal N(\mathcal F,\delta)
\le
\left(\frac2\delta+1\right)^d
\le
\left(\frac3\delta\right)^d.
\]

因此，

\[
\begin{aligned}
\int_\alpha^1
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta
&\le
\sqrt d
\int_\alpha^1
\sqrt{\ln\left(\frac3\delta\right)}
\,d\delta.
\end{aligned}
\]

当 $\alpha=0$ 时，右侧是 $O(\sqrt d)$，因为

\[
\int_0^1\sqrt{\ln(1/\delta)}\,d\delta
=\frac{\sqrt\pi}{2}.
\]

将这个结果代入 Dudley 熵积分并取 $\alpha=0$，即可完成证明。 $\square$

> **脚注 2。** 更一般地，如果函数的值域不是 $[-1,+1]$，只需把定理中“$0\le\alpha\le1$”和“$\int_\alpha^1$”里的 1 替换为 $\sup_{f\in\mathcal F}\sqrt{\frac1n\sum_{t=1}^n f(x_t)^2}$。作业 1 的第 1(b) 题会用到这个更一般的版本。

因此，使用 Dudley 熵积分可以消除命题 2 中线性函数 Rademacher complexity 上界里额外的
$\ln n$ 因子。下一个例子中的改进会更加显著。

**命题 6。** 若

\[
\mathcal X=\mathbb R,
\qquad
\mathcal Y=[-1,+1],
\]

且 $\mathcal F\subseteq\mathcal Y^{\mathcal X}$ 是所有单调不减函数的集合，则

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=
O\left(\sqrt{\frac{\ln n}{n}}\right).
\]

**证明。** 再次直接代入上界

\[
\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
\le
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\delta)
\le
(n+1)^{1/\delta},
\]

并计算 Dudley 熵积分：

\[
\begin{aligned}
\int_\alpha^1
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta
&\le
\sqrt{\ln(n+1)}
\int_\alpha^1\frac1{\sqrt\delta}\,d\delta\\
&=
2\sqrt{\ln(n+1)}(1-\sqrt\alpha)\\
&\le
2\sqrt{\ln(n+1)}.
\end{aligned}
\]

取 $\alpha=0$ 即完成证明。 $\square$

这说明，学习单调不减函数的速率仍然大约是
$1/\sqrt n$，而不是 $1/n^{1/3}$。这展示了 Dudley 熵积分的力量。

### 2.1 Chaining 技巧

**定理 3 的证明。** 证明依赖于一个重要的 chaining 技巧，它同时考察不同的覆盖尺度。

具体地，对于

\[
j=1,2,\ldots,M,
\]

其中 $M$ 稍后指定，令

\[
\alpha_j=2^{-j},
\]

并令 $V_j$ 是 $\mathcal F|_{x_{1:n}}$ 的一个关于
$\ell_2$ 范数的 $\alpha_j$-覆盖，其大小为

\[
\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha_j).
\]

另外，令 $V_0$ 是 $\mathcal F|_{x_{1:n}}$ 的平凡
$2^0$-覆盖，其中只包含全零向量。

现在，对于每个 $f\in\mathcal F|_{x_{1:n}}$，可以把它与一条代表链

\[
v_f^j\in V_j,
\qquad j=0,1,2,\ldots,M
\]

关联起来，使得

\[
\|f-v_f^j\|_2\le\sqrt n\,\alpha_j.
\]

记 $\epsilon=(\epsilon_1,\ldots,\epsilon_n)$，则

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,f\rangle
\right]\\
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\left\langle
\epsilon,\,
f-v_f^M+
\sum_{j=1}^M(v_f^j-v_f^{j-1})
\right\rangle
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,f-v_f^M\rangle
\right]\\
&\quad+
\frac1n
\sum_{j=1}^M
\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,v_f^j-v_f^{j-1}\rangle
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\|f-v_f^M\|_1
\right]\\
&\quad+
\frac1n
\sum_{j=1}^M
\mathbb E
\left[
\sup_{(v,v')\in S_j}
\langle\epsilon,v-v'\rangle
\right],
\end{aligned}
\]

其中

\[
S_j=
\left\{
(v,v')\in V_j\times V_{j-1}:
\begin{array}{l}
\text{存在 }f\in\mathcal F|_{x_{1:n}},\\
v\text{ 和 }v'\text{ 都是 }f\text{ 的代表}
\end{array}
\right\}.
\]

上式最后一行中的第一项至多为 $\alpha_M$。这是因为，根据 Cauchy-Schwarz 不等式，

\[
\|f-v_f^M\|_1
\le
\sqrt n\,\|f-v_f^M\|_2
\le
n\alpha_M.
\]

对于第二项，再次应用 Massart 引理：

\[
\begin{aligned}
\mathbb E
\left[
\sup_{(v,v')\in S_j}
\langle\epsilon,v-v'\rangle
\right]
&\le
\sigma\sqrt{2\ln(|V_j||V_{j-1}|)}\\
&\le
2\sigma\sqrt{\ln|V_j|}\\
&=
2\sigma
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha_j)
},
\end{aligned}
\]

其中

\[
\sigma=
\sup_{(v,v')\in S_j}\|v-v'\|_2.
\]

对于任意 $(v,v')\in S_j$，存在某个 $f$，使得

\[
\|v-f\|_2\le\sqrt n\,\alpha_j
\]

且

\[
\|v'-f\|_2\le\sqrt n\,\alpha_{j-1}.
\]

因此，

\[
\begin{aligned}
\|v-v'\|_2
&\le
\|v-f\|_2+\|v'-f\|_2\\
&\le
\sqrt n(\alpha_j+\alpha_{j-1})\\
&=
3\sqrt n\,\alpha_j.
\end{aligned}
\]

这说明

\[
\sigma\le3\sqrt n\,\alpha_j.
\]

于是，

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
&\le
\alpha_M+
\frac6{\sqrt n}
\sum_{j=1}^M
\alpha_j
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha_j)
}\\
&\le
\alpha_M+
\frac{12}{\sqrt n}
\sum_{j=1}^M
(\alpha_j-\alpha_{j+1})
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha_j)
}\\
&\le
\alpha_M+
\frac{12}{\sqrt n}
\int_{\alpha_{M+1}}^{\alpha_1}
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta.
\end{aligned}
\]

最后一步使用了

\[
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\]

关于 $\delta$ 单调不增这一事实。

最后，对于任意 $0<\alpha\le1$，选择 $M$ 使得

\[
2^{-(M+2)}
\le
\alpha
\le
2^{-(M+1)}.
\]

于是

\[
\alpha_M\le4\alpha,
\qquad
\alpha\le\alpha_{M+1}.
\]

因此，

\[
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
\le
4\alpha+
\frac{12}{\sqrt n}
\int_\alpha^1
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta.
\]

对于 $\alpha=0$ 的情形，令 $M\to\infty$，即可得到相同的上界。 $\square$

注意，使用 $\ell_2$ 范数覆盖的关键原因是：
$\sigma$ 的定义使用了 $\ell_2$ 范数，而这继承自最大值不等式。

### 小结

总结一下，我们已经利用覆盖数，推导了实值函数类 Rademacher complexity 的三种不同上界；同时还使用两个贯穿始终的例子，说明每种上界能够达到怎样的效果。下表给出了总结。

**表 1：利用覆盖数得到的 Rademacher complexity 上界总结**

| $\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})$ 的上界 | 线性函数 | 单调不减函数 |
|---|---:|---:|
| $\displaystyle \min_{\alpha\ge0}\left(\alpha+\sqrt{\frac{2\ln\mathcal N(\mathcal F,\alpha)}{n}}\right)$ | $\displaystyle O\left(\sqrt{\frac{d\ln(n/d)}{n}}\right)$ | $\infty$ |
| $\displaystyle \min_{\alpha\ge0}\left(\alpha+\sqrt{\frac{2\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)}{n}}\right)$ | $\displaystyle O\left(\sqrt{\frac{d\ln(n/d)}{n}}\right)$ | $\displaystyle O\left(\left(\frac{\ln n}{n}\right)^{1/3}\right)$ |
| $\displaystyle \min_{0\le\alpha\le1}\left(4\alpha+\frac{12}{\sqrt n}\int_\alpha^1\sqrt{\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)}\,d\delta\right)$ | $\displaystyle O\left(\sqrt{\frac dn}\right)$ | $\displaystyle O\left(\sqrt{\frac{\ln n}{n}}\right)$ |

## 3 组合参数：伪维数

注意，覆盖数所扮演的角色与分类问题中的增长函数非常相似。对于分类问题，我们还引入了 VC 维：它是函数类的一个组合参数，可能更容易求出，并且通过 Sauer 引理直接给出增长函数的上界。

这自然引出了一个问题：对于实值函数类，我们能否也提出某种组合参数，并用它直接控制覆盖数？

这样的组合参数的确存在。文献中最早出现的这类参数是**伪维数**，它基于一个非常自然的想法：通过观察实值函数的上图集，把实值函数化为二分类器。

具体而言，一个函数

\[
f:\mathcal X\to[-1,+1]
\]

自然地把空间

\[
\mathcal X\times[-1,+1]
\]

分为两个部分：

- 满足 $f(x)\le y$ 的部分，这部分称为 $f$ 的上图集；
- 满足 $f(x)>y$ 的部分。

因此，可以把 $f$ 看作空间
$\mathcal X\times[-1,+1]$ 上的一个二分类器。

$\mathcal F$ 的伪维数，直接定义为由此诱导出的二分类器类的 VC 维：

\[
\operatorname{Pdim}(\mathcal F)
=
\operatorname{VCdim}
\left(
\{
h(x,y)=\operatorname{sign}(f(x)-y)
:
f\in\mathcal F
\}
\right).
\]

如果把 VC 维的定义完全展开，那么伪维数就是满足下面条件的最大整数
$n$：存在 $n$ 个输入-输出点对

\[
(x_1,y_1),\ldots,(x_n,y_n)
\in
\mathcal X\times[-1,+1],
\]

使得对于任意标记

\[
s_1,\ldots,s_n\in\{-1,+1\},
\]

都存在 $f\in\mathcal F$，使得对于所有
$t=1,\ldots,n$，都有

\[
\operatorname{sign}(f(x_t)-y_t)=s_t.
\]

可以尝试在 $\mathcal X=\mathbb R$ 的情形下画一幅图，以帮助理解这个定义。

再次以线性函数类为例：

\[
\mathcal X=B_q^d,
\qquad
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\]

其中 $p\ge1$、$q\ge1$，且

\[
\frac1p+\frac1q=1.
\]

为了判断这个函数类的伪维数有多大，需要考察下列分类器类的 VC 维：

\[
\left\{
h(x,y)=\operatorname{sign}(\langle\theta,x\rangle-y)
:
\theta\in B_p^d
\right\}.
\]

这个函数类与第 2 讲以及作业 1 中讨论的线性分类器类非常相似。不难验证，它的 VC 维恰好是
$d$。因此，

\[
\operatorname{Pdim}(\mathcal F)=d.
\]

有限的伪维数足以保证可学习性。事实上，可以证明一个类似 Sauer 引理的结论：忽略一些对数因子，

\[
\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)
\]

的量级为

\[
\operatorname{Pdim}(\mathcal F)
\ln\left(\frac1\alpha\right).
\]

这里不证明这一事实；但把这个上界直接代入定理 2，就可以得到

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=
O\left(
\sqrt{
\frac{
\operatorname{Pdim}(\mathcal F)\ln n
}{n}
}
\right).
\]

还要注意，对于线性函数类，这与表 1 中的上界几乎相同。

然而，有限的伪维数并不是可学习性的必要条件。为了说明这一点，再次考察所有单调不减函数组成的类。

我们声称：虽然这个函数类是可学习的，这一点已经在前面证明过，但它实际上具有无穷大的伪维数。这意味着，伪维数并不是“正确的”复杂度度量。

事实上，对于任意 $n$，考虑下列输入-输出点对：

\[
(0,0/n),\quad
(1,1/n),\quad
(2,2/n),\quad
\ldots
\]

对于任意标记

\[
s_1,\ldots,s_n\in\{-1,+1\},
\]

只要

\[
\epsilon\in\left(0,\frac1{2n}\right],
\]

我们总能找到一个单调不减函数，使它依次通过这些点：

\[
(0,0/n+s_1\epsilon),\quad
(1,1/n+s_2\epsilon),\quad
(2,2/n+s_3\epsilon),\quad
\ldots
\]

显然，这样的函数对所有 $t=1,\ldots,n$ 都满足

\[
\operatorname{sign}(f(x_t)-y_t)=s_t.
\]

这说明，诱导出的二分类器类能够打散任意大小的这类训练集，因此其伪维数是无穷大。

应该怎样解决这个问题？是否存在一个更好的组合参数，使得它的有限性成为可学习性的必要条件？这些问题将在下一讲中回答。
