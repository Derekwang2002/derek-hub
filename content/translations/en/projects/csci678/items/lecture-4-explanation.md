---
title: "Lecture 4 Detailed Explanation"
summary: "Step-by-step derivations of fat-shattering, monotone-class rates, atom-sampling covers, layerwise error allocation, spectral complexity, and margin bounds, with figures and explicit constant conventions."
---

> Based on Haipeng Luo's nine-page Lecture 4, Fall 2026. This report covers Propositions 1–2, Theorems 1–4, Lemmas 1–2, and both figures, explaining motivation, definitions, derivations, and limitations. The scale-sensitive entropy theorem and the full multiclass margin theorem are explicitly identified as external inputs; the remaining key steps are expanded. Added results and corrections are distinguished from the handout.
>
> Original: lecture4.pdf (local source, not published online). Companion: [full handout reading edition](/notes/csci678/lecture-4-full-translation). Prerequisite: [Lecture 3](/notes/csci678/lecture-3-preview). Samples are iid, classes nonempty, and the required measurability and integrability are assumed. Regression functions take values in $[-1,1]$; networks here have no biases and use coordinatewise ReLU. Statistical guarantees do not guarantee efficient optimization.

## Reading Map: Two Questions Joined by Scale

The first question continues Lecture 3: how can a monotone class be learnable despite infinite pseudo-dimension? Counting arbitrarily small sign changes misses their amplitude. Fat-shattering counts distinctions at a fixed margin.

The second question concerns networks: parameter count need not describe complexity at useful scales. Weight norms yield covering bounds, spectral norms track propagation through layers, and margins compare classification confidence with output scale.

| Sections | Main question | Handout pages |
|---|---|---|
| 1–4 | What does pseudo-dimension miss, and why is the monotone rate $n^{-1/2}$? | 1–2 |
| 5–7 | How does sampling from atoms produce a linear-class cover? | 3–4 |
| 8–10 | Why mixed norms, spectral norms, and recursive error? | 4–6 |
| 11–12 | Where do the exponents $2/3$ and $3/2$ come from? | 6–7 |
| 13–15 | What do margins and the experiments establish? | 7–9 |
| 16–18 | Worked example, pitfalls, and review questions | Throughout |

## 1. Arbitrarily Small Changes Versus Fixed-Scale Changes

Pseudo-dimension fixes inputs and thresholds, then asks for every sign pattern to be realizable:

\[
\forall s\in\{-1,+1\}^n,\quad\exists f_s\in\mathcal F,
\quad\operatorname{sign}(f_s(x_t)-y_t)=s_t.
\]

It does not distinguish an upward displacement of $10^{-100}$ from one of 0.5. A cover at accuracy 0.01 has no reason to remember the former distinction. Fat-shattering adds a required amplitude:

\[
\forall s\in\{-1,+1\}^n,\quad\exists f_s\in\mathcal F,
\quad s_t(f_s(x_t)-y_t)\ge\alpha/2\quad\forall t.
\]

Positive labels require outputs at least $y_t+\alpha/2$; negative labels require outputs at most $y_t-\alpha/2$. The two permitted regions are separated by $\alpha$.

The quantifier order matters: **fix the points and witness first, vary the entire labeling second, and choose one function for that labeling last.** Thresholds cannot depend on labels, and a different function cannot be chosen independently for each coordinate.

Larger scales impose stronger requirements:

\[
\alpha_1\le\alpha_2\Longrightarrow
\operatorname{fat}(\mathcal F,\alpha_1)\ge\operatorname{fat}(\mathcal F,\alpha_2).
\]

For outputs in $[-1,1]$, no point is shattered if $\alpha>2$: two outputs realizing opposite labels would need to be more than 2 apart.

With compatible threshold conventions, pseudo-dimension is the supremum over positive-scale fat dimensions. Do not simply substitute $\alpha=0$ into the non-strict inequality: a function equal to every threshold could then appear to realize every labeling, which is not the intended definition.

## 2. Monotone Functions: Constructions Give Lower Bounds

### 2.1 Infinite pseudo-dimension

Take $x_t=t-1$, $y_t=(t-1)/n$, and prescribe

\[
f_s(x_t)=y_t+s_t\epsilon,\qquad0<\epsilon\le1/(2n).
\]

