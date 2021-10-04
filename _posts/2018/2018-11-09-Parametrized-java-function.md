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
}
```

Basically you have a `Foo` object with a default constructor. 
A method `bar` that will be called as a parameter from the `parametrisedMethod` which is of type `Function<String, Foo>`.

- `Function<String, Foo>` means that the function takes a `String` as parameter and return a `Foo`.
- The `Foo::bar` correspond to a lambda like `x -> Foo.bar(x);`

Let's see how we can use our newly parametrized method:

```java
public static void main(String[] args) {
  parametrisedMethod(Foo::bar).apply("from a method");
}
```

The syntax is a bit weird, so let's dissect it a bit:

- `parametrisedMethod(Foo::bar)` could be seen as:
  ```
  x -> parametrisedMethod(Foo.bar(x))
  ```
- The `.apply("from a method")` is basically to do:
  ```
  parametrisedMethod(Foo.bar("from a method"))
  ```

Now if you run the `main()` it should print out:

```bash
>> I'm a Foo from a method
```

We can see that it took the constructor plus the applied string and printed it all.
Now that you have that Baseline you can create more complicated `Function` with your own types.

If you liked that consider _upvoting_ the original [answer](https://stackoverflow.com/questions/2186931/java-pass-method-as-parameter/53219950#53219950) on stackoverflow you lovely sausages. 🌭❤️
