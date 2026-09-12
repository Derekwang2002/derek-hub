---
title: "Lecture 3 Preview Report: Covering Numbers, Dudley's Entropy Integral, and Pseudo-dimension"
summary: "Complexity control for infinite real-valued function classes: three refinements from pointwise covering to sample-projection covering to Dudley chaining, plus pseudo-dimension as a combinatorial characterization of learnability."
---

**Topic: infinite real-valued function classes, covering numbers, Dudley's entropy integral, and pseudo-dimension**
**Course: Theoretical Machine Learning**
**Slides: Lecture 3, Fall 2026, Haipeng Luo**

## 1. The problem this lecture solves

The previous lecture characterized learnability for finite function classes and binary classification. This lecture turns to regression:

\[
\mathcal Y=[-1,1],\qquad \mathcal F\subseteq[-1,1]^{\mathcal X}.
\]

The central goal is still to control Rademacher complexity, because the generalization error of empirical risk minimization (ERM) is bounded through the following chain:

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le 2\sup_P\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))
\le 2G\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F),
\]

where $G$ is the Lipschitz constant of the loss; for binary classification one can take $G=1/2$.

For finite classes, Massart's lemma applies directly: if function values lie in $[-C,C]$, then

\[
\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
\le C\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\]

But in regression, $\mathcal F$ is often an infinite class, and its sample projection

\[
\mathcal F|_{x_{1:n}}
=\{(f(x_1),\ldots,f(x_n)):f\in\mathcal F\}
\subseteq[-1,1]^n
\]

is usually still an infinite set, so $|\mathcal F|$ cannot simply be plugged into the finite-class bound. The unifying strategy of this lecture is: **first approximate the infinite set by a finite one, then apply Massart's lemma to the finite representative set.**

---

## 2. First layer: cover the whole function class

### 2.1 Pointwise covering and covering numbers

A finite class $\mathcal H\subseteq[-1,1]^{\mathcal X}$ is a pointwise $\alpha$-cover of $\mathcal F$ if for every $f\in\mathcal F$ there exists $h\in\mathcal H$ such that

\[
|f(x)-h(x)|\le \alpha,\qquad \forall x\in\mathcal X.
\]

The size of the smallest representative set is the pointwise covering number:

\[
\mathcal N(\mathcal F,\alpha)
=\min\{|\mathcal H|:\mathcal H\text{ is a pointwise }\alpha\text{-cover}\}.
\]

The larger $\alpha$ is, the looser the approximation requirement, so $\mathcal N(\mathcal F,\alpha)$ is non-increasing in $\alpha$.

### 2.2 Theorem 1: single-scale covering bound

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\min_{\alpha\ge 0}
\left(
\alpha+\sqrt{\frac{2\ln\mathcal N(\mathcal F,\alpha)}{n}}
\right).
\]

This bound expresses a basic trade-off:

- Small $\alpha$: the approximation error is small, but more representative functions are needed, so the covering number grows;
- Large $\alpha$: the representative set is smaller, but the discretization error grows.

The skeleton of the proof writes each function as "approximation error + representative":

\[
f=(f-h_f)+h_f.
\]

The first term is bounded by $\alpha$ via the pointwise error guarantee; the second term is the Rademacher complexity of the finite class $\mathcal H$, controlled by Massart's lemma.

### 2.3 Example: linear functions

Consider

\[
\mathcal X=B_q^d,\qquad
\mathcal F=\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\qquad \frac1p+\frac1q=1.
\]

By Hölder's inequality, $|f_\theta(x)|\le1$.

When $p=\infty,q=1$, the parameter space is a hypercube with side length 2. Discretizing each coordinate uniformly gives

\[
\mathcal N(\mathcal F,\alpha)\le \left(\frac1\alpha\right)^d,
\]

and for $n\ge d$,

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\!\left(\sqrt{\frac{d\ln(n/d)}{n}}\right).
\]

