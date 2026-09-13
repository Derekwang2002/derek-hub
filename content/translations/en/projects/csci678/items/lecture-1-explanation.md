---
title: "Lecture 1 Detailed Explanation: Formalizing the Learning Problem and Three Models"
summary: "A section-by-section expansion of Lecture 1: the formalization of supervised learning, the i.i.d. assumption, the complete proof of the no-free-lunch theorem, the online-to-batch conversion, and the partial-information difficulty of multi-armed bandits."
---

> Expanded from Haipeng Luo's Lecture 1 (Fall 2026, 8 pages of original slides). The structure follows the Lecture 3 explanation report: state the purpose of each problem, explain the quantifiers and notation, prove the formulas step by step, and discuss the examples and the boundaries of each conclusion. Content marked "Supplementary" explains the original text; it does not claim that the slides proved additional theorems.
>
> Original slides: lecture1.pdf (not published online). Companion on this site: [full slides translation](/projects/csci678/lecture-1-full-translation); follow-up explanations: [Lecture 2](/projects/csci678/lecture-2-explanation), [Lecture 3](/projects/csci678/lecture-3-preview). Losses and random variables are measurable by default, so that every expectation and difference written here is defined. Arguments on finite spaces need no extra measurability techniques; when generalizing to general spaces, the corresponding conditions should be retained.

## Reading guide: why Lecture 1 spends so much space defining the problem

"Learning patterns from data" is not yet a mathematical proposition that can be proved. At minimum one must answer: where the data comes from, what the algorithm can see, when decisions are made, how the loss is computed, who to compare against, and for which environments the guarantee must hold.

This lecture builds three models in turn:

| Model | Data and information | Learner output | Evaluation criterion |
|---|---|---|---|
| Statistical learning | i.i.d. samples from an unknown distribution | outputs one predictor after seeing the training set | expected excess risk relative to the best in class |
| Full-information online learning | data arrives round by round; the full outcome is seen at the end of each round | makes one decision first each round | cumulative regret relative to the best fixed decision |
| Partial-information online learning | data arrives round by round; only the feedback of the chosen action is seen | decides and explores each round | controlling regret under the feedback restriction |

The two core theorems say respectively that "not every class is learnable" and that "online learnability implies statistical learnability". Understanding their quantifiers matters more than memorizing the constants.

## 1. Supervised learning: from inputs and outputs to loss

### 1.1 Data, predictor, and learning algorithm are three different objects

The input space is $\mathcal X$ and the output space is $\mathcal Y$. The training set is
\[
S=((x_1,y_1),\ldots,(x_n,y_n))\in(\mathcal X\times\mathcal Y)^n.
\tag{1}
\]

The slides abbreviate sequences as $a_{1:n}$. This report treats samples as ordered tuples, allowing repeated points; only when counting "how many distinct inputs have been seen" do we take the set of distinct elements among them.

A predictor $f\in\mathcal Y^{\mathcal X}$ is a function $f:\mathcal X\to\mathcal Y$. The algorithm $A$ is instead a mapping "from training sets to predictors":
\[
\widehat f=A(S),\qquad
\widehat f(x)=A(S)(x).
\tag{2}
\]

A randomized algorithm also depends on an independent random seed $U$, i.e. $\widehat f=A(S,U)$. $f$ is a model; $A$ is the procedure that trains a model, and the two must not be conflated.

Cat-versus-dog classification can encode images as $x\in\mathbb R^d$ with labels encoded as $\{-1,+1\}$; machine translation, language modeling, and video summarization can also be written as input-to-output mappings. This is only mathematical modeling; it does not mean these tasks share the same loss or the same computational difficulty.

### 1.2 What exactly does the loss measure

A general loss is written
\[
\ell:\mathcal Y^{\mathcal X}\times(\mathcal X\times\mathcal Y)\to\mathbb R.
\tag{3}
\]

The 0–1 loss for binary classification and the squared loss for regression are respectively
\[
\ell(f,(x,y))=\mathbf1\{f(x)\ne y\},
\qquad
\ell(f,(x,y))=(f(x)-y)^2.
\tag{4}
\]

The former only distinguishes right from wrong; the latter also penalizes the magnitude of numerical deviation — for example, when the error goes from 1 to 3, the squared loss goes from 1 to 9. The squared loss can be unbounded, so if concentration inequalities or Lipschitz contractions are used later, extra conditions such as boundedness must be added. The choice of loss is part of the problem definition.

## 2. Why must training and testing be related

### 2.1 The i.i.d. assumption taken apart

Assume there is an unknown distribution $P$ from which both the training samples and new test points are drawn:
\[
z_1,\ldots,z_n,z\overset{\mathrm{iid}}{\sim}P,
\qquad z_i=(x_i,y_i).
\tag{5}
\]

"Identically distributed" makes past data consistent with future targets; "independent" guarantees that new points do not carry dependencies deliberately filtered in by the training process. If the training set comes entirely from one environment and the test set from a completely arbitrary different environment, training data alone usually cannot guarantee test performance.

In practice, a random split supports this model only when the original data itself satisfies appropriate sampling conditions. Random splitting by itself does not remove duplicate samples, temporal correlation, or data-source bias. The slides use it to provide intuition, not to claim that any random split automatically proves independence.

### 2.2 Why risk is better suited to theory than finite test error