The worst adjacent labels are $+1,-1$, for which

\[
f_s(x_{t+1})-f_s(x_t)=1/n-2\epsilon\ge0.
\]

Every pattern therefore extends to a nondecreasing step function on the real line, still in $[-1,1]$. Any $n$ works, but its margin shrinks with $n$.

Requiring $\epsilon\ge\alpha/2$ restricts this construction to $n\le1/\alpha$, proving only $\operatorname{fat}\ge\lfloor1/\alpha\rfloor$. Failure of one construction is not an upper bound, because a different construction may exist.

### 2.2 Why adjacent pairs prove Proposition 1

Suppose some ordered points $x_1<\cdots<x_n$ are shattered with witness $y_1,\ldots,y_n$. Every adjacent $+1,-1$ pattern must be realizable, so

\[
y_t+\alpha/2\le f(x_t)\le f(x_{t+1})\le y_{t+1}-\alpha/2.
\]

Hence adjacent thresholds differ by at least $\alpha$. Different adjacent pairs may use different functions, but they constrain the same witness. Summing gives

\[
(n-1)\alpha\le y_n-y_1\le2,
\qquad n\le2/\alpha+1.
\]

This rules out every possible witness and is therefore a genuine upper bound.

### 2.3 Added result: the exact value in this example

Realizing both labels at every point also forces

\[
-1+\alpha/2\le y_t\le1-\alpha/2.
\]

Thus $y_n-y_1\le2-\alpha$, giving $n\alpha\le2$. Conversely, whenever $n\alpha\le2$, take

\[
y_t=-1+\alpha/2+(t-1)\alpha,
\qquad f_s(x_t)=y_t+s_t\alpha/2.
\]

All outputs remain in range, and the smallest adjacent increment is zero. A monotone extension exists for every labeling. Therefore

\[
\operatorname{fat}(\mathcal F,\alpha)=\lfloor2/\alpha\rfloor\quad(0<\alpha\le2),
\qquad \operatorname{fat}(\mathcal F,\alpha)=0\quad(\alpha>2).
\]

This strengthens the handout's order bound. The constant depends on its convention that the required margin is $\alpha/2$, rather than $\alpha$.

## 3. From Fat Dimension to Dudley's Integral

For fixed inputs, define the normalized empirical metric and complexity by

\[
d_{2,n}(u,v)=\sqrt{\frac1n\sum_t(u_t-v_t)^2},
\qquad
\widehat{\mathcal R}_S(\mathcal F)=\frac1n\mathbb E_\epsilon\sup_f\sum_t\epsilon_tf(x_t).
\]

A normalized radius $\alpha$ corresponds to Euclidean radius $\alpha\sqrt n$. Theorem 1 is a nontrivial scale-sensitive combinatorial result. A version with safe endpoint constants is

\[
\ln\mathcal N_2(\mathcal F|_S,\delta)
\le C\operatorname{fat}(\mathcal F,c\delta)\ln(C/\delta),\qquad0<\delta<1,
\]

for absolute $C>1,c>0$. The handout does not prove this theorem, and ordinary Sauer counting alone is not a complete proof. We use it as an external input and derive the consequences. Writing $\ln(C/\delta)$ also avoids a vanishing logarithm near 1.

Dudley's bound from Lecture 3 is

\[
\widehat{\mathcal R}_S(\mathcal F)
\le\inf_{0\le a\le1}\left[4a+\frac{12}{\sqrt n}\int_a^1\sqrt{\ln\mathcal N_2(\mathcal F|_S,\delta)}\,d\delta\right].
\]

For the monotone class, the integrand is bounded by a constant times $\sqrt{\ln(C/\delta)/\delta}$. Substitute $\delta=e^{-u}$:

\[
\int_0^1\sqrt{\frac{\ln(C/\delta)}{\delta}}\,d\delta
=\int_0^\infty\sqrt{\ln C+u}\,e^{-u/2}\,du<\infty.
\]

Letting $a\downarrow0$ gives Proposition 2, uniformly over samples. Taking expectation over samples preserves the $O(n^{-1/2})$ rate.

