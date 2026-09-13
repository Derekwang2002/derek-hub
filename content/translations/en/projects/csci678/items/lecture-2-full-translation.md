---
title: "Lecture 2 Full Translation"
summary: "Complete text of the Lecture 2 slides: uniform convergence and Rademacher complexity, finite classes, infinite classes for classification and the VC dimension, Sauer's lemma. Mathematical notation, numbering, and proof structure are preserved as in the original."
---

**Fall 2026, Instructor: Haipeng Luo**

> This document presents the original English text of the Lecture 2 slides, restored against the source PDF. Mathematical notation, theorem/lemma/proposition/equation numbering, and proof structure are preserved as in the original.

## 1 Uniform Convergence and Rademacher Complexity

In this lecture, we focus on studying the value $\mathcal V^{\mathrm{iid}}(\mathcal F,n)$, which, as discussed last time, completely characterizes the learnability of a class $\mathcal F$ in the batch/statistical learning setting. We will perform a sequence of upper-bounding steps on this value to reach a much more manageable form, and in the end argue that these upper bounds are very tight.

Recall that the value is defined as

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
=
\inf_\pi\sup_P
\left(
\mathbb E[L(\widehat y)]
-
\inf_{f\in\mathcal F}L(f)
\right),
\]

where $\pi$ ranges over all (distributions of) mappings from $n$ training samples to a final predictor $\widehat y\in\mathcal D$, and $P$ ranges over all data-generating distributions on $\mathcal Z$.

As the first step of relaxing this value, we consider a very simple algorithm: output the **Empirical Risk Minimizer (ERM)**:

\[
\widehat y_{\mathrm{ERM}}
\in
\operatorname*{argmin}_{f\in\mathcal F}
\frac1n\sum_{t=1}^n\ell(f,z_t).
\]

Here, the empirical risk simply refers to the average loss over the training set. For simplicity, we assume that at least one such minimizer exists, which is basically without loss of generality. Clearly, we now have

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le
\sup_P
\left(
\mathbb E[L(\widehat y_{\mathrm{ERM}})]
-
\inf_{f\in\mathcal F}L(f)
\right).
\tag{1}
\]

Before further discussion, we make the following two remarks on ERM.

First, finding an ERM is a well-defined optimization problem, and there are many well-studied optimization algorithms for it. As discussed last time, this optimization aspect is out of the scope of this course. In general, finding an ERM could even be an NP-hard problem; here we only focus on whether the problem is statistically, as opposed to computationally, learnable.

Second, one might wonder why we should study this somewhat "naive" algorithm without "regularization", given that minimizing training loss alone might lead to overfitting in practice. The answer is that for many problems, a regularized ERM

\[
\operatorname*{argmin}_{f\in\mathcal F}
\left(
\frac1n\sum_{t=1}^n\ell(f,z_t)
+\lambda\Psi(f)
\right)
\]

is equivalent to the ERM over a smaller class:

\[
\operatorname*{argmin}_{f\in\mathcal F,\,\Psi(f)\le c}
\frac1n\sum_{t=1}^n\ell(f,z_t),
\]

where $c$ is some other constant. So regularization is really just a way to implicitly learn over a restricted class that hopefully is statistically easier to learn.

### 1.1 Empirical Process and Uniform Convergence

Next, we further simplify Equation (1). Let

\[
f^\star\in
\operatorname*{argmin}_{f\in\mathcal F}L(f).
\]

We have[^1]

\[
\begin{aligned}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
&\le
\sup_P
\left(
\mathbb E[L(\widehat y_{\mathrm{ERM}})]
-L(f^\star)
\right)\\
&=
\sup_P
\mathbb E
\left[
L(\widehat y_{\mathrm{ERM}})
-
\frac1n\sum_{t=1}^n\ell(f^\star,z_t)
\right]
&&\text{(by definition of }L\text{)}\\
&\le
\sup_P
\mathbb E
\left[
L(\widehat y_{\mathrm{ERM}})
-
\frac1n\sum_{t=1}^n
\ell(\widehat y_{\mathrm{ERM}},z_t)
\right]
&&\text{(by definition of }\widehat y_{\mathrm{ERM}}\text{)}\\
&\le
\sup_P
\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right].
\tag{2}
\end{aligned}
\]

Here, the collection of random variables indexed by $f\in\mathcal F$

\[
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\]

is called an **empirical process**. Each of these random variables is nothing but the difference between the expected value of the function on a random input drawn from $P$ and its empirical average value on a set of i.i.d. inputs drawn from the same distribution.

Clearly, these random variables are all zero-mean, and by the law of large numbers, each of them should be small when $n$ is large. However, in order to claim that Equation (2) is small, we in some sense have to argue that these random variables are all small **simultaneously**, and whether this is true depends on the class $\mathcal F$.

