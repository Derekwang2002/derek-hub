---
title: "Lecture 2 详细讲解报告：一致收敛与 Rademacher 复杂度"
summary: "逐节展开 Lecture 2：从 ERM 的 minimax 上界到对称化、Rademacher 复杂度、Massart 引理、增长函数与 VC 维，含课件省略的辅助证明。"
---

> 根据 Haipeng Luo 的 Lecture 2（2026 年秋季，原课件 8 页）展开。沿用 Lecture 3 讲解报告的形式，覆盖定理 1、2，引理 1–4，命题 1–7，以及讲义省略的辅助证明。每一步尽量说明使用的条件和它在整体论证中的作用。
>
> 原课件：lecture2.pdf（未在线发布）。本站配套：[课件完整翻译](/zh/projects/csci678/lecture-2-full-translation)；前后衔接：[Lecture 1](/zh/projects/csci678/lecture-1-explanation)、[Lecture 3](/zh/projects/csci678/lecture-3-preview)。默认函数类非空，必要的可测性、可积性成立；涉及有界集中界时另行写出有界条件。不假设所有优化问题都能高效求解。

## 阅读导航：把难求的 minimax 值逐步变成可计算的复杂度

Lecture 1 已定义学习的目标，但
$\inf_{\text{算法}}\sup_{\text{分布}}\text{超额风险}$ 很难直接计算。本讲通过一条上界链把它转成经验过程、Rademacher 复杂度，最后转成函数数量或 VC 维。

| 步骤 | 使用的方法 | 它解决的困难 |
|---|---|---|
| 固定算法为 ERM | 最小化经验风险 | 不再优化所有可能算法 |
| 用统一偏差控制 ERM | 经验过程 | 不必直接分析训练结果的具体形式 |
| 对称化 | 引入独立副本和随机符号 | 去掉难处理的总体风险项 |
| 去掉损失函数 | 分类恒等式、Lipschitz 收缩 | 把损失类转成预测函数类 |
| 有限类最大值不等式 | 次高斯、Massart | 用函数数量的对数控制复杂度 |
| 无限二分类类投影 | 增长函数 | 无限个函数在有限样本上只有有限种行为 |
| Sauer 引理 | VC 维 | 用一个组合参数控制所有样本量的增长函数 |
| 无免费午餐反证 | 无限 VC 维 ⇒ 恒定下界 | 证明条件不仅充分，而且必要 |

本讲最终“闭环”的是二分类可学习性条件；并没有证明每个中间上界都在精确常数、对数因子或任意损失问题上最优。

## 1. 起点：ERM 为什么给出 minimax 上界

### 1.1 风险和博弈值

令 $S=(z_1,\ldots,z_n)\overset{\rm iid}{\sim}P^n$，定义

\[
L_P(f)=\mathbb E_{z\sim P}\ell(f,z),\qquad
\widehat L_S(f)=\frac1n\sum_{t=1}^n\ell(f,z_t).
\tag{1}
\]

学习的博弈值为

\[
\mathcal V^{\rm iid}(\mathcal F,n)
=\inf_A\sup_P\left[
\mathbb E_SL_P(A(S))-\inf_{f\in\mathcal F}L_P(f)\right],
\tag{2}
\]
算法可能有内部随机性，期望默认也包括它。

ERM 选择

\[
\widehat f_{\rm ERM}\in\arg\min_{f\in\mathcal F}\widehat L_S(f).
\tag{3}
\]

因为对所有算法取 infimum 不大于任意一个具体算法的最坏误差，

\[
\mathcal V^{\rm iid}(\mathcal F,n)
\le\sup_P\left[
\mathbb E L_P(\widehat f_{\rm ERM})-\inf_fL_P(f)\right].
\tag{4}
\]

这只是上界，不是声称一开始已经知道 ERM 最优。分析成功后才能说明 ERM 足以实现相应可学习性。

### 1.2 最小值不取到怎么办

即使 argmin 不存在，也可选择近似 ERM：

\[
\widehat L_S(\widetilde f)
\le\inf_f\widehat L_S(f)+\xi_n.
\tag{5}
\]
后文风险界只需加 $\mathbb E\xi_n$。总体风险最优值不取到时，则用固定的 $\eta$-最优函数比较，最后让 $\eta\downarrow0$。因此存在性简写通常不会改变统计结论，但“可选择可测算法”仍是需要满足的技术条件。

### 1.3 正则化与约束类：补全论证并说明限制

设 $f_\lambda$ 最小化

\[
\widehat L_S(f)+\lambda\Psi(f),\qquad\lambda>0.
\tag{6}
\]
令 $c=\Psi(f_\lambda)$。若有 $g$ 满足 $\Psi(g)\le c$ 且
$\widehat L_S(g)<\widehat L_S(f_\lambda)$，那么

\[
\widehat L_S(g)+\lambda\Psi(g)
<\widehat L_S(f_\lambda)+\lambda\Psi(f_\lambda),
\]
矛盾。所以 $f_\lambda$ 也是约束类 $\{f:\Psi(f)\le c\}$ 上的 ERM。

这证明了“给定惩罚最优解，可以找到一个约束半径解释它”。但这里 $c$ 可能依赖数据；反向“每个约束最优解都由某个惩罚参数得到”一般需要凸性、对偶性等条件。如果要对一个固定受限类应用后文泛化界，不能在观察数据后随意选 $c$ 却忽略选择成本或统一控制。

## 2. 经验过程：单个函数的收敛为什么不够

### 2.1 ERM 到单侧统一偏差的完整推导

先假设 $f^*\in\arg\min_fL_P(f)$。它可依赖 $P$，但不依赖当前样本。于是

\[
\begin{aligned}
\mathbb EL_P(\widehat f_{\rm ERM})-L_P(f^*)
&=\mathbb E[L_P(\widehat f_{\rm ERM})-\widehat L_S(f^*)]\\
&\le\mathbb E[L_P(\widehat f_{\rm ERM})-\widehat L_S(\widehat f_{\rm ERM})]\\
&\le\mathbb E\sup_{f\in\mathcal F}[L_P(f)-\widehat L_S(f)].
\end{aligned}
\tag{7}
\]

第一个等号使用无偏性 $\mathbb E\widehat L_S(f^*)=L_P(f^*)$；第二步使用 ERM 的经验最优性，减去更小的经验损失使差值更大；第三步把数据选出的一个函数放宽到整个类。

因此

\[
\mathcal V^{\rm iid}(\mathcal F,n)
\le\sup_P\mathbb E\sup_f[L_P(f)-\widehat L_S(f)].
\tag{8}
\]

这里没有额外的 2，因为只在期望中处理固定比较器的误差。常见的逐样本绝对偏差界
$L(\widehat f)-L(f^*)\le2\sup_f|L(f)-\widehat L(f)|$
是另一条推导，不能把其常数任意混入 (7)。

### 2.2 经验过程是一整族随机变量