The handout uses the simpler estimate $\ln(C/\delta)\lesssim\delta^{-1/2}$. Its integrand is at most a constant times $\delta^{-3/4}$, and

\[
\int_a^1\delta^{-3/4}\,d\delta=4(1-a^{1/4})\le4.
\]

The earlier $\sqrt{\ln n}$ factor disappears because this covering estimate no longer counts sample locations through a $\ln n$ factor.

## 4. Learnability, Rates, and Loss Assumptions

For a regression loss that is $G$-Lipschitz in the prediction, ERM, symmetrization, and contraction yield

\[
\mathbb E\left[L(\widehat f)-\inf_{f\in\mathcal F}L(f)\right]
\le2G\mathbb E\widehat{\mathcal R}_S(\mathcal F).
\]

The monotone class consequently has expected excess risk $O(G/\sqrt n)$. This is neither zero error on each test point nor a high-probability statement; the latter needs an additional concentration argument and its assumptions.

Even if the entropy integral diverges at zero, finiteness at each positive scale can still establish convergence. Fix $a>0$. On $[a,1]$, fat dimension is bounded by $\operatorname{fat}(\mathcal F,ca)<\infty$, so the integral is finite. First send $n\to\infty$, leaving $4a$; then send $a\downarrow0$. **Integrability at zero gives a favorable rate, not a necessary condition for convergence.**

Necessity must be stated for the relevant real-valued learning model and loss. Lipschitzness alone does not make fat dimension characterize every conceivable loss: the identically zero loss is learnable regardless of the class.

## 5. The Full Architecture Versus the Trained Network

Fitting random labels shows that the architecture permits a rich class. A vacuous VC upper bound still does not prove that a particular trained predictor generalizes badly on a particular distribution.

Distinguish the full architecture class, a norm-constrained subclass, and the particular predictor selected by optimization. This lecture studies the second object to help explain the third. It does not prove that SGD always selects a low-complexity solution.

For linear predictors, duality and Jensen give a useful warm-up:

\[
\begin{aligned}
\widehat{\mathcal R}_S(\mathcal F)
&=\frac bn\mathbb E_\epsilon\left\|\sum_t\epsilon_tx_t\right\|_2\\
&\le\frac bn\sqrt{\mathbb E_\epsilon\left\|\sum_t\epsilon_tx_t\right\|_2^2}
=\frac{b\|X\|_F}{n}.
\end{aligned}
\]

Cross terms vanish because distinct Rademacher signs have zero product expectation. If $\|x_t\|_2\le r$, then $\|X\|_F\le r\sqrt n$, yielding $br/\sqrt n$.

No explicit $d$ does not mean dimension can never matter. If every input coordinate retains constant scale, the input norm can grow as $\sqrt d$. Dimension-free statements must be read together with fixed norm bounds.

## 6. Lemma 1: Sampling a Finite Cover

Here is the proof deferred to HW1, with rounding made explicit. Suppose $\|v_i\|_2\le1$ and

\[
z=\sum_{i=1}^D\beta_iv_i,\qquad\beta_i\ge0,\quad\sum_i\beta_i\le B.
\]

Let $V$ equal $v_i$ with probability $\beta_i/B$, and zero with the remaining probability. Then $B\mathbb EV=z$ and $\mathbb E\|V\|_2^2\le1$. For independent draws, define

\[
\widetilde z=\frac Bk\sum_{r=1}^kV_r.
\]

Independence removes cross terms in the centered error:

\[
\mathbb E\|\widetilde z-z\|_2^2
=\frac{B^2}{k}\mathbb E\|V-\mathbb EV\|_2^2
\le\frac{B^2}{k}.
\]

Some realization therefore has error at most $B/\sqrt k$. Choose $k=\lceil B^2/\varepsilon^2\rceil$. There are at most $(D+1)^k$ possible draw sequences, giving

\[
\ln N(S,\varepsilon;\|\cdot\|_2)
\le\left\lceil\frac{B^2}{\varepsilon^2}\right\rceil\ln(D+1).
\]

For the metric $\|u-v\|_2/\sqrt q$, set $\varepsilon=\alpha\sqrt q$:

\[
\ln\mathcal N_2(S,\alpha)
\le\left\lceil\frac{B^2}{q\alpha^2}\right\rceil\ln(D+1).
\]