If

\[
\limsup_{n\to\infty}
\sup_P
\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
=0,
\]

we say that $\mathcal F$ satisfies **uniform convergence**. That is, for any data-generating distribution, the expected supremum of the empirical process is arbitrarily small as long as $n$ is large enough. From Equation (2), it is clear that if $\mathcal F$ satisfies uniform convergence, then $\mathcal F$ is learnable.

### 1.2 Symmetrization and Rademacher Complexity

For a given class $\mathcal F$, how do we know whether the expected supremum of the empirical process is small or not? To answer this question, we will further relax this quantity via an important technique called **symmetrization**, and arrive at something called Rademacher complexity.

To this end, we first define a Rademacher random variable $\epsilon$ as a random variable that takes on values $-1$ and $+1$ with equal probability. For a class of functions $\mathcal H\subseteq\mathbb R^{\mathcal Z}$ and a sequence of arbitrary inputs $z_1,\ldots,z_n$, define the **conditional Rademacher complexity** of $\mathcal H$ on these inputs as

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal H;z_{1:n})
=
\frac1n
\mathbb E_{\epsilon_{1:n}}
\left[
\sup_{h\in\mathcal H}
\sum_{t=1}^n\epsilon_t h(z_t)
\right],
\]

where $\epsilon_{1:n}$ are $n$ i.i.d. Rademacher random variables.

The (unconditional) Rademacher complexity of $\mathcal H$ with respect to a distribution $P$ supported on $\mathcal Z$ is defined as

\[
\begin{aligned}
\mathcal R^{\mathrm{iid}}(\mathcal H)
&=
\mathbb E_{z_{1:n}}
\left[
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal H;z_{1:n})
\right]\\
&=
\frac1n
\mathbb E_{z_{1:n},\epsilon_{1:n}}
\left[
\sup_{h\in\mathcal H}
\sum_{t=1}^n\epsilon_t h(z_t)
\right],
\end{aligned}
\]

where $z_{1:n}$ are $n$ i.i.d. samples from $P$.

At a high level, the Rademacher complexity of a class measures how well it can fit random signs, because the correlation $\epsilon_t h(z_t)$ is large when $h(z_t)$ is of the same sign as $\epsilon_t$. Therefore, the larger the Rademacher complexity, the more expressive the class is.

The connection between the Rademacher complexity and the expected supremum of an empirical process is summarized in the following theorem.

**Theorem 1.** For any data-generating distribution $P$ and any class $\mathcal F$, we have

\[
\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
\le
2\mathcal R^{\mathrm{iid}}(\ell(\mathcal F)),
\]

where

\[
\ell(\mathcal F)
=
\left\{
h_f\in\mathbb R^{\mathcal Z}:
f\in\mathcal F,
\ h_f(z)=\ell(f,z),\ \forall z
\right\}.
\]

**Proof.** By definition, we write $L(f)$ as

