---
title: "Lecture 5 Full Handout"
summary: "Complete reading edition preserving all sections, results, proofs, and numbering: sequential games, duality, martingale differences, symmetrization, and sequential rademacher complexity, with explicit editorial notes."
---

**Fall 2026. Instructor: Haipeng Luo.**

> English reading edition of the six-page handout, retaining all sections, Theorems 1–2, Lemmas 1–2, Equations (1)–(3), proofs, and both footnotes. Source: lecture5.pdf (local source, not published online). Companion: [detailed explanation](/notes/csci678/lecture-5-explanation). Editorial notes distinguish additions from the handout. The original contains no figures or bibliography.

## 1 From Statistical Learning to Online Learning

Having developed a fairly complete picture of statistical learning, we now turn to the harder online setting. As discussed in Lecture 1, it removes the i.i.d. assumption, captures many modern machine-learning applications, and has powerful implications for optimization, game theory, privacy, and other areas. Despite the greater difficulty, similar but slightly more advanced techniques yield a parallel theory of learnability.

Recall the general sequential game. At each round $t=1,\ldots,n$, the learner predicts $\widehat y_t\in\mathcal D$ while the environment simultaneously chooses $z_t\in\mathcal Z$. The learner then suffers $\ell(\widehat y_t,z_t)$ and observes $z_t$. The goal is to minimize regret against a reference class $\mathcal F\subseteq\mathcal D$:

\[
\operatorname{Reg}(\mathcal F,n)=\sum_{t=1}^n\ell(\widehat y_t,z_t)-\inf_{f\in\mathcal F}\sum_{t=1}^n\ell(f,z_t).
\]

The value of this sequential game is written as:

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)=\inf_\pi\sup_{z_{1:n}}\mathbb E\!\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right].
\]

As proved in Lecture 1, this is at least $\mathcal V^{\mathrm{iid}}(\mathcal F,n)$. The class is online learnable if the value tends to zero with $n$. In an adaptive environment, $z_t$ may depend on previous decisions $\widehat y_{1:t-1}$, giving the following nested representation. We focus on adaptive environments and relax the value step by step along the statistical-learning roadmap.

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)=\left\langle\!\left\langle\inf_{q_t\in\Delta(\mathcal D)}\sup_{z_t\in\mathcal Z}\mathbb E_{\widehat y_t\sim q_t}\right\rangle\!\right\rangle_{t=1}^n\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right].
\]

> Editorial note: in the adaptive case, the sequence supremum is shorthand for an environment strategy, not merely a fixed sequence chosen beforehand. Double brackets denote operators nested in temporal order; operators from different rounds cannot be freely commuted.

## 1.1 Empirical Process with Dependent Data

In statistical learning, the first step was to choose ERM and bound the value by an expected supremum of an empirical process. Is there an online analogue? The first natural attempt is ERM at every step:

\[
\widehat y_t\in\operatorname*{argmin}_{f\in\mathcal F}\sum_{\tau=1}^{t-1}\ell(f,z_\tau).
\]

This is follow-the-leader. It can incur linear regret even on very simple problems, so it is not a good general online algorithm; the proof is deferred to lectures on algorithm design. Rather than search through candidate algorithms, we take a bolder route: relax the value directly without constructing one. The key is the minimax theorem. First introduce randomness for the environment, obtaining this equivalent form (check the equivalence):

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)=\left\langle\!\left\langle\inf_{q_t\in\Delta(\mathcal D)}\sup_{p_t\in\Delta(\mathcal Z)}\mathbb E_{\widehat y_t\sim q_t,z_t\sim p_t}\right\rangle\!\right\rangle_{t=1}^n\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right].
\]

Under mild technical conditions, which the handout assumes for the problems under discussion, minimax permits exchanging each round’s infimum and supremum:

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)=\left\langle\!\left\langle\sup_{p_t\in\Delta(\mathcal Z)}\inf_{q_t\in\Delta(\mathcal D)}\mathbb E_{\widehat y_t\sim q_t,z_t\sim p_t}\right\rangle\!\right\rangle_{t=1}^n\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right].
\]

