---
layout: post
title: Possible permutations or combinations
color: rgb(161,27,107)
tags: [math]
---

While working with algorithm, you may have to calculate on the fly the number of possibilities created
by some subset of data. Particularly when debugging with your $$r$$ elements from $$n$$ dynamic objects. 
Let's take a refresh our memories!

[Permutations][2] and [combination][3] are part of the [Combinatorics][1] which is an area of mathematics about counting.
A permutation is an arrangement of selected ordered items, while a combination only concerns the selection of item.

## Basics refresher

Let's review the fundamental, just to be sure we are on the same line when reviewing the following
formulas. See math can be useful, to do ... _more_ math, ahem, let's get started. 🙉

### Factorial

The [factorial][8] function is noted $$n!$$ which represent the multiplication of all whole numbers in $$\N$$
starting from $$1, 2, 3, ... n$$.

For example, factorial of 4 would be calculated such as:

$$
\begin{equation} 
\begin{split}
4! &= 4 \times 3 \times 2 \times 1  \\
&= 24 \nonumber
\end{split}
\end{equation}
$$

> The special case with $$0! = 1$$ 😲:
>   - You can write factorial such as $$n! = n \times (n-1)!$$
>   - Meaning $$ 1! = 1 \times 0! $$ so it means that $$0!=1$$ to stay consistent.

### Exponentiation

There's also the [exponentiation][9], sometimes called power function which is noted $$b^n$$ for $$b$$ raised
to the power of $$n$$.

For positive numbers, when $$n$$ is in $$\N$$, we have $$b^n$$ corresponding to multiplication of $$n$$ times
the base $$b$$. For example $$2$$ raised to the power of $$4$$ would be calculated such as:

$$
\begin{equation}
\begin{split}
2^4 &= 2 \times 2 \times 2 \times 2 \\
&= 16 \nonumber
\end{split}
\end{equation}
$$

> Notes about exponents:
>   - Noticeable cases for _one_; $$b^1 = b$$ and _zero_; $$b^0 = 1$$
>   - Using negative exponents; $$b^{-1} = \frac{1}{b}$$
>   - Arithmetic operations; $$b^x + b^y = b^{x+y}$$

## Combinatorics 

Now that we have our bases refreshed to the power of knowledge, we can factor it to our next three topics!
Let's "_Q.E.D." (_quod erat demonstrandum_) those formulas and feel smart about it. 🤓

### Permutation
#### Introduction
When the order does matter you want to [calculate][7] the possible [permutations][2].
Let's say you have a set of $$n$$ objects, and you choose $$k$$ times from it.

