---
title: "Lecture 7 课件完整翻译"
summary: "完整翻译 Lecture 7 的全部章节、定理、证明及原编号：Halving、Hedge、部分覆盖专家、margin 与 Perceptron；译注单独说明笔误和适用范围。"
---

**2026 年秋季，Haipeng Luo。**

> 对照八页课件，保留全部章节、公式 (1)–(4)、引理 1–2、定理 1–4、算法 1–4、假设 1 和原参考文献。原课件：lecture7.pdf（本地原课件，未在线发布）。配套：[详细讲解](/zh/projects/csci678/lecture-7-explanation)。译注说明笔误、端点和适用条件；原件没有图表或脚注。

## 1 有限类的在线算法

现在转向在线学习算法设计。此前统计学习中讨论的可学习问题都能由 ERM 学习；在线部分则只刻画了可学习性，尚未告诉我们怎样学习。先回顾协议：

每轮 $t=1,\ldots,n$：

1. 学习者可能随机地选择 $\widehat y_t\in\mathcal D$。
2. 环境同时选择 $z_t\in\mathcal Z$。
3. 学习者承受 $\ell(\widehat y_t,z_t)$，然后观察 $z_t$。

proper 学习者的决策空间就是参照类，improper 学习者可以从更大的集合选择，因此更强。Oblivious 环境的结果不依赖学习者决策，可看作开始前就已选定；adaptive 环境可依赖过去决策。先处理有限 $\mathcal F$，不失一般性将有界损失缩放到 $[0,1]$。前面的理论保证存在算法达到

\[
\mathbb E[\operatorname{Reg}(\mathcal F,n)]
=\mathbb E\left[\sum_{t=1}^n\ell(\widehat y_t,z_t)
-\inf_{f\in\mathcal F}\sum_{t=1}^n\ell(f,z_t)\right]
\le O(\sqrt{n\ln|\mathcal F|}).\tag{1}
\]

本节首先要找出具体达到此界的算法。

## 1.1 热身：可实现二分类

先考虑零一损失二分类，并假设类里总有一个完美分类器：

\[
\inf_{f\in\mathcal F}\sum_{t=1}^n\mathbf1\{f(x_t)\ne y_t\}=0.
\]

这既可看作类的表达能力假设，也可看作对环境的限制。一种显然的方法是始终选一个至今没错过的分类器。每错一次至少排除一个，而完美分类器一直保留，所以至多错 $|\mathcal F|-1$ 次。这不依赖轮数，但对类大小的依赖比对数差很多。问题在于一次错误可能只排除一个候选；能不能像二分搜索一样，一次排除一大批？

答案是对存活分类器作多数投票，称为 **Halving**：

