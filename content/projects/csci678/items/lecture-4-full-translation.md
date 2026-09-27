---
title: "Lecture 4 课件完整翻译"
summary: "Lecture 4 九页课件的完整中文翻译：fat-shattering 维数、线性与多层神经网络覆盖数、谱复杂度和 margin 泛化界，保留原编号、证明和实验图。"
---

**2026 年秋季学期，授课教师：Haipeng Luo**

> 依据本地 lecture4.pdf（9 页）逐节完整翻译。保留定理、命题、引理及公式 (1)–(4) 的原编号和证明结构；图 1、图 2 提取自原课件。少量原文的简写、笔误及常数约定另以“译注”标明，不混入原论证。配套：[详细讲解报告](/zh/projects/csci678/lecture-4-explanation)。

## 1 回归：Fat-shattering 维数

上一讲，我们利用不同的覆盖数，对实值函数类的 Rademacher 复杂度推导了几个上界，随后开始寻找一个类似于分类问题中 VC 维的组合参数，希望它能直接给出覆盖数的上界。第一次尝试是**伪维数**，定义为

\[
\operatorname{Pdim}(\mathcal F)=\operatorname{VCdim}\bigl(\{h(x,y)=\operatorname{sign}(f(x)-y):f\in\mathcal F\}\bigr).
\]

也就是说，它是满足下述条件的最大整数 $n$：存在 $n$ 个输入输出对 $(x_1,y_1),\ldots,(x_n,y_n)\in\mathcal X\times[-1,+1]$，使得对于任何标记 $s_1,\ldots,s_n\in\{-1,+1\}$，都存在 $f\in\mathcal F$，对所有 $t=1,\ldots,n$ 满足 $\operatorname{sign}(f(x_t)-y_t)=s_t$。

对于线性类，这是一个合理的复杂度度量；但对可学习的单调不减函数类，它却是无穷大。事实上，对于任意 $n$，取输入输出对 $(0,0/n),(1,1/n),(2,2/n),\ldots$。对任意标记 $s_1,\ldots,s_n$，选择某个 $\epsilon\in(0,1/(2n)]$，总可以找到一个单调不减函数，经过

\[
(0,0/n+s_1\epsilon),\quad(1,1/n+s_2\epsilon),\quad(2,2/n+s_3\epsilon),\ldots,
\]

从而满足所有符号要求。因此，有限伪维数不是可学习性的必要条件。

比较伪维数与覆盖数的定义，可以发现前者缺少的是**尺度** $\alpha$。直观上，我们需要一个依赖尺度的组合参数，并且尺度越大，它就越小。一种做法是要求诱导出的二分类器 $\operatorname{sign}(f(x)-y)$ 不仅预测正确，还要以某个置信程度或间隔（margin）预测正确。这就引出了 fat-shattering 的概念。

具体地，如果存在 $y_1,\ldots,y_n\in[-1,+1]$（称为打散的**见证**），使得对于任意标记 $s_1,\ldots,s_n\in\{-1,+1\}$，都存在 $f\in\mathcal F$，满足

\[
s_t(f(x_t)-y_t)\ge\frac\alpha2,\qquad t=1,\ldots,n,
\]

就称 $\mathcal F\subseteq[-1,+1]^{\mathcal X}$ **$\alpha$-打散**了点集 $x_1,\ldots,x_n$。这个不等式恰好表示以至少 $\alpha/2$ 的间隔正确预测标签 $s_t$。尺度 $\alpha$ 下的 fat-shattering 维数定义为最大可打散点集的大小：

\[
\operatorname{fat}(\mathcal F,\alpha)=\max\{n:\text{存在被 }\mathcal F\ \alpha\text{-打散的点集 }x_{1:n}\}.
\]

显然，$\operatorname{fat}(\mathcal F,\alpha)$ 随 $\alpha$ 单调不增：若能以尺度 $\alpha$ 打散某个集合，那么也能以任意更小的尺度 $\alpha'<\alpha$ 打散它。当 $\alpha$ 趋于零时，fat-shattering 维数就变为伪维数。

回到单调不减函数类。前面的构造只能保证 $\epsilon\in(0,1/(2n)]$ 的间隔，随着 $n$ 增大，间隔越来越小。若要求间隔至少为 $\alpha/2$，该构造在 $n\le1/\alpha$ 时仍成立，因此

