---
title: "Lecture 7 Detailed Explanation"
summary: "Halving, Hedge, partial-cover experts, margins, and Perceptron, with step-by-step proofs, worked examples, assumptions, pitfalls, self-tests, and a reading route."
---

> This lecture turns learnability into algorithms: Halving converts mistakes into elimination, Hedge balances past performance through exponential weights, partial covers turn finite Littlestone dimension into an agnostic strategy, and Perceptron uses geometric margins for an efficient guarantee. Source: lecture7.pdf (local source, not published online); companion: [full handout](/projects/csci678/lecture-7-full-translation); previous: [Lecture 6](/projects/csci678/lecture-6-explanation). Expected regret, deterministic mistake bounds, realizability, and running time are kept distinct.

## 1 What the Four Methods Solve

| Method | Main condition | Guarantee | Implementation |
|---|---|---|---|
| Halving | Finite class, perfect classifier | Logarithmically many mistakes | Enumerate survivors |
| Hedge | Finite experts, bounded full-information losses | Expected square-root regret | Evaluate all expert losses |
| Generalized Halving and partial covers | Finite Littlestone dimension | At most d realizable mistakes; aggregate for agnostic learning | Dimension computation may be hard; large expert pool |
| Perceptron | Euclidean normalization and positive margin | Inverse-square-margin mistake bound | Inner product each round; vector update on mistakes |

Source pages 1–3 cover finite classes, Lemma 1, and Theorem 1; pages 4–6 cover Algorithms 1–3, Lemma 2, and Theorems 2–3; pages 7–8 cover Assumption 1, Algorithm 4, and Theorem 4.

The environment cannot choose current losses after observing the current private random draw. Observing $z_t$ permits evaluation of all $\ell(f,z_t)$: this is full information. If only the chosen expert’s loss is observed, the problem is bandit and needs different estimators; this proof does not directly apply.

## 2 Halving: A Mistake Eliminates at Least Half

Realizability means one fixed $f^\star$ is correct in all rounds. The version space $V_t=\{f:f(x_s)=y_s,\ s<t\}$ never becomes empty. Arbitrarily choosing a survivor may eliminate only one per mistake, giving $K-1$. Majority vote ensures that a mistake eliminates at least half.

\[
1\le|V_{n+1}|\le K\,2^{-M}
\quad\Longrightarrow\quad
M\le\log_2K.
\]

Starting with 16 candidates, mistakes leave at most 8,4,2,1, so at most four mistakes occur. Since the comparator has zero loss, mistake count equals regret. A fixed tie label still eliminates half on errors. The majority-vote function may lie outside the original class, making this improper, but it remains a legitimate input-to-label rule.

## 3 Why the Agnostic Case Needs Randomness

Two constant experts suffice. A deterministic learner’s current label is determined by history, so the environment can anticipate and negate it, forcing $n$ errors. The two constant experts’ errors sum to $n$, so one errs at most $n/2$. Regret is at least $n/2$. This concerns discrete-label decisions; convexified predictions with convex loss may permit deterministic averaging, so it is not a claim about every online problem.

FTL follows the current leader too sharply. Hedge changes two things: an error reduces weight rather than eliminating the expert, and the algorithm samples according to weights rather than always selecting the leader. The low-temperature limit $\eta\to\infty$ approaches FTL, though tied leaders may still be randomized.

## 4 Hedge: Executable Rule and a Worked Update

\[
L_0(i)=0,\quad
w_t(i)=e^{-\eta L_{t-1}(i)},\quad
p_t(i)=\frac{w_t(i)}{\sum_jw_t(j)},\quad
L_t(i)=L_{t-1}(i)+\ell_t(i).
\]

Compute the distribution, sample and act, then observe all current losses and update. With two experts and $\eta=\ln2$, initial weights are (1,1) and probabilities (1/2,1/2). After losses (1,0), weights become (1/2,1) and probabilities (1/3,2/3). After another (1,0), weights are (1/4,1) and probabilities (1/5,4/5). Experts are not permanently eliminated and can recover if conditions change.

