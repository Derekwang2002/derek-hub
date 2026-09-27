---
title: "Lecture 4 详细讲解报告"
summary: "逐步推导 fat-shattering 维数、单调函数类速率、原子抽样覆盖、神经网络多层误差分配、谱复杂度与 margin，并核对实验图与课件中的常数约定。"
---

> 依据 Haipeng Luo 的 Lecture 4（Fall 2026，共 9 页）。按“问题—定义—推导—含义”展开，覆盖命题 1–2、定理 1–4、引理 1–2及两张实验图。定理 1 的深层组合结论与完整多分类 margin 泛化定理在课件中未证明，本文明确说明使用位置；其余关键步骤均展开。补充结论、常数修正和原文笔误单独标明。
>
> 原课件：lecture4.pdf（本地原课件，未在线发布）。配套：[完整中文翻译](/zh/projects/csci678/lecture-4-full-translation)。前置：[Lecture 3 详解](/zh/projects/csci678/lecture-3-preview)。默认样本独立同分布，函数类非空，相关上确界可测、期望存在；回归部分函数值在 $[-1,1]$，网络部分无偏置且激活为逐坐标 ReLU。统计上界不保证训练优化可高效求解。

## 阅读导航：这一讲连接了哪两件事

第一条主线解决 Lecture 3 留下的问题：单调函数类的伪维数无限，却可以学习，说明“能够区分多少种符号”还不够，需要问“以多大的间隔区分”。fat-shattering 维数把尺度加入组合复杂度。

第二条主线研究神经网络：参数多不等于在所有尺度上都复杂。先把权重范数变成覆盖数，再把层间误差累积写成谱范数乘积，最后用 margin 消除输出尺度对分类置信度的影响。

| 阅读部分 | 关键问题 | 课件页码 |
|---|---|---|
| 1–4 | 伪维数缺什么？单调类为什么有 $n^{-1/2}$ 速率？ | 1–2 |
| 5–7 | 如何从有限原子的采样得到线性类覆盖数？ | 3–4 |
| 8–10 | 为什么出现混合范数、谱范数和多层误差递推？ | 4–6 |
| 11–12 | $2/3$、$3/2$ 次方从何而来？ | 6–7 |
| 13–15 | margin 界和实验图究竟说明什么？ | 7–9 |
| 16–18 | 常见误区、算例、自测与复习路线 | 综合 |

## 1. 从“任意微小变化”到“固定尺度的变化”

伪维数允许为每个样本点设置门槛 $y_t$，然后要求实现所有正负号组合：

\[
\forall s\in\{-1,+1\}^n,\quad\exists f_s\in\mathcal F,
\quad \operatorname{sign}(f_s(x_t)-y_t)=s_t.
\]

这里没有要求离门槛多远。$10^{-100}$ 的微小上移与 0.5 的上移，在符号上都是“正”。可覆盖性却与近似精度有关：误差容许 0.01 时，小于 $10^{-100}$ 的区别没有必要分别记住。这就是伪维数与学习难度出现脱节的原因。

fat-shattering 在同样的框架里添加固定间隔：

\[
\forall s\in\{-1,+1\}^n,\quad\exists f_s\in\mathcal F,
\quad s_t(f_s(x_t)-y_t)\ge\alpha/2\quad\forall t.
\]

当 $s_t=+1$，要求 $f_s(x_t)\ge y_t+\alpha/2$；当 $s_t=-1$，要求 $f_s(x_t)\le y_t-\alpha/2$。正负两种可用输出之间至少相隔 $\alpha$。

定义的量词顺序不能颠倒：**先固定输入点和见证门槛，再允许标签任意变化，最后根据整组标签选函数。** 门槛不能跟着标签变；每个坐标也不能单独选不同函数。

尺度越大，要求越严格，因此

\[
\alpha_1\le\alpha_2\Longrightarrow
\operatorname{fat}(\mathcal F,\alpha_1)\ge\operatorname{fat}(\mathcal F,\alpha_2).
\]

由于输出在 $[-1,1]$，当 $\alpha>2$ 时连一个点也无法打散。把两个标签的要求相减，就需要两个合法输出相距超过 2，这是不可能的。

在通常一致的阈值端点约定下，伪维数可看成各正尺度 fat 维数的上确界。不要直接把 $\alpha=0$ 代入非严格不等式：那会允许所有标签都由同一个取值恰好等于门槛的函数实现，破坏原本含义。

## 2. 单调类：构造给下界，排除所有构造才给上界

### 2.1 为什么伪维数无限

取 $x_t=t-1$、$y_t=(t-1)/n$，并令

\[
f_s(x_t)=y_t+s_t\epsilon,\qquad0<\epsilon\le1/(2n).
\]

最不利的相邻标签是 $+1,-1$。此时

\[
f_s(x_{t+1})-f_s(x_t)=\frac1n-2\epsilon\ge0.
\]

