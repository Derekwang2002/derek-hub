---
title: "Lecture 6 Full Handout"
summary: "Complete reading edition preserving all sections, results, proofs, and numbering: finite-class concentration, zero-covers, littlestone dimension, online regression, and sequential fat dimension, with explicit editorial notes."
---

**Fall 2026. Haipeng Luo.**

> Reading edition of all eight pages, retaining four sections, subsection 3.1, Lemma 1, Theorems 1–6, Corollary 1, Proposition 1, Equations (1)–(3), both regression examples, and the footnote. Source: lecture6.pdf (local source, not published online). Companion: [detailed explanation](/projects/csci678/lecture-6-explanation). Editorial notes are explicit. The original has no figures or bibliography.

## 1 Online Learning with a Finite Class

The previous lecture introduced online learning and derived the following sequence of upper bounds on the game value:

\[
\begin{aligned}
\mathcal V^{\mathrm{seq}}(\mathcal F,n)
&\le\sup_{\mathbf P\in\Delta(\mathcal Z^n)}
\mathbb E_{z_{1:n}\sim\mathbf P}\sup_{f\in\mathcal F}\frac1n\sum_{t=1}^n
\left(\mathbb E_{z'_t\sim\mathbf P(\cdot\mid z_{1:t-1})}\ell(f,z'_t)-\ell(f,z_t)\right)\\
&\le2\mathcal R^{\mathrm{seq}}(\ell(\mathcal F))
\lesssim\mathcal R^{\mathrm{seq}}(\mathcal F).
\end{aligned}
\]

The first two steps are general; the last is specific to supervised learning. Its shorthand suppresses the Lipschitz constant and possible logarithmic factor from contraction. This lecture bounds $\mathcal R^{\mathrm{seq}}(\mathcal F)$, starting with finite classes and the maximal inequality.

**Lemma 1 (Maximal Inequality).** If the finite collection $\{U_f\}_{f\in\mathcal F}$ consists of variables with the zero-centered $\sigma$-sub-Gaussian moment-generating-function bound, then

\[
\mathbb E\max_{f\in\mathcal F}U_f\le\sigma\sqrt{2\ln|\mathcal F|}.
\]

**Theorem 1.** Let $\mathcal F\subseteq\mathcal Y^{\mathcal X}$ be finite. For every input tree,

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\frac1n\sqrt{2\left(\max_{f\in\mathcal F}\max_\epsilon
\sum_{t=1}^n f^2(\mathbf x_t(\epsilon))\right)\ln|\mathcal F|}.
\]

Consequently, if $\mathcal Y\subseteq[-C,C]$, then

\[
\mathcal R^{\mathrm{seq}}(\mathcal F)\le C\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\]

**Proof.** Write

\[
U_{f,\tau}=\sum_{t=1}^{\tau}\epsilon_tf(\mathbf x_t(\epsilon)),\qquad
\sigma^2=\max_f\max_\epsilon\sum_{t=1}^n f^2(\mathbf x_t(\epsilon)).
\]

It suffices to show that $U_{f,n}$ is $\sigma$-sub-Gaussian, then apply Lemma 1 and divide by $n$. For positive $\lambda$, first peel off the last round:

\[
\begin{aligned}
\mathbb E e^{\lambda U_{f,n}}
&=\mathbb E\left[e^{\lambda U_{f,n-1}}
\mathbb E\left[e^{\lambda\epsilon_n f(\mathbf x_n(\epsilon))}\mid\epsilon_{1:n-1}\right]\right]\\
&\le\mathbb E\left[e^{\lambda U_{f,n-1}}
e^{\lambda^2 f^2(\mathbf x_n(\epsilon))/2}\right].
\end{aligned}
\]

Conditionally on the past, $\epsilon_nf(\mathbf x_n(\epsilon))$ is sub-Gaussian with parameter $|f(\mathbf x_n(\epsilon))|$. Peeling one more round gives

\[
\mathbb E\left[e^{\lambda U_{f,n-2}}
\mathbb E\left[e^{\lambda\epsilon_{n-1}f(\mathbf x_{n-1}(\epsilon))}
e^{\lambda^2f^2(\mathbf x_n(\epsilon))/2}\mid\epsilon_{1:n-2}\right]\right].
\]

The final squared term still depends on $\epsilon_{n-1}$, so it cannot simply be treated as constant. First take a worst case:

\[
\begin{aligned}
&\le\mathbb E\left[e^{\lambda U_{f,n-2}}
\mathbb E\left[e^{\lambda\epsilon_{n-1}f(\mathbf x_{n-1}(\epsilon))}\mid\epsilon_{1:n-2}\right]
\max_{\epsilon_{n-1}}e^{\lambda^2 f^2(\mathbf x_n(\epsilon))/2}\right]\\
&\le\mathbb E\left[e^{\lambda U_{f,n-2}}\max_{\epsilon_{n-1}}
e^{\frac{\lambda^2}{2}(f^2(\mathbf x_{n-1}(\epsilon))+f^2(\mathbf x_n(\epsilon)))}\right]\\
&\le\mathbb E\left[e^{\lambda U_{f,n-2}}\max_{\epsilon_{n-2},\epsilon_{n-1}}
e^{\frac{\lambda^2}{2}(f^2(\mathbf x_{n-1}(\epsilon))+f^2(\mathbf x_n(\epsilon)))}\right].
\end{aligned}
\]

Continuing in the same fashion yields

\[
\mathbb E e^{\lambda U_{f,n}}
\le\max_\epsilon e^{\frac{\lambda^2}{2}\sum_{t=1}^n f^2(\mathbf x_t(\epsilon))}
\le e^{\lambda^2\sigma^2/2}.
\]

This proves that finite bounded classes are online learnable and will be a key ingredient for infinite classes.

## 2 Infinite Class: Online Binary Classification and Zero-Cover

Start with binary classification and zero-one loss. In statistical learning, even an infinite class has a finite projection on a fixed sample. The online analogue is

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
&=\frac1n\mathbb E_\epsilon\sup_{f\in\mathcal F}\sum_t\epsilon_t f(\mathbf x_t(\epsilon))\\
&=\frac1n\mathbb E_\epsilon\sup_{\mathbf v\in V}\sum_t\epsilon_t\mathbf v_t(\epsilon)
\le\sqrt{\frac{2\ln|V|}{n}},
\end{aligned}\tag{1}
\]

\[
V=\mathcal F|_{\mathbf x}
=\{(f\circ\mathbf x_1,\ldots,f\circ\mathbf x_n):f\in\mathcal F\}.
\]

The projection is a finite set of binary-valued trees. A depth-$n$ tree has $2^n-1$ nodes, so its projection can have size $2^{2^n-1}$, whereas a statistical sample has at most $2^n$ labelings. Both crude bounds are vacuous for learnability. Perhaps a simple class has a small projection? Unfortunately, consider the singleton-indicator class on the real line:

\[
\mathcal F=\left\{f_\theta(x)=
\begin{cases}+1,&x=\theta,\\-1,&x\ne\theta,\end{cases}\ \middle|\ \theta\in\mathbb R\right\}.\tag{2}
\]

Each classifier predicts +1 at exactly one input. It cannot shatter two points, so its VC dimension is exactly 1 and it is statistically learnable. But if all nodes of the input tree are distinct, the projection contains the all-negative tree and $2^n-1$ trees with a single positive node: $2^n$ trees in total. Bound (1) is again vacuous. Is projection the wrong measure, or is even this simple class not online learnable? Fortunately, the former is true.

A projection requires

\[
\forall f\in\mathcal F,\ \exists\mathbf v\in V,\ \forall\epsilon\in\{-1,+1\}^n,\quad
f(\mathbf x_t(\epsilon))=\mathbf v_t(\epsilon)\quad\forall t.
\]

Swapping two quantifiers gives a weaker property that already suffices for (1), with its second equality changed to an inequality:

\[
\forall f\in\mathcal F,\ \forall\epsilon\in\{-1,+1\}^n,\ \exists\mathbf v\in V,\quad
f(\mathbf x_t(\epsilon))=\mathbf v_t(\epsilon)\quad\forall t.
\]

Such a set $V$ is a **zero-cover** of $\mathcal F|_{\mathbf x}$, and its minimum size is $\mathcal N_0(\mathcal F|_{\mathbf x})$. Hence

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\sqrt{\frac{2\ln\mathcal N_0(\mathcal F|_{\mathbf x})}{n}}.
\]

A zero-cover is no larger than the projection, which covers itself. It is also always at most $2^n$: take all trees constant within each level, one for each binary sequence of length $n$. They match every possible path labeling. This crude bound is still vacuous but matches the statistical setting’s crude bound.

The class in (2) has a zero-cover of size at most $n+1$, implying online learnability. First consider the special case with no repeated input on any path. Use the all-negative tree and, for each level $t$, a tree positive throughout level $t$ and negative elsewhere. Repeated values make direct construction less obvious. Ideally a combinatorial parameter analogous to VC dimension would control covers through a Sauer-type lemma. The next section provides one.

