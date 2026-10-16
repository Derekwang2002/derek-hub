---
title: "Lecture 6 Detailed Explanation"
summary: "Finite-class concentration, zero-covers, Littlestone dimension, online regression, and sequential fat dimension, with step-by-step proofs, worked examples, assumptions, pitfalls, self-tests, and a reading route."
---

> This lecture asks which classes can learn from adaptive data. We develop finite-class concentration, zero-covers, sequential Sauer, Littlestone upper and lower bounds, threshold and monotone counterexamples, regression covers, and surrogate losses. Source: lecture6.pdf (local source, not published online); companion: [full handout](/projects/csci678/lecture-6-full-translation); previous: [Lecture 5](/projects/csci678/lecture-5-explanation); next: [Lecture 7](/projects/csci678/lecture-7-explanation). The deep Dudley and sequential-fat covering proofs omitted by the handout remain explicitly external; their applications are worked through.

## 1 Roadmap and Conditions

Lecture 5 reduced regret to sequential Rademacher complexity. For classification, the chain is finite-expert bounds, pathwise zero-covers, then Littlestone dimension. Regression replaces exact matching with approximation at a scale, leading to sequential fat dimension.

| Source pages | Content | Proof status |
|---|---|---|
| 1–2 | Lemma 1, Theorem 1: finite classes | Developed below |
| 2–4 | Zero-cover, Theorem 2, Corollary 1 | Developed with induction boundaries |
| 4–5 | Theorem 3, Proposition 1 | Developed with a finite-dimension lower-bound discussion |
| 6 | Theorems 4, 5, 6 | 4 proved; 5–6 invoked |
| 7–8 | Linear, monotone, surrogates, summary | Calculations and limitations expanded |

Use Lecture 5’s measurability and game conditions. Classification functions take values ±1 with zero-one loss; regression functions lie in $[-1,1]$. The horizon is $n$. In classification $d$ means Littlestone dimension, while in the linear example it means ambient dimension; do not conflate them.

## 2 The Maximal Inequality Does Not Require Independent Experts

Suppose every $U_f$ satisfies $\mathbb E e^{\lambda U_f}\le e^{\lambda^2\sigma^2/2}$. They may be highly dependent. The maximum exponential is bounded by their sum, and logarithm is concave, so

\[
\begin{aligned}
\mathbb E\max_fU_f
&=\frac1\lambda\mathbb E\ln e^{\lambda\max_fU_f}\\
&\le\frac1\lambda\ln\mathbb E\sum_fe^{\lambda U_f}\\
&\le\frac{\ln K}{\lambda}+\frac{\lambda\sigma^2}{2}.
\end{aligned}
\]

Optimize with $\lambda=\sqrt{2\ln K}/\sigma$ to obtain $\sigma\sqrt{2\ln K}$. For $K=1$, the variables used here have mean zero, giving zero. If “sub-Gaussian” means centered around each variable’s own mean, an additional maximum-mean term is required; the handout uses the zero-centered MGF convention.

## 3 Theorem 1: Concentration of Tree-Indexed Sums

Fix a tree and function. Write $a_t=f(\mathbf x_t(\epsilon_{<t}))$ and $S_t=\sum_{s\le t}\epsilon_sa_s$. Given the past, $a_t$ is known and only the current fair sign is new, hence

\[
\mathbb E[e^{\lambda\epsilon_ta_t}\mid\epsilon_{<t}]
=\frac{e^{\lambda a_t}+e^{-\lambda a_t}}2
=\cosh(\lambda a_t)\le e^{\lambda^2a_t^2/2}.
\]

One cannot multiply unconditional moment-generating functions: future $a_s$ may depend on the current sign. The handout takes successive maxima of future square sums. A shorter supplementary proof uses a nonnegative exponential supermartingale:

\[
M_t=\exp\left(\lambda S_t-\frac{\lambda^2}{2}\sum_{s=1}^ta_s^2\right),
\qquad \mathbb E[M_t\mid\epsilon_{<t}]\le M_{t-1}.
\]

Iterating from $M_0=1$ gives $\mathbb E M_n\le1$. Let $\sigma^2=\max_f\max_\epsilon\sum_ta_t^2$, a deterministic uniform bound. Then

\[
\mathbb E e^{\lambda S_n}
=\mathbb E\left[M_n e^{\frac{\lambda^2}{2}\sum_ta_t^2}\right]
\le e^{\lambda^2\sigma^2/2}\mathbb E M_n
\le e^{\lambda^2\sigma^2/2}.
\]