因此任何标记下这些指定值都单调，可以用阶梯函数延拓到全实线，并保持范围在 $[-1,1]$。$n$ 可以任意大，所以伪维数无限；但间隔 $\epsilon$ 随 $n$ 缩小。

这个构造在 $\epsilon\ge\alpha/2$ 时要求 $n\le1/\alpha$，只证明 $\operatorname{fat}\ge\lfloor1/\alpha\rfloor$。当它失效时，可能存在别的构造，不能据此宣布上界。

### 2.2 命题 1 的上界为何只需要相邻点

假设任意一组排序后的点 $x_1<\cdots<x_n$ 能以尺度 $\alpha$ 打散，见证为 $y_1,\ldots,y_n$。对每一对相邻位置，单独考虑标签 $s_t=+1,s_{t+1}=-1$。由于所有标记都必须可实现，必然有

\[
y_t+\alpha/2\le f(x_t)\le f(x_{t+1})\le y_{t+1}-\alpha/2.
\]

于是相邻门槛必须相隔至少 $\alpha$。这里不同相邻对允许使用不同的函数；共同受约束的是同一组见证。累加得

\[
(n-1)\alpha\le y_n-y_1\le2,
\qquad n\le2/\alpha+1.
\]

这覆盖了所有可能的点集和见证，因此才是真正的上界。

### 2.3 补充：本例可以算出精确值

打散要求每个点都能取正、负标签，加上输出范围，得到

\[
-1+\alpha/2\le y_t\le1-\alpha/2.
\]

于是上面的跨度可加强为 $y_n-y_1\le2-\alpha$，从而 $n\alpha\le2$。反过来，若 $n\alpha\le2$，取

\[
y_t=-1+\alpha/2+(t-1)\alpha,\qquad
f_s(x_t)=y_t+s_t\alpha/2.
\]

所有输出均在 $[-1,1]$，最不利的相邻差是 $\alpha-\alpha=0$，故仍可单调延拓。因此在本讲的 $\alpha/2$ 约定下，

\[
\operatorname{fat}(\mathcal F,\alpha)=\lfloor2/\alpha\rfloor
\quad(0<\alpha\le2),
\qquad \operatorname{fat}(\mathcal F,\alpha)=0\quad(\alpha>2).
\]

这是本文补充的加强结论，课件只需 $\Theta(1/\alpha)$ 的阶。若其他教材把 margin 直接定义为 $\alpha$，相应常数会差一倍。

## 3. Fat 维数怎样进入 Dudley 积分

固定输入 $x_{1:n}$。样本投影是所有预测向量的集合，经验距离与 Rademacher 复杂度分别为

\[
d_{2,n}(u,v)=\sqrt{\frac1n\sum_{t=1}^n(u_t-v_t)^2},
\qquad
\widehat{\mathcal R}_S(\mathcal F)=\frac1n\mathbb E_\epsilon\sup_f\sum_{t=1}^n\epsilon_tf(x_t).
\]

覆盖数 $\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)$ 是以 $d_{2,n}$ 为距离、半径 $\alpha$ 的最小覆盖大小。注意普通欧氏半径是 $\alpha\sqrt n$。

定理 1 是深层的尺度敏感组合结论。本文使用其带安全常数的形式：存在绝对常数 $C>1,c>0$，

\[
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
\le C\operatorname{fat}(\mathcal F,c\delta)\ln(C/\delta),\qquad0<\delta<1.
\]

课件没有给这个定理的证明，它也不是一句“应用普通 Sauer 引理”就能补全的。我们把它作为外部输入，并完整计算后续推论。$\ln(C/\delta)$ 还避免了课件 $\ln(1/\delta)$ 在 $\delta\uparrow1$ 时消失的端点问题。

将它代入 Lecture 3 的 Dudley 界：

\[
\widehat{\mathcal R}_S(\mathcal F)
\le\inf_{0\le a\le1}\left[4a+\frac{12}{\sqrt n}\int_a^1\sqrt{\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)}\,d\delta\right].
\]

如果 $\operatorname{fat}(\mathcal F,c\delta)\lesssim1/\delta$，则被积函数至多是常数倍

\[
\sqrt{\frac{\ln(C/\delta)}{\delta}}.
\]

它在 0 附近可积。直接令 $\delta=e^{-u}$，得到

\[
\int_0^1\sqrt{\frac{\ln(C/\delta)}{\delta}}\,d\delta
=\int_0^\infty\sqrt{\ln C+u}\,e^{-u/2}\,du<\infty.
\]

所以让截断 $a\downarrow0$ 即得命题 2：$\widehat{\mathcal R}_S(\mathcal F)\lesssim n^{-1/2}$，且对所有样本一致成立。再对样本取期望，仍得到相同速率。

课件使用了更简便但略松的计算：$\ln(C/\delta)\lesssim\delta^{-1/2}$，于是根号内为 $O(\delta^{-3/2})$，积分为

\[
\int_a^1\delta^{-3/4}\,d\delta=4(1-a^{1/4})\le4.
\]

