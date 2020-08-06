---
layout: post
title: Testing Springboot in Kotlin
color: rgb(136, 176, 75)
tags: [kotlin]
---


Since we had a look at spring and springboot in a previous [article]({% post_url 2020-06-22-Springboot-basics %}).
Let review how we can test the beast! 
Because like all good developer, you like writing good tested code with TDD aka Test Driven Development.
Where you usually _start_ with test... 😅 

## Test a simple Rest spring application

### Simple Get endpoint

Let's say you have a spring REST application in kotlin with a simple endpoint.
That's all good and well, but how do you test that in Kotlin. 
You can usually find a lot of information online, so let's add this one to the mix:

```kotlin
@RestController
@RequestMapping("/v1")
class Endpoints {

  @GetMapping(value = ["/hello/{name}"], produces = ["application/json"])
  fun checkBarring(@PathVariable(value = "name") name: String) = ResponseEntity(name), HttpStatus.OK)

}
```

### Bring in your test dependencies

The springboot dependencies will be automatically deduced by the plugin.
That's why when importing springboot test packages you may want to exclude the old junit v4 
to start fresh with mockK and Junit5.

Here would be a simplified snippet of our _build.gradle.kts_ for our test dependencies:

```kotlin
plugins {
    id("org.springframework.boot") version "2.2.7.RELEASE"
    id("io.spring.dependency-management") version "1.0.7.RELEASE"
    
}

dependencies {
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
    testImplementation("org.junit.jupiter:junit-jupiter:5.4.2")
    testImplementation("org.junit.jupiter:junit-jupiter-api")
    testImplementation("io.mockk:mockk:1.9.3")
    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(module = "junit")
        exclude(module="junit-vintage-engine")
        exclude(module = "mockito-core")
    }
}
```

Although mockito should still be compatible with Kotlin, 
the syntax gets weird because it's conflicting with some Kotlin key words like `when()`.
So usually when using Kotlin, you'll go with [mockK](https://mockk.io/) instead.

And to avoid interferences we exclude Mockito from _spring-boot-starter-test_ as well.

### Spring application test class

Let's create our _ApplicationTest_ class to test our springboot REST application.
Basically you would find some annotation in order to resolve the bean in the context load,
specify some information and properties.

```kotlin
@ExtendWith(SpringExtension::class)
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    classes = [ApplicationTest.ControllerTestConfig::class],
    properties = ["spring.example.property=foobar"]
)
@ActiveProfiles(value = ["test"])
internal class ApplicationTest {

  var testRestTemplate = TestRestTemplate()

  @LocalServerPort
  var serverPort: Int = 0

  @TestConfiguration
  internal class ControllerTestConfig {

    @Bean
    fun foo(): Foo = mockk()
    
  }
  
  private fun applicationUrl() = "http://localhost:$applicationPort"
}   
```

You can see other annotations:

- `@SpringBootTest`: Because it's a springboot test, you can pass spring properties in `properties` and define some variables.
- `@ActiveProfiles(value = ["test"])`: To use a different profile when spinning the spring application (you might not want a certain bean to be built for the test, or you have a test profile defined with different values.)
- `@LocalServerPort`: In this case will represent the port on which your web springboot app will be hosted.
- `@TestConfiguration`: This is to define the test configuration, you can mock or update beans there.

### Write your first test

Here is a simple test to send a GET request to your application using the `testRestTemplate`. 
A springboot test tool to make REST request, so that you can test the behaviour of your application.
You can check and assert the result to make sure everything is alright.


```kotlin
@Test
fun simpleGetTest() {
val result = testRestTemplate.exchange(
    URI(applicationUrl() + "/v1/hello/world"),
    HttpMethod.GET,
    HttpEntity(""),
    String::class.java)

Assertions.assertEquals(HttpStatus.OK, result.statusCode)
Assertions.assertEquals("world", result.body)
}
```

You can see the result is in a `String::class.java` to get the result body as a String.
Be careful, if you set the result body type to `Void::class.java` you won't get the body at all (even if there's one).


## Mock your beans

Obviously here you're testing end to end your application, and in some case it may connect to other part of the system.
In order to simplify the testing, you can mock external dependencies for your test to run smoothly.

If there are bits of logic of a spring component you want to test, you can still "_autowire_" them in another test file,
Thus you can test different niche behaviour or custom error handling.

### Using mockK only

Here is how you would do that with our @Bean foo from the previous example.
You would set a special test profile here and use for the real bean `"!test"` to avoid interferences.
Be sure if you have a missing bean error to add your test configurations class in _classes_ in your `@SpringBootTest`

```kotlin
@Bean
@Profile(value = ["test"])
fun foo(): Foo {
  val fooClient: Foo = mockk(relaxed = true)
  every { fooClient.do(any()) } just Runs
  every { fooClient.isOpen() } returns true
  every { fooClient.close() } throws RuntimeException()
  return fooCLient
}
```

So here you can see three behaviours that was defined for our Beans.
We define the behaviour of some method, define a return value or throw an exception.
This way we can test some custom behaviour.

### With springmockk

However if you prefer a syntax closer to Mockito, you can use [springMockk](https://github.com/Ninja-Squad/springmockk)
with mockK by adding this dependency from your gradle file:

```kotlin
testImplementation("com.ninja-squad:springmockk:2.0.2")
```

Then you can just define your mocked bean like:

```kotlin
@MockkBean
lateinit var foo: Foo
```

And then you can use " _every { ... }_ + behaviour" the mockK way to define the behaviour of the mockkBean
in each test. 
Make sure you have Mocktio excluded for this one, as it's strongly recommended.