$$
\overbrace{(\textcolor{#ea008e}{A}, \textcolor{#007cdb}{B}, \textcolor{#00d9c2}{C})}^{\text{n=3}}
\Rightarrow
\underbrace{(\textcolor{#ea008e}{A}, \textcolor{#007cdb}{B}), \overbrace{(\textcolor{#ea008e}{A}, \textcolor{#00d9c2}{C})}^{\text{k=2}}, (\textcolor{#007cdb}{B}, \textcolor{#ea008e}{A}), (\textcolor{#007cdb}{B}, \textcolor{#00d9c2}{C}), (\textcolor{#00d9c2}{C}, \textcolor{#ea008e}{A}), (\textcolor{#00d9c2}{C}, \textcolor{#007cdb}{B})}_{\text{6 permutations}}
$$

There is $$n$$, then $$n-1$$, ... items to choose from, until you have $$k$$ items selected.
In the end you end up with $$n-k$$ items that are not selected.

#### Calculation
This looks like a factorial, so choosing $$k$$ different items out of the $$n$$ possible, is the same as having the $$k$$
factorial from $$n$$ to $$n-k$$.
Which can be written as:

$$
\begin{equation}
\begin{split}
n! &= n \times n-1 \times ... \times n-(k-1) \times n-k \times ... \times 1 \\
&= \underbrace{n \times n-1 \times ... \times n-(k-1)}_{\text{number of permutations}} \times (n-k)! \nonumber
\end{split}
\end{equation}
$$

Let's isolate the amount of permutations on one side of the equation 🤔 <br>
dividing by $$(n-k)!$$ to get:

$$
\begin{equation}
\begin{split}
\frac{n!}{(n-k)!} &= \frac{n \times n-1 \times ... \times n-(k-1) \times (n-k)!}{(n-k)!} \\
&= \frac{n \times n-1 \times ... \times n-(k-1) \times  \cancel{(n-k)!}}{ \cancel{(n-k)!}} \\
&= \underbrace{n \times n-1 \times ... \times n-(k-1)}_{\text{number of permutations}} \nonumber
\end{split}
\end{equation}
$$

So now we can write the formula to find the amount of permutation $$P_k^n$$ for $$k$$ selection in $$n$$ objects such as:

$$
P_k^n=\frac{n!}{(n-k)!}
$$

> We can see that in the case where $$k=n$$ we have a division by $$0!$$ and $$P_n^n=n!$$

For an example where $$n=5$$ and $$k=3$$, we can use it such as $$\frac{5!}{(5-3)!}=60$$.
With repetition (picking the same object more than once in your set), you have $$n^k$$ possible permutations.

### Combination
#### Introduction

When the order does **not** matter you want to [calculate][7] possible [combinations][3].
There will be fewer combinations possible for a given $$k$$ selections in $$n$$ items than the permutation.

Let's have an example for $$n,k=3$$, we'd have one combination but six permutations: 

$$
\underbrace{(\textcolor{#ea008e}{A}, \textcolor{#007cdb}{B}, \textcolor{#00d9c2}{C})}_{\text{1 combination}} 
\Leftrightarrow 
\underbrace{(\textcolor{#ea008e}{A}, \textcolor{#007cdb}{B}, \textcolor{#00d9c2}{C}) (\textcolor{#007cdb}{B}, \textcolor{#00d9c2}{C}, \textcolor{#ea008e}{A}), (\textcolor{#00d9c2}{C}, \textcolor{#ea008e}{A}, \textcolor{#007cdb}{B}), (\textcolor{#ea008e}{A}, \textcolor{#00d9c2}{C}, \textcolor{#007cdb}{B}), (\textcolor{#00d9c2}{C}, \textcolor{#007cdb}{B}, \textcolor{#ea008e}{A}), (\textcolor{#007cdb}{B}, \textcolor{#ea008e}{A}, \textcolor{#00d9c2}{C})}_{\text{6 permutations}}
$$

The combination is usually [noted][10] $$\binom{n}{k}$$ or $$C_k^n$$.

#### Calculation
To remember the formula, there's a little trick.
In our example for $$k=n$$ there are 6 times more permutations than combination.
This corresponds to the number of possible arrangement, i.e. the factorial of the number of selection. 

Which can be extrapolated into $$k!$$ more permutations than combinations. <br> 
So the combination formula can be written such as:

$$
C_k^n=\frac{n!}{k!(n-k)!}
$$

> Combinations' properties:
> - Special value of $$k$$ with $$C_0^n=C_n^n=1$$ and $$C_1^n=C_{n-1}^n=n$$
> - Pascal's rule: $$C_k^n+C_{k-1}^n=C_k^{n+1}$$

For repetitions, it means you can pick the same item three times like in $$(\textcolor{#ea008e}{A}, \textcolor{#ea008e}{A}, \textcolor{#ea008e}{A})$$ or
two times like in $$(\textcolor{#007cdb}{B}, \textcolor{#007cdb}{B}, \textcolor{#00d9c2}{C})$$. 

To find the amount of combination possible with repetition, there are multiple tricks to remember it:
- _One way_: It's to count the amount of time you pick an item $$k$$ and the amount of time you skip an item $$n-1$$ 
  (because at least one item must be picked which will be used for all $$k$$ selections).
- _Another way_: It's to sum possible items $$n$$ with the possible amount of time they can be repeated in the selection $$k-1$$.

Meaning it's like doing the combination for $$\binom{k+n-1}{k}=\frac{(k+n-1)!}{k!(n-1)!}$$.

### Multiplication
#### Introduction
Let's figure out the possibilities from these three sets:

$$\overbrace{(A1, A2)}^{\text{\textcolor{#ea008e}{A}}}, \overbrace{(B1, B2, B3)}^{\text{\textcolor{#007cdb}{B}}}, \overbrace{(C1, C2, C3)}^{\text{\textcolor{#00d9c2}{C}}}$$

The number of element of one set is also called [cardinalilty][6] noted as $$|A|$$ or $$card(A)$$, 
they differ between each set.
Meaning we have 3 choice and each one have respectively 2, 3, 3 possible options such as each possibility can
be noted as a set of one element from $$\textcolor{#ea008e}{A}$$, $$\textcolor{#007cdb}{B}$$ and $$\textcolor{#00d9c2}{C}$$
such as:

$$\underbrace{(A2, B1, C3)}_{\text{one possible arrangement}}$$

In this case there's no need to try to apply the previous permutation or combination formula.

#### Calculation
The simplest way to calculate the possibility between asymmetric subsets is called the [rule of product][4].
I like the [Cartesian product][5] notation:

$$ \{ A\times B = \{ (a,b) | a \in A, b \in B \}$$

The product of two set $$A$$ and $$B$$ is another set composed of pairs $$(a, b)$$ where $$a$$ is an element of $$A$$ 
and $$b$$ one of $$B$$.
So for our three disjointed sets presented earlier, there's $$|\textcolor{#ea008e}{A}| \times |\textcolor{#007cdb}{B}| \times |\textcolor{#00d9c2}{C}|$$ possible permutations,
in our case it amounts to $$18$$.

## Words of wisdom

That's it! Let's use our new-found knowledge soon when working with multiple datasets, arrays or any
other type of weird data structures.

As a side note, I would prefer saying combinatronics 🤖 instead of combinatorics, it sounds way better in
my opinion. Feeling like we're in some sci-fi 80's scientific cliché.

[1]: https://en.wikipedia.org/wiki/Combinatorics
[2]: https://en.wikipedia.org/wiki/Permutation
[3]: https://en.wikipedia.org/wiki/Combination
[4]: https://en.wikipedia.org/wiki/Rule_of_product
[5]: https://en.wikipedia.org/wiki/Cartesian_product
[6]: https://en.wikipedia.org/wiki/Cardinality
[7]: https://www.mathsisfun.com/combinatorics/combinations-permutations-calculator.html
[8]: https://www.cuemath.com/algebra/difference-between-permutation-and-combination/
[9]: https://en.wikipedia.org/wiki/Exponentiation
[10]: https://medium.com/i-math/combinations-permutations-fa7ac680f0ac
