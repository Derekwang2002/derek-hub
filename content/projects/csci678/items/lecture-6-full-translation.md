---
title: "Lecture 6 课件完整翻译"
summary: "完整翻译 Lecture 6 的全部章节、定理、证明及原编号：有限类集中、零覆盖、Littlestone 维数、在线回归和序列 fat 维数；译注单独说明笔误和适用范围。"
---

**2026 年秋季，Haipeng Luo。**

> 对照八页原课件，保留全部四节、3.1 小节、引理 1、定理 1–6、推论 1、命题 1、公式 (1)–(3)、两个回归例子及脚注。原课件：lecture6.pdf（本地原课件，未在线发布）。配套：[详细讲解](/zh/projects/csci678/lecture-6-explanation)。译注单独标明。原件没有图表或参考文献表。

## 1 有限函数类的在线学习

上一讲开始研究在线学习，并得到了以下一串博弈值上界：

\[
\begin{aligned}
\mathcal V^{\mathrm{seq}}(\mathcal F,n)
&\le\sup_{\mathbf P\in\Delta(\mathcal Z^n)}
\mathbb E_{z_{1:n}\sim\mathbf P}\sup_{f\in\mathcal F}\frac1n\sum_{t=1}^n
\left(\mathbb E_{z'_t\sim\mathbf P(\cdot\mid z_{1:t-1})}\ell(f,z'_t)-\ell(f,z_t)\right)\\
&\le2\mathcal R^{\mathrm{seq}}(\ell(\mathcal F))
\lesssim\mathcal R^{\mathrm{seq}}(\mathcal F).
\end{aligned}
\]

前两步一般成立，最后一步针对监督学习；这里简写隐藏了上一讲收缩中的 Lipschitz 常数及可能的对数因子。本讲研究如何控制 $\mathcal R^{\mathrm{seq}}(\mathcal F)$，从有限类开始，关键仍是最大值不等式。

**引理 1（最大值不等式）。** 若有限集合 $\{U_f\}_{f\in\mathcal F}$ 中每个变量都满足以零为中心的 $\sigma$-次高斯矩母函数界，则

\[
\mathbb E\max_{f\in\mathcal F}U_f\le\sigma\sqrt{2\ln|\mathcal F|}.
\]

**定理 1。** 设 $\mathcal F\subseteq\mathcal Y^{\mathcal X}$ 有限。任意输入树均满足

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\frac1n\sqrt{2\left(\max_{f\in\mathcal F}\max_\epsilon
\sum_{t=1}^n f^2(\mathbf x_t(\epsilon))\right)\ln|\mathcal F|}.
\]

因此，若 $\mathcal Y\subseteq[-C,C]$，则

\[
\mathcal R^{\mathrm{seq}}(\mathcal F)\le C\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\]

**证明。** 记

\[
U_{f,\tau}=\sum_{t=1}^{\tau}\epsilon_tf(\mathbf x_t(\epsilon)),\qquad
\sigma^2=\max_f\max_\epsilon\sum_{t=1}^n f^2(\mathbf x_t(\epsilon)).
\]

只需证明 $U_{f,n}$ 是 $\sigma$-次高斯，再应用引理 1 并除以 $n$。对任意正 $\lambda$，先剥离最后一轮：

\[
\begin{aligned}
\mathbb E e^{\lambda U_{f,n}}
&=\mathbb E\left[e^{\lambda U_{f,n-1}}
\mathbb E\left[e^{\lambda\epsilon_n f(\mathbf x_n(\epsilon))}\mid\epsilon_{1:n-1}\right]\right]\\
&\le\mathbb E\left[e^{\lambda U_{f,n-1}}
e^{\lambda^2 f^2(\mathbf x_n(\epsilon))/2}\right].
\end{aligned}
\]

这是因为给定过去后，$\epsilon_nf(\mathbf x_n(\epsilon))$ 是参数 $|f(\mathbf x_n(\epsilon))|$ 的次高斯变量。继续剥离前一轮，会得到

