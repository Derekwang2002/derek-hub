---
title: "Lecture 3 预习报告：覆盖数、Dudley 熵积分与伪维数"
summary: "无限实值函数类的复杂度控制：从逐点覆盖到样本投影覆盖，再到 Dudley chaining 的三次精化，以及伪维数对可学习性的刻画。"
---

**主题：无限实值函数类、覆盖数、Dudley 熵积分与伪维数**
**课程：Theoretical Machine Learning**
**课件：Lecture 3，Fall 2026，Haipeng Luo**

## 一、这节课要解决什么问题

上一讲对有限函数类和二分类函数类的可学习性进行了刻画。本讲转向回归：

\[
\mathcal Y=[-1,1],\qquad \mathcal F\subseteq[-1,1]^{\mathcal X}.
\]

核心目标仍然是控制 Rademacher complexity，因为经验风险最小化（ERM）的泛化误差可以通过下列链条控制：

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le 2\sup_P\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))
\le 2G\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F),
\]

其中 $G$ 是损失函数的 Lipschitz 常数；二分类时可取 $G=1/2$。

有限类可以直接使用 Massart 引理：若函数值落在 $[-C,C]$，则

\[
\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
\le C\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\]

但回归中的 $\mathcal F$ 往往是无限类，其样本投影

\[
\mathcal F|_{x_{1:n}}
=\{(f(x_1),\ldots,f(x_n)):f\in\mathcal F\}
\subseteq[-1,1]^n
\]

通常仍然是无限集合，不能直接把 $|\mathcal F|$ 塞进有限类上界。本讲的统一策略是：**先把无限集合近似为有限集合，再对有限代表集应用 Massart 引理。**

---

## 二、第一层方法：覆盖整个函数类

### 2.1 逐点覆盖与覆盖数

有限类 $\mathcal H\subseteq[-1,1]^{\mathcal X}$ 是 $\mathcal F$ 的逐点 $\alpha$-cover，如果对每个 $f\in\mathcal F$，都存在 $h\in\mathcal H$，使得

\[
|f(x)-h(x)|\le \alpha,\qquad \forall x\in\mathcal X.
\]

最小代表集的大小称为逐点覆盖数：

\[
\mathcal N(\mathcal F,\alpha)
=\min\{|\mathcal H|:\mathcal H\text{ 是逐点 }\alpha\text{-cover}\}.
\]

$\alpha$ 越大，近似要求越宽松，所以 $\mathcal N(\mathcal F,\alpha)$ 关于 $\alpha$ 单调不增。

### 2.2 定理 1：单尺度覆盖上界

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\min_{\alpha\ge 0}
\left(
\alpha+\sqrt{\frac{2\ln\mathcal N(\mathcal F,\alpha)}{n}}
\right).
\]

这个式子体现了一个基本权衡：

- $\alpha$ 小：近似误差小，但需要更多代表函数，覆盖数变大；
- $\alpha$ 大：代表集较小，但离散化误差变大。

证明的骨架是把每个函数写成"近似误差 + 代表函数"：

\[
f=(f-h_f)+h_f.
\]

第一项利用逐点误差界得到 $\alpha$，第二项是有限类 $\mathcal H$ 的 Rademacher complexity，再用 Massart 引理控制。

### 2.3 线性函数例子

考虑

\[
\mathcal X=B_q^d,\qquad
\mathcal F=\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\qquad \frac1p+\frac1q=1.
\]

由 Hölder 不等式，$|f_\theta(x)|\le1$。

当 $p=\infty,q=1$ 时，参数空间是边长为 2 的超立方体。把每一维均匀离散化，可得

\[
\mathcal N(\mathcal F,\alpha)\le \left(\frac1\alpha\right)^d,
\]

并在 $n\ge d$ 时得到

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\!\left(\sqrt{\frac{d\ln(n/d)}{n}}\right).
\]

对一般 $p$，课件给出更漂亮的体积法。取参数球 $B_p^d$ 中的最大 $\alpha$-packing：两两距离大于 $\alpha$。最大性保证 packing 的中心同时构成一个 $\alpha$-cover；以每个中心为圆心放置半径 $\alpha/2$ 的小球，这些小球互不相交，且都落在 $(1+\alpha/2)B_p^d$ 内。比较体积得到

