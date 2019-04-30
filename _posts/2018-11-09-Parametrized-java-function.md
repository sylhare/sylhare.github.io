---
layout: post
title: Publish a gem
color: #E08119
tags: [java]
---


I wrote a post on [stackoverflow](https://stackoverflow.com/questions/2186931/java-pass-method-as-parameter/53219950#53219950) on how to use `java.util.function.Function` for simple method as parameter function. 

Here is a simple example:

```java
import java.util.function.Function;

public class Foo {

  private Foo(String parameter) {
    System.out.println("I'm a Foo " + parameter);
  }

  public static Foo method(final String parameter) {
    return new Foo(parameter);
  }

  private static Function parametrisedMethod(Function<String, Foo> function) {
    return function;
  }

  public static void main(String[] args) {
    parametrisedMethod(Foo::method).apply("from a method");
  }
}
```

Basically you have a `Foo` object with a default constructor. A `method` that will be called as a parameter from the `parametrisedMethod` which is of type `Function<String, Foo>`.

- `Function<String, Foo>` means that the function takes a `String` as parameter and return a `Foo`.
- The `Foo::Method` correspond to a lambda like `x -> Foo.method(x);`
- `parametrisedMethod(Foo::method)` could be seen as `x -> parametrisedMethod(Foo.method(x))`
- The `.apply("from a method")` is basically to do `parametrisedMethod(Foo.method("from a method"))`

Which will then return in the output:

```bash
>> I'm a Foo from a method
```

The example should be running as is, you can then try more complicated stuff from the above answers with different classes and interfaces.
