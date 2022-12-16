---
layout: post
title: Cache 📦, retry ♻️ or break 💣💥
color: rgb(242, 113, 39)
tags: [java]
---

Let's talk about APIs, usually in a microservice ecosystem you are bound to call one another. It can be via GraphQL, 
REST or gRPC all those calls can sometime fail or induce latency in your system.

In this article we are going to review some hardening patterns to make sure that your service stays up even when calls
or entire part of the system are failing 😬
You may not need to implement it all at once, as it might not be mandatory for all use case. However understanding them
gives you the possibility to evaluate their plus value in your system.

## Concept

### Sequence diagram

Before we go too deep into the subject, let's have a view of a workflow and the three elements we are going to talk
about today:
1. The [cache] which stores the data once fetched
2. The [retry] pattern which on fail try to fetch the data again
3. The [circuit breaker], like a fuse when all call fail to prevent the service to go down.

<div class="mermaid">
sequenceDiagram
    participant User
    participant App
    participant API as DB API
    User-->>App: interacts
    App->>API: request data
    API->>+App: [200: OK] return data
    App-->>User: data is loaded
    App-->>App: Cache data
    User-->>App: refreshes
    App-->>-User: data is loaded
    Note left of App: Cached data can be re-used<br>instead of calling the API again
    User-->>+App: interacts
    loop Retry 3 times
      Note right of API: When DB API <br>is down
      App->>API: request data 
      API->>App: [500: Error] 
    end
    App--xAPI: request data
    Note left of App: Circuit Breaker is OPEN<br>Calls to DB API are prevented
    App->>App: Use cached data
    App-->>-User: data is loaded
</div>

So in this diagram we have a "_User_" which is the initiator interacting with the "_App_" which is our service, what we
are supposed to maintain. The "_DB API_" could be a key microservice that's part of our infrastructure, in our case a
microservice to interact with a database.

Our App has all three patterns implemented, and you can see when they get into play.

### Caching

We already talked about the caching patterns in this [article][1], so we won't be holding forth.
Besides, the benefits of caching to reduce load on external system, 
we can also extend its usage as a backup when the external service is down.

Once the circuit breaker opens, meaning we can't reach the other service, instead of returning null or an error, 
we use the cache to fetch the latest working response of the call.
It might not be the "_freshest_" response, but it might save your service from collapsing, preventing a domino effect.

