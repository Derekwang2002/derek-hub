---
title: "Lecture 7 Full Handout"
summary: "Complete reading edition preserving all sections, results, proofs, and numbering: halving, hedge, partial-cover experts, margins, and perceptron, with explicit editorial notes."
---

**Fall 2026. Haipeng Luo.**

> Reading edition of all eight pages, retaining all sections, Equations (1)–(4), Lemmas 1–2, Theorems 1–4, Algorithms 1–4, Assumption 1, and the original reference. Source: lecture7.pdf (local source, not published online). Companion: [detailed explanation](/notes/csci678/lecture-7-explanation). Editorial notes identify typos, endpoints, and conditions. The original has no figures or footnotes.

## 1 Online Algorithms for Finite Classes

We now turn to algorithm design. In the statistical problems discussed so far, ERM learns whenever the problem is learnable. For online learning we have characterized learnability but do not yet know how to learn. Recall the protocol:

For each $t=1,\ldots,n$:

1. The learner selects $\widehat y_t\in\mathcal D$, possibly randomly.
2. The environment simultaneously chooses $z_t\in\mathcal Z$.
3. The learner suffers $\ell(\widehat y_t,z_t)$, then observes $z_t$.

A proper learner uses the reference class as its decision space; an improper learner may use a larger set and is therefore more powerful. An oblivious environment is independent of learner decisions and can be viewed as selecting outcomes before play. An adaptive environment can depend on past decisions. Start with finite $\mathcal F$, scaling bounded losses to $[0,1]$. Earlier theory guarantees an algorithm with

\[
\mathbb E[\operatorname{Reg}(\mathcal F,n)]
=\mathbb E\left[\sum_{t=1}^n\ell(\widehat y_t,z_t)
-\inf_{f\in\mathcal F}\sum_{t=1}^n\ell(f,z_t)\right]
\le O(\sqrt{n\ln|\mathcal F|}).\tag{1}
\]

Our first goal is to find a concrete algorithm attaining this guarantee.

## 1.1 Warm-up

First consider binary classification with zero-one loss and the strong realizability assumption that the class contains a perfect classifier:

\[
\inf_{f\in\mathcal F}\sum_{t=1}^n\mathbf1\{f(x_t)\ne y_t\}=0.
\]

This can be viewed as an expressiveness assumption or a restriction on the environment. An obvious algorithm always chooses a classifier that has made no mistakes so far. Each mistake eliminates at least one choice, while the perfect classifier remains, so at most $|\mathcal F|-1$ mistakes occur. The bound is independent of the horizon but has a much worse dependence on class size than a logarithm. A mistake may eliminate only one candidate; can it eliminate many, as in binary search?

Yes: predict the majority vote of surviving classifiers. This is **Halving**:

\[
\mathcal F'=\left\{f\in\mathcal F:\sum_{\tau=1}^{t-1}\mathbf1\{f(x_\tau)\ne y_\tau\}=0\right\},
\qquad
\widehat y_t(x)=\operatorname{sign}\left(\sum_{f\in\mathcal F'}f(x)\right).
\]

This is improper: the majority-vote function need not belong to the class. An equivalent formulation reveals $x_t$ first, lets the learner output a binary label, then reveals $y_t$. Seeing the input first is more favorable when restricted to the original class. With all binary functions allowed, specifying the response to each input already specifies an improper decision, so it adds no power. Halving responds with the current surviving majority at that input.

Every mistake eliminates at least half the candidates, giving $O(\log_2|\mathcal F|)$ mistakes and regret. This is exponentially better than the naive elimination strategy and remains horizon-independent. Realizability is the key to beating (1). A fixed binary tie rule preserves the analysis.

## 1.2 General Algorithm

How can realizability be removed? Both preceding algorithms are deterministic. Without realizability, a deterministic algorithm cannot guarantee sublinear regret even with one input and the two constant predictors +1 and −1. Its prediction is fixed and known to the environment, which can choose the opposite label every round. The learner loses $n$, while one constant expert loses at most $n/2$, giving regret at least $n/2$. Follow-the-leader from Lecture 5, with deterministic tie-breaking, can therefore suffer linear regret.

We therefore need randomization, and should not discard a classifier after one error. A natural strategy samples according to past performance: lower cumulative loss means higher probability. This yields a classical algorithm for general bounded losses:

\[
\text{Hedge:}\qquad
\Pr[\widehat y_t=f]\propto
\exp\left(-\eta\sum_{\tau=1}^{t-1}\ell(f,z_\tau)\right),\quad f\in\mathcal F.\tag{2}
\]

$\eta>0$ is the learning rate or step size. The algorithm has been rediscovered in many areas under names such as multiplicative weights update and exponential weights; later lectures discuss applications. It is proper because it samples a member of the original class, and is a soft version of FTL: as $\eta\to\infty$, mass concentrates on current loss minimizers. The exponential mapping is softmax. With tied leaders, the limiting distribution may still randomize among them.

Hedge attains (1), providing an algorithmic certificate of finite-class learnability. We first state a lemma useful later as well.

**Lemma 1.** For loss vectors $\ell_t\in\mathbb R^K$, suppose $\eta>0$ and $\eta\ell_t(i)\ge-1$ for every coordinate. Define

\[
p_t(i)=\frac{\exp(-\eta\sum_{\tau<t}\ell_\tau(i))}
{\sum_{j=1}^K\exp(-\eta\sum_{\tau<t}\ell_\tau(j))}.
\]

Then, for every $i^\star\in[K]$,

\[
\sum_{t=1}^n\langle p_t,\ell_t\rangle-\sum_{t=1}^n\ell_t(i^\star)
\le\frac{\ln K}{\eta}+\eta\sum_{t=1}^n\sum_{i=1}^Kp_t(i)\ell_t^2(i).
\]

**Theorem 1.** For oblivious or adaptive environments, Hedge with $\eta=\sqrt{\ln|\mathcal F|/n}$ guarantees (1). The source writes $T$ in the denominator; here it is consistently the horizon $n$. With one expert, simply follow it and regret is zero.

**Proof.** Set $K=|\mathcal F|$, index the experts by $1,\ldots,K$, and let $\ell_t(i)=\ell(i,z_t)$. The algorithm samples exactly from $p_t$ in the lemma, so

\[
\begin{aligned}
\mathbb E\sum_t\ell(\widehat y_t,z_t)&=\mathbb E\sum_t\langle p_t,\ell_t\rangle,\\
\mathbb E\inf_f\sum_t\ell(f,z_t)&=\mathbb E\min_{i^\star\in[K]}\sum_t\ell_t(i^\star).
\end{aligned}
\]

Take expectations in the lemma. Losses in $[0,1]$ give the upper bound $\ln K/\eta+\eta n$; substitute the minimizing learning rate. The environment may depend on the past but cannot choose current losses after seeing the current private random draw. That information order is needed for the first expectation identity.

Here is the potential proof of Lemma 1. Further motivation for the potential and algorithm will come later.

**Proof of Lemma 1.** Define cumulative losses and the potential

\[
L_t=\sum_{\tau=1}^t\ell_\tau,\qquad
\Phi_t=\frac1\eta\ln\left(\sum_{i=1}^K e^{-\eta L_t(i)}\right).
\]

Comparing consecutive rounds,

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

The first inequality uses $e^{-y}\le1-y+y^2$ for $y\ge-1$; the last uses $\ln(1+y)\le y$ for $y>-1$. Summing over time telescopes the potential:

\[
\begin{aligned}
\sum_{t=1}^n\langle p_t,\ell_t\rangle
&\le\Phi_0-\Phi_n+\eta\sum_{t,i}p_t(i)\ell_t^2(i)\\
&\le\Phi_0-\frac1\eta\ln(e^{-\eta L_n(i^\star)})
+\eta\sum_{t,i}p_t(i)\ell_t^2(i)\\
&=\frac{\ln K}\eta+L_n(i^\star)+\eta\sum_{t,i}p_t(i)\ell_t^2(i).
\end{aligned}
\]

Rearranging proves the lemma.

## 2 Algorithms for Infinite Classes: Classification

Now consider infinite binary classes. With finite Littlestone dimension $d$, the goal is

\[
\mathbb E[\operatorname{Reg}(\mathcal F,n)]=O(\sqrt{dn\ln n}).\tag{3}
\]

This section uses improper algorithms: reveal the input, predict a label, then reveal the true label. **Warm-up.** First assume realizability. Majority vote is not well-defined for an infinite class, so ordinary Halving no longer applies. The information principle survives: replace halving cardinality with reducing Littlestone dimension by at least one per mistake.

**Algorithm 1: Generalized Halving for Infinite Classes.** Initialize $\mathcal F'=\mathcal F$. At each round:

1. Receive $x_t$ and split into $\mathcal F'_-=\{f\in\mathcal F':f(x_t)=-1\}$ and $\mathcal F'_+=\{f\in\mathcal F':f(x_t)=+1\}$.
2. Predict a label maximizing $\operatorname{Ldim}(\mathcal F'_y)$.
3. Receive $y_t$ and update $\mathcal F'\leftarrow\mathcal F'_{y_t}$.

Lecture 6 showed that at least one child subclass has strictly smaller dimension. If predicting the larger-dimensional side is wrong, the surviving other side must have smaller dimension. Hence **Theorem 2:** under realizability, Algorithm 1 makes at most $\operatorname{Ldim}(\mathcal F)$ mistakes, which also bounds its regret.

The algorithm requires computing Littlestone dimension, which may be difficult. For the singleton-indicator class it is simple: always predict −1 until the first positive example, then use the singleton function associated with that input forever. Consider its behavior for the higher-dimensional HW2 extension.

> Editorial note: a nonempty singleton class has dimension zero. Assign the empty class dimension −1 for decision-making, so impossible labels are not chosen. Fix one tie rule and use it consistently in the following construction.

### Lifting the Realizability Assumption

Generalized Halving is the building block for the agnostic algorithm. Consider a thought experiment: an adaptive environment may choose, possibly randomly in advance, input and label trees $\mathbf x,\mathbf y$, then at round $t$ evaluate them at the learner’s past predictions $s_{1:t-1}$. They depend only on the past, exactly as permitted. If the input tree were known but the label tree were not, construct a minimal zero-cover $V$ and view each cover tree as an expert predicting $\mathbf v_t(s_{1:t-1})$.

The cover property says that for each $f$ and each realized prediction path, an expert agrees with it all along that path. Low regret against the experts therefore suffices. Although these experts are not fixed maps from input to label, the same Hedge analysis gives $O(\sqrt{n\ln|V|})$. Sequential Sauer gives $\ln|V|=O(d\ln n)$, recovering (3).

The obstacle is that the input tree is unknown, and explicitly constructing cover trees with $2^n-1$ nodes is costly. Only one path is ultimately visited, so most node information is unused. Can we construct just that path and determine each node after the current input arrives?

### Constructing the Cover Partially and Adaptively

Yes. Define, without explicitly expanding, a family indexed by sets $T=\{t_1<\cdots<t_m\}\subseteq[n]$ with $m\le d$. There are $\sum_{m=0}^d\binom nm$ indices. Define $\mathbf v^T$ from top to bottom along any path $\epsilon$:

1. Keep functions agreeing with the expert tree on the preceding path.
2. Split them by their prediction on the current input.
3. If $t\notin T$, output the Generalized Halving label; if $t\in T$, output its opposite.

\[
\mathcal F'=\{f\in\mathcal F:f(\mathbf x_s(\epsilon))=\mathbf v_s^T(\epsilon)\ \forall s<t\},
\quad
\mathcal F'_y=\{f\in\mathcal F':f(\mathbf x_t(\epsilon))=y\}.
\]