The handout does not develop those technical conditions and instead examines their consequence. The environment first announces $p_t$; knowing it, the learner chooses $q_t$. This is the **dual game**. It appears more favorable to the learner, who moves second, but minimax says the optimal value is unchanged. This statement concerns the specified mixed strategies and information structure.

Second, the learner no longer needs randomness in the dual game: the best distribution places its mass on an optimal decision. Thus

\[
\mathcal V^{\mathrm{seq}}(\mathcal F,n)=\left\langle\!\left\langle\sup_{p_t\in\Delta(\mathcal Z)}\inf_{\widehat y_t\in\mathcal D}\mathbb E_{z_t\sim p_t}\right\rangle\!\right\rangle_{t=1}^n\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right].
\]

The environment now needs randomness, so randomness has also switched sides. Finally, even an exact optimal strategy in the dual game does not directly specify a strategy for the original game: the two fail a “type check.” One expects to see the environment’s distribution first; the other must act first. We retain information about the value but temporarily lose algorithmic information. Later lectures will address this. If an optimum is not attained, “optimal decision” means an arbitrarily accurate approximate minimizer.

Why is the dual value easier? One more upper-bounding step gives an empirical process with dependent data.

**Theorem 1.** The value of the dual game satisfies

\[
\begin{aligned}
&\left\langle\!\left\langle\sup_{p_t\in\Delta(\mathcal Z)}\inf_{\widehat y_t\in\mathcal D}\mathbb E_{z_t\sim p_t}\right\rangle\!\right\rangle_{t=1}^n
\left[\frac{\operatorname{Reg}(\mathcal F,n)}n\right]\\
&\quad\le\sup_{\mathbf P\in\Delta(\mathcal Z^n)}
\mathbb E_{z_{1:n}\sim\mathbf P}\left[\sup_{f\in\mathcal F}\frac1n\sum_{t=1}^n
\left(\mathbb E_{z'_t\sim\mathbf P(\cdot\mid z_{1:t-1})}\ell(f,z'_t)-\ell(f,z_t)\right)\right].
\end{aligned}\tag{1}
\]

Compare this with the following statistical-learning bound:

\[
\begin{aligned}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
&\le\sup_P\mathbb E\sup_{f\in\mathcal F}\left(L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)\right)\\
&=\sup_P\mathbb E_{z_{1:n}\sim P^n}\sup_{f\in\mathcal F}\frac1n\sum_{t=1}^n
\left(\mathbb E_{z'_t\sim P}\ell(f,z'_t)-\ell(f,z_t)\right).
\end{aligned}\tag{2}
\]

There are two differences. In (2), observations are independent draws from a worst-case distribution $P$; in (1), they come from a worst-case joint law $\mathbf P$ and need not be independent. The expected-loss term in (2) is the same each round, whereas the term in (1) conditions on $z_{1:t-1}$ and may change over time. Restricting (1) to product distributions recovers (2), so its bound is at least as large.

These random variables, indexed by $f$, form an **empirical process with dependent data**. For each fixed $f$, every difference has conditional mean zero given the past. Its average is therefore an average of martingale differences and should be small. Whether the supremum over $f$ remains small depends on the structure of the class.

**Proof of Theorem 1.** The handout proves the two-round case for notational simplicity; the same argument extends to general horizons. Multiply the value by two. To display every equality legibly, denote the two-round benchmark by B:

\[
B(z_1,z_2)=\inf_{f\in\mathcal F}\{\ell(f,z_1)+\ell(f,z_2)\}.
\]

