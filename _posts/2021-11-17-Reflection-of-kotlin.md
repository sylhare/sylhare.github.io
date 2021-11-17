---
layout: post
title: Runtime reflection of Kotlin
color: rgb(150,50,250)
tags: [kotlin]
---

Today let's set up the [kotlin-reflect][7] dependency and look at some jvm Java/Kotlin reflection.
You might set up a small project for that, or have a look to the [examples][8].

Make sure your gradle is set up with the right dependency:

```kotlin
dependencies {
    implementation(kotlin("stdlib"))
    implementation("org.jetbrains.kotlin:kotlin-reflect")
}
```

With Kotlin v1.4.0 or older, so you can have access to the latest features (like [typeOf][6])!

But before we dig into the world of kotlin reflection, let's have a look at some common classes you may have encountered in your Kotlin journey.
We'll then see how we can use reflection to bring those classes to instances.

## Kotlin

### String

The [String][4] is a very basic class:

```kotlin
public class String : Comparable<String>, CharSequence { .. }
```

As its class definition states, it is a character string like `"abc"`, one very basic object
that also exist under _[java.lang.String][5]_ and can be referred as a primitive type.

Once created a String is immutable (for many practical reasons), 
when you think you change it, a new String is in fact created.

### Collections

#### List
Due to generic type erasure List class has a single implementation for all its generic instantiations.
That's why you can't `List<String>::class` because the type is not reified.

```kotlin
public interface List<out E> : Collection<E>
```

Although the interface is defined in _kotlin.collections.List_, 
the actual implementation of lists in Kotlin relies on ArrayList. Meaning that you have:

```kotlin
listOf("A", "B")::class // class java.util.Arrays$ArrayList
List::class             // class kotlin.collections.List
```

The `$` is used by the jvm for generated sources as per the [JLS][9] (Java Language Specification).

#### EmptyList
EmptyList is an internal object of the Kotlin Collection implementation,
It is returned when you call `listOf()` with no elements, it goes in the background and call the _emptyList_ method:

```kotlin
@kotlin.internal.InlineOnly
public inline fun <T> listOf(): List<T> = emptyList()
```

EmptyList is in CollectionsKt, which returns a list of [Nothing][3] to represent a value that never exists.
It has no instance:

```kotlin
internal object EmptyList : List<Nothing>, Serializable, RandomAccess { .. }
```

It's an immutable object so its use might be limited.
Since it's from Kotlin internal, EmptyList type does not exist in java.

### Arrays

#### <code>arrayOf()</code>

One difference between Array and List, is that you can do `Array<String>::class` because the type is kept.
When creating an Array in Kotlin, the first reflex is _arrayOf_ one of Kotlin useful built-in:

```kotlin
public inline fun <reified @PureReifiable T> arrayOf(vararg elements: T): Array<T>
```

Here you can see that `T` is prefixed with the `reified` word.
The [reified][1] type parameter means that you have access to the class of T at compile-time and can access it like `T::class`.
That's why you often see _"UNCHECKED_CAST"_ warning around arrays, because the generic T is considered as a class in the `Array<T>::class` notation.

In opposition to `EmptyList`, there are no `EmptyArray` because Array is based on the java type `java.lang.String[]`.

#### <code>Array</code>﹤T﹥

The [Array][2]'s constructor takes two parameters, the size and an `init` lambda function that return the value for an array
element its given index

```kotlin
public class Array<T> {
    public inline constructor(size: Int, init: (Int) -> T)
    // ...implementation details
}
```

Let's give it a try and instantiate our own Array.
We'll set the size to `3` and have an init function such as `i: Int -> i`:

```kotlin
val array: Array<Int> = Array(3) { i: Int -> i } 
// which gives [0, 1, 2]
```

We realize that this init function we've chosen is just returning the index and that's it. Lame.
Though with other lambda function you could get creative and have some interesting array.
Using reflection to call a constructor like that is not an easy fit, even with arguments that should be working:

```kotlin
assertThrows<Error> { 
    Array<Int>::class.constructors.first().call(3, { i: Int -> i }) 
}
```

I didn't see more than one constructor in the Array class, so I expected to use it like we did before to instantiate one by reflection.
However, this throw a _kotlin.reflect.jvm.internal.KotlinReflectionInternalError_!

## Reflection

### KClass

A [KClass][10] is a kotlin class that you get using for example `List::class` during runtime.
It is the most basic reflection feature.

```kotlin
val k: KClass<*> = String::class
val j: Class<*> = String::class.java
```

The java _Class_ and the kotlin _KClass_ are not the same.

### Ktype

