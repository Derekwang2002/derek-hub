---
title: "Lecture 7 详细讲解报告"
summary: "逐步讲解Halving、Hedge、部分覆盖专家、margin 与 Perceptron，补全关键证明、算例、条件与误区，并提供自测和阅读路线。"
---

> 本讲从可学习性走向算法：Halving 将错误变成候选消除，Hedge 用指数权重平衡历史表现，部分覆盖将有限 Littlestone 维变成一般在线策略，Perceptron 则利用几何间隔获得高效保证。原课件：lecture7.pdf（本地原课件，未在线发布）；配套：[完整翻译](/zh/notes/csci678/lecture-7-full-translation)；前置：[Lecture 6](/zh/notes/csci678/lecture-6-explanation)。以下明确区分预期遗憾、确定性错误界、可实现条件与运行时间。

## 1 四种算法各自解决什么问题

| 方法 | 关键条件 | 保证 | 实现代价 |
|---|---|---|---|
| Halving | 有限类，存在零错误函数 | 至多对数个错误 | 枚举存活函数 |
| Hedge | 有限专家，有界全信息损失 | 预期平方根遗憾 | 每轮计算全部专家损失 |
| 广义 Halving 与部分覆盖 | 有限 Littlestone 维 | 可实现时至多 d 错误；一般时聚合专家 | 维数计算可能难，专家池大 |
| Perceptron | 欧氏范数归一化及正间隔 | 至多间隔平方倒数个错误 | 每轮一次内积，错误时向量更新 |

原页 1–3 对应有限类、引理 1 和定理 1；4–6 对应算法 1–3、引理 2 和定理 2–3；7–8 对应假设 1、算法 4 和定理 4。

默认环境不能看到当前私有随机抽样后再选当前损失。观察 $z_t$ 后能计算所有 $\ell(f,z_t)$，这是 full information；若只能看所选专家损失，就是 bandit，需要别的估计方法，本文 Hedge 证明不能直接套用。

## 2 Halving：每次错误至少买到一比特信息

可实现意味着有一个固定 $f^\star$ 在全部轮次都正确。记存活集 $V_t=\{f:f(x_s)=y_s,\ s<t\}$，它永不为空。若只随便选存活函数，每次错误可能只删掉一个，最坏 $K-1$ 次。多数票让错误发生时，被删除的是当前预测的至少一半。

\[
1\le|V_{n+1}|\le K\,2^{-M}
\quad\Longrightarrow\quad
M\le\log_2K.
\]

例如初始 16 个候选，每次错误后最多剩 8、4、2、1 个，所以最多 4 次。最优函数零损失，故错误数就是遗憾。若多数票平局，固定任一标签，错误时仍删掉一半。多数票函数未必在原类里，这是 improper；但仍是一条合法输入到标签的预测规则。

## 3 为什么一般情形必须保留随机性

用只有两个常数专家的例子即可证明。确定性学习者的当轮标签是历史的确定函数，环境可以据此预先给出相反标签，使它错 $n$ 次；两个常数专家错误数相加恰为 $n$，至少一个不超过 $n/2$。因此确定性算法遗憾至少 $n/2$。该结论针对离散标签决策空间；若允许凸化预测和凸损失，输出分布均值可产生不同的算法，不要推广成“一切在线学习都必须随机”。

FTL 硬追随当前领先者，对细小差异反应过强。Hedge 有两个改动：不因一次错误删除专家，而是降低权重；不总选当前最好者，而是按权重抽样。低温极限 $\eta\to\infty$ 接近 FTL，但同分领先者仍可能随机打平。

## 4 Hedge 的可执行规则与一次手算

\[
L_0(i)=0,\quad
w_t(i)=e^{-\eta L_{t-1}(i)},\quad
p_t(i)=\frac{w_t(i)}{\sum_jw_t(j)},\quad
L_t(i)=L_{t-1}(i)+\ell_t(i).
\]

每轮先计算分布、抽取专家、行动，然后观察本轮全部损失并更新。取两个专家、$\eta=\ln2$：初始权重 (1,1)，概率 (1/2,1/2)。若第一轮损失为 (1,0)，下一轮权重 (1/2,1)，概率 (1/3,2/3)；再遇 (1,0)，权重 (1/4,1)，概率 (1/5,4/5)。专家不会被永远删除，环境变化时仍可恢复竞争力。