\[
L(f)
=
\mathbb E_{z'_1,\ldots,z'_n\sim P}
\left[
\frac1n\sum_{t=1}^n\ell(f,z'_t)
\right],
\]

and arrive at

\[
\begin{aligned}
&\mathbb E_{z_{1:n}}
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]\\
&=
\frac1n
\mathbb E_{z_{1:n}}
\left[
\sup_{f\in\mathcal F}
\mathbb E_{z'_{1:n}}
\left[
\sum_{t=1}^n
(\ell(f,z'_t)-\ell(f,z_t))
\right]
\right].
\end{aligned}
\]

Pulling the expectation $\mathbb E_{z'_{1:n}}$ out of the supremum leads to the following upper bound, which is symmetric:

\[
\begin{aligned}
&\frac1n
\mathbb E_{z_{1:n}}
\left[
\sup_{f\in\mathcal F}
\mathbb E_{z'_{1:n}}
\left[
\sum_{t=1}^n
(\ell(f,z'_t)-\ell(f,z_t))
\right]
\right]\\
&\le
\frac1n
\mathbb E_{z_{1:n},z'_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
(\ell(f,z'_t)-\ell(f,z_t))
\right].
\end{aligned}
\]

Next, we claim the following equality:

\[
\begin{aligned}
&\mathbb E_{z_{1:n},z'_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
(\ell(f,z'_t)-\ell(f,z_t))
\right]\\
&=
\mathbb E_{z_{1:n},z'_{1:n},\epsilon_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t(\ell(f,z'_t)-\ell(f,z_t))
\right].
\end{aligned}
\]

This is true because for each possible value of the sequence $\epsilon_{1:n}\in\{-1,+1\}^n$,

\[
\sum_{t=1}^n(\ell(f,z'_t)-\ell(f,z_t))
\]

and

\[
\sum_{t=1}^n
\epsilon_t(\ell(f,z'_t)-\ell(f,z_t))
\]

differ only in that we switch the two examples $z_t$ and $z'_t$ whenever $\epsilon_t=-1$. Since $z_t$ and $z'_t$ follow the same distribution, this switch makes no difference in expectation.

Splitting the supremum into two parts then leads to the further upper bound

\[
\begin{aligned}
&\mathbb E_{z_{1:n},z'_{1:n},\epsilon_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t(\ell(f,z'_t)-\ell(f,z_t))
\right]\\
&\le
\mathbb E_{z_{1:n},z'_{1:n},\epsilon_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n\epsilon_t\ell(f,z'_t)
+
\sup_{f\in\mathcal F}
\sum_{t=1}^n(-\epsilon_t)\ell(f,z_t)
\right]\\
&=
\mathbb E_{z'_{1:n},\epsilon_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n\epsilon_t\ell(f,z'_t)
\right]
+
\mathbb E_{z_{1:n},\epsilon_{1:n}}
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n(-\epsilon_t)\ell(f,z_t)
\right].
\end{aligned}
\]

Finally, note that $\epsilon_t$ and $-\epsilon_t$ have the same distribution, so the two terms above are both exactly

\[
n\mathcal R^{\mathrm{iid}}(\ell(\mathcal F)).
\]

Dividing by $n$ then gives the conclusion. $\square$

### 1.3 Erasing the Loss for Supervised Learning

For many problems, especially supervised learning problems, when analyzing the Rademacher complexity of $\ell(\mathcal F)$, the part involving the loss function is in fact not that important and can usually be removed.

Specifically, consider a supervised learning problem with $\mathcal Z=\mathcal X\times\mathcal Y$ and $\mathcal F\subseteq\mathcal Y^{\mathcal X}$. In the following two cases, we can easily relate $\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))$ and $\mathcal R^{\mathrm{iid}}(\mathcal F)$.

**Lemma 1.** For a binary classification problem with $\mathcal Y=\{-1,+1\}$ and the 0-1 loss, one has, for any sequence $z_{1:n}$,

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})
=
\frac12
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n}),
\]

and thus

\[
\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))
=
\frac12\mathcal R^{\mathrm{iid}}(\mathcal F).
\]

**Proof.** By definition,

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})
&=
\frac1n
\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t\mathbb I\{f(x_t)\ne y_t\}
\right]\\
&=
\frac1n
\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t\frac{1-y_tf(x_t)}2
\right]\\
&=
\frac1{2n}\mathbb E
\left[\sum_{t=1}^n\epsilon_t\right]
+
\frac1{2n}\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n(-\epsilon_ty_t)f(x_t)
\right]\\
&=
\frac12
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n}).
\end{aligned}
\]

The last step uses the fact that Rademacher variables are zero-mean, and the fact that for any labels $y_1,\ldots,y_n$, the random variables

\[
-\epsilon_1y_1,\ldots,-\epsilon_ny_n
\]

are again i.i.d. Rademacher random variables. $\square$

**Lemma 2 (Contraction Lemma).** Consider a regression problem with $\mathcal Y\subseteq\mathbb R$, where the loss has the form

\[
\ell(f,(x,y))
=
\widetilde\ell(f(x),y),
\]

where $\widetilde\ell(y',y)$ is $G$-Lipschitz in the first parameter, that is, for any $y_1,y_2,y$,

\[
|\widetilde\ell(y_1,y)-\widetilde\ell(y_2,y)|
\le
G|y_1-y_2|.
\]

Then for any sequence $z_{1:n}$, one has

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})
\le
G\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n}),
\]

and thus

\[
\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))
\le
G\mathcal R^{\mathrm{iid}}(\mathcal F).
\]

**Proof.** By definition,

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})
=
\frac1n
\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t\widetilde\ell(f(x_t),y_t)
\right].
\]

First averaging over the two possible values of the last Rademacher variable $\epsilon_n$, we obtain

\[
\begin{aligned}
&\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})\\
&=
\frac1{2n}\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\widetilde\ell(f(x_t),y_t)
+\widetilde\ell(f(x_n),y_n)
\right)
\right]\\
&\quad+
\frac1{2n}\mathbb E
\left[
\sup_{g\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\widetilde\ell(g(x_t),y_t)
-\widetilde\ell(g(x_n),y_n)
\right)
\right]\\
&=
\frac1{2n}\mathbb E
\left[
\sup_{f,g\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\bigl(
\widetilde\ell(f(x_t),y_t)
+\widetilde\ell(g(x_t),y_t)
\bigr)
\right.
\right.\\
&\hspace{5.2cm}\left.
\left.
+\widetilde\ell(f(x_n),y_n)
-\widetilde\ell(g(x_n),y_n)
\right)
\right]\\
&\le
\frac1{2n}\mathbb E
\left[
\sup_{f,g\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\bigl(
\widetilde\ell(f(x_t),y_t)
+\widetilde\ell(g(x_t),y_t)
\bigr)
\right.
\right.\\
&\hspace{5.2cm}\left.
\left.
+G|f(x_n)-g(x_n)|
\right)
\right],
\end{aligned}
\]

