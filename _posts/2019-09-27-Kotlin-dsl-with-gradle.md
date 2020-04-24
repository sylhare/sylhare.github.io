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

Basic set up for your kotlin project with Gradle > **4.8**:

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

You want to specify the kotlin version and plugin you wish to use:

```kotlin
plugins {
    kotlin("jvm") version "1.3.21"
}
```

And add the basic dependencies:

```kotlin
dependencies {
    compile(kotlin("stdlib-jdk8"))
    // Or compile("org.jetbrains.kotlin:kotlin-stdlib:1.3.21")
}
```

You can also add this for source compatibility:

```kotlin
tasks.withType<KotlinCompile> {
  kotlinOptions.jvmTarget = "1.8"
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

#### Create code coverage task

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

#### Ignore a class from coverage

If you have a `main` class which can't be tested and you'd rather remove it from coverage, you would do it like:

```kotlin
tasks.withType<JacocoReport> {
    doFirst {
        classDirectories = fileTree("build/classes/kotlin/main").apply {
            exclude("**/MainKt.class")
        }
    }
    
    // ... your other stuff
    
}
```

And `MainKt` is not considered for the coverage anymore!

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

// Or you can use
application.mainClassName = "hello.MainKt"
```

Now you can run your program with:

```bash
gradle run
```

### Make the fat Jar

So the basic Jar file generated [doesnt include all you need](https://stackoverflow.com/a/61373175/7747942) to run.
You need to include them manually by adding this (gradle 5+):


```kotlin
tasks.withType<Jar> {
    // Otherwise you'll get a "No main manifest attribute" error
    manifest {
        attributes["Main-Class"] = "com.example.MainKt"
    }

    // To add all of the dependencies otherwise a "NoClassDefFoundError" error
    from(sourceSets.main.get().output)

    dependsOn(configurations.runtimeClasspath)
    from({
        configurations.runtimeClasspath.get().filter { it.name.endsWith("jar") }.map { zipTree(it) }
    })
}
``` 

The jar will be created as `{project.name}-{version}.jar` like `hello-kotlin-1.0.jar`.
You can then run it using:

```bash
java -jar hello-kotlin-1.0.jar
```

You can also create another task `fatJar` that would create the jar with all of your dependencies.
Follow the documentation on [gradle](https://docs.gradle.org/current/userguide/working_with_files.html#sec:creating_uber_jar_example).

### Make the wrapper

For your project to work almost anywhere, you can use the wrapper:

```
gradle wrapper
```

Then you'll be able to use `./gradlew` instead of gradle and your project should run fine 👍

> Now if you have the opportunity to use a newer version of gradle, do it. 

## Sources

- [Wikipedia DSL](https://en.wikipedia.org/wiki/Domain-specific_language)
- [ilities kotlin gradle dsl](http://ilities.co/2017/07/19/kotlin-gradle-DSL/)
- [gradle.org](https://docs.gradle.org/current/userguide/application_plugin.html#sec:application_usage)
- [Hello Kotlin](https://github.com/sylhare/Kotlin/tree/master/hello-kotlin)