A [KType][12] represents a type, it is an important feature for reflection with generic types (e.g. `T`). 
A type can be:
- An actual class with optional type arguments (The type of `String` is the class `String`)
- A type parameter of some declaration (Like a `List<T>` where T is a generic type)
- Nullable or non-nullable (Both `T` and `T?` are accepted)

```kotlin
private fun <T> nullableType(): List<T?> {
    return listOf()
}
```

We talked about reified type, where you can't do `List<String>::class`.
However, you can do `typeOf<List<String>>()` to get the KType.

```kotlin
val kt: KType = String::class.createType()
val jt: Type = String::class.createType().javaType
```

The java _Type_ and the kotlin _KType_ are not the same.

### KClassifier

The [KClassifier][13] is what the type is based on which can be either a class or a type parameter.
On the type, you have access to the KClassifier using:

```kotlin
val ks: KClassifier? = typeOf<String>().classifier
```

In this case it returns `String` but for the type `List<String>` the classifier would return the `List` KClass.

## Conclusion and Examples

Now that we went through the reflection basics with KClass, KType and KClassifiers for the Kotlin Classes
described earlier.
Let's have some examples for the three Kotlin objects presented earlier.
Also for the [demonstration][8], the java class and type (`::class.java.typeName`) are obtained with the kotlin reflection engine.

### [String](#String)

For String, like most simple objects, it stays basic:
- KType: _kotlin.String_
- KClass: _class kotlin.String_
- KClassifier: _class kotlin.String_
- Java Type: _java.lang.String_
- Java Class: _class java.lang.String_

That is what you would except when no generics are involved.

### [List](#List)

For a List, like a list of String. You see that not everything is kept at runtime:

- KType: `kotlin.collections.List<kotlin.String>`
- KClass: _class java.util.Arrays$ArrayList_ (using an instantiated list) 
  - It's not _kotlin.collections.List_ because it uses ArrayList internally 
  - The `String` is not in the class definition
- KClassifier: _class kotlin.collections.List_
  - It is not map to an actual class (_kotlin.collections.List_ is an interface)
- Java Type: _java.util.ArrayList_
- Java Class: _class java.util.Arrays$ArrayList_
  - Like the KClass (which is not common).
  
> Kotlin specific internal classes do not have corresponding java classes

In the case of `EmptyList` the java class does not exist and is replaced with _class kotlin.reflect.jvm.internal.KClassImpl_.
In this case creating a new instance will throw a kotlin reflect internal error.

### [Array](#Arrays)

For an Array of String, its behaviour is different from a list:

- KType: `kotlin.Array<kotlin.String>`
  - With argument type `typeOf<Array<String>>().arguments[0].type!!` as _kotlin.String_
- KClass: _class kotlin.Array_
- KClassifier: _class kotlin.Array_
- Java Class: _class [Ljava.lang.String;_ 
  - [Arrays][11] are dynamically created and may be assigned to variables of type Object (as superclass).
- Java Type: _java.lang.String[]_
  - In java the array's type is written `T[]` i.e. "String" in this case. 
  
Because Arrays are dynamically generated, the reflection and cast can be tricky because it will be converted
to an Array of object first _java.lang.Object[]_, then you need to cast to the right type.
To remedy we have `java.lang.reflect.Array` in the java reflection engine to make new instance from the type:

```kotlin
@Suppress("UNCHECKED_CAST")
private inline fun <reified T> createArrayOfGeneric(): Array<T> {
    return java.lang.reflect.Array.newInstance(typeOf<T>().javaType as Class<*>, 10) as Array<T>
}
```

The other Kotlin alternatives that I tried throw _ClassCastException_ when trying to cast a _[Ljava.lang.Object;_ to a _[Ljava.lang.String;_
like in the example.

[1]: https://kotlinlang.org/docs/inline-functions.html#reified-type-parameters "Kotlin reified"
[2]: https://github.com/JetBrains/kotlin/blob/master/core/builtins/native/kotlin/Array.kt "Kotlin Array"
[3]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html "Kotlin Nothing"
[4]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/ "Kotlin String"
[5]: https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/String.html "Java String"
[6]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/type-of.html "typeOf"
[7]: https://kotlinlang.org/docs/reflection.html "kotlin-reflect"
[8]: https://github.com/sylhare/RandomK/search?q=ShowcaseTest "Post example"
[9]: https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8 "JLS $"
[10]: https://kotlinlang.org/docs/reflection.html#class-references "Kotlin KClass"
[11]: https://docs.oracle.com/javase/specs/jls/se7/html/jls-10.html "JLS Arrays"
[12]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/ "Kotlin KType"
[13]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-classifier.html "Kotlin KCassifier"