两种方法都解释了为什么上一讲的 $\sqrt{\ln n}$ 因子可以消掉：新覆盖数界本身不再含样本位置数带来的 $\ln n$。

## 4. 可学习性、速率与损失假设

对 $G$-Lipschitz 的回归损失，ERM、对称化、收缩依次给出

\[
\mathbb E\bigl[L(\widehat f)-\inf_{f\in\mathcal F}L(f)\bigr]
\le2G\mathbb E\widehat{\mathcal R}_S(\mathcal F).
\]

因此单调类有 $O(G/\sqrt n)$ 的期望超额风险上界。这不是说每个测试点都误差为零，也不是高概率界；若要高概率保证，还需要有界性与集中步骤。

为什么“每个固定正尺度上 fat 有限”足够令复杂度趋零？即使从 0 开始的积分发散，也可以先固定 $a>0$。在 $[a,1]$ 上，fat 被 $\operatorname{fat}(\mathcal F,ca)<\infty$ 控制，故积分有限。先令 $n\to\infty$，只剩 $4a$；再令 $a\downarrow0$。**积分在零附近可积决定漂亮的 $n^{-1/2}$ 速率，不是可学习性的必需条件。**

反方向的必要性要连同学习模型与损失一起陈述。不能只凭“Lipschitz”就断言任何损失都以 fat 维数刻画可学习性：恒零损失无论函数类多大都没有学习难度。

## 5. 神经网络问题：最坏函数类与实际训练结果

一个网络架构能够拟合随机标签，说明架构所容纳的函数类非常丰富。但是“大 VC 维上界无效”不等于“这个网络必定泛化差”。上界大只是证明工具没有给出有效保证。

要区分三层对象：架构允许的全部网络、范数受约束的网络子类、训练算法最终返回的某一个网络。课件后半部分研究第二层，并尝试用它解释第三层；并没有证明 SGD 一定落入一个复杂度很小的子类。

线性模型给出热身。对于 $\|\theta\|_2\le b$，利用对偶范数和 Jensen 不等式，

\[
\begin{aligned}
\widehat{\mathcal R}_S(\mathcal F)
&=\frac bn\mathbb E_\epsilon\left\|\sum_t\epsilon_tx_t\right\|_2\\
&\le\frac bn\sqrt{\mathbb E_\epsilon\left\|\sum_t\epsilon_tx_t\right\|_2^2}
=\frac{b\|X\|_F}{n}.
\end{aligned}
\]

最后一步是因为 $t\ne u$ 时 $\mathbb E\epsilon_t\epsilon_u=0$，交叉项消失。若 $\|x_t\|_2\le r$，则 $\|X\|_F\le r\sqrt n$，上界为 $br/\sqrt n$。

没有显式 $d$ 不等于所有维度影响都消失：若每个输入坐标量级不变，$\|x_t\|_2$ 可能随 $\sqrt d$ 增长。所谓维数无关，必须连同固定范数尺度的假设理解。

## 6. 引理 1：用随机抽样构造有限覆盖

课件把引理 1 留给 HW1。这里补上完整证明，并保留离散采样必须有的取整项。

设 $\|v_i\|_2\le1$，任取

\[
z=\sum_{i=1}^D\beta_iv_i,\qquad\beta_i\ge0,\quad\sum_i\beta_i\le B.
\]

定义随机向量 $V$：以概率 $\beta_i/B$ 取 $v_i$，以剩余概率取 0。于是 $B\mathbb EV=z$，且 $\mathbb E\|V\|_2^2\le1$。独立取 $V_1,\ldots,V_k$，用

\[
\widetilde z=\frac Bk\sum_{r=1}^kV_r
\]

近似 $z$。独立零均值误差的交叉项为零，因而

\[
\mathbb E\|\widetilde z-z\|_2^2
=\frac{B^2}{k}\mathbb E\|V-\mathbb EV\|_2^2
\le\frac{B^2}{k}.
\]

平均误差平方不超过 $B^2/k$，就至少存在一个采样结果达到该上界。令 $k=\lceil B^2/\varepsilon^2\rceil$，即可达到欧氏误差 $\varepsilon$。所有可能的抽样序列至多有 $(D+1)^k$ 个，所以

\[
\ln N(S,\varepsilon;\|\cdot\|_2)
\le\left\lceil\frac{B^2}{\varepsilon^2}\right\rceil\ln(D+1).
\]

对于 $\mathbb R^q$ 中的归一化距离 $\|u-v\|_2/\sqrt q$，令 $\varepsilon=\alpha\sqrt q$，得到

\[
\ln\mathcal N_2(S,\alpha)
\le\left\lceil\frac{B^2}{q\alpha^2}\right\rceil\ln(D+1).
\]

若原子关于正负对称，0 已经在其凸包内，可重新分配剩余质量而不额外加入零原子；一般形式保留 0 最稳妥。当 $\varepsilon\ge B$，中心 0 一点就覆盖整个集合；在 $\varepsilon<B$ 的有意义范围，$\lceil B^2/\varepsilon^2\rceil\le2B^2/\varepsilon^2$，所以原课件的主要阶成立，但不能把取整随意删掉还宣称常数恰为 1。