\[
\begin{aligned}
&\sup_{p_1}\inf_{\widehat y_1}\mathbb E_{z_1}
\left[\sup_{p_2}\inf_{\widehat y_2}\mathbb E_{z_2}
\{\ell(\widehat y_1,z_1)+\ell(\widehat y_2,z_2)-B(z_1,z_2)\}\right]\\
&=\sup_{p_1}\inf_{\widehat y_1}\mathbb E_{z_1}
\left[\ell(\widehat y_1,z_1)+\sup_{p_2}\inf_{\widehat y_2}\mathbb E_{z_2}
\{\ell(\widehat y_2,z_2)-B(z_1,z_2)\}\right]\\
&=\sup_{p_1}\left\{\inf_{\widehat y_1}\mathbb E_{z'_1}\ell(\widehat y_1,z'_1)
+\mathbb E_{z_1}\left[\sup_{p_2}\inf_{\widehat y_2}\mathbb E_{z_2}
\{\ell(\widehat y_2,z_2)-B(z_1,z_2)\}\right]\right\}\\
&=\sup_{p_1}\mathbb E_{z_1}\sup_{p_2}
\left\{\inf_{\widehat y_1}\mathbb E_{z'_1}\ell(\widehat y_1,z'_1)
+\inf_{\widehat y_2}\mathbb E_{z_2}\{\ell(\widehat y_2,z_2)-B(z_1,z_2)\}\right\}\\
&=\sup_{p_1}\mathbb E_{z_1}\sup_{p_2}
\left\{\inf_{\widehat y_1}\mathbb E_{z'_1}\ell(\widehat y_1,z'_1)
+\inf_{\widehat y_2}\mathbb E_{z'_2}\ell(\widehat y_2,z'_2)
-\mathbb E_{z_2}B(z_1,z_2)\right\}\\
&=\sup_{p_1}\mathbb E_{z_1}\sup_{p_2}\mathbb E_{z_2}
\left\{\inf_{\widehat y_1}\mathbb E_{z'_1}\ell(\widehat y_1,z'_1)
+\inf_{\widehat y_2}\mathbb E_{z'_2}\ell(\widehat y_2,z'_2)-B(z_1,z_2)\right\}\\
&=\sup_{p_1}\mathbb E_{z_1}\sup_{p_2}\mathbb E_{z_2}\sup_{f\in\mathcal F}
\left\{\inf_{\widehat y_1}\mathbb E_{z'_1}\ell(\widehat y_1,z'_1)
+\inf_{\widehat y_2}\mathbb E_{z'_2}\ell(\widehat y_2,z'_2)
-\ell(f,z_1)-\ell(f,z_2)\right\}.
\end{aligned}\tag{3}
\]

Here $z'_1,z'_2$ are drawn from $p_1,p_2$, respectively, the same distributions as $z_1,z_2$. Taking care with dependencies, every step above is an equality. The only upper-bound step uses $\mathcal F\subseteq\mathcal D$: for each $f$ in the preceding supremum, replace both decision infima by that particular $f$. This gives

\[
\sup_{p_1}\mathbb E_{z_1}\sup_{p_2}\mathbb E_{z_2}\sup_{f\in\mathcal F}\{\mathbb E_{z'_1}\ell(f,z'_1)+\mathbb E_{z'_2}\ell(f,z'_2)-\ell(f,z_1)-\ell(f,z_2)\}.
\]

Finally, $\mathbb E_{z_1}\sup_{p_2}$ selects a distribution for every possible $z_1$. Equivalently, first take the supremum over maps $p_2:\mathcal Z\to\Delta(\mathcal Z)$, then take the expectation and draw the second outcome from $p_2(\cdot\mid z_1)$. The expression becomes

\[
\sup_{\mathbf P\in\Delta(\mathcal Z^2)}\mathbb E_{(z_1,z_2)\sim\mathbf P}\sup_{f\in\mathcal F}\{\mathbb E_{z'_1\sim\mathbf P_1}\ell(f,z'_1)+\mathbb E_{z'_2\sim\mathbf P(\cdot\mid z_1)}\ell(f,z'_2)-\ell(f,z_1)-\ell(f,z_2)\}.
\]