以下伪代码使用减最大值的 softmax，避免指数下溢；它只说明数值实现，不改变算法。

```python
loss_total = zeros(K)
for t in range(n):
    logits = -eta * loss_total
    weights = exp(logits - max(logits))
    probabilities = weights / sum(weights)
    chosen = sample(probabilities)
    act(chosen)
    losses = observe_all_expert_losses()
    loss_total += losses
```

## 5 引理 1：势函数为什么跟着归一化常数走

令 $W_t=\sum_i e^{-\eta L_t(i)}$、$\Phi_t=\ln W_t/\eta$。两者比值恰是当前分布下的指数损失平均，所以可以将权重更新和本轮预期损失联系起来：

\[
\frac{W_t}{W_{t-1}}=\sum_i p_t(i)e^{-\eta\ell_t(i)}.
\]

需要的二阶上界是 $e^{-x}\le1-x+x^2$ 对 $x\ge-1$。对 $x\ge0$，Taylor 积分余项最多 $x^2/2$；对 $-1\le x\le0$，令 $u=-x\in[0,1]$，指数级数中二次及以上项之和不超过 $(e-2)u^2<u^2$。这解释了课件的 $\eta\ell_t(i)\ge-1$ 条件，也允许一定的负损失。

\[
\begin{aligned}
\Phi_t-\Phi_{t-1}
&=\frac1\eta\ln\sum_i p_t(i)e^{-\eta\ell_t(i)}\\
&\le\frac1\eta\ln\left(1-\eta\langle p_t,\ell_t\rangle+
\eta^2\sum_i p_t(i)\ell_t^2(i)\right)\\
&\le-\langle p_t,\ell_t\rangle+\eta\sum_i p_t(i)\ell_t^2(i).
\end{aligned}
\]

最后一步用 $\ln(1+u)\le u$。对轮次求和，左侧望远镜消去：

\[
\sum_t\langle p_t,\ell_t\rangle
\le\Phi_0-\Phi_n+\eta\sum_{t,i}p_t(i)\ell_t^2(i).
\]

初始 $W_0=K$，所以 $\Phi_0=\ln K/\eta$。对任意参照专家 $i^\star$，和至少有它这一项，故 $W_n\ge e^{-\eta L_n(i^\star)}$，从而 $\Phi_n\ge-L_n(i^\star)$。代入得到

\[
\sum_t\langle p_t,\ell_t\rangle-L_n(i^\star)
\le\frac{\ln K}{\eta}+\eta\sum_{t,i}p_t(i)\ell_t^2(i).
\]

这就是引理 1，且它对每一条实现损失序列、所有专家同时成立。平方损失项保留了比“每轮最多 1”更多的信息；课件定理 1 为了得到简单界，才进一步将它放松为 $n$。

## 6 自适应环境下，最优专家可以在期望内选择

给定过去与环境当前选择，算法抽样的条件损失均值是 $\langle p_t,\ell_t\rangle$。迭代期望得到学习者预期损失等于加权损失之和的期望。但最优专家受随机历史影响，不能把 $\mathbb E\min_i L_n(i)$ 改成 $\min_i\mathbb E L_n(i)$。

引理对所有专家逐路径成立，因此先在该路径选最优专家，再取期望完全合法。损失在 $[0,1]$ 时，

\[
\mathbb E\operatorname{Reg}\le\frac{\ln K}{\eta}+\eta n,\qquad
\eta=\sqrt{\frac{\ln K}n}\quad\Longrightarrow\quad
\mathbb E\operatorname{Reg}\le2\sqrt{n\ln K}.
\]

调参来自将“初始不确定性” $\ln K/\eta$ 与“更新代价” $\eta n$ 平衡。$K=1$ 直接跟随，不使用零学习率公式。未知轮数可用轮数翻倍的分段重启得到同阶界，这是补充策略，不是课件已写出的算法。

## 7 无限类的错误预算：广义 Halving

无限类无法按“哪边函数更多”投票，但第 6 讲说明：按某输入划分时，两个子类至少有一个维数严格下降。算法 1 选择 Littlestone 维数较大的标签，观察真标签后保留一致子类。若预测正确，维数不增；若预测错误，保留的是较小一边，所以至少下降 1。