where the last step uses the $G$-Lipschitzness of $\widetilde\ell$. By symmetry, removing the absolute value in the last expression makes no difference under the $\sup_{f,g\in\mathcal F}$. Splitting this supremum once again, we obtain

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}
(\ell(\mathcal F);z_{1:n})
&\le
\frac1{2n}\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\widetilde\ell(f(x_t),y_t)
+Gf(x_n)
\right)
\right]\\
&\quad+
\frac1{2n}\mathbb E
\left[
\sup_{g\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\widetilde\ell(g(x_t),y_t)
-Gg(x_n)
\right)
\right]\\
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
\sum_{t=1}^{n-1}\epsilon_t
\widetilde\ell(f(x_t),y_t)
+\epsilon_nGf(x_n)
\right)
\right].
\end{aligned}
\]

Repeating this process for $t=n-1,\ldots,1$ in turn gives the conclusion. $\square$

Note that Lipschitzness is usually satisfied for common problems. Take the squared loss

\[
\widetilde\ell(y',y)
=
\frac12(y'-y)^2
\]

as an example. If $\mathcal Y=[-1,+1]$, it is clear that this loss is $2$-Lipschitz.

## 2 Finite Class

Let us make a quick summary at this point. Through a sequence of upper-bounding steps, we have relaxed the value of a statistical learning problem to the Rademacher complexity of the class:

\[
\begin{aligned}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
&\le
\sup_P\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]\\
&\le
2\sup_P\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))\\
&\le
2G\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F),
\end{aligned}
\]

where, for a binary classification problem, $G=1/2$; for a regression problem, $G$ is the Lipschitz constant of the loss.

It is now clear that understanding the Rademacher complexity $\mathcal R^{\mathrm{iid}}(\mathcal F)$ of a class is critical to understanding the learnability of a problem. So how should we compute it?

We start with a simple yet fundamental case: $\mathcal F$ is a finite class. All subsequent discussions on infinite classes will eventually make use of the results for finite classes. The key lemma we need is the maximal inequality for sub-Gaussian random variables.

Recall: if a zero-mean random variable $U$ satisfies, for all $\lambda\in\mathbb R$,

\[
\mathbb E[\exp(\lambda U)]
\le
\exp\left(\frac{\sigma^2\lambda^2}2\right),
\]

that is, its moment generating function is bounded by that of a zero-mean Gaussian with variance $\sigma^2$, then $U$ is said to be $\sigma$-sub-Gaussian. For example, any zero-mean random variable with range $[a,b]$ is $(b-a)/2$-sub-Gaussian. This is Hoeffding's lemma.

**Lemma 3 (Maximal Inequality).** Let $\{U_f\}_{f\in\mathcal F}$ be a finite collection of $\sigma$-sub-Gaussian random variables. Then

\[
\mathbb E
\left[
\max_{f\in\mathcal F}U_f
\right]
\le
\sigma\sqrt{2\ln|\mathcal F|}.
\]

**Proof.** For any $\lambda>0$, we have

\[
\begin{aligned}
\exp\left(
\lambda\mathbb E
\left[
\max_{f\in\mathcal F}U_f
\right]
\right)
&\le
\mathbb E
\left[
\exp\left(
\lambda\max_{f\in\mathcal F}U_f
\right)
\right]
&&\text{(Jensen's inequality)}\\
&\le
\mathbb E
\left[
\sum_{f\in\mathcal F}\exp(\lambda U_f)
\right]\\
&\le
\sum_{f\in\mathcal F}
\exp\left(\frac{\sigma^2\lambda^2}2\right)
&&\text{(}U_f\text{ is }\sigma\text{-sub-Gaussian)}\\
&=
|\mathcal F|
\exp\left(\frac{\sigma^2\lambda^2}2\right).
\end{aligned}
\]

Rearranging gives

\[
\mathbb E
\left[
\max_{f\in\mathcal F}U_f
\right]
\le
\frac{\ln|\mathcal F|}{\lambda}
+\frac{\sigma^2\lambda}{2}.
\]

Setting

\[
\lambda
=
\frac{\sqrt{2\ln|\mathcal F|}}{\sigma},
\]

a choice that minimizes the upper bound, we obtain

\[
\mathbb E
\left[
\max_{f\in\mathcal F}U_f
\right]
\le
\sigma\sqrt{2\ln|\mathcal F|}.
\]

This completes the proof. $\square$

Next, we apply this maximal inequality to bound the Rademacher complexity of a finite class.

**Theorem 2 (Massart's Lemma).** Let $\mathcal F\subseteq\mathcal Y^{\mathcal X}$ be a finite class and $x_1,\ldots,x_n\in\mathcal X$ be an arbitrary set of inputs. Then

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n})
\le
\frac1n
\sqrt{
2
\max_{f\in\mathcal F}
\sum_{t=1}^n f^2(x_t)
\ln|\mathcal F|
}.
\]

