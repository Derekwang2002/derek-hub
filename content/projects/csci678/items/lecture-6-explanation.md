---
title: "Lecture 6 详细讲解报告"
summary: "逐步讲解有限类集中、零覆盖、Littlestone 维数、在线回归和序列 fat 维数，补全关键证明、算例、条件与误区，并提供自测和阅读路线。"
---

> 本讲回答“哪些类能在自适应数据上学习”。逐步展开有限类集中、零覆盖、序列 Sauer 引理、Littlestone 上下界、阈值与单调函数反例、回归覆盖和替代损失。原课件：lecture6.pdf（本地原课件，未在线发布）；配套：[完整翻译](/zh/projects/csci678/lecture-6-full-translation)；前置：[Lecture 5](/zh/projects/csci678/lecture-5-explanation)；后续：[Lecture 7](/zh/projects/csci678/lecture-7-explanation)。Dudley 与序列 fat 覆盖定理的深层证明在原文省略，本文说明应用过程与证明边界。

## 1 全讲路线与条件

第 5 讲已经把遗憾变成序列 Rademacher 复杂度。本讲二分类的核心链条是：有限专家界 → 路径零覆盖 → Littlestone 维数；回归则把“完全匹配”改为“给定尺度近似”，最后得到序列 fat 维数。

| 原页 | 内容 | 证明状态 |
|---|---|---|
| 1–2 | 引理 1、定理 1：有限类集中 | 下面完整展开 |
| 2–4 | 零覆盖、定理 2 与推论 1 | 完整展开，补归纳边界 |
| 4–5 | 定理 3、命题 1 | 完整展开，补有限维下界说明 |
| 6 | 定理 4、5、6 | 4 证明；5–6 是外部结果 |
| 7–8 | 线性、单调、替代损失与总结 | 展开计算、常数与限制 |

使用第 5 讲的可测性与博弈条件。二分类函数值为 ±1、损失为零一；回归函数值在 $[-1,1]$。$n$ 是轮数，$d$ 在分类部分指 Littlestone 维数，在线性例子指环境空间维数，两者不能混用。

## 2 最大值不等式不要求不同专家独立

设每个 $U_f$ 满足 $\mathbb E e^{\lambda U_f}\le e^{\lambda^2\sigma^2/2}$。它们之间可以高度相关。因为指数最大值不大于指数和、对数凹，

\[
\begin{aligned}
\mathbb E\max_fU_f
&=\frac1\lambda\mathbb E\ln e^{\lambda\max_fU_f}\\
&\le\frac1\lambda\ln\mathbb E\sum_fe^{\lambda U_f}\\
&\le\frac{\ln K}{\lambda}+\frac{\lambda\sigma^2}{2}.
\end{aligned}
\]

对 $\lambda>0$ 最优化，取 $\lambda=\sqrt{2\ln K}/\sigma$，即得 $\sigma\sqrt{2\ln K}$。若 $K=1$，这里应用的变量均值为零，结论为零。若只说“围绕自身均值次高斯”，还需加上最大均值；课件的引理使用零中心矩母函数约定。

## 3 定理 1：树上随机和为什么仍集中

固定一棵输入树和一个函数，记 $a_t=f(\mathbf x_t(\epsilon_{<t}))$，$S_t=\sum_{s\le t}\epsilon_sa_s$。给定过去，$a_t$ 已知，只有当前公平符号是新的，因此

\[
\mathbb E[e^{\lambda\epsilon_ta_t}\mid\epsilon_{<t}]
=\frac{e^{\lambda a_t}+e^{-\lambda a_t}}2
=\cosh(\lambda a_t)\le e^{\lambda^2a_t^2/2}.
\]

不能把各轮矩母函数直接相乘：未来 $a_s$ 会依赖当前符号。课件通过逐层取未来平方和的最大值解决。一个更简洁的补充证明是构造非负指数超鞅：

\[
M_t=\exp\left(\lambda S_t-\frac{\lambda^2}{2}\sum_{s=1}^ta_s^2\right),
\qquad \mathbb E[M_t\mid\epsilon_{<t}]\le M_{t-1}.
\]

从 $M_0=1$ 迭代，$\mathbb E M_n\le1$。令 $\sigma^2=\max_f\max_\epsilon\sum_ta_t^2$，这是确定的统一上界，因此

\[
\mathbb E e^{\lambda S_n}
=\mathbb E\left[M_n e^{\frac{\lambda^2}{2}\sum_ta_t^2}\right]
\le e^{\lambda^2\sigma^2/2}\mathbb E M_n
\le e^{\lambda^2\sigma^2/2}.
\]