For general $p$, the slides give a more elegant volume argument. Take a maximal $\alpha$-packing of the parameter ball $B_p^d$: points whose pairwise distances exceed $\alpha$. Maximality guarantees that the packing centers also form an $\alpha$-cover; placing a ball of radius $\alpha/2$ around each center produces disjoint balls, all contained in $(1+\alpha/2)B_p^d$. Comparing volumes gives

\[
\mathcal N(\mathcal F,\alpha)
\le \left(\frac2\alpha+1\right)^d.
\]

Hence again

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\!\left(\sqrt{\frac{d\ln(n/d)}{n}}\right).
\]

The general technique to master here is: **a maximal packing automatically yields a cover, and a volume ratio then controls the packing size.**

### 2.4 Why pointwise covering can be too strong

Let $\mathcal F$ be the class of all non-decreasing functions from $\mathbb R$ to $[-1,1]$. For any $\alpha<1$,

\[
\mathcal N(\mathcal F,\alpha)=\infty.
\]

The proof only needs the infinite subclass

\[
f_m(x)=\operatorname{sign}(x-m),\qquad m\in\mathbb Z.
\]

Two functions with different jump locations differ by 2 at some point, so no single representative can cover both of them with error below 1.

Yet this class is in fact learnable. So "approximating at every point of the entire input space" is too strong a requirement; the pointwise covering number is not a tight complexity characterization.

---

## 3. Second layer: cover only the sample projection

### 3.1 Sample-dependent $\ell_p$ covering numbers

Fix inputs $x_{1:n}$. A set $V\subseteq[-1,1]^n$ is an $\alpha$-cover of the projection $\mathcal F|_{x_{1:n}}$ in the $\ell_p$ sense if for every projected vector $f$ there exists $v\in V$ such that

\[
\|f-v\|_p\le n^{1/p}\alpha,
\]

equivalently,

\[
\left(\frac1n\sum_{t=1}^n|f_t-v_t|^p\right)^{1/p}\le\alpha.
\]

The corresponding minimal size is denoted $\mathcal N_p(\mathcal F|_{x_{1:n}},\alpha)$. Under this normalization,

\[
\mathcal N_1\le\mathcal N_2\le\cdots\le\mathcal N_\infty.
\]

Projection covering is never worse than pointwise covering, because restricting a pointwise cover to the sample naturally gives an $\ell_\infty$ cover:

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le \mathcal N(\mathcal F,\alpha).
\]

### 3.2 Theorem 2: projection covering bound

The conditional Rademacher complexity satisfies

\[
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
\le
\min_{\alpha\ge0}
\left(
\alpha+
\sqrt{\frac{2\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)}{n}}
\right).
\]

The proof is again the decomposition "original vector = residual + finite representative." An $\ell_1$ cover is used here because

\[
\langle\epsilon,f-v_f\rangle
\le \|f-v_f\|_1
\]

directly controls the approximation term by $n\alpha$.

### 3.3 The monotone class becomes finite again

Sort the sample as $x_1\le\cdots\le x_n$. Discretize the output range $[-1,1]$ at scale $2\alpha$ into a set $S$ with $|S|\le1/\alpha$. All non-decreasing sequences taking values in $S$ form an $\ell_\infty$ cover of the projection.

Such a sequence is determined by how many times each discrete value appears. A crude count gives

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le(n+1)^{1/\alpha}.
\]

Plugging into Theorem 2:

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\min_{0\le\alpha\le1}
\left(
\alpha+\sqrt{\frac{2\ln(n+1)}{\alpha n}}
\right)
=O\!\left(\left(\frac{\ln n}{n}\right)^{1/3}\right).
\]

The conclusion is crucial: **a function class may admit no finite cover over the whole domain while its behavior on a finite sample does.** For generalization analysis, the latter is exactly what symmetrization leaves us to control.

Also, the cover only appears in the analysis; the algorithm itself can still be plain ERM. For isotonic regression, ERM can even be computed efficiently.

---

## 4. Third layer: Dudley's entropy integral

### 4.1 Why upgrade again

Theorem 2 picks a single scale $\alpha$. For the monotone class it yields a rate of about $n^{-1/3}$, slower than the common $n^{-1/2}$. The problem is not that the class is genuinely harder to learn, but that single-scale analysis throws away information.

