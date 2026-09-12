---
title: "Lecture 3 Full Translation"
summary: "A complete English translation of the Lecture 3 slides: covering functions, covering projections, the Dudley entropy integral and the chaining technique, and pseudo-dimension. Mathematical notation, theorem numbering, and proof structure are preserved as in the original."
---

**Fall 2026, Instructor: Haipeng Luo**

> This document presents the original English text of the Lecture 3 slides, restored against the source PDF. Mathematical notation, theorem numbering, proposition numbering, and proof structure are preserved as in the original.

## 1 Infinite Class: Regression

In this lecture, we continue to focus on characterizing the learnability of statistical learning. Recall that in the last lecture, by a sequence of upper-bounding steps we arrived at

\[
\begin{aligned}
\mathcal V^{\mathrm{iid}}(\mathcal F,n)
&\le
\sup_P\mathbb E\left[
\sup_{f\in\mathcal F}
\left(
L(f)-\frac1n\sum_{t=1}^n\ell(f,z_t)
\right)
\right]
&&\text{(using ERM)}\\
&\le 2\sup_P\mathcal R^{\mathrm{iid}}(\ell(\mathcal F))
&&\text{(symmetrization)}\\
&\le 2G\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
&&\text{(erasing the loss)}.
\end{aligned}
\]

where $G=1/2$ for a binary classification problem, or $G$ is the Lipschitz constant for the regression loss. For a finite class with function values bounded in $[-C,C]$, we apply the maximal inequality to show

\[
\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
\le C\sqrt{\frac{2\ln|\mathcal F|}{n}}.
\]

Based on this result, we further discussed that for a binary classification problem ($\mathcal Y=\{-1,+1\}$), all that really matters is the projection

\[
\mathcal F|_{x_{1:n}}
=
\{(f(x_1),\ldots,f(x_n)):f\in\mathcal F\}
\subseteq\{-1,+1\}^n.
\]

Therefore, one can reduce the infinite case to the finite case by introducing the growth function and VC-dimension of a class. Specifically, we proved that with
$d=\operatorname{VCdim}(\mathcal F)$,

\[
\sup_P\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\sqrt{\frac{2\ln\Pi_{\mathcal F}(n)}{n}}
\le
\sqrt{\frac{2d\ln(en/d)}{n}}.
\]

In this lecture, we turn our focus to regression problems with a real-valued function class. Without loss of generality, we assume that the output is normalized so that

\[
\mathcal Y=[-1,+1],
\qquad
\mathcal F\subseteq[-1,+1]^{\mathcal X}.
\]

It is clear that the key is still to understand the Rademacher complexity
$\mathcal R^{\mathrm{iid}}(\mathcal F)$. However, since $\mathcal F$ is a real-valued class, the projection

\[
\mathcal F|_{x_{1:n}}\subseteq[-1,+1]^n
\]

is generally also an infinite set, and we cannot directly apply the finite case result.

A somewhat natural idea to fix this issue is to approximate the infinite class by a finite discretization. There are different possible ways to do this, and we discuss two below.

### 1.1 Covering functions

The first idea is to come up with a finite function class $\mathcal H$ so that for any
$f\in\mathcal F$, there is a corresponding representative $h\in\mathcal H$ such that $h$ is close to
$f$. The closeness could be measured by, for example, the maximum pointwise difference between the two functions:

\[
\sup_{x\in\mathcal X}|f(x)-h(x)|
\]

Based on this intuition, we define: if a finite class
$\mathcal H\subseteq[-1,+1]^{\mathcal X}$ satisfies that for any
$f\in\mathcal F$, there exists $h\in\mathcal H$ such that for all
$x\in\mathcal X$,

\[
|f(x)-h(x)|\le\alpha,
\]

then $\mathcal H$ is called a **pointwise
$\alpha$-cover** of $\mathcal F$, and the pointwise $\alpha$-covering number of $\mathcal F$ is defined as

\[
\mathcal N(\mathcal F,\alpha)
=
\min\left\{
|\mathcal H|:
\mathcal H\text{ is a pointwise }\alpha\text{-cover of }\mathcal F
\right\}.
\]

(or infinity if there is no such finite cover). Clearly,
$\mathcal N(\mathcal F,\alpha)$ is non-increasing in $\alpha$.

With this definition, we can once again reduce the infinite case to the finite case and immediately derive the following result.

**Theorem 1.** For any
$\mathcal F\subseteq[-1,+1]^{\mathcal X}$, we have

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\min_{\alpha\ge0}
\left(
\alpha+
\sqrt{\frac{2\ln\mathcal N(\mathcal F,\alpha)}{n}}
\right).
\]