This pseudocode uses a shifted softmax to avoid exponential underflow. It changes numerical implementation, not the algorithm.

```python
loss_total = zeros(K)
for t in range(n):
    logits = -eta * loss_total
    weights = exp(logits - max(logits))
    probabilities = weights / sum(weights)
    chosen = sample(probabilities)
    act(chosen)
    losses = observe_all_expert_losses()
    loss_total += losses
```

## 5 Lemma 1: The Normalizer as a Potential

Set $W_t=\sum_i e^{-\eta L_t(i)}$ and $\Phi_t=\ln W_t/\eta$. Their ratio is the exponential-loss average under the current distribution, linking the weight update to current expected loss:

\[
\frac{W_t}{W_{t-1}}=\sum_i p_t(i)e^{-\eta\ell_t(i)}.
\]

The required bound is $e^{-x}\le1-x+x^2$ for $x\ge-1$. For $x\ge0$, Taylor’s integral remainder is at most $x^2/2$. For $-1\le x\le0$, set $u=-x\in[0,1]$; the quadratic-and-higher series is at most $(e-2)u^2<u^2$. This explains $\eta\ell_t(i)\ge-1$ and permits some negative losses.

\[
\begin{aligned}
\Phi_t-\Phi_{t-1}
&=\frac1\eta\ln\sum_i p_t(i)e^{-\eta\ell_t(i)}\\
&\le\frac1\eta\ln\left(1-\eta\langle p_t,\ell_t\rangle+
\eta^2\sum_i p_t(i)\ell_t^2(i)\right)\\
&\le-\langle p_t,\ell_t\rangle+\eta\sum_i p_t(i)\ell_t^2(i).
\end{aligned}
\]

The last step uses $\ln(1+u)\le u$. Sum over rounds to telescope:

\[
\sum_t\langle p_t,\ell_t\rangle
\le\Phi_0-\Phi_n+\eta\sum_{t,i}p_t(i)\ell_t^2(i).
\]

Initially $W_0=K$, hence $\Phi_0=\ln K/\eta$. For any comparator $i^\star$, the sum contains its term, so $W_n\ge e^{-\eta L_n(i^\star)}$ and $\Phi_n\ge-L_n(i^\star)$. Substitution gives

\[
\sum_t\langle p_t,\ell_t\rangle-L_n(i^\star)
\le\frac{\ln K}{\eta}+\eta\sum_{t,i}p_t(i)\ell_t^2(i).
\]

This is Lemma 1, simultaneously for all experts on every realized loss sequence. The squared-loss term contains more information than “at most one per round”; Theorem 1 further relaxes it to $n$ for a simple bound.

## 6 The Hindsight Expert Stays Inside the Expectation

Conditioned on history and the environment’s current choice, expected sampled loss is $\langle p_t,\ell_t\rangle$. Iterated expectation converts learner loss to expected weighted loss. The best expert depends on the random history, however, so $\mathbb E\min_iL_n(i)$ must not be replaced by $\min_i\mathbb E L_n(i)$.

The lemma holds pathwise for every expert, so selecting the best expert on that path before taking expectations is legitimate. For losses in $[0,1]$,

\[
\mathbb E\operatorname{Reg}\le\frac{\ln K}{\eta}+\eta n,\qquad
\eta=\sqrt{\frac{\ln K}n}\quad\Longrightarrow\quad
\mathbb E\operatorname{Reg}\le2\sqrt{n\ln K}.
\]

The learning rate balances initial uncertainty $\ln K/\eta$ and update cost $\eta n$. With $K=1$, follow the single expert rather than use a zero-rate formula. A doubling-horizon restart schedule gives the same order without knowing $n$; that is a supplementary strategy, not an algorithm specified in the handout.

## 7 Generalized Halving as a Mistake Budget

An infinite class cannot vote by counting functions, but Lecture 6 shows at least one label subclass has smaller Littlestone dimension. Algorithm 1 predicts the larger-dimensional label and retains the true-label subclass. A correct prediction cannot increase dimension; an error retains the smaller side and lowers dimension by at least one.

