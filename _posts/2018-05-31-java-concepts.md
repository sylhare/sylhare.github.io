---
layout: post
title: Java Core Concepts
color: rgb(249, 103, 20)
tags: [java]
---

Beside hearing that in Java everything is about objects, and all declaration has to have a data type,
that makes it a strongly typed language.

> What's so special coding in Java?

Basically you define a class (sort of an object blue print). 
Then with that class you can create multiple similar object which can interact. Like creating multiple house from the same blue print.

The class defines the object's properties, and method; its behaviour. 
And here is what Java allows you to do when creating classes.

### I. Encapsulation

Encapsulation is made through keywords that define how the object (method, attribute, ...) can be accessed.
We call it encapsulation because it can isolate and control data access.

#### private

With private, you make the value or method unavailable outside the class it's in.
In order to get to private attribute, you'll need to use "getter" and "setter" that will get and return the value, or that will set the value correctly. 
That way you have more control and flexibility on the access and modifications of the attributes.

#### protected

A protected value or method will only be available inside the same package or child class (even in foreign package). 
Packages are Like the folders where the `.java` file is stored

#### public

A public field has no restrictions and can be available from anywhere and modified directly.
For classes that when public can be seen and instantiated from different package.

#### Other keywords

There are a lot of keywords that would require a bit more of in depth explanation, so I'll just add two of the most commons ones.

##### final

The final key word should be placed before the type.

- For a variable, it means it can't be reassigned.
- For a method, it means it can't be overridden in by a child class. (So an abstract method can't be final) 
- For a class, it means that a child class can't be created from the final one. (no inheritance)

##### static

A static field, method or class has a single instance for the whole class that defines it, even if there is no instance of this class in the program. 
It can so be called from anywhere. 

According to the [java style guide](http://cr.openjdk.java.net/%7Ealundblad/styleguide/index-v6.html), it should be placed before the final keyword:

```java
private static final String EXAMPLE = "test";
```


### II. Polymorphism

Polymorphism refers to the idea of having multiple forms, it occurs with child class and parent class when you inherit or pass a method. 
Each class can have its own implementation of the same method.

#### Overriding

Overriding is *runtime polymorphism* when you change the inherited method (can't override final or static, because you can't narrow encapsulation).  
To specify this, the annotation `@Override` is used.
You can see one example in the inheritance part.

#### Overloading

Overloading is *compile-time polymorphism* when you declare multiple time the same method but with different input. 
There's no particular keyword or annotation for over loading. 
It is already visible with multiple methods using the same name with different arguments.
For example inside an object you could have:

```java
public String hello(String world){
    return "hello" + world;
}    

public String hello(int number){
    return "hello #" + number;
}
```

Both have same name and same return type however they use different arguments.

### III. Inheritance

Inheritance refers to the process that enables one class to acquire the methods and variable of a parent class thanks to the `extends` keyword:

- The class inheriting is the *subclass* (also called *child class* or *derived class*).
- The class whose properties are inherited is the *super class* (also called *parent class* or *base class*)

Inheritance can be regulated thanks to the encapsulation keywords seen above (public, private, ...). 
The parent constructor (which are called when the class is instanced) can't be inherited by the child class. 
However it is automatically called in the constructor of the child class.

The `super()` method can be used to call the parent constructor directly. 
You can also use the `super` keyword to call directly methods or variables from the parent class (for example `super.method()` or `super.value`)

### IV. Abstraction

The concept of abstraction is that we focus on essential qualities, rather than the specific characteristics of one particular example.

In Java, abstraction is achieved using abstract classes and interfaces. 
This way you can use as "type" to instantiate an object, the extended abstract class, the implemented interface or the object itself.

#### abstract class

An abstract class is a class that have at least one abstract method marked with the `abstract` keyword 
(put in the definition instead of `public` for example). 
An abstract method is only a definition, it does not have a body.  
The abstract element are to be implemented in the child class when inherited, it used to give a default behaviour and common characteristics.

For example you could have an abstract class like:

```java
public abstract class AbstractClass {
    abstract void foo();
    void bar() {}
}
```

Which can be extended by another class like that:

```java
public class MyClass extends AbstractClass {
    @Override
    void foo() {}
}
```

_MyClass_ inherit the _bar()_ but has to implement the abstract _foo()_. 
Because _foo()_ should be a callable from every child of the abstract class but the implementation is up to the child.

#### Interfaces

There's no constructors in an Interface, there's only abstract methods and variables. 
The interface is set thanks to the `implements` keyword at the definition of the class.
If you wish to store instanced variables however it is best practice to use an Enum instead.

For example you could have an interface like this one:

```java
public interface MyInterface {
    void foobar();
}
```

Note that you can't define the behavior within the interface.
Implementing the Interface would look like:

```java
public class MyClass implements MyInterface {
    @Override
    public void interfaceFunction() {}
}
```

## Libraries

### Java Libraries Collection

The collection is what is inside the `java.util`. And as its name refers to, it contains a lot :

| Interface | Hash Table | Resizable Array | Balanced Tree | Linked List | Hash Table + Linked List |
|-----------|------------|-----------------|---------------|-------------|--------------------------|
| Set       | HashSet    |                 | TreeSet       |             | LinkedHashSet            |
| List      |            | ArrayList       |               | LinkedList  |                          |
| Deque     |            | ArrayDeque      |               | LinkedList  |                          |
| Map       | HashMap    |                 | TreeMap       |             | LinkedHashMap            |

For a more graphical view:

{% include aligner.html images="java-collection.jpeg" column=1 %} 

### Compile your project with external libraries

#### Maven

[Maven](http://maven.apache.org/what-is-maven.html) is a framework developed by Apache that add standards in Java projects. 
By having the same hierarchy it helps keep a consistent project, manage dependencies and facilitate the build. 
It is a good way to share information and JAR across multiple projects.

> "Maven, a Yiddish word meaning accumulator of knowledge"

When using Maven a `pom.xml` file is created to manage the dependencies of the project.

##### Maven commands

First make sure maven is installed by running:

	mvn -version

Maven can now be used to build the project:

- `mvn compile` to run the test, compile the project, install the dependencies, create the library package.
- `mvn package` to create the library package (such as a JAR file for example)
- `mvn test` to use the maven to run unit test in the _src/test/jave_ folder with a matching _*Test_ name
- `mvn install` to add your project's JAR file to your local repository (like a "compile" but making it ready as a dependency to be referenced by another project
- `mvn clean install` to copy the libraries if the first one fails.

##### Getting started

Here is a getting started from the Apache Maven website:

- [Maven getting started in 5 min](http://maven.apache.org/guides/getting-started/maven-in-five-minutes.html)
- [Maven getting started](http://maven.apache.org/guides/getting-started/index.html)


#### Gradle

[Gradle](https://gradle.org/) is an open source build automation system that builds upon the concepts of Apache Ant and Apache Maven 
and introduces a Groovy-based domain-specific language (DSL) instead of the XML form used by Apache Maven for declaring the project configuration.
Gradle use a `build.gradle` to manage the build configs and libraries

##### Gradle commands

Here are the main ones:

- `gradle clean build test`: Build the project (into a JAR) and run the tests
- `gradle dependencies`: Show the project dependencies

You can have more tasks, like for the coverage report using jacoco.

##### How to use

- [Gradle User guide](https://docs.gradle.org/userguide/userguide.html)
- [Guides](https://gradle.org/guides/)