**Lemma 2.** The family $V$ just defined is a zero-cover of $\mathcal F|_{\mathbf x}$. **Proof.** Fix $f,\epsilon$, and imagine running Generalized Halving on the path labeled by $f$:

\[
(\mathbf x_1(\epsilon),f(\mathbf x_1(\epsilon))),\ldots,
(\mathbf x_n(\epsilon),f(\mathbf x_n(\epsilon))).
\]

This is realizable, so the set $T$ of Halving mistakes has size at most $d$. Its expert matches $f$ everywhere on the path. At the first round it preserves a correct Halving prediction and flips an incorrect one, thus always predicting $f$’s label. Its self-prediction update leaves exactly the same surviving class as Halving’s update using the labels generated by $f$. The same argument applies at round two and inductively through the horizon.

This is also another proof of the sequential Sauer bound. Unlike the previous lecture’s whole-tree recursion, this construction computes the next node just after the actual input arrives, without knowing unvisited branches.

> Editorial note: the binomial sum counts indices; distinct indices can produce identical trees, so the number of distinct trees is at most that sum. Some irrelevant experts may enter an empty class; define their later output to be −1. The witnessing expert always retains the target $f$ and never becomes empty.

**Algorithm 2: A T-indexed Expert that Outputs One Path on the Fly.** Initialize $\mathcal F'=\mathcal F$. Each round:

1. Receive $x_t$ and split the surviving class by label.
2. If $t\notin T$, predict the label with larger Littlestone dimension; otherwise predict its opposite. Call it $y_t^T$.
3. Update with **its own prediction**: $\mathcal F'\leftarrow\mathcal F'_{y_t^T}$.

It needs no information about the rest of the input tree and outputs exactly the nodes on the relevant path. It differs from Generalized Halving in two ways: it flips on specified rounds, and it “confidently” updates as though its own prediction were correct. Hedge selects among these experts.

**Algorithm 3: Hedge over Partial Covers.** Choose a positive learning rate. Maintain an Algorithm 2 expert for every time subset with $|T|\le d$. Each round:

1. Receive the input and send it to all experts.
2. Sample $T_t$ from the distribution below and follow $y_t^{T_t}$.
3. Receive $y_t$ and update the experts’ outer loss totals.

\[
\Pr[T_t=T]\propto
\exp\left(-\eta\sum_{s=1}^{t-1}\mathbf1\{y_s^T\ne y_s\}\right).
\]

**Theorem 3.** With a suitable learning rate, Algorithm 3 achieves (3). **Proof.** Lemma 2 provides an expert matching every comparator on the realized path. The number of expert indices is

\[
K=\sum_{m=0}^{\min(d,n)}\binom nm
\le(en/d)^d\quad(1\le d\le n).
\]

Apply the finite-expert Hedge bound. Choosing $\eta=\sqrt{\ln K/n}$ gives the explicit bound $2\sqrt{n\ln K}$; when $d=0$, simply predict the single function. This achieves the goal with an improper algorithm. The handout notes that the corresponding proper-learning problem was open for about a decade before Hanneke, Livni, and Moran (2021).

> Editorial note: the source calls regret against the original class and against the expert pool “the same.” Zero-covering only guarantees that the best expert loss is **no larger** than the best original-class loss. Thus original-class regret is no larger than expert regret. This direction suffices; equality need not hold.

## 3 Classification with Margin

Algorithm 3 is theoretically useful but practically limited: the expert count grows exponentially in $d$, and finite Littlestone dimension restricts classifier classes. Lecture 6 proposed surrogate losses. Here consider the unit $p$-norm linear score class with hinge loss:

\[
\mathcal F=\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\qquad \ell(f,(x,y))=\max\{1-yf(x),0\}.
\]

Again start with realizability: the best cumulative hinge loss is zero, equivalently some $\theta^\star\in B_p^d$ satisfies $y_t\langle\theta^\star,x_t\rangle\ge1$ at every round. This is stronger than zero-one realizability: not merely linear separability but a score margin of at least 1. A standard form normalizes inputs and introduces a separate margin parameter.

**Assumption 1 (γ-Margin).** Inputs satisfy $x_t\in B_q^d$. There are $\gamma>0$ and $\theta^\star\in B_p^d$, with $p,q\ge1$ and $1/p+1/q=1$, such that

\[
y_t\langle\theta^\star,x_t\rangle\ge\gamma\qquad(t=1,\ldots,n).
\]

The source omits 1 after $p,q\ge$; it is restored here. A simple but inefficient method takes a pointwise $\gamma/2$-cover of size at most $(4/\gamma+1)^d$ and runs Halving on it. Proposition 2 of Lecture 3 guarantees this cover, with a representative $\theta'$ satisfying

\[
y_t\langle\theta',x_t\rangle
=y_t\langle\theta^\star,x_t\rangle+y_t\langle\theta'-\theta^\star,x_t\rangle
\ge\gamma-\gamma/2>0.
\]