Apply the preceding section and divide by $n$ to obtain Theorem 1. If absolute function values are at most $C$, then $\sigma^2\le nC^2$:

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\frac{\sqrt{2\sigma^2\ln|\mathcal F|}}n,\qquad
\mathcal R^{\mathrm{seq}}(\mathcal F)\le C\sqrt{\frac{2\ln|\mathcal F|}n}.
\]

**Example.** For $K=100,n=10000,C=1$, the bound is approximately 0.03035. Expert count costs only a logarithm; more rounds improve the bound by a square root. This worst-tree upper bound is not the exact realized regret of a particular sample.

## 4 Why Full-Tree Projection Overcounts

A depth-$n$ tree has $2^n-1$ nodes. Full-tree projection records each function’s predictions on **every branch**. For singleton indicators with distinct node inputs, this gives the all-negative tree plus one positive-node tree per node, totaling $2^n$. Yet a run visits only $n$ nodes, and its singleton labeling contains at most one +1.

We need not preserve one function’s complete responses on all unvisited branches simultaneously. Swapping two quantifiers yields an exponential saving:

\[
\begin{array}{ll}
\text{Projection:}&\forall f\ \exists\mathbf v\ \forall\epsilon\ \forall t,
\quad f(\mathbf x_t(\epsilon))=\mathbf v_t(\epsilon),\\
\text{Zero-cover:}&\forall f\ \forall\epsilon\ \exists\mathbf v\ \forall t,
\quad f(\mathbf x_t(\epsilon))=\mathbf v_t(\epsilon).
\end{array}
\]

The representative may depend on the function and full path but must match **every round** along that path. It cannot be changed each round, and each representative tree remains predictable. The collection $V$ is fixed before drawing the path. Pathwise,

\[
\sup_f\sum_t\epsilon_tf(\mathbf x_t(\epsilon))
\le\max_{\mathbf v\in V}\sum_t\epsilon_t\mathbf v_t(\epsilon).
\]

Take expectations and use the finite-tree-family bound. Cover trees need not be members of the original class, so equality need not hold.

## 5 Singleton Covers with Repeated Inputs

The handout first gives $n+1$ trees for paths without repeats. Here is an explicit construction allowing repeats. Expert 0 always outputs −1. Expert k, for $k=1,\ldots,n$, outputs −1 before round k, remembers the input $a=x_k$ at round k, and thereafter outputs +1 exactly when the input equals a.

For a target $f_\theta$ and path, expert 0 matches if $\theta$ never appears. Otherwise choose k as the first occurrence of $\theta$; expert k matches every round, including later repeats. It uses only past/current inputs and defines a valid tree. The worst-case $n+1$ is attained on a tree with a distinct constant input at each level: one fixed path has $n+1$ possible label sequences and each cover tree matches only one.

For inputs a,b,a and target $\theta=a$, expert 1 outputs +1,−1,+1. The simpler “positive at one level only” construction fails here.

## 6 Littlestone Dimension: Realizing Every Path Labeling

\[
\forall\epsilon\in\{-1,+1\}^n,\ \exists f\in\mathcal F,\quad
f(\mathbf x_t(\epsilon_{<t}))=\epsilon_t\quad\forall t.
\]

Here $\epsilon$ both determines branches and prescribes labels. In zero-covering it only determines the path. Different paths may use different functions, but one path must use a single function. Littlestone dimension is the largest shattered depth. A fixed input sample is a tree constant at each level, so VC dimension is no larger.

For singleton indicators, any root can be labeled positive by its own singleton or negative by another. After a positive root, exactly one function survives; whatever the next input is, it cannot realize both labels there. Hence the dimension is 1. A nonempty zero-dimensional class agrees at every input and contains one distinct function. Assigning −1 to the empty class is useful for algorithms.

## 7 Sequential Sauer: Why Maximum Rather Than Product

Split a dimension-$d$ class at the root into $\mathcal F_+,\mathcal F_-$. Both cannot retain dimension $d$: attach their shattered depth-$d$ trees below this root and obtain a shattered depth-$d+1$ tree. Thus one side has dimension at most $d-1$, the other at most $d$.

