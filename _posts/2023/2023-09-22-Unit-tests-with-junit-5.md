---
layout: post
title: Unit tests with JUnit 5
color: rgb(3,89,49)
tags: [java]
---

[Junit][1] is a popular open-source testing framework on the JVM. So it can work on java and
kotlin projects. It's the default testing framework for multiple other frameworks and tools.
So let's review some interesting features of Junit 5 which is to this date, the latest major
version.

## Setup

Let's review the setup with the `build.gradle` file to install the JUnit 5 dependency, 
it's easy to spot, it has _jupiter_ in the name.

```gradle
repositories {
    mavenCentral()
}

dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter:5.9.2'
}

test {
    useJUnitPlatform()
}
```

To run the rest with `gradle test` we are going to use the `useJUnitPlatform()` method 
which will use junit under the hood to run the tests.

## Assertion on thrown exception

When you want to test that the method throws an exception, you can use the `assertThrows` method:

```java
import org.junit.jupiter.api.Test;

class TestClass {
    @Test
    public void testException() {
        assertThrows(RuntimeException.class, () -> example.methodThrowingException());
    }
}
```

This one is not used often, so I tend to forget the syntax. The method call that will throw the exception
needs to be in a lambda, otherwise it will be executed before the `assertThrows` and the test will fail.

## Enhancing your tests

### Display name

When running the tests, you will see the test's name in the command line, which can become hard to
read, with longer names. You can use the `@DisplayName` annotation to specify a custom name that does 
not need to match the camel case syntax of the method name.

```java
import org.junit.jupiter.api.DisplayName;

class TestClass {
    @DisplayName("true should be true")
    @Test
    public void testThatHasADisplayName() {
        assertTrue(true);
    }
}
```

You can use the display name on the test class as well.


### Nested tests

The nested tests are used to group together set of tests within the same class. 
This annotation needs to be used on an inner class.

```java
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class TestClass {
    @Nested
    public class NestedTest {

        @Test
        public void testEqualNested() {
            assertEquals(1, 1);
        }

    }
}
```

That way when running the tests, the tests result can be clearer.
It is also practical if you need a specific setup for a group of tests within your test class,
less duplication.

### Customized error messages

There is a third argument in the `assertEquals` that you can use to specify a custom error message.
This can be useful when there are multiple assertion, and it might not be too clear which one failed,
or what it means.

```java
class TestClass {
    @Test
    public void testEqual() {
        assertEquals("value", example.value, "Example's value is not equal to 'value'");
    }
}
```

The expected should be according to the documentation the first argument, then the
second one is the actual.

This has some importance, because it will influence the default error message you will receive.
But in this case, we are overriding it with our own message.

## Parameterized tests

Parametrized tests are used to run the same test with different values.

### With values

You can pass the expected values directly via the `@ValueSource` annotation. 
But this one only accepts primitive types (e.g. `ints`, `strings`)

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class TestClass {
    @ParameterizedTest
    @ValueSource(ints = {1, 2, 3})
    public void testEqualParameterizedByValues(int input) {
        assertEquals(0, input * 0);
    }
}
```

With parametrized tests, you need a test method with parameters of the exact same type as the one in the `@ValueSource`
annotation.
The test will run three times in this example, as many times as there are values.

### With method

If you need to pass multiple or more complex values, you can use a method to provide the values.
In this case the method needs to be `static` and we are using the junit `Arguments` interface as return type.

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class TestClass {
    @ParameterizedTest
    @MethodSource("getValues")
    public void testEqualParameterizedByMethod(int input, String text) {
        assertEquals(0, input * 0, text);
    }

    private static Stream<Arguments> getValues() {
        return Stream.of(
                Arguments.of(2, "two"),
                Arguments.of(3, "tree"),
                Arguments.of(4, "four")
        );
    }
}
```

Since we have two values per arguments, the test method will need two parameters with the matching type
in the same order.
In this context, the test will be run three times, one per argument. 

## Other Junit features

### Methods to set up / teardown each suits

If you need to run some setup and teardown method before and after all the tests in the class, you can use
those annotations:

```java
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

class TestClass {
    @BeforeAll
    static void initAll() {
        System.out.println("before all");
    }

    @AfterAll
    static void tearDownAll() {
        System.out.println("after all");
    }
}
```

They need to be static, and are usually used when you want to set up a dependency for the test suit.

### Methods to init / reset between each test

To run some setup and teardown method before and after each test, you can use those annotations:

```java
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;

class TestClass {
    @BeforeEach
    void init() {
        System.out.println("before each");
    }

    @AfterEach
    void tearDown() {
        System.out.println("after each");
    }
}
```

They are run in between tests, and are usually used when you want to reset the state of the test.

[1]: https://junit.org/junit5/
