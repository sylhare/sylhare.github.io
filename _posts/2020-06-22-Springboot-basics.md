---
layout: post
title: Spring Boot basics
color: rgb(136, 176, 75)
tags: [kotlin]
---


[Spring](https://docs.spring.io/spring/docs/current/spring-framework-reference/overview.html) 
is a popular framework to develop java application for enterprise with support to Groovy and 
Kotlin as alternative language.

## Spring and Spring Boot

Spring Framework was made to remove the boilerplate necessary to build an application, and have some
nice features like dependency injection and templates that reduce the amount of lines of code necessary to get started.

Spring Boot on the other hand is an extension of the spring framework which removes the configurations
required for setting up a Spring application. Eliminating the boilerplate's configuration of a framework that was 
eliminating the boilerplate's code require to get your application started.

From [baeldung's spring boot article](https://www.baeldung.com/spring-vs-spring-boot), Here are just a few of the features in Spring Boot:

  - Opinionated ‘starter' dependencies to simplify build and application configuration
  - Embedded server to avoid complexity in application deployment
  - Metrics, Helth check, and externalized configuration
  - Automatic config for Spring functionality – whenever possible

Spring Boot removes most of the code you need to get started, so that you can actually start coding features faster.

## Getting started

As spring boot is an extension of spring, it has all of the dependencies you might need already packed together.
With some of them that might no be necessary in Kotlin or for your specific project, you can manage that in your build.gradle.kts.

I have let what's related to spring boot:

```kotlin
plugins {
    id("org.springframework.boot") version "2.2.7.RELEASE"
    id("io.spring.dependency-management") version "1.0.7.RELEASE"
}

dependencies {
    compile("org.springframework.boot:spring-boot-starter") {
        exclude(module = "spring-aop") // Excude what you don't need, for example spring Aspect-Oriented Programming module
    }
    compile("org.springframework.boot:spring-boot-starter-web") 
    testCompile("org.springframework.boot:spring-boot-starter-test") // Comes with Junit4, Mockito, Hamcrest
}
```

You can see the spring plugins there in your gradle file that will automatically manage will version of each spring dependency
you need in order for the whole to work.

## Annotations

Because spring is using annotation that can look like magic. 
Let's go through the main ones with Kotlin examples. I won't go in too much details, just to have a high level overview.

### @Bean

The Beans in spring are what your application is based upon, it's backbone. 
They are managed by the Spring IoC (Inversion of Control) Container, the one that is doing all the dependency injection
which is at the base of the "spring magic". 

By magic, it's because you define the object dependencies without creating them and let the construction of those dependency
be made by spring (ie the Spring IoC container) on start up. (You might have errors with Application Context, etc ...) 

Basically a Bean is an object that is going to be instantiated, assembled and managed by spring.

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestTemplate


@Configuration
class Config {
    @Bean
    fun restTemplate() = RestTemplate()
}
```

On this basic example, you can see a `restTemplate` Bean in a `@Configuration` class where the configuration annotation, 
means that it's a configuration class which may contain bean definitions.
 
### @Component

#### Difference with Bean

Since everything is Bean in spring, it can be hard to see what difference it makes to use those different annotations.
From what I see the main differences between Bean and Component are:
 
 - Component
   - Used on Classes
   - Enable scanning and automatic wiring to create the object
   - one-to-one mapping between the annotated class and the Bean (coupled)
 - Bean
   - Used on a method
   - Object instantiation is handled within the method and can be decoupled (one-to-many, one bean multiple possible objects)
   - Returns an explicit single object and marked as a Bean for Spring
   
#### Example and @Autowired
 
So by adding a `@Component` to a class we create a Bean 

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
internal class MyComponent {

    @Autowired
    private lateinit var restTemplate: RestTemplate
    
    fun doStuff() = "doing stuff"
}
```

You can see the `@Autowired` annotation used there on our restTemplate field. 
Basically at the component creation, spring which will look for a Bean for restTemplate, and then inject it into our Component.
The `@Autowired` annotation marks a constructor, field, or setter method to be autowired by Spring dependency injection.

It will use reflection in order to look for annotated field and then instantiate them at run time. 
Thus the "lateinit var" in Kotlin, you might need in some case add `kotlin-reflect` to your gradle file, if you get reflection dependency exception.

#### Component specification @Service, @Controller

To better separate and differentiate the Bean and parts of the code, you can use specified Component annotation.
For example `@Service` which represents also a Component is one of them. 
It describe an object that's holding the business logic and is used the same way as `@Component` is used.

Then you have `@Controller` which indicates that the class is a "Controller". It's mostly known by its own specified version 
the `@RestController` which is used to [simplify]((https://www.baeldung.com/spring-controller-vs-restcontroller)) the implementation Rest API applications.

```kotlin
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1")
internal class Endpoints {

    @Autowired
    private lateinit var myComponent: MyComponent

    @GetMapping(value = ["/example"])
    internal fun depositMessage() = ResponseEntity(myComponent.doStruff(), HttpStatus.ACCEPTED)
    
}
```

You can see that the `@RestController` can also `@Autowire` any Bean (from any Bean, Component, ... annotation).


### @SpringBootApplication

Create and run your application with the `@SpringBootApplication`. Here is how you would do it in Kotlin.
And don't forget that main method in Kotlin outside of class are to be called _"BootStrapApplicationKt"_ in case you need 
to package it into an application and you need your 

```kotlin
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
class BootStrapApplication

fun main(args: Array<String>) {
    SpringApplication.run(BootStrapApplication::class.java, *args)
}
```

The SpringBootApplication annotation is what enables Spring Boot auto configuration and component scanning.
So that's for the Spring IoC Container / Dependency injection to get in play load the application context, etc ...
The `SpringApplication.run(...)` method is a [convenient way to bootstrap](https://docs.spring.io/spring-boot/docs/2.1.10.RELEASE/reference/html/boot-features-spring-application.html) 
the Spring application that is started from the `main()` method. 

In the end the final tips, is when you have a doubt, you can always look into Spring javadoc to better 
understand what it does. (command, click on the word in IntelliJ).
