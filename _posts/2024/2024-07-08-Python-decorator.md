---
layout: post
title: Create your own Python decorator
color: rgb(3,140,23)
tags: [python]
---

Python decorators were introduced in [v2.4][1] (in 2003! 💾) and allow you to enhance the behaviour of a function or method.
When introduced in [PEP 318][1], the goal was to make to extend the `@classmethod` syntactic support to other functions.

It works as a higher order function that takes a function as input and returns a new function with extra behaviour.
Thus, you can significantly abstract part of the redundant code in the application thanks to some key decorators.
Let's go through som example in this article.

## Simple use case

### Syntax

Let's say we have a decorator `@decorator`, we can add it to our function `function` as follows:

```python
@decorator
def function(arg: str) -> str:
    return "output from " + arg
```

We are using the types hinting introduced in [PEP 484][3] to specify the input and output of the function.
The decorator will influence the result of the function.

### Implementation

Here is a simple implementation of a decorator that will wrap the input of the function with a string:

```python
def decorator(func):
    def wrapper(arg: str) -> str:
        return "decorated " + func(arg)

    return wrapper
```

The decorator is composed of a wrapper function that will take the argument of the function and execute the function with it.

> I used simpler argument, but you could also have the _wrapper_ function take on anything to pass to the decorated
function as `func(*args, **kwargs)`.

For example, in that wrapper method we prefix `decorated` to the output of the function.
Which leads to:

```shell
>>> function("input")
"decorated output from input"
```

I made a diagram as often it makes things clearer.

### Diagram

We have here the decomposed version of the code above with the _decorator_, its _wrapper_ function and the _function_
itself which the decorator has been applied to:

```mermaid
flowchart TD
    subgraph Decorator
     subgraph wrapper[Wrapper Method]
     end
    end

    Decorator -->|@decorator| function
    input -->|"(...)"| function
    function -->|"wrapper( function( input ) )"| output
    subgraph Execution
        input
    end
```

The decorator's behaviour can be summed as doing `wrapper( function( input ) )` where `wrapper` is the decorator's method.
And the _wrapper_ method is the one that can extend the function's behaviour as we talked about earlier.

We can use it to validate field input, add logging, cache results, escape errors, and so on! 
But it can do even more, let's take a look at some more advanced examples. 🤓

## Advanced examples

### Stacking decorator

You are not limited to just one decorator per function, you can stack them up to add multiple behaviours to a function.

Since the decorators are using wrapper function, you can see it as you would have using the [composition of functions][3] in math.
Where you can define a new function as the composition of two functions such as:

$$
\begin{aligned}
h: X \rightarrow Z, f: X \rightarrow Y, g: Y \rightarrow Z \\
\\
\forall x \in X, \space\enspace h = g \circ f \hArr h(x) = g(f(x))\\
\end{aligned}
$$

### Syntax

Let's have an example of stacking decorators, we'll have `@hello` and `@bye` decorators, that will prefix _hello_ and suffix
_bye_ to the given output of a function that returns a string. And of course, the decorator we've just created `@decorator`.
Since we can stack, let's stack'em up!

```python
@decorator
@hello
@bye
def function(name: str) -> str:
    return "dear " + name
```

Which will return something like:

```shell
>>> function("John")
"decorated hello dear John bye"
```

Not the most useful decorator, but you get the idea. 🥸 The order of decorators matter and the "furthest" one from the
function definition will be applied first.

### Decorating a lambda function

In the case of a lambda function, there's no `def` so you can't use the same `@decorator` syntax.

#### Syntax

But you can still use the decorator by calling it directly when defining the lambda function:

```python
function = decorator(lambda string: string)
```

So this `decorator` function, is the same as the one defined earlier and used as `@decorator`. 
It does look less fancy though, no `@` but it works.

```shell
>>> function("lambda")
"decorated lambda"
```

You don't have to redefine a specific function for lambda, you can use the same decorator as a regular function.

### Decorating with decorator maker

In the case where you need to create a decorator that takes arguments, you can use something is referred to as a
_decorator maker_ and used as a decorator itself.

As you could see previously the `@decorator` didn't require any parenthesis to be used.
To create a decorator that takes arguments, we will use the same concept as decorators, which is to create a wrapper around
a decorator and its wrapper.

#### Syntax

Let's enhance our `@decorator` to take an argument and prefix it to the output of the function:

```python
def decorator_maker(prefix: str):
    def generated_decorator(func):
        def wrapper(arg: str) -> str:
            return prefix + " " + func(arg)

        return wrapper

    return generated_decorator
```        

Which can now be used as a decorator with argument on top of a function:

```python
@decorator_maker("decorated")
def function(arg: str) -> str:
    return "output from " + arg
```

We wouldn't need an argument if we wanted to prefix the output with _decorated_, since it gives the same output as the
`@decorator` we defined earlier.
But now we can have multiple methods or functions decorated with the same kind of decorator with different arguments.

This can be useful for configuration, or passing a specific value to the decorator.

[1]: https://peps.python.org/pep-0318/
[2]: https://en.wikipedia.org/wiki/Function_composition
[3]: https://peps.python.org/pep-0484/