\[
\operatorname{fat}(\mathcal F,\alpha)\ge\lfloor1/\alpha\rfloor.
\]

当 $n>1/\alpha$ 时，这个构造不再有效。但这并不能证明 fat 维数恰好为 $\lfloor1/\alpha\rfloor$（想想为什么）。下面的命题说明，$1/\alpha$ 确实给出了正确的阶。

**命题 1。** 设 $\mathcal X=\mathbb R$、$\mathcal Y=[-1,+1]$，$\mathcal F\subseteq\mathcal Y^{\mathcal X}$ 为所有单调不减函数组成的类。对任意 $\alpha>0$，

\[
\operatorname{fat}(\mathcal F,\alpha)\le\frac2\alpha+1.
\]

**证明。** 假设 $x_1\le\cdots\le x_n$ 被 $\mathcal F$ 以尺度 $\alpha$ 打散，见证为 $y_1,\ldots,y_n$。对于每个 $t=1,\ldots,n-1$，考虑满足 $s_t=+1,s_{t+1}=-1$ 的标记，其余点的标记任意。由定义存在 $f\in\mathcal F$，使

\[
f(x_t)\ge y_t+\frac\alpha2,\qquad f(x_{t+1})\le y_{t+1}-\frac\alpha2.
\]

由于 $f$ 单调不减且 $x_t\le x_{t+1}$，

\[
y_t+\frac\alpha2\le f(x_t)\le f(x_{t+1})\le y_{t+1}-\frac\alpha2.
\]

于是 $y_{t+1}-y_t\ge\alpha$。累加得到

\[
2\ge y_n-y_1=\sum_{t=1}^{n-1}(y_{t+1}-y_t)\ge(n-1)\alpha,
\]

其中第一个不等式来自 $y_1,y_n\in[-1,+1]$。故 $n\le2/\alpha+1$，命题得证。

那么，fat-shattering 维数与覆盖数有什么联系？也存在类似 Sauer 引理的结论，这里只陈述而不证明。

**定理 1。** 对任意 $\mathcal F\subseteq[-1,+1]^{\mathcal X}$、$\alpha\in(0,1)$ 和任意输入 $x_{1:n}$，存在绝对常数 $c>0$，使

\[
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)
=O\!\left(\operatorname{fat}(\mathcal F,c\alpha)\ln\frac1\alpha\right).
\]

这个上界比伪维数上界更紧，因为 $\operatorname{fat}(\mathcal F,c\alpha)\le\operatorname{Pdim}(\mathcal F)$。它还不依赖 $n$，粗略地说，意味着 $\mathcal F|_{x_{1:n}}$ 位于 $[-1,+1]^n$ 内某个“维数为 $\operatorname{fat}(\mathcal F,c\alpha)$”的空间中。应用 Dudley 熵积分，就能进一步得到 Rademacher 复杂度上界。例如，单调不减函数类满足下面的结论。

> 译注：“维数空间”是有效复杂度的直观比喻，不是线性子空间包含关系。若要把上式写成对整个 $(0,1)$ 区间一致成立的常用形式，可把对数写作 $\ln(C/\alpha)$，其中 $C>1$ 为常数，避免 $\alpha\uparrow1$ 时对数趋零。详细讲解采用这一写法。

**命题 2。** 对 $\mathcal X=\mathbb R$、$\mathcal Y=[-1,+1]$ 上的所有单调不减函数类 $\mathcal F$，

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)=O(1/\sqrt n).
\]

**证明。** 将

\[
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)
=O\!\left(\frac1\alpha\ln\frac1\alpha\right)=O(\alpha^{-3/2})
\]

代入 Dudley 熵积分，得到

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\!\left(\inf_\alpha\left[\alpha+\frac1{\sqrt n}\int_\alpha^1\frac{d\delta}{\delta^{3/4}}\right]\right)
=O(1/\sqrt n).
\]

上一讲通过 $\ell_\infty$ 覆盖数上界 $\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)\le(n+1)^{1/\alpha}$，得到了 $O(\sqrt{\ln n/n})$ 的复杂度界；这里利用 fat 维数直接控制 $\ell_2$ 覆盖数，进一步去掉了根号中的 $\ln n$ 因子。这展示了直接使用 fat-shattering 维数的优势。