**Proof.** Fix any $\alpha\ge0$. Let $\mathcal H$ be a pointwise $\alpha$-cover of
$\mathcal F$ with size
$\mathcal N(\mathcal F,\alpha)$. For each $f\in\mathcal F$, let
$h_f\in\mathcal H$ be the "representative" of $f$ such that

\[
\sup_x|f(x)-h_f(x)|\le\alpha.
\]

We then have

\[
\begin{aligned}
\mathcal R^{\mathrm{iid}}(\mathcal F)
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n\epsilon_t f(x_t)
\right]\\
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t\bigl(f(x_t)-h_f(x_t)+h_f(x_t)\bigr)
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
\epsilon_t\bigl(f(x_t)-h_f(x_t)\bigr)
\right]
+
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n\epsilon_t h_f(x_t)
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F}
\sum_{t=1}^n
|f(x_t)-h_f(x_t)|
\right]
+
\frac1n\mathbb E
\left[
\sup_{h\in\mathcal H}
\sum_{t=1}^n\epsilon_t h(x_t)
\right]\\
&\le
\alpha+\mathcal R^{\mathrm{iid}}(\mathcal H)\\
&\le
\alpha+
\sqrt{\frac{2\ln\mathcal N(\mathcal F,\alpha)}{n}},
\end{aligned}
\]

where the last step uses Massart's lemma. Since this holds for any
$\alpha\ge0$, the theorem follows. $\square$

Naturally, the bound exhibits some trade-off between the approximation scale $\alpha$ and the size of the cover. How large can the pointwise covering number be? Let us first consider a linear case, where

\[
\mathcal X=B_q^d,
\qquad
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\]

for some $p\ge1$ and $q\ge1$ such that

\[
\frac1p+\frac1q=1.
\]

Here,

\[
B_q^d=\{x\in\mathbb R^d:\|x\|_q\le1\}
\]

is the $d$-dimensional $q$-norm unit ball (and $B_p^d$ is defined similarly). The condition
$1/p+1/q=1$ makes $\|\cdot\|_p$ the dual norm of
$\|\cdot\|_q$ (and vice versa), and this ensures, by Hölder's inequality, that

\[
|f_\theta(x)|
=|\langle\theta,x\rangle|
\le\|\theta\|_p\|x\|_q
\le1.
\]

This captures many common problems such as (regularized) linear regression. We first see how large the pointwise covering number is when
$p=\infty$ (and thus $q=1$).

**Proposition 1.** Let

\[
\mathcal X=B_1^d,
\qquad
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_\infty^d\}.
\]

For any $0\le\alpha\le1$,

\[
\mathcal N(\mathcal F,\alpha)
\le\left(\frac1\alpha\right)^d.
\]

Moreover, when $n\ge d$,

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=
O\left(
\sqrt{\frac{d\ln(n/d)}{n}}
\right).
\]

**Proof.** Note that $B_\infty^d$ is simply a
$d$-dimensional hypercube with edge length 2. Fix any $0\le\alpha\le1$. We discretize this hypercube "evenly" into

\[
\left(\frac1\alpha\right)^d
\]

disjoint small hypercubes with edge length $2\alpha$, and define
$\mathcal H\subseteq\mathcal F$ as the set of linear functions parametrized by the centers of these small hypercubes.

