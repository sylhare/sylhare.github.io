---
layout: post
title: Software engineering refactor tips
color: rgb(242, 149, 68)
tags: [tips]
---

In this article, I wanted to talk about clean code, but I don't like the nearly religious symbolic meaning attached to 
it. There's not one way to "clean code", it's more a collection of experimented rule of patterns that can help you 
write clear (easy-to-read), maintainable, efficient code.

So instead of arguing on how you should be writing code, I'll demo the pattern I use to refactor the pieces of code that
I find lacking in some aspect.

For our examples, we'll use **Kotlin**. So it's obviously opinionated because what Kotlin does some other languages don't 
and vis versa. Nevertheless, the fundamental behind each tip should be useful independently of the language.

### Problem

For the example let's say we have a data class named `User` which is a domain entity used within our softwareL

```kotlin
data class User(val id: String?, val number: Int)
```

Data class usually don't hold much logic and are used to serve as plain data object (like [POJO] in java).
Now then we have the long obnoxious method that is designed to "validate" a user:

```kotlin
private fun validateUser(user: User): Boolean {
    if (user.id == null) {
        // To make sure it is not null
        return false
    }

    if (user.number % 2 == 0) {
        println("$user is lucky")
        val validSize = 10
        if (user.id.length == validSize) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}
```

I _hope_ you can spot that something is fishy here, and it's not only the validation design but also the code itself.
We will use this example and try to improve the code, building it upon the patterns that we will be demonstrating.

### Tests

Before any refactoring work, you should ensure that what you are touching is properly tested. Let's not break prod 
because of a refactoring frenzy. Once properly backed you will have more confidence in touching the code.

For small level functions like the one from our example, it should be covered through unit tests. In your case, the
targeted code to refactor might also be called at a higher level through an integration or end-to-end test. 
Just be sure to check that those exist.

````kotlin
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.DynamicTest
import org.junit.jupiter.api.TestFactory
````

To do the testing, we're using the [TestFactory] from _Junit v5_ to try all of our use cases. From what we see, the
validation design seems to follow those rules:

- Invalid when:
  - User's `id` is null
  - User's `id` is less than 10 characters
  - User's `number` is odd

So besides the happy path we can see 3 other paths where the user is invalid each corresponding to one `return` in the
function.
Now there are also two other use cases that should still be working based on how the code is written:

- Invalid when:
  - User's `id` is 10 characters long and `number` is odd
  - User's `id` is null but `number` is even

Let's display all of them in our test:

```kotlin
@TestFactory
fun multiplyIntTest() = listOf(
    listOf(User(null, 1), false),
    listOf(User("id", 1), false),
    listOf(User("id", 2), false),
    listOf(User("0123456789", 2), true),
    listOf(User("0123456789", 1), false),
    listOf(User(null, 2), false),
).map { (user, expectedResult) ->
    DynamicTest.dynamicTest("Test:  ${user as User} is valid $expectedResult") {
        assertEquals(expectedResult, validateUser(user))
    }
}
```

If you are not familiar with the codebase, those hidden criteria could either be "bugs" or un tested acceptance criteria
of the feature. Modifying the code without those cases passing may result in different behaviour during run time.

### Refactor pattern

Let's look at the different pattern we can spot in this code and see how they can be addressed.
There might some cases where you think it's necessary, in those cases ... think again, it might be part of a bigger
refactor. Anyhow, don't stay stuck on a piece of code forever if you don't see any way to improve it, either ask for
another set of eyes to help you or keep it as is for now.

Your capacity to write code evolves all the time, and each new piece of code you write should be better than the previous
one, so if you don't fix it now your future self might do it. It's alright if everything is not perfect 🤷‍♀️

#### Comments

Usually they are to be avoided, either because they are useless like the one in our problem or because they are a sign
that the way your function has been built is too complex.