\[
\mathbb E\left[e^{\lambda U_{f,n-2}}
\mathbb E\left[e^{\lambda\epsilon_{n-1}f(\mathbf x_{n-1}(\epsilon))}
e^{\lambda^2f^2(\mathbf x_n(\epsilon))/2}\mid\epsilon_{1:n-2}\right]\right].
\]

注意最后的平方项仍依赖 $\epsilon_{n-1}$，不能直接当常数提出。先取最坏情况：

\[
\begin{aligned}
&\le\mathbb E\left[e^{\lambda U_{f,n-2}}
\mathbb E\left[e^{\lambda\epsilon_{n-1}f(\mathbf x_{n-1}(\epsilon))}\mid\epsilon_{1:n-2}\right]
\max_{\epsilon_{n-1}}e^{\lambda^2 f^2(\mathbf x_n(\epsilon))/2}\right]\\
&\le\mathbb E\left[e^{\lambda U_{f,n-2}}\max_{\epsilon_{n-1}}
e^{\frac{\lambda^2}{2}(f^2(\mathbf x_{n-1}(\epsilon))+f^2(\mathbf x_n(\epsilon)))}\right]\\
&\le\mathbb E\left[e^{\lambda U_{f,n-2}}\max_{\epsilon_{n-2},\epsilon_{n-1}}
e^{\frac{\lambda^2}{2}(f^2(\mathbf x_{n-1}(\epsilon))+f^2(\mathbf x_n(\epsilon)))}\right].
\end{aligned}
\]

照此继续，最终得到

\[
\mathbb E e^{\lambda U_{f,n}}
\le\max_\epsilon e^{\frac{\lambda^2}{2}\sum_{t=1}^n f^2(\mathbf x_t(\epsilon))}
\le e^{\lambda^2\sigma^2/2}.
\]

这证明了有限有界函数类在线可学习，并将用于无限类。

## 2 无限类：在线二分类与零覆盖

先考虑零一损失二分类。统计学习中，即使原类无限，固定样本上的投影仍有限；在线学习也有对应投影：

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
&=\frac1n\mathbb E_\epsilon\sup_{f\in\mathcal F}\sum_t\epsilon_t f(\mathbf x_t(\epsilon))\\
&=\frac1n\mathbb E_\epsilon\sup_{\mathbf v\in V}\sum_t\epsilon_t\mathbf v_t(\epsilon)
\le\sqrt{\frac{2\ln|V|}{n}},
\end{aligned}\tag{1}
\]

\[
V=\mathcal F|_{\mathbf x}
=\{(f\circ\mathbf x_1,\ldots,f\circ\mathbf x_n):f\in\mathcal F\}.
\]

投影是二值树的有限集合。但深度 $n$ 的树有 $2^n-1$ 个节点，投影大小最坏达 $2^{2^n-1}$，而统计情形只有至多 $2^n$ 种标签。这两个粗界都不能推出可学习性；是否简单的类就能有小投影？遗憾的是未必。考虑实数域上的单点指示类：

\[
\mathcal F=\left\{f_\theta(x)=
\begin{cases}+1,&x=\theta,\\-1,&x\ne\theta,\end{cases}\ \middle|\ \theta\in\mathbb R\right\}.\tag{2}
\]

每个分类器只在一个输入处预测 +1，连两个点都无法打散，因此 VC 维恰为 1，在统计设置很容易学习。但令树中所有节点的输入互异，则投影包括全 −1 树，以及每个节点单独为 +1 的 $2^n-1$ 棵树，总数 $2^n$，又让 (1) 失去意义。是投影不合适，还是这么简单的类也无法在线学习？幸好是前者。

投影要求

\[
\forall f\in\mathcal F,\ \exists\mathbf v\in V,\ \forall\epsilon\in\{-1,+1\}^n,\quad
f(\mathbf x_t(\epsilon))=\mathbf v_t(\epsilon)\quad\forall t.
\]