If the atoms are sign-symmetric, their convex hull already contains zero and the spare mass can be redistributed. The general formulation includes a zero atom safely. When $\varepsilon\ge B$, the single center zero suffices. When $\varepsilon<B$, rounding changes the estimate by at most a factor of 2. Thus the source's principal order is correct, but dropping rounding does not preserve an exact constant of 1.

The mechanism is sparsification: high ambient dimension is tolerable when all vectors have bounded total coefficient mass over a finite atom set. A cover can be indexed by finitely many sampled sequences.

## 7. Theorem 2: Linear Predictions as Column Atoms

The sample projection is $X\theta$. Omit zero columns and define

\[
v_i=X_{:,i}/\|X_{:,i}\|_2,
\qquad\beta_i=\theta_i\|X_{:,i}\|_2.
\]

Add negative atoms to handle signed coefficients. Cauchy–Schwarz gives

\[
\sum_i|\beta_i|
=\sum_i|\theta_i|\|X_{:,i}\|_2
\le\sqrt{\sum_i\theta_i^2}\sqrt{\sum_i\|X_{:,i}\|_2^2}
\le b\|X\|_F.
\]

Apply Lemma 1 with $q=n$, $B=b\|X\|_F$, and at most $2d$ atoms:

\[
\ln\mathcal N_2(\mathcal F|_S,\alpha)
\le\left\lceil\frac{b^2\|X\|_F^2}{n\alpha^2}\right\rceil\ln(2d+1).
\]

Ignoring universal constants and rounding gives Theorem 2's form. The atom hull only needs to contain the projected class; it need not equal it.

The old $d\ln(1+2b/\alpha)$ bound has mild accuracy dependence. The new bound has mild dimension dependence but an $\alpha^{-2}$ term. Where both are valid, take the smaller one.

## 8. Theorem 3: Why a Mixed Norm Appears

For $W\in\mathbb R^{m\times d}$, projected outputs form matrices $\sigma(XW^\top)\in\mathbb R^{n\times m}$. Use

\[
d_{2,nm}(A,B)=\|A-B\|_F/\sqrt{nm}.
\]

Coordinatewise ReLU does not expand Euclidean distance. Applying it to both target and cover centers therefore preserves covering accuracy.

Expand

\[
XW^\top=\sum_{i=1}^d\sum_{j=1}^mW_{ji}Xe_ie_j^\top.
\]

The atom puts feature column $i$ into output coordinate $j$, so $\|Xe_ie_j^\top\|_F=\|X_{:,i}\|_2$. After normalization and sign doubling, there are at most $2dm$ atoms. Their coefficient mass is

\[
\begin{aligned}
\sum_{i,j}|W_{ji}|\|X_{:,i}\|_2
&=\sum_i\|W_{:,i}\|_1\|X_{:,i}\|_2\\
&\le\sqrt{\sum_i\|W_{:,i}\|_1^2}\|X\|_F
=\|W\|_{1,2}\|X\|_F.
\end{aligned}
\]

The mixed norm is exactly what remains after grouping by input column and applying Cauchy–Schwarz. Flattening matrices into $nm$ coordinates yields, at nontrivial scales,

\[
\ln\mathcal N_2(\mathcal F|_S,\alpha)
\lesssim\frac{b^2\|X\|_F^2\ln(2dm+1)}{nm\alpha^2}.
\]

The denominator's $m$ reflects metric normalization, not a guarantee that more outputs make learning easier. With raw Frobenius radius $\varepsilon=\alpha\sqrt{nm}$, the denominator becomes simply $\varepsilon^2$.

### Comparing mixed norms

Let $r_j=(|W_{j1}|,\ldots,|W_{jd}|)$. The triangle inequality gives the complete comparison:

\[
\|W\|_{1,2}=\left\|\sum_jr_j\right\|_2
\le\sum_j\|r_j\|_2=\|W^\top\|_{2,1}.
\]

This improves that specific coefficient estimate relative to summing row norms. It does not by itself prove a stronger version of every statement in the original paper.

## 9. Why Intermediate Centers Must Be Legal Outputs

If $M_h=\sigma(M_{h-1}W_h^\top)$, then