\[
\operatorname{Ldim}(V_{t+1})
\le\operatorname{Ldim}(V_t)-\mathbf1\{\widehat y_t\ne y_t\}.
\]

Realizability keeps the version space nonempty and its dimension nonnegative. Starting at d permits at most d drops, proving Theorem 2. Dimension acts as a budget of forced mistakes, not parameter count. For singleton indicators, predict negative until the first positive example, after which the target is uniquely determined, giving at most one mistake. Existence does not imply efficient dimension computation.

## 8 From Realizable to Agnostic Learning: Enumerate Mistake Times

If the input tree were known, Hedge could run over its zero-cover. Future inputs are unknown, so a whole tree cannot be constructed. The key idea is that a realizable run disagrees with Generalized Halving on at most d rounds. Build an expert for each set of at most d rounds and flip its default prediction on those rounds. This covers every target function on every actual path.

\[
T\subseteq[n],\quad|T|\le d,\qquad
K=\sum_{m=0}^{\min(d,n)}\binom nm.
\]

Each expert has its own version space. After receiving an input, it computes the default Generalized Halving label, flips according to its fixed set T, and updates using **its own output**. True labels do not update this internal version space; they only determine the expert’s loss for outer Hedge.

```text
                   current input x_t
                     /    |    \
                  expert expert expert
                  T = ∅ T = {1} T = {2}
                     \    |    /
                     Hedge sampling
                           |
                       prediction
                           |
                     true label y_t
                           |
                 update outer loss weights
```

This is a supplementary sketch. Experts update themselves internally; the final arrow only updates outer weights.

## 9 Lemma 2: The Cover Proof by Induction

Fix a target $f$ and any actual input path. Imagine another Generalized Halving run labeled by $f$. It is realizable, so its mistake set $T_f$ has size at most d and is in the expert pool. Prove that expert $T_f$ matches the target:

Both runs start with the same class. Suppose their version spaces agree before round t, so their default labels agree. If the default equals $f(x_t)$, then $t\notin T_f$ and the expert does not flip. Otherwise $t\in T_f$ and it flips, again outputting $f(x_t)$. Both retain the subclass predicting $f(x_t)$, so the next spaces agree. Induction completes the proof.

Experts do not know which $T_f$ is correct or which target is best. Hedge maintains all candidates. The proof establishes a matching expert without requiring it to be identified beforehand. Other experts may predict impossible labels and enter an empty class; define all their later outputs as −1. The matching expert never becomes empty. Duplicate behaviors among indices only reduce the effective pool size.

## 10 Theorem 3: Comparator Direction and Computation

\[
\min_T\sum_t\mathbf1\{y_t^T\ne y_t\}
\le\inf_{f\in\mathcal F}\sum_t\mathbf1\{f(x_t)\ne y_t\}.
\]

Every original function has a matching expert on the realized path, so the expert pool may perform better. Subtract both sides from the same learner loss:

\[
\operatorname{Reg}_{\mathcal F}\le\operatorname{Reg}_{\text{experts}},
\qquad
\mathbb E\operatorname{Reg}_{\mathcal F}
\le2\sqrt{n\ln K}
\le2\sqrt{nd\ln(en/d)}.
\]

This corrects the source’s statement that the regrets are the same: inequality suffices. For $1\le d\le n$, it implies the handout’s $O(\sqrt{dn\ln n})$, using $\ln(en)$ at small horizons. For $d=0$, predict the single function. History-dependent experts do not invalidate Hedge, since their current predictions are fixed before the label and current sampling are revealed.

For $d=2,n=5$, there are $1+5+10=16$ indices. Instead of expanding 31-node trees, maintain 16 internal states. Generally $K$ is roughly $n^d$, and computing dimensions adds cost. This is a constructive learnability proof, not a universally efficient algorithm.