但只要交换两个量词，满足下面较弱要求就足以让 (1) 成立，只需把第二个等号改为不等号：

\[
\forall f\in\mathcal F,\ \forall\epsilon\in\{-1,+1\}^n,\ \exists\mathbf v\in V,\quad
f(\mathbf x_t(\epsilon))=\mathbf v_t(\epsilon)\quad\forall t.
\]

这种 $V$ 称为 $\mathcal F|_{\mathbf x}$ 的**零覆盖**，最小大小记为 $\mathcal N_0(\mathcal F|_{\mathbf x})$。因此

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\sqrt{\frac{2\ln\mathcal N_0(\mathcal F|_{\mathbf x})}{n}}.
\]

零覆盖数不大于投影大小，因为投影总是自身的零覆盖。此外，它总不超过 $2^n$：取所有“每一层内部取值相同”的树，一共 $2^n$ 棵，足以逐路径匹配任意类。这仍是无效的粗界，但至少降到了统计设置相同的水平。

式 (2) 的类有大小至多 $n+1$ 的零覆盖，因而在线可学习。先看每条路径上输入均不重复的特例：取全 −1 树，再对每个层数 $t$ 取“第 $t$ 层全 +1、其他节点全 −1”的树，即可覆盖。路径中有重复值时，直接构造较难；最好有一个类似 VC 维的组合量，像 Sauer 引理一样控制覆盖数。下一节就介绍它。

> 译注：课件此处用“零覆盖数是 $n+1$”的简写。对任意固定树应是“不超过”；某些树更小，例如所有节点输入相同时最多只需两棵。最坏树可以达到 $n+1$。

## 3 Littlestone 维数

若对每条路径/标签序列都存在一个函数匹配整条路径，则称 $\mathcal F$ **打散**树 $\mathbf x$：

\[
\forall\epsilon\in\{-1,+1\}^n,\ \exists f\in\mathcal F,\quad
f(\mathbf x_t(\epsilon))=\epsilon_t\quad(t=1,\ldots,n).
\]

**Littlestone 维数** $\operatorname{Ldim}(\mathcal F)$ 是可被打散树的最大深度。不能打散任何正深度树时为 0；任意有限深度都可以时为无穷。(原注 1) 总有 VC 维不大于 Littlestone 维：若一组固定样本被打散，就把第 $t$ 个样本填满树的第 $t$ 层。对非空类而言，Littlestone 维为 0 意味着 VC 维为 0，因此类中只有一个不同的函数。

证明维数等于 $d$，需要构造深度 $d$ 的树并排除所有深度 $d+1$ 的树。式 (2) 的单点类维数恰为 1：任何根节点都可打散；但走过 +1 边后只剩一个函数，不能同时实现 $(+1,+1)$ 与 $(+1,-1)$。HW2 会研究高维推广。下面的 Sauer 型定理还给出递归覆盖构造。

**定理 2。** 深度 $n$ 的任意输入树和维数 $d<n$ 的二分类类满足

\[
\mathcal N_0(\mathcal F|_{\mathbf x})\le\sum_{i=0}^d\binom ni\le\left(\frac{en}{d}\right)^d.
\]

**证明。** 令 $g(d,n)=\sum_{i=0}^d\binom ni$。第二个不等式已在 Sauer 引理中证明，现对 $d+n$ 归纳。起点 $d=0,n=1$ 显然；任意 $d=0$ 也只需一棵树。设 $d>0$。按根输入 $x_1$ 将类划分为

\[
\mathcal F_-=\{f\in\mathcal F:f(x_1)=-1\},\qquad
\mathcal F_+=\{f\in\mathcal F:f(x_1)=+1\}.
\]

令 $\mathbf x^\ell,\mathbf x^r$ 为根的左右子树。分别取 $\mathcal F_+$ 在两棵子树上的最小零覆盖 $V_+^\ell,V_+^r$。构造 $V_+$：根全部标 +1，把两个子覆盖的元素配对做左右子树，保证每个元素至少出现一次。较短列表可重复，因此只需两者大小的最大值。沿任意路径只会进入一个子树，所以 $V_+$ 确实覆盖 $\mathcal F_+|_{\mathbf x}$。对负类同样构造 $V_-$，最后取并集。