The finite cover is therefore realizable under zero-one loss, and Halving makes at most

\[
O(\ln\mathcal N(\mathcal F,\gamma/2))
=O\left(d\ln\left(\frac4\gamma+1\right)\right)\tag{4}
\]

mistakes. How can this be made efficient? Focus on $p=q=2$; HW3 treats $p=1,q=\infty$. The margin condition now implies Euclidean distance at least $\gamma$ from the separating hyperplane. We introduce **Perceptron**.

**Algorithm 4: Perceptron.** Initialize $\theta=0$. Each round:

1. Receive the input and predict $s_t=\operatorname{sign}(\langle x_t,\theta\rangle)$.
2. Receive the label; if $y_t\ne s_t$, update $\theta\leftarrow\theta+y_tx_t$.

The algorithm is efficient and updates only on mistakes. It adds the misclassified input in the direction indicated by its true label, moving the hyperplane toward correcting that error. A mistake implies $y_t\langle x_t,\theta\rangle\le0$, and the signed score increases after updating:

\[
y_t\langle x_t,\theta+y_tx_t\rangle
=y_t\langle x_t,\theta\rangle+\|x_t\|_2^2.
\]

It is deterministic and may leave the unit ball, so it is improper relative to the handout’s real-valued decision space. Fix a binary tie rule at zero. A mistake implies nonpositive margin, but a zero margin may be guessed correctly. A single update also need not immediately classify the point correctly.

**Theorem 4.** Under the $\gamma$-margin assumption with $p=q=2$, Perceptron makes at most $1/\gamma^2$ mistakes.

**Proof.** Let $\theta_t$ be the weight at the start of round $t$, $I_t=\mathbf1\{s_t\ne y_t\}$, and $M=\sum_t I_t$. Then

\[
\theta_1=0,\qquad\theta_{t+1}=\theta_t+I_ty_tx_t.
\]

First control alignment with the separator:

\[
\langle\theta_{t+1},\theta^\star\rangle
=\langle\theta_t,\theta^\star\rangle+I_ty_t\langle x_t,\theta^\star\rangle
\ge\langle\theta_t,\theta^\star\rangle+I_t\gamma.
\]

Sum, then use the unit norm and Cauchy–Schwarz:

\[
M\gamma\le\langle\theta_{n+1},\theta^\star\rangle
\le\|\theta_{n+1}\|_2.
\]

Next control norm growth:

\[
\begin{aligned}
\|\theta_{t+1}\|_2^2
&=\|\theta_t+I_ty_tx_t\|_2^2\\
&=\|\theta_t\|_2^2+2I_t\langle\theta_t,y_tx_t\rangle+I_t\|x_t\|_2^2\\
&\le\|\theta_t\|_2^2+I_t.
\end{aligned}
\]

Thus $\|\theta_{n+1}\|_2\le\sqrt M$. Combining gives $M\gamma\le\sqrt M$. If $M=0$ the result is immediate; otherwise divide by $\sqrt M$ and square.

Compared with (4), $1/\gamma^2$ depends more poorly on margin but is completely dimension-free, making it attractive in high dimension. This mirrors the nearly dimension-independent logarithmic covering estimate of order $1/\gamma^2$ in Lecture 4, Section 2.1. The handout ends by saying that Perceptron’s guarantee yields sequential fat dimension of order $1/\gamma^2$ for the linear class at scale $\gamma$, referring to HW3.

> Editorial note: the final “of order” claim needs a dimension qualification. An unconditional matching lower bound does not follow for fixed low dimension. The orthogonal construction gives a lower bound $\min(d,\lfloor4/\gamma^2\rfloor)$ under the $\gamma/2$ convention; sufficiently large dimension yields the matching $1/\gamma^2$ order. The companion derives the upper bound and this lower construction.

## References

Steve Hanneke, Roi Livni, and Shay Moran. [Online Learning with Simple Predictors and a Combinatorial Characterization of Minimax in 0/1 Games](https://proceedings.mlr.press/v134/hanneke21a.html). Conference on Learning Theory, PMLR 134:2289–2314, 2021.