Consequently, if $\mathcal Y\subseteq[-C,C]$ for some $C>0$, then

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
C\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\]

**Proof.** Note that

\[
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n})
=
\frac1n\mathbb E
\left[
\max_{f\in\mathcal F}U_f
\right],
\]

where

\[
U_f
=
\sum_{t=1}^n\epsilon_t f(x_t).
\]

The following calculation shows that $U_f$ is $\sigma$-sub-Gaussian with

\[
\sigma
=
\sqrt{
\max_{f\in\mathcal F}
\sum_{t=1}^n f^2(x_t)
}.
\]

Indeed, for any $\lambda\in\mathbb R$,

\[
\begin{aligned}
\mathbb E[\exp(\lambda U_f)]
&=
\prod_{t=1}^n
\mathbb E
[\exp(\lambda\epsilon_tf(x_t))]\\
&\le
\prod_{t=1}^n
\exp\left(
\frac{f^2(x_t)\lambda^2}{2}
\right)\\
&=
\exp\left(
\frac{\lambda^2}{2}
\sum_{t=1}^n f^2(x_t)
\right)\\
&\le
\exp\left(
\frac{\sigma^2\lambda^2}{2}
\right).
\end{aligned}
\]

The first step uses the fact that $\epsilon_1,\ldots,\epsilon_n$ are independent; the second step uses the fact that $\epsilon_tf(x_t)$ is $|f(x_t)|$-sub-Gaussian. Applying Lemma 3 then gives the conclusion. $\square$

The theorem above implies that finite classes with function values bounded in $[-C,C]$ are all learnable, since

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le
2G\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
2GC\sqrt{\frac{2\ln|\mathcal F|}{n}}
\longrightarrow0
\]

as $n$ goes to infinity. In fact, it also gives the exact $1/\sqrt n$ convergence rate when learning via an ERM.

The reader may notice that one can also apply the maximal inequality directly to the empirical process

\[
\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
\]

to reach the same conclusion. However, we will soon see why it is important to do this on the Rademacher complexity instead.

## 3 Infinite Class: Classification

We next move on to study the Rademacher complexity of infinite classes. As the first step, we consider binary classification problems with $\mathcal Y=\{-1,+1\}$. While Lemma 3 seems not applicable to infinite classes, it in fact still plays a key role.

The main observation is the following: the conditional Rademacher complexity can be equivalently written as

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}
(\mathcal F;x_{1:n})
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n\epsilon_tf(x_t)
\right]\\
&=
\frac1n\mathbb E
\left[
\max_{v\in\mathcal F|_{x_{1:n}}}
\sum_{t=1}^n\epsilon_tv_t
\right],
\end{aligned}
\]

where

\[
\mathcal F|_{x_{1:n}}
=
\{(f(x_1),\ldots,f(x_n)):f\in\mathcal F\}
\subseteq
\{-1,+1\}^n
\]

is the projection of $\mathcal F$ onto the input set $x_{1:n}$.

While $\mathcal F$ is infinite, $\mathcal F|_{x_{1:n}}$ is always finite, and its size is at most $2^n$. Based on this intuition, we define the **growth function** of $\mathcal F$ on $n$ inputs as

\[
\Pi_{\mathcal F}(n)
=
\max_{x_{1:n}}
\left|
\mathcal F|_{x_{1:n}}
\right|.
\]

It is the maximum number of distinct labelings one can possibly obtain on $n$ samples using functions from $\mathcal F$. From the previous observation and Lemma 3, we immediately have

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\sqrt{
\frac{2\ln\Pi_{\mathcal F}(n)}{n}
}.
\]

A trivial upper bound on the growth function is $\Pi_{\mathcal F}(n)\le2^n$. Plugging it into the bound above only gives a constant-order Rademacher complexity. Therefore, for the Rademacher complexity to vanish, the class needs a much milder growth function. Below we discuss two examples.

**Proposition 1.** Let $\mathcal X=\mathbb R$ and consider the class of threshold functions

\[
\mathcal F
=
\left\{
f_\theta(x)
=
\begin{cases}
+1,&x\le\theta,\\
-1,&\text{otherwise},
\end{cases}
:\theta\in\mathbb R
\right\}.
\]

Then

\[
\Pi_{\mathcal F}(n)=n+1,
\]

and thus

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le
\sqrt{\frac{2\ln(n+1)}n}.
\]