两子类不可能都有维数 $d$：否则将它们各自打散的深度 $d$ 树接到 $x_1$ 下，就得到被整个类打散的深度 $d+1$ 树，矛盾。不妨设负子类维数至多 $d-1$，由归纳有

\[
\begin{aligned}
|V_+|&=\max\{|V_+^\ell|,|V_+^r|\}\le g(d,n-1),\\
|V_-|&=\max\{|V_-^\ell|,|V_-^r|\}\le g(d-1,n-1),\\
\mathcal N_0(\mathcal F|_{\mathbf x})&\le|V_-|+|V_+|
\le g(d-1,n-1)+g(d,n-1)=g(d,n).
\end{aligned}
\]

最后等式就是 Pascal 恒等式。零覆盖允许按最大值配对；如果要求覆盖整棵投影树，就可能需要左右覆盖大小的乘积。对单点类，本定理给出 $g(1,n)=n+1$，即使路径输入重复也成立；可以自己对深度 3 的小树执行递归。

> 译注：原证明只写了 $d<n$ 的归纳域，但递归会碰到 $d=n-1$ 的子问题。补上 $g(d,m)=2^m$（当 $d\ge m$）的平凡边界即可闭合；空类不需要覆盖，$d=0$ 的幂式按极限值 1 理解。

**推论 1。** 二分类类的博弈值满足

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)\le\mathcal R^{\mathrm{seq}}(\mathcal F)
\le\sqrt{\frac{2d\ln(en/d)}n},\qquad d=\operatorname{Ldim}(\mathcal F).
\]

有限 Littlestone 维数足以保证在线可学习，而且也是必要的。上式在 $1\le d\le n$ 使用；$d=0$ 时值为 0，$d>n$ 使用平凡界。

**定理 3。** 若 Littlestone 维数无限，则对任意 $n$，博弈值至少为 $1/2$。

**证明。** 取被打散的深度 $n$ 树和独立随机符号，环境在第 $t$ 轮提供 $(\mathbf x_t(\epsilon),\epsilon_t)$。不论算法 proper 还是 improper，当前标签都是独立公平符号，所以预期总损失恰为 $n/2$。而按打散定义，每条实现路径都有零错误的参照函数，故预期遗憾为 $n/2$。HW2 会证明更强结论：当 $d\le n$ 时，值至少为 $\sqrt{d/(8n)}$。

**总结。** 二分类中，各步合起来得到

\[
\begin{aligned}
\sqrt{\frac d{8n}}
&\le\mathcal V^{\mathrm{seq}}(\mathcal F,n)
\le\sup_{\mathbf P}\mathbb E\sup_f\frac1n\sum_t
\left(\mathbb E_{t-1}\ell(f,z_t)-\ell(f,z_t)\right)\\
&\le2\mathcal R^{\mathrm{seq}}(\ell(\mathcal F))
\le\mathcal R^{\mathrm{seq}}(\mathcal F)
\le\sup_{\mathbf x}\sqrt{\frac{2\ln\mathcal N_0(\mathcal F|_{\mathbf x})}{n}}
\le\sqrt{\frac{2d\ln(en/d)}n}.
\end{aligned}
\]

这里 $d\le n$，条件期望只作用于损失的独立条件副本。上下界仍相差对数因子；“紧”是指这种精度，并非常数级完全相等。

## 3.1 在线学习严格更难

第 1 讲的 online-to-batch 转换说明在线学习至少一样难。单点指示类的两个维数均为 1，还不能说明严格更难。改看实数域上的阈值类：

\[
\mathcal F=\left\{f_\theta(x)=
\begin{cases}+1,&x\le\theta,\\-1,&x>\theta,\end{cases}\ \middle|\ \theta\in\mathbb R\right\}.\tag{3}
\]