Clearly, $\mathcal H$ is a pointwise $\alpha$-cover of $\mathcal F$, since for any
$f_\theta\in\mathcal F$, if we let $\theta'$ be the center of the small hypercube that $\theta$ lies in and
$h_{\theta'}\in\mathcal H$ be the corresponding linear function, then for any
$x\in B_1^d$ we have

\[
\begin{aligned}
|f_\theta(x)-h_{\theta'}(x)|
&=
|\langle\theta-\theta',x\rangle|\\
&\le
\|\theta-\theta'\|_\infty\|x\|_1\\
&\le\alpha.
\end{aligned}
\]

This concludes the first statement. The second statement is by applying Theorem 1 and setting

\[
\alpha=\sqrt{\frac dn}
\]

$\square$

> **Footnote 1.** Technically, $(1/\alpha)^d$ should be
> $\lceil1/\alpha\rceil^d$. We ignore this subtlety since it makes no real difference.

This implies that the linear class above is learnable (via ERM with rate roughly
$\sqrt{d/n}$).

For a general value of $p$, it is easy to see that

\[
B_p^d\subseteq B_\infty^d.
\]

So if we use the same class $\mathcal H$ constructed in the proof of Proposition 1 as a pointwise cover, we can show that for any
$f_\theta$ and its representative $h_{\theta'}$, and any
$x\in B_q^d$,

\[
\begin{aligned}
|f_\theta(x)-h_{\theta'}(x)|
&=
|\langle\theta-\theta',x\rangle|\\
&\le
\|\theta-\theta'\|_p\|x\|_q\\
&\le
d^{1/p}\|\theta-\theta'\|_\infty\\
&\le d^{1/p}\alpha.
\end{aligned}
\]

This means $\mathcal H$ is a pointwise $d^{1/p}\alpha$-cover, and consequently the pointwise covering number is bounded as

\[
\mathcal N(\mathcal F,\alpha)
\le
\left(\frac{d^{1/p}}{\alpha}\right)^d.
\]

So the linear class is learnable for any value of $p$.

However, when dealing with the $p$-norm ball $B_p^d$, intuitively we should also discretize it into small
$p$-norm balls instead of small hypercubes, and this might lead to a smaller cover. This is indeed true as shown in the next proposition, but explicitly constructing such a cover seems rather difficult. Fortunately, in the proof we show that sometimes it is possible to give a bound on the covering number without explicitly constructing the cover.

**Proposition 2.** If

\[
\mathcal X=B_q^d,
\qquad
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\]

for some $p\ge1$ and $q\ge1$ such that $1/p+1/q=1$, we have, for any
$0\le\alpha\le1$,

\[
\mathcal N(\mathcal F,\alpha)
\le
\left(\frac2\alpha+1\right)^d.
\]

Moreover, when $n\ge d$,

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=
O\left(
\sqrt{\frac{d\ln(n/d)}{n}}
\right).
\]

**Proof.** Fix any $0\le\alpha\le1$. Let $rB_p^d$ be a $p$-norm ball with radius
$r\ge0$. The key idea is to pack the ball $B_p^d$ with as many small balls $(\alpha/2)B_p^d$ of radius
$\alpha/2$ as possible.

Formally, let $S\subseteq B_p^d$ be the largest subset such that for any two points
$\theta,\theta'\in S$,

\[
\|\theta-\theta'\|_p>\alpha.
\]

This is called an $\alpha$-packing of $B_p^d$.

We first claim that the corresponding function class

\[
\mathcal H=
\{h_\theta(x)=\langle\theta,x\rangle:\theta\in S\}
\]

is a pointwise $\alpha$-cover of $\mathcal F$. Indeed, for any
$\theta\in B_p^d$, there must exist $\theta'\in S$ such that

\[
\|\theta-\theta'\|_p\le\alpha.
\]

Otherwise, $\theta$ can be added to $S$ and $S$ is still an
$\alpha$-packing, a contradiction to the definition of $S$. It is then clear that for any
$x\in B_q^d$,

\[
|f_\theta(x)-h_{\theta'}(x)|\le\alpha.
\]

It remains to prove

\[
|S|\le\left(\frac2\alpha+1\right)^d.
\]

To show this, imagine that for each point in $S$, we put a
$p$-norm ball with radius $\alpha/2$ centered at this point. By the definition of $S$, all these balls are disjoint. On the other hand, all these balls are contained in the larger ball

\[
\left(1+\frac\alpha2\right)B_p^d
\]

Therefore, we must have that the sum of the volumes of all these small balls is bounded by the volume of the larger ball:

\[
|S|\operatorname{Vol}\left(\frac\alpha2B_p^d\right)
\le
\operatorname{Vol}\left(
\left(1+\frac\alpha2\right)B_p^d
\right).
\]

Using the fact

\[
\operatorname{Vol}(rB_p^d)
=r^d\operatorname{Vol}(B_p^d)
\]

and rearranging then proves

\[
|S|\le\left(\frac2\alpha+1\right)^d.
\]

The upper bound on $\mathcal R^{\mathrm{iid}}(\mathcal F)$ is again obtained by applying Theorem 1 and setting

\[
\alpha=\sqrt{\frac dn},
\]

which completes the proof. $\square$

In HW1, you will also prove that this covering number of order

\[
O\left(\frac1{\alpha^d}\right)
\]

is tight for the linear class, using a similar volumetric argument.

Next, we consider a nonparametric example where $\mathcal X=\mathbb R$ and
$\mathcal F$ is the set of all non-decreasing functions. This function class is commonly used in the so-called **isotonic regression** problems, where it is very natural to assume that the output is monotonic in the input (for example, predicting the height of children as a function of age).

In this case, $\mathcal F$ seems to be a very expressive class. Indeed, it has an infinite pointwise covering number, as shown below.

**Proposition 3.** If

\[
\mathcal X=\mathbb R,
\qquad
\mathcal Y=[-1,+1],
\]

and $\mathcal F\subseteq\mathcal Y^{\mathcal X}$ is the set of all non-decreasing functions, then for any
$\alpha<1$,

\[
\mathcal N(\mathcal F,\alpha)=\infty.
\]

**Proof.** Consider an infinite subset of $\mathcal F$ defined as

\[
\{f_m(x)=\operatorname{sign}(x-m):m\text{ is an integer}\}.
\]

It is impossible to pointwise cover any two different functions
$f_m$ and $f_{m'}$ from this set with the same function $h$, since

\[
\left|
f_m\left(\frac{m+m'}2\right)
-
f_{m'}\left(\frac{m+m'}2\right)
\right|
=2,
\]

and thus $h((m+m')/2)$ cannot be simultaneously within distance
$\alpha<1$ of both
$f_m((m+m')/2)$ and $f_{m'}((m+m')/2)$. This implies that there is no finite pointwise cover for $\mathcal F$. $\square$

Does this imply that this function class is not learnable? The answer is no as we show in the next section. Importantly, this implies that pointwise covering is in fact not the right, or at least not the tight, complexity measure.

### 1.2 Covering projections

Recall that just as in classification, symmetrization allows us to only care about the projection
$\mathcal F|_{x_{1:n}}$, instead of the entire function class
$\mathcal F$. This motivates us to approximately discretize the $n$-dimensional space
$\mathcal F|_{x_{1:n}}$ instead of $\mathcal F$.

Formally, if $V\subseteq[-1,+1]^n$ satisfies: for any
$f\in\mathcal F|_{x_{1:n}}$, there exists $v\in V$ such that

\[
\|f-v\|_\infty\le\alpha,
\]

then $V$ is called an $\alpha$-cover of $\mathcal F|_{x_{1:n}}$ with respect to the
$\ell_\infty$ norm.

Note that here we slightly abuse the notation by using $f$ as an $n$-dimensional vector (while previously it was also used as a function in
$\mathcal F$). The ($\ell_\infty$ norm) $\alpha$-covering number
$\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)$ is defined as the size of the smallest
$\ell_\infty$-norm $\alpha$-cover.

In fact, a more careful inspection of the proof of Theorem 1 reveals that an
$\ell_\infty$ cover is not necessarily needed. To this end, for any $p>0$, if
$V\subseteq[-1,+1]^n$ satisfies: for any
$f\in\mathcal F|_{x_{1:n}}$, there exists $v\in V$ such that

\[
\|f-v\|_p\le n^{1/p}\alpha,
\]

or equivalently,

\[
\left(
\frac1n\sum_{t=1}^n|f_t-v_t|^p
\right)^{1/p}
\le\alpha,
\]

then $V$ is called an $\alpha$-cover of $\mathcal F|_{x_{1:n}}$ with respect to the
$\ell_p$ norm.

Similarly, the corresponding $\alpha$-covering number
$\mathcal N_p(\mathcal F|_{x_{1:n}},\alpha)$ is defined as the size of the smallest
$\ell_p$-norm $\alpha$-cover.

Note that there is a somewhat "strange" (but in fact conventional) normalization going on in this definition. This normalization ensures that

\[
\left(
\frac1n\sum_{t=1}^n|f_t-v_t|^p
\right)^{1/p}
\]

is an increasing function in $p$ (you can prove this via Hölder's inequality), and therefore

\[
\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)
\le
\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)
\le\cdots\le
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha).
\]

An argument similar to the proof of Theorem 1 shows the following.

**Theorem 2.** For any
$\mathcal F\subseteq[-1,+1]^{\mathcal X}$ and inputs
$x_{1:n}$, we have

\[
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
\le
\min_{\alpha\ge0}
\left(
\alpha+
\sqrt{
\frac{
2\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)
}{n}
}
\right).
\]

**Proof.** Fix any $\alpha\ge0$. Let $V$ be an $\alpha$-cover of
$\mathcal F|_{x_{1:n}}$ with size
$\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)$. For each
$f\in\mathcal F|_{x_{1:n}}$, let $v_f\in V$ be its "representative", satisfying

\[
\|f-v_f\|_1\le n\alpha.
\]

We then have, with $\epsilon=(\epsilon_1,\ldots,\epsilon_n)$,

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,f\rangle
\right]\\
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,f-v_f+v_f\rangle
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,f-v_f\rangle
\right]
+
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,v_f\rangle
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\|f-v_f\|_1
\right]
+
\frac1n\mathbb E
\left[
\sup_{v\in V}
\langle\epsilon,v\rangle
\right]\\
&\le
\alpha+
\sqrt{
\frac{
2\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)
}{n}
}.
\end{aligned}
\]

The last step uses Massart's lemma. Since this holds for any
$\alpha\ge0$, the theorem follows. $\square$

Now let us see how covering projections is better than covering functions.

First, since $\mathcal F|_{x_{1:n}}$ lies in
$[-1,+1]^n$, it is trivial to see that by discretizing
$[-1,+1]^n$ into small hypercubes, similarly to what we did in the previous section, one can show that

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le
\left(\frac1\alpha\right)^n
\]