Dividing by two completes the proof. Equation (3) also shows that optimal $p_t$ in the dual game need not depend on previous learner decisions, although it does depend on past outcomes. The learner simply minimizes current expected loss under the known distribution. A current decision enters regret only through current loss, not the benchmark. This simple optimal structure belongs to the dual game and highlights the importance of minimax.

## 1.2 Symmetrization and Sequential Rademacher Complexity

The next step is symmetrization, relaxing the expected supremum into something like Rademacher complexity. A key new object is a **$\mathcal Z$-valued tree**: a complete binary tree with a value in $\mathcal Z$ at each node. A depth-$n$ tree $\mathbf z$ consists of $n$ maps:

\[
\mathbf z_t:\{-1,+1\}^{t-1}\to\mathcal Z,\qquad t=1,\ldots,n.
\]

A path $\epsilon=(\epsilon_1,\ldots,\epsilon_n)$ uses −1 for left and +1 for right. Its $t$-th value is $\mathbf z_t(\epsilon_{1:t-1})$, abbreviated $\mathbf z_t(\epsilon)$, although the map reads only the first $t-1$ signs. (Original note 1) (Original note 2) For $\mathcal H\subseteq\mathbb R^{\mathcal Z}$, define conditional sequential Rademacher complexity on a given tree by

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal H;\mathbf z)=\frac1n\mathbb E_\epsilon\left[\sup_{h\in\mathcal H}\sum_{t=1}^n\epsilon_t h(\mathbf z_t(\epsilon))\right].
\]

Here $\epsilon_1,\ldots,\epsilon_n$ are independent Rademacher signs. The unconditional version is

\[
\mathcal R^{\mathrm{seq}}(\mathcal H)=\sup_{\mathbf z}\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal H;\mathbf z)=\frac1n\sup_{\mathbf z}\mathbb E_\epsilon\sup_{h\in\mathcal H}\sum_{t=1}^n\epsilon_t h(\mathbf z_t(\epsilon)).
\]

The supremum ranges over all depth-$n$ trees. As in statistical learning, it measures the ability to fit random signs. The difference is that $n$ samples are replaced by a tree with $2^n-1$ possible samples, and the $t$-th input depends on earlier signs. This captures sequential dependence on the entire past. We also take a worst-case supremum over trees rather than an expectation under a distribution over trees, reflecting the absence of a distributional assumption.

**Theorem 2.** For any joint distribution, the expected supremum of the dependent empirical process satisfies

\[
\mathbb E_{z_{1:n}\sim\mathbf P}\sup_{f\in\mathcal F}\frac1n\sum_{t=1}^n\left(\mathbb E_{z'_t\sim\mathbf P(\cdot\mid z_{1:t-1})}\ell(f,z'_t)-\ell(f,z_t)\right)\le2\mathcal R^{\mathrm{seq}}(\ell(\mathcal F)),
\]

\[
\ell(\mathcal F)=\{h_f:\mathcal Z\to\mathbb R\mid f\in\mathcal F,\ h_f(z)=\ell(f,z)\} .
\]