\[
\|M_h\|_F\le\|M_{h-1}W_h^\top\|_F
\le s_h\|M_{h-1}\|_F.
\]

This uses both Lipschitzness and $\sigma(0)=0$. Biases or activations nonzero at the origin require extra terms.

An external cover center need not be a valid intermediate output. To obtain an internal cover, start with external balls of radius $\varepsilon/2$. From each ball meeting the set, choose a point $a_j$ in the set. Then

\[
\|a-a_j\|\le\|a-c_j\|+\|c_j-a_j\|\le\varepsilon.
\]

Internal $\varepsilon$-cover size is consequently bounded by external $\varepsilon/2$-cover size. An inverse-square entropy bound incurs a factor of 4; combine this with rounding into a universal constant $C$.

Use $C(M,\mathcal W_h,\gamma_h)$ for an internal cover at **raw Frobenius radius** $\gamma_h$, and set

\[
S_0=\{X\},\qquad S_h=\bigcup_{M\in S_{h-1}}C(M,\mathcal W_h,\gamma_h).
\]

Each parent center gets its own finite child cover. The norm bound iterates to $\|M_h\|_F\le\|X\|_F\prod_{k\le h}s_k$. Therefore

\[
\ln|S_h|\le\ln|S_{h-1}|+
C\frac{b_h^2\|X\|_F^2(\prod_{k<h}s_k^2)\ln(2d_{\max}^2+1)}{\gamma_h^2}.
\]

The union has at most the number of parents times the largest number of children. Taking logarithms turns this into addition. Large-radius cases can use the legal zero output as a single center.

## 10. Lemma 2: Propagating Error Through Layers

Fix a true network and write $A_h=\sigma(A_{h-1}W_h^\top)$, with $A_0=X$. Suppose a center satisfies $\|A_{h-1}-M_{h-1}\|_F\le\alpha_{h-1}$. Choose a child center within $\gamma_h$ of $\sigma(M_{h-1}W_h^\top)$. Then

\[
\begin{aligned}
\|A_h-M_h\|_F
&\le\|\sigma(A_{h-1}W_h^\top)-\sigma(M_{h-1}W_h^\top)\|_F+\gamma_h\\
&\le\|(A_{h-1}-M_{h-1})W_h^\top\|_F+\gamma_h\\
&\le s_h\alpha_{h-1}+\gamma_h.
\end{aligned}
\]

The matrix norm step follows row by row from $\|W_hu\|_2\le s_h\|u\|_2$, followed by squaring and summing. Set $\alpha_0=0$ and $\alpha_h=\gamma_h+s_h\alpha_{h-1}$. Expanding gives

\[
\alpha_1=\gamma_1,\quad
\alpha_2=\gamma_2+s_2\gamma_1,\quad
\alpha_3=\gamma_3+s_3\gamma_2+s_3s_2\gamma_1,
\]

and hence

\[
\alpha_H=\sum_h\gamma_h\prod_{k>h}s_k.
\]

New error at layer $h$ is amplified by later layers. The current spectral norm amplifies preexisting error, which is why the product starts at $k>h$, not $k\ge h$.

If normalized errors $e_h=\alpha_h/\sqrt{nd_h}$ were used throughout, the recurrence would instead contain

\[
e_h\le\frac{\gamma_h}{\sqrt{nd_h}}+s_h\sqrt{\frac{d_{h-1}}{d_h}}e_{h-1}.
\]

Working with raw Frobenius errors first avoids silently losing this dimension ratio.

## 11. Theorem 4: Deriving the 2/3 Allocation

Let the allowed final Frobenius error be $A>0$, and define

\[
P=\prod_hs_h,\qquad a_h=b_h/s_h,
\qquad L=\ln(2d_{\max}^2+1).
\]

The entropy objective is

\[
C\|X\|_F^2L\sum_h\frac{b_h^2\prod_{k<h}s_k^2}{\gamma_h^2},
\qquad\sum_h\gamma_h\prod_{k>h}s_k=A.
\]

Assign final-error shares $A\rho_h$, with positive $\rho_h$ summing to one. Then

\[
\gamma_h=\frac{A\rho_h}{\prod_{k>h}s_k},
\qquad
\frac{b_h^2\prod_{k<h}s_k^2}{\gamma_h^2}
=\frac{P^2}{A^2}\frac{a_h^2}{\rho_h^2}.
\]