always holds. This bound is useless though, since it leads to a constant upper bound on the Rademacher complexity if one plugs it into the bound of Theorem 2.

Second, note that if $\mathcal H$ is a pointwise
$\alpha$-cover of $\mathcal F$, then by definition,
$\mathcal H|_{x_{1:n}}$ is also an
$\alpha$-cover of $\mathcal F|_{x_{1:n}}$ with respect to the $\ell_\infty$ norm, which implies

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le
\mathcal N(\mathcal F,\alpha).
\]

That is, covering projections is never worse than covering functions. Therefore, for the linear class discussed earlier

\[
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\]

one also has

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le
\left(\frac2\alpha+1\right)^d.
\]

In fact, it is not hard to see that more generally, as long as
$\mathcal F|_{x_{1:n}}$ lies in some
$d$-dimensional subspace of $[-1,+1]^n$, its covering number is roughly of order

\[
O\left(\left(\frac1\alpha\right)^d\right)
\]

(see HW1).

Finally, we come back to the non-decreasing function class and argue that while
$\mathcal N(\mathcal F,\alpha)=\infty$,
$\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)$ is finite, which means covering projections is strictly better than covering functions.

**Proposition 4.** If

\[
\mathcal X=\mathbb R,
\qquad
\mathcal Y=[-1,+1],
\]

