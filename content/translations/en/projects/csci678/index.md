---
title: "Theoretical Machine Learning"
summary: "Study notes for USC CSCI 678 (Theoretical Machine Learning, Fall 2026, Haipeng Luo): complete handout editions, detailed proofs, and concept explanations in theoretical machine learning."
---

CSCI 678 is USC's theoretical machine learning course (Fall 2026, Haipeng Luo), built around the core tools of statistical learning theory: Rademacher complexity, covering numbers, VC dimension and pseudo-dimension, fat-shattering, chaining, and neural-network spectral complexity and margins, continuing into online learning, Littlestone dimension, Hedge, and Perceptron. These notes support lecture preparation and later review.

## 1. How the notes are organized

Each lecture has a complete handout edition and detailed explanation: original sections, results, and numbering are retained, while motivations, proofs, examples, assumptions, pitfalls, and self-tests are developed. Omitted deep theorems remain explicit, and supplementary derivations and corrections are identified. KaTeX renders the mathematics, with matching mathematical content in English and Chinese.

## 2. Currently published

Each lecture has two companion documents: a detailed explanation report (section-by-section, filling in proof details) and a full translation of the slides (preserving the original numbering and structure).

- Lecture 1: [Detailed Explanation](/notes/csci678/lecture-1-explanation) | [Full Translation](/notes/csci678/lecture-1-full-translation) — formalizing the learning problem, the statistical learning framework, the no-free-lunch theorem, online and partial-information learning.
- Lecture 2: [Detailed Explanation](/notes/csci678/lecture-2-explanation) | [Full Translation](/notes/csci678/lecture-2-full-translation) — uniform convergence, symmetrization and Rademacher complexity, growth function and VC dimension.
- Lecture 3: [Preview Report](/notes/csci678/lecture-3-preview) | [Full Translation](/notes/csci678/lecture-3-full-translation) — covering numbers, Dudley's entropy integral, and pseudo-dimension.
- Lecture 4: [Detailed Explanation](/notes/csci678/lecture-4-explanation) | [Full Handout](/notes/csci678/lecture-4-full-translation) — fat-shattering dimension, neural-network covers, spectral complexity, and margin bounds, including the original experiment figures and step-by-step derivations.

- Lecture 5: [Detailed Explanation](/notes/csci678/lecture-5-explanation) | [Full Handout](/notes/csci678/lecture-5-full-translation) — Derives tree symmetrization from minimax duality and martingale differences, explaining dependent data, binary relabeling, and contraction conditions.
- Lecture 6: [Detailed Explanation](/notes/csci678/lecture-6-explanation) | [Full Handout](/notes/csci678/lecture-6-full-translation) — Develops sequential Sauer, threshold and monotone counterexamples, regression entropy integrals, and surrogate normalization.
- Lecture 7: [Detailed Explanation](/notes/csci678/lecture-7-explanation) | [Full Handout](/notes/csci678/lecture-7-full-translation) — Derives the exponential-weights potential, mistake-indexed experts, and the Perceptron bound, with margin and dimension qualifications.

Notes for later lectures will be added over time. Note updates live under [Updates](/notes/csci678/updates).
