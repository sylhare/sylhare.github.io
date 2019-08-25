---
layout: post
title: Parametrized java function
color: rgb(249, 103, 20)
tags: [java]
---


I wrote a post on [stackoverflow](https://stackoverflow.com/questions/2186931/java-pass-method-as-parameter/53219950#53219950) 
on how to use `java.util.function.Function` for simple method as parameter function. 

Here is a simple example:

```java
import java.util.function.Function;

public class Foo {

  /** Foo constructor **/
  private Foo(String parameter) {
    System.out.println("I'm a Foo " + parameter);
  }

  /** Static method `bar` from Foo class **/
  public static Foo bar(final String parameter) {
    return new Foo(parameter);
  }

  private static Function parametrisedMethod(Function<String, Foo> function) {
    return function;
  }

  public static void main(String[] args) {
    parametrisedMethod(Foo::bar).apply("from a method");
  }
}
```

Basically you have a `Foo` object with a default constructor. 
A method `bar` that will be called as a parameter from the `parametrisedMethod` which is of type `Function<String, Foo>`.

- `Function<String, Foo>` means that the function takes a `String` as parameter and return a `Foo`.
- The `Foo::bar` correspond to a lambda like `x -> Foo.bar(x);`
- `parametrisedMethod(Foo::bar)` could be seen as `x -> parametrisedMethod(Foo.bar(x))`
- The `.apply("from a method")` is basically to do `parametrisedMethod(Foo.bar("from a method"))`

Which will then return in the output:

```bash
>> I'm a Foo from a method
```

The example should be running as is, 
you can then try more complicated stuff from the above answers with different classes and interfaces.