事实上，与伪维数不同，有限 fat-shattering 维数已被证明是 $\mathcal F$ 可学习的必要条件。综合起来，我们得到统计学习博弈值的一串紧上界：

\[
\begin{aligned}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
&\le\sup_P\mathbb E\!\left[\sup_{f\in\mathcal F}\left(L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)\right)\right] &&\text{（ERM）}\\
&\le2\sup_P\mathcal R^{\mathrm{iid}}(\ell(\mathcal F)) &&\text{（对称化）}\\
&\le2G\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F) &&\text{（去掉损失）}\\
&\le2G\sup_{x_{1:n}}\min_{0\le\alpha\le1}\left[4\alpha+\frac{12}{\sqrt n}\int_\alpha^1\sqrt{\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)}\,d\delta\right] &&\text{（Dudley）}\\
&\le2G\min_{0\le\alpha\le1}O\!\left(\alpha+\frac1{\sqrt n}\int_\alpha^1\sqrt{\operatorname{fat}(\mathcal F,c\delta)\ln\frac1\delta}\,d\delta\right). &&\text{（定理 1）}
\end{aligned}
\]

> 译注：这里“有限”指每个固定正尺度上的维数有限。必要性要放在相应实值学习问题和损失假设下理解，不能推广到任意损失（例如恒零损失）。$G$ 是损失对预测值的 Lipschitz 常数；所需可测性、可积性与前几讲相同。

## 2 理解神经网络的复杂度

到这里，我们已经介绍了理解统计学习所需的基本概念和工具。现在以神经网络为案例，看看这些理论能否至少部分解释它在实践中的成功。

神经网络的一大谜题是：即使参数数量比训练样本量大好几个数量级，它们为什么仍能泛化？现代网络可以轻易拥有数百万乃至数十亿个参数，表达能力很强，往往能取得零训练误差。要让训练集上的好表现推广到未见数据，理论提示我们研究一致收敛，或更一般地研究对应函数类的可学习性。

分类问题的可学习性可用 VC 维刻画。但神经网络的 VC 维似乎常常至少与样本量一样大。例如，一个约有一百万参数的全连接前馈网络，能够完美拟合含五万张图片、标签完全随机的 CIFAR10；这为模型类能够打散 CIFAR10 提供了有力证据 [Zhang et al., 2017]。从

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)\lesssim\sqrt{\operatorname{VCdim}(\mathcal F)/n}
\]

这样的理论界来看，我们不应期待该类有很好的泛化保证。可是，同一个网络在干净的 CIFAR10 上训练，却能达到约 50% 的准确率；对于十分类问题，这已明显优于随机猜测。参数量相近的卷积网络甚至可以达到接近 90% 的准确率。

其他复杂度量似乎也遇到了困难：即使在线性函数类这个神经网络的退化特例中，前面推导的超额风险界也形如 $\sqrt{d/n}$，其中 $d$ 基本就是参数个数，而训练神经网络时常有 $d\gg n$。难道前面学到的理论完全没有用吗？

并非如此。这只说明 VC 维或参数个数很可能不是衡量网络内在复杂度的合适量。直观上，权重的大小应该起到更重要的作用。我们在 HW1 中已经见过例子：当线性函数权重满足 $\|\theta\|_2\le b$ 时，Rademacher 复杂度至多为

\[
\frac bn\sqrt{\sum_{t=1}^n\|x_t\|_2^2},
\]

它不显式依赖维数，说明真正影响复杂度的是权重范数，而非向量的维度。

下面主要沿用 Bartlett et al. [2017] 的思路：先为线性类推导几乎不依赖维数的覆盖数界，再推广到对应单层网络的矩阵情形，最后推广到完整网络。理论推导之后，我们再回到实验结果，讨论新上界是否解释了神经网络的实践表现。

> 译注：较大的最坏情形上界只是无法提供有效保证，并不证明某个数据分布上的实际泛化一定很差；拟合若干随机标记也不是“拟合全部标记”的形式证明。CIFAR10 是多分类问题，原文在这里借用二分类 VC 维作直观讨论。

### 2.1 几乎不依赖维数的覆盖数：热身

先证明一个在线性类上成立的对数覆盖数上界（HW1 中已出现）。它对 $d$ 的显式依赖只有对数级。

**定理 2。** 对函数类

\[
\mathcal F=\{f_\theta(x)=\langle\theta,x\rangle:\theta\in\mathbb R^d,\ \|\theta\|_2\le b\},
\]