> Editorial note: the source says “zero-covering number $n+1$.” For an arbitrary fixed tree this is an upper bound, not always equality. If every input is identical, two trees suffice; a worst-case tree can attain $n+1$.

## 3 Littlestone Dimension

A class **shatters** a tree $\mathbf x$ if every path/label sequence can be matched by one function along the entire path:

\[
\forall\epsilon\in\{-1,+1\}^n,\ \exists f\in\mathcal F,\quad
f(\mathbf x_t(\epsilon))=\epsilon_t\quad(t=1,\ldots,n).
\]

The **Littlestone dimension** $\operatorname{Ldim}(\mathcal F)$ is the maximum depth of a shattered tree: zero when no positive-depth tree is shattered, and infinity when every finite depth is possible. (Original note 1) VC dimension never exceeds Littlestone dimension: fill level $t$ with the $t$-th point of a shattered fixed sample. For a nonempty class, Littlestone dimension zero implies VC dimension zero and thus only one distinct function.

To prove dimension $d$, construct a shattered depth-$d$ tree and rule out all depth-$d+1$ trees. The singleton class in (2) has dimension exactly 1: any root can be shattered, but after a positive first label only one function remains, so both $(+1,+1)$ and $(+1,-1)$ cannot be realized. HW2 studies a higher-dimensional extension. The following Sauer analogue also provides a recursive cover construction.

**Theorem 2.** For any depth-$n$ input tree and binary class of dimension $d<n$,

\[
\mathcal N_0(\mathcal F|_{\mathbf x})\le\sum_{i=0}^d\binom ni\le\left(\frac{en}{d}\right)^d.
\]

**Proof.** Let $g(d,n)=\sum_{i=0}^d\binom ni$. The second inequality was established in Sauer’s lemma. Induct on $d+n$. The base $d=0,n=1$ is immediate, and any case $d=0$ needs one tree. Now take $d>0$ and partition by the root input $x_1$:

\[
\mathcal F_-=\{f\in\mathcal F:f(x_1)=-1\},\qquad
\mathcal F_+=\{f\in\mathcal F:f(x_1)=+1\}.
\]

Let $\mathbf x^\ell,\mathbf x^r$ be the root’s subtrees. Take minimal zero-covers $V_+^\ell,V_+^r$ for $\mathcal F_+$ on them. Construct $V_+$ with positive roots and pair elements of the two subcovers as left and right subtrees, ensuring every element appears. Repeat elements of the shorter list, so only the maximum of the two sizes is needed. A path enters only one subtree, making this a valid cover of $\mathcal F_+|_{\mathbf x}$. Construct $V_-$ similarly and take their union.

Both subclasses cannot have dimension $d$. Otherwise attach their respective shattered depth-$d$ trees under $x_1$, producing a shattered depth-$d+1$ tree, a contradiction. Without loss of generality the negative subclass has dimension at most $d-1$. Induction gives

\[
\begin{aligned}
|V_+|&=\max\{|V_+^\ell|,|V_+^r|\}\le g(d,n-1),\\
|V_-|&=\max\{|V_-^\ell|,|V_-^r|\}\le g(d-1,n-1),\\
\mathcal N_0(\mathcal F|_{\mathbf x})&\le|V_-|+|V_+|
\le g(d-1,n-1)+g(d,n-1)=g(d,n).
\end{aligned}
\]

The final equality is Pascal’s identity. Zero-covering allows pairing by the maximum; covering entire projected trees could require a product of subtree cover sizes. For the singleton class, this gives $g(1,n)=n+1$, even with repeated inputs. Try the recursion on a small depth-three tree.

> Editorial note: the original induction is stated for $d<n$, but recursion can reach the boundary. Add the trivial case $g(d,m)=2^m$ for $d\ge m$ to close the induction. An empty subclass needs no cover; interpret the $d=0$ power bound as 1.

**Corollary 1.** The value for a binary class satisfies

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)\le\mathcal R^{\mathrm{seq}}(\mathcal F)
\le\sqrt{\frac{2d\ln(en/d)}n},\qquad d=\operatorname{Ldim}(\mathcal F).
\]

Finite Littlestone dimension is sufficient for online learnability and is also necessary. Use the display for $1\le d\le n$; the value is zero at $d=0$, and use a trivial bound for $d>n$.

**Theorem 3.** If Littlestone dimension is infinite, then the game value is at least $1/2$ for every horizon.