and $\mathcal F\subseteq\mathcal Y^{\mathcal X}$ is the set of all non-decreasing functions, then for any
$\alpha<1$,

\[
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\alpha)
\le
(n+1)^{1/\alpha}.
\]

Therefore,

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
\le
\min_{0\le\alpha\le1}
\left(
\alpha+
\sqrt{\frac{2\ln(n+1)}{\alpha n}}
\right)
=
O\left(
\left(\frac{\ln n}{n}\right)^{1/3}
\right).
\]

**Proof.** Without loss of generality we assume

\[
x_1\le\cdots\le x_n.
\]

Let $S\subseteq[-1,+1]$ be a finite discretization at scale $2\alpha$ such that

\[
|S|\le\frac1\alpha,
\]

and for any $y\in[-1,+1]$, there exists $y'\in S$ such that

\[
|y-y'|\le\alpha.
\]

Let

\[
V=
\{v\in S^n:v_1\le\cdots\le v_n\}.
\]

Clearly, by construction $V$ is an
$\alpha$-cover of $\mathcal F|_{x_{1:n}}$ with respect to the $\ell_\infty$ norm. It remains to calculate the size of $V$.

It is not hard to see that $|V|$ is exactly the number of solutions of the equation

\[
\sum_{i=1}^{|S|}m_i=n
\]

for non-negative integers $(m_1,\ldots,m_{|S|})$, where $m_i$ represents the number of appearances of the $i$-th smallest element of $S$. The exact number of solutions is

\[
\binom{n+|S|-1}{|S|-1},
\]

but a rough estimate can be obtained by simply realizing that each $m_i$ can only take $n+1$ possible values:

\[
|V|
\le
(n+1)^{|S|}
\le
(n+1)^{1/\alpha}.
\]

The bound on the Rademacher complexity is by a direct application of Theorem 2 and picking the optimal value of
$\alpha$. $\square$

This shows that while the class of all non-decreasing functions is seemingly very expressive, it is in fact still learnable via ERM. This serves as another example to showcase the importance of the symmetrization trick, which allows us to focus only on the projections rather than on the functions themselves.

We finally remark that regardless of which type of covers we use, the covering argument appears only in the analysis, not in the algorithm itself — the algorithm is always just ERM, which could be very efficient even for problems like isotonic regression.

## 2 Dudley Entropy Integral

One might notice that the rate of convergence shown in Proposition 4 is roughly
$1/n^{1/3}$, which is slower than the typical rate
$1/\sqrt n$ we have seen for all other examples.

Does that really imply that learning non-decreasing functions requires more samples, or is our bound loose? It turns out that the latter is true, and to improve the bound, we need to apply a tighter analysis using the so-called **Dudley entropy integral**.

**Theorem 3.** For any
$\mathcal F\subseteq[-1,+1]^{\mathcal X}$ and inputs
$x_{1:n}$, we have

\[
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
\le
\min_{0\le\alpha\le1}
\left(
4\alpha+
\frac{12}{\sqrt n}
\int_\alpha^1
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta
\right).
\]

The proof is deferred to the next section. The upper bound in the theorem above is called the Dudley entropy integral of the class
$\mathcal F$ (log covering number is often called the **metric entropy**; hence the name).

It is in terms of the $\ell_2$ covering number (the reason will be clear in the proof), and it looks at the covering number at different scales simultaneously.