For the positive-label subclass, suppose the original input tree’s left subtree needs a representatives and its right subtree b. Every representative on each side only needs to appear in some pair. Repeat the shorter list and use $\max(a,b)$ pairs. Once a path goes left, the right representative is irrelevant, and conversely. Simultaneously matching every branch would instead call for a Cartesian product of size $ab$.

\[
g(d,n)\le g(d,n-1)+g(d-1,n-1),\quad
g(0,n)=1,\quad g(d,0)=1.
\]

The choice $g(d,n)=\sum_{i=0}^{\min(d,n)}\binom ni$ satisfies the boundaries and Pascal recursion. When $d\ge n$, the sum is $2^n$, closing a boundary omitted in the source induction. This proves the first part of Theorem 2.

The exponential bound follows directly. Set $x=d/n\in(0,1]$. For $i\le d$, $x^i\ge x^d$, so

\[
x^d\sum_{i=0}^d\binom ni
\le\sum_{i=0}^d\binom ni x^i
\le(1+x)^n\le e^{nx}=e^d.
\]

Dividing by $x^d$ gives $(en/d)^d$. For $d=2,n=10$, the binomial sum is 56 and the exponential bound is approximately 184.7. The latter sacrifices constants for simplicity. Substitution yields Corollary 1’s $\sqrt{2d\ln(en/d)/n}$.

## 8 Necessity: Fresh Labels Defeat Every Learner

If arbitrary depths can be shattered, choose a depth-$n$ tree and let the environment provide $(x_t,y_t)=(\mathbf x_t(\epsilon_{<t}),\epsilon_t)$. Even after seeing the current input, the learner faces a fresh fair label, so conditional binary error probability is exactly $1/2$. Expected total loss is $n/2$. Shattering provides one perfect function on **each realized path**, giving zero comparator loss. Average regret is at least $1/2$. Together with the upper bound, finite Littlestone dimension characterizes binary online learnability.

A finite-dimension lower bound also has a clear construction. As a supplementary derivation, first take $n=dm$. Use a shattered depth-$d$ tree, repeat each visited node m times, and draw fresh fair labels. At the end of a block, use its majority label to select the next branch, with a fixed tie rule. Shattering provides a function predicting every block majority. If the block sum is $S_m$, then

\[
\text{learner expected block loss}=\frac m2,\qquad
\text{comparator block loss}=\frac{m-|S_m|}{2}.
\]

Expected regret is $d\,\mathbb E|S_m|/2$. A Rademacher sum satisfies $\mathbb E|S_m|\ge\sqrt{m/2}$, obtainable from its central-binomial-coefficient formula or Khintchine’s inequality. Hence

\[
\frac{\mathbb E\operatorname{Reg}}n
\ge\frac{d}{2n}\sqrt{\frac m2}
=\sqrt{\frac d{8n}}\qquad(n=dm).
\]

The handout leaves the precise constant for all $d\le n$ to HW2; the divisible case above is not presented as that full proof. Unequal blocks of lengths differing by at most one already give the same order, for example $\sqrt{d/n}/4$. This explains that the gap is logarithmic, not a different power of dimension or horizon.

## 9 Thresholds: VC Dimension One Is Not Enough Online

Take $f_\theta(x)=+1$ exactly when $x\le\theta$. Two fixed points cannot realize arbitrary labels, so VC dimension is 1. An online adversary can instead keep bisecting the remaining threshold interval:

```text
                       1/2
            label −1 /     \ label +1
                   1/4     3/4
                 /    \   /    \
               1/8   3/8 5/8   7/8
```

A positive label requires the threshold to be at least the current input, so probe the right half next; a negative label sends the probe left. Each step leaves a nonempty interval, so no finite number of rounds exhausts real thresholds.

For a rigorous ordering argument, after going right at round $t$, the first increase is $2^{-(t+1)}$. The total possible subsequent leftward movement is strictly smaller, being a finite geometric sum. Thus every later node remains larger than the round-$t$ node; the left case is symmetric. Every positive node lies below every negative node. Choose

\[
\theta\in\left[\max_{t:\epsilon_t=+1}x_t,\ \min_{t:\epsilon_t=-1}x_t\right),
\]

with defaults 0 and 1 for empty sides. For labels +1,−1,+1 the visited points are $1/2,3/4,5/8$, and any threshold in $[5/8,3/4)$ works. This proves shattering for every finite depth, without asserting that every infinite path has a positive-width interval.

## 10 Regression Covers and Normalization

