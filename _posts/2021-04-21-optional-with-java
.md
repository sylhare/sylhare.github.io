---
layout: post
title: Optional&lt;T&gt; with Java
color: rgb(249, 103, 20)
tags: [java]
---

Optional is available since Java 8 in [`java.util`](https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html).
An optional is like a wrapper for an object with some extra methods to execute based on the existence of the value.

It is close looking to the `?` elvis operator in [Kotlin]({% post_url 2019-12-02-Kotlin-101 %}) but in a more verbose way.
I have created simple code examples available in these [classes](https://github.com/sylhare/Java/blob/master/src/Example/src/main/java/option).

## Implementation

There are two types of nullables, ones that blows and ones that won't. 💥
Optional that can blow when the optional value is null can be created with:

```java
Optional<String> value = Optional.of(externalDependency.supplyData());
```

You may then do a check to make sure the Optional has a value, and then get it to do something with it like:

```java
If (value.isPresent()) doSomething(value.get());
```

I am having doubt where it can be actually used, maybe with you get an empty Optional instead of null in the code.
It may depend on programming style.

On most of my use case I would want to have an Optional to handle the _null_ case and not throw an exception.
If you want an `Optional` that can digest a null prefer this implementation:

```java
Optional<String> = Optional.ofNullable(externalDependency.supplyData());
```

The `Optional`'s value may be null at this point.
> Doing a `.get()` on an Optional with a null value will trigger a `NoSuchElementException` exception!

So let's see how we can take it even further.

## Stack up

So here is how you can actually benefit from them, it works for both optionals.
You can stream and stack on top of each of them.

```java
public String getData() {
    return Optional.ofNullable(externalDependency.supplyData())
            .map(String::toUpperCase)
            .orElse(null);
}
```

From this example:
 - The mapping will be applied only if the `Optional`'s value exists.
 - The `orElse()` is to return a default value when the Optional is empty.

That's it for now!