应用上一节，再除以 $n$，得到课件定理 1。若函数值绝对值不超过 $C$，则 $\sigma^2\le nC^2$：

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\frac{\sqrt{2\sigma^2\ln|\mathcal F|}}n,\qquad
\mathcal R^{\mathrm{seq}}(\mathcal F)\le C\sqrt{\frac{2\ln|\mathcal F|}n}.
\]

**算例。** $K=100,n=10000,C=1$，上界约 0.03035。增加专家数只付对数代价；增加轮数则以平方根改善。它是最坏树上界，不保证每个具体样本的真实遗憾就等于这个数。

## 4 整树投影为什么会夸大复杂度

一棵深度 $n$ 树有 $2^n-1$ 个节点。整树投影为每个函数记住**所有分支**的输出。以单点指示类为例，若所有节点输入不同，投影有全负树及每个节点单独为正的树，共 $2^n$。但任意一次运行只访问 $n$ 个节点：沿该路径，单点类最多只出现一次 +1。

这表明我们不必为未访问分支同时维护同一个函数的完整响应。定义上只改两个量词，却带来指数级节省：

\[
\begin{array}{ll}
\text{Projection:}&\forall f\ \exists\mathbf v\ \forall\epsilon\ \forall t,
\quad f(\mathbf x_t(\epsilon))=\mathbf v_t(\epsilon),\\
\text{Zero-cover:}&\forall f\ \forall\epsilon\ \exists\mathbf v\ \forall t,
\quad f(\mathbf x_t(\epsilon))=\mathbf v_t(\epsilon).
\end{array}
\]

代表可依赖函数和整条路径，但选好的代表必须匹配路径上**所有轮次**。它不是每轮换代表；每棵代表树本身仍须可预测。集合 $V$ 在取随机路径之前固定。对每条实现路径逐点比较：

\[
\sup_f\sum_t\epsilon_tf(\mathbf x_t(\epsilon))
\le\max_{\mathbf v\in V}\sum_t\epsilon_t\mathbf v_t(\epsilon).
\]

取期望并用有限树族界即得零覆盖复杂度界。覆盖树可能不是原类成员，所以上式一般只能是小于等于。

## 5 单点类的覆盖：重复输入也能直接处理

课件先给无重复路径的 $n+1$ 棵覆盖。补充一个适用于重复输入的显式构造。专家 0 永远输出 −1。对每个 $k=1,\ldots,n$，专家 k 在前 $k-1$ 轮输出 −1，第 $k$ 轮记住当前输入 $a=x_k$，从这轮起仅在输入等于 a 时输出 +1。

对任意目标 $f_\theta$ 和路径，若没有遇到 $\theta$，专家 0 匹配；否则令 k 为首次遇到 $\theta$ 的轮次，专家 k 就匹配所有轮次，包括后面的重复。这构造仅用历史输入，是合法树。它还说明最坏 $n+1$ 可以达到：在每层一个互异输入的树上，一条固定路径有 $n+1$ 种不同标签序列，每棵覆盖树在这条路径只能匹配其中一种。

例如输入序列 a、b、a，目标 $\theta=a$，专家 1 输出 +1、−1、+1；无重复情形中“只在某一层输出 +1”的简单覆盖在这里会失败。

## 6 Littlestone 维数：树上的所有标签都可实现

\[
\forall\epsilon\in\{-1,+1\}^n,\ \exists f\in\mathcal F,\quad
f(\mathbf x_t(\epsilon_{<t}))=\epsilon_t\quad\forall t.
\]

这里 $\epsilon$ 既决定走哪条分支，也要求当前输出什么标签；零覆盖中它只决定路径。每条路径允许不同 $f$，同一路径却必须同一个 $f$。Littlestone 维是最大可打散深度。固定输入样本对应每层取同值的树，因此 VC 维不大于它。

单点类维数为 1 的完整理由：任何根输入都可标正（取该单点）或负（取别的单点）；但标正后唯一存活函数已确定，无论第二节点是什么，都不可能同时实现它的两个标签。非空类维数为零时任意输入上所有函数都相同，故只有一个不同函数。空类可另约定为 −1，方便算法处理。

## 7 序列 Sauer 引理：为什么是最大值而不是乘积

设当前类维数 $d$。按根标签分为 $\mathcal F_+,\mathcal F_-$，两者不能同时维数 $d$：若都能打散深度 $d$ 树，将两棵树接在这个根下会打散深度 $d+1$，矛盾。因此一边至多 $d-1$，另一边至多 $d$。

