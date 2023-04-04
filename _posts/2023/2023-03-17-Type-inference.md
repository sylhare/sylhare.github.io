---
layout: post
title: Type inference 🏭 industry standards
color: rgb(166, 65, 28)
tags: [tips]
---

Type inference is the ability of a language to deduce the type of expressions at compile time. 
Languages such as [Kotlin][1] or [Typescript][2] do support it by default while other like [Java][3] are looking into it.

What it means is that type inference allows you to omit the type annotation of variable. But this feature can be quite
dividing for users, as some would have argument in favor or against it. So in this article I wanted to look in details
the type inference advantages, its weak spots what the industry is saying and find out what I should be doing.

## Type inference

Type inference for typescript, in this [example][2]:

```ts
// type inferred
let x = 3;
// let x: number = 3
```

Type inference can help remove some visual clutter around the types.

However, that does not mean that since type can be inferred, you should remove them all. They are used in typed languages
after all, so the types should remain in the code! Inferrable types is not a silver
bullet and is known to fail short in some occasion. Which we'll try to demonstrate in the next part.

## Weak spot

The principal weak spot of type inference is when it doesn't work or get it wrong, and usually that's on generic 
invocation or with dynamic types. In those case inferable type are never recommended. But let's see what it means.

### Dart

In Dart, the type can't be inferred everywhere, and they do tell you in the guideline to add it when necessary. For
example here with Generic invocation where the type can't be inferred successfully.

```dart
// ✅ Good - Specify the generic type
var playerScores = <String, int>{};
final events = StreamController<Event>();

// ❌ Bad - Raw use of parameterized class
var playerScores = {};
final events = StreamController();
```

The raw use of parametrized class works but is recommended against since it can be source of ambiguous calls and bugs.

### Kotlin and JVM

Kotlin is based on the JVM, and nowadays, Java is just following all the good stuff from Kotlin anyway. 🙃
Plus there's an interesting [article][8] by Stephan Rauh around the consequences of type inference if adapted to java,
which I can use for Kotlin as well. Here is the example:

```java
class Jep286 {
  String getId() {
    return "id";
  }

  boolean contains(Set<Long> ids) {
    return ids.contains(getId());
    // Set<Long>' may not contain objects of type 'String'
  }
}
```

If we were to create a variable for `getById` with inferrable types, it would still "work" but always return false. 
Why? Because the `contains` method on `Set` accept any `Object` and a `String` is unlikely to be in a `Set<Long>`. 
A simple test would help find the problem, and in most case the IDE would highlight the code with a warning message
such as:

- From IntelliJ: _'Set&lt;Long&gt;' may not contain objects of type 'String'_

So in all fairness even if the code compiles, the problems does not seem to be the inferrable type. Let's try it out in
Kotlin by converting the code, here is what we have:

```kotlin
fun hasId(ids: Set<Long>): Boolean {
    return ids.contains(getId())
// Type inference failed. The value of the type parameter T should be mentioned in input types (argument types, receiver type or expected type). 
// Try to specify it explicitly.
}

fun getId(): String {
    return "id"
}
```

I am using Kotlin **1.4** and so far it seems to work and compile, however contrary to Java there's a warning by the 
compiler:

> Type inference failed.<br> 
> The value of the type parameter T should be mentioned in input types (argument types, receiver type or expected type).<br>
> Try to specify it explicitly..

Which is the same message as the warning my IDE gives, plus the special mention _This will become an error in Kotlin 1.5_,
the smart potatoes at Kotlin have anticipated the issue and will now make bad inference failure a compile-time error!

### Typescript

In typescript, type inference for object literal can be tricky and cause compilation issue or bugs. I liked this example
from [effective typescript][9]. Let's say we have an interface:

```ts
interface Toy {
  id: string;
  name: string;
  price: number;
}

function play(toy: Toy): void { 
  // ...implementation details
}
```

If we define an object literal from that interface, to pass to ur `play` function, we should specify the type at the
creation, such as:

```ts
// ✅ Good - Specify the type on object literal
const elmo: Toy = { 
  name: 'Tickle Me Elmo', id: 'toy-id-1', price: 28.99
};

// ❌ Bad - No types on object literal 
const furby = {
  name: 'furby', id: 'toy-id-2', price: 29.99,
}
```

In this case _elmo_ will be considered as a `Toy` and if the interface change, then the object needs to change as well.
Otherwise, you will get a typescript error such as:

- **TS2741**: _Property '...' is missing in type '{ ... }' but required in type 'Toy'_
  - When you add a new property on `Toy` but not on the object `elmo`
- **TS2345**: _Argument of type '{ ... }' is not assignable to parameter of type 'Toy'_
  - When you try to pass an untyped object literal that looks like a `Toy` but is not to a function that accept `Toy`.