\[
\operatorname{Ldim}(V_{t+1})
\le\operatorname{Ldim}(V_t)-\mathbf1\{\widehat y_t\ne y_t\}.
\]

可实现时存活类始终非空，维数至少 0；从初值 d 最多下降 d 次，所以至多 d 错误。这给出定理 2。维数在这里就是“还能被强迫犯错多少次”的预算，而不是参数个数。单点类第一次正例前总预测负，正例后目标已唯一确定，所以只错一次。算法存在不等于维数可高效计算。

## 8 从可实现算法到一般算法：枚举错误日历

若输入树已知，可以在它的零覆盖上运行 Hedge。但未知未来输入，不能显式构造整树。课件的巧思是：一个可实现运行最多只在 d 个轮次违背广义 Halving，那么为所有至多 d 个轮次的集合各建一个专家，让它在这些轮次翻转默认预测，就能涵盖任意目标函数的实际路径。

\[
T\subseteq[n],\quad|T|\le d,\qquad
K=\sum_{m=0}^{\min(d,n)}\binom nm.
\]

每个专家有自己的候选集。收到输入后计算默认广义 Halving 标签；是否翻转只由固定集合 T 决定；然后按**自己输出的标签**更新候选集。它不使用真实标签来改变内部版本空间。真实标签只用于外层 Hedge 计算这个专家的损失。

```text
                   current input x_t
                     /    |    \
                  expert expert expert
                  T = ∅ T = {1} T = {2}
                     \    |    /
                     Hedge sampling
                           |
                       prediction
                           |
                     true label y_t
                           |
                 update outer loss weights
```

此图为补充说明。专家的自我更新发生在内部；图中最后一步只更新外层权重。

## 9 引理 2：逐轮归纳证明覆盖成立

固定目标函数 $f$ 和任意实际输入路径。想象另跑一次广义 Halving，标签都由 $f$ 生成。这次运行可实现，所以错误集合 $T_f$ 大小至多 d，必在专家索引池里。证明专家 $T_f$ 匹配目标：

初始二者候选集相同。假设到第 t 轮前仍相同，默认标签也相同。若默认标签等于 $f(x_t)$，该轮不在 $T_f$，专家不翻转；否则该轮在 $T_f$，专家翻转，仍输出 $f(x_t)$。二者随后都保留在 $x_t$ 上输出 $f(x_t)$ 的子类，因此下一轮候选集仍相同。归纳完成。

专家不知道哪个 $T_f$ 是正确日历，也不知道目标函数；Hedge 同时维护全部候选。这证明存在一个匹配专家，而不是要求算法事先找到它。其他专家可能输出不可能标签并进入空类；约定其之后一直输出 −1 即可，匹配专家永远不会空。不同索引也可能生成相同专家行为，只影响数量上界，不影响证明。

## 10 定理 3：基准比较的方向与计算代价

\[
\min_T\sum_t\mathbf1\{y_t^T\ne y_t\}
\le\inf_{f\in\mathcal F}\sum_t\mathbf1\{f(x_t)\ne y_t\}.
\]

对实际路径上的每个函数，都有一个相同预测的专家，所以专家池可以更好。以相同学习者损失减去两边，方向反过来：

\[
\operatorname{Reg}_{\mathcal F}\le\operatorname{Reg}_{\text{experts}},
\qquad
\mathbb E\operatorname{Reg}_{\mathcal F}
\le2\sqrt{n\ln K}
\le2\sqrt{nd\ln(en/d)}.
\]

这是原文“二者遗憾相同”需要修正的地方：只要小于等于就够。$1\le d\le n$ 时推出课件的 $O(\sqrt{dn\ln n})$（小轮数用 $\ln(en)$ 避免零值）；$d=0$ 单函数直接预测。外层专家依赖过去并不破坏 Hedge，因为当轮预测在标签与当前抽样揭晓前已经确定。

例如 $d=2,n=5$，索引数为 $1+5+10=16$，不必展开每棵 31 节点的整树，只维护 16 个内部状态。但一般 $K$ 约为 $n^d$，加上维数计算，仍可能非常昂贵。这是一个构造性的可学习性证明，不能称作普遍高效算法。