固定正标签子类，在原输入树的左子树上有 a 棵代表、右子树上有 b 棵代表。只要每个左代表和每个右代表至少被用一次，任一路径就总能找到匹配代表；所以重复较短列表后，只需 $\max(a,b)$ 次配对。路径一旦走左，右代表无关，反之亦然。要求同一代表同时匹配所有分支，才会需要笛卡尔积的 $ab$。

\[
g(d,n)\le g(d,n-1)+g(d-1,n-1),\quad
g(0,n)=1,\quad g(d,0)=1.
\]

取 $g(d,n)=\sum_{i=0}^{\min(d,n)}\binom ni$ 满足这些边界。Pascal 恒等式验证递推；$d\ge n$ 时和等于 $2^n$，补上课件归纳中容易漏掉的边界。于是定理 2 的第一条界成立。

二项式和的指数界也可直接算出。令 $x=d/n\in(0,1]$，当 $i\le d$ 时 $x^i\ge x^d$，因此

\[
x^d\sum_{i=0}^d\binom ni
\le\sum_{i=0}^d\binom ni x^i
\le(1+x)^n\le e^{nx}=e^d.
\]

除以 $x^d$ 得 $(en/d)^d$。例如 $d=2,n=10$，精确和为 56，指数界约 184.7；两者都是上界，后者为表达简洁牺牲常数。代回复杂度得到推论 1 的 $\sqrt{2d\ln(en/d)/n}$。

## 8 必要性：随机标签让任何算法付出代价

若任意深度都可被打散，选择深度 $n$ 的树，环境按 $(x_t,y_t)=(\mathbf x_t(\epsilon_{<t}),\epsilon_t)$ 行动。即使算法看到当前输入，标签仍是独立公平硬币，所以二元预测的条件错误概率恰为 $1/2$。累加得预期损失 $n/2$。打散保证**每条实现路径**都有同一个完美函数，因此基准损失为零，平均遗憾至少 $1/2$。这证明定理 3，结合有限维上界，有限 Littlestone 维是二分类在线可学习的充要条件。

有限维的下界也有直觉明确的构造。以下为补充推导，先取 $n=dm$。使用一棵被打散的深度 $d$ 树；每个节点重复 m 次，配独立公平标签。块结束后，以本块多数标签作为下一步的分支（平局固定处理）。打散保证存在函数同时预测各块的多数标签。设块内符号和为 $S_m$，则

\[
\text{learner expected block loss}=\frac m2,\qquad
\text{comparator block loss}=\frac{m-|S_m|}{2}.
\]

因此预期遗憾为 $d\,\mathbb E|S_m|/2$。Rademacher 和满足 $\mathbb E|S_m|\ge\sqrt{m/2}$，可由其二项分布的中央系数公式或 Khintchine 不等式证明，所以

\[
\frac{\mathbb E\operatorname{Reg}}n
\ge\frac{d}{2n}\sqrt{\frac m2}
=\sqrt{\frac d{8n}}\qquad(n=dm).
\]

课件把任意 $d\le n$ 的精确常数证明留给 HW2；这里没有把整除情形冒充完整证明。非整除时分成长度相差至多一的块，直接估计已能得到 $\sqrt{d/n}$ 同阶下界，例如 $\sqrt{d/n}/4$。这足以理解上下界差的是对数而不是维数或轮数的幂。

## 9 阈值类：VC 维为一仍可在线不可学习

取 $f_\theta(x)=+1$ 当且仅当 $x\le\theta$。固定两个点不能实现任意标签，故 VC 维为 1。但在线对手可以不断二分尚可能的阈值区间：

```text
                       1/2
            label −1 /     \ label +1
                   1/4     3/4
                 /    \   /    \
               1/8   3/8 5/8   7/8
```

若当前标签是 +1，要求阈值至少为当前输入，于是下一步探右半区；−1 则探左半区。每一步都留下非空区间，没有有限轮数能穷尽实数阈值。

严格证明课件所用的大小关系：第 $t$ 轮走右后首次增加 $2^{-(t+1)}$，以后全部向左移动的总幅度严格小于这个量（有限几何级数）。所以后续每个节点仍大于第 $t$ 个；走左同理。任意正节点都小于任意负节点，取

\[
\theta\in\left[\max_{t:\epsilon_t=+1}x_t,\ \min_{t:\epsilon_t=-1}x_t\right),
\]

空端点用 0、1，就实现全部标签。例如路径 +1、−1、+1 访问 $1/2,3/4,5/8$，阈值可选 $[5/8,3/4)$。这证明任意有限深度都可打散，而非声称每条**无限路径**都由一个有限间隔阈值实现。

## 10 回归覆盖：误差半径必须先归一化