这是稀疏化的核心：空间维数可以很高，只要一个向量能用总权重有限的原子表示，就可以用有限次抽样逼近；覆盖大小的对数只需计数抽样序列。

## 7. 定理 2：线性类变成列原子的组合

样本投影为 $X\theta\in\mathbb R^n$。对非零列定义

\[
v_i=\frac{X_{:,i}}{\|X_{:,i}\|_2},\qquad
\beta_i=\theta_i\|X_{:,i}\|_2.
\]

零列直接略过。这样 $X\theta=\sum_i\beta_iv_i$。负系数交给负原子 $-v_i$，便得到最多 $2d$ 个单位原子上的非负组合。Cauchy–Schwarz 给出

\[
\sum_i|\beta_i|
=\sum_i|\theta_i|\|X_{:,i}\|_2
\le\sqrt{\sum_i\theta_i^2}\sqrt{\sum_i\|X_{:,i}\|_2^2}
\le b\|X\|_F.
\]

用引理 1，取 $q=n$、$B=b\|X\|_F$、$D\le2d$，得到严谨的版本

\[
\ln\mathcal N_2(\mathcal F|_S,\alpha)
\le\left\lceil\frac{b^2\|X\|_F^2}{n\alpha^2}\right\rceil\ln(2d+1).
\]

忽略普适常数与离散取整，即为课件定理 2。这里并不要求原子凸包等于原函数类投影；它覆盖了一个包含投影的更大集合，仍能用于给上界。

旧上界与新上界各有优点：旧界 $d\ln(1+2b/\alpha)$ 对精度依赖温和，新界 $\widetilde O(b^2\|X\|_F^2/(n\alpha^2))$ 对维数依赖温和。已知二者都成立时，当然可以取较小者。

## 8. 定理 3：单层网络与混合范数

现在 $W\in\mathbb R^{m\times d}$，样本输出是 $\sigma(XW^\top)\in\mathbb R^{n\times m}$。定义归一化矩阵距离

\[
d_{2,nm}(A,B)=\frac{\|A-B\|_F}{\sqrt{nm}}.
\]

ReLU 不扩大欧氏距离：逐坐标有 $|\max(u,0)-\max(v,0)|\le|u-v|$，平方后求和即可得到矩阵形式。所以先覆盖 $XW^\top$，再对所有中心应用 ReLU，覆盖半径不会增加。

展开矩阵乘积：

\[
XW^\top=\sum_{i=1}^d\sum_{j=1}^mW_{ji}Xe_ie_j^\top.
\]

$Xe_i$ 是第 $i$ 个输入特征在全部样本上的列，乘 $e_j^\top$ 后把它放入第 $j$ 个输出坐标。因此

\[
\|Xe_ie_j^\top\|_F=\|X_{:,i}\|_2.
\]

归一化这些原子并添加负原子，共至多 $2dm$ 个。系数绝对值总和为

\[
\begin{aligned}
\sum_{i,j}|W_{ji}|\|X_{:,i}\|_2
&=\sum_i\|W_{:,i}\|_1\|X_{:,i}\|_2\\
&\le\sqrt{\sum_i\|W_{:,i}\|_1^2}\|X\|_F
=\|W\|_{1,2}\|X\|_F.
\end{aligned}
\]

这就是混合范数出现的具体原因。它不是任意选的正则项，而是对按列汇总的系数应用 Cauchy–Schwarz 后留下的量。

将矩阵拉平成 $nm$ 维向量，应用引理 1，得到

\[
\ln\mathcal N_2(\mathcal F|_S,\alpha)
\lesssim\frac{b^2\|X\|_F^2\ln(2dm+1)}{nm\alpha^2}
\]

（在非平凡覆盖尺度内；一般版本保留取整）。分母的 $m$ 来自距离归一化，不是“输出越多模型必然越简单”。换成原始 Frobenius 半径 $\varepsilon=\alpha\sqrt{nm}$ 后，分母就是 $\varepsilon^2$。

### 混合范数比较的完整证明

设 $r_j=(|W_{j1}|,\ldots,|W_{jd}|)$。则

\[
\|W\|_{1,2}=\left\|\sum_{j=1}^mr_j\right\|_2
\le\sum_{j=1}^m\|r_j\|_2=\|W^\top\|_{2,1}.
\]

这是欧氏三角不等式。课件的单层计算因而给出一个不大于行范数求和的上界。比较的是这个具体估计步骤；不能由此声称课件已经完整改进原论文包含所有条件的定理。

## 9. 覆盖中心为何必须是合法的中间输出

多层递推需要控制中间矩阵范数：如果 $M_h=\sigma(M_{h-1}W_h^\top)$，则

\[
\|M_h\|_F\le\|M_{h-1}W_h^\top\|_F
\le\|M_{h-1}\|_F\|W_h\|_2
\le s_h\|M_{h-1}\|_F.
\]