有

\[
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)
\le\frac{b^2\|X\|_F^2\ln(2d)}{n\alpha^2},
\qquad
\|X\|_F=\sqrt{\sum_{t=1}^n\|x_t\|_2^2},
\]

其中 $X\in\mathbb R^{n\times d}$ 以 $x_1^\top,\ldots,x_n^\top$ 为各行。

相比之下，上一讲在 $\|x_t\|_2\le1$ 下得到了

\[
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)
\le\ln\mathcal N(\mathcal F,\alpha)
\le d\ln(2b/\alpha+1),
\]

它对 $d$ 是线性依赖。新上界对 $\alpha$ 的依赖虽然更差，但得益于 Dudley 积分，最终并不会改变 Rademacher 复杂度关于 $n$ 的主要速率。在 HW1 中，需要由此证明忽略对数因子后的 $b\sqrt{\sum_t\|x_t\|_2^2}/n$ 上界；它仍是 $1/\sqrt n$ 阶，却没有维数的多项式依赖。

为证明定理 2，回顾 HW1 中证明的结论。

**引理 1。** 设 $v_1,\ldots,v_d\in B_2^n$ 是 $n$ 维欧氏单位球中的点，且

\[
S=\left\{\sum_{i=1}^d\beta_iv_i:\beta_i\ge0,\ \sum_{i=1}^d\beta_i\le B\right\},\qquad B>0.
\]

则 $\ln\mathcal N_2(S,\alpha)\le B^2\ln d/(n\alpha^2)$。原文称 $S$ 为这些点的凸包经 $B$ 缩放后的集合。

> 译注：由于系数和允许小于 $B$，严格地说 $S=B\operatorname{conv}\{0,v_1,\ldots,v_d\}$。一般有限采样证明应保留向上取整及零原子，例如 $\ln\mathcal N_2(S,\alpha)\le\lceil B^2/(n\alpha^2)\rceil\ln(d+1)$。原文省略了这些细节，定理 2–4 的精确常数也应结合这一约定理解；它们强调的尺度与维数依赖不受影响。

**定理 2 的证明。** 每个样本投影向量都是 $X\theta$。令

\[
v_i=\frac{X_{:,i}}{\|X_{:,i}\|_2},\qquad
\beta_i=\theta_i\|X_{:,i}\|_2,
\]

则 $\|v_i\|_2=1$，并且 $X\theta=\sum_i\beta_iv_i$。不过 $\beta_i$ 可能为负，与引理 1 的条件不一致。可以写成

\[
X\theta=\sum_{i=1}^d\left[\mathbb I\{\beta_i\ge0\}\beta_iv_i
+\mathbb I\{\beta_i<0\}(-\beta_i)(-v_i)\right].
\]

因此只要把基向量数从 $d$ 加倍为 $2d$，使用 $\pm v_1,\ldots,\pm v_d$，即可让系数非负。再由 Cauchy–Schwarz 不等式，

\[
\sum_i|\beta_i|=\|\beta\|_1
\le\|\theta\|_2\|X\|_F\le b\|X\|_F\eqqcolon B.
\]

应用引理 1 即得结论。对于其他原始范数与对偶范数对，也可用同样论证证明类似结果，这里不再展开，读者可以尝试。

> 译注：若某列 $X_{:,i}=0$，直接删去该零原子，避免除零。这里需要的是投影集合包含于相应缩放凸包，不要求二者相等。

### 2.2 几乎不依赖维数的覆盖数：单层网络

考虑单层神经网络：通过 $W\in\mathbb R^{m\times d}$ 和逐坐标 ReLU 激活 $\sigma$，将 $x\in\mathbb R^d$ 映射到 $\mathbb R^m$。一维 ReLU 定义为 $\sigma(u)=\max\{u,0\}$。我们关心 $(1,2)$ 混合范数

\[
\|W\|_{1,2}=\left\|(\|W_{:,1}\|_1,\ldots,\|W_{:,d}\|_1)\right\|_2,
\]

即先求每列的 $\ell_1$ 范数，再对这些数求 $\ell_2$ 范数。原因将从证明中自然出现。

**定理 3。** 对

\[
\mathcal F=\{x\mapsto\sigma(Wx):W\in\mathbb R^{m\times d},\ \|W\|_{1,2}\le b\},
\]