Ignoring constants and the difference between $\mathcal N_1$ and $\mathcal N_2$, this is never worse than the bound given by Theorem 2, since

\[
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\]

is decreasing in $\delta$, and thus

\[
\begin{aligned}
\int_\alpha^1
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta
&\le
(1-\alpha)
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)
}\\
&\le
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha)
}.
\end{aligned}
\]

It could be strictly better though, as shown in the following two examples.

**Proposition 5.** If

\[
\mathcal X=B_q^d,
\qquad
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\]

for some $p\ge1$ and $q\ge1$ such that $1/p+1/q=1$, we have

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=O\left(\sqrt{\frac dn}\right).
\]

**Proof.** We use the bound

\[
\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
\le
\mathcal N(\mathcal F,\delta)
\le
\left(\frac2\delta+1\right)^d
\le
\left(\frac3\delta\right)^d.
\]

Therefore,

\[
\begin{aligned}
\int_\alpha^1
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta
&\le
\sqrt d
\int_\alpha^1
\sqrt{\ln\left(\frac3\delta\right)}
\,d\delta.
\end{aligned}
\]

When $\alpha=0$, the right-hand side is $O(\sqrt d)$, since

\[
\int_0^1\sqrt{\ln(1/\delta)}\,d\delta
=\frac{\sqrt\pi}{2}.
\]

Plugging this into the Dudley entropy integral and taking $\alpha=0$ thus finishes the proof. $\square$

> **Footnote 2.** More generally, if the range of the functions is not $[-1,+1]$, one only needs to replace the 1 in "$0\le\alpha\le1$" and "$\int_\alpha^1$" with $\sup_{f\in\mathcal F}\sqrt{\frac1n\sum_{t=1}^n f(x_t)^2}$. You will need this more general version for HW1 Problem 1(b).

So using the Dudley entropy integral allows us to remove the extra
$\ln n$ term in Proposition 2 for the Rademacher complexity of linear functions. The improvement in the next example will be even more significant.

**Proposition 6.** If

\[
\mathcal X=\mathbb R,
\qquad
\mathcal Y=[-1,+1],
\]

and $\mathcal F\subseteq\mathcal Y^{\mathcal X}$ is the set of all non-decreasing functions, then

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=
O\left(\sqrt{\frac{\ln n}{n}}\right).
\]

**Proof.** Again we directly plug in the bound

\[
\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
\le
\mathcal N_\infty(\mathcal F|_{x_{1:n}},\delta)
\le
(n+1)^{1/\delta},
\]

and calculate the Dudley entropy integral:

\[
\begin{aligned}
\int_\alpha^1
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta
&\le
\sqrt{\ln(n+1)}
\int_\alpha^1\frac1{\sqrt\delta}\,d\delta\\
&=
2\sqrt{\ln(n+1)}(1-\sqrt\alpha)\\
&\le
2\sqrt{\ln(n+1)}.
\end{aligned}
\]

Setting $\alpha=0$ finishes the proof. $\square$

This shows that the rate for learning non-decreasing functions is again roughly
$1/\sqrt n$ instead of $1/n^{1/3}$, demonstrating the power of the Dudley entropy integral.

### 2.1 Chaining Technique

**Proof of Theorem 3.** The proof relies on an important chaining technique that looks at different covering scales simultaneously.

Specifically, for

\[
j=1,2,\ldots,M,
\]

(for some $M$ to be specified later) let

\[
\alpha_j=2^{-j},
\]

and let $V_j$ be an ($\ell_2$ norm) $\alpha_j$-cover of $\mathcal F|_{x_{1:n}}$ with size

\[
\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha_j).
\]

Additionally, let $V_0$ be the trivial
$2^0$-cover of $\mathcal F|_{x_{1:n}}$ that contains only the all-zero vector.

Now, for each $f\in\mathcal F|_{x_{1:n}}$, we can associate it with a chain of representatives

\[
v_f^j\in V_j,
\qquad j=0,1,2,\ldots,M
\]

such that

\[
\|f-v_f^j\|_2\le\sqrt n\,\alpha_j.
\]