\[
d_{p,\epsilon}(f,\mathbf v)=
\left(\frac1n\sum_t|f(\mathbf x_t(\epsilon))-\mathbf v_t(\epsilon)|^p\right)^{1/p}.
\]

Division by $n$ means normalized radius $\alpha$ in the two-norm corresponds to ordinary Euclidean error $\alpha\sqrt n$. The quantifiers remain “a representative for each function and path.” Normalized power means satisfy $d_1\le d_2\le d_\infty$, giving the same ordering of covering numbers. Increasing the radius weakens the requirement and cannot increase the cover size.

Theorem 4 follows by adding and subtracting a representative. For a fixed function and path,

\[
\frac1n\sum_t\epsilon_t(f(\mathbf x_t)-\mathbf v_t^{f,\epsilon})
\le\frac1n\sum_t|f(\mathbf x_t)-\mathbf v_t^{f,\epsilon}|
\le\alpha.
\]

The remaining representative term is bounded by the maximum over the finite cover, then Theorem 1 applies. Representatives may depend on the full path because the maximum already ranges over every representative.

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\inf_{\alpha\ge0}\left\{\alpha+
\sqrt{\frac{2\ln\mathcal N_1(\mathcal F|_{\mathbf x},\alpha)}n}\right\}.
\]

This compresses at only one scale. Dudley uses progressively finer covers so small details incur small-amplitude costs. Theorem 5 states

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\inf_{0\le\alpha\le1}
\left\{4\alpha+\frac{12}{\sqrt n}\int_\alpha^1
\sqrt{\ln\mathcal N_2(\mathcal F|_{\mathbf x},\delta)}\,d\delta\right\}.
\]

The cutoff $4\alpha$ avoids resolving scales with enormous or infinite covering numbers and controls the residual by approximation error. The square-root logarithm comes from the finite maximum inequality at each scale. Full sequential chaining must handle predictability and localized errors after pathwise representative selection; path-dependent representatives cannot simply be treated as fixed processes. This intuition is not a full proof, and Theorem 5 remains an invoked result.

## 11 Sequential Fat Dimension: The Witness Is a Tree

\[
\exists\mathbf y,\ \forall\epsilon,\ \exists f\in\mathcal F,\quad
\epsilon_t(f(\mathbf x_t(\epsilon_{<t}))-\mathbf y_t(\epsilon_{<t}))\ge\alpha/2
\quad\forall t.
\]

Witness thresholds may depend on the past but not the current label; otherwise moving a threshold afterward would trivialize the definition. The dimension is the maximum depth permitting such fixed positive-margin branching and is nonincreasing in scale. Ordinary fat on fixed points is a special case with level-constant inputs and witnesses and can be smaller.

\[
\ln\mathcal N_\infty(\mathcal F|_{\mathbf x},\alpha)
\le\operatorname{sfat}(\mathcal F,\alpha)\ln(2en/\alpha),\qquad0<\alpha\le1.
\]

This is Theorem 6, stated without proof. It requires discretization and scale-sensitive sequential combinatorics, not an unproved direct substitution into binary Sauer. Combine it with the ordering of covers and Dudley to recover the final chain. Use the uniform fat bound over all trees and $\sup\inf\le\inf\sup$; this is not equality from freely exchanging the two operators.