对每个固定 $f$，令

\[
X_f(S)=L_P(f)-\widehat L_S(f).
\tag{9}
\]
它均值为零。假设损失可积，大数定律说明对固定 $f$，
$X_f(S)\to0$。但算法根据样本选择函数，所以需要同时控制整族的最大偏差。

课件采用的期望单侧统一收敛条件是

\[
\limsup_{n\to\infty}\sup_P\mathbb E_S\sup_{f\in\mathcal F}X_f(S)=0.
\tag{10}
\]

“对每个固定 $f$ 收敛”与“supremum 收敛”不能交换顺序；“对每个固定 $P$”和“对所有 $P$ 统一”也不能混淆。常见教材还有概率意义、双侧绝对偏差形式的统一收敛定义，阅读时要看清当前使用哪一种。

### 2.3 补充反例：每个固定函数都收敛，样本最优却严重过拟合

令输入在 $[0,1]$ 上均匀分布，真实标签恒为 $+1$。取函数类包含所有这样的函数：在某个有限集合上预测 $+1$，在其余位置预测 $-1$。

任意固定函数只在有限个输入上正确；这些点的概率为零，所以总体 0–1 风险为 1。对任意固定函数，经验风险也几乎必然趋于 1。

但给定当前训练输入集，类中有函数在所有训练点上预测 $+1$，因此训练损失为零、总体风险仍为 1：

\[
\sup_{f\in\mathcal F}[L_P(f)-\widehat L_S(f)]=1.
\tag{11}
\]

这个例子专门说明逐点收敛不蕴含统一收敛。由于该特定类的最佳总体风险也为 1，它本身不能作为“ERM 超额风险为 1”的例子；若想同时得到那个结论，可再把恒 $+1$ 函数加入类，并让 ERM 的平局规则选取上述记忆函数。

## 3. Rademacher 复杂度：只测量类迎合随机符号的能力

对函数类 $\mathcal H\subseteq\mathbb R^{\mathcal Z}$，固定样本位置，定义

\[
\widehat{\mathcal R}_S(\mathcal H)
=\frac1n\mathbb E_{\epsilon_{1:n}}
\sup_{h\in\mathcal H}\sum_{t=1}^n\epsilon_th(z_t),
\quad
\Pr(\epsilon_t=\pm1)=1/2,
\tag{12}
\]
其中符号彼此独立。非条件版本为

\[
\mathcal R_{P,n}(\mathcal H)
=\mathbb E_{S\sim P^n}\widehat{\mathcal R}_S(\mathcal H).
\tag{13}
\]

期望外面的 supremum 可以在看过随机符号后选择函数，所以这个量不是“某个固定模型和噪声的相关性”。

三个直接可验证的性质：

- 非空单函数类复杂度为零，因为每个 $\epsilon_t$ 均值为零。
- 若在不同样本点能任意取 $\pm1$，则可选 $h(z_t)=\epsilon_t$，复杂度为 1。
- 在每个坐标加一个与 $h$ 无关的常数 $c_t$，复杂度不变，因为新增项 $\mathbb E\sum_t\epsilon_tc_t=0$。

本讲定义没有在 supremum 内加绝对值。若改为
$\mathbb E\sup_h|\sum_t\epsilon_th(z_t)|/n$，单函数类一般不再为零，相应引理的形式和常数也需重核。

## 4. 定理 1：对称化完整证明

### 4.1 定义损失类

把预测器转成样本空间上的函数：

\[
\ell(\mathcal F)=\{h_f:h_f(z)=\ell(f,z),\ f\in\mathcal F\}.
\tag{14}
\]

要证明

\[
\boxed{\mathbb E_S\sup_f[L_P(f)-\widehat L_S(f)]
\le2\mathcal R_{P,n}(\ell(\mathcal F)).}
\tag{15}
\]

### 4.2 引入幽灵样本

令 $S'=(z'_1,\ldots,z'_n)$ 为独立的 $P^n$ 样本。由于
$L_P(f)=\mathbb E_{S'}n^{-1}\sum_t\ell(f,z'_t)$，