Then, with $\epsilon=(\epsilon_1,\ldots,\epsilon_n)$, we have

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,f\rangle
\right]\\
&=
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\left\langle
\epsilon,\,
f-v_f^M+
\sum_{j=1}^M(v_f^j-v_f^{j-1})
\right\rangle
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,f-v_f^M\rangle
\right]\\
&\quad+
\frac1n
\sum_{j=1}^M
\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\langle\epsilon,v_f^j-v_f^{j-1}\rangle
\right]\\
&\le
\frac1n\mathbb E
\left[
\sup_{f\in\mathcal F|_{x_{1:n}}}
\|f-v_f^M\|_1
\right]\\
&\quad+
\frac1n
\sum_{j=1}^M
\mathbb E
\left[
\sup_{(v,v')\in S_j}
\langle\epsilon,v-v'\rangle
\right],
\end{aligned}
\]

where

\[
S_j=
\left\{
(v,v')\in V_j\times V_{j-1}:
\begin{array}{l}
\text{there exists }f\in\mathcal F|_{x_{1:n}},\\
v\text{ and }v'\text{ are both representatives of }f
\end{array}
\right\}.
\]

The first term in the last bound is bounded by $\alpha_M$, since by the Cauchy-Schwarz inequality,

\[
\|f-v_f^M\|_1
\le
\sqrt n\,\|f-v_f^M\|_2
\le
n\alpha_M.
\]

For the second term, we apply Massart's lemma again:

\[
\begin{aligned}
\mathbb E
\left[
\sup_{(v,v')\in S_j}
\langle\epsilon,v-v'\rangle
\right]
&\le
\sigma\sqrt{2\ln(|V_j||V_{j-1}|)}\\
&\le
2\sigma\sqrt{\ln|V_j|}\\
&=
2\sigma
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha_j)
},
\end{aligned}
\]

where

\[
\sigma=
\sup_{(v,v')\in S_j}\|v-v'\|_2.
\]

For any pair $(v,v')\in S_j$, there exists $f$ such that

\[
\|v-f\|_2\le\sqrt n\,\alpha_j
\]

and

\[
\|v'-f\|_2\le\sqrt n\,\alpha_{j-1}.
\]

Therefore, one has

\[
\begin{aligned}
\|v-v'\|_2
&\le
\|v-f\|_2+\|v'-f\|_2\\
&\le
\sqrt n(\alpha_j+\alpha_{j-1})\\
&=
3\sqrt n\,\alpha_j.
\end{aligned}
\]

This shows that

\[
\sigma\le3\sqrt n\,\alpha_j.
\]

Thus,

\[
\begin{aligned}
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
&\le
\alpha_M+
\frac6{\sqrt n}
\sum_{j=1}^M
\alpha_j
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha_j)
}\\
&\le
\alpha_M+
\frac{12}{\sqrt n}
\sum_{j=1}^M
(\alpha_j-\alpha_{j+1})
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\alpha_j)
}\\
&\le
\alpha_M+
\frac{12}{\sqrt n}
\int_{\alpha_{M+1}}^{\alpha_1}
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta.
\end{aligned}
\]

The last step uses the fact that

\[
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\]

is a non-increasing function in $\delta$.

Finally, for any $0<\alpha\le1$, let $M$ be such that

\[
2^{-(M+2)}
\le
\alpha
\le
2^{-(M+1)}.
\]

Then we have

\[
\alpha_M\le4\alpha,
\qquad
\alpha\le\alpha_{M+1}.
\]

Therefore,

\[
\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})
\le
4\alpha+
\frac{12}{\sqrt n}
\int_\alpha^1
\sqrt{
\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)
}
\,d\delta.
\]

For the case $\alpha=0$, the same bound follows by letting $M\to\infty$. $\square$

Note that the key reason that $\ell_2$-norm covers are used is because the definition of
$\sigma$ is in terms of the $\ell_2$ norm (which is inherited from the maximal inequality).

### Summary

To recap, we have shown three different upper bounds in terms of covering numbers for the Rademacher complexity of a real-valued class, along with two running examples to show how good each bound is; see the table below for a summary.

**Table 1: Summary of Rademacher complexity upper bounds using covering numbers**

| Upper bound on $\widehat{\mathcal R}^{\mathrm{iid}}(\mathcal F;x_{1:n})$ | Linear functions | Non-decreasing functions |
|---|---:|---:|
| $\displaystyle \min_{\alpha\ge0}\left(\alpha+\sqrt{\frac{2\ln\mathcal N(\mathcal F,\alpha)}{n}}\right)$ | $\displaystyle O\left(\sqrt{\frac{d\ln(n/d)}{n}}\right)$ | $\infty$ |
| $\displaystyle \min_{\alpha\ge0}\left(\alpha+\sqrt{\frac{2\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)}{n}}\right)$ | $\displaystyle O\left(\sqrt{\frac{d\ln(n/d)}{n}}\right)$ | $\displaystyle O\left(\left(\frac{\ln n}{n}\right)^{1/3}\right)$ |
| $\displaystyle \min_{0\le\alpha\le1}\left(4\alpha+\frac{12}{\sqrt n}\int_\alpha^1\sqrt{\ln\mathcal N_2(\mathcal F|_{x_{1:n}},\delta)}\,d\delta\right)$ | $\displaystyle O\left(\sqrt{\frac dn}\right)$ | $\displaystyle O\left(\sqrt{\frac{\ln n}{n}}\right)$ |