\[
d_{p,\epsilon}(f,\mathbf v)=
\left(\frac1n\sum_t|f(\mathbf x_t(\epsilon))-\mathbf v_t(\epsilon)|^p\right)^{1/p}.
\]

这里除以 $n$，所以二范数半径 $\alpha$ 对应未归一化欧氏误差 $\alpha\sqrt n$。覆盖量词仍是“每个函数、每条路径有一个代表”。归一化幂平均满足 $d_1\le d_2\le d_\infty$，故同样半径下覆盖数顺序也相同。半径增大则要求变弱，覆盖数不增。

定理 4 的推导是加减代表。固定函数和路径后，误差项逐点满足

\[
\frac1n\sum_t\epsilon_t(f(\mathbf x_t)-\mathbf v_t^{f,\epsilon})
\le\frac1n\sum_t|f(\mathbf x_t)-\mathbf v_t^{f,\epsilon}|
\le\alpha.
\]

剩下的代表项取有限集合最大值，再应用定理 1；这一步允许代表依赖整个路径，因为外面已经取了所有代表的最大值。

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\inf_{\alpha\ge0}\left\{\alpha+
\sqrt{\frac{2\ln\mathcal N_1(\mathcal F|_{\mathbf x},\alpha)}n}\right\}.
\]

这个界只在单一尺度压缩。Dudley 则逐层使用粗到细的覆盖，让小尺度细节只付小幅度的代价。课件定理 5 是

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\inf_{0\le\alpha\le1}
\left\{4\alpha+\frac{12}{\sqrt n}\int_\alpha^1
\sqrt{\ln\mathcal N_2(\mathcal F|_{\mathbf x},\delta)}\,d\delta\right\}.
\]

为何有截断 $4\alpha$？过细尺度可能有无限覆盖数，先不解析这些细节，直接用近似误差控制。为何是根号对数？每一层的有限候选仍用最大值不等式。完整序列 chaining 必须处理依路径选择代表后的可预测性和局部误差，不能直接把每个路径代表当成固定随机过程。本文不把以上直觉当作完整证明，定理 5 按原文作为已引用结果使用。

## 11 序列 fat 维数：见证也必须是树

\[
\exists\mathbf y,\ \forall\epsilon,\ \exists f\in\mathcal F,\quad
\epsilon_t(f(\mathbf x_t(\epsilon_{<t}))-\mathbf y_t(\epsilon_{<t}))\ge\alpha/2
\quad\forall t.
\]

见证阈值依赖过去，但不能依赖当前标签；否则总能事后移动门槛，定义失去意义。维数是允许这种固定正间隔分支的最大深度，随尺度增大不增。固定点上的 fat 是同层固定节点与固定见证的特殊情况，所以通常更小。

\[
\ln\mathcal N_\infty(\mathcal F|_{\mathbf x},\alpha)
\le\operatorname{sfat}(\mathcal F,\alpha)\ln(2en/\alpha),\qquad0<\alpha\le1.
\]

这是课件定理 6，证明省略。它将实值类先离散化再用尺度敏感的序列组合计数，不能由二分类 Sauer 引理不加论证直接代入得到。结合覆盖数的范数顺序及 Dudley，就得到第 8 页的总链条。取树上确界时，使用对所有树统一的 fat 界，并用 $\sup\inf\le\inf\sup$；不是无条件交换二者。