**Proof.** For any $\theta$, $f_\theta(x)$ labels all points to the left of $\theta$ as $+1$ and all points to the right as $-1$. Clearly, for any $n$ distinct points on the real line, all the $n+1$ possible labelings, from left to right, are

\[
\{-1,-1,\ldots,-1\},
\quad
\{+1,-1,\ldots,-1\},
\quad
\{+1,+1,\ldots,-1\},
\quad\ldots\quad,
\{+1,+1,\ldots,+1\}.
\]

This completes the proof. $\square$

**Proposition 2.** Let $\mathcal X=\mathbb R$ and consider the class of interval functions

\[
\mathcal F
=
\left\{
f_{\theta_1,\theta_2}(x)
=
\begin{cases}
+1,&\theta_1\le x\le\theta_2,\\
-1,&\text{otherwise},
\end{cases}
:\theta_1\le\theta_2
\right\}.
\]

Then

\[
\Pi_{\mathcal F}(n)
=
\binom{n+1}{2}+1
=O(n^2),
\]

and thus

\[
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
\le
O\left(\sqrt{\frac{\ln n}{n}}\right).
\]

**Proof.** Any $n$ distinct points divide the real line into $n+1$ regions. Placing the interval endpoints $\theta_1$ and $\theta_2$ into any two distinct regions gives $\binom{n+1}{2}$ labelings. Placing the two endpoints into the same region, whichever one is chosen, produces exactly one extra labeling in which all labels are $-1$. $\square$

It is worth noting that while replacing $\sup_{f\in\mathcal F}$ with $\max_{v\in\mathcal F|_{x_{1:n}}}$ in the definition of Rademacher complexity is very intuitive and direct, one cannot do the same thing directly for $\mathcal V^{\mathrm{iid}}(\mathcal F,n)$ or its upper bound

\[
\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
\]

because the dependence of $L(f)$ on $f$ is not only through the values $f(x_1),\ldots,f(x_n)$.

This highlights the importance of relaxing these quantities to the Rademacher complexity via symmetrization, and also explains why, in the finite-class case, we did not apply the maximal inequality directly to the empirical process.

### 3.1 VC Dimension and Sauer's Lemma

While the growth function is a nice way to characterize the complexity of a class, it is not always easy to compute. To see this, consider $\mathcal X=\mathbb R^d$ and the class of linear classifiers

\[
\mathcal F
=
\left\{
f_{\theta,b}(x)
=
\operatorname{sign}(\langle x,\theta\rangle+b)
:
\theta\in\mathbb R^d,
\ b\in\mathbb R
\right\},
\tag{3}
\]

where $\operatorname{sign}(y)=+1$ when $y\ge0$ and $-1$ otherwise. What is $\Pi_{\mathcal F}(n)$ for this class?

For simplicity, let's start with $d=2$. It is pretty clear that for any $n\le3$, one can find $n$ points such that $\mathcal F$ realizes all $2^n$ labelings, and therefore

\[
\Pi_{\mathcal F}(n)=2^n,
\qquad n\le3.
\]

What about $n=4$? Well, first we know $\Pi_{\mathcal F}(4)<2^4=16$, because for any four points in a 2D plane, it is impossible for linear classifiers to realize all $16$ possible labelings (try to convince yourself of this).

But what exactly is the value of $\Pi_{\mathcal F}(4)$? After spending some time you can probably figure this out as well. But what about $\Pi_{\mathcal F}(5)$, $\Pi_{\mathcal F}(6)$, and more generally $\Pi_{\mathcal F}(n)$ for an arbitrary $n$? Do we need to figure out all these values one by one, a tedious process?

Somewhat surprisingly, it turns out that the two facts mentioned above,

\[
\Pi_{\mathcal F}(3)=2^3,
\qquad
\Pi_{\mathcal F}(4)<2^4
\]

are already enough to derive a pretty tight upper bound on $\Pi_{\mathcal F}(n)$ for an arbitrary $n$. To show this result, we first make a few definitions.

If

\[
\mathcal F|_{x_{1:n}}
=
\{-1,+1\}^n,
\]

that is, $\mathcal F$ realizes all $2^n$ possible labelings of this input set, we say that $\mathcal F$ **shatters** the input set $x_{1:n}$.

The Vapnik–Chervonenkis (VC) dimension of $\mathcal F$ is defined as the size of the largest input set that can be shattered by $\mathcal F$, that is,

\[
\operatorname{VCdim}(\mathcal F)
=
\max\{n:\Pi_{\mathcal F}(n)=2^n\}.
\]

If this set is empty, we define $\operatorname{VCdim}(\mathcal F)=0$; if this set is not finite, that is, $\Pi_{\mathcal F}(n)=2^n$ for all $n$, we define $\operatorname{VCdim}(\mathcal F)=\infty$.