课件引用 [Hanneke、Livni、Moran (2021)](https://proceedings.mlr.press/v134/hanneke21a.html) 说明随机 proper 算法也能在 agnostic 设置获得接近最优的遗憾界。该结果使用额外理论，本文没有把上述 improper 构造冒充 proper 解法。

## 11 Margin 假设如何改变不可能性结果

第 6 讲说明一般实数阈值在线零一不可学习；原因是对手能无限逼近决策边界。这里额外要求归一化数据与一个固定分隔方向之间有正间隔，排除了这种无限细分。设对偶范数满足

\[
\|x_t\|_q\le1,\quad\|\theta^\star\|_p\le1,\quad
\frac1p+\frac1q=1,\quad
y_t\langle\theta^\star,x_t\rangle\ge\gamma>0.
\]

Hölder 还说明 $0<\gamma\le1$。若只说“线性可分”却没有统一下界，样本可能越来越靠近超平面，后面的固定错误数界就不适用。对欧氏范数，点到超平面的距离为 $|\langle\theta^\star,x\rangle|/\|\theta^\star\|_2$，所以单位球约束下至少是 $\gamma$。

课件先说零 hinge loss 对应单位**分数间隔**，再将输入归一化引入任意 $\gamma$。归一化之后不能仍无条件要求单位 margin；缩放改变分数大小。

## 12 用有限覆盖学习间隔分类

取参数球的 $\gamma/2$-网，其大小至多 $(1+4/\gamma)^d$。代表 $\theta'$ 距离真实分隔方向不超过 $\gamma/2$，由 Hölder，

\[
\begin{aligned}
y_t\langle\theta',x_t\rangle
&=y_t\langle\theta^\star,x_t\rangle+
y_t\langle\theta'-\theta^\star,x_t\rangle\\
&\ge\gamma-\|\theta'-\theta^\star\|_p\|x_t\|_q
\ge\gamma/2>0.
\end{aligned}
\]

因此某个网中分类器永远正确，Halving 的错误数至多 $d\log_2(1+4/\gamma)$。这与轮数无关、对小间隔只付对数，但必须维护数量随 d 指数增长的网。下一节用较差的间隔依赖换取高效、无维度的保证。

## 13 Perceptron：一次错误就是一次向量修正

\[
\theta_1=0,\qquad s_t=\operatorname{sign}(\langle\theta_t,x_t\rangle),
\qquad
\theta_{t+1}=\theta_t+\mathbf1\{s_t\ne y_t\}y_tx_t.
\]

固定 $\operatorname{sign}(0)=+1$ 即可。犯错时带符号分数非正；更新使当前点的分数增加 $\|x_t\|_2^2$，但不保证一步就跨过零。正确时不更新，是为了后面范数增长只按错误数收费。算法需要的存储为一个 d 维向量，每轮内积成本 $O(d)$，稀疏输入可按非零项计算。

## 14 定理 4：同一个向量的下界和上界相遇

令 $I_t=\mathbf1\{s_t\ne y_t\}$、$M=\sum_tI_t$。第一条线：每次错误都沿真实分隔方向前进至少 $\gamma$。

\[
\begin{aligned}
\langle\theta_{t+1},\theta^\star\rangle
&=\langle\theta_t,\theta^\star\rangle+I_ty_t\langle x_t,\theta^\star\rangle\\
&\ge\langle\theta_t,\theta^\star\rangle+I_t\gamma.
\end{aligned}
\]

从零开始累加，内积至少线性增长为错误数乘间隔。第二条线：每次错误的范数平方只增至多 1。

\[
\begin{aligned}
\|\theta_{t+1}\|_2^2
&=\|\theta_t\|_2^2+2I_ty_t\langle\theta_t,x_t\rangle+I_t\|x_t\|_2^2\\
&\le\|\theta_t\|_2^2+I_t.
\end{aligned}
\]

交叉项非正是因为**只在犯错时**才有更新；最后一项至多 1 是因为输入已归一化。累加得范数最多按错误数平方根增长，再用 Cauchy–Schwarz：

\[
M\gamma
\le\langle\theta_{n+1},\theta^\star\rangle
\le\|\theta_{n+1}\|_2\|\theta^\star\|_2
\le\sqrt M.
\]

若 $M=0$ 已满足结论；否则除以 $\sqrt M$ 后平方，得 $M\le1/\gamma^2$。这证明定理 4。证明可针对每条满足 margin 的自适应序列逐路径成立，不只是平均保证。

补充一般尺度：若 $\|x_t\|_2\le R$、$\|\theta^\star\|_2\le B$、$y_t\langle\theta^\star,x_t\rangle\ge\rho$，同样计算给出

\[
M\rho\le B R\sqrt M,\qquad M\le(BR/\rho)^2.
\]

## 15 感知机手算

取目标方向 $\theta^\star=(1,0)$，输入标签依次为 $((-1,0),-1)$、$((0.6,0.8),+1)$、$((0.6,-0.8),+1)$，均在单位球且间隔至少 0.6。采用零分预测 +1：

第一轮从零预测 +1，错误，更新到 $(1,0)$。第二、三轮内积均为 0.6，预测正确，不更新。本例实际只有一次错误，定理给出的上界 $1/0.6^2\approx2.78$ 意味着整数错误数至多 2。上界不要求被达到。若换一条序列让第二次错误发生，证明仍只按错误次数累积，正确轮数没有影响。

## 16 与序列 fat 维数的联系及维度限制

课件末尾把线性类的序列 fat 维数写作“恰为 $1/\gamma^2$ 的阶”。先严谨证明维度无关的上界。补充采用 Lecture 6 已证明的欧氏类复杂度界，避免把一般见证树误当成零阈值 margin。若深度 m 的树在尺度 $\alpha$ 被打散，沿每条路径选对应函数后有

\[
\sup_f\sum_{t=1}^m\epsilon_tf(\mathbf x_t(\epsilon))
\ge\sum_{t=1}^m\epsilon_t\mathbf y_t(\epsilon)+m\alpha/2.
\]

见证可预测，所以每个 $\epsilon_t\mathbf y_t$ 的期望为零。除以 m 取期望，得到复杂度至少 $\alpha/2$，但欧氏线性类至多 $1/\sqrt m$，因此

\[
\operatorname{sfat}(\mathcal F,\alpha)\le4/\alpha^2.
\]

匹配下界需要足够维度。令 $k=\min(d,\lfloor4/\alpha^2\rfloor)$，第 i 层输入为正交基 $e_i$，见证为 0。对任意符号选择参数 $\theta=(\alpha/2)\sum_{i=1}^k\epsilon_i e_i$，则

\[
\|\theta\|_2^2=k\alpha^2/4\le1,\qquad
\epsilon_i\langle\theta,e_i\rangle=\alpha/2.
\]

所以 sfat 至少 k。当 d 足够大时，上下界才给出 $\Theta(1/\alpha^2)$。为什么固定低维不能无条件说“恰为”？在一维参数区间 $[-1,1]$ 中，任意两条不同路径的见证函数，在首次分叉的同一个输入上相差至少 $\alpha$，所以参数至少相隔 $\alpha$。深度 m 有 $2^m$ 条路径，因此

\[
2^m\le1+2/\alpha,\qquad
m\le\log_2(1+2/\alpha)\quad(d=1).
\]

这与无条件的平方倒数下界明显不同。上述推导也表明 margin 的 $\alpha/2$ 与直接用 $\gamma$ 作间隔，会产生常数 4 的差异。

## 17 易错点、自测与阅读路线

1. Halving 为什么不需要随机化却不违背两专家下界？它额外假设存在零错误函数。
2. Hedge 证明中最优专家能否移到期望外？不能；逐路径引理允许先选择路径最优者，再取期望。
3. T 专家内部用真实标签更新吗？不用；内部用自己预测，真实标签只更新外层权重。
4. 原函数类遗憾与专家遗憾谁更大？专家基准可能更好，因此专家遗憾更大或相等。
5. Perceptron 的非正交叉项从何而来？只有犯错才更新，犯错意味着带符号内积非正。
6. 若输入范数没有上界，哪里失效？范数平方每次至多增加 1 的步骤。
7. 是否证明一次更新就分对当前点？没有，只证明分数增加。
8. 无维度错误上界是否意味着每个固定维度都有同阶 sfat 下界？不意味着，见一维打包反例。

建议先用 20 分钟推完 Halving 和两专家反例，再用 30 分钟重算 Hedge 势函数；随后用一个小类模拟两个 T 专家，确认内部与外层更新不同。最后独立写出 Perceptron 的两条不等式，检查归一化，再读序列 fat 的补充推导。
