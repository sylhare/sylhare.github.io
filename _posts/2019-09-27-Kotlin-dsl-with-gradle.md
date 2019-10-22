---
layout: post
title: Kotlin dsl with gradle
color: rgb(214,102,133)
tags: [kotlin]
---


## Introduction

So here a bit of details:

- Gradle is an open source build automation system.
- Kotlin is a general purpose, open source, statically typed programming language for both functional and object oriented programming.
- A DSL (domain-specific language) is a language specialized to a particular application domain. For example `Groovy` that was created for Gradle's build scripts.

Kotlin dsl with gradle means to use the kotlin `build.gradle.kts` instead of the groovy `build.gradle`.
Kotlin is so general that it reaches specific programming niche.

> Everything is hosted on Github: [sylhare/kotlin](https://github.com/sylhare/Kotlin/tree/master/hello-kotlin) 

## Basic set up

Basic set up for your kotlin project:

- group: the top level package(s) under `src.main`
- version: the version of your application

```kotlin
allprojects {
    group = "hello"
    version = "1.0"
    repositories {
        jcenter()
    }
}
```

You want to specify the kotlin version and plugin you wish to use

```kotlin
plugins {
    kotlin("jvm") version "1.3.21"
}
```

And add the basic dependencies

```kotlin
dependencies {
    compile(kotlin("stdlib"))
    // Or compile("org.jetbrains.kotlin:kotlin-stdlib:1.3.21")
}
```

## Code Coverage

### JUnit

To look at coverage that means you have unit test.
Don't forget to add something like JUnit into your dependencies:

```kotlin
dependencies {
    testCompile("junit:junit:4.12")
}    
```

### Jacoco

Code coverage with jacoco plugin

```kotlin
plugins {
    jacoco
}
```

Then add the task

```kotlin
tasks.withType<JacocoReport> {
    reports {
        xml.isEnabled = true
        csv.isEnabled = false
        html.destination = file("${buildDir}/reports/jacoco")
    }
}
```


You can now roll the test code coverage with jacoco using `gradle test jacocoTestReport`.

## Execute the project

### With the Application gradle plugin

It is a plugin available with gradle, add it to your gradle script like:

```kotlin
plugins {
    application
}
```

Then set your application main file: 

- It has to be outside of a class
- The `Kt` at the end is normal, Kotlin automatically generates it for backward compatibility with Java classes

```kotlin
application {
    mainClassName = "hello.MainKt"
}
```

Now you can run your program with:

```bash
gradle run
```

### Make the fat Jar

The fat jar task (updated to work with Gradle `5.x`:

```kotlin
val fatJar = task("fatJar", type = Jar::class) {
    baseName = "${project.name}-fat"
    manifest {
        attributes["Main-Class"] = "hello.MainKt"
    }
    from(
        configurations["runtimeClasspath"].map {
            if (it.isDirectory) it else zipTree(it)
        }
    )
    with(tasks["jar"] as CopySpec)
}
```

The jar will be created as `{project.name}-fat-{version}.jar` like `hello-kotlin-far-1.0.jar`.
You can then run it using:

```bash
java -jar hello-kotlin-far-1.0.jar
```

## Sources

- [Wikipedia DSL](https://en.wikipedia.org/wiki/Domain-specific_language)
- [ilities kotlin gradle dsl](http://ilities.co/2017/07/19/kotlin-gradle-DSL/)
- [gradle.org](https://docs.gradle.org/current/userguide/application_plugin.html#sec:application_usage)
- [Hello Kotlin](https://github.com/sylhare/Kotlin/tree/master/hello-kotlin)
