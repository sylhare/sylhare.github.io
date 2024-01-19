---
layout: post
title: How to use KafkaStreams in Kotlin
color: rgb(3,116,161)
tags: [kotlin]
---

Kafka Streams is a layer built on top of Apache Kafka's producers and consumers that simplifies the process of handling Kafka data.
It abstracts the creation of consumers and producers.
[Kafka Streams][1] uses a declarative syntax to process records, dealing with it is similar to handling an array or a map.

If that triggers your interest, we'll have a look at how to use it and review some of the vocabulary that comes with it
assuming you are already familiar with [Kafka][10]. We'll define both versions of an app, 
first using a consumer and producer, then using Kafka streams before looking further at the implementation of the kafka
stream. 

## KafkaStream vs Consumer/Producer

Let's review two apps doing the same thing: 

- consuming data from a topic, processing it and producing an enhanced record on another topic.

For example, one app will be using consumer and producer, and the other one will be using kafka streams.

### Consumer/Producer setup

For support, let's have the diagram of the app with consumer and producer:

<div class="mermaid">
sequenceDiagram
    participant Producer as Producer 🤷‍♀️
    participant Kafka as Kafka
    participant AC as App Consumer
    participant AS as App Service
    participant AP as App Producer

    Producer->>Kafka: Send Avro records
    loop App handling
    Kafka->>AC: Consume record
    Note right of Kafka: Deserialization<br> and Serialization<br>are using avro and <br>the Schema Registry
    AC->>+AS: Send record value<br>to be processed
    AS->>AP: Send process value <br>as new record
    AP->>Kafka: Produce new record
    end
</div>

The advantage here is that you have granular control on how the data is consumed and produced. But if you are new to 
Kafka or you are using a standard boilerplate like with [spring-kafka][11], then in most case you might be interested
in checking the KafkaStream setup.
It is not necessarily better, but worth a try to reduce the amount of code needed to set up your application. 
Less is more 🙃

### KafkaStream setup

For support, let's have the diagram of the app with the kafka stream:

<div class="mermaid">
sequenceDiagram
    participant Producer as Producer 🤷‍♀️
    participant Kafka as Kafka
    participant KafkaStream as Kafka Streams
    participant SchemaRegistry as Schema Registry
    
    Producer->>Kafka: Send Avro records
    Kafka->>+KafkaStream: Consume records
    KafkaStream->>SchemaRegistry: Deserialize records<br>validating topic compatibility
    Note right of KafkaStream: Stream <br>Process record from<br>set topology
    KafkaStream->>SchemaRegistry: Serialize record<br>with registry id
    KafkaStream->>-Kafka: Produce new records<br> to a new topic
</div>

The KafkaStream handles both production and consumption. Though it's not required to produce, you can have a stream
as a consumer only. But if you're only producing, you can't replace that by a KafkaStream.
In this example, the stream is produced to a different topic, but you could specify a [stateful operation][2] that
would produce the transformed record back to the input topic (which may be tricky to handle).

We went a bit fast on the schema registry interaction in each setup to not crowd the picture, but streams like consumers and
producer compatible and interacting the same way for [avro][13] schemas.

### Comparison

KafkaStreams comes with a lot of [features out of the box][5] and makes in most cases the handling on the kafka messages
easier. But it doesn't provide a functionality that a carefully crafted application using a consumer and a producer 
cannot offer. As you can see in both _simple_ examples, the inner workings are pretty much the same. 

Since we talked about using KafkaStreams as a way to remove some complexity compared to a standard consumer/producer setup,
let's look next at how those functionalities look in the code in this next part.

## Implementation

Let's now implement a simple KafkaStream in Kotlin.

### Dependencies

To have access to everything you need for this example, assuming you have a working `build.gradle.kts` running, you can
create the variables for the version of the packages. It's well-made so that related packages will use the same version.
To make our life easier on updates, you can set it once:

```kotlin
val kafkaVersion = "3.2.3"
val avroVersion = "1.11.3"
val confluentVersion = "7.2.1"
```

Then you use the version variable in the dependencies. Those are the one you need to add in your build file that are
related to KafkaStream:

```kotlin
dependencies {
    implementation("org.apache.kafka:kafka_2.13:${kafkaVersion}")
    implementation("org.apache.kafka:kafka-clients:${kafkaVersion}")
    implementation("org.apache.kafka:kafka-streams:${kafkaVersion}")
    implementation("org.apache.avro:avro:${avroVersion}")
    implementation("org.apache.avro:avro-tools:${avroVersion}")
    implementation("io.confluent:kafka-streams-avro-serde:${confluentVersion}")
    implementation("io.confluent:kafka-avro-serializer:${confluentVersion}")
    implementation("io.confluent:kafka-schema-registry-client:${confluentVersion}")
    
    testImplementation("org.apache.kafka:kafka-streams-test-utils:${kafkaVersion}")
}
```

As you can see, I'm using packages from Apache Kafka for Kafka itself and the main KafkaStream classes. But also some
packages from confluent for the serializer and deserializer for avro. (You can use the `io.confluent:kafka-json-serializer`
is you're using JSON and remove the avro related packages)
Check this article if you need to set up [avro][13] as I won't go too deep about it in this one.

### Configure the KafkaStream

To start, it is similar to the [consumer and producer][11] setup, you will need to configure the KafkaStreams. 
I used some example values (like a local registry) for this article:

```kotlin
import io.confluent.kafka.streams.serdes.avro.SpecificAvroSerde
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.serialization.Serdes
import org.apache.kafka.streams.StreamsConfig

val streamProps = Properties()
streamProps[StreamsConfig.APPLICATION_ID_CONFIG] = "example-stream"
streamProps[StreamsConfig.BOOTSTRAP_SERVERS_CONFIG] = "localhost:9092"
streamProps[StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG] = Serdes.String().javaClass
streamProps[StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG] = SpecificAvroSerde::class.java
streamProps[ConsumerConfig.AUTO_OFFSET_RESET_CONFIG] = "earliest"
```

I have included the imports, let's decompose what we have:
- The `application_id` is mandatory and used as the default Kafka consumer and producer `client.id` prefix, it should be unique.  
- The _bootstrap server config_ is to connect to the broker; here it's local; in production you may have additional security configurations.
- The [SerDe][3] (Serializer / Deserializer) for the key as string and for the record's value as an [avro][12] object.
- A consumer configuration (you could have a producer configuration too), the auto offset is to read from the [earliest offset][10]
   if the previous is not found.


### Create the Topology

> _A **processor topology** or simply **topology** defines the computational logic of the data processing that needs 
> to be performed by a stream processing application._[^1]

Let's create the streamBuilder and from it the [topology][5] for the stream. The serde is using the cached schema registry client
because this is to make an example.
It will define what the stream will be doing.

```kotlin
import org.apache.kafka.streams.StreamsBuilder
import org.apache.kafka.streams.kstream.KStream
import org.apache.kafka.streams.Topology

val builder = StreamsBuilder()

val avroSerde = SpecificAvroSerde<Example>(CachedSchemaRegistryClient("http://localhost:8081", 1000))
val sourceAvro: KStream<String, Example> = builder
    .stream<String, Example>("input-topic", Consumed.with(Serdes.String(), avroSerde))
sourceAvro
    .mapValues { value -> value }
    .to("output-topic", Produced.with(Serdes.String(), avroSerde))

val topology: Topology = builder.build()
```

It will read from a topic modify the value then produce to another topic.
- The `Example` is an avro object as a value of the input topic.
- We consume it using the SpecificAvroSerde from the input topic.
- We map the value as itself to show the syntax.
- We produce in the output topic with the same avro serializer.

### Start the KafkaStreams

Now that we have the stream properties and the topology set, we can create the `KafkaStreams` and 
start it.

```kotlin
val streams = KafkaStreams(topology, streamProps)
kafkaStreams.start()
```

Once started, it will begin consuming and producing.

## Testing your KafkaStreams

The pattern to test your KafkaStreams app, is in fact to test the logic which is represented by the topology.
And to facilitate unit testing, there are some tools at your disposition. 
That's why we had one `testImplementation` dependency early on!

### Using the `TopologyTestDriver`

Let's assume we have our production topology built, we want to be able to test the logic 
without running kafka and that's where the `TopologyTestDriver` is useful.

First, we will set up everything we need, the avro schema (that's in the test resources), and
mock our external dependencies like the registry:

```kotlin
import io.confluent.kafka.schemaregistry.avro.AvroSchema
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient
import io.confluent.kafka.schemaregistry.testutil.MockSchemaRegistry
import org.apache.avro.Schema

class StreamTest {
    private val inputTopic = "inputTopic"
    private val outputTopic = "outputTopic"
    private val schema = Schema.Parser().parse(
        javaClass.getResourceAsStream("/com/github/event/Example.avsc")
    )
    private var mockSchemaRegistryClient: SchemaRegistryClient = MockSchemaRegistry.getClientForScope("StreamTest")
        .also { it.register("$inputTopic-value", AvroSchema(schema)) }
    
    // ...the test
}
```

With that test class setup, we should be able to write a simple test. 
We assume that the **topology** variable in the test is the same as the one in your source file.

```kotlin
import org.apache.kafka.streams.TopologyTestDriver
import io.confluent.kafka.serializers.KafkaAvroDeserializer
import io.confluent.kafka.serializers.KafkaAvroSerializer

class StreamTest {

    @Test
    fun testStream() {
        val topologyTestDriver = TopologyTestDriver(topology, streamsConfiguration)
        val input: TestInputTopic<String, Any> = topologyTestDriver
            .createInputTopic(
                inputTopic,
                Serdes.String().serializer(),
                KafkaAvroSerializer(mockSchemaRegistryClient)
            )
        val output: TestOutputTopic<String, Any> = topologyTestDriver
            .createOutputTopic(
                outputTopic,
                Serdes.String().deserializer(),
                KafkaAvroDeserializer(mockSchemaRegistryClient)
            )

        input.pipeValueList(inputValues)
        assertEquals(output.readValuesToList(), inputValues)
        topologyTestDriver.close()
    }
}
```

For the test I am creating an input and output topic for my `topologyTestDriver`, I will be testing the `topology` by
validating that the values on the output topic match our expectation. Here our expectation is that it's the same
message being sent back.

### Integration test

For the integration test, you can re-use the same settings as a test for your usual consumer/producer using either an
embedded kafka or your preferred solution.
This is meant to test that it connects to Kafka gracefully. Those kinds of test may have bigger value for consumers and 
producers if you fine-tune the implementation and configuration. Regarding KafkaStreams, that might be overkill, 
an end-to-end test or a healthcheck would be enough in my opinion.

Let me know in the comment your thoughts on this 😉, 
you can still find an example of a kafka integration test in this [previous article][11]. 

## Conclusion

[KafkaStreams][1] while surprising at first, it is actually very well-designed for most applications interacting with Kafka.
Before, when the use-case would come, I would create an application with multiple producers and consumers adding
a lot of boilerplates to the project. With the KafkaStreams all that code can be reduced to a couple of lines, the 
configuration is done once, and the testing with the topology test driver has proven less flaky.

Although it has some more complexity upfront, it fits very well in an event-based architecture. It is not your silver
bullet, and if you are using SpringBoot's `@KafkaHandler` you can achieve something very similar coding wise as what
the KafkaStreams as to offer. But if you look into the internals, I can see some added [benefits][4] at [no extra costs][1].

What is the feature you like most about KafkaStreams? Or maybe you had a bad experience with it? 
I'd love to hear more about it! 🤓

[^1]: 
      <a href="https://docs.confluent.io/platform/current/streams/concepts.html#kstreams-concepts" alt="confluent">
        <span class="cit-authors">Confluent</span>, <span class="cit-title">Kafka Streams Concepts</span>
      </a>

[1]: https://www.confluent.io/blog/how-kafka-streams-works-guide-to-stream-processing/
[2]: https://developer.confluent.io/courses/kafka-streams/stateful-operations/
[3]: https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/serdes-avro.html
[4]: https://www.instaclustr.com/blog/kafka-streams-guide/
[5]: https://docs.confluent.io/platform/current/streams/concepts.html
[10]: {% post_url 2020/2020-02-07-Get-started-with-Kafka %} "kafka"
[11]: {% post_url 2023/2023-09-15-Kafka-with-springboot-in-kotlin %} "kafka with spring boot"
[12]: {% post_url 2021/2021-09-21-How-to-avro %} "how to avro"
[13]: {% post_url 2023/2023-10-20-Avro-schema-registry %} "avro schema registry"
