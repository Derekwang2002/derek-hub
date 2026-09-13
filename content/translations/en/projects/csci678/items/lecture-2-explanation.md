---
title: "Lecture 2 Detailed Explanation: Uniform Convergence and Rademacher Complexity"
summary: "A section-by-section expansion of Lecture 2: from the minimax upper bound for ERM to symmetrization, Rademacher complexity, Massart's lemma, the growth function, and VC dimension, including the auxiliary proofs omitted from the slides."
---

> Expanded from Haipeng Luo's Lecture 2 (Fall 2026; the original slides are 8 pages). Following the format of the Lecture 3 explanation report, this covers Theorems 1 and 2, Lemmas 1-4, Propositions 1-7, and the auxiliary proofs omitted from the lecture notes. Every step states the conditions it uses and its role in the overall argument.
>
> Original slides: lecture2.pdf (not published online). Companion pages on this site: [full slide translation](/projects/csci678/lecture-2-full-translation); surrounding lectures: [Lecture 1](/projects/csci678/lecture-1-explanation), [Lecture 3](/projects/csci678/lecture-3-preview). The function class is assumed nonempty by default, with the necessary measurability and integrability conditions in place; boundedness conditions are stated explicitly whenever a bounded concentration bound is used. We do not assume that every optimization problem can be solved efficiently.

## Reading guide: turning the intractable minimax value into a computable complexity, step by step

Lecture 1 defined the goal of learning, but
$\inf_{\text{algorithm}}\sup_{\text{distribution}}\text{excess risk}$ is hard to compute directly. Through a chain of upper bounds, this lecture turns it into an empirical process, then a Rademacher complexity, and finally a function count or a VC dimension.

| Step | Method used | Difficulty it resolves |
|---|---|---|
| Fix the algorithm to be ERM | Minimize empirical risk | No longer optimizing over all possible algorithms |
| Control ERM by a uniform deviation | Empirical process | No need to analyze the specific form of the training output directly |
| Symmetrization | Introduce an independent copy and random signs | Removes the intractable population-risk term |
| Remove the loss function | Classification identity, Lipschitz contraction | Turns the loss class into the prediction class |
| Maximal inequality for finite classes | Sub-Gaussian, Massart | Controls complexity by the logarithm of the function count |
| Projections of infinite binary classes | Growth function | Infinitely many functions have only finitely many behaviors on a finite sample |
| Sauer's lemma | VC dimension | Controls the growth function at every sample size with a single combinatorial parameter |
| No-free-lunch converse | Infinite VC dimension ⇒ constant lower bound | Shows the condition is not only sufficient but also necessary |

What ultimately "closes the loop" in this lecture is the learnability condition for binary classification; it does not prove that every intermediate upper bound is optimal in exact constants, logarithmic factors, or for arbitrary loss problems.

## 1. Starting point: why ERM gives a minimax upper bound

### 1.1 Risk and the value of the game

Let $S=(z_1,\ldots,z_n)\overset{\rm iid}{\sim}P^n$, and define
\[
L_P(f)=\mathbb E_{z\sim P}\ell(f,z),\qquad
\widehat L_S(f)=\frac1n\sum_{t=1}^n\ell(f,z_t).
\tag{1}
\]

The value of the learning game is
\[
\mathcal V^{\rm iid}(\mathcal F,n)
=\inf_A\sup_P\left[
\mathbb E_SL_P(A(S))-\inf_{f\in\mathcal F}L_P(f)\right],
\tag{2}
\]
where the algorithm may have internal randomness, and the expectation includes it by default.

ERM chooses
\[
\widehat f_{\rm ERM}\in\arg\min_{f\in\mathcal F}\widehat L_S(f).
\tag{3}
\]

Because the infimum over all algorithms is no larger than the worst-case error of any specific algorithm,
\[
\mathcal V^{\rm iid}(\mathcal F,n)
\le\sup_P\left[
\mathbb E L_P(\widehat f_{\rm ERM})-\inf_fL_P(f)\right].
\tag{4}
\]

This is only an upper bound; it does not claim that ERM is already known to be optimal at the outset. Only after the analysis succeeds can one say that ERM suffices to achieve the corresponding learnability.

### 1.2 What if the minimum is not attained

Even when the argmin does not exist, one can choose an approximate ERM:
\[
\widehat L_S(\widetilde f)
\le\inf_f\widehat L_S(f)+\xi_n.
\tag{5}
\]
The risk bounds below then only need an additional $\mathbb E\xi_n$. When the optimal population risk is not attained, compare against a fixed $\eta$-optimal function and finally let $\eta\downarrow0$. So existence shorthand usually does not change the statistical conclusions, but "the algorithm can be chosen measurably" remains a technical condition that must be satisfied.

### 1.3 Regularization and constrained classes: completing the argument and stating its limits

Suppose $f_\lambda$ minimizes
\[
\widehat L_S(f)+\lambda\Psi(f),\qquad\lambda>0.
\tag{6}
\]
Let $c=\Psi(f_\lambda)$. If there is a $g$ with $\Psi(g)\le c$ and
$\widehat L_S(g)<\widehat L_S(f_\lambda)$, then
\[
\widehat L_S(g)+\lambda\Psi(g)
<\widehat L_S(f_\lambda)+\lambda\Psi(f_\lambda),
\]
a contradiction. So $f_\lambda$ is also ERM over the constrained class $\{f:\Psi(f)\le c\}$.

This proves "given a penalized optimum, one can find a constraint radius that explains it." But $c$ here may depend on the data; the converse direction, "every constrained optimum arises from some penalty parameter," generally requires conditions such as convexity and duality. If one wants to apply the generalization bounds below to a fixed constrained class, one cannot freely choose $c$ after seeing the data while ignoring the selection cost or the need for uniform control.

## 2. The empirical process: why convergence for a single function is not enough

### 2.1 The full derivation from ERM to a one-sided uniform deviation

First assume $f^*\in\arg\min_fL_P(f)$. It may depend on $P$, but not on the current sample. Then
\[
\begin{aligned}
\mathbb EL_P(\widehat f_{\rm ERM})-L_P(f^*)
&=\mathbb E[L_P(\widehat f_{\rm ERM})-\widehat L_S(f^*)]\\
&\le\mathbb E[L_P(\widehat f_{\rm ERM})-\widehat L_S(\widehat f_{\rm ERM})]\\
&\le\mathbb E\sup_{f\in\mathcal F}[L_P(f)-\widehat L_S(f)].
\end{aligned}
\tag{7}
\]

The first equality uses unbiasedness, $\mathbb E\widehat L_S(f^*)=L_P(f^*)$; the second step uses the empirical optimality of ERM, since subtracting a smaller empirical loss makes the difference larger; the third step relaxes the single data-selected function to the whole class.