- **TS2322**: _Type '{ ... }' is not assignable to type 'Toy'. Object literal may only specify known properties, and '...' does not exist in type 'Toy'._
  - When you try to add a new property in a `Toy` typed object literal that is not on `Toy`.
 
Even though it can be inferred, without types on object literal, it can quickly lead to error or compile-time errors.
Adding the type, makes it faster to refactor and detect issues.

## Industry standard

### Typescript

Type inference recommended: ✅

For Typescript, there is a tslint rule [no-inferrable-types][4] which disallow explicit type annotation 
for `boolean`, `number` or `string`. What makes it worth considering (knowing that you can find linting rule for anything)
is that it is part of the recommended linting rule.

Which means that type inference at least for primitive types is recommended. The reasoning is that explicit typing on 
inferable types makes it:

1. More verbose / harder to read
2. Prevent TypeScript from inferring specific [literal types][5] (e.g. `10` instead of `number`)

Dan Vanderkam in his book [effective TypeScript][9] on how to use typescript _well_ goes even further by stating that 
inferable types should be removed from your code to avoid cluttering. However, there are still some nuance where the
type should still be specified even when it can be inferred (ex: For object literal). In the Google Typescript 
[style guide][13], type inference is left up to the author's choice and would be necessary only if it benefits readability
on complex method calls.

### Dart

Type inference recommended: ✅

For [Dart][6] a UI language developed by Google, and they have a very complete [design guideline page][7]. In which you 
find several rules in favour of type inference such as:
- DON’T redundantly type annotate initialized local variables.
  - _Omitting the type focuses the reader’s attention on the more important name of the variable and its initialized value._
- DON’T annotate inferred parameter types on function expressions.
  - _Anonymous functions are almost always immediately passed to a method taking a callback of some type. Dart infers the function’s parameter types based on the expected type_
- DON’T write type arguments on generic invocations that are inferred.
  - _If an invocation’s type argument list is correctly inferred with the types you want_

There are more rules, but it goes really into the language details which might go beyond the point. However, I would like
to nuance, type inference is recommended in places where it is known to help reduce visual clutter, it doesn't mean it
should be used all the time and everywhere.

The guidelines do specify cases where types should be specified, when it can't be inferred successfully or when the type
is actually needed (Inferable types does not mean remove all types everywhere).

### Kotlin

Type inference recommended: ✅

Ok, there's no clear recommendation, however when you look at the effort being made behind [type inference][1] in Kotlin
it is clear that it has been well-thought-out in the language genesis. 

The fact that Kotlin is more concise (around [40% cut in lines of code][10]) and that all the [basic syntax][11] revolves 
around the usage of inferred types, you can see that it is intended to be used.

And from what we have seen in the weak spot session, they do everything necessary to make sure that if ever an inferred
type is yielding an error it will break during compile time, so you feel safe using it.

## Conclusion

Not all languages using type inference are using the same strategy to prevent errors and those are most likely due to
bad design or bad usage from the user and not the feature or the language itself.

Depending on the language, there's no black and white answer, regarding type inference. It's a feature that do remove
some redundancy and clutter in the code. However, there are some opposite views regarding those benefits, such as
Austin Henley who argue the opposite and vouch for [explicitness][12].
However, I have to admit that without the IDE while reviewing PR on GitHub it can be harder to get the inferred type.
I hope that at least to a degree when can agree that on a poor quality piece of code, type inference or not, fixing the
design, the bad naming, bad whatever is the main factor to reduce cognitive load. 

To be fair on a nice piece of software, I do feel like type inference makes up for the best code, but that would be my
own subjective view.

We can remain flexible, use type inference where it makes sense and keep the type annotation where it is needed.
The [Dart guideline][7] is on that sense very complete, and while not all examples apply to everything, I do like the approach.


[1]: https://kotlinlang.org/spec/type-inference.html
[2]: https://www.typescriptlang.org/docs/handbook/type-inference.html
[3]: https://openjdk.org/jeps/286
[4]: https://typescript-eslint.io/rules/no-inferrable-types/
[5]: https://www.typescriptlang.org/docs/handbook/literal-types.html
[6]: https://dart.dev/overview
[7]: https://dart.dev/guides/language/effective-dart/design#dont-redundantly-type-annotate-initialized-local-variables
[8]: https://www.beyondjava.net/adding-type-inference-to-java-good-or-evil
[9]: https://effectivetypescript.com/2020/04/28/avoid-inferable/
[10]: https://kotlinlang.org/docs/faq.html#what-advantages-does-kotlin-give-me-over-the-java-programming-language
[11]: https://kotlinlang.org/docs/basic-syntax.html
[12]: https://austinhenley.com/blog/typeinference.html
[13]: https://google.github.io/styleguide/tsguide.html#type-inference
