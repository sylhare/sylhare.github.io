---
layout: post
title: Create and export 🔥 Prometheus metrics
color: rgb(230,82,44)
tags: [kotlin]
---

Prometheus is a titan in greek mythology that brought fire (hence the logo).
[Prometheus](https://prometheus.io/) is also a modern monitoring system that has uses time series to display the data.
It provides a query language for better exploiting your metrics compiled with an alerting service and all of that
with great compatibility and integration with other system. Making it fairly easy to deploy and use.


## Implement Prometheus Metrics

You can create different types of metrics depending on your needs.
Here we are going to look at a couple of example in Kotlin.

### Metrics types

There are 4 types of metrics:

- Counter: simple that can only go up (number of transactions, errors)
- Gauge: can go up and down (request duration, queue size)
- Histogram: measure the frequency of events in  pre-defined buckets (response duration)
- Summary: measure with more accuracy on the application side the frequency of events in dynamic buckets.

### Implement with Springboot in Kotlin

#### Set up

First would be the springboot [Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-features.html#production-ready-enabling) library.
That will provide all the prod ready feature you may want including the metrics one.
Then besides all the other common springboot dependency, here is a summary of what you may need to add in your `gradle.build.kts`.

```kotlin
implementation("org.springframework.boot:spring-boot-starter-actuator")
// To create your own prometheus metrics
implementation("io.micrometer:micrometer-registry-prometheus:1.3.5")
```

Those will enable you to create and display the metrics. 
[Micrometer](https://micrometer.io/) is an application metrics that supports multiple monitoring services.
Then don't forget to update your _application.yml_ with metrics enabled. 
This way you'll have all basic springboot prometheus metrics already created and advertised.

```yml

management:
  server:
    port: 9100
  # Enable prometheus and metrics endpoints
  endpoint:
    metrics:
      enabled: true
    prometheus:
      enabled: true
  # Expose all metrics endpoints
  endpoints:
    web:
      exposure:
        include: '*'
  # Enable prometheus metrics generation
  metrics:
    export:
      prometheus:
        enabled: true
```

With the above config you should be able to check the metrics at [localhost:9000/actuator/prometheus](http://localhost:9000/actuator/prometheus).
Also you may need to set jmx to true (which is false by default in spring 2.x) for some metrics (like for kafka)

```yml
spring:
  jmx:
    enabled: true
```

[JMX](https://en.wikipedia.org/wiki/Java_Management_Extensions) is the Java Management Extension library that supply tools 
for run time managing and monitoring.

#### Counter with Micrometer Core

For the counter you can use the _MeterRegistry_ then set a name, you can add some other parameters but we keep it simple.
The tag `.tag("key", "value")` is used when exploiting the metrics in the _PromQL_ so you can differentiate them. 
You can add as many tags as you want:

```kotlin
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Counter

@Component
class MetricLogger(registry: MeterRegistry) {
    private var requestReceivedCounter: Counter = Counter
        .builder("request_received")
        .tag("app","my-app")
        .register(registry)

    fun requestReceived() = requestReceivedCounter.increment()
}
```

With that you can call your logger and increment your counter:

```kotlin

@Autowired
private lateinit var metricLogger: MetricLogger
    
fun myMethodThatReceiveRequest() {
   metricLogger.requestReceived()
   // ... and do some more stuff
}

```

You can use it within your code this way, a bit like you would with log lines.

#### Gauge with Prometheus Client

For the Gauge, you will need the _CollectorRegistry_ a name, some help message and a label.
As before you can add as many tags as you wish.

```kotlin
import io.prometheus.client.CollectorRegistry
import io.prometheus.client.Gauge

@Component
class MetricLogger(collectorRegistry: CollectorRegistry) {
    private var queueSizeGauge: Gauge = Gauge
        .build("queue_size", "Gauge for queue size")
        .labelNames("type")
        .register(collectorRegistry)

    fun updateQueuSize(value: Long) = latencyGauge.labels("my-app").set(value.toDouble())
}
```

I could also use `.inc()` and `.dec()` to increment the value of my gauge instead of using `.set()`.
As for the usage it's the same as the Counter one.
You can also use [Micrometer](https://www.baeldung.com/micrometer) for gauge and other metrics.
Both can work and be used, check the concepts Micrometer [doc](https://micrometer.io/docs/concepts) page for more info.

## Exploit your metrics with PromQL

### PromQL

Prometheus Query Language [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/)
lets you apply some filters, operators, functions and more to your metrics.
Particularly useful if you scrape metrics for multiple application on multiple servers.

### Usage

Depending on your metrics you can apply different kind of query.
Also those query can be used in the default prometheus GUI or 
if you have it connected with Grafana, you can use them there to create your custom graphs.

[Grafana](https://grafana.com/) is an "observability platform" that lets you use the data from prometheus to create dashboards.
You can use the same Prometheus queries and display the data as you wish.

For more information on how to use your metrics, check the other sources, 
it will pretty much depend on your use case: the data you have or what you want to monitor.

### Other sources

Here are some interesting sources you may want to take a look when creating, exploiting your metrics:

- [The four types of Prometheus Metrics](https://tomgregory.com/the-four-types-of-prometheus-metrics/)
- [PomQL for humans](https://timber.io/blog/promql-for-humans/)
- [Prometheus Query functions](https://prometheus.io/docs/prometheus/latest/querying/functions/)