Therefore
\[
\mathcal V^{\rm iid}(\mathcal F,n)
\le\sup_P\mathbb E\sup_f[L_P(f)-\widehat L_S(f)].
\tag{8}
\]

There is no extra factor of 2 here, because only the error of a fixed comparator is handled in expectation. The common per-sample absolute-deviation bound
$L(\widehat f)-L(f^*)\le2\sup_f|L(f)-\widehat L(f)|$
comes from a different derivation, and its constant cannot be mixed arbitrarily into (7).

### 2.2 The empirical process is a whole family of random variables

For each fixed $f$, let
\[
X_f(S)=L_P(f)-\widehat L_S(f).
\tag{9}
\]
It has mean zero. Assuming the loss is integrable, the law of large numbers says that for fixed $f$,
$X_f(S)\to0$. But the algorithm selects the function based on the sample, so one must control the maximal deviation of the whole family simultaneously.

The expected one-sided uniform convergence condition used in the slides is
\[
\limsup_{n\to\infty}\sup_P\mathbb E_S\sup_{f\in\mathcal F}X_f(S)=0.
\tag{10}
\]

"Convergence for every fixed $f$" and "convergence of the supremum" cannot be interchanged; "for every fixed $P$" and "uniformly over all $P$" must not be conflated either. Textbooks also define uniform convergence in a probabilistic sense or with two-sided absolute deviations; when reading, check which one is in use.

### 2.3 A supplementary counterexample: every fixed function converges, yet the sample optimum overfits badly

Let the input be uniform on $[0,1]$, and let the true label be constantly $+1$. Take the class of all functions that predict $+1$ on some finite set and $-1$ everywhere else.

Any fixed function is correct on only finitely many inputs; those points have probability zero, so the population 0-1 risk is 1. For any fixed function, the empirical risk also tends to 1 almost surely.

But given the current training inputs, the class contains a function that predicts $+1$ at every training point, so the training loss is zero while the population risk is still 1:
\[
\sup_{f\in\mathcal F}[L_P(f)-\widehat L_S(f)]=1.
\tag{11}
\]

This example shows specifically that pointwise convergence does not imply uniform convergence. Since the best population risk in this particular class is also 1, it cannot by itself serve as an example of "ERM has excess risk 1"; if one wants that conclusion as well, add the constant $+1$ function to the class and let ERM's tie-breaking rule select the memorizing function above.

## 3. Rademacher complexity: measuring only how well the class aligns with random signs

For a function class $\mathcal H\subseteq\mathbb R^{\mathcal Z}$, with the sample locations fixed, define
\[
\widehat{\mathcal R}_S(\mathcal H)
=\frac1n\mathbb E_{\epsilon_{1:n}}
\sup_{h\in\mathcal H}\sum_{t=1}^n\epsilon_th(z_t),
\quad
\Pr(\epsilon_t=\pm1)=1/2,
\tag{12}
\]
where the signs are mutually independent. The unconditional version is
\[
\mathcal R_{P,n}(\mathcal H)
=\mathbb E_{S\sim P^n}\widehat{\mathcal R}_S(\mathcal H).
\tag{13}
\]

The supremum inside the expectation can choose the function after seeing the random signs, so this quantity is not "the correlation between some fixed model and the noise."

Three directly verifiable properties:

- A nonempty singleton class has complexity zero, because every $\epsilon_t$ has mean zero.
- If the values $\pm1$ can be realized arbitrarily at distinct sample points, one can choose $h(z_t)=\epsilon_t$, and the complexity is 1.
- Adding to each coordinate a constant $c_t$ independent of $h$ does not change the complexity, because the new term $\mathbb E\sum_t\epsilon_tc_t=0$.

This lecture's definition has no absolute value inside the supremum. If it were changed to
$\mathbb E\sup_h|\sum_t\epsilon_th(z_t)|/n$, a singleton class would generally no longer have complexity zero, and the form and constants of the corresponding lemmas would have to be rechecked.

## 4. Theorem 1: the complete symmetrization proof

### 4.1 Defining the loss class

Turn predictors into functions on the sample space:
\[
\ell(\mathcal F)=\{h_f:h_f(z)=\ell(f,z),\ f\in\mathcal F\}.
\tag{14}
\]

We want to prove
\[
\boxed{\mathbb E_S\sup_f[L_P(f)-\widehat L_S(f)]
\le2\mathcal R_{P,n}(\ell(\mathcal F)).}
\tag{15}
\]

### 4.2 Introducing a ghost sample

Let $S'=(z'_1,\ldots,z'_n)$ be an independent $P^n$ sample. Since
$L_P(f)=\mathbb E_{S'}n^{-1}\sum_t\ell(f,z'_t)$,
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

Why does the inequality go in this direction? For each $f$, its random value does not exceed the supremum over all functions; this is preserved after taking expectations, and then we take the supremum over $f$, so
$\sup_f\mathbb E X_f\le\mathbb E\sup_fX_f$.

### 4.3 Why random signs can appear out of nowhere