\[
\mathcal N(\mathcal F,\alpha)
\le \left(\frac2\alpha+1\right)^d.
\]

因此同样有

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\!\left(\sqrt{\frac{d\ln(n/d)}{n}}\right).
\]

这里应掌握的通用技巧是：**最大 packing 自动给出 cover，随后用体积比控制 packing 的大小。**

### 2.4 逐点覆盖为什么可能太强

令 $\mathcal F$ 为所有从 $\mathbb R$ 到 $[-1,1]$ 的单调不减函数。对任意 $\alpha<1$，有

\[
\mathcal N(\mathcal F,\alpha)=\infty.
\]

证明只需考虑无穷子类

\[
f_m(x)=\operatorname{sign}(x-m),\qquad m\in\mathbb Z.
\]

不同阶跃位置的两个函数在某个点相差 2，因此同一个代表函数不可能同时在误差小于 1 的条件下覆盖它们。

但这个类实际上可以学习。因此"在整个输入空间的每一点都近似"要求过强；逐点覆盖数不是足够紧的复杂度刻画。

---

## 三、第二层方法：只覆盖样本投影

### 3.1 样本相关的 $\ell_p$ 覆盖数

固定输入 $x_{1:n}$。集合 $V\subseteq[-1,1]^n$ 是投影 $\mathcal F|_{x_{1:n}}$ 的 $\ell_p$ 意义下的 $\alpha$-cover，如果对每个投影向量 $f$，存在 $v\in V$，使得

\[
\|f-v\|_p\le n^{1/p}\alpha,
\]

等价地，

\[
\left(\frac1n\sum_{t=1}^n|f_t-v_t|^p\right)^{1/p}\le\alpha.
\]

对应的最小大小记为 $\mathcal N_p(\mathcal F|_{x_{1:n}},\alpha)$。在这种归一化下，

\[
\mathcal N_1\le\mathcal N_2\le\cdots\le\mathcal N_\infty.
\]

投影覆盖永远不会比逐点覆盖更差，因为一个逐点 cover 限制到样本上，自然就是一个 $\ell_\infty$ cover：

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le \mathcal N(\mathcal F,\alpha).
\]

### 3.2 定理 2：投影覆盖上界

条件 Rademacher complexity 满足

\[
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
\le
\min_{\alpha\ge0}
\left(
\alpha+
\sqrt{\frac{2\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)}{n}}
\right).
\]

证明仍然是"原向量 = 残差 + 有限代表"的分解。这里使用 $\ell_1$ cover，是因为

\[
\langle\epsilon,f-v_f\rangle
\le \|f-v_f\|_1
\]

可以直接把近似项控制为 $n\alpha$。

### 3.3 单调函数类重新变得有限

把样本排序为 $x_1\le\cdots\le x_n$。将输出区间 $[-1,1]$ 以尺度 $2\alpha$ 离散成集合 $S$，其中 $|S|\le1/\alpha$。所有取值来自 $S$ 的非降序列构成一个投影的 $\ell_\infty$ cover。

这样的序列由每个离散值出现的次数决定。粗略计数得

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le(n+1)^{1/\alpha}.
\]

代入定理 2：

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\min_{0\le\alpha\le1}
\left(
\alpha+\sqrt{\frac{2\ln(n+1)}{\alpha n}}
\right)
=O\!\left(\left(\frac{\ln n}{n}\right)^{1/3}\right).
\]

结论非常重要：**函数类在整个定义域上无法有限覆盖，不代表它在有限样本上的行为无法有限覆盖。** 对泛化分析而言，后者才是对称化之后真正需要控制的对象。

另外，cover 只出现在分析中；算法本身仍然可以只是 ERM。等序回归中的 ERM 甚至可以高效求解。

---

## 四、第三层方法：Dudley 熵积分

### 4.1 为什么还要升级

定理 2 只选择一个尺度 $\alpha$。对单调函数类，它给出的约 $n^{-1/3}$ 速度比常见的 $n^{-1/2}$ 慢。问题不在于这个函数类真的更难学，而在于单尺度分析丢失了信息。