\[
\mathcal F'=\left\{f\in\mathcal F:\sum_{\tau=1}^{t-1}\mathbf1\{f(x_\tau)\ne y_\tau\}=0\right\},
\qquad
\widehat y_t(x)=\operatorname{sign}\left(\sum_{f\in\mathcal F'}f(x)\right).
\]

这是 improper 算法，因为多数投票函数未必属于原类。也可等价地改写协议：环境先揭示 $x_t$，学习者看到后输出一个二元标签，最后环境揭示 $y_t$。当决策被限制在原类时，先看输入更有利；当允许全部二元函数时，指定每个输入的响应就是指定一个 improper 决策，不会增加额外能力。对 Halving，这个响应就是当前存活类在该点的多数标签。

每次错误至少排除一半候选，因此至多错 $O(\log_2|\mathcal F|)$ 次，遗憾也一样。这比朴素策略好一个指数级，且仍不依赖 $n$。能优于 (1)，关键在可实现假设。多数票打平时固定一个二元预测即可，分析不变。

## 1.2 一般算法

怎样去掉可实现假设？前两个算法都是确定性的。但在一般情形，确定性算法连最简单的两专家问题都无法获得次线性遗憾。假设只有一个输入，类含常数 +1 与 −1。因为算法确定，环境每轮提前知道其预测，选相反标签即可让学习者每轮都错；两个常数专家中至少一个总损失不超过 $n/2$，故遗憾至少 $n/2$。第 5 讲的 follow-the-leader 若使用确定的打平规则，也就可能线性遗憾。

我们需要随机算法，也不应因一次错误就丢弃专家。自然做法是根据历史表现抽样：累积损失越小，概率越大。它导出适用于一般有界损失的经典算法：

\[
\text{Hedge:}\qquad
\Pr[\widehat y_t=f]\propto
\exp\left(-\eta\sum_{\tau=1}^{t-1}\ell(f,z_\tau)\right),\quad f\in\mathcal F.\tag{2}
\]

$\eta>0$ 是学习率或步长。这个基本算法在不同领域被反复发现，也称 multiplicative weights update、exponential weights 等，后续会介绍应用。它是 proper 算法，因为每次抽到的仍是原类成员；也可看作 FTL 的软版本：当 $\eta\to\infty$，概率集中到当前累积损失最小者。损失到指数分布的映射就是 softmax。若领先者有多个，极限分布仍可能随机打平。

Hedge 达到 (1)，给出有限类可学习性的算法证明。先给一个以后也会用到的引理。

**引理 1。** 对任意损失向量 $\ell_t\in\mathbb R^K$，若 $\eta>0$ 且每个坐标满足 $\eta\ell_t(i)\ge-1$，定义

\[
p_t(i)=\frac{\exp(-\eta\sum_{\tau<t}\ell_\tau(i))}
{\sum_{j=1}^K\exp(-\eta\sum_{\tau<t}\ell_\tau(j))}.
\]

则对所有 $i^\star\in[K]$，

\[
\sum_{t=1}^n\langle p_t,\ell_t\rangle-\sum_{t=1}^n\ell_t(i^\star)
\le\frac{\ln K}{\eta}+\eta\sum_{t=1}^n\sum_{i=1}^Kp_t(i)\ell_t^2(i).
\]

**定理 1。** 对 oblivious 或 adaptive 环境，Hedge 取学习率 $\eta=\sqrt{\ln|\mathcal F|/n}$ 可保证 (1)。原文分母写 $T$，这里统一为轮数 $n$；单专家时直接跟随它，遗憾为零。

**证明。** 令 $K=|\mathcal F|$，将专家编号为 $1,\ldots,K$，设 $\ell_t(i)=\ell(i,z_t)$，算法恰从引理的 $p_t$ 抽样。因此

\[
\begin{aligned}
\mathbb E\sum_t\ell(\widehat y_t,z_t)&=\mathbb E\sum_t\langle p_t,\ell_t\rangle,\\
\mathbb E\inf_f\sum_t\ell(f,z_t)&=\mathbb E\min_{i^\star\in[K]}\sum_t\ell_t(i^\star).
\end{aligned}
\]

对引理取期望，利用损失在 $[0,1]$ 得到上界 $\ln K/\eta+\eta n$，代入最小化此界的学习率即可。环境可以依赖过去，但不能看到当轮私有随机抽样后再选损失；这是上述第一条期望等式所需的信息顺序。

下面给出引理 1 的势函数证明。算法和势函数为什么自然，将在以后进一步解释。

**引理 1 的证明。** 定义累积损失与势函数

\[
L_t=\sum_{\tau=1}^t\ell_\tau,\qquad
\Phi_t=\frac1\eta\ln\left(\sum_{i=1}^K e^{-\eta L_t(i)}\right).
\]

比较相邻两轮，

\[
\begin{aligned}
\Phi_t-\Phi_{t-1}
&=\frac1\eta\ln\frac{\sum_i e^{-\eta L_t(i)}}{\sum_i e^{-\eta L_{t-1}(i)}}
=\frac1\eta\ln\left(\sum_i p_t(i)e^{-\eta\ell_t(i)}\right)\\
&\le\frac1\eta\ln\left(\sum_i p_t(i)(1-\eta\ell_t(i)+\eta^2\ell_t^2(i))\right)\\
&=\frac1\eta\ln\left(1-\eta\langle p_t,\ell_t\rangle+\eta^2\sum_i p_t(i)\ell_t^2(i)\right)\\
&\le-\langle p_t,\ell_t\rangle+\eta\sum_i p_t(i)\ell_t^2(i).
\end{aligned}
\]

第一处不等式用 $e^{-y}\le1-y+y^2$（$y\ge-1$）；最后用 $\ln(1+y)\le y$（$y>-1$）。对时间求和，势函数望远镜消去后整理：

\[
\begin{aligned}
\sum_{t=1}^n\langle p_t,\ell_t\rangle
&\le\Phi_0-\Phi_n+\eta\sum_{t,i}p_t(i)\ell_t^2(i)\\
&\le\Phi_0-\frac1\eta\ln(e^{-\eta L_n(i^\star)})
+\eta\sum_{t,i}p_t(i)\ell_t^2(i)\\
&=\frac{\ln K}\eta+L_n(i^\star)+\eta\sum_{t,i}p_t(i)\ell_t^2(i).
\end{aligned}
\]

再移项即得结论。

## 2 无限类算法：分类

现在研究无限二分类类，目标是对有限 Littlestone 维数 $d$ 获得

\[
\mathbb E[\operatorname{Reg}(\mathcal F,n)]=O(\sqrt{dn\ln n}).\tag{3}
\]

本节只讨论 improper 算法：每轮先揭示输入，学习者预测标签，最后揭示真实标签。**热身。** 仍先假设可实现。无限类没有良好定义的多数票，所以普通 Halving 不再适用。但“错误应带来最多信息”的原则仍可用：将类大小减半，换成每次错误让 Littlestone 维数至少下降 1。

**算法 1：无限类的广义 Halving。** 初始化 $\mathcal F'=\mathcal F$。每轮：

1. 接收 $x_t$，分成 $\mathcal F'_-=\{f\in\mathcal F':f(x_t)=-1\}$ 和 $\mathcal F'_+=\{f\in\mathcal F':f(x_t)=+1\}$。
2. 预测使 $\operatorname{Ldim}(\mathcal F'_y)$ 最大的标签。
3. 收到 $y_t$，更新 $\mathcal F'\leftarrow\mathcal F'_{y_t}$。

第 6 讲证明至少有一个子类维数严格较小。若我们预测了较大维数的一边却出错，保留的另一边维数必严格下降，因此得到：**定理 2。** 可实现时，算法 1 至多犯 $\operatorname{Ldim}(\mathcal F)$ 次错误，遗憾同样被此数控制。

这个算法要求计算 Littlestone 维数，一般可能很困难。对单点指示类，它非常简单：一直预测 −1，直到第一次出现 +1 标签的输入，随后永远用该输入对应的单点函数。读者可考虑 HW2 中高维推广的行为。

> 译注：非空单函数类维数是 0；实现时可约定空类维数为 −1，以免预测不可能标签。打平规则需固定，并在下面的专家构造中保持一致。

### 去掉可实现假设

广义 Halving 是一般算法的关键部件。先做思想实验：自适应环境可预先随机选择输入树 $\mathbf x$ 和标签树 $\mathbf y$，第 $t$ 轮按学习者过去预测 $s_{1:t-1}$ 取出输入与标签。因此它们只依赖过去，正是自适应环境允许的行为。假设我们知道输入树，却不知道标签树，可以先构造最小零覆盖 $V$，把每棵覆盖树看作专家，在当前历史上输出 $\mathbf v_t(s_{1:t-1})$。

覆盖性质保证：对每个 $f$ 和每条实际预测路径，存在专家在该路径上与它完全一致。因此只需对专家池获得低遗憾。虽然专家不是固定的输入到标签映射，Hedge 的同一分析仍适用，产生 $O(\sqrt{n\ln|V|})$ 界。再用序列 Sauer 引理的 $\ln|V|=O(d\ln n)$，就得到 (3)。

困难在于我们不知道整棵输入树；显式构造每棵含 $2^n-1$ 个节点的覆盖树也太昂贵。实际上最终只走一条路径，绝大部分节点信息用不上。能否只构造需要的路径，并在收到当轮输入后才确定该节点值？

### 部分地、自适应地构造覆盖

可以。先定义而不显式展开以下覆盖族。每棵树 $\mathbf v^T$ 由至多 $d$ 个轮次构成的集合 $T=\{t_1<\cdots<t_m\}\subseteq[n]$ 索引，$m\le d$。因此索引总数为 $\sum_{m=0}^d\binom nm$。对路径 $\epsilon$，自上而下定义第 $t$ 个节点：

1. 保留此前与这棵专家树一致的函数。
2. 按它们在当前输入上的正负预测分成两组。
3. 若 $t\notin T$，输出广义 Halving 的标签；若 $t\in T$，输出相反标签。

\[
\mathcal F'=\{f\in\mathcal F:f(\mathbf x_s(\epsilon))=\mathbf v_s^T(\epsilon)\ \forall s<t\},
\quad
\mathcal F'_y=\{f\in\mathcal F':f(\mathbf x_t(\epsilon))=y\}.
\]