第 2 讲已知它的 VC 维恰为 1，但其 Littlestone 维无限。**命题 1。** 式 (3) 的阈值类有无限 Littlestone 维。

**证明。** 构造无限输入树：根为 $1/2$，第 $t$ 层值为 $a$ 的节点，左右孩子分别为 $a-2^{-(t+1)}$ 与 $a+2^{-(t+1)}$。画图更容易理解。对任意有限深度和路径，令

\[
L=\max_{t:\epsilon_t=+1}\mathbf x_t(\epsilon),\qquad
U=\min_{t:\epsilon_t=-1}\mathbf x_t(\epsilon),
\]

若相应集合为空，分别取 0 和 1。我们证明 $L<U$，这样任意 $\theta\in[L,U)$ 都匹配路径上的所有标签。若某步标签 +1，之后沿路径的每个节点都比该节点大；标签 −1 则之后都更小。因此任何正标签节点都严格小于任何负标签节点，不论二者时间先后，故 $L<U$，证明完毕。

所以这个简单类统计可学习，却不在线可学习。更一般地，仿射线性分类器

\[
\mathcal F=\{x\mapsto\operatorname{sign}(\langle x,\theta\rangle+b):
\theta\in\mathbb R^d,\ b\in\mathbb R\}
\]

包含阈值类，因此 Littlestone 维无限，而 VC 维是有限的 $d+1$。在线学习确实严格更难。连线性分类器都无法学习，这个模型会不会太苛刻？对在线零一损失而言确实如此。但统计学习中虽然有限 VC 维可通过 ERM 学习，求 ERM 本身对线性分类器仍可能计算困难。因此实践中通常使用较好的替代损失，将问题转成类似回归的任务；在线回归也因此有更多可能。

## 4 在线回归

现在令 $\mathcal F\subseteq[-1,+1]^{\mathcal X}$。若一组取值在此区间的树 $V$ 满足以下要求，就称其为 $\mathcal F|_{\mathbf x}$ 的 $\ell_p$ 型 $\alpha$-覆盖：

\[
\forall f\in\mathcal F,\ \forall\epsilon\in\{-1,+1\}^n,\ \exists\mathbf v\in V,\quad
\left(\frac1n\sum_{t=1}^n|f(\mathbf x_t(\epsilon))-\mathbf v_t(\epsilon)|^p\right)^{1/p}\le\alpha.
\]

量词顺序和零覆盖一致，也对应统计设置的近似覆盖。最小大小是 $\mathcal N_p(\mathcal F|_{\mathbf x},\alpha)$。它随精度半径 $\alpha$ 增大而不增，并因归一化方式而随 $p$ 增大不减；$p=\infty$ 用路径上的最大误差。覆盖使无限类约化成有限类。

**定理 4。** 任意输入树满足

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\inf_{\alpha\ge0}\left\{\alpha+
\sqrt{\frac{2\ln\mathcal N_1(\mathcal F|_{\mathbf x},\alpha)}n}\right\}.
\]

**证明。** 固定 $\alpha$，取最小覆盖 $V$，并用 $\mathbf v^{f,\epsilon}$ 表示匹配该函数和路径的代表。加减代表，先用三角不等式分开，再用覆盖误差和定理 1：

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
&=\frac1n\mathbb E\sup_f\sum_t\epsilon_t
\{f(\mathbf x_t(\epsilon))-\mathbf v_t^{f,\epsilon}(\epsilon)+\mathbf v_t^{f,\epsilon}(\epsilon)\}\\
&\le\frac1n\mathbb E\sup_f\sum_t\epsilon_t
\{f(\mathbf x_t(\epsilon))-\mathbf v_t^{f,\epsilon}(\epsilon)\}
+\frac1n\mathbb E\sup_f\sum_t\epsilon_t\mathbf v_t^{f,\epsilon}(\epsilon)\\
&\le\alpha+\frac1n\mathbb E\sup_{\mathbf v\in V}\sum_t\epsilon_t\mathbf v_t(\epsilon)
\le\alpha+\sqrt{\frac{2\ln\mathcal N_1(\mathcal F|_{\mathbf x},\alpha)}n}.
\end{aligned}
\]