第一步还用到 $\sigma(0)=0$。如果允许任意偏置，或激活在 0 处不为 0，就必须增加对应项；不能原样使用这条递推。

外部覆盖中心未必是合法网络输出，因此不能直接套用上面的范数控制。可以把覆盖中心移入被覆盖的集合：对一个半径 $\varepsilon/2$ 的外部覆盖，每个与集合相交的球选择一个集合内点 $a_j$。任意原点 $a$ 与它的距离至多

\[
\|a-a_j\|\le\|a-c_j\|+\|c_j-a_j\|\le\varepsilon.
\]

所以内部 $\varepsilon$-覆盖的大小不超过外部 $\varepsilon/2$-覆盖的大小。对于 $1/\varepsilon^2$ 的熵上界，代价是一个 4 倍常数；再加上采样取整，统一记成普适常数 $C$。

令 $C(M,\mathcal W_h,\gamma_h)$ 是**原始 Frobenius 半径** $\gamma_h$ 的内部覆盖。其大小满足相应的 $C b_h^2\|M\|_F^2\ln(2d_{\max}^2+1)/\gamma_h^2$ 型上界；大半径情形可直接用合法中心 0。定义

\[
S_0=\{X\},\qquad S_h=\bigcup_{M\in S_{h-1}}C(M,\mathcal W_h,\gamma_h).
\]

对每个前一层中心分支构造后一层覆盖，就得到一棵有限覆盖树。每个节点范数不超过 $\|X\|_F\prod_{k\le h}s_k$。因此

\[
\ln|S_h|
\le\ln|S_{h-1}|+
C\frac{b_h^2\|X\|_F^2(\prod_{k<h}s_k^2)\ln(2d_{\max}^2+1)}{\gamma_h^2}.
\]

并集大小至多是“父节点数乘最大子节点数”，取对数后就是加法。不同父节点对应的覆盖不必相同。

## 10. 引理 2：误差如何逐层传播

固定任意一个真实网络，设其第 $h$ 层样本输出为 $A_h=\sigma(A_{h-1}W_h^\top)$，$A_0=X$。归纳假设可以找到 $M_{h-1}\in S_{h-1}$，使

\[
\|A_{h-1}-M_{h-1}\|_F\le\alpha_{h-1}.
\]

再从该节点的子覆盖选 $M_h$，满足

\[
\|\sigma(M_{h-1}W_h^\top)-M_h\|_F\le\gamma_h.
\]

插入这个中间输出并应用三角不等式：

\[
\begin{aligned}
\|A_h-M_h\|_F
&\le\|\sigma(A_{h-1}W_h^\top)-\sigma(M_{h-1}W_h^\top)\|_F+\gamma_h\\
&\le\|(A_{h-1}-M_{h-1})W_h^\top\|_F+\gamma_h\\
&\le s_h\alpha_{h-1}+\gamma_h.
\end{aligned}
\]

这里的矩阵不等式可以逐行证明：对每行误差 $u_t$，$\|W_hu_t\|_2\le s_h\|u_t\|_2$，平方求和即可。

设 $\alpha_0=0$、$\alpha_h=\gamma_h+s_h\alpha_{h-1}$，得到归纳结论。展开前三层会看得更清楚：

\[
\alpha_1=\gamma_1,\quad
\alpha_2=\gamma_2+s_2\gamma_1,\quad
\alpha_3=\gamma_3+s_3\gamma_2+s_3s_2\gamma_1.
\]

因此

\[
\alpha_H=\sum_{h=1}^H\gamma_h\prod_{k>h}s_k.
\]

**第 $h$ 层新引入的误差由其后所有层的谱范数放大。** 当前层的 $s_h$ 放大的是此前已有的误差，所以乘积从 $k>h$ 开始，不能写成 $k\ge h$。

如果始终使用归一化误差 $e_h=\alpha_h/\sqrt{nd_h}$，则递推会出现

\[
e_h\le\frac{\gamma_h}{\sqrt{nd_h}}+s_h\sqrt{\frac{d_{h-1}}{d_h}}e_{h-1}.
\]

这解释了为什么证明中先统一使用原始 Frobenius 半径更清楚，也避免遗漏维数比例。

## 11. 定理 4：最优误差分配为什么是 2/3 次方

设允许的最终 Frobenius 误差为 $A>0$。定义

\[
P=\prod_{h=1}^Hs_h,\qquad a_h=b_h/s_h,
\qquad L=\ln(2d_{\max}^2+1).
\]

累计熵上界是

\[
C\|X\|_F^2L\sum_{h=1}^H\frac{b_h^2\prod_{k<h}s_k^2}{\gamma_h^2},
\qquad \sum_h\gamma_h\prod_{k>h}s_k=A.
\]

把第 $h$ 层对最终误差的贡献写为 $A\rho_h$，其中 $\rho_h>0$、$\sum_h\rho_h=1$。于是