**Proof.** Take a shattered depth-$n$ tree and independent random signs. At time $t$, the environment provides $(\mathbf x_t(\epsilon),\epsilon_t)$. For every proper or improper binary algorithm, the current label is a fresh fair sign, so expected total loss is exactly $n/2$. Shattering provides a zero-error comparator on every realized path, so expected regret is $n/2$. HW2 establishes the stronger lower bound $\sqrt{d/(8n)}$ when $d\le n$.

**Summary.** Combining the classification bounds gives

\[
\begin{aligned}
\sqrt{\frac d{8n}}
&\le\mathcal V^{\mathrm{seq}}(\mathcal F,n)
\le\sup_{\mathbf P}\mathbb E\sup_f\frac1n\sum_t
\left(\mathbb E_{t-1}\ell(f,z_t)-\ell(f,z_t)\right)\\
&\le2\mathcal R^{\mathrm{seq}}(\ell(\mathcal F))
\le\mathcal R^{\mathrm{seq}}(\mathcal F)
\le\sup_{\mathbf x}\sqrt{\frac{2\ln\mathcal N_0(\mathcal F|_{\mathbf x})}{n}}
\le\sqrt{\frac{2d\ln(en/d)}n}.
\end{aligned}
\]

Here $d\le n$, and the conditional expectation denotes the loss of an independent conditional copy. The bounds still differ by a logarithmic factor; “tight” here does not mean equality up to an absolute constant.

## 3.1 Online Learning Is Strictly Harder

The online-to-batch conversion from Lecture 1 showed that online learning is at least as hard. The singleton class, whose two dimensions both equal 1, does not show strict separation. Instead consider thresholds on the real line:

\[
\mathcal F=\left\{f_\theta(x)=
\begin{cases}+1,&x\le\theta,\\-1,&x>\theta,\end{cases}\ \middle|\ \theta\in\mathbb R\right\}.\tag{3}
\]

Lecture 2 established VC dimension exactly 1, but its Littlestone dimension is infinite. **Proposition 1.** The threshold class in (3) has infinite Littlestone dimension.

**Proof.** Construct an infinite input tree with root $1/2$. A node of value $a$ at level $t$ has left and right children $a-2^{-(t+1)}$ and $a+2^{-(t+1)}$. Draw the tree to see the construction. For any finite depth and path, set

\[
L=\max_{t:\epsilon_t=+1}\mathbf x_t(\epsilon),\qquad
U=\min_{t:\epsilon_t=-1}\mathbf x_t(\epsilon),
\]

Use defaults 0 and 1 when the corresponding sets are empty. We claim $L<U$; then every $\theta\in[L,U)$ matches all path labels. After a positive step, every later node on the path is larger; after a negative step, every later node is smaller. Thus every positive node is strictly smaller than every negative node, regardless of their temporal order. Hence $L<U$, completing the proof.

Thus this simple class is statistically learnable but not online learnable. More generally, affine linear classifiers

\[
\mathcal F=\{x\mapsto\operatorname{sign}(\langle x,\theta\rangle+b):
\theta\in\mathbb R^d,\ b\in\mathbb R\}
\]

contain thresholds and therefore have infinite Littlestone dimension despite finite VC dimension $d+1$. Online learning is strictly harder. Is this too restrictive if even linear classification is impossible? For online zero-one loss, in a sense yes. Yet in statistical learning, finite VC dimension only gives learnability via ERM; computing ERM can still be difficult for linear classifiers. Practice therefore uses nicer surrogate losses, moving toward regression, where more possibilities open up online as well.

## 4 Online Regression

Now let $\mathcal F\subseteq[-1,+1]^{\mathcal X}$. A set $V$ of trees valued in this interval is an $\ell_p$ $\alpha$-cover of $\mathcal F|_{\mathbf x}$ if

\[
\forall f\in\mathcal F,\ \forall\epsilon\in\{-1,+1\}^n,\ \exists\mathbf v\in V,\quad
\left(\frac1n\sum_{t=1}^n|f(\mathbf x_t(\epsilon))-\mathbf v_t(\epsilon)|^p\right)^{1/p}\le\alpha.
\]

The quantifier order agrees with zero-covering and parallels approximate covering in the statistical setting. The smallest size is $\mathcal N_p(\mathcal F|_{\mathbf x},\alpha)$. It is nonincreasing in radius $\alpha$, and, under this normalization, nondecreasing in $p$. For $p=\infty$, use maximum error along a path. Covering reduces infinite classes to finite ones.