It remains to minimize $\sum_ha_h^2/\rho_h^2$. With positive $a_h$, this objective diverges at the boundary and has positive second derivative $6a_h^2/\rho_h^4$, so its unique optimum is interior. The Lagrangian is

\[
\mathscr L(\rho,\lambda)=\sum_h\frac{a_h^2}{\rho_h^2}+\lambda\left(\sum_h\rho_h-1\right).
\]

Stationarity gives $-2a_h^2/\rho_h^3+\lambda=0$, hence

\[
\rho_h=\frac{a_h^{2/3}}{\sum_ka_k^{2/3}}.
\]

Set $T=\sum_ka_k^{2/3}$. Substitution yields

\[
\sum_h\frac{a_h^2}{\rho_h^2}
=T^2\sum_ha_h^{2/3}=T^3.
\]

Consequently

\[
\ln N(\mathcal F_H|_S,A;\|\cdot\|_F)
\lesssim\frac{\|X\|_F^2L}{A^2}P^2
\left(\sum_h(b_h/s_h)^{2/3}\right)^3.
\]

Replacing $A$ with $\alpha\sqrt{nd_H}$ yields the denominator in Theorem 4. Universal constants account for rounding and internal recentering.

A larger $a_h$ makes fine covering more expensive, so the optimum gives that layer a larger share of final error. Its raw local radius can still be smaller because downstream amplification must also be divided out.

## 12. From Entropy to Spectral Complexity

Define

\[
R(W)=\left(\prod_h\|W_h\|_2\right)
\left(\sum_h\left(\frac{\|W_h\|_{1,2}}{\|W_h\|_2}\right)^{2/3}\right)^{3/2}.
\]

The squared norm factor in covering entropy becomes $R^2$. Dudley's square root explains the change from exponent 3 to $3/2$.

For a precise scalar-output illustration, let $d_H=1$, $K=\|X\|_FR\sqrt L/\sqrt n$, and assume entropy is at most a constant times $K^2/\delta^2$ over the relevant scales. Let $D$ bound the empirical radius. Then

\[
\widehat{\mathcal R}_S\lesssim\inf_{0<a\le D}
\left[a+\frac{K}{\sqrt n}\int_a^D\frac{d\delta}{\delta}\right]
=\inf_{0<a\le D}\left[a+\frac{K}{\sqrt n}\ln(D/a)\right].
\]

The lower cutoff cannot be zero: this integral diverges. If $K/\sqrt n\le D$, choose $a$ of that order to obtain

\[
\widehat{\mathcal R}_S\lesssim\frac{\|X\|_FR\sqrt L}{n}
\left[1+\ln\left(\frac{Dn}{\|X\|_FR\sqrt L}\right)\right].
\]

Otherwise, $a=D$ supplies a trivial radius bound. Ignoring logarithms gives $\|X\|_FR/n$, or $rR/\sqrt n$ for bounded input norms.

For vector outputs one must specify the process and final loss. The normalized covering denominator $d_H$ does not automatically give classification an extra $1/\sqrt{d_H}$ improvement. Passing from network covers to a multiclass margin guarantee requires additional empirical-process arguments; scalar contraction alone is not a full proof.

The product of spectral norms bounds Lipschitzness. Full spectral complexity also has a mixed-norm correction. If one weight layer is zero, the bias-free network is identically zero; handle that case separately instead of evaluating a $0/0$ ratio.

## 13. Margin and Output Scale

For class scores, define

\[
M(f,x,y)=f(x)_y-\max_{j\ne y}f(x)_j.
\]

If the true class is 2, scores $(1,3,2)$ have margin 1; scores $(1,1.5,2)$ have margin $-0.5$. Zero margin is a tie, whose correctness depends on the tie-breaking rule. Every misclassification lies in $\{M\le0\}$.

The ramp loss bridges classification and smooth complexity control:

\[
\phi_\gamma(u)=
\begin{cases}
1,&u\le0,\\
1-u/\gamma,&0<u<\gamma,\\
0,&u\ge\gamma.
\end{cases}
\]

It is $1/\gamma$-Lipschitz and satisfies