And if there's a **cache miss** when the circuit breaker is open,
we can always return a pre-formatted answer as **placeholder** or dummy data so the user might 
not detect the extent of the outage and keep a better overall experience.
With good caching pattern, you can fake it until you make it 🙃 ("_Fake_" the call to the API with the cache, until
it's back up).

### Retry

The retry pattern is the easiest one to understand, when you fail to retrieve a resource you try again.
It can also work on mutation or call to update or change data which are idempotent (ie which always yield the same result
independently of the amount of time it's been called). 

For the configuration it all depend on the current technical and business requirement such as:
- How much time can we wait for the resource? 
  - ex: One try shouldn't take more than 1 seconds, and 4 seconds total.
- How much time should we wait before retrying? 
  - ex: Wait 200ms in between calls, so you don't DDoS the API.
- How much time should you retry?
  - ex: Retry two times before sending an error
- When should you not retry?
  - ex: Don't retry on error 503 service unavailable for example

> High number of retry should be a trigger to alarm you that the system is not performing well

On the UI domain, with calls to the backend being asynchronous, you can display some placeholder while everything load.
With retries, you can have the same principle, they don't need to be on the main thread and improve the resiliency of
your system.

### Circuit Breaker

The circuit breaker works in par with the retry pattern, one is a subset of the other. This pattern makes the system
fault-tolerant meaning that even when one part of the system is down, the rest still continue to function.

It is often found in systems where microservices are really dependant from each other, where in one call flow multiple
services can be called.
But not all services are needed to fulfill every end user's requests. The circuit breaker "stops the hemorrhage 🩸" so 
that your system doesn't go down 😵, but stay up with some features available 🤕.

The circuit breaker has three state, think of it like a ⚡️ fuse:
1. **CLOSED**: Means that everything works fine
  - Calls to the APIs are still being made
2. **OPEN**: Too many failures, the service is down
  - No calls are being made, saving resources
  - ex: circuit breaker on App when trying to call DB API when down
3. **HALF OPEN**: The service has been down but might be back up
  - Calling the service again, it can go back to OPEN or CLOSED depending on the failure threshold. 

Keep in mind when configuring the circuit breaker the type of application that's in your system. For example if a 
microservice takes a minute to restart don't make your circuit breaker transition to HALF OPEN in less than a minute
otherwise there might be chances that it's not up again.

Same thing with your failure threshold, depending on your TPS (Transaction per seconds) you may get some false positive
or worse detect too late that the service is down.

## Implementation

Now let's try to implement it, first we'll look at the cache then use [Resilience 4j] a Java library for the retry and
circuit breaker. Make sure you have those dependencies defined in your build.gradle.kts:

```kotlin
dependencies {
    implementation("net.spy:spymemcached:2.12.3")                               //memcached client
    implementation("io.github.resilience4j:resilience4j-retry:1.7.1")           //resilient4j retry
    implementation("io.github.resilience4j:resilience4j-circuitbreaker:1.7.1")  //resilient4j circuit breaker
}
```

I only highlighted the main dependencies used, but you may need more if you are doing JSON serialization or using a
framework.

### Memcached

[Memcached] is a simple key-value store that is multithreaded. The key needs to be a string and the value has no type, 
so it needs to be serialized and stored as a JSON string.
Same on retrieve, we need to deserialize, modify the data and serialize to save again.

If this doesn't fit your need, or you'd rather use object has key and data type are important for you, then [redis] might
be a better [choice]. It offers as well some better scalability as a cache queue.

In our case we'll use Memcached for our single use case to store API fetched resources.
Find some detailed example on how to integrate and implement it in this [article].

### Retry

Let's create a simple retry with the [Resilience4j Retry] in an example class:

```java
import io.github.resilience4j.core.IntervalFunction;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;

public class Example {
  public Retry retry = Retry.of("My Retry",
          RetryConfig.custom()
                  .maxAttempts(2)
                  .intervalFunction(IntervalFunction.of(Duration.ofMillis(200)))
                  .build());
}
```

This retry is created with a builder method. 
When used will try twice with a back off function of $$200ms$$. The back off is the amount of time between the
last failure.

Now to use it, you need to use a decorate function:

```java
import java.util.function.Supplier;

import io.github.resilience4j.retry.Retry;
import io.vavr.CheckedFunction0;
import io.vavr.control.Try;

public class Example {
  public String retry(Supplier<String> supplier) {
    CheckedFunction0<String> retryableSupplier = Retry.decorateCheckedSupplier(this.retry, supplier::get);
    return Try.of(retryableSupplier)
            .recover(throwable -> "Recover function when the retry failed")
            .get();
  }
}
```

The decorated method use the retry and the lambda method to call, in this case we use the Supplier functional interface.
The code when executed will run the supplier function and if it fails it will be caught by the retry method.
After the max attempt complete it will go to the `recover` method which will run and return the error.

The `Try.of` method works like a "functional" try/catch, less bulky than the full syntax and very modular.

### Circuit Breaker

Let's implement a simple circuit breaker with the [Resilience4j Circuit Breaker] in an example class:

```java
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;

public class Example {
  public CircuitBreaker circuitBreaker = CircuitBreaker.of("My Circuit Breaker",
          CircuitBreakerConfig.custom()
                  .waitDurationInOpenState(Duration.ofSeconds(60))
                  .recordException(throwable -> throwable instanceof Exception)
                  .build());
}
```

In this case, the circuit breaker uses most of the default values, it will count any exception as failure to get it to 
the open state and stay open for $$60s$$.

To use it in your class, it follows the same principle as the retry:

```java
import java.util.function.Supplier;

import io.github.resilience4j.retry.Retry;
import io.vavr.CheckedFunction0;
import io.vavr.control.Try;

public class Example {
  public String runWithCircuitBreaker(Supplier<String> supplier) {
    Supplier<String> decoratedSupplier = CircuitBreaker.decorateSupplier(this.circuitBreaker, supplier);
    return Try.ofSupplier(decoratedSupplier)
            .recover(throwable -> "Hello from Recovery").get();
  }
}
```

The lambda method which is java functional supplier will be executed "within" the circuit breaker, on open state, it
won't even try to run the lambda function, and it will go straight to the recover method.

### Everything, everywhere, all at once

Now that you have your cache [setup][1], the [retry] and [circuit breaker] as well, you can mount them all together
so that your request is decorated by the circuit breaker to record any failure, and that decorated request is also
decorated by the retry so that you can make another attempt in case of failure:

```java
public class Example {
  public <T> T run(Class<T> expectedClass, String id, Supplier<T> supplier) {
    Supplier<T> decoratedSupplier = CircuitBreaker
            .decorateSupplier(circuitBreaker, supplier);
    CheckedFunction0<T> decoratedRetry = Retry
            .decorateCheckedSupplier(this.retry, decoratedSupplier::get);
    return Try.of(decoratedRetry)
            .onSuccess(storeInCache(id))
            .recover(getFromCache(id, expectedClass)).get();
  }
}
```

Don't be frightened by the generics `T`, they're there, so we can use it on multiple objects.
It is trying the supplier within the circuit breaker which will register all failure, if it fails, the retry will do its
job. On success the value is cached on error after the retry we fetch from that cache. 
For the supplier you can create one simply like:

```java
class Example {
    Supplier<String> supplier = () -> "hello";
}
```

You would have in the supplier the method that will call the external service or database which may fail and that you
want to make more resilient.

> You could have the `getFromCache` first which will recover on failure by calling the decoratedRetry. 
> The last recover method could either be getting stub or expired data, 
> to spare extra calls to the DB as mentioned in the _diagram_.

The retry decorates the circuit breaker and not the opposite so that if you have to retry $$2$$ times before it works, then
the circuit breaker will count those failures. This can be used as a metrics in your alerting system when there's an 
increase in retry it must mean something is not right (system under pressure, memory leak, pods down, ...).

## Conclusion

Now you should have a better understanding of the patterns, when to implement them, and hopefully some more insights on
how to do it with the provided examples. Follow [this link][2] for more code example.

This is the path to fault tolerance and more resilient app. With better software practices and key hardening of central
pieces in our system we can make "_no operation_" a reality where the devOps no longer needs to operate its system as
its resilient and self-healing ❤️‍🩹!

Make sure you have sufficient logs, the necessary ones for debugging. And don't forget to set up proper alerting,
so that you'll become more proactive rather than reactive when your system is under pressure.

Until then keep up the good work and let me know in the comment if and how you've implemented those patterns.


[cache]: https://en.wikipedia.org/wiki/Cache_(computing)
[caching patterns]: https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html
[retry]: https://java-design-patterns.com/patterns/retry/#
[circuit breaker]: https://java-design-patterns.com/patterns/circuit-breaker/
[Resilience4j Circuit Breaker]: https://resilience4j.readme.io/docs/circuitbreaker
[Resilience4j Retry]: https://resilience4j.readme.io/docs/retry
[memcached]: https://memcached.org/
[redis]: https://redis.io/
[choice]: https://www.imaginarycloud.com/blog/redis-vs-memcached/
[1]: {% post_url 2022/2022-11-21-Memcached-your-friendly-neighbourhood-cache %}
[2]: https://github.com/sylhare/Summer-shoe