**引理 2。** 上面定义的 $V$ 是 $\mathcal F|_{\mathbf x}$ 的零覆盖。**证明。** 固定 $f,\epsilon$，设想在由 $f$ 标注的路径数据上运行广义 Halving：

\[
(\mathbf x_1(\epsilon),f(\mathbf x_1(\epsilon))),\ldots,
(\mathbf x_n(\epsilon),f(\mathbf x_n(\epsilon))).
\]

这是可实现序列，因此错误轮次集合 $T$ 的大小至多为 $d$。我们声称对应专家在路径上完全匹配 $f$。第一轮，Halving 正确时专家不翻转，错误时恰好翻转，所以专家总输出 $f$ 的标签。这样专家按自己的预测更新后的存活类，与 Halving 按真实（此处由 $f$ 生成）标签更新的存活类相同。于是第二轮同样成立，逐轮归纳到最后。

这个证明还给出序列 Sauer 引理的另一种证明。与上一讲的整树递归不同，这个构造允许在看到实际输入后即时算出该节点，而无需知道未走到的分支。

> 译注：索引数是上述二项式和，不同索引可能产生相同树，所以不同树数量是“至多”。不匹配任何函数的专家可能进入空类，此后可固定输出 −1；用于证明覆盖的那个专家始终保留目标 $f$，不会进入空类。