有

\[
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)
\le\frac{b^2\|X\|_F^2\ln(2dm)}{nm\alpha^2}.
\]

**证明。** 每个投影是 $\sigma(XW^\top)\in\mathbb R^{n\times m}$。ReLU 为 1-Lipschitz，因此只需覆盖线性集合 $\{XW^\top:\|W\|_{1,2}\le b\}$。展开

\[
XW^\top
=X\sum_{i=1}^d\sum_{j=1}^mW_{ji}e_ie_j^\top
=\sum_{i=1}^d\sum_{j=1}^mW_{ji}Xe_ie_j^\top
=\sum_{i,j}\beta_{ij}v_{ij},
\]

其中

\[
\beta_{ij}=W_{ji}\|Xe_ie_j^\top\|_F,\qquad
v_{ij}=\frac{Xe_ie_j^\top}{\|Xe_ie_j^\top\|_F}.
\]

将每个矩阵原子视为 $nm$ 维向量，就可应用引理 1：引理中的 $n$ 换为 $nm$，原子数换为 $2dm$，因子 2 同样来自正负系数。只剩计算系数总量：

\[
\begin{aligned}
\sum_{i,j}|\beta_{ij}|
&=\sum_{i,j}|W_{ji}|\|Xe_ie_j^\top\|_F\\
&=\sum_{i=1}^d\left(\sum_{j=1}^m|W_{ji}|\right)\|Xe_i\|_2\\
&\le\sqrt{\sum_{i=1}^d\left(\sum_{j=1}^m|W_{ji}|\right)^2}\|X\|_F\\
&=\|W\|_{1,2}\|X\|_F\le b\|X\|_F\eqqcolon B.
\end{aligned}
\]

这里再次使用了 Cauchy–Schwarz 不等式。应用引理 1 即完成证明。

这个界对参数个数 $dm$ 的依赖仍很弱。$(1,2)$ 混合范数是在分析过程中自然出现的。Bartlett et al. [2017] 用略有不同的方法计算 $B$，得到与 $W^\top$ 的 $(2,1)$ 混合范数有关的上界：

\[
\sum_{i,j}|\beta_{ij}|
=\sum_{j=1}^m\sum_{i=1}^d|W_{ji}|\|Xe_ie_j^\top\|_F
\le\sum_{j=1}^m\|W_{j,:}\|_2\|X\|_F
=\|W^\top\|_{2,1}\|X\|_F.
\]

因为总有 $\|W\|_{1,2}\le\|W^\top\|_{2,1}$（两边平方后使用 Cauchy–Schwarz 即可证明），这里的结果看起来比 Bartlett et al. [2017] 略有改进。

### 2.3 几乎不依赖维数的覆盖数：多层网络

下面推广到一般全连接前馈多层神经网络。先建立记号。

- 总层数为 $H$，第 $h$ 层从 $\mathbb R^{d_{h-1}}$ 映射到 $\mathbb R^{d_h}$，其中 $d_0=d$，并记 $d_{\max}=\max\{d_0,\ldots,d_H\}$。

第 $h$ 层的权重属于 $\mathcal W_h$，$b_h,s_h>0$。$\|W\|_2=\max_{x\ne0}\|Wx\|_2/\|x\|_2$ 是谱范数。

\[
\mathcal W_h=\{W\in\mathbb R^{d_h\times d_{h-1}}:\|W\|_{1,2}\le b_h,\ \|W\|_2\le s_h\}
\]


用 $\mathcal F_h$ 表示下面定义的前 $h$ 层网络类。最终关心的是 $\mathcal F=\mathcal F_H$。

\[
\mathcal F_h=\{x\mapsto\sigma(W_h\cdots\sigma(W_2\sigma(W_1x))\cdots):W_k\in\mathcal W_k,\ k\le h\}
\]

- 对 $\gamma_h\ge0$ 和 $M\in\mathbb R^{n\times d_{h-1}}$，用 $C(M,\mathcal W_h,\gamma_h)$ 表示 $\{\sigma(MW^\top):W\in\mathcal W_h\}$ 的最小 $\gamma_h/\sqrt{nd_h}$-覆盖。由定理 3，

\[
\ln|C(M,\mathcal W_h,\gamma_h)|
\le\frac{b_h^2\|M\|_F^2\ln(2d_{h-1}d_h)}{\gamma_h^2}
\le\frac{b_h^2\|M\|_F^2\ln(2d_{\max}^2)}{\gamma_h^2}.
\]