对半径取下确界。使用相似的 chaining 技术还可得到更紧的 Dudley 熵积分，课件省略证明。

**定理 5。**

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\inf_{0\le\alpha\le1}\left\{4\alpha+
\frac{12}{\sqrt n}\int_\alpha^1\sqrt{\ln\mathcal N_2(\mathcal F|_{\mathbf x},\delta)}\,d\delta\right\}.
\]

仍然有一个组合参数来控制覆盖数。若存在见证树 $\mathbf y$，其值在 $[-1,+1]$，且

\[
\forall\epsilon\in\{-1,+1\}^n,\ \exists f\in\mathcal F,\quad
\epsilon_t(f(\mathbf x_t(\epsilon))-\mathbf y_t(\epsilon))\ge\alpha/2
\quad(t=1,\ldots,n),
\]

则称输入树被 $\alpha$-打散。最大可打散深度称为**序列 fat-shattering 维数**，记为 $\operatorname{sfat}(\mathcal F,\alpha)$。以下联系定理的证明也省略。

**定理 6。** 对正 $\alpha$、深度 $n$ 的树和上述函数类，课件写为

\[
\ln\mathcal N_\infty(\mathcal F|_{\mathbf x},\alpha)
\le\operatorname{sfat}(\mathcal F,\alpha)\ln\left(\frac{2en}{\alpha}\right).
\]

> 译注：通常在有效尺度 $0<\alpha\le1$ 使用此式；$\alpha\ge1$ 时全零树已经覆盖，直接用覆盖数 1。不要对无限维数与负对数作形式运算。课件的 $\alpha/2$ 间隔约定必须与引用文献中的尺度换算一致。

### 例 1：线性函数

回顾 $\mathcal F=\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\}$、$\mathcal X=B_q^d$，其中 $p,q\ge1$、$1/p+1/q=1$。第 3 讲命题 2 给出大小至多 $(2/\alpha+1)^d$ 的逐点覆盖 $H$。把它投影到任意树上，就是序列覆盖，因此

\[
\mathcal N_\infty(\mathcal F|_{\mathbf x},\alpha)\le(2/\alpha+1)^d,\qquad
\mathcal R^{\mathrm{seq}}(\mathcal F)=O(\sqrt{d/n}).
\]

后一式来自前面计算过的 Dudley 积分。于是线性实值类在线可学习，复杂度的速率与统计设置相同。若经一般 Lipschitz 收缩转成博弈值，仍要携带该定理的附加因子；不能把复杂度速率与所有损失的遗憾速率无条件等同。

### 例 2：非递减函数

统计设置中，实数域上取值于 $[-1,+1]$ 的所有非递减函数，有课件记作 $(n+1)^{1/\alpha}$ 的覆盖数和 $O(1/\alpha)$ 的 fat 维数。在线情形却不能得到有助于可学习性的对应界，因为这个问题本身不可在线学习。取命题 1 的二分树，环境令

\[
(x_t,y_t)=(\mathbf x_t(-\epsilon),\epsilon_t),\qquad
\ell(f,(x,y))=(f(x)-y)^2.
\]

注意路径使用相反符号。当前标签等概率为正负，无论学习者如何预测，其每轮条件预期平方损失至少为

\[
\frac12\min_{\widehat y}\{(\widehat y-1)^2+(\widehat y+1)^2\}=1.
\]

另一方面，构造保证负标签点都在正标签点左边，因此总能找到一个经过全部样本的非递减函数，平方损失为 0，学习者就承受线性遗憾。课件另提到：若提前知道输入集合（但不知道顺序和标签），即 transductive 设置，这个问题又变得可学习；此处不展开。

> 译注：上面的 1 是**条件期望损失**下界，不是每次实现的损失下界。统计覆盖式沿用原文的尺度简写；区间长度、取整和半径约定会影响指数常数，但不影响本例的在线不可学习结论。