关于一般可学习性刻画及这些外部结果，可查 [Rakhlin、Sridharan、Tewari (2015)](https://jmlr.org/papers/v16/rakhlin15a.html)。完整条件取决于损失和决策协议；仅从一个含对数因子的上界，不能不检查尺度增长就断言所有有限 fat 类都获得相同速率。

## 12 线性例子：把覆盖真的代入积分

对偶单位球上的线性函数由 Hölder 保证输出在 $[-1,1]$。若参数的 $p$-范数距离不超过 $\alpha$，对所有允许输入的预测误差就不超过 $\alpha$。体积覆盖因此给出 $(1+2/\alpha)^d$ 的逐点覆盖，直接投影到任何树都有效。于是

\[
\mathcal R^{\mathrm{seq}}(\mathcal F)
\le\frac{12\sqrt d}{\sqrt n}\int_0^1\sqrt{\ln(1+2/\delta)}\,d\delta.
\]

在 $0<\delta\le1$，$1+2/\delta\le3/\delta$。利用平方根次可加性并令 $u=\ln(1/\delta)$：

\[
\begin{aligned}
\int_0^1\sqrt{\ln(1+2/\delta)}\,d\delta
&\le\sqrt{\ln3}+\int_0^1\sqrt{\ln(1/\delta)}\,d\delta\\
&=\sqrt{\ln3}+\int_0^\infty\sqrt u\,e^{-u}\,du
=\sqrt{\ln3}+\frac{\sqrt\pi}{2}.
\end{aligned}
\]

积分是常数，得 $O(\sqrt{d/n})$。这是复杂度界；一般损失经收缩可能多出对数。作为补充，对欧氏单位球可以直接得到更强的无维度界：

\[
\begin{aligned}
\mathcal R^{\mathrm{seq}}(\mathcal F)
&=\frac1n\sup_{\mathbf x}\mathbb E\left\|\sum_t\epsilon_t\mathbf x_t(\epsilon)\right\|_2\\
&\le\frac1n\sup_{\mathbf x}\sqrt{\mathbb E\left\|\sum_t\epsilon_t\mathbf x_t(\epsilon)\right\|_2^2}
\le\frac1{\sqrt n}.
\end{aligned}
\]

最后一步中交叉项为零：对 $s<t$ 先条件于 $\epsilon_{<t}$，两个向量和 $\epsilon_s$ 已知，$\epsilon_t$ 均值为零；平方和最多 $n$。这个结论为 Lecture 7 的无维度感知机界提供了呼应。

## 13 单调回归反例为什么要反转路径

阈值树配“正标签向右”实现的是正点在左、负点在右，即非递增分类。为了得到**非递减**回归函数，要让负点在左、正点在右，所以环境沿 $-\epsilon$ 走，但标签仍给 $\epsilon_t$。因此

\[
(x_t,y_t)=(\mathbf x_t(-\epsilon_{<t}),\epsilon_t),\qquad
\mathbb E[(a_t-y_t)^2\mid\text{past},a_t]=a_t^2+1\ge1.
\]

任何算法预期累计平方损失至少 $n$。每条实现路径上取一个从 −1 跳到 +1 的阶梯函数，就能零损失拟合全部点，因此遗憾线性。这个阶梯子类也能以见证 0 在任何尺度 $0<\alpha\le2$ 打散任意深度，故序列 fat 无限；与统计 fat 的 $O(1/\alpha)$ 完全不同。

知道整个输入集合的 transductive 设置改变了信息结构，课件称该问题可学习。本讲不证明该结果，也不把“知道集合”误写成“知道顺序或标签”。

## 14 替代损失：必须更换比较基准

\[
\mathbf1\{ys\le0\}\le\max(1-ys,0),\qquad
\mathbf1\{ys\le0\}\le\frac{\ln(1+e^{-ys})}{\ln2}.
\]

若 $ys\le0$，hinge 至少 1，自然对数 logistic 至少 $\ln2$；若 $ys>0$，左侧为零。因此这些是逐点成立的上界。对 logistic，未经归一化就说它上界零一损失是错误的。取 $s=0$ 即得反例 $1>\ln2$。

\[
\sum_t\mathbf1\{y_tf_t(x_t)\le0\}
\le\inf_f\sum_t\ell'(f,(x_t,y_t))+\operatorname{Reg}_{\ell'}(\mathcal F,n).
\]

遗憾小只保证接近最佳**替代损失**，并不保证接近最佳零一错误数，所以不与阈值不可学习矛盾。如果最佳分数函数有好间隔，hinge 基准小，这条界才有用。对自然对数 logistic，归一化后的 Lipschitz 常数是 $1/\ln2$，不是 1。零分计作错误的约定也须与 sign 的打平规则区分。

## 15 自测与复习路线

1. 零覆盖为什么允许代表依赖完整路径，却不泄露未来？代表集合事先固定；复杂度分析事后取最大，不是在线算法当轮偷看。
2. 单点类路径 a、b、a，目标是 a，需要什么代表？首次正点在第 1 轮的专家，输出 +、−、+。
3. 为什么序列 Sauer 合并同标签子覆盖用最大值？一次路径只走一个子树。
4. $d=0$ 时如何解释公式？非空类只有一个函数，覆盖数 1、复杂度 0；不要直接计算 $0\ln(en/0)$。
5. 阈值树第三层路径 +、−、+ 的合法阈值区间？$[5/8,3/4)$。
6. logistic 不等式缺什么？自然对数版本缺 $1/\ln2$ 因子。
7. 线性回归可学习为何不意味着线性零一分类可学习？损失和基准发生了变化。

第一遍读第 4–9 节，先把树和量词弄清。第二遍重推第 2–3、7 节，检查集中与递推。第三遍读第 10–14 节，并手算积分与 logistic 零分值。最后进入 Lecture 7：可实现时维数如何变成错误预算，一般情形如何用 Hedge 聚合。