Dudley's entropy integral exploits all covering scales from coarse to fine simultaneously:

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

$\ln\mathcal N_2$ is often called the metric entropy, which is why this bound is called the entropy integral.

### 4.2 Improvements on the two examples

For the $d$-dimensional linear class, using

\[
\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
\le \left(\frac3\delta\right)^d
\]

and taking $\alpha=0$ gives

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\!\left(\sqrt{\frac dn}\right).
\]

This removes the extra $\ln n$ factor from the single-scale covering bound.

For the monotone class, using

\[
\mathcal N_2\le\mathcal N_\infty\le(n+1)^{1/\delta},
\]

we get

\[
\int_\alpha^1
\sqrt{\ln\mathcal N_2(\delta)}\,d\delta
\le
\sqrt{\ln(n+1)}\int_\alpha^1\delta^{-1/2}d\delta
\le2\sqrt{\ln(n+1)}.
\]

Therefore

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\!\left(\sqrt{\frac{\ln n}{n}}\right).
\]

This improves the single-scale rate of about $n^{-1/3}$ to about $n^{-1/2}$.

### 4.3 Proof intuition for chaining

Take geometrically decreasing scales

\[
\alpha_j=2^{-j},\qquad j=1,\ldots,M,
\]

and pick an $\ell_2$ cover $V_j$ at each scale. For each projected vector $f$, select layer-by-layer representatives

\[
v_f^0,v_f^1,\ldots,v_f^M.
\]

Then decompose telescopically:

\[
f=(f-v_f^M)+\sum_{j=1}^M(v_f^j-v_f^{j-1}).
\]

Here:

- The tail term $f-v_f^M$ at the finest scale contributes at most $\alpha_M$;
- The candidate set of increments at each layer is finite, so Massart's lemma applies;
- The two representatives of the same function at adjacent scales are both close to it, hence

\[
\|v_f^j-v_f^{j-1}\|_2
\le3\sqrt n\,\alpha_j.
\]

Summing the per-layer contributions yields a discrete sum over scales, and monotonicity of the covering number in the scale bounds that sum by an integral.

The reason for using $\ell_2$ covers is that the "radius" in Massart-type maximal inequalities is governed by the $\ell_2$ norm of the vectors.

Chaining in one sentence: **instead of approximating a function to its final accuracy in one shot, express it as a sequence of increasingly fine corrections, each of which is small.**

---

## 5. Comparing the three bounds

| Method | Information used | Linear class | Non-decreasing class |
|---|---|---:|---:|
| Pointwise function covering | Uniform approximation over the whole domain | $O(\sqrt{d\ln(n/d)/n})$ | $\infty$ |
| Single-scale projection covering | One accuracy on a fixed sample | $O(\sqrt{d\ln(n/d)/n})$ | $O((\ln n/n)^{1/3})$ |
| Dudley's entropy integral | All accuracies on a fixed sample | $O(\sqrt{d/n})$ | $O(\sqrt{\ln n/n})$ |

This table should serve as the core memory framework of the lecture:

1. Moving from "covering functions" to "covering projections" removes an unnecessary global requirement;
2. Moving from "single scale" to "all scales" removes further slack;
3. The analysis tools grow sharper, but the learning algorithm can remain ERM throughout.

---

## 6. Pseudo-dimension: binarizing real-valued functions

Covering numbers play the role in regression that the growth function plays in classification. In classification, VC dimension controls the growth function; correspondingly, a classical combinatorial parameter for real-valued classes is the pseudo-dimension.

For each $f:\mathcal X\to[-1,1]$, consider the binary classifier on $\mathcal X\times[-1,1]$

\[
h_f(x,y)=\operatorname{sign}(f(x)-y).
\]

Define

\[
\operatorname{Pdim}(\mathcal F)
=\operatorname{VCdim}\left(
\{h_f(x,y)=\operatorname{sign}(f(x)-y):f\in\mathcal F\}
\right).
\]