For learnability characterizations and the external results, see [Rakhlin, Sridharan, and Tewari (2015)](https://jmlr.org/papers/v16/rakhlin15a.html). Conditions depend on the loss and decision protocol. A logarithmic upper bound alone does not establish the same rate for every class finite at each scale without checking scale growth.

## 12 Linear Example: Evaluating the Entropy Integral

Hölder bounds linear functions on dual unit balls in $[-1,1]$. Parameter distance at most $\alpha$ in the $p$-norm gives prediction error at most $\alpha$ at every allowed input. A volume cover of size $(1+2/\alpha)^d$ therefore works pointwise and on every tree. Thus

\[
\mathcal R^{\mathrm{seq}}(\mathcal F)
\le\frac{12\sqrt d}{\sqrt n}\int_0^1\sqrt{\ln(1+2/\delta)}\,d\delta.
\]

For $0<\delta\le1$, $1+2/\delta\le3/\delta$. Subadditivity of square root and substitution $u=\ln(1/\delta)$ give

\[
\begin{aligned}
\int_0^1\sqrt{\ln(1+2/\delta)}\,d\delta
&\le\sqrt{\ln3}+\int_0^1\sqrt{\ln(1/\delta)}\,d\delta\\
&=\sqrt{\ln3}+\int_0^\infty\sqrt u\,e^{-u}\,du
=\sqrt{\ln3}+\frac{\sqrt\pi}{2}.
\end{aligned}
\]

The integral is a constant, yielding $O(\sqrt{d/n})$. This bounds complexity; general-loss contraction may add logarithms. As a supplement, Euclidean unit balls admit a stronger dimension-free calculation:

\[
\begin{aligned}
\mathcal R^{\mathrm{seq}}(\mathcal F)
&=\frac1n\sup_{\mathbf x}\mathbb E\left\|\sum_t\epsilon_t\mathbf x_t(\epsilon)\right\|_2\\
&\le\frac1n\sup_{\mathbf x}\sqrt{\mathbb E\left\|\sum_t\epsilon_t\mathbf x_t(\epsilon)\right\|_2^2}
\le\frac1{\sqrt n}.
\end{aligned}
\]

Cross terms vanish by conditioning on $\epsilon_{<t}$ for $s<t$: both vectors and $\epsilon_s$ are known, while $\epsilon_t$ has mean zero. Squared norms sum to at most $n$. This foreshadows Lecture 7’s dimension-free Perceptron bound.

## 13 Why the Monotone Counterexample Reverses the Path

The threshold tree with positive labels branching right places positive points left of negative points, corresponding to a nonincreasing classifier. For a **nondecreasing** regressor, negatives must lie left of positives. Traverse according to $-\epsilon$ but label with $\epsilon_t$. Then

\[
(x_t,y_t)=(\mathbf x_t(-\epsilon_{<t}),\epsilon_t),\qquad
\mathbb E[(a_t-y_t)^2\mid\text{past},a_t]=a_t^2+1\ge1.
\]

Every algorithm incurs expected cumulative squared loss at least $n$. On each path, a step function from −1 to +1 fits every point with zero loss, forcing linear regret. This step-function subclass also shatters arbitrary depths with witness zero for every $0<\alpha\le2$, so sequential fat is infinite, unlike the ordinary $O(1/\alpha)$ fat dimension.

The transductive setting changes information by revealing the input set in advance; the handout states learnability there. That statement is not proved here, and knowing the set does not mean knowing its order or labels.

## 14 Surrogates Change the Comparator Loss

\[
\mathbf1\{ys\le0\}\le\max(1-ys,0),\qquad
\mathbf1\{ys\le0\}\le\frac{\ln(1+e^{-ys})}{\ln2}.
\]

If $ys\le0$, hinge is at least 1 and natural-log logistic at least $\ln2$; otherwise the left side is zero. Thus the displayed inequalities hold pointwise. Unnormalized natural-log logistic does not upper-bound zero-one loss: $s=0$ gives $1>\ln2$.

\[
\sum_t\mathbf1\{y_tf_t(x_t)\le0\}
\le\inf_f\sum_t\ell'(f,(x_t,y_t))+\operatorname{Reg}_{\ell'}(\mathcal F,n).
\]

Small regret approaches the best **surrogate loss**, not the best zero-one error count, so it does not contradict threshold impossibility. The bound is useful when a good-margin comparator has small hinge loss. Normalized natural-log logistic has Lipschitz constant $1/\ln2$, not 1. Counting zero margins as errors also differs from a fixed sign tie rule.

## 15 Self-Test and Reading Route

1. Why does path-dependent representative selection not reveal the future? The cover is fixed; the maximum is taken afterward in analysis, not by an online decision.
2. Which expert covers a,b,a with target a? The first-positive-at-round-one expert, predicting +,−,+.
3. Why use a maximum when pairing same-label subcovers? A path visits only one subtree.
4. What happens at $d=0$? A nonempty class has one function, cover size 1, and complexity 0. Do not evaluate $0\ln(en/0)$ literally.
5. What threshold interval realizes +,−,+? $[5/8,3/4)$.
6. What factor is missing for natural-log logistic? $1/\ln2$.
7. Why does linear regression learnability not imply linear zero-one classification learnability? The loss and comparator have changed.

First read Sections 4–9 to master trees and quantifiers. Next rederive Sections 2–3 and 7 for concentration and recursion. Then read Sections 10–14 and compute the integral and zero-score logistic value. Proceed to Lecture 7: dimensions become realizable mistake budgets, and Hedge aggregates experts in the agnostic case.