The pattern to get rid of comments is non-trivial in particular situation where you deal with complexity. So here are 
some pointers:
- Extract pieces of code under a comment to a function with an appropriate name 
  - so you understand the code via the function's name
- Use better variable name
- Review the software's design
  - Bad design sometime needs to be re-think to remove the inherent complexity

As per the documentation as code type of project, I would not recommend it to an inexperience team as they mostly belong
in rigorous libraries. If it's not going to be maintained or reviewed, it's better not to write it at all. 

#### if / else returning Boolean

Usually if you see a condition being tested returning `true` or `false` you should be returning the condition itself:

```kotlin
// ❌ Condition on a boolean returning a boolean
if (isTrue) {
    return true
} else {
    return false
}

// ✅ Return the boolean directly
return isTrue
```

With that we should gain in clarity, 4 lines less to read, and it should be easier to follow with one less `if` in the 
way.

#### Single use variables

If you are going to create a variable that is going to be used only once, then don't do it. Variables are super useful
to describe objects and value throughout your code, but they do bear a "cognitive" cost. You have to keep in mind which
variable is corresponding to what where it has been instantiated/modified, so it's better not to over use them.

In the case where you think you need it, to make your code more readable or understandable, then [think harder][1].
Usually what you need to do is not extract the value, into a variable, but extract the logic leading to that value into
a method.

In the _Clean code_ book by Robert C. Martin, function returning boolean are directly assigned to a [variable][7].
Although it could make sense, it is to be considered with caution!

Let's explain it with a simplified example to show the unnecessary usage of variable and how it can be replaced by an
extracted function:

```kotlin
// ❌ Useless single use variable
fun validate() {
  val validSize = 10
  if (user.id.length == validSize) {
    return user
  } else {
    throw Exception()
  }
}

// ✅ Extracted behaviour
fun validate() {
  return user.id.length == 10
}
```

This example is using a skimmed version of our problem and may not be used as is.
But I didn't want to showcase the case where having `val hasValidId = user.id.length == 10` as presented in _Clean code_
would make sense since it may stop one's refactoring effort.

The duality in this example illustrates well that there's not only one way to improve your the code. And some pattern
may not apply depending on your goal and the current situation of the code. Refactoring is usually applying more than
one pattern.

#### Multiple return

The case of multiple `return` or having more than one "exit point". Historically this [pattern][5] has been seen in older
computing language where you explicitly need to manage the resources (i.e. C).
However, nowadays you see this "[exit early][6]" pattern coming into play because newer languages are more efficient at
collecting resources.

In my point of view, while I agree that the "exit early" pattern may make the code more readable in some cases, I find
in most cases it tends to crowd the method with unnecessary returns, let's showcase it in a simplified example:

```kotlin
// ❌ Have multiple return, returning the same value
fun validate() {
    if (!isNotNull) return false
    if (!isEven) return false
    if (!hasValidSize) return false
}

// ✅ Have all cases together
fun validate() {
    return isNotNull && isEven && hasValidSize
}
```

Unless you are returning a specific object or having a specific behaviour it's pointless to have different return for 
the same outcome.

In this example the "return early" does not apply, still it doesn't mean it never applies. Use your own judgement to
make the call. Unfortunately, it may happen that you find yourself in a situation where saving a few lines 
is not worth it in terms of clarity.

#### Encapsulation

This is the good part, [encapsulation][4] is when you restrict the access to internal data of an object. It goes with
implementing the method operating on the data directly within the object itself.

This mechanism is not unique to Object Orient Programming (OOP) since most data object in multiple languages and 
programming paradigm offer some form of encapsulation.

In our example, we see that all the checks done via the `validate` method on the `user` is made through information
already existing within the user. So we should be able to repatriate all those methods using the user's data within the
user itself.