\[
\mathbb I\{\text{misclassification}\}\le\phi_\gamma(M)
\le\mathbb I\{M<\gamma\}.
\]

For a fixed class and threshold, bounded-loss empirical-process theory gives empirical margin loss plus complexity and confidence terms. Uniformity across norm scales and thresholds is an additional step needed before selecting $\gamma$ after training.

The handout displays the leading-order relationship

\[
\Pr\{\arg\max_jf_W(x)_j\ne y\}
\lesssim\frac1n\sum_t\mathbb I\{M_t<\gamma\}
+\widetilde O\left(\frac{\|X\|_FR(W)}{\gamma n}\right).
\]

**Paper check.** The full high-probability theorem also contains a $\sqrt{\ln(1/\delta)/n}$ confidence term and uses a row-norm correction, optionally relative to reference matrices. The handout's Equation (4) is a leading-order summary, not a complete numerical probability guarantee. [Original Theorem 1.1](https://papers.nips.cc/paper/7204-spectrally-normalized-margin-bounds-for-neural-networks.pdf)

Increasing $\gamma$ counts more training examples as small-margin but lowers the complexity penalty. A simultaneous bound permits this choice in the analysis without retraining. If all training margins are positive, choose $0<\gamma<\min_tM_t$ to eliminate the empirical term, regardless of whether an endpoint convention uses $<$ or $\le$. Zero training error with ties is insufficient.

### A homogeneity check

Bias-free ReLU satisfies $\sigma(cu)=c\sigma(u)$ for $c>0$. Scaling only the last weight matrix by $c$ scales scores and margins by $c$ without changing predictions. Mixed-to-spectral norm ratios are unchanged, while their spectral product scales by $c$. Thus

\[
R'=cR,\qquad M'=cM,\qquad R'/M'=R/M.
\]

A large raw margin alone is not evidence of better generalization. Rescaling adjacent layers by $c$ and $1/c$ preserves both the function and the spectral-complexity expression, another useful check.

## 14. Figure 1: Identical Parameter Counts, Different Outcomes

![Figure 1: AlexNet training curves for original and random CIFAR10 labels](/projects/csci678/lecture-4/figure-1.png)

The horizontal axis is training epoch on a logarithmic scale. Crosses mark the first zero-training-error epoch. Here “excess risk” is the **test-minus-training error gap**, not $L(\widehat f)-\inf_fL(f)$.

Original labels reach zero training error earlier. Thereafter their test error is about 0.3, compared with about 0.9 for random labels. The parameter counts match, but norm-based curves differ. Error around 0.9 is consistent with ten independently random classes providing no predictive information for new labels.

The unnormalized norm measure can keep growing after the gap stabilizes; dividing by margin can stabilize it. This supports measuring classification relative to output scale. The plotted Lipschitz measure is the spectral-norm product, not automatically the full corrected $R(W)$.

These experiments provide qualitative support in their setting. They do not establish exact prediction of every network's gap, nor guarantee that the bound is numerically below 1.

## 15. Figure 2: Reading Normalized Margin Distributions

For $Q=\|X\|_FR(W)/n>0$, write $u_t=M_t/Q$. Rescaling the original threshold to $\gamma Q$ gives leading terms

\[
\frac1n\sum_t\mathbb I\{u_t<\gamma\}+\widetilde O(1/\gamma).
\]

The first term is the empirical CDF's left limit. The plots show smoothed distribution shapes rather than CDF curves themselves; accumulated mass to the left of a threshold corresponds to the penalty.

![Figure 2: Normalized margin distributions on different tasks](/projects/csci678/lecture-4/figure-2.png)

Under comparable normalization, a rightward distribution tends to have less mass below a fixed threshold. More precisely, compare CDFs over relevant thresholds; a larger mean or a shifted peak alone need not suffice.

The panels compare MNIST with CIFAR10, their randomized-label versions, CIFAR100 with randomized CIFAR10, and random inputs with random labels. The indicated ordering is qualitative and specific to those experiments, not an absolute ranking of datasets independent of training.

The handout's rewritten probability formula contains a $\max$/$\arg\max$ typo. Classification error compares a predicted class with a label, not a numerical score with a class index.

## 16. A Two-Layer Numerical Example