Fix any sign sequence. When $\epsilon_t=-1$, swap $(z_t,z'_t)$; when it is $+1$, do not swap. Each pair of samples has joint distribution $P\times P$, and swapping does not change it; the pairs remain independent of one another. Therefore
\[
\mathbb E_{S,S'}\sup_f\sum_t[\ell(f,z'_t)-\ell(f,z_t)]
=\mathbb E_{S,S',\epsilon}\sup_f
\sum_t\epsilon_t[\ell(f,z'_t)-\ell(f,z_t)].
\tag{17}
\]

This is not a numerical equality that holds for one fixed sample; it is a distributional equivalence after taking expectations over random samples.

### 4.4 Splitting the supremum to get the factor 2

\[
\begin{aligned}
\frac1n\mathbb E\sup_f\sum_t\epsilon_t[\ell(f,z'_t)-\ell(f,z_t)]
&\le\frac1n\mathbb E\sup_f\sum_t\epsilon_t\ell(f,z'_t)\\
&\quad+\frac1n\mathbb E\sup_f\sum_t(-\epsilon_t)\ell(f,z_t)\\
&=2\mathcal R_{P,n}(\ell(\mathcal F)).
\end{aligned}
\tag{18}
\]

The two terms are equal because $S,S'$ are identically distributed and $-\epsilon$ has the same distribution as $\epsilon$. Combining (16)-(18) proves Theorem 1.

The resulting complexity depends only on the values of the functions on the sample and no longer contains a separate population term $L_P(f)$. This is the key to replacing an infinite class by a finite projection later.

## 5. Lemma 1: why binary 0-1 loss contributes exactly a factor of $1/2$

When $y,f(x)\in\{-1,+1\}$, we have the identity
\[
\mathbf1\{f(x)\ne y\}=\frac{1-yf(x)}2.
\tag{19}
\]

Indeed, $yf(x)=1$ when the signs agree and $-1$ when they differ, giving losses 0 and 1 respectively. After fixing the labeled sample,
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

The first term is zero. Since $y_t$ is fixed and equals $\pm1$, the signs
$-\epsilon_ty_t$ are still independent and equally likely to be $\pm1$. Taking the expectation over the sample again,
\[
\mathcal R_{P,n}(\ell(\mathcal F))
=\tfrac12\mathcal R_{P_X,n}(\mathcal F).
\tag{21}
\]

The right-hand side actually depends only on the input marginal $P_X$. The slides use the same shorthand $\mathcal R^{\rm iid}$; here we mark the distribution explicitly to avoid misunderstanding.

## 6. Lemma 2: the coordinate-wise proof of Lipschitz contraction

### 6.1 Conditions and goal

Suppose $\ell(f,(x,y))=\widetilde\ell(f(x),y)$, and for all admissible predictions and labels,
\[
|\widetilde\ell(u,y)-\widetilde\ell(v,y)|\le G|u-v|.
\tag{22}
\]

We want to prove
\[
\widehat{\mathcal R}_S(\ell(\mathcal F))
\le G\widehat{\mathcal R}_{x_{1:n}}(\mathcal F).
\tag{23}
\]

### 6.2 Replace only the last coordinate first

Fix $\epsilon_1,\ldots,\epsilon_{n-1}$, and write
\[
A_f=\sum_{t=1}^{n-1}\epsilon_t\widetilde\ell(f(x_t),y_t),
\qquad \phi(u)=\widetilde\ell(u,y_n).
\tag{24}
\]

Average over the two possible values of the last sign:
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

The second step uses that the sum of two suprema with independently chosen functions equals the supremum over ordered pairs. If the optimum is not attained, pick two functions arbitrarily close to optimal and let the error tend to zero.

### 6.3 Why the absolute value can be removed

$A_f+A_g$ is unchanged when $f,g$ are swapped, while
$f(x_n)-g(x_n)$ changes sign. So every difference with positive absolute value can be turned into a positive difference without the absolute value by swapping the order:
\[
\sup_{f,g}[A_f+A_g+G|f(x_n)-g(x_n)|]
=\sup_{f,g}[A_f+A_g+G(f(x_n)-g(x_n))].
\tag{26}
\]

Split the supremum back apart:
\[
\begin{aligned}
\frac12\sup_{f,g}[A_f+A_g+Gf(x_n)-Gg(x_n)]
&=\frac12\sup_f[A_f+Gf(x_n)]
+\frac12\sup_g[A_g-Gg(x_n)]\\
&=\mathbb E_{\epsilon_n}\sup_f[A_f+\epsilon_nGf(x_n)].
\end{aligned}
\tag{27}
\]

Thus the nonlinear loss at the last coordinate is replaced by $Gf(x_n)$ without making the complexity smaller. Taking expectations over the earlier signs and replacing coordinates $n-1,\ldots,1$ one by one gives
\[
\mathbb E\sup_f\sum_t\epsilon_t\widetilde\ell(f(x_t),y_t)
\le\mathbb E\sup_f\sum_t\epsilon_tGf(x_t).
\tag{28}
\]
Dividing by $n$ yields (23). The proof does not require $\mathcal F$ to be closed under negation, nor does it require $\widetilde\ell(0,y)=0$, because it uses the absolute-value-free definition of complexity.

On page 4 of the original slides, after merging the two suprema, one displayed formula prints an extra $\epsilon_t$ in front of the $g$ terms. The correct term is
$\sum_{t<n}\epsilon_t[\widetilde\ell(f(x_t),y_t)+\widetilde\ell(g(x_t),y_t)]$; this report uses the $A_f+A_g$ notation to avoid duplicated symbols.

### 6.4 Why the constant for square loss is 2

The slides use the half-square loss
$\widetilde\ell(u,y)=\tfrac12(u-y)^2$. For $u,v,y\in[-1,1]$:
\[
\begin{aligned}
|\widetilde\ell(u,y)-\widetilde\ell(v,y)|
&=\tfrac12|(u-v)(u+v-2y)|\\
&\le\tfrac12|u-v|(1+1+2)
=2|u-v|.
\end{aligned}
\tag{29}
\]

So $G=2$. Without the leading $1/2$ in the loss, $G=4$; if predictions and labels can be arbitrary real numbers, there is no such global constant. The square loss of Lecture 1 and the half-square loss of this lecture must not be mixed up when it comes to constants.

At this point, taking $G=1/2$ for classification and a legitimate Lipschitz constant for regression, we have
\[
\mathcal V^{\rm iid}(\mathcal F,n)
\le2G\sup_{P_X}\mathcal R_{P_X,n}(\mathcal F).
\tag{30}
\]

## 7. Sub-Gaussian variables and Hoeffding's lemma, left unproven in the slides

### 7.1 Sub-Gaussian does not require the variable to actually be Gaussian

A zero-mean random variable $U$ satisfying
\[
\mathbb E e^{\lambda U}\le e^{\sigma^2\lambda^2/2}
\quad\text{for all }\lambda\in\mathbb R,
\tag{31}
\]
is called $\sigma$-sub-Gaussian. Here $\sigma^2$ is a variance proxy for the exponential moment and need not equal the actual variance.

Control of the exponential moment converts into tail control: for $\lambda>0$, Markov's inequality gives
\[
\Pr(U\ge t)\le e^{-\lambda t}\mathbb E e^{\lambda U}
\le e^{-\lambda t+\sigma^2\lambda^2/2}.
\tag{32}
\]
For $\sigma>0,t>0$, take $\lambda=t/\sigma^2$ to get
$\Pr(U\ge t)\le e^{-t^2/(2\sigma^2)}$. This explains why "sub-Gaussian" means Gaussian-like tail decay without requiring the same density shape.

### 7.2 A complete proof of Hoeffding's lemma

If $\mathbb EU=0$ and $U\in[a,b]$, we want to prove
\[
\mathbb E e^{\lambda U}
\le \exp\left(\frac{\lambda^2(b-a)^2}{8}\right),
\tag{33}
\]
i.e., $U$ is $(b-a)/2$-sub-Gaussian.

Let $K(\lambda)=\log\mathbb E e^{\lambda U}$. Since $U$ is bounded, we can differentiate under the expectation. Define the exponentially tilted expectation
\[
\mathbb E_\lambda[g(U)]
=\frac{\mathbb E[g(U)e^{\lambda U}]}{\mathbb E e^{\lambda U}}.
\tag{34}
\]
Differentiating $K$ twice directly:
\[
K'(\lambda)=\mathbb E_\lambda U,\qquad
K''(\lambda)=\mathbb E_\lambda U^2-(\mathbb E_\lambda U)^2
=\operatorname{Var}_\lambda(U).
\tag{35}
\]

For any variable supported on $[a,b]$ with mean $\mu$,
$(U-a)(b-U)\ge0$ gives
$\mathbb EU^2\le(a+b)\mu-ab$, and hence
\[
\operatorname{Var}(U)
\le(b-\mu)(\mu-a)
\le\frac{(b-a)^2}{4}.
\tag{36}
\]
The last step says the product of two nonnegative numbers with a fixed sum is maximized when they are equal, or simply complete the square.

The tilted distribution is still supported on $[a,b]$, so $K''(\lambda)$ also satisfies (36). Since
$K(0)=0,K'(0)=\mathbb EU=0$, Taylor's formula with integral remainder gives
\[
K(\lambda)=\lambda^2\int_0^1(1-s)K''(s\lambda)\,ds
\le\frac{\lambda^2(b-a)^2}{8}.
\tag{37}
\]
This form works for positive and negative $\lambda$ alike. Exponentiating gives (33). If $a=b$, zero mean forces $U=0$, and the conclusion holds directly.

## 8. Lemma 3: why the maximal inequality depends only on $\ln M$

Let $U_1,\ldots,U_M$ all be $\sigma$-sub-Gaussian variables; they are not required to be independent. For any $\lambda>0$:
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

The first step is Jensen's inequality for the convex exponential; the third step says a maximum of nonnegative numbers does not exceed their sum. Take logarithms and divide by $\lambda$:
\[
\mathbb E\max_iU_i\le\frac{\ln M}{\lambda}+\frac{\sigma^2\lambda}{2}.
\tag{39}
\]

For $M>1,\sigma>0$, differentiate the right-hand side and set
$-\ln M/\lambda^2+\sigma^2/2=0$, giving
$\lambda_*=\sqrt{2\ln M}/\sigma$. Substituting back,
\[
\boxed{\mathbb E\max_iU_i\le\sigma\sqrt{2\ln M}.}
\tag{40}
\]

When $M=1$ the left-hand side is zero; when $\sigma=0$ the variables degenerate to zero, and the division above is not needed either. The $U_i$ can be highly correlated, because the proof only controls each exponential moment separately and never factors the joint distribution across different $i$.

## 9. Theorem 2: Massart's lemma and learning with finite classes

### 9.1 Each function corresponds to a random signed sum

Fix the inputs $x_{1:n}$. For a finite class $\mathcal F$, define
\[
U_f=\sum_{t=1}^n\epsilon_tf(x_t),\qquad
\sigma=\max_{f\in\mathcal F}\sqrt{\sum_{t=1}^nf(x_t)^2}.
\tag{41}
\]

For fixed $f$, the terms are independent with mean zero. Each term lies in
$[-|f(x_t)|,|f(x_t)|]$, so by Hoeffding's lemma it is $|f(x_t)|$-sub-Gaussian. Therefore
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

The first step is where independence is truly needed: it is the independence of the random signs at different sample locations, not the independence of the $U_f$ across different $f$.

### 9.2 Applying the maximal lemma and dividing by the sample size

By (40):
\[
\boxed{
\widehat{\mathcal R}_{x_{1:n}}(\mathcal F)
\le\frac1n
\sqrt{2\left(\max_f\sum_tf(x_t)^2\right)\ln|\mathcal F|}.
}
\tag{43}
\]

If $|f(x)|\le C$, then $\max_f\sum_tf(x_t)^2\le nC^2$, so
\[
\mathcal R_{P_X,n}(\mathcal F)
\le C\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\tag{44}
\]

Combining with (30):
\[
\mathcal V^{\rm iid}(\mathcal F,n)
\le2GC\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\tag{45}
\]

For a fixed finite class with finite $G,C$, the right-hand side tends to zero. If we want the upper bound not to exceed $\varepsilon$, a sufficient condition is
\[
n\ge \frac{8G^2C^2\ln|\mathcal F|}{\varepsilon^2}.
\tag{46}
\]

This is the guarantee given by this method; one cannot call it "the exact optimal rate for all finite classes" based on an upper bound alone. For example, a singleton class has excess risk zero to begin with, and realizable classification achieves yet a different rate.

### 9.3 Why not apply the maximal inequality to the empirical process directly

For a fixed finite class with bounded loss $\ell(f,z)\in[a,b]$, let $B=b-a$. Each
$X_f=L_P(f)-\widehat L_S(f)$ is $B/(2\sqrt n)$-sub-Gaussian. Proof: each centered term
$L_P(f)-\ell(f,z_t)$ has mean zero and range length $B$; summing the independent terms and dividing by $n$ turns the squared exponential-moment parameter into $n(B/2)^2/n^2$.

The maximal lemma then gives directly
\[
\mathbb E\max_fX_f
\le\frac B{2\sqrt n}\sqrt{2\ln|\mathcal F|}.
\tag{47}
\]

So finite classes can indeed skip symmetrization and still get a guarantee. In an infinite class, however, $L_P(f)$ is not determined by the predicted values on the sample alone, and the empirical process cannot be compressed equivalently into a finite projection. The value of symmetrization is that it provides a uniform treatment for infinite classes.

## 10. Infinite binary classes: where the growth function comes from

### 10.1 Sample projections turn "infinitely many functions" into "finitely many behaviors"

For $\mathcal F\subseteq\{-1,+1\}^{\mathcal X}$, define
\[
F_S=\mathcal F|_{x_{1:n}}
=\{(f(x_1),\ldots,f(x_n)):f\in\mathcal F\}
\subseteq\{-1,+1\}^n.
\tag{48}
\]

Although $\mathcal F$ may be uncountable, $|F_S|\le2^n$. And
\[
\widehat{\mathcal R}_{x_{1:n}}(\mathcal F)
=\frac1n\mathbb E_\epsilon
\max_{v\in F_S}\sum_t\epsilon_tv_t.
\tag{49}
\]

This equality holds because the objective only reads the $f(x_t)$; functions with the same projection contribute exactly the same.

The growth function is defined as the maximal number of behaviors over all sample locations:
\[
\Pi_{\mathcal F}(n)=\max_{x_{1:n}}|F_S|.
\tag{50}
\]

Since the number of possibilities is a finite integer, the maximum can be understood as an actually attained largest integer. Repeated inputs can only reduce the degrees of freedom for distinct labelings; when computing the worst-case growth function one usually picks distinct inputs.

### 10.2 The complexity bound and the failure of the trivial bound

Every projected vector has squared norm $n$, so Massart's lemma gives
\[
\widehat{\mathcal R}_S(\mathcal F)
\le\sqrt{\frac{2\ln|F_S|}{n}}
\le\sqrt{\frac{2\ln\Pi_{\mathcal F}(n)}{n}}.
\tag{51}
\]

In binary classification $2G=1$, hence
\[
\mathcal V^{\rm iid}(\mathcal F,n)
\le\sqrt{\frac{2\ln\Pi_{\mathcal F}(n)}{n}}.
\tag{52}
\]

Plugging in only $2^n$ gives the constant $\sqrt{2\ln2}$, which does not prove convergence to zero; one can also use the trivial complexity bound 1 to improve the constant slightly, but it still does not tend to zero. If the growth function is only of order $n^d$, its logarithm is $d\ln n$, and after dividing by $n$ it can tend to zero.

### 10.3 Why population risk cannot be compressed directly into the projection

Two functions can agree on every training point yet differ substantially outside the training set. They have the same empirical risk but may have different population risks, so
$L_P(f)-\widehat L_S(f)$ cannot be recovered from the projection vector alone.

Symmetrization replaces the population mean by a sample difference and then splits it via random signs; only then does one obtain a quantity that depends only on the finite projection. This step explains the design purpose of the whole chain of upper bounds.

## 11. Propositions 1 and 2: the exact growth functions of thresholds and intervals

### 11.1 Why the single-threshold class has exactly $n+1$ labelings

The slides define
\[
f_\theta(x)=
\begin{cases}
+1,&x\le\theta,\\
-1,&x>\theta.
\end{cases}
\tag{53}
\]

Sort the distinct samples $x_1<\cdots<x_n$. Positive labels can only form a left prefix: the first $k$ are $+1$ and the rest are $-1$, for $k=0,\ldots,n$.

Every $k$ is realizable: for $k=0$ take $\theta<x_1$; for $k=n$ take $\theta\ge x_n$; for the other $k$ take $x_k\le\theta<x_{k+1}$. Therefore
\[
\Pi_{\rm threshold}(n)=n+1,\qquad
\mathcal V^{\rm iid}\le\sqrt{2\ln(n+1)/n}.
\tag{54}
\]

A proof of an "exact growth function" requires both an upper and a lower bound; one cannot claim exactness by listing only some realizable patterns.

### 11.2 Why the interval class gives $\binom{n+1}{2}+1$

Predict $+1$ inside the interval and $-1$ outside:
\[
f_{\theta_1,\theta_2}(x)
=
\begin{cases}
+1,&\theta_1\le x\le\theta_2,\\
-1,&\text{otherwise},
\end{cases}
\quad\theta_1\le\theta_2.
\tag{55}
\]

A nonempty set of positive labels must be a contiguous block $x_i,\ldots,x_j$ with
$1\le i\le j\le n$. The total number of block lengths and positions is
\[
\sum_{i=1}^n(n-i+1)=\frac{n(n+1)}2=\binom{n+1}{2}.
\tag{56}
\]

Every contiguous block is realizable by an interval; together with the all-negative labeling realized by placing the interval outside all the samples, we get
\[
\Pi_{\rm interval}(n)=\binom{n+1}{2}+1.
\tag{57}
\]

Then (52) gives $O(\sqrt{\ln(n+1)/n})$. One can also count by picking the two gaps, among the $n+1$ gaps between samples, where the endpoints fall, but "the positive labels form a single contiguous block" explains more directly why nothing is double-counted or missed.

## 12. The definition of VC dimension and complete proofs of Propositions 3-5

### 12.1 The quantifiers in "shattering"

A set of $m$ inputs is shattered if all $2^m$ label vectors can be realized by functions in the class:
\[
\exists x_1,\ldots,x_m,\quad
\forall s\in\{-1,+1\}^m,\quad
\exists f\in\mathcal F,\quad f(x_i)=s_i.
\tag{58}
\]

The VC dimension is the supremum of the sizes of shattered point sets:
\[
\operatorname{VCdim}(\mathcal F)
=\sup\{m:\Pi_{\mathcal F}(m)=2^m\}.
\tag{59}
\]

To prove that the VC dimension equals $d$, one must do two different things: construct **one** shattered set of size $d$, and prove that **no** set of size $d+1$ can be shattered. Showing that one particular set of $d+1$ points fails is not enough.

If a large set is shattered, so is every subset of it: for any labeling of the subset, assign arbitrary labels to the remaining points and use the realizing function of the large set. Hence a class of finite dimension $d$ has $\Pi(m)=2^m$ for all $m\le d$.

### 12.2 Proposition 3: VC dimension is 0 if and only if a nonempty class has exactly one function

If the class has only one function, any single point admits at most one label and naturally cannot be shattered. Conversely, if the class contains two different functions $f,g$, there is an $x$ with $f(x)\ne g(x)$. Both binary labels are then realizable at that point, so at least one point can be shattered and the VC dimension is at least 1.

Here functions are distinguished as actual mappings, not as different parameterizations; reparameterizing the same function does not increase the VC dimension of the class. The "nonempty class" condition must also be kept, otherwise the empty class is a boundary exception to the original statement.

### 12.3 Proposition 4: the threshold class has VC dimension 1

For any single point $x$, placing the threshold to its left or right realizes both labels, so the lower bound is 1. For any two distinct points $x_1<x_2$, the labeling $(-1,+1)$ is impossible: if the right point is to the left of the threshold, the left point must be as well. Hence the upper bound is 1.

### 12.4 Proposition 5: the interval class has VC dimension 2

For any $x_1<x_2$, all four labelings are realizable: the interval covers both points, only the first, only the second, or neither, so the lower bound is 2.

For any three distinct points $x_1<x_2<x_3$, the labeling $(+1,-1,+1)$ is not realizable, because an interval containing both endpoints must contain the middle point. Hence the upper bound is 2.

These examples show that VC dimension measures the number of points whose labels can be controlled independently, not merely how many functions there are.

## 13. Proposition 6: affine linear classifiers have VC dimension equal to the input dimension plus one

To avoid clashing with the VC-dimension notation, here $p$ denotes the dimension of the input space. Consider
\[
\mathcal F_{\rm lin}
=\{x\mapsto\operatorname{sign}(\langle\theta,x\rangle+b):
\theta\in\mathbb R^p,\ b\in\mathbb R\},
\tag{60}
\]
with the slide convention $\operatorname{sign}(u)=+1$ when $u\ge0$ and $-1$ otherwise.

### 13.1 An explicit construction for the lower bound $p+1$

Take the $p+1$ points $x_0=0,x_i=e_i\ (i=1,\ldots,p)$. For arbitrary labels
$s_0,\ldots,s_p\in\{-1,+1\}$, let
\[
b=s_0,\qquad\theta_i=s_i-s_0.
\tag{61}
\]
Then
$\langle\theta,x_0\rangle+b=s_0$ and
$\langle\theta,e_i\rangle+b=s_i$. All labels are realized strictly, so
\[
\operatorname{VCdim}(\mathcal F_{\rm lin})\ge p+1.
\tag{62}
\]

This does not say "every set of $p+1$ points can be shattered"; it says there exists one such affinely independent set that can be shattered. Degenerate configurations such as collinear points may fail.

### 13.2 Affine dependence proves that any $p+2$ points fail

Take any $p+2$ points and augment them to
$\widetilde x_i=(x_i,1)\in\mathbb R^{p+1}$. Linear dependence guarantees coefficients $a_i$, not all zero, with
\[
\sum_i a_ix_i=0,\qquad\sum_i a_i=0.
\tag{63}
\]

Since the coefficients sum to zero, the nonzero coefficients include both positive and negative ones. Label the positive-coefficient points $+1$, the negative-coefficient points $-1$, and the zero-coefficient points arbitrarily. If some $(\theta,b)$ realizes this, then
\[
a_i(\langle\theta,x_i\rangle+b)\ge0
\quad(a_i>0),
\]
while for $a_i<0$, the negative label forces the score to be strictly negative, which becomes strictly positive after multiplication by the negative coefficient. There is at least one negative coefficient, so
\[
0<
\sum_i a_i(\langle\theta,x_i\rangle+b)
=\left\langle\theta,\sum_i a_ix_i\right\rangle
+b\sum_i a_i=0,
\tag{64}
\]
a contradiction. Therefore no $p+2$ points can be shattered; combined with the lower bound:
\[
\boxed{\operatorname{VCdim}(\mathcal F_{\rm lin})=p+1.}
\tag{65}
\]

This proof keeps the sign convention at zero and does not gloss over "points on the boundary." Without the bias $b$ it is a different function class, and $p+1$ cannot be applied directly.

### 13.3 The four-point problem in two dimensions: intuition and the exact answer

In two dimensions, three non-collinear points can be shattered. If four points form a convex quadrilateral, label them $+,-,+,-$ alternately along the boundary; the segments joining the two same-labeled pairs cross, and no line can separate them. If one point lies in the convex hull of the other three, labeling the interior point oppositely to the three outer points is also not linearly separable; degenerate cases are covered by the general argument of (63)-(64).

The slides ask what $\Pi(4)$ actually is. The supplementary answer is 14:

- On a convex quadrilateral, all-positive and all-negative give 2;
- exactly one positive or exactly one negative gives $4+4=8$;
- two adjacent points positive gives 4;
- only the two alternating labelings cannot be realized.

That is 14 in total. Why can no other four-point configuration exceed 14? Every configuration has at least one unrealizable labeling; on a finite sample for linear classifiers, the realizable labelings are closed under sign flip. The reason: first nudge the bias up slightly so that all originally positive points become strictly positive while the originally negative points stay strictly negative, then negate $\theta,b$ simultaneously to realize the complementary labeling. Hence unrealizable labelings also come in pairs, so there are at most 14. This is a supplementary proof for the slide's question, not an exact computation needed for the learning bounds that follow.

## 14. Proposition 7: why the one-parameter sine class has infinite VC dimension

### 14.1 "High frequency, hence complex" is not enough

Consider
\[
\mathcal F_{\sin}=\{x\mapsto\operatorname{sign}(\sin(\theta x)):
\theta\in\mathbb R\}.
\tag{66}
\]

That the number of oscillations can be large is only intuition. To prove infinite VC dimension, one must, for every $m$, first fix a set of $m$ inputs and then use the parameter to realize all $2^m$ labelings of them; one cannot switch to a new set of inputs for each labeling.

### 14.2 An explicit construction via binary digits

Fix $m\ge1$ and choose
\[
x_i=2^{i-1-m},\qquad i=1,\ldots,m.
\tag{67}
\]
These points are pairwise distinct and all lie in $(0,1/2]$. For any desired labels $s_i$, define the bits
$b_i=0$ when $s_i=+1$ and $b_i=1$ when $s_i=-1$. Let
\[
t=\sum_{j=1}^m b_j2^{-j}+2^{-(m+2)},
\qquad
\theta=2\pi\,2^m t.
\tag{68}
\]

Then
\[
\frac{\theta x_i}{2\pi}=2^{i-1}t.
\tag{69}
\]

Multiplying (68) by $2^{i-1}$, the first $i-1$ binary digits form the integer part, and the fractional part is
\[
u_i=\frac{b_i}{2}
+\sum_{j=i+1}^m b_j2^{i-1-j}
+2^{i-m-3}.
\tag{70}
\]

If $b_i=0$, the tail term is strictly positive, while
\[
\sum_{j=i+1}^m2^{i-1-j}+2^{i-m-3}
=\frac12-2^{i-m-1}+2^{i-m-3}<\frac12.
\]
Hence $0<u_i<1/2$. If $b_i=1$, then $1/2<u_i<1$. The extra
$2^{-(m+2)}$ tail term guarantees that no input lands exactly on a zero of the sine.

Since sine is positive in the first half of each period and negative in the second,
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

Every labeling is realizable, so for every $m$ there is a set of inputs that can be shattered:
\[
\boxed{\operatorname{VCdim}(\mathcal F_{\sin})=\infty.}
\tag{72}
\]

The construction uses only one real parameter $\theta$, but it exploits arbitrarily fine choices of its value and ever higher frequencies. The number of parameters can help guess the VC dimension of a simple class, but it is not a universal theorem.

### 14.3 A three-point example computable by hand

Take $m=3$, inputs $(1/8,1/4,1/2)$, desired labels $(+1,-1,+1)$, hence bits $(0,1,0)$. Then
$t=1/4+1/32=9/32,\ \theta=9\pi/2$.

The three phases are $9\pi/16,9\pi/8,9\pi/4$, whose sine signs are positive, negative, positive in turn. This example only shows how the general construction computes; the infinite-dimension conclusion comes from the proof above for all $m$.

## 15. Lemma 4: completing the inductive proof of Sauer's lemma

### 15.1 The statement and its boundary cases

If a nonempty binary class has VC dimension at most $d<\infty$, then
\[
\Pi_{\mathcal F}(n)
\le g(d,n):=\sum_{j=0}^{\min(d,n)}\binom nj.
\tag{73}
\]

When $n\ge d\ge1$, one further has
\[
g(d,n)\le(en/d)^d.
\tag{74}
\]

Writing the case $n\le d$ into $g$ is useful: then $g(d,n)=2^n$, the trivial bound. This keeps a legitimate boundary case when the recursion reaches $n-1=d$, so that one does not misuse an inductive hypothesis stated only for $n>d$.

### 15.2 What happens after deleting one coordinate

Fix $n$ distinct inputs. Let $F_1$ be the set of all length $n-1$ vectors that appear after deleting the first coordinate of the original projection. Let
\[
F_2=\{v\in F_1:(-1,v)\text{ and }(+1,v)
\text{ both appear in the original projection}\}.
\tag{75}
\]

Every vector in $F_1$ can be extended by at least one first label; if it belongs to $F_2$, it can be extended by the other one as well. The exact count is therefore
\[
|F_S|=|F_1|+|F_2|.
\tag{76}
\]

One does not count all of $F_1$ twice; only the part with a "double extension" contributes one extra time.

### 15.3 Why the second class has VC dimension one less

Regard $F_1,F_2$ as binary classes defined on the remaining finite set of inputs.

The VC dimension of $F_1$ is at most $d$: otherwise one could shatter $d+1$ points among the remaining points, and the original class certainly could as well, a contradiction.

The VC dimension of $F_2$ is at most $d-1$: if it could shatter $d$ points among the remaining ones, then every labeling pattern there would come from a vector that admits both first labels $+1,-1$. The original class would then shatter those $d$ points plus the deleted point, $d+1$ in total, a contradiction.

So by induction
\[
|F_1|\le g(d,n-1),\qquad
|F_2|\le g(d-1,n-1).
\tag{77}
\]

If $F_2$ is empty it contributes zero, and no special VC dimension needs to be assigned to an empty class. The base cases are: when $d=0$ there is only one labeling pattern, and when $n=0$ there is only the empty vector.

### 15.4 How Pascal's identity completes the induction

For $n>d>0$:
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

Out-of-range binomial coefficients are zero by convention. Since every input set satisfies this bound, taking the maximum over inputs gives (73).

### 15.5 From a binomial sum to $(en/d)^d$

Let $u=d/n\in(0,1]$. When $j\le d$, $u^d\le u^j$, so
\[
\begin{aligned}
u^d\sum_{j=0}^d\binom nj
&\le\sum_{j=0}^d\binom nju^j\\
&\le\sum_{j=0}^n\binom nju^j\\
&=(1+u)^n\le e^{nu}=e^d.
\end{aligned}
\tag{79}
\]

The last inequality comes from $1+u\le e^u$, provable via the tangent lower bound of the exponential function at zero. Dividing by $u^d$ gives (74). If $d=0$, use directly that the growth function is 1; do not force zero into a formula containing $1/d$.

### 15.6 The precise meaning of "from exponential to polynomial"

When $n\le d$, some point set can realize all $2^n$ labelings; once $n>d$, the growth function is controlled by a polynomial of fixed degree $d$. Sauer gives an upper bound and does not guarantee that every class actually grows exactly like $n^d$.

For the threshold class with $d=1$, the Sauer bound is $1+n$, identical to the exact growth function. For the interval class with $d=2$,
\[
1+n+\binom n2=1+\frac{n(n+1)}2,
\tag{80}
\]
again identical to the exact growth function. This shows the combinatorial upper bound is indeed attained, at least in these examples.

## 16. Why finite VC dimension is sufficient and infinite VC dimension is necessary

### 16.1 Sufficiency: plug in the growth-function bound

For binary classification with 0-1 loss and $n\ge d\ge1$, combining (52) and (74):
\[
\boxed{
\mathcal V^{\rm iid}(\mathcal F,n)
\le\sqrt{\frac{2\ln\Pi_{\mathcal F}(n)}n}
\le\sqrt{\frac{2d\ln(en/d)}n}.
}
\tag{81}
\]

For fixed finite $d$, $\ln n/n\to0$, so the class is learnable. If $n<d$, use the trivial risk bound 1; if $d=0$, a nonempty class has only one function and proper ERM has excess risk zero.

### 16.2 Necessity: restrict no free lunch to the shattered set

If the VC dimension is infinite, then for any sample size $n$ there exist $2n$ inputs $X'$ shattered by $\mathcal F$. Hence every binary labeling is realized by some function in the class.

Give $X'$ a uniform input distribution, and let the labels be determined by some fixed labeling function from the class. For each such candidate distribution, the best in-class risk is zero.

Fix any algorithm and training inputs; at least half of the support points do not appear. For any unseen point, pair up all labelings by "flip only this point": the two members of each pair produce exactly the same training set, but the true labels at that test point are opposite. A randomized algorithm can be paired up using the same random seed as well, giving average error rate $1/2$.

Therefore the average candidate-distribution risk is at least
$(1/2)\cdot(1/2)=1/4$, and at least one candidate distribution makes the algorithm's risk no less than $1/4$. Since the algorithm is arbitrary,
\[
\boxed{\operatorname{VCdim}(\mathcal F)=\infty
\ \Longrightarrow\
\mathcal V^{\rm iid}(\mathcal F,n)\ge1/4
\quad\text{for every }n.}
\tag{82}
\]

The comparator only needs to realize all labels on $X'$; how the class behaves on the remaining inputs does not matter, because the distribution puts no probability there. This is why the Lecture 1 lower bound can be reused without requiring the reference class to be all functions.

### 16.3 What exactly the "closed loop" closes

Under binary classification, 0-1 loss, iid sampling, distribution-uniform statements, and the usual measurability conditions of this lecture:
\[
\boxed{
\text{finite VC dimension}
\iff \text{statistically learnable}
\iff \text{learnable via ERM}.
}
\tag{83}
\]

Finite VC dimension also implies, through the same chain of upper bounds, the uniform convergence adopted in the slides. In the other direction, uniform convergence implies learnability, and hence finite VC dimension.

These equivalences characterize the condition for this particular setting; they should not be generalized into "whenever a statistical learning problem is learnable, it is necessarily learned well by any ERM." The original slides state explicitly at the end that general statistical learning does not always satisfy such a conclusion.

"The chain of upper bounds is tight enough" here means tight enough to distinguish learnability from non-learnability; it does not mean that every logarithmic factor in
$\sqrt{d\ln(en/d)/n}$ is already an unimprovable lower bound.

## 17. How to use the results: sample size, confidence, and scope

### 17.1 Sample size in expectation

By (81), to require the upper bound to be at most $\varepsilon$, one can use the sufficient condition
\[
\frac{n}{\ln(en/d)}\ge\frac{2d}{\varepsilon^2},
\qquad n\ge d\ge1.
\tag{84}
\]

Ignoring logarithmic factors, this reflects a sample dependence of $d/\varepsilon^2$. But the display above is still a sufficient condition derived in this lecture, not an exact expression of a necessary one.

The threshold class has a parameter $\theta$ ranging over all real numbers and uncountably many functions, yet VC dimension 1; it does not pay a sample cost proportional to the number of possible parameter values. The sine class, in contrast, has only one real parameter but infinite VC dimension. Together, these two examples explain why "the number of parameters" cannot replace a complexity analysis of the class.

### 17.2 Supplement: deriving a high-probability version for finite classes

The main line of this lecture uses expectations. If the loss lies in a bounded interval of length $B$, then for a fixed function, the exponential moments and tail bounds of Section 7 give
\[
\Pr(|L_P(f)-\widehat L_S(f)|>t)
\le2e^{-2nt^2/B^2}.
\tag{85}
\]

Apply a union bound over the $M=|\mathcal F|$ functions:
\[
\Pr\left(\sup_f|L_P(f)-\widehat L_S(f)|>t\right)
\le2M e^{-2nt^2/B^2}.
\tag{86}
\]

Set the right-hand side equal to $\delta$ and take
$t=B\sqrt{\ln(2M/\delta)/(2n)}$. On an event of probability at least $1-\delta$, inserting two empirical-risk terms gives
\[
L_P(\widehat f_{\rm ERM})-\inf_fL_P(f)
\le2t
=B\sqrt{\frac{2\ln(2M/\delta)}n}.
\tag{87}
\]

Here the extra conditions of the high-probability theorem, the confidence term, and the factor 2 from two-sided deviation are all derived explicitly; the expected upper bound was not simply relabeled with a different symbol as a high-probability conclusion.

### 17.3 Supplement: why realizable classification may enjoy a faster guarantee

If a finite binary class has size $M$ and there exists a zero-risk target function, then ERM has zero training error. Take any fixed bad function with true risk greater than $\varepsilon$; the probability that it makes no mistake on all $n$ independent training samples is
\[
(1-L_P(f))^n\le(1-\varepsilon)^n\le e^{-n\varepsilon}.
\tag{88}
\]

Union-bounding over the bad functions, the probability that a bad yet zero-training-error function exists is at most $Me^{-n\varepsilon}$. Therefore
\[
n\ge\frac{\ln M+\ln(1/\delta)}{\varepsilon}
\tag{89}
\]
suffices for ERM to achieve risk at most $\varepsilon$ with probability at least $1-\delta$.

This differs from the $\varepsilon^{-2}$-type upper bound of general agnostic learning because the realizability assumption is stronger. This supplement helps explain why the $n^{-1/2}$ upper bound of this lecture cannot be called a uniform "exact rate" for all cases.

### 17.4 The connection to Lecture 3

Binary-classification projections in this lecture lie in $\{-1,+1\}^n$ and are therefore automatically finite. Regression projections lie in $[-1,1]^n$ and can contain infinitely many vectors even for finite $n$.

Lecture 3 will replace "counting distinct labels exactly" by "counting finite representatives up to error $\alpha$," namely covering numbers, and then sharpen the estimate through multi-scale chaining. So the Massart lemma, symmetrization, and the projection viewpoint of this lecture all become tools for the next lecture, unchanged.

## 18. A rigor checklist and an index to the original slide proofs

### 18.1 Shorthands and boundary cases to watch

| Easily misread point | How this report handles it |
|---|---|
| The argmin necessarily exists | Handled with approximate ERM and a fixed approximately optimal population function |
| Regularization is always equivalent to ERM on a fixed smaller class | Proves the one-way relation, and notes that the constraint radius may depend on the data and the converse needs conditions |
| Every function has zero-mean deviation ⇒ the maximal deviation is small | Gives an example where pointwise convergence does not imply uniform convergence |
| The symmetrization random-sign equality | Explains that it holds only in distribution and expectation over random samples |
| The contraction proof merges terms with a duplicated $\epsilon_t$ | Uses the correct $A_f+A_g$ form |
| Square loss uniformly takes $G=2$ | Distinguishes half-square, full square, and unbounded ranges |
| The maximal lemma requires all variables to be independent | It does not; Massart only needs the signs at different locations to be independent |
| Every finite class is learnable | This lecture's derivation also relies on conditions on function values and the loss; heavy-tailed or unbounded risk issues cannot be ignored |
| VC dimension zero iff a single function | Keeps the nonempty-class assumption; functions are counted as mappings, not as parameters |
| Proving the VC lower bound suffices | One must additionally exhibit an unrealizable labeling for every larger point set |
| Linear classifiers have dimension equal to the input dimension | This lecture includes a bias, so it is the input dimension plus one |
| High sine frequency alone proves infinite VC | Gives fixed input points and an explicit parameter construction for each labeling |
| Sauer's induction handles only $n>d$ | Adds the boundary cases $n\le d$ and $d=0$ |
| The closed loop means the exact optimal rate | The loop is a learnability condition; it does not claim that every factor is unimprovable |

### 18.2 Locating items by the original slide numbering

| Slide content | Complete derivation in this report |
|---|---|
| ERM and the original display (1) | Section 1, (1)-(6) |
| Original display (2), empirical process, uniform convergence | Section 2, (7)-(11) |
| Definition of Rademacher complexity | Section 3, (12)-(13) |
| Theorem 1: symmetrization | Section 4, (14)-(18) |
| Lemma 1: classification loss | Section 5, (19)-(21) |
| Lemma 2: contraction | Section 6, (22)-(30) |
| Sub-Gaussian definition, Hoeffding's lemma | Section 7, (31)-(37) |
| Lemma 3: maximal inequality | Section 8, (38)-(40) |
| Theorem 2: Massart | Section 9, (41)-(47) |
| Sample projections and the growth function | Section 10, (48)-(52) |
| Proposition 1: threshold growth function | Section 11.1, (53)-(54) |
| Proposition 2: interval growth function | Section 11.2, (55)-(57) |
| Propositions 3, 4, 5: basic VC dimensions | Section 12, (58)-(59) and the individual proofs |
| Proposition 6: VC dimension of linear classifiers | Section 13, (60)-(65) |
| Proposition 7: infinite VC dimension of the sine class | Section 14, (66)-(72) |
| Lemma 4: Sauer's lemma | Section 15, (73)-(80) |
| Summary and the necessity closed loop | Section 16, (81)-(83) |

### 18.3 Questions you should be able to answer independently afterwards

1. Why can't the function selected by ERM directly inherit the "fixed function" law of large numbers?
2. In symmetrization, what property does each swap and each inequality use?
3. Why may the contraction proof swap the two candidate functions without requiring the class to be closed under negation?
4. Why can an infinite binary class still use Massart's lemma for finite sets?
5. How do "there exists a set" and "every set" prove the lower and upper bounds on VC dimension respectively?
6. In Sauer's proof, why does the projection class that extends in both directions have VC dimension one less?
7. How does infinite VC dimension guarantee that a constant-difficulty distribution exists at every sample size?
8. Why does the learnability equivalence for finite VC dimension not mean that the current rate is already optimal?