Equivalently, $\operatorname{Pdim}(\mathcal F)$ is the largest integer $n$ for which there exist thresholded points $(x_t,y_t)$ such that for every sign pattern $s_t\in\{-1,+1\}$ one can find $f\in\mathcal F$ with

\[
\operatorname{sign}(f(x_t)-y_t)=s_t,
\qquad t=1,\ldots,n.
\]

Two examples:

- For the $d$-dimensional linear class, $\operatorname{Pdim}(\mathcal F)=d$;
- The class of all non-decreasing functions has infinite pseudo-dimension.

Finite pseudo-dimension suffices for learnability. As the slides note, up to logarithmic factors, a Sauer-type result gives

\[
\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)
\approx \operatorname{Pdim}(\mathcal F)\ln\frac1\alpha,
\]

which in turn implies

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\!\left(
\sqrt{\frac{\operatorname{Pdim}(\mathcal F)\ln n}{n}}
\right).
\]

But finite pseudo-dimension is not necessary for learnability: the monotone class is learnable yet has infinite pseudo-dimension. So pseudo-dimension is still not the correct "if and only if" complexity characterization. That is precisely the question left for the next lecture.

---

## 7. Common confusions

1. **A cover is not a packing.** A cover requires every point to be close to some center; a packing requires the centers to be pairwise separated. Proofs exploit that "a maximal packing is a cover."
2. **Pointwise covering is not projection covering.** The former approximates simultaneously at all $x\in\mathcal X$; the latter only at the current sample points.
3. **Do not reverse $\mathcal N_1\le\mathcal N_2\le\mathcal N_\infty$.** This ordering is determined by the normalized empirical $\ell_p$ norms used in the slides.
4. **Covering numbers appear in proofs, not necessarily in algorithms.** Do not assume ERM must explicitly construct a cover first.
5. **Dudley does not change the function class; it changes the analysis scale.** It turns a one-shot approximation into multi-layer increments.
6. **"Finite parameter dimension" and "finite pseudo-dimension" are not necessary for all nonparametric problems.** The monotone class is the counterexample.
7. **The log covering number is the metric entropy.** Dudley's integral contains $\sqrt{\ln\mathcal N_2}$, not the covering number itself.

---

## 8. Questions to bring to class

1. At which step exactly does symmetrization allow us to move from the whole $\mathcal F$ to $\mathcal F|_{x_{1:n}}$?
2. In the proofs of Theorems 1 and 2, through which norms is the approximation error controlled?
3. Why is a maximal $\alpha$-packing necessarily an $\alpha$-cover?
4. Why can the size of the monotone-sequence cover be counted by "how many times each discrete value appears"?
5. Why does single-scale optimization yield $(\ln n/n)^{1/3}$ for the monotone class while the integral method yields $\sqrt{\ln n/n}$?
6. In chaining, why connect representatives of adjacent layers instead of comparing every fine representative directly with the zero vector?
7. Why does the pseudo-dimension of the linear class equal exactly $d$, while the monotone class has infinite pseudo-dimension?
8. If pseudo-dimension is not necessary, what more appropriate scale-sensitive combinatorial parameter will the next lecture introduce?

---

## 9. A 30-minute pre-lecture review order

**First 5 minutes:** review Rademacher complexity, Massart's lemma, symmetrization, and the Lecture 2 logic of controlling the growth function via VC dimension.
**Minutes 5-12:** master the definition of pointwise $\alpha$-cover and the "residual + representative" proof of Theorem 1.
**Minutes 12-18:** contrast the linear class with the monotone class to understand why pointwise covering fails.
**Minutes 18-23:** learn the definition of projection covering, focusing on the $\ell_p$ normalization and Theorem 2.
**Minutes 23-28:** read Dudley's bound and the telescoping decomposition of chaining; grasp only the multi-scale intuition for now.
**Final 2 minutes:** memorize the comparison table and restate "finite pseudo-dimension is sufficient but not necessary."

## 10. One-sentence summary

The point of this lecture is not to memorize three formulas, but to understand three successive refinements of complexity analysis: **discretize the infinite class; discretize only what is visible on the sample; then use chaining to exploit all discretization scales at once.**