**Theorem 4.** For every input tree,

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\inf_{\alpha\ge0}\left\{\alpha+
\sqrt{\frac{2\ln\mathcal N_1(\mathcal F|_{\mathbf x},\alpha)}n}\right\}.
\]

**Proof.** Fix $\alpha$, choose a minimal cover $V$, and let $\mathbf v^{f,\epsilon}$ be a representative for that function and path. Add and subtract it, split the supremum, and apply the approximation property and Theorem 1:

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
&=\frac1n\mathbb E\sup_f\sum_t\epsilon_t
\{f(\mathbf x_t(\epsilon))-\mathbf v_t^{f,\epsilon}(\epsilon)+\mathbf v_t^{f,\epsilon}(\epsilon)\}\\
&\le\frac1n\mathbb E\sup_f\sum_t\epsilon_t
\{f(\mathbf x_t(\epsilon))-\mathbf v_t^{f,\epsilon}(\epsilon)\}
+\frac1n\mathbb E\sup_f\sum_t\epsilon_t\mathbf v_t^{f,\epsilon}(\epsilon)\\
&\le\alpha+\frac1n\mathbb E\sup_{\mathbf v\in V}\sum_t\epsilon_t\mathbf v_t(\epsilon)
\le\alpha+\sqrt{\frac{2\ln\mathcal N_1(\mathcal F|_{\mathbf x},\alpha)}n}.
\end{aligned}
\]

Take the infimum over radii. Similar chaining techniques give the tighter Dudley entropy integral; the handout omits the proof.

**Theorem 5.**

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x)
\le\inf_{0\le\alpha\le1}\left\{4\alpha+
\frac{12}{\sqrt n}\int_\alpha^1\sqrt{\ln\mathcal N_2(\mathcal F|_{\mathbf x},\delta)}\,d\delta\right\}.
\]

Again a combinatorial parameter controls covering numbers. A tree is $\alpha$-shattered if there exists a witness tree $\mathbf y$, valued in $[-1,+1]$, such that

\[
\forall\epsilon\in\{-1,+1\}^n,\ \exists f\in\mathcal F,\quad
\epsilon_t(f(\mathbf x_t(\epsilon))-\mathbf y_t(\epsilon))\ge\alpha/2
\quad(t=1,\ldots,n),
\]

and the largest such depth is the **sequential fat-shattering dimension**, denoted $\operatorname{sfat}(\mathcal F,\alpha)$. The following connection is also stated without proof.

**Theorem 6.** For positive $\alpha$, depth $n$, and the preceding class, the handout states

\[
\ln\mathcal N_\infty(\mathcal F|_{\mathbf x},\alpha)
\le\operatorname{sfat}(\mathcal F,\alpha)\ln\left(\frac{2en}{\alpha}\right).
\]

> Editorial note: use this at the effective scales $0<\alpha\le1$; for $\alpha\ge1$, the zero tree already covers and the covering number is 1. Avoid formal products of infinite dimensions and negative logarithms. Match the handout’s $\alpha/2$ margin convention when comparing sources.

### Example 1: Linear Functions

Recall $\mathcal F=\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\}$ on $\mathcal X=B_q^d$, with $p,q\ge1$ and $1/p+1/q=1$. Proposition 2 of Lecture 3 gave a pointwise cover $H$ of size at most $(2/\alpha+1)^d$. Projecting it onto any tree gives a sequential cover, hence

\[
\mathcal N_\infty(\mathcal F|_{\mathbf x},\alpha)\le(2/\alpha+1)^d,\qquad
\mathcal R^{\mathrm{seq}}(\mathcal F)=O(\sqrt{d/n}).
\]

The latter follows from the previously computed Dudley integral. Linear real-valued classes are therefore online learnable, with the same complexity rate as statistically. Passing to a game value through general Lipschitz contraction still carries its additional factor; the complexity rate is not unconditionally the regret rate for every loss.

### Example 2: Nondecreasing Functions

Statistically, all nondecreasing functions from the real line to $[-1,+1]$ have a covering estimate written in the handout as $(n+1)^{1/\alpha}$ and fat dimension $O(1/\alpha)$. Online, no corresponding learnability bound is possible because the problem is not online learnable. Use the bisection tree from Proposition 1 and let the environment choose

\[
(x_t,y_t)=(\mathbf x_t(-\epsilon),\epsilon_t),\qquad
\ell(f,(x,y))=(f(x)-y)^2.
\]