不失一般性，假设覆盖中心也属于上述被覆盖的集合；原文脚注指向 HW1 第 3(a)i 题。

> 译注：这里的 $\gamma_h/\sqrt{nd_h}$ 是**归一化**距离 $\|A-B\|_F/\sqrt{nd_h}$ 下的半径，等价于未归一化 Frobenius 半径 $\gamma_h$。原文称它“相对于 Frobenius 范数”的表述容易混淆。把外部覆盖中心移入集合一般需要半径加倍，不能无条件保持同一精确常数；后续按原文简写记录，详解给出常数修正。

递归定义

\[
S_0=\{X\},\qquad S_h=\bigcup_{M\in S_{h-1}}C(M,\mathcal W_h,\gamma_h).
\]

每个 $M_h\in S_h$ 都可写成 $\sigma(M_{h-1}W_h^\top)$，其中 $M_{h-1}\in S_{h-1}$。因为 $\sigma(0)=0$、ReLU 为 1-Lipschitz，且 $\|W_h\|_2\le s_h$，

\[
\|M_h\|_F
=\|\sigma(M_{h-1}W_h^\top)-\sigma(0)\|_F
\le\|M_{h-1}W_h^\top\|_F
\le s_h\|M_{h-1}\|_F.
\]

递归应用可得 $\|M_h\|_F\le\|X\|_F\prod_{k=1}^hs_k$，因此

\[
\ln|S_h|\le\ln|S_{h-1}|+
\frac{b_h^2\|X\|_F^2(\prod_{k<h}s_k^2)\ln(2d_{\max}^2)}{\gamma_h^2}.
\tag{1}
\]

下面证明每个 $S_h$ 确实覆盖 $\mathcal F_h|_{x_{1:n}}$，二者都是 $\mathbb R^{n\times d_h}$ 的子集。

**引理 2。** 对每个 $h=1,\ldots,H$，$S_h$ 是 $\mathcal F_h|_{x_{1:n}}$ 的 $\alpha_h/\sqrt{nd_h}$-覆盖，其中

\[
\alpha_h=\gamma_h+s_h\alpha_{h-1},\qquad\alpha_0=0.
\]

**证明。** 对 $h$ 归纳。$h=1$ 时，$S_1=C(X,\mathcal W_1,\gamma_1)$，且 $\alpha_1=\gamma_1$，由定义成立。一般地，假设结论对 $h-1$ 成立。对任意真实网络的前 $h-1$ 层输出

\[
A_{h-1}=\sigma(\cdots\sigma(\sigma(XW_1^\top)W_2^\top)\cdots W_{h-1}^\top),
\]

归纳假设保证存在 $M_{h-1}\in S_{h-1}$，使

\[
\|M_{h-1}-A_{h-1}\|_F\le\alpha_{h-1}.
\tag{2}
\]

再由 $C$ 的定义，找到 $M_h\in C(M_{h-1},\mathcal W_h,\gamma_h)\subseteq S_h$，使

\[
\|M_h-\sigma(M_{h-1}W_h^\top)\|_F\le\gamma_h.
\tag{3}
\]

令 $A_h=\sigma(A_{h-1}W_h^\top)$。合并可得

\[
\begin{aligned}
\|M_h-A_h\|_F
&\le\|M_h-\sigma(M_{h-1}W_h^\top)\|_F
+\|\sigma(M_{h-1}W_h^\top)-\sigma(A_{h-1}W_h^\top)\|_F\\
&\le\gamma_h+\|(M_{h-1}-A_{h-1})W_h^\top\|_F\\
&\le\gamma_h+\|M_{h-1}-A_{h-1}\|_F\|W_h\|_2\\
&\le\gamma_h+s_h\alpha_{h-1}=\alpha_h.
\end{aligned}
\]

各步依次使用三角不等式、式 (3) 与 ReLU 的 Lipschitz 性、谱范数性质、式 (2) 与权重约束。归纳完成。

适当设置 $\gamma_1,\ldots,\gamma_H$，便得到主要定理。

**定理 4。** 对 $H$ 层网络类 $\mathcal F=\mathcal F_H$，