**算法 2：按需输出一条路径的 T 专家。** 初始化 $\mathcal F'=\mathcal F$。每轮：

1. 收到 $x_t$，按标签将存活类分成两组。
2. 若 $t\notin T$，输出最大 Littlestone 维子类的标签；否则输出其反面，记为 $y_t^T$。
3. 用**自己的预测**更新 $\mathcal F'\leftarrow\mathcal F'_{y_t^T}$。

它无需其余输入树的信息，输出恰好是我们关心路径上的节点。与广义 Halving 相比有两点不同：在指定轮次翻转；更新时“自信地”将自己的预测当作正确标签。外层仍用 Hedge 选择专家，得到以下算法。

**算法 3：在部分覆盖上运行 Hedge。** 参数为正学习率。对每个 $|T|\le d$ 的轮次集合维护一个算法 2 专家。每轮：

1. 接收输入并交给所有专家。
2. 根据下面的分布抽取 $T_t$，跟随其预测 $y_t^{T_t}$。
3. 收到真实标签 $y_t$，据此更新各专家的外层损失。

\[
\Pr[T_t=T]\propto
\exp\left(-\eta\sum_{s=1}^{t-1}\mathbf1\{y_s^T\ne y_s\}\right).
\]

**定理 3。** 算法 3 以适当学习率达到 (3)。**证明。** 引理 2 保证每个参照函数在实际路径上有同样预测的专家；专家数

\[
K=\sum_{m=0}^{\min(d,n)}\binom nm
\le(en/d)^d\quad(1\le d\le n).
\]

代入 Hedge 的有限专家界即可。取 $\eta=\sqrt{\ln K/n}$，更精确得到 $2\sqrt{n\ln K}$；$d=0$ 时只有一个函数，直接预测即可。这样通过 improper 算法实现了目标。课件还提到，proper 算法能否达到类似界曾开放约十年，由 Hanneke、Livni、Moran（2021）解决。

> 译注：原文把相对原类和相对专家池的遗憾说成“相同”。零覆盖只保证专家池的最佳损失**不大于**原类最佳损失，因此原类遗憾不大于专家遗憾；这个方向已经足够，不能无条件写等号。

## 3 带间隔的分类

算法 3 理论上有意义，实践却受限：专家数对 $d$ 呈指数式增长，而且有限 Littlestone 维的分类类相当受限。上一讲提出使用替代损失。这里研究单位 $p$-范数线性实值类与 hinge loss：

\[
\mathcal F=\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\qquad \ell(f,(x,y))=\max\{1-yf(x),0\}.
\]

再次从可实现假设出发：最佳累计 hinge loss 为零，等价于存在 $\theta^\star\in B_p^d$，使每轮 $y_t\langle\theta^\star,x_t\rangle\ge1$。这比零一可实现更强：不仅线性可分，而且有至少 1 的分数间隔。更标准的形式先归一化输入，再引入单独的间隔参数。

**假设 1（γ 间隔）。** 输入满足 $x_t\in B_q^d$。存在常数 $\gamma>0$ 与 $\theta^\star\in B_p^d$，其中 $p,q\ge1$、$1/p+1/q=1$，使

\[
y_t\langle\theta^\star,x_t\rangle\ge\gamma\qquad(t=1,\ldots,n).
\]

原文 $p,q\ge$ 后漏了 1，此处补上。一个简单却低效的方法是取大小不超过 $(4/\gamma+1)^d$ 的逐点 $\gamma/2$-覆盖，再对它运行 Halving。第 3 讲命题 2 保证该覆盖存在，且某个代表 $\theta'$ 满足