The handout cites [Hanneke, Livni, and Moran (2021)](https://proceedings.mlr.press/v134/hanneke21a.html) for near-optimal agnostic regret with randomized proper algorithms. That result requires additional theory; the improper construction above is not presented as a proper algorithm.

## 11 How Margin Changes the Impossibility Result

Lecture 6 showed online zero-one impossibility for real thresholds because the adversary can probe arbitrarily close to the boundary. A positive margin under normalization excludes that endlessly fine subdivision. Assume dual norms with

\[
\|x_t\|_q\le1,\quad\|\theta^\star\|_p\le1,\quad
\frac1p+\frac1q=1,\quad
y_t\langle\theta^\star,x_t\rangle\ge\gamma>0.
\]

Hölder implies $0<\gamma\le1$. Mere linear separability without a uniform lower bound permits inputs arbitrarily close to the hyperplane and does not give a fixed mistake bound. In Euclidean geometry the distance is $|\langle\theta^\star,x\rangle|/\|\theta^\star\|_2$, at least $\gamma$ under the unit-ball restriction.

The handout first identifies zero hinge loss with unit **score margin**, then normalizes inputs and introduces arbitrary $\gamma$. Normalization does not preserve an unconditional unit-margin requirement: scaling changes scores.

## 12 Learning Margin Classification with a Finite Cover

Take a $\gamma/2$-net of the parameter ball of size at most $(1+4/\gamma)^d$. Its representative $\theta'$ is within $\gamma/2$ of the separator. Hölder gives

\[
\begin{aligned}
y_t\langle\theta',x_t\rangle
&=y_t\langle\theta^\star,x_t\rangle+
y_t\langle\theta'-\theta^\star,x_t\rangle\\
&\ge\gamma-\|\theta'-\theta^\star\|_p\|x_t\|_q
\ge\gamma/2>0.
\end{aligned}
\]

A classifier in the net is therefore perfect, and Halving makes at most $d\log_2(1+4/\gamma)$ mistakes. This is horizon-independent and logarithmic in inverse margin, but the net is exponentially large in d. The next method trades worse margin dependence for an efficient dimension-free guarantee.

## 13 Perceptron: A Vector Correction on Each Mistake

\[
\theta_1=0,\qquad s_t=\operatorname{sign}(\langle\theta_t,x_t\rangle),
\qquad
\theta_{t+1}=\theta_t+\mathbf1\{s_t\ne y_t\}y_tx_t.
\]

Fix $\operatorname{sign}(0)=+1$. A mistake implies nonpositive signed score; the update increases that score by $\|x_t\|_2^2$, without guaranteeing it crosses zero immediately. Not updating on correct predictions lets norm growth be charged only to mistakes. Storage is one d-dimensional vector; each inner product costs $O(d)$, or proportional to nonzero inputs in the sparse case.

## 14 Theorem 4: Two Bounds on the Same Vector

Let $I_t=\mathbf1\{s_t\ne y_t\}$ and $M=\sum_tI_t$. First, every mistaken update makes progress of at least $\gamma$ toward the true separator.

\[
\begin{aligned}
\langle\theta_{t+1},\theta^\star\rangle
&=\langle\theta_t,\theta^\star\rangle+I_ty_t\langle x_t,\theta^\star\rangle\\
&\ge\langle\theta_t,\theta^\star\rangle+I_t\gamma.
\end{aligned}
\]

Summing from zero makes alignment grow linearly in the number of mistakes. Second, each mistake increases squared norm by at most 1.

\[
\begin{aligned}
\|\theta_{t+1}\|_2^2
&=\|\theta_t\|_2^2+2I_ty_t\langle\theta_t,x_t\rangle+I_t\|x_t\|_2^2\\
&\le\|\theta_t\|_2^2+I_t.
\end{aligned}
\]

The cross term is nonpositive because an update occurs **only on mistakes**. The final term is at most 1 because inputs are normalized. Norm therefore grows at most as the square root of mistakes. Cauchy–Schwarz combines the two facts:

\[
M\gamma
\le\langle\theta_{n+1},\theta^\star\rangle
\le\|\theta_{n+1}\|_2\|\theta^\star\|_2
\le\sqrt M.
\]

If $M=0$, the result is immediate. Otherwise divide by $\sqrt M$ and square to obtain $M\le1/\gamma^2$, proving Theorem 4. It holds pathwise for any adaptive sequence satisfying the margin assumption, not merely in expectation.

For general scaling, if $\|x_t\|_2\le R$, $\|\theta^\star\|_2\le B$, and $y_t\langle\theta^\star,x_t\rangle\ge\rho$, the same argument gives

\[
M\rho\le B R\sqrt M,\qquad M\le(BR/\rho)^2.
\]

## 15 A Worked Perceptron Example

Take separator $\theta^\star=(1,0)$ and examples $((-1,0),-1)$, $((0.6,0.8),+1)$, $((0.6,-0.8),+1)$. All lie in the unit ball and have margin at least 0.6. With +1 predicted at zero:

The first prediction is +1 and wrong, updating to $(1,0)$. The next two scores are both 0.6, so no update occurs. There is only one actual mistake; the bound $1/0.6^2\approx2.78$ means at most two integer mistakes. The bound need not be attained. On a sequence causing a second error, the proof still counts only mistaken updates, regardless of the number of correct rounds.

## 16 Sequential Fat and the Dimension Qualification

The handout ends with the claim that linear sequential fat is “of order $1/\gamma^2$.” First prove the dimension-free upper bound. Use the Euclidean complexity calculation from Lecture 6, avoiding confusion between a general witness tree and zero-threshold margin. If a depth-m tree is shattered at scale $\alpha$, choose its matching function on each path:

\[
\sup_f\sum_{t=1}^m\epsilon_tf(\mathbf x_t(\epsilon))
\ge\sum_{t=1}^m\epsilon_t\mathbf y_t(\epsilon)+m\alpha/2.
\]

The witness is predictable, so every $\epsilon_t\mathbf y_t$ has expectation zero. Divide by m and take expectations: complexity is at least $\alpha/2$, while Euclidean linear complexity is at most $1/\sqrt m$. Hence

\[
\operatorname{sfat}(\mathcal F,\alpha)\le4/\alpha^2.
\]

A matching lower bound needs enough dimensions. Let $k=\min(d,\lfloor4/\alpha^2\rfloor)$, use basis vector $e_i$ at level i, and use witness zero. For each sign vector choose $\theta=(\alpha/2)\sum_{i=1}^k\epsilon_i e_i$. Then

\[
\|\theta\|_2^2=k\alpha^2/4\le1,\qquad
\epsilon_i\langle\theta,e_i\rangle=\alpha/2.
\]

Thus sfat is at least k. Only with sufficiently large d does this match $\Theta(1/\alpha^2)$. Why not claim this unconditionally in fixed low dimension? On the one-dimensional parameter interval $[-1,1]$, witnesses for two distinct paths differ by at least $\alpha$ at their first shared branching input, hence their parameters differ by at least $\alpha$. A depth-m tree has $2^m$ paths, so

\[
2^m\le1+2/\alpha,\qquad
m\le\log_2(1+2/\alpha)\quad(d=1).
\]

This differs sharply from an unconditional inverse-square lower bound. The derivation also explains the factor 4 caused by the $\alpha/2$ convention versus a direct margin $\gamma$.

## 17 Pitfalls, Self-Test, and Reading Route

1. Why does deterministic Halving not contradict the two-expert lower bound? It assumes a perfect classifier.
2. Can the best Hedge expert move outside the expectation? No; the pathwise lemma lets us choose it before taking expectation.
3. Do T experts internally update using true labels? No; they use their own predictions. True labels update outer weights.
4. Which regret is larger? The expert benchmark can be better, so expert regret is at least original-class regret.
5. Where does Perceptron’s nonpositive cross term come from? Updates occur only on mistakes, whose signed score is nonpositive.
6. What fails without bounded input norm? The bound of one on each squared-norm increase.
7. Is one update guaranteed to correct its example? No; only score improvement is proved.
8. Does a dimension-free mistake upper bound imply a matching sfat lower bound in every dimension? No; see the one-dimensional packing argument.

Spend 20 minutes deriving Halving and the two-expert example, then 30 minutes recalculating the Hedge potential. Simulate two T experts on a small class to distinguish internal and outer updates. Finally derive the two Perceptron inequalities independently, check normalization, and read the supplementary sequential-fat argument.