**Proof.** Again take $n=2$ to show the central idea. Multiply the left side by two and write $\Delta_t(f)=\ell(f,z'_t)-\ell(f,z_t)$. First expose the conditional expectations, then move the ghost-sample expectations outside the supremum:

\[
\begin{aligned}
&\mathbb E_{z_1\sim\mathbf P_1,z_2\sim\mathbf P(\cdot\mid z_1)}
\sup_f\{\mathbb E_{z'_1\sim\mathbf P_1}\ell(f,z'_1)-\ell(f,z_1)
+\mathbb E_{z'_2\sim\mathbf P(\cdot\mid z_1)}\ell(f,z'_2)-\ell(f,z_2)\}\\
&\le\mathbb E_{z_1,z'_1\sim\mathbf P_1;\ z_2,z'_2\sim\mathbf P(\cdot\mid z_1)}
\sup_f\{\Delta_1(f)+\Delta_2(f)\}\\
&=\mathbb E_{z_1,z'_1\sim\mathbf P_1;\ z_2,z'_2\sim\mathbf P(\cdot\mid z_1),\,\epsilon_2}
\sup_f\{\Delta_1(f)+\epsilon_2\Delta_2(f)\}.
\end{aligned}
\]

The last equality holds because the two second-round draws are exchangeable given $z_1$. It is tempting to multiply the first difference by $\epsilon_1$ as well, but the following direct replacement is **incorrect**:

\[
\mathbb E_{z_1,z'_1\sim\mathbf P_1;\ z_2,z'_2\sim\mathbf P(\cdot\mid z_1),\,\epsilon_{1:2}}
\sup_f\{\epsilon_1\Delta_1(f)+\epsilon_2\Delta_2(f)\}.\qquad(\times)
\]

The roles of $z_1$ and $z'_1$ differ: both future draws condition on $z_1$. We must first remove that extra dependence by replacing the second-round expectation with a worst case:

\[
\mathbb E_{z_1,z'_1\sim\mathbf P_1}\sup_{z_2,z'_2}\mathbb E_{\epsilon_2}\sup_f\{\Delta_1(f)+\epsilon_2\Delta_2(f)\}.
\]

The first-round draws are now exchangeable, so this equals

\[
\mathbb E_{z_1,z'_1\sim\mathbf P_1}\mathbb E_{\epsilon_1}\sup_{z_2,z'_2}\mathbb E_{\epsilon_2}\sup_f\{\epsilon_1\Delta_1(f)+\epsilon_2\Delta_2(f)\}.
\]

Next relax the first-round expectation, split the two sample terms, and use sign symmetry:

\[
\begin{aligned}
&\le\sup_{z_1,z'_1}\mathbb E_{\epsilon_1}\sup_{z_2,z'_2}\mathbb E_{\epsilon_2}
\sup_f\{\epsilon_1\Delta_1(f)+\epsilon_2\Delta_2(f)\}\\
&\le\sup_{z_1,z'_1}\mathbb E_{\epsilon_1}\sup_{z_2,z'_2}\mathbb E_{\epsilon_2}
\sup_f\{\epsilon_1\ell(f,z'_1)+\epsilon_2\ell(f,z'_2)\}\\
&\quad+\sup_{z_1,z'_1}\mathbb E_{\epsilon_1}\sup_{z_2,z'_2}\mathbb E_{\epsilon_2}
\sup_f\{-\epsilon_1\ell(f,z_1)-\epsilon_2\ell(f,z_2)\}\\
&=2\sup_{z_1}\mathbb E_{\epsilon_1}\sup_{z_2}\mathbb E_{\epsilon_2}
\sup_f\{\epsilon_1\ell(f,z_1)+\epsilon_2\ell(f,z_2)\}\\
&=2\sup_{\mathbf z}\mathbb E_{\epsilon_{1:2}}\sup_f
\{\epsilon_1\ell(f,\mathbf z_1)+\epsilon_2\ell(f,\mathbf z_2(\epsilon_1))\}.
\end{aligned}
\]

The last step is analogous to Theorem 1: choose a near-maximizing $z_2$ separately for $\epsilon_1=+1$ and $-1$, and encode those choices as the second level of a tree. Divide by $n=2$ to finish. Replacing expectations by suprema loses the information in the initial joint distribution, explaining why sequential complexity uses a worst-case tree.

## 1.3 Erasing the Loss

As in statistical learning, many problems allow the loss function to be removed from the complexity, as expressed by two lemmas.

**Lemma 1.** For binary classification with zero-one loss, $\mathcal Z=\mathcal X\times\{-1,+1\}$ and $\mathcal F\subseteq\{-1,+1\}^{\mathcal X}$. For every outcome tree $(\mathbf x,\mathbf y)$, there is another input tree $\mathbf x'$ such that

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\ell(\mathcal F);(\mathbf x,\mathbf y))
=\frac12\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x'),
\qquad \mathcal R^{\mathrm{seq}}(\ell(\mathcal F))\le\frac12\mathcal R^{\mathrm{seq}}(\mathcal F).
\]

