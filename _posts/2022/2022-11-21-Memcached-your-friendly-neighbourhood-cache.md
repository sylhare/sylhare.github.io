---
layout: post
title: "Memcached: Your friendly neighbourhood cache"
color: rgb(87,134,153)
tags: [kotlin]
---

[Memcached] is an open source caching system, it provides an in-memory key-value store for small chunks of data and is
particularly used to save results from database or API calls.
Memcached has a [multithreaded architecture], so you can scale up by adding more computing capacity. 

You can find a client for it in your favorite language! Let's give it a look with Kotlin 🙃

## Caching

Memcached, as the name implies is for caching. As for what is caching exactly? It's the process to store data in a cache
temporarily, so you can use it later. Why would you do that? Because access to that cache to retrieve the data will be
faster than getting it from the source.

The cache is not an alternative to the database more of a data cane that your system use to become more perform and 
deliver content to your users with high performance.

### Patterns

Before we start with the implementation, here are some [caching patterns]:

- **Cache aside**: Cache the response once the data is requested
    - Keeps the cache small with only the most requested data
    - Add overhead when the data is not cached (ie: cache miss)
- **Write through**: Cache the data as soon as it's updated
    - Less call to the DB, cache never miss
    - Cache can become too big with less requested data

The cache aside is the easiest one to put in place and wrap your head around, you try the cache, it's not there, so you
fetch it once, cache it and use the cache data for the subsequent calls.

For the "write through", your cache is like a smaller high performance DB for your system, you need to make sure that 
all changes necessary for your service are written in both the cache and the DB. This might be more complex to 
implement depending on your system and use case.

### Deploy memcached

Memcached does not need a lot of configuration for you to get started, here is a snippet of the docker compose file:

```yaml
version: "3.7"
services:
  memcached:
    image: memcached:1.6.17-alpine
    ports:
      - "11211:11211"
```

The default port is **11211** and you can easily try the cache out via telnet, connect using:

```bash
telnet 127.0.0.1 11211
```

No need to know the commands per heart, as you'll most likely use a client for that, but here is how to interact with
it and store some value:

```bash
# set {KEY} {META_DATA} {EXPIRY_TIME} {LENGTH_IN_BYTES}
# {VALUE} (value which needs to be of size {LENGTH_IN_BYTES})
$ set hello 0 10000 10
$ 1234567890
STORED

# get KEY
$ get hello
VALUE hello 1234 10
1234567890
END
```

The capslock values are responses of the commands, for the set you need to put the length of the value otherwise it will
fail with a user error.
As you can see [Memcached] is really straightforward and some would say easy to use, ... but maybe not your Grandma' 👵.

## Implementation

### Dependencies

We will be using Kotlin for our example, so let's get our dependencies sorted:

```kotlin
dependencies {
  implementation(kotlin("stdlib-jdk8"))
  
  // Memcache client
  implementation("net.spy:spymemcached:2.12.3")

  // For test framework
  testImplementation("org.junit.jupiter:junit-jupiter-api:5.8.1")
  testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.8.1")
  // For test containers
  testImplementation("org.testcontainers:testcontainers:1.17.5")
  testImplementation("org.testcontainers:junit-jupiter:1.17.5")
}
```

We are going to use [spymemcached] as our Memcached client for its simplicity. To test our code we are using 
test container's [generic container] to start up a docker running memcached during the test. 
So that we can test against a real instance.

### Set up the test container

Before we get started with implementing the cache's client, let's get our test container sorted.
We are going to use the [testcontainers' jupiter annotation] to save some boiler code:

```kotlin
import org.testcontainers.containers.GenericContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers

@Testcontainers
internal class CacheTest {
  
    @Container
    var memcached: GenericContainer<*> = KGenericContainer("memcached:1.6.17-alpine")
      .withExposedPorts(11211)
      .withAccessToHost(true)
}
```    

The `KGenericContainer` is a custom class for kotlin to help it during compilation for the inferred type.

```kotlin
internal class KGenericContainer(imageName: String) : GenericContainer<KGenericContainer>(imageName)
```

Now that we have our container annotated, the `@Testcontainers` annotation will make sure to start it up when running
the tests, so we shall create one:

```kotlin
@Test
fun memcachedSetupTest() {
    Assertions.assertTrue(memcached.isRunning)
    Assertions.assertTrue(memcached.isHostAccessible)
    Assertions.assertEquals(listOf(11211), memcached.exposedPorts)
    Assertions.assertEquals("localhost", memcached.host)
}
```

Memcached's test container should be running smoothly, and you should see some whales 🐳 in the logs which are from
test containers. If you find there are too many logs, try out the [recommended logback configuration].

### Set up the client

There are multiple clients available, so you can browse and choose the one that suits your need the most. 
Now let us initiate our spymemcached client and try to store some data into Memcached:

```kotlin
import net.spy.memcached.MemcachedClient

@Test
fun cacheTest() {
    val client = MemcachedClient(InetSocketAddress(memcached.host, memcached.firstMappedPort))
    client.set("key", 5000, "value")
    Assertions.assertEquals(client.get("key"), "value")
}
```

With only an `InetSocketAddress` you can initiate the `MemcachedClient`. We need the _firstMappedPort_ because by design
the test container expose its port to a random one (to avoid conflicts). So once the container has started we want to
know which ports on our local host maps with Memcached's port **11211**.

For this test we are saving a _string_ with a time to live of 5000 seconds, then retrieving it and asserting that the 
stored value is equal to the saved value. It there is no value for a given key you should receive `null`.

Now you are all setup to try out Memcached as simple key-value store to speed up your application, good luck 

[spymemcached]: https://mvnrepository.com/artifact/net.spy/spymemcached
[Memcached]: https://memcached.org/
[multithreaded architecture]: https://aws.amazon.com/elasticache/redis-vs-memcached/
[caching patterns]: https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html
[caching design]: https://java-design-patterns.com/patterns/caching/#
[generic container]: https://www.testcontainers.org/features/startup_and_waits/#other-wait-strategies
[recommended logback configuration]: https://www.testcontainers.org/supported_docker_environment/logging_config/
[testcontainers' jupiter annotation]: https://www.testcontainers.org/test_framework_integration/junit_5/