## 3 Combinatorial Parameters: Pseudo-Dimension

Note that the role of covering number is very similar to the role of growth function for classification problems. For the latter, we also introduced VC dimension, a combinatorial parameter of a class that might be easier to figure out and that gives a direct upper bound on the growth function via Sauer's lemma.

This leads to a natural question: can we also come up with some combinatorial parameter for a real-valued function class that helps us bound the covering number directly?

Indeed, such combinatorial parameters exist. The first such one in the literature is the **pseudo-dimension**, and it is based on a pretty natural idea of reducing a real-valued function to a binary classifier by looking at its epigraph.

Specifically, a function

\[
f:\mathcal X\to[-1,+1]
\]

naturally separates the space

\[
\mathcal X\times[-1,+1]
\]

into two parts:

- the part where $f(x)\le y$ (which is called the epigraph of $f$);
- the part where $f(x)>y$.

Therefore, we can see $f$ as a binary classifier for the space
$\mathcal X\times[-1,+1]$.

The pseudo-dimension of $\mathcal F$ is simply defined as the VC dimension of this induced class of binary classifiers:

\[
\operatorname{Pdim}(\mathcal F)
=
\operatorname{VCdim}
\left(
\{
h(x,y)=\operatorname{sign}(f(x)-y)
:
f\in\mathcal F
\}
\right).
\]

If we spell out the definition of VC dimension, then the pseudo-dimension is the largest number
$n$ such that there exist $n$ input-output pairs

\[
(x_1,y_1),\ldots,(x_n,y_n)
\in
\mathcal X\times[-1,+1],
\]

such that for any labeling

\[
s_1,\ldots,s_n\in\{-1,+1\},
\]

there exists $f\in\mathcal F$ such that for all
$t=1,\ldots,n$,

\[
\operatorname{sign}(f(x_t)-y_t)=s_t.
\]

(Try drawing a picture for the case $\mathcal X=\mathbb R$ to help understand this.)

Take the linear class as an example again:

\[
\mathcal X=B_q^d,
\qquad
\mathcal F=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\},
\]

for some $p\ge1$ and $q\ge1$ such that

\[
\frac1p+\frac1q=1.
\]

To see how large the pseudo-dimension is for this class, we need to look at the VC dimension of the class

\[
\left\{
h(x,y)=\operatorname{sign}(\langle\theta,x\rangle-y)
:
\theta\in B_p^d
\right\}.
\]

This is very similar to the class of linear classifiers we discussed in Lecture 2 (and HW1), and it is not hard to verify that the VC dimension is exactly
$d$. Therefore,

\[
\operatorname{Pdim}(\mathcal F)=d.
\]

A finite pseudo-dimension turns out to be sufficient for learning. Indeed, one can show an analogue of Sauer's lemma which says that, ignoring some log factors,

\[
\ln\mathcal N_1(\mathcal F|_{x_{1:n}},\alpha)
\]

is of order

\[
\operatorname{Pdim}(\mathcal F)
\ln\left(\frac1\alpha\right).
\]

We will not prove this fact, but using this bound with Theorem 2 directly gives

\[
\mathcal R^{\mathrm{iid}}(\mathcal F)
=
O\left(
\sqrt{
\frac{
\operatorname{Pdim}(\mathcal F)\ln n
}{n}
}
\right).
\]

Also note that for the linear class, this gives almost the same bound as those in Table 1.

However, it turns out that finite pseudo-dimension is not necessary for learning. To see this, we examine the class of all non-decreasing functions again.

The claim is that while this class is learnable (as we already proved), it actually has infinite pseudo-dimension, which implies that pseudo-dimension is not the "right" complexity measure.

Indeed, for any $n$, consider the input-output pairs

\[
(0,0/n),\quad
(1,1/n),\quad
(2,2/n),\quad
\ldots
\]

For any labeling

\[
s_1,\ldots,s_n\in\{-1,+1\},
\]

as long as

\[
\epsilon\in\left(0,\frac1{2n}\right],
\]

we can always find a non-decreasing function that passes through these points in order:

\[
(0,0/n+s_1\epsilon),\quad
(1,1/n+s_2\epsilon),\quad
(2,2/n+s_3\epsilon),\quad
\ldots
\]

Clearly, such a function satisfies, for all $t=1,\ldots,n$,

\[
\operatorname{sign}(f(x_t)-y_t)=s_t.
\]

This shows that the induced binary classifier class can shatter this kind of training set of any size, and thus the pseudo-dimension is infinite.

How do we fix this? Is there a better combinatorial parameter whose finiteness is necessary for learning? We will answer these questions in the next lecture.