Fix an $f$; the population risk is
\[
L_P(f)=\mathbb E_{z\sim P}\ell(f,z).
\tag{6}
\]

The test error on an independent test set $T=(z'_1,\ldots,z'_m)$ is
\[
\widehat L_T(f)=\frac1m\sum_{i=1}^m\ell(f,z'_i).
\tag{7}
\]

By linearity of expectation and identical distribution,
\[
\mathbb E_T\widehat L_T(f)
=\frac1m\sum_i\mathbb E\ell(f,z'_i)
=L_P(f).
\tag{8}
\]

Hence the test error is an unbiased estimate of the risk. If the loss variance is $\sigma_f^2<\infty$, independence also gives
\[
\operatorname{Var}(\widehat L_T(f))
=\frac1{m^2}\sum_i\sigma_f^2
=\frac{\sigma_f^2}{m}.
\tag{9}
\]

Risk removes the extra random fluctuation brought by a finite test set. If $P$ were known, one could in principle minimize $L_P$ directly and the problem would become optimization; statistical learning exists precisely because $P$ is unknown and only samples are available.

### 2.3 Why the risk after training is again a random variable

For fixed $f$, $L_P(f)$ is a number. When random training produces $\widehat f=A(S,U)$, $L_P(\widehat f)$ varies with $S,U$. Therefore the expected risk of a learning algorithm is
\[
\mathbb E_{S,U}L_P(A(S,U))
=\mathbb E_{S,U}\mathbb E_{z\sim P}\ell(A(S,U),z).
\tag{10}
\]

If the test set is independent of the training process, then after conditioning on $S,U$ one still has
$\mathbb E_T[\widehat L_T(\widehat f)\mid S,U]=L_P(\widehat f)$. If the same test set is used repeatedly to select models, this conditional independence can no longer be invoked directly.

## 3. Irreducible noise and the goal of "agnostic learning"

### 3.1 Why nobody can predict fair-coin labels better

Suppose that for every $x$, $P(y=+1\mid x)=1/2$. An independent new label is conditionally independent of the training set and the algorithm's random seed. Fix $S,U,x$: whatever the algorithm predicts,
\[
\Pr(\widehat f(x)\ne y\mid S,U,x)=1/2.
\tag{11}
\]

Taking expectations again, every learning algorithm has risk $1/2$. Therefore "learning an absolute risk close to zero for arbitrary distributions" is impossible.

But this does not mean the excess risk on this distribution cannot tend to zero: if all reference functions also have risk $1/2$, every predictor already has zero excess risk. The counterexample here rules out a low-absolute-risk goal with no comparison baseline.

### 3.2 From assuming distributions to choosing a reference class

The slides use classical parametric statistics as a contrast: for example, assume $x$ is a Gaussian vector and, given $x$, $y$ is a Gaussian variable with mean $\langle\theta,x\rangle$, then estimate the parameters. This is an illustrative contrast; it does not mean all of modern statistics studies only parametric Gaussian models.

Agnostic learning chooses a reference class $\mathcal F$ and requires the algorithm to perform nearly as well as the best function in that class:
\[
L_P(\widehat f)-\inf_{f\in\mathcal F}L_P(f).
\tag{12}
\]

Here "distribution-free" means that no parametric form is specified for $P$; the iid assumption, the given loss, and the necessary integrability conditions are still retained. Prior knowledge has not disappeared; it moves into the choice of $\mathcal F$, such as linear functions, tree models, or some network architecture.

If $\mathcal F$ itself cannot express the task well, being close to its best function does not necessarily mean low absolute risk. Section 8 will express this through an error decomposition.

## 4. The general statistical learning framework and the quantifiers of learnability

### 4.1 Generalizing from supervised learning to abstract decisions

Let the sample be $z\in\mathcal Z$, the decision $a\in\mathcal D$, the reference class
$\mathcal F\subseteq\mathcal D$, and the loss
$\ell:\mathcal D\times\mathcal Z\to\mathbb R$. Define
\[
L_P(a)=\mathbb E_{z\sim P}\ell(a,z),\qquad
\mathcal E_P(A,n)=\mathbb E_{S,U}L_P(A(S,U))
-\inf_{f\in\mathcal F}L_P(f).
\tag{13}
\]

When the algorithm always outputs an element of $\mathcal F$ it is called proper; when it is allowed to output decisions outside the class it may be called improper. The slides describe the proper setting with $\mathcal D=\mathcal F$. Strictly speaking, even if $\mathcal D$ is larger, a particular algorithm may still only ever output elements of $\mathcal F$, and thus remain a proper algorithm.

A proper algorithm has nonnegative excess risk; an improper algorithm can sometimes beat the reference class, making the difference negative, so one cannot default to assuming it is nonnegative in every argument.

### 4.2 How sample complexity is obtained from a rate

If for all allowed distributions
\[
\mathcal E_P(A,n)\le Cn^{-1/2},
\tag{14}
\]
then to guarantee excess risk at most $\varepsilon$, solve the inequality:
\[
Cn^{-1/2}\le\varepsilon
\iff n\ge C^2/\varepsilon^2.
\tag{15}
\]

Here $C$ may depend on the dimension of the reference class, the loss range, and so on. Saying $O(1/\varepsilon^2)$ does not mean every model needs the same number of samples.

### 4.3 Pointwise convergence versus distribution-uniform convergence

The following two statements are different:

- For each fixed $P$, the error is small when $n$ is large enough; how large a sample is needed may depend on $P$.
- There is a sample size independent of $P$ that makes the error small for all allowed $P$.

The minimax formulation in this course studies the latter. A finite-sample algorithm may vary with $n$, but cannot depend on the unknown $P$. The no-free-lunch theorem also targets this uniform guarantee.

## 5. PAC and density estimation: two important examples

### 5.1 The difference between realizable PAC and agnostic learning

Realizable binary classification assumes there exists $f^*\in\mathcal F$ such that
\[
P(y=f^*(x)\mid x)=1.
\tag{16}
\]
Under the 0–1 loss $L_P(f^*)=0$, so
\[
\inf_{f\in\mathcal F}L_P(f)=0,\qquad
\text{excess risk}=L_P(\widehat f).
\tag{17}
\]

The PAC guarantee is often written as: given error $\varepsilon>0$ and failure probability $0<\delta<1$, for any input marginal distribution $P_X$ and any target $f^*\in\mathcal F$, after enough training samples,
\[
\Pr_{S,U}(L_P(\widehat f)\le\varepsilon)\ge1-\delta.
\tag{18}
\]

"Probably" corresponds to $1-\delta$; "Approximately Correct" corresponds to the error $\varepsilon$. The slides write the sample size as $\operatorname{poly}(1/\varepsilon,1/\delta)$, which hides dependencies such as the complexity of the class, and it is not a guarantee on the algorithm's running time.

### 5.2 How expectation guarantees relate to probability guarantees

For $0\le X=L_P(\widehat f)\le1$, if (18) holds, then
\[
\mathbb EX
=\mathbb E[X\mathbf1_{X\le\varepsilon}]
+\mathbb E[X\mathbf1_{X>\varepsilon}]
\le\varepsilon+\delta.
\tag{19}
\]

Conversely, Markov's inequality gives
\[
\Pr(X>\varepsilon)\le\frac{\mathbb EX}{\varepsilon}.
\tag{20}
\]
Hence an expectation of at most $\varepsilon\delta$ suffices to obtain failure probability at most $\delta$. This is a basic conversion and usually not the tightest sample-size analysis; it must not be mistaken for the two frameworks being exactly equivalent in constants and rates.

### 5.3 Why density estimation uses the log loss

Now there are no labels; the sample is $z\sim P$, the decision $q$ is a probability density relative to a common base measure, and the loss is
\[
\ell(q,z)=-\log q(z).
\tag{21}
\]

If the true density is $p$, define
\[
\operatorname{KL}(P\|Q)=\int p(z)\log\frac{p(z)}{q(z)}\,dz.
\tag{22}
\]

Whenever the relevant integrals and differences are defined, add and subtract $\mathbb E_P\log p(z)$:
\[
\begin{aligned}
L_P(q)-L_P(f)
&=-\mathbb E_P\log q+\mathbb E_P\log f\\
&=[\mathbb E_P\log p-\mathbb E_P\log q]
-[\mathbb E_P\log p-\mathbb E_P\log f]\\
&=\operatorname{KL}(P\|Q)-\operatorname{KL}(P\|F).
\end{aligned}
\tag{23}
\]

Why is KL nonnegative? If $q$ is zero where $p>0$, the KL may be $+\infty$. Otherwise use $\log u\le u-1$:
\[
\mathbb E_P\log(q/p)
\le\int_{\{p>0\}}q(z)\,dz-1\le0,
\]
so $\operatorname{KL}(P\|Q)\ge0$. The auxiliary inequality follows from $u-1-\log u$ attaining its minimum value zero at $u=1$.

Therefore minimizing the expected log loss is equivalent to finding the in-class density closest to the true distribution in the KL sense; it does not require $p$ itself to lie in the reference class. A continuous density can be greater than 1, so the log loss itself can be negative; it is not the same as a classification loss that always lies in $[0,1]$.

## 6. The value of the learning game: why the algorithm is chosen first, then the distribution

### 6.1 The minimax quantity and its quantifiers

The slides define
\[
\mathcal V^{\rm iid}(\mathcal F,n)
=\inf_A\sup_P
\left[\mathbb E L_P(A(S,U))-\inf_{f\in\mathcal F}L_P(f)\right].
\tag{24}
\]

The outer $\inf_A$ searches for the best learning rule; the inner $\sup_P$ checks how this rule performs under the most unfavorable distribution. "Choosing the algorithm first" means committing to a strategy from data to output, not selecting the final predictor before seeing the data.

If it is swapped to $\sup_P\inf_A$, the inner optimal algorithm can be designed for the known $P$, even directly outputting its best in-class decision, essentially bypassing the fact that "the distribution is unknown". In general one only has
\[
\sup_P\inf_A R(A,P)\le\inf_A\sup_P R(A,P),
\tag{25}
\]
and the two cannot be exchanged unconditionally. Proof of (25): for any fixed $A,P$,
$\inf_{A'}R(A',P)\le R(A,P)\le\sup_{P'}R(A,P')$; take the corresponding suprema and infima in turn.

The slides take
\[
\limsup_{n\to\infty}\mathcal V^{\rm iid}(\mathcal F,n)=0
\tag{26}
\]
as the formal characterization of learnability. Under the usual proper framework with nonnegative excess risk, this is exactly the worst-distribution error tending to zero. If the infimum over strategies is not attained, choose for each $n$ a strategy within $1/n$ of the optimal value, and one still obtains a sequence of algorithms tending to zero.

### 6.2 Which dependencies are hidden by the notation

$\mathcal V(\mathcal F,n)$ also depends on $\mathcal D,\mathcal Z,\ell$ and the set of allowed distributions. Giving only the function class while changing the loss or the feedback model may yield different learnability; $\mathcal F$ cannot be treated as the sole determining factor.

## 7. Theorem 1: the complete lower-bound proof of no free lunch

### 7.1 The goal is not to find one distribution on which all algorithms fail

For the class of all binary classifiers $\mathcal F=\{-1,+1\}^{\mathcal X}$, prove
\[
\mathcal V^{\rm iid}(\mathcal F,n)\ge1/4.
\tag{27}
\]

The quantifiers are "for every algorithm, there exists a hard distribution", not "there exists one fixed distribution on which all algorithms fail". The algorithm may randomize. The original slides assume $\mathcal X$ is continuous; what is actually needed is that it contains $2n$ distinct points for every $n$, as any infinite input space does.

### 7.2 Constructing candidate distributions with finite support

Fix a set $X'$ of $2n$ distinct inputs and let $Q$ be the uniform distribution on them. All $2^{2n}$ binary labelings correspond to functions $f_1,\ldots,f_N$, where $N=2^{2n}$.

For each $k$, define
\[
P_k(x,y)=\frac1{2n}\mathbf1\{x\in X',\,y=f_k(x)\}.
\tag{28}
\]

Every $P_k$ is noiseless and realizable: the reference class contains $f_k$, so the optimal risk is zero. Letting the proof randomly choose a $k$ is only averaging over the candidate distributions; it does not say the labels of each fixed $P_k$ carry coin-flip noise.

### 7.3 Why a new test point is unseen with probability at least half

Fix a training input sequence $S_X=(x_1,\ldots,x_n)$ and let $U(S_X)$ be the set of distinct inputs in it. It contains at most $n$ elements, while $X'$ has $2n$ elements, so
\[
\Pr_{x\sim Q}(x\notin U(S_X))
=1-\frac{|U(S_X)|}{2n}\ge1/2.
\tag{29}
\]

This lower bound holds for every training input sequence, with repeated sampling allowed.

### 7.4 The pairing argument on unseen points: why the algorithm errs at least half the time

Fix an unseen point $x$. Partition the $N$ labeling functions into $N/2$ pairs, where each pair $(f_k,f_{k'})$ differs only on $x$ and is identical on the other $2n-1$ points.

Because $x$ is not in the training set, the two induce the same labeled training set. Hence a deterministic algorithm makes the same prediction on $x$, but the true labels at that point are opposite, giving
\[
\mathbf1\{\widehat f_k(x)\ne f_k(x)\}
+\mathbf1\{\widehat f_{k'}(x)\ne f_{k'}(x)\}=1.
\tag{30}
\]

A randomized algorithm can use the same random seed in the two cases as a coupling, so the equality still holds seed by seed; then take expectations.

Summing over all pairs and dividing by $N$ gives an average error rate of exactly $1/2$. Therefore, for any algorithm,
\[
\begin{aligned}
\frac1N\sum_{k=1}^N
\mathbb E_{S_X,U,x}\mathbf1\{\widehat f_k(x)\ne f_k(x)\}
&\ge
\mathbb E_{S_X}
\left[\Pr(x\notin U(S_X))\cdot\frac12\right]\\
&\ge\frac14.
\end{aligned}
\tag{31}
\]

An average of finitely many numbers being at least $1/4$ means the risk under at least one $P_k$ is **no less than** $1/4$; it does not mean it must equal exactly $1/4$. Since the algorithm is arbitrary, taking $\sup_P$ and then $\inf_A$ yields (27).

### 7.5 Supplementary: exact computation of the unseen probability

Fix a test point $x$; each training point avoids it with probability $1-1/(2n)$. Independence gives
\[
\Pr(x\notin S_X)=\left(1-\frac1{2n}\right)^n.
\tag{32}
\]

So the pairing argument actually gives
$\frac12(1-\frac1{2n})^n\ge1/4$. The last inequality can also be obtained from Bernoulli's inequality
$(1-u)^n\ge1-nu$, which can be proved by induction on integers $n$. The slides only need the simpler constant $1/4$.

### 7.6 The meaning and scope of this theorem

The hard distribution may vary with the sample size $n$, so the conclusion targets distribution-uniform learnability. It does not say every concrete real task is unlearnable, nor that all fixed distributions are hard. It says: if the class is allowed to vary completely arbitrarily on unseen inputs, there is no universally valid inductive rule.

A class needs some structural constraint for the training data to constrain behavior on unseen points. Lecture 2 will turn this "structural constraint" into a computable parameter via the VC dimension.

## 8. How approximation, generalization, and optimization errors fit into one equation

Let the optimal risk over the larger comparison space be
$L_{\rm all}^*=\inf_{a\in\mathcal D}L_P(a)$, and the in-class optimum be
$L_{\mathcal F}^*=\inf_{f\in\mathcal F}L_P(f)$. The algebraic identity is
\[
L_P(\widehat f)-L_{\rm all}^*
=[L_P(\widehat f)-L_{\mathcal F}^*]
+[L_{\mathcal F}^*-L_{\rm all}^*].
\tag{33}
\]

The second term is the approximation error. Enlarging $\mathcal F$ does not increase it, because taking the infimum over a larger set only makes it smaller.

To show how generalization relates to optimization, suppose an approximate ERM outputs $\widetilde f\in\mathcal F$ satisfying
$\widehat L_S(\widetilde f)\le\inf_f\widehat L_S(f)+\xi$. Define
\[
\Delta_S=\sup_{f\in\mathcal F}|L_P(f)-\widehat L_S(f)|.
\tag{34}
\]

Choosing the in-class optimum, or any $f^*$ arbitrarily close to it, step by step gives
\[
\begin{aligned}
L_P(\widetilde f)
&\le\widehat L_S(\widetilde f)+\Delta_S\\
&\le\widehat L_S(f^*)+\xi+\Delta_S\\
&\le L_P(f^*)+\xi+2\Delta_S.
\end{aligned}
\]

Hence
\[
L_P(\widetilde f)-L_{\rm all}^*
\le2\Delta_S+\xi+(L_{\mathcal F}^*-L_{\rm all}^*).
\tag{35}
\]

The three terms correspond to generalization control, optimization error, and approximation error. This is an upper bound, not an exact decomposition into three independent random errors. Enlarging the class usually makes it more expressive, but the supremum ranges over a larger set, so uniform generalization control may become harder; practical optimization algorithms may also favor some subset of the class. This course mainly studies the statistical generalization part.

## 9. Online learning: what changes is the decision protocol

### 9.1 What may be seen in each round

In each round $t=1,\ldots,n$:

1. The learner chooses $a_t\in\mathcal D$ based on past information, while the environment simultaneously chooses $z_t\in\mathcal Z$.
2. The learner suffers the loss $\ell(a_t,z_t)$.
3. In the full-information model, the learner observes the complete $z_t$ before moving to the next round.

Statistical learning delivers a single decision only after seeing the whole training set; online learning makes a sequence of decisions as feedback arrives step by step. The $z_t$ are not required to be independent or identically distributed, nor must any fixed data distribution exist.

In the slides' abstract supervised-learning instance, $a_t$ can be an entire prediction function and $z_t=(x_t,y_t)$ is revealed afterwards. If an application sees $x_t$ first and then predicts the label, that is a refined protocol with context; one must state explicitly which information is revealed at which step, and cannot silently change the current definition.

### 9.2 Why the comparator in regret must be fixed

Define
\[
\operatorname{Reg}(\mathcal F,n)
=\sum_{t=1}^n\ell(a_t,z_t)
-\inf_{f\in\mathcal F}\sum_{t=1}^n\ell(f,z_t).
\tag{36}
\]

The opponent is **the same fixed $f$** chosen in hindsight after seeing all the data. It is not an oracle that may switch to a new best action every round:
\[
\sum_t\inf_f\ell(f,z_t)
\le\inf_f\sum_t\ell(f,z_t).
\tag{37}
\]

The left side allows per-round minimization, hence is smaller, and the task relative to it is harder. The slides study the fixed comparator on the right.

For example, suppose two actions have losses $(0,1)$ and then $(1,0)$ over two rounds; both fixed actions accumulate loss 1. If the algorithm happens to pick the first action and then the second, its cumulative loss is zero and the regret is $-1$. So regret on a single sequence can be negative.

No-regret learning requires the expected cumulative regret in the worst environment to satisfy
\[
\mathbb E\operatorname{Reg}(\mathcal F,n)=o(n),
\quad\text{equivalently}\quad
\mathbb E\operatorname{Reg}(\mathcal F,n)/n\to0.
\tag{38}
\]

The cumulative regret itself is not required to tend to zero. A cumulative $O(\sqrt n)$ is still no-regret.

## 10. The power of the environment: oblivious, adaptive, and the current action

### 10.1 What the two kinds of environments know

An oblivious environment knows the learning algorithm but fixes the entire $z_{1:n}$ before the game starts, without changing it based on the actual actions.

An adaptive environment may choose the current $z_t$ based on past actual actions and the public history. But under the simultaneous-move protocol of the slides, it cannot see the currently drawn action $a_t$ before deciding $z_t$.

One can write the public history as
\[
h_{t-1}=(a_1,z_1,\ldots,a_{t-1},z_{t-1}),
\quad q_t(\cdot\mid h_{t-1})\in\Delta(\mathcal D).
\tag{39}
\]

The environment knows the algorithm, so it can infer the conditional distribution $q_t$ of the current action, but it does not know the outcome of this random draw. Knowing that "the probability of heads" is $1/2$ is completely different information from knowing that this draw came up heads.

### 10.2 Supplementary: why randomization may be indispensable

Consider predicting a bit, where the loss is a wrong prediction and the reference class consists of the two constant predictors. Against a deterministic algorithm, the environment can infer the current prediction from the public history and the algorithm, and set $z_t=1-a_t$. The algorithm loses 1 every round, accumulating $n$. The losses of the two constants sum to $n$, so the best constant loses at most $n/2$, giving
\[
\operatorname{Reg}\ge n-n/2=n/2.
\tag{40}
\]

This does not grant the environment the ability to observe the current hidden random action, because the algorithm here is deterministic and its action is already computable from past information.

Randomization makes the actual action impossible to infer exactly, but being "random" alone does not guarantee small regret; the algorithm must still use the history to adjust its distribution. If the environment were allowed to see the current actual random action before flipping the label, (40) would hold for randomized algorithms too — that would change the problem itself.

## 11. The omitted proof of the nested minimax

### 11.1 The online value of the game

For a specified environment class $\mathcal A$, define
\[
\mathcal V^{\rm seq}(\mathcal F,n)
=\inf_\pi\sup_{\alpha\in\mathcal A}
\mathbb E_{\pi,\alpha}\frac{\operatorname{Reg}(\mathcal F,n)}n.
\tag{41}
\]

Adaptive environments include oblivious ones, so
\[
\mathcal V^{\rm seq}_{\rm obl}
\le\mathcal V^{\rm seq}_{\rm adap}.
\tag{42}
\]

For adaptive environments the slides write
\[
\mathcal V^{\rm seq}
=\inf_{q_1}\sup_{z_1}\mathbb E_{a_1\sim q_1}
\cdots
\inf_{q_n}\sup_{z_n}\mathbb E_{a_n\sim q_n}
\left[\frac{\operatorname{Reg}}n\right].
\tag{43}
\]

Each subsequent $q_t,z_t$ may depend on the history realized so far. This is not an expression in which all distributions are chosen once at the start.

### 11.2 A complete backward-induction proof for finite spaces

First assume $\mathcal D,\mathcal Z$ are finite, the loss is finite, and the number of rounds is finite, to avoid measurable strategy-selection issues. The terminal payoff is
\[
W_{n+1}(h_n)
=\frac1n\left[
\sum_{t=1}^n\ell(a_t,z_t)
-\inf_{f\in\mathcal F}\sum_{t=1}^n\ell(f,z_t)\right].
\tag{44}
\]

Define recursively
\[
W_t(h_{t-1})
=\inf_{q\in\Delta(\mathcal D)}\sup_{z\in\mathcal Z}
\sum_{a\in\mathcal D}q(a)\,
W_{t+1}(h_{t-1},a,z).
\tag{45}
\]

Why does the last round look like this? Given the history, the learner chooses a randomization distribution $q$, the environment may choose $z$ based on $q$, and then the action $a$ is drawn. The conditional expectation is exactly the sum on the right. The algorithm wants the expectation under the worst $z$ to be as small as possible, hence the outer $\inf_q\sup_z$.

The induction hypothesis is that $W_{t+1}$ already equals the value of the game at every subsequent history. We now show separately that $W_t$ is an attainable upper bound and an unbreakable lower bound.

**Upper bound:** At every history the learner chooses a $q$ that attains, or is $\eta$-close to, the infimum in (45), and continues with the corresponding approximately optimal strategy at every later history. Whatever the environment does, the current expectation is at most $W_t+\eta$, and the accumulated approximation error afterwards is at most the number of remaining rounds times $\eta$. So the worst payoff of the optimal strategy does not exceed $W_t+(n-t+1)\eta$.

**Lower bound:** Take any learner strategy; it induces some conditional distribution $q$ at the current history. The environment chooses a $z$ that brings the right side as close to the supremum as possible. After the action is realized, it continues at the next history with the approximately worst-case response guaranteed by induction. Hence the worst payoff of this strategy is at least $W_t-(n-t+1)\eta$.

Let $\eta\downarrow0$; the two sides coincide, completing the induction. Unrolling (45) from $t=1$ then yields (43).

Extra randomization by the environment over the current $z$ cannot raise the supremum at this step, because what randomization yields is only a weighted average of the payoffs of fixed $z$'s, which does not exceed the maximum.

### 11.3 Why pre-randomizing the algorithm and per-round sampling can be equivalent

The slides describe a randomized strategy as "a distribution over a set of deterministic history mappings". On a finite history tree, one can draw an action for every possible history in advance at the start, forming a complete deterministic strategy; when a history is actually reached, reading off the corresponding action implements the given per-round randomized strategy.

Conversely, for any complete strategy randomized in advance, taking the conditional distribution of the current action given the realized public history yields $q_t(\cdot\mid h_{t-1})$. Sampling round by round according to these conditional distributions produces the same path distribution by the multiplication rule of conditional probabilities. Here the learner remembers its own past actions and information, i.e. it has perfect recall.

So one cannot treat all rounds as mutually unrelated fixed mixed actions; the history-dependent conditional distributions are the key.

For general infinite spaces, this recursion remains the standard intuition and formal statement, but a fully rigorous generalization of the equalities requires corresponding measurability, conditional-distribution, and approximate strategy-selection conditions. The technical proofs the slides omit for arbitrary abstract spaces cannot be declared fully settled on the strength of the finite case alone. This report gives the complete proof of the finite case and marks the conditions for generalization.

## 12. Theorem 2: the online-to-batch conversion

### 12.1 How the conversion algorithm runs

Given an iid training set $z_1,\ldots,z_n$ and any online algorithm:

1. Feed the samples to the algorithm in order as online feedback.
2. The $t$-th online decision $a_t$ must be produced before reading $z_t$.
3. Draw $J\in\{1,\ldots,n\}$ independently and uniformly, and output $\widehat a=a_J$.

Randomly choosing a past decision keeps the output space unchanged, so it is legitimate even without linear or convex structure.

### 12.2 The most important independence equality

Let $\mathcal H_{t-1}$ contain the previous samples and the algorithmic randomness needed to produce $a_t$. Because $z_t$ is a fresh iid point, independent of this information,
\[
\mathbb E[\ell(a_t,z_t)\mid\mathcal H_{t-1}]
=L_P(a_t).
\tag{46}
\]

Taking expectations again:
$\mathbb E\ell(a_t,z_t)=\mathbb EL_P(a_t)$. If the algorithm looked at $z_t$ before producing $a_t$, this equality would generally fail — this is exactly why the conversion requires this temporal order.

### 12.3 Each step of the inequality

For any fixed $f\in\mathcal F$, by the uniform random output and (46):
\[
\begin{aligned}
\mathbb EL_P(\widehat a)-L_P(f)
&=\frac1n\sum_{t=1}^n\mathbb EL_P(a_t)
-\frac1n\sum_{t=1}^nL_P(f)\\
&=\mathbb E\left[
\frac1n\sum_t\ell(a_t,z_t)
-\frac1n\sum_t\ell(f,z_t)\right]\\
&\le\mathbb E\left[
\frac1n\sum_t\ell(a_t,z_t)
-\inf_{g\in\mathcal F}\frac1n\sum_t\ell(g,z_t)\right]\\
&=\mathbb E\operatorname{Reg}(\mathcal F,n)/n.
\end{aligned}
\tag{47}
\]

The third step holds because the empirical best comparator's loss is no larger than any fixed $f$'s empirical loss, and subtracting a smaller number makes the difference larger.

Taking $\sup_f$ on the left side, with the right side unchanged, gives
\[
\mathbb EL_P(\widehat a)-\inf_{f\in\mathcal F}L_P(f)
\le\mathbb E\operatorname{Reg}(\mathcal F,n)/n.
\tag{48}
\]

Note that we did not incorrectly interchange
$\mathbb E\inf_f\widehat L_S(f)$ with $\inf_f\mathbb E\widehat L_S(f)$. The proof fixes $f$ first and takes the supremum only at the end, precisely to avoid this problem.

### 12.4 From a single algorithm to the value of the game

If an online algorithm has expected average regret at most $r_n$ on all fixed sequences, then averaging over randomly generated iid sequences also keeps it at most $r_n$. So the batch algorithm obtained from its conversion has excess risk at most $r_n$ for all $P$.

Taking the infimum over online algorithms yields
\[
\boxed{
\mathcal V^{\rm iid}(\mathcal F,n)
\le\mathcal V^{\rm seq}_{\rm obl}(\mathcal F,n)
\le\mathcal V^{\rm seq}_{\rm adap}(\mathcal F,n).
}
\tag{49}
\]

If the online cumulative regret is $O(\sqrt n)$, the batch excess risk is $O(n^{-1/2})$. Hence online learnability implies statistical learnability; the converse does not follow from this. The slides announce that later lectures will give examples where the inequality is strict; this lecture does not prove the specific properties of those examples.

### 12.5 Supplementary: when can one average the models

If $\mathcal D$ is convex and $\ell(a,z)$ is convex in $a$, then
$\bar a=n^{-1}\sum_ta_t\in\mathcal D$, and Jensen's inequality gives
\[
L_P(\bar a)\le\frac1n\sum_tL_P(a_t).
\tag{50}
\]

In this case the averaged decision can replace randomly picking one decision. General discrete predictors or nonconvex decision spaces have no such guarantee; the slides choose the random output precisely so that no extra convexity assumptions are needed.

## 13. Partial information: what makes multi-armed bandits hard

### 13.1 Writing the problem in the slides' abstract notation

Suppose there are $K$ actions,
\[
\mathcal D=\mathcal F=\{1,\ldots,K\},\quad
\mathcal Z=[0,1]^K,\quad
\ell(a,z)=z(a).
\tag{51}
\]

Each round the environment sets a loss vector $z_t$, the algorithm chooses $a_t$, and only observes
\[
b_t=z_t(a_t).
\tag{52}
\]

Regret is still relative to the best fixed action:
\[
\operatorname{Reg}
=\sum_tz_t(a_t)-\min_{i=1,\ldots,K}\sum_tz_t(i).
\tag{53}
\]

The full-information model sees the complete vector, so it can compute every action's loss that round; the bandit model sees only the one coordinate of the chosen action. A recommender system sees whether the user clicked the recommended item, but not the counterfactual feedback for items not recommended — an intuitive example of this model.

### 13.2 An indistinguishability example

Suppose the algorithm always chooses action 1 and always observes loss $1/2$. It cannot distinguish the environment "action 2's loss is always 0" from the environment "action 2's loss is always 1", because the actual feedback is identical.

In the first environment, always choosing action 1 incurs linear regret $n/2$. This shows that exploring other actions is not a decorative trick but a necessity for obtaining the information that distinguishes environments.

### 13.3 Supplementary: a feedback-estimation formula explaining the role of exploration

If the current action is drawn according to $p_t$ with all $p_t(i)>0$, one can define
\[
\widehat z_t(i)=
\frac{\mathbf1\{a_t=i\}z_t(a_t)}{p_t(i)}.
\tag{54}
\]

Conditioned on past information and the already-chosen current $z_t$, the current action is only then sampled, so
\[
\mathbb E[\widehat z_t(i)\mid\text{past},z_t]
=p_t(i)\frac{z_t(i)}{p_t(i)}
=z_t(i).
\tag{55}
\]

But its second moment is
\[
\mathbb E[\widehat z_t(i)^2\mid\text{past},z_t]
=\frac{z_t(i)^2}{p_t(i)}.
\tag{56}
\]

Very small sampling probabilities amplify estimation fluctuation, and zero probability makes that coordinate impossible to estimate at all. This explains the tension between exploration and exploitation. It is only a supplementary derivation to help understand the feedback, not a complete no-regret bandit algorithm proof.

### 13.4 Why the full-information nested formula cannot be copied directly

In the full-information model, two different $z_t$'s are both observed by the learner, and later strategies can choose actions separately for them. In the bandit model, as long as they produce the same $(a_t,b_t)$, the learner cannot distinguish them and must adopt the same conditional strategy at those histories.

If one still placed an independent $\inf_{q_{t+1}}$ after every complete hidden history, one would be tacitly allowing the learner to see unrevealed coordinates, thereby underestimating the difficulty of the game. A correct formalization must keep the information constraint "same observed history implies same strategy", or introduce extra structure such as belief states.

So when the slides say there is no obvious nested expression of the same kind, it does not mean partial-information games cannot be formalized at all, but that the simple backward induction of the full-information case cannot be used unmodified.

## 14. Overall connections, boundary conditions, and the slides index

### 14.1 How the three levels of difficulty accumulate

Statistical learning faces an unknown distribution, but the iid structure provides the link between past and future. Online learning removes the fixed-distribution assumption and requires a decision each round before the feedback. Partial information further restricts the feedback, so the algorithm must not only choose low-loss actions but also acquire enough information.

This lecture does not prove concrete optimal rates under the three frameworks; it establishes the evaluation criteria and two basic logical conclusions:
\[
\text{the class of all functions is not necessarily learnable},
\qquad
\text{online learnable}\Rightarrow\text{statistically learnable}.
\tag{57}
\]

Lecture 2 starts from $\mathcal V^{\rm iid}$ and finds complexity measures that can control it; Lecture 3 then further handles real-valued infinite classes.

### 14.2 The most easily misread points

| Slide wording or shorthand | Rigorous reading |
|---|---|
| Risk is a fixed quantity | True for a fixed predictor; the risk of a randomly trained predictor varies with the training set |
| Distribution-free | No parametric form is specified for $P$; modeling conditions such as iid remain |
| Fair labels mean "unlearnable" | Absolute risk cannot be pushed below $1/2$; relative to a reference class equally limited by noise, excess risk can be zero |
| $\mathcal D\ne\mathcal F$ means improper | The space allows out-of-class outputs; whether a concrete algorithm is proper depends on whether its actual outputs always stay in the class |
| No Free Lunch assumes a continuous input space | The lower bound only needs sufficiently many distinct inputs, and targets distribution-uniform guarantees |
| Average risk at least $1/4$ | There exists a distribution with risk no less than $1/4$; not necessarily equal |
| No-regret means "regret tends to zero" | The correct requirement is that average regret tends to zero, i.e. cumulative regret is sublinear |
| Adaptive environments are very strong | They may depend on past actual actions, but in this protocol cannot respond after seeing the current random action |
| The nested-game formula for general spaces | Finite spaces admit complete backward induction; general spaces need measurability and strategy-selection conditions added |
| Online-to-batch can average any models | Randomly picking one always stays legitimate; direct averaging needs conditions like a convex space and convex loss |
| Partial information just sees fewer numbers | It also restricts which later strategies may depend on which histories |

### 14.3 Locating each proof

| Original slides content | This report |
|---|---|
| Inputs, outputs, predictors, loss | Section 1, (1)–(4) |
| iid, test error, risk and its randomness | Section 2, (5)–(10) |
| Fair-coin counterexample, agnostic-learning motivation | Section 3, (11)–(12) |
| General setup, excess risk, sample size | Section 4, (13)–(15) |
| PAC example | Sections 5.1–5.2, (16)–(20) |
| Density estimation and the KL identity | Section 5.3, (21)–(23) |
| Statistical value of the game and learnability | Section 6, (24)–(26) |
| Theorem 1: No Free Lunch | Section 7, (27)–(32) |
| Approximation, generalization, and optimization errors | Section 8, (33)–(35) |
| Online protocol, regret, environment classes | Sections 9–10, (36)–(40) |
| Slides equations (2), (3): nested game value | Section 11, (41)–(45) |
| Theorem 2: online-to-batch | Section 12, (46)–(50) |
| Partial information and MAB | Section 13, (51)–(56) |

### 14.4 Questions you should be able to answer independently afterwards

1. Why must the risk of a training algorithm be expected over the randomness of the training set?
2. Why should the learning goal compare against the best function in a reference class, rather than demanding absolute risk tending to zero for all distributions?
3. In the no-free-lunch proof, what is the difference between randomly choosing the labeling function and the data distribution itself having random labels?
4. Why is online regret different from "the best action each round"?
5. In the nested expression, why does $\sup_{z_t}$ come before the expectation over the current action draw?
6. At which step does the online-to-batch proof rely on $a_t$ not reading $z_t$?
7. Why can't a bandit allow the strategy to depend on the complete hidden loss vector?