Notice the reversed path signs. The current label is equally likely to be positive or negative, so every prediction has conditional expected squared loss at least

\[
\frac12\min_{\widehat y}\{(\widehat y-1)^2+(\widehat y+1)^2\}=1.
\]

On the other hand, every negatively labeled input lies to the left of every positively labeled input. A nondecreasing function can interpolate all observations with zero squared loss, forcing linear regret. The handout additionally remarks, without details, that the problem becomes learnable in the transductive setting where the input set is known in advance, though neither its order nor labels are known.

> Editorial note: 1 is a lower bound on **conditional expected loss**, not on every realized loss. The statistical cover expression retains the source’s scale shorthand; interval length, rounding, and radius conventions affect constants in its exponent, not the online impossibility conclusion.

### Bridging Classification and Regression

Binary classifiers often have the form $\mathcal H=\{\operatorname{sign}(f(\cdot)):f\in\mathcal F\}$: a score’s sign predicts the label and its magnitude expresses confidence. Choosing scores instead of their classifiers does not change the zero-one problem. With the handout’s conservative convention for zero scores, loss is $\mathbf1\{yf(x)\le0\}$. Infinite $\operatorname{Ldim}(\mathcal H)$ does not become learnable merely by rewriting it.

But one may optimize an online-learnable surrogate $\ell'$ that upper-bounds zero-one loss. Then

\[
\sum_{t=1}^n\mathbf1\{y_tf_t(x_t)\le0\}
\le\sum_{t=1}^n\ell'(f_t,(x_t,y_t))
=\inf_{f\in\mathcal F}\sum_{t=1}^n\ell'(f,(x_t,y_t))
+\operatorname{Reg}_{\ell'}(\mathcal F,n).
\]

The source mixes $T$ and $n$ here; this edition consistently uses $n$. If expected average regret tends to zero, the learner’s average mistakes are controlled by the best function’s average **surrogate loss** plus a vanishing term. This avoids the zero-one impossibility using a different comparator loss. Statistical learning often does the same for computational reasons. Typical surrogates are

\[
\ell_{\mathrm{hinge}}(f,(x,y))=\max\{1-yf(x),0\},\qquad
\ell_{\mathrm{logistic}}(f,(x,y))=\log(1+e^{-yf(x)}).
\]

The handout says both losses are 1-Lipschitz in the score. Sufficient control of sequential fat dimension at every scale then yields online learnability and meaningful mistake bounds.

> Editorial note: with natural logarithms, logistic loss equals $\ln2<1$ at zero score and does not directly upper-bound this zero-one loss. The correct inequality is $\mathbf1\{yf(x)\le0\}\le\ell_{\mathrm{logistic}}/\ln2$; the normalized loss has Lipschitz constant $1/\ln2$. Both claims hold for hinge loss. A fixed binary sign convention at zero may also differ from the conservative zero-margin loss.

### Summary

For $G$-Lipschitz regression loss, the handout summarizes

\[
\begin{aligned}
\mathcal V^{\mathrm{seq}}(\mathcal F,n)
&\le\sup_{\mathbf P}\mathbb E\sup_f\frac1n\sum_t
\{\mathbb E_{t-1}\ell(f,z_t)-\ell(f,z_t)\}\\
&\le2\mathcal R^{\mathrm{seq}}(\ell(\mathcal F))
\le O(G\ln^{3/2}n)\mathcal R^{\mathrm{seq}}(\mathcal F)\\
&\le O(G\ln^{3/2}n)\sup_{\mathbf x}\inf_{0\le\alpha\le1}
\left\{4\alpha+\frac{12}{\sqrt n}\int_\alpha^1
\sqrt{\ln\mathcal N_2(\mathcal F|_{\mathbf x},\delta)}\,d\delta\right\}\\
&\le O(G\ln^{3/2}n)\inf_{0\le\alpha\le1}
\left\{4\alpha+\frac{12}{\sqrt n}\int_\alpha^1
\sqrt{\operatorname{sfat}(\mathcal F,\delta)\ln(2en/\delta)}\,d\delta\right\}.
\end{aligned}
\]

The handout states that these bounds are tight in an appropriate sense and sequential fat dimension is the right complexity measure. This finishes its discussion of statistical and online learnability for classification and regression. The next lecture begins algorithm design. The full equivalence theorem and its conditions are not proved here and do not follow automatically from this single logarithmic upper bound.

## Original Footnote

**Original note 1:** In sequential Rademacher complexity and shattering, $\epsilon$ represents both a path and a labeling. In zero-covering, it represents only a path.
