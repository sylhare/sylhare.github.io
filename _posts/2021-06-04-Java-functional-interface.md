---
layout: post 
title: Java functional interface 
color: rgb(214, 80, 118)
tags: [java]
---

Java's [functional interface](https://docs.oracle.com/javase/8/docs/api/java/lang/FunctionalInterface.html) is available
since v1.8. It allows you to leverage lambda function's possibilities.

We already talked about [parametrized java function]({% post_url 2018-11-09-Parametrized-java-function %}) where we were
also utilizing the lambdas. So to add a twist, we're going to add some generics into the mix.

## Generics

Java is a typed language, everything should have a type. Generics, or [_generic
type_](https://docs.oracle.com/javase/tutorial/java/generics/types.html) is a generic class or interface that is
parameterized over types. 

Without going into details, you may have seen `<T>` in java like:

```java
public class Box<T> {
    public T exampleMethod() { ...}
}
```

Where **T** stands for type and can be anything for example `new Box<String>()` is a Box object of a String (meaning all
T inside box will be considered as String).

You may also have seen it in the [Option〈T〉]({% post_url 2021-04-21-Optional-with-java%})article,
it's the same **T**! ... Mind blown 🤯 ? Not really, it's just java.

[Generics](https://en.wikipedia.org/wiki/Generics_in_Java) adds a bit of abstraction on the types allowing to make (
compile-time safe) methods and objects operating on various types.

## Generics with Lambda

To work with lambda, you need functional interface because `() -> T` is not an accepted type in Java. So you need your
functional interface to actually define and use your lambda in methods.

### Create a Generic functional interface

You can define one like:

```java
@FunctionalInterface
public interface GenericSupplier<T> {
    T doStuff();
}
```

Functional interfaces have only one method that can be called. Calling them will automatically call the lambda function.

### Use your generic functional interface

Let's say you have a very simple lambda method, you can define it like:

```java
public GenericSupplier<Boolean> supplier=()->true;
```

Now you want to create a generic method that will take your generic functional interface:

```java
public <T> T genericMethod(GenericSupplier<T> supplier) {
    return supplier.doStuff();
}
```

Note that you have `<T> T` at the beginning of the method:
- The first `<T>` means that it's a generic method of type T that is used to define the T of the `GenericSupplier<T>`
- The second `T` is the return type and could be anything else like `String` or `Optional<T>`.

### Test your generic lambda method

If you want to test it you can run it like (having the previous bits of code in a GenericLambda class):

```java
@Test
public void genericLambdaMethod(){
    private final GenericLambda genericLambda=new GenericLambda();
    assertTrue(genericLambda.genericMethod(()->true));
    assertTrue(genericLambda.genericMethod(genericLambda.supplier));
}
```

See that you can pass the supplier as defined or directly the anonymous lambda within the method, and it will be
triggered automatically. You can also be creative like:

```java
@Test
public void genericLambdaMethodOptional(){
    GenericLambda.GenericSupplier<Optional<String>>supplier=()->Optional.of("Hello");
    Assertions.assertEquals("Hello",genericLambda.genericMethod(supplier).orElse("fail"));
}
```

Where the lambda function returns an `Optional<String>` that we can leverage.

Generics allow to be very flexible with our lambda and are a necessary fit in your refactoring toolbox. Functional
interface made me think of `typealias` in Kotlin where you can simplify types with an alias, but this is mostly cosmetic
as you can pass lambda as type without interface in Kotlin.