As an example, the VC dimension of the 2D linear classifiers discussed above is $3$. The following seminal result connects the growth function of a class with its VC dimension (the proof is deferred to the next subsection).

**Lemma 4 (Sauer's Lemma).** For a class $\mathcal F$ with finite VC dimension $d$, one has, for any $n>d$,

\[
\Pi_{\mathcal F}(n)
\le
\sum_{i=0}^d\binom ni
\le
\left(\frac{en}{d}\right)^d.
\]

By the definition of VC dimension, we clearly have $\Pi_{\mathcal F}(n)=2^n$ for any $n\le d$. What Sauer's lemma shows is that once $n$ becomes larger than $d$, there is a phase transition: the exponential growth $2^n$ of the growth function suddenly becomes a polynomial growth, roughly $n^d$.

Combining this with the previous discussion, we have

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\sqrt{\frac{2\ln\Pi_{\mathcal F}(n)}n}
\le
\sqrt{
\frac{2d\ln(en/d)}n
},
\]

implying that a class with finite VC dimension is always learnable.

We emphasize that to prove $\operatorname{VCdim}(\mathcal F)=d$, one needs to show exactly two things:

1. $\Pi_{\mathcal F}(d)=2^d$, that is, provide a concrete set of inputs of size $d$ and prove that $\mathcal F$ realizes all possible labelings on this set;
2. $\Pi_{\mathcal F}(d+1)<2^{d+1}$, that is, prove that for any input set of size $d+1$, there exists a labeling that is not achievable by $\mathcal F$.

This is often easier than finding the growth function for an arbitrary $n$, as we already saw in the linear classifier example. Below are a few more examples.

**Proposition 3.** A class has VC dimension $0$ if and only if it contains only one function.

**Proposition 4.** The threshold function class defined in Proposition 1 has VC dimension $1$.

**Proposition 5.** The interval function class defined in Proposition 2 has VC dimension $2$.

You should be able to prove these statements without too much difficulty. For the threshold and interval function classes, we figured out the exact growth function earlier, and one can see that the upper bound given by Sauer's lemma is very tight.

**Proposition 6.** The linear classifier class defined in Equation (3) has VC dimension $d+1$.

We have already proved this statement for $d=2$ in the earlier discussion. Proving the general case will be part of HW 1.

By now, you might have noticed that the VC dimension often matches the number of parameters of the class. Indeed, the number of parameters often serves as a quick (and most of the time accurate) guess for the VC dimension. This is, however, not always correct, as shown in the following example where a class with a single parameter has infinite VC dimension. The intuition is that by picking a large enough $\theta$, the function $\sin(\theta x)$ can wiggle arbitrarily often within a small interval (see HW 1).

**Proposition 7.** Let $\mathcal X=\mathbb R$ and let

\[
\mathcal F
=
\{f_\theta(x)=\operatorname{sign}(\sin(\theta x)):
\theta\in\mathbb R\}.
\]

Then

\[
\operatorname{VCdim}(\mathcal F)=\infty.
\]

### 3.2 Proof of Sauer's Lemma

**Proof.** Let

\[
g(d,n)
=
\sum_{i=0}^d\binom ni.
\]

We prove by induction on the value of $d+n$ that, when $n>d$,

\[
\Pi_{\mathcal F}(n)
\le
g(d,n).
\]

The base case $d+n=1$ is trivial: the only possible configuration is $d=0$ and $n=1$, and in this case

\[
\Pi_{\mathcal F}(n)=1=g(0,1).
\]

Next, assume the statement holds for all $(n',d')$ with $n'>d'$ and $n'+d'<n+d$, and we prove $\Pi_{\mathcal F}(n)\le g(d,n)$. The case $d=0$ is again trivial, so assume

\[
n>d>0.
\]

For any set of distinct inputs $x_{1:n}$, let

\[
\mathcal F_1
=
\mathcal F|_{x_{2:n}}
\]

be the projection of $\mathcal F$ onto the $n-1$ inputs $x_{2:n}$; and let $\mathcal F_2\subseteq\mathcal F_1$ be such that

\[
\mathcal F_2
=
\left\{
v\in\mathcal F_1:
(-1,v),(+1,v)
\in
\mathcal F|_{x_{1:n}}
\right\}.
\]

That is, for any labeling $v\in\mathcal F_2$ of $x_{2:n}$, labeling $x_1$ with either label leads to a labeling of $x_{1:n}$ that can be realized by $\mathcal F$. It is clear that

\[
\left|\mathcal F|_{x_{1:n}}\right|
=
|\mathcal F_1|+|\mathcal F_2|.
\]

Now, view $\mathcal F_1$ and $\mathcal F_2$ as two function classes defined only on $x_{2:n}$ (so a function is just a vector in $\{-1,+1\}^{n-1}$). Clearly,