Dudley 熵积分同时利用从粗到细的所有覆盖尺度：

\[
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
\le
\min_{0\le\alpha\le1}
\left(
4\alpha+
\frac{12}{\sqrt n}
\int_\alpha^1
\sqrt{\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)}\,d\delta
\right).
\]

$\ln\mathcal N_2$ 常被称为 metric entropy，因此这个上界叫 entropy integral。

### 4.2 两个例子的改进

对 $d$ 维线性函数类，使用

\[
\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
\le \left(\frac3\delta\right)^d
\]

并取 $\alpha=0$，可得

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\!\left(\sqrt{\frac dn}\right).
\]

这去掉了单尺度覆盖上界中的额外 $\ln n$ 因子。

对单调函数类，使用

\[
\mathcal N_2\le\mathcal N_\infty\le(n+1)^{1/\delta},
\]

得到

\[
\int_\alpha^1
\sqrt{\ln\mathcal N_2(\delta)}\,d\delta
\le
\sqrt{\ln(n+1)}\int_\alpha^1\delta^{-1/2}d\delta
\le2\sqrt{\ln(n+1)}.
\]

所以

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\!\left(\sqrt{\frac{\ln n}{n}}\right).
\]

这把单尺度方法的约 $n^{-1/3}$ 改进到了约 $n^{-1/2}$。

### 4.3 chaining 的证明直觉

取几何递减尺度

\[
\alpha_j=2^{-j},\qquad j=1,\ldots,M,
\]

并在每个尺度选择一个 $\ell_2$ cover $V_j$。对每个投影向量 $f$，选出逐层代表

\[
v_f^0,v_f^1,\ldots,v_f^M.
\]

然后望远镜式分解：

\[
f=(f-v_f^M)+\sum_{j=1}^M(v_f^j-v_f^{j-1}).
\]

其中：

- 最细尺度的尾项 $f-v_f^M$ 贡献至多 $\alpha_M$；
- 每一层增量的候选集合是有限的，可用 Massart 引理；
- 同一函数在相邻尺度的两个代表都接近它，因此

\[
\|v_f^j-v_f^{j-1}\|_2
\le3\sqrt n\,\alpha_j.
\]

把各层贡献相加得到关于尺度的离散和，再利用覆盖数关于尺度单调不增，将离散和上界为积分。

之所以使用 $\ell_2$ cover，是因为 Massart 型最大不等式中的"半径"由向量的 $\ell_2$ 范数控制。

一句话理解 chaining：**不把函数一次性近似到最终精度，而是把它表示成一连串越来越精细、且每一步都很小的修正。**

---

## 五、三种上界的总比较

| 方法 | 使用的信息 | 线性函数类 | 单调不减函数类 |
|---|---|---:|---:|
| 逐点函数覆盖 | 整个定义域上的统一近似 | $O(\sqrt{d\ln(n/d)/n})$ | $\infty$ |
| 样本投影的单尺度覆盖 | 固定样本上的一种精度 | $O(\sqrt{d\ln(n/d)/n})$ | $O((\ln n/n)^{1/3})$ |
| Dudley 熵积分 | 固定样本上的所有精度 | $O(\sqrt{d/n})$ | $O(\sqrt{\ln n/n})$ |

这张表应当作为本讲的核心记忆框架：

1. 从"覆盖函数"转向"覆盖投影"，消除了不必要的全局要求；
2. 从"单尺度"转向"多尺度"，进一步消除了松弛；
3. 分析工具越来越精细，但学习算法始终可以是 ERM。

---

## 六、伪维数：把实值函数二值化

覆盖数在回归中的角色类似分类问题中的 growth function。分类中可用 VC dimension 控制 growth function；相应地，实值函数类的一个经典组合参数是 pseudo-dimension。

对每个 $f:\mathcal X\to[-1,1]$，考虑 $\mathcal X\times[-1,1]$ 上的二分类器

\[
h_f(x,y)=\operatorname{sign}(f(x)-y).
\]

定义

\[
\operatorname{Pdim}(\mathcal F)
=\operatorname{VCdim}\left(
\{h_f(x,y)=\operatorname{sign}(f(x)-y):f\in\mathcal F\}
\right).
\]

