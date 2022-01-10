---
layout: post 
title: How to @Spy a mocking dependency
color: rgb(86, 198, 169)
tags: [java]
---

Let's say you are doing some refactoring. You have a big class that is doing too many things, and you want to carve a
piece out into its own class doing its own thing. Following the responsibility pattern.

> A class should be defined around its responsibility and wielded information

Here I am going to talk about:

- `ComplexService`: which is the old big class with many dependencies (such as databases, bus, caches, other classes).
- `SimpleService`: the piece extracted from the complexService that will do its very specific thing.

Think of it as having a Car class that does it all (which is the anti-pattern
in [Object oriented programming](https://en.wikipedia.org/wiki/Object-oriented_programming) we will be tackling here), 
I am going to take some of it to create a Motor class which my Car class will use.

Why isn't the class named Car and Motor? Because the idea comes from refactoring a [springboot service]({% post_url 2020/2020-06-22-Springboot-basics %}), 
which would be one common engineering use case.

## Setup

Let's get going with your build.gradle and the correct dependencies and preferably as up to date as possible.
You can always check the [mvn repository](https://mvnrepository.com/artifact/org.mockito) for that.

```groovy
dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter:5.8.1'
    testImplementation group: 'org.mockito', name: 'mockito-core', version: '3.12.4'
    testImplementation group: 'org.mockito', name: 'mockito-junit-jupiter', version: '3.12.4'
}
```

Or in pom.xml, check you have the right `<dependency>` version.

## Example classes

For the example we've made something simple to illustrate.
Disclaimer: I am using a bit freely the diagram class to serve my purpose.

### Initial situation

The initial situation where all the logic and all the dependency is concentrated within `ComplexeService`.
On this diagram we have the dependency `A`, `B` and `C` that are injected into `ComplexeService` at run time.

<div class="mermaid">
classDiagram
    ComplexService <|-- A
    ComplexService <|-- B
    ComplexService <|-- C
    ComplexService : A depA
    ComplexService : B depB
    ComplexService : C depC
    ComplexService: complexLogic()
    class A {
      ...  
      doStuff()
    }
    class B {
      ...
      doStuff()
    }
    class C {
      ...  
      doStuff()
    }
</div>

### After refactor 

Now we realise that some logic can be separated and encapsulated. More so, the dependency `A` is only used in that part of the code.
After the refactoring, we now have a `A` injected in the newly created `SimpleService` which is injected into `ComplexService`.
Here is the diagram after the change:

<div class="mermaid">
classDiagram
    SimpleService <|-- A
    ComplexService <|-- B
    ComplexService <|-- C
    ComplexService <|-- SimpleService
    ComplexService : B depB
    ComplexService : C depC
    ComplexService : SimpleService simple
    ComplexService: complexLogic()
    class SimpleService {
        A depA
        simpleLogic()
    }
    class A {
      ...  
      doStuff()
    }
    class B {
      ...
      doStuff()
    }
    class C {
      ...  
      doStuff()
    }
</div>

If needed, now we can inject that `SimpleService` elsewhere without the need to pass the whole `ComplexService`,
even potentially remove duplicated code where we would have injected `A` and scavenge bits of code. 

Ah! legacy code... 👩‍🎨

### Implementation

In Java, you can find the repo hidden here in [Example/Mockito](https://github.com/sylhare/Java/tree/master/src/Example/src/main/java/mockito),
on my java GitHub repository.

Now for the `ComplexService` once refactored, the class would look like:

```java
public class ComplexService {
    public B depB;
    public C depC;
    public SimpleService simpleService;

    public void complexLogic() {
        depB.doStuff();
        depC.doStuff();
        simpleService.simpleLogic();
    }
}
```

For the `SimpleService` newly created, it has been overly simplified to the point that it's just printing _"do stuff"_ with the class name.
It is good enough in our case to illustrate the point:

```java
public class SimpleService {

    public A depA;

    public void simpleLogic() {
        System.out.printf("%s do stuff%n", this.getClass().getSimpleName());
        depA.doStuff();
    }
}
```

The dependency `A`, `B` and `C` do not really matter because they would either be from external library or entirely mocked for unit tests.

## The Problem

Let's not look at the problem we're encountering.
Obviously 🤡 the old _ComplexService_ was tested, and now you have broken everything, because _SimpleService_ is not injected or mocked.

Also, you may not have written new tests (yet) for _SimpleService_, because you just extracted from the other class.
We're working with legacy code, and we might not know what _SimpleService_ is supposed to actually do. 😬

So here's the trick to still test your newly created class using the old tests. Because only mocking it is not testing it!

### Test tricks with mockito

Basically we will need three things from mockito, I usually use the annotation,
but you can also instantiate them as you please in the setup.

Make sure you import the right ones:

```java
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
```

Then set up the annotation such as:

```java
@Mock
private A a;
@Mock
private B b;
@Mock
private C c;
@Spy
@InjectMocks
private SimpleService simpleService;
@InjectMocks
private ComplexService complexService;
```

Here is what's going on, we will have:

  - **3** Mocks: The dependencies A, B and C
  - **1** Spy: The newly created class SimpleService
  - **2** Injection of Mock: Basically we will inject in SimpleService and ComplexService the mocked dependency A, B and C.

### Mock, Spy, Wut?

A **Mock** is created from the class by Mockito, so that you can use the framework capabilities to _verify_ that it has been called,
or _stub_ the response when a certain method get called and so on.

A **Spy** will wrap an existing instance of the object, meaning that you can use the framework to _verify_ and _stub_,
but it can also go through the actual code within it.

Which in our case is interesting, because the SimpleService annoted as a spy gets also _injected_ within ComplexService.
So you will be able to have flow go through the extracted code within the same test as before.

> ⚠️ I had to use `MockitoAnnotations.openMocks(this)` to initiate the mock in the setup method for the `@Spy` to be injected correctly.

You could create some new tests to it, stub some responses from SimpleService and so on.
However at some point, it would be better to have a dedicated test file for SimpleService for any edge or missing test cases.

### The test that solves it all

Let's call this `complexLogic()` method from ComplexService which uses all of its dependencies.
Let's verify that they are all actually called:

```java
@Test
void complexLogicTest() {
    complexService.complexLogic();
    verify(b).doStuff();
    verify(c).doStuff();
    verify(a).doStuff();
    verify(simpleService).simpleLogic();
}
```

There you have it, your (overly simple) test is now working! 
The coverage remains the same, and you have more confidence that this "refactor" of yours didn't break anything 💣 ... or did it?

In any case, I feel like that's one of the best use so far for the Spy, 
since usually you want to avoid using them thanks to good encapsulation and enough granular unit tests in your dependencies.