**Lemma 2 (Contraction).** For regression loss $\ell(f,(x,y))=\ell'(f(x),y)$, where $\ell'$ is $G$-Lipschitz in its first argument, the handout gives

\[
\mathcal R^{\mathrm{seq}}(\ell(\mathcal F))\le G\mathcal R^{\mathrm{seq}}(\mathcal F)\,O(\ln^{3/2}n).
\]

Relative to Lecture 2, the statistical version of Lemma 1 is exactly half the function-class complexity on the same fixed input sequence. The sequential version changes $\mathbf x$ to $\mathbf x'$, without affecting the final worst-case upper bound. Lemma 2 has a similar subtlety and additionally loses a logarithmic factor. The source says this loss has recently been shown unavoidable in general. It omits the proof of Lemma 2 and proves only Lemma 1.

> Editorial note: the original statement is retained, but it does not justify claiming that exponent $3/2$ is optimal in every formulation. Classical contraction results for bounded classes have additional conditions, and the logarithmic expression needs a constant to cover $n=1$. The companion explains the primary-source conditions and the scope of improvements; this omitted lemma is not presented as proved here.

**Proof of Lemma 1.** By definition and the algebraic identity for zero-one loss,

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{seq}}(\ell(\mathcal F);(\mathbf x,\mathbf y))
&=\frac1n\mathbb E_\epsilon\sup_f\sum_{t=1}^n\epsilon_t
\mathbf1\{f(\mathbf x_t(\epsilon))\ne\mathbf y_t(\epsilon)\}\\
&=\frac1n\mathbb E_\epsilon\sup_f\sum_{t=1}^n\epsilon_t
\frac{1-\mathbf y_t(\epsilon)f(\mathbf x_t(\epsilon))}{2}\\
&=\frac1{2n}\mathbb E_\epsilon\sum_t\epsilon_t
+\frac1{2n}\mathbb E_\epsilon\sup_f\sum_t-\epsilon_t\mathbf y_t(\epsilon)f(\mathbf x_t(\epsilon))\\
&=\frac1{2n}\mathbb E_\epsilon\sup_f\sum_t-\epsilon_t\mathbf y_t(\epsilon)f(\mathbf x_t(\epsilon)).
\end{aligned}
\]

Set $s_t=-\epsilon_t\mathbf y_t(\epsilon)$. These are again independent Rademacher signs; equivalently, $\epsilon\mapsto s$ is a bijection of the sign cube. Its inverse is constructed recursively as

\[
\epsilon_t=-s_t\mathbf y_t(\epsilon_{1:t-1}).
\]

The preceding $\epsilon_{1:t-1}$ can already be expressed in terms of $s_{1:t-1}$. Thus $\mathbf x'_t(s)=\mathbf x_t(\epsilon)$ defines a valid tree, and

\[
\widehat{\mathcal R}^{\mathrm{seq}}(\ell(\mathcal F);(\mathbf x,\mathbf y))
=\frac1{2n}\mathbb E_s\sup_f\sum_{t=1}^n s_t f(\mathbf x'_t(s))
=\frac12\widehat{\mathcal R}^{\mathrm{seq}}(\mathcal F;\mathbf x').
\]

Taking the supremum over outcome trees proves the result. The new input tree permutes the original paths according to the label tree. If every label is +1, it is the mirror image. If only the root label is +1 and all others are −1, only the two subtrees of the root are exchanged.

## Original Footnotes

**Original note 1:** A node path is already completely specified by the first $n-1$ signs. The final sign is nevertheless included because it serves other purposes.

**Original note 2:** For subsequent discussions involving trees, draw an illustrative picture to understand the intuition of the various concepts; many more will appear.