\[
\begin{aligned}
\mathbb E_S\sup_f[L_P(f)-\widehat L_S(f)]
&=\frac1n\mathbb E_S\sup_f\mathbb E_{S'}
\sum_t[\ell(f,z'_t)-\ell(f,z_t)]\\
&\le\frac1n\mathbb E_{S,S'}\sup_f
\sum_t[\ell(f,z'_t)-\ell(f,z_t)].
\end{aligned}
\tag{16}
\]

为何不等号是这个方向？对每个 $f$，其随机值不超过所有函数的 supremum，取期望后仍成立，再对 $f$ 取 supremum，所以
$\sup_f\mathbb E X_f\le\mathbb E\sup_fX_f$。

### 4.3 随机符号为何能凭空出现

固定任意符号序列。当 $\epsilon_t=-1$ 时交换 $(z_t,z'_t)$，当它为 $+1$ 时不交换。每对样本的联合分布都是 $P\times P$，交换不改变它；各对之间仍然独立。因此

\[
\mathbb E_{S,S'}\sup_f\sum_t[\ell(f,z'_t)-\ell(f,z_t)]
=\mathbb E_{S,S',\epsilon}\sup_f
\sum_t\epsilon_t[\ell(f,z'_t)-\ell(f,z_t)].
\tag{17}
\]

这不是对一份固定样本就成立的数值等式，而是对随机样本取期望后的分布等价。

### 4.4 拆分 supremum，得到因子 2

\[
\begin{aligned}
\frac1n\mathbb E\sup_f\sum_t\epsilon_t[\ell(f,z'_t)-\ell(f,z_t)]
&\le\frac1n\mathbb E\sup_f\sum_t\epsilon_t\ell(f,z'_t)\\
&\quad+\frac1n\mathbb E\sup_f\sum_t(-\epsilon_t)\ell(f,z_t)\\
&=2\mathcal R_{P,n}(\ell(\mathcal F)).
\end{aligned}
\tag{18}
\]

两项相同，因为 $S,S'$ 同分布、$-\epsilon$ 与 $\epsilon$ 同分布。结合 (16)–(18) 就证明定理 1。

得到的复杂度只依赖函数在样本上的值，不再单独含总体项 $L_P(f)$。这是后面能够把无限类替换为有限投影的关键。

## 5. 引理 1：二分类 0–1 损失为何恰好乘以 $1/2$

当 $y,f(x)\in\{-1,+1\}$，有恒等式

\[
\mathbf1\{f(x)\ne y\}=\frac{1-yf(x)}2.
\tag{19}
\]

因为同号时 $yf(x)=1$，异号时为 $-1$，分别得到损失 0 与 1。固定有标签样本后，

\[
\begin{aligned}
\widehat{\mathcal R}_S(\ell(\mathcal F))
&=\frac1n\mathbb E_\epsilon\sup_f
\sum_t\epsilon_t\frac{1-y_tf(x_t)}2\\
&=\frac1{2n}\mathbb E\sum_t\epsilon_t
+\frac1{2n}\mathbb E\sup_f\sum_t(-\epsilon_ty_t)f(x_t)\\
&=\frac12\widehat{\mathcal R}_{x_{1:n}}(\mathcal F).
\end{aligned}
\tag{20}
\]

第一项为零。因为 $y_t$ 已固定、为 $\pm1$，符号
$-\epsilon_ty_t$ 仍然独立、等概率取 $\pm1$。于是再对样本取期望：

\[
\mathcal R_{P,n}(\ell(\mathcal F))
=\tfrac12\mathcal R_{P_X,n}(\mathcal F).
\tag{21}
\]

右侧实际只依赖输入边缘分布 $P_X$。课件简写相同的 $\mathcal R^{\rm iid}$，这里把分布标清楚以免误会。

## 6. 引理 2：Lipschitz 收缩的逐坐标证明

### 6.1 条件与目标

假设 $\ell(f,(x,y))=\widetilde\ell(f(x),y)$，且对于所有允许的预测值、标签，

\[
|\widetilde\ell(u,y)-\widetilde\ell(v,y)|\le G|u-v|.
\tag{22}
\]

要证明

\[
\widehat{\mathcal R}_S(\ell(\mathcal F))
\le G\widehat{\mathcal R}_{x_{1:n}}(\mathcal F).
\tag{23}
\]

### 6.2 先只替换最后一个坐标

固定 $\epsilon_1,\ldots,\epsilon_{n-1}$，记

\[
A_f=\sum_{t=1}^{n-1}\epsilon_t\widetilde\ell(f(x_t),y_t),
\qquad \phi(u)=\widetilde\ell(u,y_n).
\tag{24}
\]

对最后一个符号的两个可能值取平均：

\[
\begin{aligned}
\mathbb E_{\epsilon_n}\sup_f[A_f+\epsilon_n\phi(f(x_n))]
&=\frac12\sup_f[A_f+\phi(f(x_n))]
+\frac12\sup_g[A_g-\phi(g(x_n))]\\
&=\frac12\sup_{f,g}[A_f+A_g+\phi(f(x_n))-\phi(g(x_n))]\\
&\le\frac12\sup_{f,g}[A_f+A_g+G|f(x_n)-g(x_n)|].
\end{aligned}
\tag{25}
\]

第二步用两个可以独立选择的 supremum 相加等于对有序对取 supremum。若最优值不取到，可选任意接近最优的两个函数再令误差趋零。

### 6.3 为什么可以去掉绝对值

$A_f+A_g$ 在交换 $f,g$ 时不变，而
$f(x_n)-g(x_n)$ 改变符号。因此每个绝对值为正的差，都能通过交换顺序成为不带绝对值的正差：

\[
\sup_{f,g}[A_f+A_g+G|f(x_n)-g(x_n)|]
=\sup_{f,g}[A_f+A_g+G(f(x_n)-g(x_n))].
\tag{26}
\]

重新把 supremum 拆回去：

\[
\begin{aligned}
\frac12\sup_{f,g}[A_f+A_g+Gf(x_n)-Gg(x_n)]
&=\frac12\sup_f[A_f+Gf(x_n)]
+\frac12\sup_g[A_g-Gg(x_n)]\\
&=\mathbb E_{\epsilon_n}\sup_f[A_f+\epsilon_nGf(x_n)].
\end{aligned}
\tag{27}
\]

于是最后坐标的非线性损失被 $Gf(x_n)$ 替换，复杂度不会变小。再对前面符号取期望，依次替换第 $n-1,\ldots,1$ 个坐标，得到

\[
\mathbb E\sup_f\sum_t\epsilon_t\widetilde\ell(f(x_t),y_t)
\le\mathbb E\sup_f\sum_t\epsilon_tGf(x_t).
\tag{28}
\]
除以 $n$ 即为 (23)。证明不要求 $\mathcal F$ 关于取负封闭，也没有要求 $\widetilde\ell(0,y)=0$，因为这里使用的是无绝对值的复杂度定义。

原课件第 4 页将两个 supremum 合并后，部分显示公式在 $g$ 项前多印了一个 $\epsilon_t$。正确项是
$\sum_{t<n}\epsilon_t[\widetilde\ell(f(x_t),y_t)+\widetilde\ell(g(x_t),y_t)]$，本文用 $A_f+A_g$ 写法避免重复符号。

### 6.4 平方损失的常数为什么是 2

课件这里用的是半平方损失
$\widetilde\ell(u,y)=\tfrac12(u-y)^2$。对 $u,v,y\in[-1,1]$：

\[
\begin{aligned}
|\widetilde\ell(u,y)-\widetilde\ell(v,y)|
&=\tfrac12|(u-v)(u+v-2y)|\\
&\le\tfrac12|u-v|(1+1+2)
=2|u-v|.
\end{aligned}
\tag{29}
\]

所以 $G=2$。若损失没有前面的 $1/2$，则 $G=4$；若预测和标签可取任意实数，就没有这个全局常数。Lecture 1 的平方损失和本讲的半平方损失不能在常数上混用。

至此，分类取 $G=1/2$，回归取合法 Lipschitz 常数，有

\[
\mathcal V^{\rm iid}(\mathcal F,n)
\le2G\sup_{P_X}\mathcal R_{P_X,n}(\mathcal F).
\tag{30}
\]

## 7. 次高斯变量与课件未证明的 Hoeffding 引理

### 7.1 次高斯不是要求随机变量真的服从高斯分布

零均值随机变量 $U$ 若满足

\[
\mathbb E e^{\lambda U}\le e^{\sigma^2\lambda^2/2}
\quad\text{对所有 }\lambda\in\mathbb R,
\tag{31}
\]
就称为 $\sigma$-次高斯。这里 $\sigma^2$ 是指数矩的方差代理，不一定等于实际方差。

指数矩控制能转成尾概率控制：对 $\lambda>0$，Markov 不等式给出

\[
\Pr(U\ge t)\le e^{-\lambda t}\mathbb E e^{\lambda U}
\le e^{-\lambda t+\sigma^2\lambda^2/2}.
\tag{32}
\]
当 $\sigma>0,t>0$ 时取 $\lambda=t/\sigma^2$，得
$\Pr(U\ge t)\le e^{-t^2/(2\sigma^2)}$。这解释了“次高斯”表示类似高斯的尾部衰减，而不要求密度形状相同。

### 7.2 Hoeffding 引理的完整证明

若 $\mathbb EU=0$，且 $U\in[a,b]$，要证明

\[
\mathbb E e^{\lambda U}
\le \exp\left(\frac{\lambda^2(b-a)^2}{8}\right),
\tag{33}
\]
即 $U$ 是 $(b-a)/2$-次高斯。

令 $K(\lambda)=\log\mathbb E e^{\lambda U}$。因 $U$ 有界，可对期望求导。定义指数倾斜后的期望

\[
\mathbb E_\lambda[g(U)]
=\frac{\mathbb E[g(U)e^{\lambda U}]}{\mathbb E e^{\lambda U}}.
\tag{34}
\]
直接对 $K$ 求两次导数：

\[
K'(\lambda)=\mathbb E_\lambda U,\qquad
K''(\lambda)=\mathbb E_\lambda U^2-(\mathbb E_\lambda U)^2
=\operatorname{Var}_\lambda(U).
\tag{35}
\]

任意支持在 $[a,b]$ 的变量，均值为 $\mu$ 时，由
$(U-a)(b-U)\ge0$ 得
$\mathbb EU^2\le(a+b)\mu-ab$，从而

\[
\operatorname{Var}(U)
\le(b-\mu)(\mu-a)
\le\frac{(b-a)^2}{4}.
\tag{36}
\]
最后一步是固定和的两个非负数乘积在相等时最大，或直接配方。

倾斜分布仍支持在 $[a,b]$，所以 $K''(\lambda)$ 也满足 (36)。又
$K(0)=0,K'(0)=\mathbb EU=0$，积分余项形式的 Taylor 公式给出

\[
K(\lambda)=\lambda^2\int_0^1(1-s)K''(s\lambda)\,ds
\le\frac{\lambda^2(b-a)^2}{8}.
\tag{37}
\]
这个形式同时适用于正、负 $\lambda$。指数化即 (33)。若 $a=b$，零均值意味着 $U=0$，结论直接成立。

## 8. 引理 3：最大值不等式为何只依赖 $\ln M$

设 $U_1,\ldots,U_M$ 都是 $\sigma$-次高斯变量，不要求彼此独立。对任意 $\lambda>0$：

\[
\begin{aligned}
\exp(\lambda\mathbb E\max_iU_i)
&\le\mathbb E\exp(\lambda\max_iU_i)\\
&=\mathbb E\max_i e^{\lambda U_i}\\
&\le\sum_i\mathbb E e^{\lambda U_i}\\
&\le M e^{\sigma^2\lambda^2/2}.
\end{aligned}
\tag{38}
\]

第一步是凸函数指数的 Jensen 不等式；第三步是非负数最大值不超过和。取对数除以 $\lambda$：

\[
\mathbb E\max_iU_i\le\frac{\ln M}{\lambda}+\frac{\sigma^2\lambda}{2}.
\tag{39}
\]

当 $M>1,\sigma>0$，对右侧求导，令
$-\ln M/\lambda^2+\sigma^2/2=0$，得到
$\lambda_*=\sqrt{2\ln M}/\sigma$。代入可得

\[
\boxed{\mathbb E\max_iU_i\le\sigma\sqrt{2\ln M}.}
\tag{40}
\]

$M=1$ 时左侧为零；$\sigma=0$ 时变量退化为零，也不需要上述除法。所有 $U_i$ 可以高度相关，因为证明只分别控制了每个指数矩，从未分解不同 $i$ 的联合分布。

## 9. 定理 2：Massart 引理与有限类学习

### 9.1 每个函数对应一个随机符号和

固定输入 $x_{1:n}$，对有限类 $\mathcal F$ 定义

\[
U_f=\sum_{t=1}^n\epsilon_tf(x_t),\qquad
\sigma=\max_{f\in\mathcal F}\sqrt{\sum_{t=1}^nf(x_t)^2}.
\tag{41}
\]

对固定 $f$，各项独立、均值零。每项落在
$[-|f(x_t)|,|f(x_t)|]$，由 Hoeffding 引理是 $|f(x_t)|$-次高斯。因此

\[
\begin{aligned}
\mathbb E e^{\lambda U_f}
&=\prod_{t=1}^n\mathbb E e^{\lambda\epsilon_tf(x_t)}\\
&\le\prod_t e^{\lambda^2f(x_t)^2/2}\\
&=e^{\lambda^2\sum_tf(x_t)^2/2}
\le e^{\lambda^2\sigma^2/2}.
\end{aligned}
\tag{42}
\]

第一步才是真正需要独立性的地方：是不同样本位置的随机符号独立，而不是不同 $f$ 对应的 $U_f$ 独立。

### 9.2 应用最大值引理并除以样本量

由 (40)：

\[
\boxed{
\widehat{\mathcal R}_{x_{1:n}}(\mathcal F)
\le\frac1n
\sqrt{2\left(\max_f\sum_tf(x_t)^2\right)\ln|\mathcal F|}.
}
\tag{43}
\]

若 $|f(x)|\le C$，则 $\max_f\sum_tf(x_t)^2\le nC^2$，所以

\[
\mathcal R_{P_X,n}(\mathcal F)
\le C\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\tag{44}
\]

结合 (30)：

\[
\mathcal V^{\rm iid}(\mathcal F,n)
\le2GC\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\tag{45}
\]

固定有限类且 $G,C$ 有限时，右侧趋零。若希望上界不超过 $\varepsilon$，一个充分条件是

\[
n\ge \frac{8G^2C^2\ln|\mathcal F|}{\varepsilon^2}.
\tag{46}
\]

这是该方法给出的保证，不能仅凭上界叫它“所有有限类的精确最优速率”。例如单函数类的超额风险本来就是零，可实现分类还能得到不同的速率。

### 9.3 为何不直接对经验过程用最大值不等式

对固定有限类及有界损失 $\ell(f,z)\in[a,b]$，令 $B=b-a$，每个
$X_f=L_P(f)-\widehat L_S(f)$ 是 $B/(2\sqrt n)$-次高斯。证明：每个中心化项
$L_P(f)-\ell(f,z_t)$ 均值零、区间长度为 $B$，独立求和再除以 $n$，指数矩参数平方变成 $n(B/2)^2/n^2$。

最大值引理直接给出

\[
\mathbb E\max_fX_f
\le\frac B{2\sqrt n}\sqrt{2\ln|\mathcal F|}.
\tag{47}
\]

所以有限类确实可跳过对称化得到保证。然而无限类里，$L_P(f)$ 不只由样本上预测值决定，不能仅凭有限投影把经验过程等价压缩。对称化的价值在于它为无限类提供了统一处理方式。

## 10. 无限二分类类：增长函数从哪里来

### 10.1 样本投影把“函数无限”转成“行为有限”

对 $\mathcal F\subseteq\{-1,+1\}^{\mathcal X}$，定义

\[
F_S=\mathcal F|_{x_{1:n}}
=\{(f(x_1),\ldots,f(x_n)):f\in\mathcal F\}
\subseteq\{-1,+1\}^n.
\tag{48}
\]

尽管 $\mathcal F$ 可能不可数，$|F_S|\le2^n$。而

\[
\widehat{\mathcal R}_{x_{1:n}}(\mathcal F)
=\frac1n\mathbb E_\epsilon
\max_{v\in F_S}\sum_t\epsilon_tv_t.
\tag{49}
\]

这个等式成立是因为目标只读取 $f(x_t)$；具有相同投影的函数贡献完全相同。

增长函数定义为所有样本位置上的最大行为数量：

\[
\Pi_{\mathcal F}(n)=\max_{x_{1:n}}|F_S|.
\tag{50}
\]

由于可能数量是有限整数，最大值可用实际达到的最大整数理解。重复输入只能减少独立标记自由度；计算最坏增长函数时通常选不同输入。

### 10.2 复杂度界及平凡界的失败

每个投影向量的平方范数为 $n$，Massart 引理给出

\[
\widehat{\mathcal R}_S(\mathcal F)
\le\sqrt{\frac{2\ln|F_S|}{n}}
\le\sqrt{\frac{2\ln\Pi_{\mathcal F}(n)}{n}}.
\tag{51}
\]

二分类中的 $2G=1$，因此

\[
\mathcal V^{\rm iid}(\mathcal F,n)
\le\sqrt{\frac{2\ln\Pi_{\mathcal F}(n)}{n}}.
\tag{52}
\]

若只代入 $2^n$，得到常数 $\sqrt{2\ln2}$，不能证明趋零；还可以用复杂度平凡界 1 使常数稍好，但仍不趋零。若增长函数只有 $n^d$ 级别，取对数则为 $d\ln n$，除以 $n$ 后可以趋零。

### 10.3 为什么总体风险不能直接压缩到投影

两个函数可以在训练点全部相同，却在训练集之外大量不同。它们的经验风险相同，总体风险可能不同，所以
$L_P(f)-\widehat L_S(f)$ 不能只由投影向量恢复。

对称化将总体均值换为样本差，再通过随机符号分拆，才获得只依赖有限投影的量。这个步骤解释了整条上界链的设计目的。

## 11. 命题 1、2：阈值和区间的精确增长函数

### 11.1 单阈值类为何恰有 $n+1$ 种标记

课件定义

\[
f_\theta(x)=
\begin{cases}
+1,&x\le\theta,\\
-1,&x>\theta.
\end{cases}
\tag{53}
\]

排序不同样本 $x_1<\cdots<x_n$。正标签只能形成左侧前缀：前 $k$ 个为 $+1$，其余为 $-1$，其中 $k=0,\ldots,n$。

每个 $k$ 都能实现：$k=0$ 取 $\theta<x_1$，$k=n$ 取 $\theta\ge x_n$，其他 $k$ 取 $x_k\le\theta<x_{k+1}$。因此

\[
\Pi_{\rm threshold}(n)=n+1,\qquad
\mathcal V^{\rm iid}\le\sqrt{2\ln(n+1)/n}.
\tag{54}
\]

上界与下界同时得到，才是“精确增长函数”的证明；不能只列举一部分可实现模式便断言恰好。

### 11.2 区间类为何是 $\binom{n+1}{2}+1$

区间内预测 $+1$，区间外预测 $-1$：

\[
f_{\theta_1,\theta_2}(x)
=
\begin{cases}
+1,&\theta_1\le x\le\theta_2,\\
-1,&\text{其他},
\end{cases}
\quad\theta_1\le\theta_2.
\tag{55}
\]

非空正标签必须是一个连续块 $x_i,\ldots,x_j$，其中
$1\le i\le j\le n$。块长度与位置的总数为

\[
\sum_{i=1}^n(n-i+1)=\frac{n(n+1)}2=\binom{n+1}{2}.
\tag{56}
\]

每个连续块都可用区间实现，再加上区间落在所有样本之外实现的全负标签，得到

\[
\Pi_{\rm interval}(n)=\binom{n+1}{2}+1.
\tag{57}
\]

于是 (52) 给出 $O(\sqrt{\ln(n+1)/n})$。也可以从 $n+1$ 个样本间隙中挑两个端点所在间隙来计数，但“正标签是一个连续块”更直接解释了为什么不会重复或遗漏。

## 12. VC 维的定义与命题 3–5 的完整证明

### 12.1 “打散”中的量词

一组 $m$ 个输入被打散，意味着所有 $2^m$ 个标签向量都可由类中函数实现：

\[
\exists x_1,\ldots,x_m,\quad
\forall s\in\{-1,+1\}^m,\quad
\exists f\in\mathcal F,\quad f(x_i)=s_i.
\tag{58}
\]

VC 维为可打散点集大小的上确界：

\[
\operatorname{VCdim}(\mathcal F)
=\sup\{m:\Pi_{\mathcal F}(m)=2^m\}.
\tag{59}
\]

证明 VC 维等于 $d$，要做两件不同的事：构造**一组**大小 $d$ 的可打散点集；证明**任意一组**大小 $d+1$ 的点都不能被打散。只证明某一组 $d+1$ 个点失败不够。

若一个大集合被打散，其任意子集也被打散：对该子集上的任意标签，给剩余点任意补标签，再用大集合的实现函数即可。因此有限维 $d$ 的类对于 $m\le d$ 都有 $\Pi(m)=2^m$。

### 12.2 命题 3：VC 维为 0 当且仅当非空类只有一个函数

若类只有一个函数，任何单点最多只有一个标签，自然不能打散。反过来，若含两个不同函数 $f,g$，则存在 $x$ 使 $f(x)\ne g(x)$。二分类的两种标签就在这个点上都能实现，所以至少能打散一个点，VC 维至少为 1。

这里函数按实际映射区分，不是按不同参数写法区分；重复参数化同一个函数不增加类的 VC 维。还需保留“非空类”条件，否则空类是原陈述的边界例外。

### 12.3 命题 4：阈值类 VC 维是 1

任意单点 $x$，将阈值放左侧或右侧可得到两种标签，所以下界为 1。任意两个不同点 $x_1<x_2$，标签 $(-1,+1)$ 不可能实现：若右点在阈值左侧，左点也一定在阈值左侧。因此上界为 1。

### 12.4 命题 5：区间类 VC 维是 2

对任意 $x_1<x_2$，四种标签均可实现：区间同时覆盖二者、只覆盖第一点、只覆盖第二点、或不覆盖任何一个，所以下界为 2。

对任意三个不同点 $x_1<x_2<x_3$，标签 $(+1,-1,+1)$ 不可实现，因为一个区间若包含两端，必须包含中间点。因此上界为 2。

这些例子显示 VC 维衡量的是可独立控制标签的点数，而不只是有多少种函数。

## 13. 命题 6：仿射线性分类器的 VC 维为输入维数加一

为避免与 VC 维符号混淆，这里用 $p$ 表示输入空间维数。考虑

\[
\mathcal F_{\rm lin}
=\{x\mapsto\operatorname{sign}(\langle\theta,x\rangle+b):
\theta\in\mathbb R^p,\ b\in\mathbb R\},
\tag{60}
\]
并按课件约定 $\operatorname{sign}(u)=+1$ 当 $u\ge0$，否则为 $-1$。

### 13.1 显式构造下界 $p+1$

取 $p+1$ 个点 $x_0=0,x_i=e_i\ (i=1,\ldots,p)$。对任意标签
$s_0,\ldots,s_p\in\{-1,+1\}$，令

\[
b=s_0,\qquad\theta_i=s_i-s_0.
\tag{61}
\]
于是
$\langle\theta,x_0\rangle+b=s_0$，
$\langle\theta,e_i\rangle+b=s_i$。所有标签均被严格实现，因此

\[
\operatorname{VCdim}(\mathcal F_{\rm lin})\ge p+1.
\tag{62}
\]

这说明的不是“任意 $p+1$ 个点都能打散”，而是存在这组仿射独立点能打散。共线等退化配置可能做不到。

### 13.2 用仿射依赖证明任何 $p+2$ 个点都失败

任取 $p+2$ 个点，把它们增广成
$\widetilde x_i=(x_i,1)\in\mathbb R^{p+1}$。线性相关性保证存在不全为零的 $a_i$，使

\[
\sum_i a_ix_i=0,\qquad\sum_i a_i=0.
\tag{63}
\]

因为系数和为零，非零系数中既有正数又有负数。给正系数点标 $+1$，给负系数点标 $-1$，零系数点任意。若由某个 $(\theta,b)$ 实现，则

\[
a_i(\langle\theta,x_i\rangle+b)\ge0
\quad(a_i>0),
\]
而当 $a_i<0$ 时，负标签要求分数严格小于零，乘负系数后严格大于零。至少有一个负系数，所以

\[
0<
\sum_i a_i(\langle\theta,x_i\rangle+b)
=\left\langle\theta,\sum_i a_ix_i\right\rangle
+b\sum_i a_i=0,
\tag{64}
\]
矛盾。因此任何 $p+2$ 个点都不能打散，结合下界：

\[
\boxed{\operatorname{VCdim}(\mathcal F_{\rm lin})=p+1.}
\tag{65}
\]

这个证明保留了符号函数在零点的约定，不需要把“边界上的点”含糊带过。若没有偏置 $b$，则是另一个函数类，不能直接套用 $p+1$。

### 13.3 二维四点问题的直观和精确答案

二维时三个不共线点可以打散。四个点若组成凸四边形，沿边界交替标记 $+,-,+,-$，两组同标签点的连线相交，无法被一条直线分开。若一个点在其余三点的凸包中，把内部点与外部三点标相反标签也不能线性分开；退化情况已被 (63)–(64) 的一般论证覆盖。

课件问 $\Pi(4)$ 究竟是多少。补充答案是 14：

- 凸四边形上，全正、全负有 2 种；
- 只正一个或只负一个有 $4+4=8$ 种；
- 相邻两点为正有 4 种；
- 只有两种交替标签不能实现。

共 14 种。为什么其他四点配置不会超过 14？任何配置都至少有一种不可实现标签；在线性分类器的有限样本上，可实现标签对取反封闭。理由是先把偏置轻微上移，使所有原正点严格正、原负点仍严格负，再同时取反 $\theta,b$ 即实现互补标签。因此不可实现标签也成对出现，最多 14 种。这是课件提问的补充证明，不是后续学习界所必需的精确计算。

## 14. 命题 7：一个参数的正弦类为何 VC 维无限

### 14.1 不能只说“频率高，所以复杂”

考虑

\[
\mathcal F_{\sin}=\{x\mapsto\operatorname{sign}(\sin(\theta x)):
\theta\in\mathbb R\}.
\tag{66}
\]

振荡次数可以很大只是直觉。要证明无限 VC 维，必须对任意 $m$ 先固定一组 $m$ 个输入，再用参数实现它们的全部 $2^m$ 种标签，不能每个标签都换一组输入。

### 14.2 用二进制位给出显式构造

固定 $m\ge1$，选择

\[
x_i=2^{i-1-m},\qquad i=1,\ldots,m.
\tag{67}
\]
这些点互不相同，且全部在 $(0,1/2]$。对任意希望的标签 $s_i$，定义比特
$b_i=0$ 当 $s_i=+1$，$b_i=1$ 当 $s_i=-1$。令

\[
t=\sum_{j=1}^m b_j2^{-j}+2^{-(m+2)},
\qquad
\theta=2\pi\,2^m t.
\tag{68}
\]

于是

\[
\frac{\theta x_i}{2\pi}=2^{i-1}t.
\tag{69}
\]

将 (68) 乘以 $2^{i-1}$，前 $i-1$ 个二进制位形成整数部分，小数部分为

\[
u_i=\frac{b_i}{2}
+\sum_{j=i+1}^m b_j2^{i-1-j}
+2^{i-m-3}.
\tag{70}
\]

若 $b_i=0$，尾项严格为正，而

\[
\sum_{j=i+1}^m2^{i-1-j}+2^{i-m-3}
=\frac12-2^{i-m-1}+2^{i-m-3}<\frac12.
\]
因此 $0<u_i<1/2$。若 $b_i=1$，则 $1/2<u_i<1$。额外的
$2^{-(m+2)}$ 尾项保证没有任何输入恰好落在正弦为零的边界。

由于正弦每周期前半段为正、后半段为负，

\[
\operatorname{sign}(\sin(\theta x_i))
=\operatorname{sign}(\sin(2\pi u_i))
=
\begin{cases}
+1,&b_i=0,\\
-1,&b_i=1,
\end{cases}
=s_i.
\tag{71}
\]

任意标签都能实现，因此任意 $m$ 都有一组可打散输入：

\[
\boxed{\operatorname{VCdim}(\mathcal F_{\sin})=\infty.}
\tag{72}
\]

构造只有一个实参数 $\theta$，却利用了它任意精细的取值和越来越高的频率。参数个数可以帮助猜测简单类的 VC 维，但不是普遍定理。

### 14.3 一个可手算的三点例子

取 $m=3$，输入 $(1/8,1/4,1/2)$，希望标签 $(+1,-1,+1)$，因此比特为 $(0,1,0)$。此时
$t=1/4+1/32=9/32,\ \theta=9\pi/2$。

三个相位分别为 $9\pi/16,9\pi/8,9\pi/4$，正弦符号依次为正、负、正。这个例子只是展示通用构造如何计算；无限维结论来自前面对所有 $m$ 的证明。

## 15. 引理 4：Sauer 引理的递推证明补全

### 15.1 定理及边界

若非空二分类类 VC 维至多为 $d<\infty$，则

\[
\Pi_{\mathcal F}(n)
\le g(d,n):=\sum_{j=0}^{\min(d,n)}\binom nj.
\tag{73}
\]

当 $n\ge d\ge1$，进一步有

\[
g(d,n)\le(en/d)^d.
\tag{74}
\]

把 $n\le d$ 的情形也写进 $g$ 很有用：此时 $g(d,n)=2^n$，是平凡界。这使递推遇到 $n-1=d$ 时仍然有合法边界，不会错误使用仅对 $n>d$ 陈述的归纳假设。

### 15.2 删除一个坐标后发生了什么

固定 $n$ 个不同输入。令 $F_1$ 是原投影删除第一个坐标后出现的所有长度 $n-1$ 向量。令

\[
F_2=\{v\in F_1:(-1,v)\text{ 和 }(+1,v)
\text{ 都出现在原投影中}\}.
\tag{75}
\]

每个 $F_1$ 中的向量至少能接上一个首标签；若它属于 $F_2$，还能再接另一个。于是精确计数为

\[
|F_S|=|F_1|+|F_2|.
\tag{76}
\]

不是把整个 $F_1$ 数两遍，只有“双延伸”的那一部分多贡献一次。

### 15.3 为什么第二类的 VC 维少一

把 $F_1,F_2$ 看作定义在剩余有限输入集合上的二分类类。

$F_1$ 的 VC 维至多为 $d$：否则剩余点上能打散 $d+1$ 个点，原类当然也能，矛盾。

$F_2$ 的 VC 维至多为 $d-1$：若它能打散剩余点中的 $d$ 个点，则每个标签模式都来自一个可同时接上首标签 $+1,-1$ 的向量。因此原类能打散这 $d$ 个点加被删去的点，共 $d+1$ 个，矛盾。

所以归纳得到

\[
|F_1|\le g(d,n-1),\qquad
|F_2|\le g(d-1,n-1).
\tag{77}
\]

若 $F_2$ 为空，它贡献零，不需要赋予空类特殊 VC 维。基本情形是 $d=0$ 时只有一个标记模式，以及 $n=0$ 时只有空向量。

### 15.4 Pascal 恒等式如何完成归纳

对 $n>d>0$：

\[
\begin{aligned}
|F_S|
&\le\sum_{j=0}^d\binom{n-1}{j}
+\sum_{j=0}^{d-1}\binom{n-1}{j}\\
&=\binom{n-1}{0}
+\sum_{j=1}^d
\left[\binom{n-1}{j}+\binom{n-1}{j-1}\right]\\
&=\sum_{j=0}^d\binom nj
=g(d,n).
\end{aligned}
\tag{78}
\]

约定越界二项式系数为零。因为任意输入集合都满足这个界，再对输入取最大值得到 (73)。

### 15.5 从二项式和到 $(en/d)^d$

令 $u=d/n\in(0,1]$。当 $j\le d$ 时，$u^d\le u^j$，所以

\[
\begin{aligned}
u^d\sum_{j=0}^d\binom nj
&\le\sum_{j=0}^d\binom nju^j\\
&\le\sum_{j=0}^n\binom nju^j\\
&=(1+u)^n\le e^{nu}=e^d.
\end{aligned}
\tag{79}
\]

最后的不等式来自 $1+u\le e^u$，可由指数函数在零点的切线下界证明。除以 $u^d$，得到 (74)。若 $d=0$，直接使用增长函数为 1，不能往含 $1/d$ 的式子硬代零。

### 15.6 “指数变多项式”的准确含义

当 $n\le d$ 时某些点集能实现全部 $2^n$ 标签；当 $n>d$ 后，增长函数被固定次数 $d$ 的多项式量级控制。Sauer 给的是上界，不保证所有类实际恰按 $n^d$ 增长。

阈值类 $d=1$ 时，Sauer 上界为 $1+n$，与精确增长函数相同。区间类 $d=2$ 时，

\[
1+n+\binom n2=1+\frac{n(n+1)}2,
\tag{80}
\]
也与精确增长函数相同。这说明该组合上界至少在这些例子中确实可以达到。

## 16. 有限 VC 维为什么充分，无限 VC 维为什么必要

### 16.1 充分性：代入增长函数界

对二分类 0–1 损失、$n\ge d\ge1$，结合 (52)、(74)：

\[
\boxed{
\mathcal V^{\rm iid}(\mathcal F,n)
\le\sqrt{\frac{2\ln\Pi_{\mathcal F}(n)}n}
\le\sqrt{\frac{2d\ln(en/d)}n}.
}
\tag{81}
\]

固定有限 $d$，有 $\ln n/n\to0$，因此可学习。若 $n<d$，用平凡风险上界 1；若 $d=0$，非空类只有一个函数，proper ERM 超额风险为零。

### 16.2 必要性：把无免费午餐限制到被打散点集

若 VC 维无限，对任意样本量 $n$，存在被 $\mathcal F$ 打散的 $2n$ 个输入 $X'$。因此每种二元标记都由某个类内函数实现。

给 $X'$ 均匀输入分布，并让标签由某种固定类内标记函数确定。对每个这样的候选分布，类内最佳风险为零。

固定任意算法和训练输入，至少一半的支持点没出现。对任意未见点，把所有标记按“只翻转这个点”配对：同一对产生完全相同的训练集，但在该测试点的真实标签相反。随机算法也可用同一随机种子配对，平均错误率为 $1/2$。

因此平均候选分布风险至少
$(1/2)\cdot(1/2)=1/4$，至少存在一个候选分布使算法风险不低于 $1/4$。算法任意，所以

\[
\boxed{\operatorname{VCdim}(\mathcal F)=\infty
\ \Longrightarrow\
\mathcal V^{\rm iid}(\mathcal F,n)\ge1/4
\quad\text{对每个 }n.}
\tag{82}
\]

比较器只需在 $X'$ 上实现所有标签，类在其余输入上怎样取值不重要，因为分布不在那里放概率。这就是为何不需要参考类等于全体函数，也能复用 Lecture 1 的下界。

### 16.3 “闭环”到底闭合了什么

在本讲二分类、0–1 损失、iid、分布一致以及通常可测性条件下：

\[
\boxed{
\text{有限 VC 维}
\iff \text{统计可学习}
\iff \text{可由 ERM 实现可学习}.
}
\tag{83}
\]

有限 VC 维还通过同一条上界链推出课件采用的统一收敛。反方向，统一收敛蕴含可学习，所以也蕴含有限 VC 维。

这些等价是针对该设置的条件刻画，不应推广成“所有统计学习只要可学习就一定由任何 ERM 学好”。原课件最后明确指出，一般统计学习不总满足这样的结论。

“上界链足够紧”在这里表示足以区分可学习与不可学习，不代表
$\sqrt{d\ln(en/d)/n}$ 的每个对数因子都已经是不可改进的下界。

## 17. 结果如何使用：样本量、置信度和适用范围

### 17.1 期望样本量

由 (81)，要求上界至多 $\varepsilon$，可以使用充分条件

\[
\frac{n}{\ln(en/d)}\ge\frac{2d}{\varepsilon^2},
\qquad n\ge d\ge1.
\tag{84}
\]

忽略对数因子时，这体现 $d/\varepsilon^2$ 的样本依赖。但上式仍是本讲推导的充分条件，并非必要条件的精确表达。

阈值类参数 $\theta$ 可取任意实数，函数数量不可数，却有 VC 维 1；它不需要按参数可能取值的数量支付样本代价。相反，正弦类只有一个实参数却有无限 VC 维。这两个例子一起解释了为何“参数个数”不足以代替类复杂度分析。

### 17.2 补充：有限类的高概率版本怎样推导

本讲主线使用期望。如果损失落在长度 $B$ 的有界区间，对固定函数，由第 7 节的指数矩及尾界：

\[
\Pr(|L_P(f)-\widehat L_S(f)|>t)
\le2e^{-2nt^2/B^2}.
\tag{85}
\]

对 $M=|\mathcal F|$ 个函数使用并集界：

\[
\Pr\left(\sup_f|L_P(f)-\widehat L_S(f)|>t\right)
\le2M e^{-2nt^2/B^2}.
\tag{86}
\]

令右侧等于 $\delta$，取
$t=B\sqrt{\ln(2M/\delta)/(2n)}$。在这个概率至少 $1-\delta$ 的事件上，插入两项经验风险得到

\[
L_P(\widehat f_{\rm ERM})-\inf_fL_P(f)
\le2t
=B\sqrt{\frac{2\ln(2M/\delta)}n}.
\tag{87}
\]

这里高概率定理的额外条件、置信项和双侧偏差的因子 2 都明确推导了，没有把期望上界直接换个符号当成高概率结论。

### 17.3 补充：为什么可实现分类可能有更快保证

若有限二分类类大小为 $M$，且存在零风险目标函数，则 ERM 训练误差为零。任取真实风险大于 $\varepsilon$ 的固定坏函数，它在全部 $n$ 个独立训练样本上都不犯错的概率为

\[
(1-L_P(f))^n\le(1-\varepsilon)^n\le e^{-n\varepsilon}.
\tag{88}
\]

对坏函数并集取界，存在坏但训练误差为零的函数的概率至多 $Me^{-n\varepsilon}$。因此

\[
n\ge\frac{\ln M+\ln(1/\delta)}{\varepsilon}
\tag{89}
\]
足以让 ERM 以概率至少 $1-\delta$ 达到风险不超过 $\varepsilon$。

这与一般无知学习的 $\varepsilon^{-2}$ 型上界不同，原因是可实现假设更强。这个补充帮助理解为何不能把本讲的 $n^{-1/2}$ 上界称为所有情况统一的“精确速率”。

### 17.4 与 Lecture 3 的连接

本讲二分类投影属于 $\{-1,+1\}^n$，因此自动有限。回归投影属于 $[-1,1]^n$，即使 $n$ 有限也可能有无穷多个向量。

Lecture 3 会把“精确计数不同标签”改成“在误差 $\alpha$ 下计数有限代表”，也就是覆盖数，再通过多尺度 chaining 改善估计。因此本讲的 Massart 引理、对称化和投影观点都会原封不动地成为下一讲的工具。

## 18. 严谨性清单与原课件证明索引

### 18.1 需要注意的简写与边界

| 容易误读的位置 | 本报告的处理 |
|---|---|
| argmin 必然存在 | 用近似 ERM、固定近似总体最优函数处理 |
| 正则化总等价于固定小类 ERM | 证明单向关系，并指出约束半径可能依赖数据、反向需要条件 |
| 每个函数偏差均值为零 ⇒ 最大偏差很小 | 给出逐点收敛不蕴含统一收敛的例子 |
| 对称化随机符号等式 | 说明只在随机样本的分布及期望意义下成立 |
| 收缩证明合并项重复 $\epsilon_t$ | 使用正确的 $A_f+A_g$ 形式 |
| 平方损失统一取 $G=2$ | 区分半平方、完整平方和无界值域 |
| 最大值引理要求所有变量独立 | 不要求；Massart 只需不同位置的符号独立 |
| 有限类一定可学习 | 本讲推导还依赖函数值及损失条件等，不能忽略重尾或无界风险问题 |
| VC 维为零 iff 单函数 | 保留非空类假设，函数按映射而非参数计数 |
| 证明 VC 下界就足够 | 另需对任意更大点集证明存在不可实现标记 |
| 线性分类器维数等于输入维数 | 本讲带偏置，所以是输入维数加一 |
| 正弦频率大就算证明无限 VC | 给出固定输入点和逐标签显式参数构造 |
| Sauer 归纳只处理 $n>d$ | 补上 $n\le d$、$d=0$ 的边界 |
| 闭环意味着精确最优速率 | 闭环是可学习性条件；不宣称所有因子都不可改进 |

### 18.2 按原课件编号定位

| 课件内容 | 本报告中的完整推导 |
|---|---|
| ERM 与原式 (1) | 第 1 节，(1)–(6) |
| 原式 (2)、经验过程、统一收敛 | 第 2 节，(7)–(11) |
| Rademacher 复杂度定义 | 第 3 节，(12)–(13) |
| 定理 1：对称化 | 第 4 节，(14)–(18) |
| 引理 1：分类损失 | 第 5 节，(19)–(21) |
| 引理 2：收缩 | 第 6 节，(22)–(30) |
| 次高斯定义、Hoeffding 引理 | 第 7 节，(31)–(37) |
| 引理 3：最大值不等式 | 第 8 节，(38)–(40) |
| 定理 2：Massart | 第 9 节，(41)–(47) |
| 样本投影与增长函数 | 第 10 节，(48)–(52) |
| 命题 1：阈值增长函数 | 第 11.1 节，(53)–(54) |
| 命题 2：区间增长函数 | 第 11.2 节，(55)–(57) |
| 命题 3、4、5：基础 VC 维 | 第 12 节，(58)–(59) 及各证明 |
| 命题 6：线性分类器 VC 维 | 第 13 节，(60)–(65) |
| 命题 7：正弦类无限 VC 维 | 第 14 节，(66)–(72) |
| 引理 4：Sauer 引理 | 第 15 节，(73)–(80) |
| 总结与必要性闭环 | 第 16 节，(81)–(83) |

### 18.3 学完后应能独立回答

1. 为什么 ERM 选出的函数不能直接套用“固定函数”的大数定律？
2. 对称化的每一次交换和不等式，分别利用了什么性质？
3. 收缩证明为什么允许交换两个候选函数，而不要求函数类关于取负对称？
4. 为什么无限二分类类仍然能应用有限集合的 Massart 引理？
5. 怎样用“存在一组”和“任意一组”分别证明 VC 维的下界与上界？
6. Sauer 证明中，能够双向延伸的投影类为什么 VC 维少一？
7. 无限 VC 维怎样保证每个样本量下都存在常数难度的分布？
8. 为什么有限 VC 维的可学习性等价，并不意味着当前速率已经最优？