等价地，$\operatorname{Pdim}(\mathcal F)$ 是最大整数 $n$，使得存在阈值点对 $(x_t,y_t)$，对任意符号模式 $s_t\in\{-1,+1\}$，都能找到 $f\in\mathcal F$ 满足

\[
\operatorname{sign}(f(x_t)-y_t)=s_t,
\qquad t=1,\ldots,n.
\]

两个例子：

- 对 $d$ 维线性函数类，$\operatorname{Pdim}(\mathcal F)=d$；
- 所有单调不减函数构成的类，其伪维数为无穷。

有限伪维数足以保证可学习。课件指出，忽略部分对数因子，可以用类似 Sauer 引理的结果得到

\[
\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)
\approx \operatorname{Pdim}(\mathcal F)\ln\frac1\alpha,
\]

进而推出

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\!\left(
\sqrt{\frac{\operatorname{Pdim}(\mathcal F)\ln n}{n}}
\right).
\]

但有限伪维数并非可学习的必要条件：单调函数类已经被证明可学习，却具有无限伪维数。因此伪维数仍不是最终正确的"当且仅当"复杂度刻画。这正是下一讲留下的问题。

---

## 七、容易混淆的地方

1. **cover 与 packing 不同。** cover 要求所有点都靠近某个中心；packing 要求中心两两分离。证明中利用"最大 packing 是 cover"。
2. **逐点覆盖与投影覆盖不同。** 前者要求对所有 $x\in\mathcal X$ 同时逼近；后者只要求在当前样本点上逼近。
3. **$\mathcal N_1\le\mathcal N_2\le\mathcal N_\infty$ 不要写反。** 这是由课件采用的归一化经验 $\ell_p$ 范数决定的。
4. **覆盖数只参与证明，不一定参与算法。** 不要误以为 ERM 要先显式构造 cover。
5. **Dudley 不是换了一个函数类，而是换了分析尺度。** 它把一次近似改造成多层增量。
6. **"参数维数有限"与"伪维数有限"不是所有非参数问题的必要条件。** 单调函数类就是反例。
7. **对数覆盖数才是 metric entropy。** Dudley 积分中出现的是 $\sqrt{\ln\mathcal N_2}$，不是覆盖数本身。

---

## 八、建议带着这些问题去上课

1. 对称化究竟在哪一步允许我们从整个 $\mathcal F$ 转向 $\mathcal F|_{x_{1:n}}$？
2. 定理 1 和定理 2 的证明中，近似误差分别通过什么范数被控制？
3. 最大 $\alpha$-packing 为什么一定是 $\alpha$-cover？
4. 单调序列 cover 的大小为什么可以通过"每个离散值出现多少次"来计数？
5. 单尺度优化为何对单调类产生 $(\ln n/n)^{1/3}$，而积分方法能得到 $\sqrt{\ln n/n}$？
6. chaining 中为什么要连接相邻层代表，而不是直接把所有精细代表和零向量比较？
7. 伪维数为什么对线性函数类恰好等于 $d$，但对单调函数类却是无穷？
8. 如果伪维数不是必要条件，下一讲会引入什么更合适的尺度相关组合参数？

---

## 九、课前 30 分钟预习顺序

**前 5 分钟：** 复习 Rademacher complexity、Massart 引理、对称化，以及 Lecture 2 中 VC dimension 控制增长函数的逻辑。
**第 5-12 分钟：** 掌握逐点 $\alpha$-cover 的定义和定理 1 的"残差 + 代表"证明。
**第 12-18 分钟：** 对比线性类和单调函数类，理解逐点覆盖为什么会失败。
**第 18-23 分钟：** 学会投影覆盖的定义，重点记住 $\ell_p$ 的归一化和定理 2。
**第 23-28 分钟：** 阅读 Dudley 上界及 chaining 的望远镜分解，只需先抓住多尺度直觉。
**最后 2 分钟：** 记住比较表，并复述"伪维数有限是充分而非必要条件"。

## 十、一句话总结

本讲的中心不是背三个公式，而是理解复杂度分析的三次精化：**把无限类离散化；只离散化样本上真正可见的部分；再用 chaining 同时利用所有离散精度。**
