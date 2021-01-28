---
layout: post
title: Simplified Big O notation for time complexity
color: rgb(0, 114, 181)
tags: [math]
---

[Big O](https://en.wikipedia.org/wiki/Big_O_notation), is a mathematical notation use in computer science to describe 
the behaviour of an algorithm. Usually either space (its memory footprint while running) or time complexity.

## Why Big O notation

The Big O we'll be looking at is a simplified version, and how to quickly calculate it. 
It is something you can enjoy [mastering](https://yourbasic.org/algorithms/big-o-notation-explained/), if you need to build particularly efficient algorithm. 
But for most of people, we just need a general idea of how slow our algorithm. 

Big O notation is really useful when you know you'll have a tone of data to process,
then you'll be interested to have am algorithm that performs well on average and not too bad at worst.

It's like you would not want to use a chainsaw to cut flowers, you can do it manually. 
But when it comes to tree, the chainsaw's far more useful. 


## The simplified version

Or basically how to read it. You may have seen $$\Omega$$, $$O$$ and $$\Theta$$ in term of algorithm time complexity.
Basically: 
- $$\Omega$$ is the time for best case, 
- $$O$$ for the worst case
- $$\Theta$$ is basically of both $$\Omega$$ and $$O$$ notation

Nowadays, Big O is mostly use to describe as tightly as possible the algorithm.

There's an infinite number of Big O notation, and you need to understand the concept to grasp it fully. 
However, there are some notation that you'll see more often than others. Here is what to consider:
 - $$1$$ usually means it's a constant time
 - $$N$$ in the notation usually mean the number of element (like in an array)
 - We consider the notation in term of "power" ($$2N$$ is considered equal as $$N$$ but is faster than $${N}^{2}$$ and slower than $${\mathrm{log}}\left(N\right)$$)
 - Any other letter, means there's two operation with different size (like on will be $$A$$, and the other $$B$$)
 
So let's review the main ones in example.

## Examples

Looking at the main [time complexity](https://en.wikipedia.org/wiki/Time_complexity) in those examples.

### Constant Time

For a constant time $$O({1})$$:

```kotlin
fun constantTime() {
    repeat(100000) {
        print("Big O(1)")
    }
}
```

Sure doing that 100000 times is a bit long and tedious, but the `constantTime()` function will always execute it the same way.

### Linear Time

For a $$O({n})$$ time:

```kotlin
fun notConstantTime(n: Int) {
    repeat(n) {
        print("Big O")
    }
}
```

This time you can see that `notConstantTime(n)` execution time will vary depending on n.

### Polynomial time

For $$O({n}^{2})$$ time:

```kotlin
fun squareTime(n: Int) {
    for (i in 0..n) {
        for(j in 0..n) {
            print("Big O - [$i, $j]")
        }
    }
}
```

So basically you go through a range that goes from 0 to n, and each time you go through the same range from 0 to n.
In the end `squareTime(n)` execution time will be n times n.

Then we have two cases from this one:
  - With an array of size $$n$$ and an array of size $$10000$$. Then the time complexity stays $$O(n)$$ because we drop constants

```kotlin
(0..n).forEach{ i -> (0..10000).forEach{ j-> print("Big O - [$i, $j]")}}
```

  - With two arrays of size $$a$$ and $$b$$, the time complexity is $$O(ab)$$ because $$a$$ and $$b$$ are different.
  
```kotlin
(0..a).forEach{ i -> (0..b).forEach{ j-> print("Big O - [$i, $j]")}}
```

### Logarithmic time

For $$O({\mathrm{log}}\left(n\right))$$ time:

```kotlin
fun logTime(n: Int) {
    while (n >= 2) {
        println("Big O - [$n]")
        n /= 2
    }
}
```

So this one is logarithmic, because each time you do an iteration n is decreasing twice.
It is logarithmic on [base 2](https://courses.lumenlearning.com/waymakercollegealgebra/chapter/convert-between-logarithmic-and-exponential-form/), for example:
   - If $$n = 8$$, then there will be $$3$$ iteration.
   - And we have $${\mathrm{log}}_{2}\left(8\right)=3$$ because $${2}^{3}=8$$

$${\mathrm{log}}_{b}\left(x\right)=y\Leftrightarrow {b}^{y}=x,\text{}b>0,b≠ 1$$

## To go further

Basically, to find the good $$O$$ notation, you need to pay attention to three things mostly:
  - The number of loops (multiplying inner loops)
  - The size of the data (is it one size n, multiple size a, b, ..)
  - How you go through the data (is it fixed amount of loop, or does it change like for the logarithmic time example)
  
This will help you improve your algorithm, and if you want to know even more, there lots of [examples](https://stackoverflow.com/a/36877205/7747942)
out there and tones of good explanations.