\[
\gamma_h=\frac{A\rho_h}{\prod_{k>h}s_k},
\qquad
\frac{b_h^2\prod_{k<h}s_k^2}{\gamma_h^2}
=\frac{P^2}{A^2}\frac{a_h^2}{\rho_h^2}.
\]

剩下一个有限维优化问题：最小化 $\sum_ha_h^2/\rho_h^2$。对于课件的正 $a_h$，目标在任何 $\rho_h\downarrow0$ 时发散，最优解在内部；每一项二阶导为 $6a_h^2/\rho_h^4>0$，故目标严格凸。

拉格朗日函数为

\[
\mathscr L(\rho,\lambda)=\sum_h\frac{a_h^2}{\rho_h^2}+\lambda\left(\sum_h\rho_h-1\right).
\]

对 $\rho_h$ 求导：$-2a_h^2/\rho_h^3+\lambda=0$，因此

\[
\rho_h=\frac{a_h^{2/3}}{\sum_ka_k^{2/3}}.
\]

令 $T=\sum_ka_k^{2/3}$，代回得到

\[
\sum_h\frac{a_h^2}{\rho_h^2}
=\sum_h\frac{a_h^2T^2}{a_h^{4/3}}
=T^2\sum_ha_h^{2/3}=T^3.
\]

所以

\[
\ln N(\mathcal F_H|_S,A;\|\cdot\|_F)
\lesssim\frac{\|X\|_F^2L}{A^2}P^2
\left(\sum_h(b_h/s_h)^{2/3}\right)^3.
\]

最后换回归一化半径 $A=\alpha\sqrt{nd_H}$，便得到课件定理 4 的 $nd_H\alpha^2$ 分母。本文保留 $\lesssim$ 以容纳内部覆盖与取整的普适常数。

直观上，$a_h$ 越大，该层要做精细覆盖越昂贵；最优分配让它承担更大的**最终误差份额**。这不一定意味着它的原始局部半径更大，因为后续放大因子还在分母里。

## 12. 从覆盖熵到谱复杂度

定义

\[
R(W)=\left(\prod_h\|W_h\|_2\right)
\left(\sum_h\left(\frac{\|W_h\|_{1,2}}{\|W_h\|_2}\right)^{2/3}\right)^{3/2}.
\]

它的平方正是覆盖熵中的范数量。为什么覆盖数里是三次方，复杂度里变成 $3/2$？因为 Dudley 积分要先对对数覆盖数开平方。

先用标量输出 $d_H=1$ 严格说明。令 $K=\|X\|_FR\sqrt L/\sqrt n$，假设在相关尺度内 $\ln N_2(\delta)\lesssim K^2/\delta^2$，经验半径上界为 $D$。截断的 Dudley 界形如

\[
\widehat{\mathcal R}_S\lesssim
\inf_{0<a\le D}\left[a+\frac{K}{\sqrt n}\int_a^D\frac{d\delta}{\delta}\right]
=\inf_{0<a\le D}\left[a+\frac{K}{\sqrt n}\ln(D/a)\right].
\]

这里不能直接令 $a=0$，因为 $\int_0^Dd\delta/\delta$ 发散。若 $K/\sqrt n\le D$，取 $a$ 同阶于 $K/\sqrt n$，得到

\[
\widehat{\mathcal R}_S
\lesssim\frac{\|X\|_FR\sqrt L}{n}
\left[1+\ln\left(\frac{Dn}{\|X\|_FR\sqrt L}\right)\right].
\]

另一种情形取 $a=D$ 给出平凡的半径上界。忽略对数，主导尺度就是 $\|X\|_FR/n$。若输入范数有界，则为 $rR/\sqrt n$。

对于向量输出，必须说明 Rademacher 过程的定义和最终损失：不能因为覆盖归一化出现 $d_H$，就直接宣称分类泛化额外改善 $1/\sqrt{d_H}$。课件从网络覆盖到多分类 margin 界还借用了适用于 margin 损失的经验过程工具。这里明确保留这一步作为引用，不把标量收缩定理当作完整的多分类证明。

谱复杂度的第一部分 $\prod_h\|W_h\|_2$ 控制网络的 Lipschitz 常数，第二部分是各层混合范数的修正。**完整谱复杂度不是单纯的谱范数乘积。** 若某层权重为零，无偏置网络恒为零，可单独处理；不应在定义里直接计算 $0/0$。

## 13. Margin：为什么分类要除以输出尺度

网络输出的是各类分数，分类取最大坐标。定义

\[
M(f,x,y)=f(x)_y-\max_{j\ne y}f(x)_j.
\]

例如真实类别为第 2 类，分数 $(1,3,2)$ 的 margin 为 1，预测正确；分数 $(1,1.5,2)$ 的 margin 为 $-0.5$，预测错误。margin 为零意味着并列，是否正确取决于平局规则。任何误分类都包含在 $\{M\le0\}$ 中。

用 ramp 损失把分类错误与复杂度连接起来：

\[
\phi_\gamma(u)=
\begin{cases}
1,&u\le0,\\
1-u/\gamma,&0<u<\gamma,\\
0,&u\ge\gamma.
\end{cases}
\]