\[
\ln\mathcal N(\mathcal F|_{x_{1:n}},\alpha)
\le\frac{\|X\|_F^2\ln(2d_{\max}^2)}{nd_H\alpha^2}
\left(\prod_{h=1}^Hs_h^2\right)
\left(\sum_{h=1}^H(b_h/s_h)^{2/3}\right)^3.
\]

> 译注：定理 4 的 $\mathcal N$ 在这里指沿用前文的归一化 $\ell_2$/Frobenius 覆盖数。

**证明。** 引理 2 给出

\[
\ln\mathcal N\!\left(\mathcal F|_{x_{1:n}},\frac{\alpha_H}{\sqrt{nd_H}}\right)
\le\ln|S_H|
\le\|X\|_F^2\ln(2d_{\max}^2)
\sum_{h=1}^H\frac{b_h^2\prod_{k<h}s_k^2}{\gamma_h^2}.
\]

现在在约束

\[
\alpha_H=\gamma_H+s_H\alpha_{H-1}
=\sum_{h=1}^H\gamma_h\prod_{k=h+1}^Hs_k
\]

下选择 $\gamma_h$，使该上界最小。用概率向量 $\rho\in\Delta_H$ 分配最终总误差：第 $h$ 层承担的最终误差为

\[
\alpha_H\rho_h=\gamma_h\prod_{k=h+1}^Hs_k.
\]

将 $\gamma_h=\alpha_H\rho_h/\prod_{k>h}s_k$ 代入，得到

\[
\frac{\|X\|_F^2\ln(2d_{\max}^2)}{\alpha_H^2}
\left(\prod_{h=1}^Hs_h^2\right)
\sum_{h=1}^H\frac{b_h^2}{\rho_h^2s_h^2}.
\]

只剩在 $\rho\in\Delta_H$ 下最小化最后一项。KKT 条件给出最优 $\rho_h\propto(b_h/s_h)^{2/3}$，最优值为

\[
\left(\sum_{h=1}^H(b_h/s_h)^{2/3}\right)^3.
\]

最后写成 $\alpha_H=\alpha\sqrt{nd_H}$，即得定理。

由于对 $\alpha$ 的依赖仍是 $1/\alpha^2$，与线性情形相同，利用类似 HW1 第 1(b) 题的计算可知，复杂度的主要量级为

\[
\widetilde O\!\left(
\frac{\|X\|_F}{n}\left(\prod_{h=1}^Hs_h\right)
\left(\sum_{h=1}^H(b_h/s_h)^{2/3}\right)^{3/2}
\right).
\]

除对数因子外，这再次没有显式的参数个数依赖。于是对权重 $W=(W_1,\ldots,W_H)$，定义其**谱复杂度**为

\[
R(W)=\left(\prod_{h=1}^H\|W_h\|_2\right)
\left(\sum_{h=1}^H\left(\frac{\|W_h\|_{1,2}}{\|W_h\|_2}\right)^{2/3}\right)^{3/2}.
\]

### 2.4 用谱复杂度与 margin 解释神经网络的泛化

前面的推导提示，网络的泛化与谱复杂度有关，而不仅是参数个数。下面讨论 Bartlett et al. [2017] 的实验。

![图 1：AlexNet 在原始标签或随机标签 CIFAR10 上训练的结果](/projects/csci678/lecture-4/figure-1.png)

**图 1。** 在 CIFAR10 上训练 AlexNet 的实验结果：原始标签与随机标签。

图中展示了训练轮次增加时，“excess risk”和“Lipschitzness”的变化。这里 excess risk 实际指测试误差减去训练误差，即泛化间隙，因此它通常随训练上升。原课件把 Lipschitzness 描述为与谱复杂度相差常数的量。叉号标出训练误差首次达到零的时间；原始标签时明显早于随机标签。在此之后，泛化间隙就是测试误差：原始标签下约稳定在 0.3，随机标签下约稳定在 0.9。

两种实验的参数个数相同，无法解释泛化的巨大差异；复杂度曲线则与泛化间隙相关，原始标签下明显更低，说明它提供了更有区分能力的复杂度信息。

> 译注：原论文把图中 Lipschitz 曲线解释为谱范数乘积，完整谱复杂度还带混合范数修正因子；一般不能把二者视为只差固定常数。图像原样保留，详解区分二者。