\[
|\mathcal F_1|
=
\left|\mathcal F_1|_{x_{2:n}}\right|
\le
\Pi_{\mathcal F_1}(n-1)
\le
g(d,n-1),
\]

where the last step uses the inductive hypothesis and the fact that $\mathcal F_1$ cannot have VC dimension larger than that of $\mathcal F$.

On the other hand,

\[
|\mathcal F_2|
=
\left|\mathcal F_2|_{x_{2:n}}\right|
\le
\Pi_{\mathcal F_2}(n-1)
\le
g(d-1,n-1),
\]

where the last step uses the inductive hypothesis and the fact that $\mathcal F_2$ has VC dimension at most $d-1$.

Indeed, if the VC dimension of $\mathcal F_2$ were larger than $d-1$, there would exist a subset of $x_{2:n}$ of size $d$ that can be shattered by $\mathcal F_2$. By the construction of $\mathcal F_2$, adding $x_1$ to this subset leads to a set of size $d+1$ that can be shattered by $\mathcal F$, contradicting the condition $\operatorname{VCdim}(\mathcal F)=d$.

Together, this implies

\[
\begin{aligned}
\left|\mathcal F|_{x_{1:n}}\right|
&\le
g(d,n-1)+g(d-1,n-1)\\
&=
\sum_{i=0}^d\binom{n-1}{i}
+
\sum_{i=0}^{d-1}\binom{n-1}{i}\\
&=
\sum_{i=0}^d\binom{n-1}{i}
+
\sum_{i=1}^{d}\binom{n-1}{i-1}\\
&=
\sum_{i=0}^d\binom ni\\
&=
g(d,n).
\end{aligned}
\]

Since this holds for any $x_{1:n}$, we have

\[
\Pi_{\mathcal F}(n)
\le
g(d,n),
\]

finishing the inductive proof.

The second inequality of the lemma holds because

\[
\begin{aligned}
g(d,n)
&=
\left(\frac nd\right)^d
\sum_{i=0}^d
\left(\frac dn\right)^d
\binom ni\\
&\le
\left(\frac nd\right)^d
\sum_{i=0}^d
\left(\frac dn\right)^i
\binom ni
&& (d<n)\\
&\le
\left(\frac nd\right)^d
\sum_{i=0}^n
\left(\frac dn\right)^i
\binom ni\\
&=
\left(\frac nd\right)^d
\left(1+\frac dn\right)^n\\
&\le
\left(\frac{en}{d}\right)^d,
&& (1+x\le e^x,\ \forall x\in\mathbb R).
\end{aligned}
\]

This completes the proof. $\square$

## 4 Summary and Closing the Loop

This lecture can be summarized by the following sequence of upper-bounding steps:

\[
\begin{aligned}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
&\le
\sup_P\mathbb E
\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
&&\text{(using ERM)}\\
&\le
2\sup_P\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))
&&\text{(symmetrization)}\\
&\le
2G\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
&&\text{(erasing the loss)}\\
&\le
\begin{cases}
2GC\sqrt{\dfrac{2\ln|\mathcal F|}{n}},
&\text{finite class},\\[1.2ex]
\sqrt{\dfrac{2\ln\Pi_{\mathcal F}(n)}n}
\le
\sqrt{\dfrac{2d\ln(en/d)}n},
&\text{binary classification}.
\end{cases}
\end{aligned}
\]

where, again, for a binary classification problem $G=1/2$, and for a regression problem $G$ is the Lipschitz constant of the loss; $C$ is a bound on the magnitude of the function values; and $d=\operatorname{VCdim}(\mathcal F)$.

In the end, we found that for binary classification, having a finite VC dimension is a sufficient condition for learnability. But is it also necessary? In other words, is this sequence of upper-bounding steps tight enough?

The answer is yes: a finite VC dimension is also necessary for learnability, so we basically have a closed loop.

Indeed, if a class $\mathcal F$ has infinite VC dimension, then for any $n$, we can find a subset $\mathcal X'\subseteq\mathcal X$ with $2n$ elements that is shattered by $\mathcal F$; that is, $\mathcal F$ behaves the same as $\mathcal Y^{\mathcal X'}$ on this set.

Therefore, by the exact same argument as the no free lunch theorem discussed in Lecture 1, for any algorithm one can find a distribution $P$ supported on $\mathcal X'\times\mathcal Y$ such that it suffers excess risk at least $1/4$, implying that $\mathcal F$ is not learnable.

This also implies that if a class is learnable (for a binary classification problem), then it must be learnable via the simple ERM algorithm.

As a final remark, this conclusion is not always true for general statistical learning problems.

[^1]: For simplicity, we ignore the issue that $\operatorname*{argmin}$ might not exist; it can be handled easily.