```kotlin
// ❌ Using internal value outside the object
private fun validateUser(user: User): Boolean {
  if (user.number % 2 == 0) {
    // ...
  } else {
    // ...
  }
}

// ✅ Encapsulating the function
data class User(val id: String?, val number: Int) {
  fun isEven() = this.number % 2 == 0
}

private fun validateUser(user: User): Boolean {
  if (user.isEven()) {
    // ...
  } else {
    // ...
  }
}
```

Now is you continue refactoring, you will realize that everything in `validateUser` is actually using all the user's
internal information, so that the whole method could actually be encapsulated within the user itself.
Refactoring one step at a time allows you to slowly transform your code to a better state. Step by step, you should be
able to see patterns emerging as you refactor and choose which you would like to follow.

#### Naming convention

Naming things can be one of the most time-consuming part of writing code, because they deliver a lot of [value][3] in 
actively participating in the understanding of your code.

Beside the classic [naming convention][2] used in each language (camelCase, snake_case, ALL_CAPS), there's also some 
convention that can apply to any language.

For in example in our use case:

```kotlin
// ❌ Method returning a boolean shouldn't be named with a verb
fun validate(): Boolean

// ✅ Use a question format: isValid -> true or false
fun isValid(): Boolean
```

But there's more than that rule, let's give some more other pointers for better name:

  - **Avoid long name as they hard to read**
    - ex: let's not have that `isTheUserIdAndNumberValid`, keep it simple `isValid` if possible
  - **Avoid repeating words that can be deduced from the context**
    - ex: having a `productName` inside a `Product` class, `name` should be sufficient 
  - **Avoid contracting words as they can create confusion for un initiated people**
    - ex: using `usr` instead of `user` 
  - **Avoid unnecessary verbs which may be redundant**
    - ex: using `user.getName()` instead of `user.name()`, we know we're getting the name
  - **Ensure you use a coherent naming convention within your project and remove duplicated names**
    - ex: having a `UserService` interface with a `UserServiceImpl` implementation, either you don't need the interface 
      or you should find a better name.

As long as everybody on the team gets the same understanding from reading your code then it should be good. 
An "anti-pattern" would be to keep on renaming everything which may cause people to get lost into an ever-changing codebase.
Also make sure that if you rename a variable everything linked to it gets renamed as well (in strings, tests, file name),
don't break prod with a typo.

### Conclusion

After looking at all the above pattern for refactoring we can now use and adapt them to our problematic piece of code,
let's see what one of the approach could be:

```kotlin
data class User(val id: String?, val number: Int) {
    fun isValid() = this.id?.length == 10 && this.number % 2 == 0
}
```

This new implementation passes through all of our test cases, calling `user.isValid()` instead of using the `validateUser`
method which mo longer exists. That's now 18 lines written with 1.
Now if you are wondering, "_is it the best code ever?_" the answer is "_it depends_", because there's not just one way
to write code. At this point in time, I don't see any other pattern I could apply, so I stop the refactoring here 
considering the state of the code as good enough. 

It's important to keep a good balance time / benefits when you refactor, also in this case, the design behind this 
validation seems a bit absurd (checking the length and if it's odd or even). 
Keeping an alignment between the business requirements and the working software design is crucial for long term 
maintainability.


[POJO]: https://en.wikipedia.org/wiki/Plain_old_Java_object
[TestFactory]: https://junit.org/junit5/docs/5.5.1/api/org/junit/jupiter/api/TestFactory.html
[1]: https://techbeacon.com/app-dev-testing/why-unnecessary-variables-are-bad-your-code "variable"
[2]: https://en.wikipedia.org/wiki/Naming_convention_(programming) "naming convention"
[3]: https://dmitripavlutin.com/coding-like-shakespeare-practical-function-naming-conventions/
[4]: https://en.wikipedia.org/wiki/Encapsulation_(computer_programming)
[5]: https://en.wikipedia.org/wiki/Structured_programming
[6]: https://medium.com/swlh/return-early-pattern-3d18a41bba8 "return early"
[7]: https://stackoverflow.com/questions/58196065/creating-single-use-intermediate-variables