**Margin。** 更细看图，泛化间隙稳定后，复杂度仍在增长，所以仅有 $\|X\|_FR(W)/n$ 的界还不能完全解释现象。论文进一步使用 margin 衡量预测置信程度：训练误差归零后，网络的复杂度可能继续增加，但对预测也变得更有把握。

网络 $f_W$ 通过 $\arg\max_j f_W(x)_j$ 预测类别。定义样本 $(x,y)$ 的 margin 为

\[
M(f_W,x,y)=f_W(x)_y-\max_{j\ne y}f_W(x)_j.
\]

正 margin 表示预测正确，负 margin 表示预测错误；正 margin 越大，预测越有把握。结合前述结果和其他标准工具，论文证明，以高概率，对任意网络 $f_W$ 和任意 $\gamma>0$，

\[
\Pr\!\left\{\arg\max_j f_W(x)_j\ne y\right\}
\le\frac1n\sum_{t=1}^n\mathbb I\{M(f_W,x_t,y_t)<\gamma\}
+\widetilde O\!\left(\frac{\|X\|_FR(W)}{\gamma n}\right).
\tag{4}
\]

$\gamma$ 控制两项的权衡：第一项随 $\gamma$ 增大而增大，第二项随之减小。由于该界同时对所有 $\gamma$ 成立，可以选择权衡最好的值。这是分析中的选择，不是训练算法的超参数。

当训练误差为零时，可取训练集上的最小 margin，$\gamma_{\min}=\min_tM(f_W,x_t,y_t)$，得到

\[
\Pr\!\left\{\arg\max_jf_W(x)_j\ne y\right\}
\le\widetilde O\!\left(\frac{\|X\|_FR(W)}{\gamma_{\min}n}\right).
\]

即使谱复杂度继续增加，只要 margin 也相应增加，泛化误差就不一定上升。图 1 的方块曲线展示了除以 margin 后的复杂度，它确实趋于稳定。

> 译注：margin 为零时涉及平局规则，零训练误差不自动保证 $\gamma_{\min}>0$。式 (4) 是课件的主要量级简写；完整高概率界还包括置信项，原论文使用的混合范数形式也不同。若使用 $M\le\gamma$ 的端点约定，可取 $0<\gamma<\gamma_{\min}$。

**Margin 分布。** 对 margin 适当归一化并观察经验分布，可以定性比较任务难度，如图 2。每条曲线对应某个任务中训练的 AlexNet，其 margin 被 $\|X\|_FR(W)/n$ 归一化。因为式 (4) 可等价改写为

\[
\Pr\!\left\{\arg\max_jf_W(x)_j\ne y\right\}
\le\frac1n\sum_{t=1}^n\mathbb I\!\left\{
\frac{M(f_W,x_t,y_t)}{\|X\|_FR(W)/n}<\gamma\right\}
+\widetilde O(1/\gamma),
\]

所以分布的累积分布函数 CDF 对应右侧的第一项。原文这一改写公式的左侧把 $\arg\max$ 误写成了 $\max$，此处已明确更正。

![图 2：不同任务的归一化 margin 分布比较](/projects/csci678/lecture-4/figure-2.png)

**图 2。** 比较不同任务的归一化 margin 分布。

分布越偏右，对应任务在这一指标下越容易。图 2 表明：(a) MNIST 比 CIFAR10 更容易；(b) 加上随机标签后二者几乎一样难；(c) 有 100 个类别的 CIFAR100，与带随机标签的 CIFAR10 几乎一样难；(d) 随机输入比随机标签还难。

**结束语。** 我们用谱复杂度和 margin，对参数量远大于样本量的神经网络仍能泛化给出了合理解释。但我们完全没有回答：为什么在干净数据上训练的网络往往具有较低谱复杂度？训练通常不是在某个固定谱复杂度约束类内做 ERM，而是在没有显式权重范数约束的情况下运行 SGD 的变体。这属于本课程暂时忽略的非凸优化问题；理解 SGD 为什么隐式偏向低复杂度网络，是一个研究方向。

## 参考文献

- Peter L. Bartlett, Dylan J. Foster, Matus J. Telgarsky. *Spectrally-normalized margin bounds for neural networks*. Advances in Neural Information Processing Systems 30, 2017.
- Chiyuan Zhang, Samy Bengio, Moritz Hardt, Benjamin Recht, Oriol Vinyals. *Understanding deep learning requires rethinking generalization*. International Conference on Learning Representations, 2017.