它对 $u$ 为 $1/\gamma$-Lipschitz，且

\[
\mathbb I\{\text{分类错误}\}\le\phi_\gamma(M)
\le\mathbb I\{M<\gamma\}.
\]

因此，对一个预先固定的函数类和 $\gamma$，有界损失的经验过程界给出“经验 margin 损失 + 复杂度项 + 置信项”。再处理所有网络范数尺度及所有 $\gamma$ 的一致性，才得到允许训练后选 $\gamma$ 的界。

课件的主要量级写成

\[
\Pr\{\arg\max_jf_W(x)_j\ne y\}
\lesssim\frac1n\sum_t\mathbb I\{M_t<\gamma\}
+\widetilde O\left(\frac{\|X\|_FR(W)}{\gamma n}\right).
\]

**原论文核对。** Bartlett–Foster–Telgarsky 的完整高概率定理还含 $\sqrt{\ln(1/\delta)/n}$ 置信项，并使用行范数和形式的修正因子（可相对于参考矩阵定义）。课件式 (4) 展示的是主要量级，不能直接当成没有置信项的精确数值保证。[原论文定理 1.1](https://papers.nips.cc/paper/7204-spectrally-normalized-margin-bounds-for-neural-networks.pdf)

增大 $\gamma$ 会让更多训练点被记为“小 margin”，但会降低复杂度惩罚。统一界允许在分析时选最好的 $\gamma$，这不要求重新训练模型。

若所有训练 margin 严格为正，可以选择 $0<\gamma<\min_tM_t$，让第一项为零。这样也避免了 $<$ 与 $\le$ 两种端点约定的差异。单有零训练误差、却存在打平样本时，不能除以零 margin。

### 正齐次性解释了为什么比例更合适

无偏置 ReLU 满足 $\sigma(cu)=c\sigma(u)$（$c>0$）。只把最后一层放大为 $cW_H$，所有输出分数与 margin 都乘 $c$，预测类别不变；各层混合范数与谱范数的比值不变，而谱范数乘积乘 $c$。于是

\[
R(cW_H)=cR(W),\qquad M'=cM,
\qquad R'/M'=R/M.
\]

这说明 margin 大本身不等于泛化好，必须与模型尺度一起比较。相邻层分别乘 $c$ 与 $1/c$ 时，函数和谱复杂度都保持不变，也是有用的一致性检查。

## 14. 图 1：相同参数个数，为什么测试表现不同

![图 1：AlexNet 在原始标签与随机标签 CIFAR10 上的训练曲线](/projects/csci678/lecture-4/figure-1.png)

图来自课件第 7 页。横轴是训练轮次，且使用对数尺度；叉号表示训练误差首次为零。图中的 excess risk 是**测试误差减训练误差**，与前面定义的 $L(\widehat f)-\inf_fL(f)$ 不是同一个量。

先看三件事：原始标签更早达到零训练误差；达到零之后测试误差约 0.3，而随机标签约 0.9；参数量相同，复杂度曲线却明显不同。随机十分类标签无法在独立新标签上获得有效信息，0.9 的错误率与这一背景一致。

然后看随训练继续发生的变化：未归一化的范数量可能继续增大，但除以 margin 后可以趋于稳定。这支持用相对 margin 描述分类尺度。图中 Lipschitz 曲线严格说对应谱范数乘积；不要把它直接等同于包含混合范数修正的 $R(W)$。

这些是特定实验下的定性支持，并不证明每个网络、每个任务的泛化误差都由该指标精确预测，更不说明上界在数值上一定小于 1。

## 15. 图 2：归一化 margin 分布应该怎样读

设 $Q=\|X\|_FR(W)/n>0$，定义归一化 margin $u_t=M_t/Q$。把原来阈值换为 $\gamma Q$，则主要项变为

\[
\frac1n\sum_t\mathbb I\{u_t<\gamma\}+\widetilde O(1/\gamma).
\]

第一项是经验 CDF 的左极限值。图 2 画的是平滑的分布密度形状，不是直接画 CDF；需要对阈值左侧的密度累积，才能理解为第一项。

![图 2：不同任务的归一化 margin 分布](/projects/csci678/lecture-4/figure-2.png)

在同一比较规范下，如果分布更靠右，给定阈值左侧的质量往往更少，界中的经验惩罚更小。更严格地说，应比较各阈值上的 CDF；仅比较均值或最高峰可能误导。

四个面板分别展示：MNIST 相比 CIFAR10 更容易；随机标签会使两者都变难且更相近；CIFAR100 与随机标签 CIFAR10 接近；随机输入比随机标签更难。这些结论限于图示实验和归一化指标，不能脱离训练设置当作数据集的绝对难度排序。

课件改写概率公式时将 $\arg\max$ 误排成 $\max$。左侧必须是预测类别与真实标签不同的事件，不能拿最大的分数数值与类别编号比较。

## 16. 一个两层算例：亲手核对误差分配

假设 $H=2$、$s_1=2,s_2=3$、$b_1=4,b_2=3$，希望最终 Frobenius 误差 $A=1$。则

\[
a_1=2,\quad a_2=1,\quad
\rho_1=\frac{2^{2/3}}{2^{2/3}+1}\approx0.6135,
\quad \rho_2\approx0.3865.
\]

对应原始局部半径

\[
\gamma_1=\rho_1/s_2\approx0.2045,\qquad
\gamma_2=\rho_2\approx0.3865.
\]

检查总误差：$3\gamma_1+\gamma_2=1$。第一层承担的最终误差更大，但局部误差反而更小，因为还要经过第二层放大。

忽略公共因子，原目标为

\[
\frac{16}{\gamma_1^2}+\frac{36}{\gamma_2^2}
=36(2^{2/3}+1)^3\approx623.6.
\]

若平均分配最终误差 $\rho_1=\rho_2=1/2$，则 $\gamma_1=1/6,\gamma_2=1/2$，目标为 $576+144=720$。最优分配确实改善上界。

## 17. 容易混淆的地方与课件核对清单

| 容易误读 | 应如何理解 |
|---|---|
| 伪维数无限就不可学习 | 固定正尺度上的 fat 维数才保留了幅度信息 |
| 一个打散构造失败就得到上界 | 上界必须排除全部可能构造 |
| fat 是投影所在的线性空间维数 | 它控制覆盖熵，不保证线性子空间包含关系 |
| 所有定理的覆盖半径都一样 | 标量归一化用 $\sqrt n$，矩阵用 $\sqrt{nm}$；递推使用原始 Frobenius 半径 |
| 引理 1 无需零原子与取整 | 一般形式须加入零原子并保留采样数向上取整 |
| 覆盖中心可免费移入集合 | 通常付出半径加倍，平方熵界常数因此变化 |
| 参数数量没有影响 | 显式多项式依赖消失，范数与输入规模仍可能携带维度影响 |
| 谱复杂度就是 Lipschitz 常数 | 还包括混合范数修正因子 |
| 零训练误差等于正最小 margin | 平局预测正确也可能使最小 margin 为零 |
| 图中 excess risk 就是类内超额风险 | 此图指测试误差与训练误差之差 |
| margin 界证明 SGD 会泛化 | 它给出低复杂度、大 margin 的充分控制；SGD 为什么偏向这样的解仍未证明 |

边界情况也要单独处理：全零输入使投影退化；零列原子直接删除；零权重层使无偏置网络恒为零；$\gamma_h=0$ 时不能直接使用含 $1/\gamma_h^2$ 的熵上界；$Q=0$ 时不能归一化 margin。

## 18. 自测与复习顺序

1. **为什么单调类可以有无限伪维数？** 因为相邻见证门槛的距离随样本数缩小，符号实现只需更微小的上下扰动。
2. **$\alpha=0.5$ 时本例精确 fat 维数是多少？** 在本讲的 $\alpha/2$ margin 约定下为 4；可用 $-0.75,-0.25,0.25,0.75$ 作见证。
3. **引理 1 的 $1/\alpha^2$ 从哪里来？** $k$ 个独立原子平均的均方误差是 $B^2/k$，解出所需采样数即可。
4. **为什么单层混合范数先列 $\ell_1$ 再 $\ell_2$？** 先按同一输入列汇总所有输出系数的绝对值，再与数据列范数作 Cauchy–Schwarz。
5. **为什么 $2/3$ 次方不是猜出来的？** 对 $a_h^2/\rho_h^2$ 求导得到 $\rho_h^3\propto a_h^2$。
6. **能把网络熵界积分下限直接取 0 吗？** 不能，$\sqrt{1/\delta^2}=1/\delta$ 的积分发散，需要截断。
7. **只把网络输出放大十倍，分类会改善吗？** 类别不变，margin 和谱复杂度同时放大，二者比值不变。
8. **本讲仍未回答哪个关键问题？** 为什么具体训练算法会找到具有低复杂度和良好 margin 的网络。

30 分钟复习建议：前 8 分钟复现单调类上下界与积分；接着 7 分钟推导原子抽样和混合范数；再用 10 分钟手推两层误差、KKT 和上面的算例；最后 5 分钟读两张图，并用自己的话说明统计保证与优化行为的区别。

## 来源与补充范围

主要来源是本地 Lecture 4，定理编号均对应课件。精确单调 fat 维数、引理 1 的取整版本、内部覆盖的常数说明、KKT 展开、齐次性检查和两层数值例子是本文补充推导。完整 margin 定理的置信项及范数约定参照 [Bartlett、Foster、Telgarsky（2017）](https://papers.nips.cc/paper/7204-spectrally-normalized-margin-bounds-for-neural-networks.pdf)。随机标签讨论的原始参考为 Zhang、Bengio、Hardt、Recht、Vinyals，*Understanding deep learning requires rethinking generalization*，ICLR 2017。