Let $H=2$, $s_1=2,s_2=3$, $b_1=4,b_2=3$, and final Frobenius error $A=1$. Then

\[
a_1=2,\quad a_2=1,\qquad
\rho_1=\frac{2^{2/3}}{2^{2/3}+1}\approx0.6135,
\quad\rho_2\approx0.3865.
\]

Local radii are

\[
\gamma_1=\rho_1/s_2\approx0.2045,
\qquad\gamma_2=\rho_2\approx0.3865.
\]

Indeed, $3\gamma_1+\gamma_2=1$. Layer 1 has the larger final-error share but the smaller local radius because layer 2 amplifies it.

Dropping common factors, the objective becomes

\[
16/\gamma_1^2+36/\gamma_2^2
=36(2^{2/3}+1)^3\approx623.6.
\]

Equal final-error shares instead give $\gamma_1=1/6,\gamma_2=1/2$, with objective $576+144=720$. The optimized allocation improves the bound.

## 17. Pitfalls and Source Corrections

| Possible misreading | Correct interpretation |
|---|---|
| Infinite pseudo-dimension forbids learning | Positive-scale fat dimensions retain amplitude information |
| A failed shattering construction proves an upper bound | All possible witnesses must be ruled out |
| Fat dimension is a containing linear subspace's dimension | It controls entropy, not linear containment |
| Every covering radius uses the same normalization | Scalars use $\sqrt n$, matrices $\sqrt{nm}$, and the recursion uses raw Frobenius radii |
| Lemma 1 needs neither a zero atom nor rounding | The general sampling statement includes both |
| Recenter a cover without cost | The usual construction doubles the radius |
| Parameter count has no influence whatsoever | Norms and input scale may still depend on dimension |
| Spectral complexity equals Lipschitzness | A mixed-norm correction is also present |
| Zero training error means positive minimum margin | Correctly resolved ties may still have zero margin |
| The plotted excess risk is class-relative excess risk | It is the test-minus-training gap |
| A margin bound proves SGD finds good solutions | It controls certain solutions; selection by optimization is a separate problem |

Handle degenerate cases separately: zero data collapse projections; omit zero columns; a zero layer makes the bias-free network zero; a radius of zero cannot be inserted into an inverse-square bound; and normalized margins are undefined when $Q=0$.

## 18. Self-Check and Review Order

1. **Why is monotone pseudo-dimension infinite?** Witness thresholds become closer with increasing sample size, so progressively smaller perturbations realize arbitrary signs.
2. **What is the exact fat dimension at $\alpha=0.5$?** Four under the handout's margin convention. Witnesses $-0.75,-0.25,0.25,0.75$ work.
3. **Where does inverse-square accuracy come from?** Averaging $k$ atoms has mean squared error at most $B^2/k$.
4. **Why column $\ell_1$ followed by $\ell_2$?** Group output coefficients by input column, then apply Cauchy–Schwarz against data-column norms.
5. **Why the $2/3$ exponent?** Differentiating $a_h^2/\rho_h^2$ gives $\rho_h^3\propto a_h^2$.
6. **Can the network entropy integral start at zero?** No; its $1/\delta$ integrand requires a cutoff.
7. **Does multiplying scores by ten improve classification?** Predictions are unchanged, and both margin and spectral complexity scale together.
8. **What question remains open in the lecture?** Why the particular optimizer tends to find low-complexity, favorable-margin solutions.

For a 30-minute review, spend eight minutes reproducing the monotone bounds and integral, seven deriving atom sampling and the mixed norm, ten on the layer recurrence, KKT calculation, and numerical example, and five explaining the figures and the distinction between statistics and optimization.

## Sources and Added Material

The primary source is the local Lecture 4 handout, whose numbering is retained. The exact monotone dimension, rounded sampling bound, recentering constants, expanded KKT derivation, homogeneity checks, and numerical example are added derivations. The confidence term and norm conventions were checked against [Bartlett, Foster, and Telgarsky (2017)](https://papers.nips.cc/paper/7204-spectrally-normalized-margin-bounds-for-neural-networks.pdf). The handout's other reference is Zhang, Bengio, Hardt, Recht, and Vinyals, *Understanding deep learning requires rethinking generalization*, ICLR 2017.