### 连接分类与回归

通常二分类类写成 $\mathcal H=\{\operatorname{sign}(f(\cdot)):f\in\mathcal F\}$：实值分数的符号表示类别，大小表示置信程度。选择分数函数或对应分类器，并没有改变零一损失问题；用课件的保守零分约定，损失为 $\mathbf1\{yf(x)\le0\}$。若 $\operatorname{Ldim}(\mathcal H)=\infty$，换一种表示并不会突然可学习。

但是可以改用一个上界零一损失、同时在线可学习的替代损失 $\ell'$。于是

\[
\sum_{t=1}^n\mathbf1\{y_tf_t(x_t)\le0\}
\le\sum_{t=1}^n\ell'(f_t,(x_t,y_t))
=\inf_{f\in\mathcal F}\sum_{t=1}^n\ell'(f,(x_t,y_t))
+\operatorname{Reg}_{\ell'}(\mathcal F,n).
\]

原文这里混用 $T,n$，此处统一为 $n$。若预期平均遗憾趋于 0，学习者平均错误率就被最佳函数的平均**替代损失**加消失项控制。这绕过了零一损失难以学习的问题，但比较基准已经变了；统计学习中也常这样处理计算困难。常见替代损失为

\[
\ell_{\mathrm{hinge}}(f,(x,y))=\max\{1-yf(x),0\},\qquad
\ell_{\mathrm{logistic}}(f,(x,y))=\log(1+e^{-yf(x)}).
\]

原文说二者对分数均为 1-Lipschitz，因此只要每个尺度的序列 fat 维数受到充分控制，就能在线学习并得到有意义的错误数界。

> 译注：自然对数的 logistic loss 在零分处为 $\ln2<1$，不直接上界此处的零一损失。正确关系是 $\mathbf1\{yf(x)\le0\}\le\ell_{\mathrm{logistic}}/\ln2$；归一化后 Lipschitz 常数为 $1/\ln2$。Hinge 的上界与 1-Lipschitz 结论都成立。固定二元 sign 的零点规则也可能与保守的零分损失不同。

### 本讲总结

对 $G$-Lipschitz 回归损失，课件汇总为

\[
\begin{aligned}
\mathcal V^{\mathrm{seq}}(\mathcal F,n)
&\le\sup_{\mathbf P}\mathbb E\sup_f\frac1n\sum_t
\{\mathbb E_{t-1}\ell(f,z_t)-\ell(f,z_t)\}\\
&\le2\mathcal R^{\mathrm{seq}}(\ell(\mathcal F))
\le O(G\ln^{3/2}n)\mathcal R^{\mathrm{seq}}(\mathcal F)\\
&\le O(G\ln^{3/2}n)\sup_{\mathbf x}\inf_{0\le\alpha\le1}
\left\{4\alpha+\frac{12}{\sqrt n}\int_\alpha^1
\sqrt{\ln\mathcal N_2(\mathcal F|_{\mathbf x},\delta)}\,d\delta\right\}\\
&\le O(G\ln^{3/2}n)\inf_{0\le\alpha\le1}
\left\{4\alpha+\frac{12}{\sqrt n}\int_\alpha^1
\sqrt{\operatorname{sfat}(\mathcal F,\delta)\ln(2en/\delta)}\,d\delta\right\}.
\end{aligned}
\]

课件指出，这串界在适当意义下也是紧的，序列 fat 维数是正确的复杂度量。至此，统计与在线的分类、回归可学习性讨论结束；下一讲开始课程的另一主线：在线算法设计。关于“正确的复杂度”所需的完整等价定理及条件，本讲没有证明，不能仅由这一个带对数的上界自动推出。

## 原课件脚注

**原注 1:** 序列 Rademacher 复杂度与打散定义中的 $\epsilon$ 同时表示路径和标签；零覆盖定义中的 $\epsilon$ 只表示路径。