\[
y_t\langle\theta',x_t\rangle
=y_t\langle\theta^\star,x_t\rangle+y_t\langle\theta'-\theta^\star,x_t\rangle
\ge\gamma-\gamma/2>0.
\]

因此该有限覆盖满足零一可实现假设，Halving 的错误数至多

\[
O(\ln\mathcal N(\mathcal F,\gamma/2))
=O\left(d\ln\left(\frac4\gamma+1\right)\right)\tag{4}
\]

次。如何更高效？以下令 $p=q=2$（HW3 处理 $p=1,q=\infty$）。此时间隔条件意味着每个点到该超平面的欧氏距离至少为 $\gamma$。我们介绍 **Perceptron（感知机）**。

**算法 4：Perceptron。** 初始化 $\theta=0$。每轮：

1. 收到输入，预测 $s_t=\operatorname{sign}(\langle x_t,\theta\rangle)$。
2. 收到标签，若 $y_t\ne s_t$，则更新 $\theta\leftarrow\theta+y_tx_t$。

算法非常高效，只在错误时更新。它沿正确标签方向加入当前误分类样本，使超平面朝纠正该错误的方向调整。错误意味着 $y_t\langle x_t,\theta\rangle\le0$，更新后该点的带符号分数增加：

\[
y_t\langle x_t,\theta+y_tx_t\rangle
=y_t\langle x_t,\theta\rangle+\|x_t\|_2^2.
\]

它是确定性算法，权重可能离开单位球，所以对课件的实值决策空间而言是 improper。零分时应固定输出正或负标签；“犯错意味着非正间隔”成立，但非正间隔不一定意味着犯错，因为零分可能恰好猜对。一次更新也不保证立刻将该点分对。

**定理 4。** 在 $p=q=2$ 的 $\gamma$ 间隔假设下，Perceptron 至多犯 $1/\gamma^2$ 次错误。

**证明。** 设 $\theta_t$ 是第 $t$ 轮开始的权重，$I_t=\mathbf1\{s_t\ne y_t\}$，总错误数 $M=\sum_t I_t$。于是

\[
\theta_1=0,\qquad\theta_{t+1}=\theta_t+I_ty_tx_t.
\]

先控制与分隔方向的相关性：

\[
\langle\theta_{t+1},\theta^\star\rangle
=\langle\theta_t,\theta^\star\rangle+I_ty_t\langle x_t,\theta^\star\rangle
\ge\langle\theta_t,\theta^\star\rangle+I_t\gamma.
\]

累加并用单位范数和 Cauchy–Schwarz：

\[
M\gamma\le\langle\theta_{n+1},\theta^\star\rangle
\le\|\theta_{n+1}\|_2.
\]

再控制权重范数增长：

\[
\begin{aligned}
\|\theta_{t+1}\|_2^2
&=\|\theta_t+I_ty_tx_t\|_2^2\\
&=\|\theta_t\|_2^2+2I_t\langle\theta_t,y_tx_t\rangle+I_t\|x_t\|_2^2\\
&\le\|\theta_t\|_2^2+I_t.
\end{aligned}
\]

因此 $\|\theta_{n+1}\|_2\le\sqrt M$。合并得到 $M\gamma\le\sqrt M$；$M=0$ 已成立，否则除以 $\sqrt M$ 再平方得结论。

与 (4) 相比，$1/\gamma^2$ 对间隔的依赖更差，却完全不依赖维数，特别适合高维问题。这与第 4 讲 2.1 节线性类近乎无维度依赖、阶为 $1/\gamma^2$ 的对数覆盖数呼应。课件最后称，利用 Perceptron 的保证可证线性类的序列 fat 维数在尺度 $\gamma$ 恰为 $1/\gamma^2$ 的阶（见 HW3）。

> 译注：最后的“恰为”需要维度范围。对固定低维不能无条件断言这个下界；正交构造给出 $\min(d,\lfloor4/\gamma^2\rfloor)$ 的下界（采用 $\gamma/2$ 约定），维度足够大时才直接得到 $1/\gamma^2$ 的匹配阶。详解给出上界推导和这个下界构造。

## 参考文献

Steve Hanneke, Roi Livni, and Shay Moran. [Online Learning with Simple Predictors and a Combinatorial Characterization of Minimax in 0/1 Games](https://proceedings.mlr.press/v134/hanneke21a.html). Conference on Learning Theory, PMLR 134:2289–2314, 2021.
