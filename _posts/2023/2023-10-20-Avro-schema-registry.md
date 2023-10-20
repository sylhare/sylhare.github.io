---
layout: post
title: How to Kafka with an Avro schema registry
color: rgb(244,131,81)
tags: [kotlin]
---


We already talked about [Avro][10], the syntax for the [schema][8], how to [build a consumer and a producer][11] 
and [kafka][12] in general.
So let's mix it all together for an article about implementing kafka producer and consumer using Avro in Kotlin.

I will be mainly relying on [confluent][1] for the avro library and its registry, because that is the main company in the field, but
Kafka being open source, it could be homemade (but that would be a bit of waste not reusing what's already there).
We will start straight with the implementation using the [confluent schema registry][2], and then go into more details
about how it works.

## Implementation

### Gradle plugin to generate POJO from avro

It will be generated in Java, but that does not matter for Kotlin.
I will be using [davidmc24][3] avro generation [gradle plugin][7].

Let's have a look at the `build.gradle.kts` to make it work, be sure to put your avro schemas within the source folder
in `src/main/avro` for it to work properly. It is the standard, but that can be modified in the generation task as well.

```kotlin
import com.github.davidmc24.gradle.plugin.avro.GenerateAvroJavaTask

plugins {
 kotlin("jvm") version "1.3.50"
 java
 id( "com.github.davidmc24.gradle.plugin.avro-base") version "1.2.0"
}

repositories {
 gradlePluginPortal()
}

// To add the generateAvroJava task 
tasks.register<GenerateAvroJavaTask>("generateAvroJava") {
 source("src/main/avro")
 setOutputDir(file("build/generated-main-avro-java"))
}

// To generate avro classes before compiling Kotlin
tasks.withType<KotlinCompile> {
 kotlinOptions {
  freeCompilerArgs = listOf("-Xjsr305=strict")
  jvmTarget = "1.8"
 }

 dependsOn("generateAvroJava") // So avro is generated
}
```

Now you can try to generate the schema using `gradle generateAvroJava` or it should be generated automatically when
building the gradle project.

### Extra libraries 

For the producer and consumer to use avro, we'll need some more confluent libraries, so let's add that into our build file:

```kotlin
repositories {
    mavenCentral()
    maven("http://packages.confluent.io/maven/")
}

dependencies {
    implementation("org.apache.kafka:kafka-clients:2.3.0")
    implementation("org.apache.avro:avro:1.10.2")
    implementation("org.apache.avro:avro-tools:1.10.2")
    implementation("io.confluent:kafka-avro-serializer:5.5.1")
}
```

We need an extra repository to fetch the confluent-specific libraries, like the avro serializer to use with the 
confluent schema registry. Without the registry, you could one generic for bytes (avro schema needs to be serialized as
bytes) from `org.apache.kafka.common.serialization` which is the open source kafka library.

### Producer

Now that we have the necessary package, let's configure our producer. We'll be using some of the default properties,
and use the variables for the name of the ones we want to update for our avro producer:

```kotlin
import io.confluent.kafka.serializers.KafkaAvroSerializer
import io.confluent.kafka.serializers.KafkaAvroSerializerConfig
import io.confluent.kafka.serializers.subject.TopicRecordNameStrategy
import org.apache.kafka.clients.producer.KafkaProducer
import org.apache.kafka.clients.producer.ProducerConfig

import avro.model.PositionKey
import avro.model.PositionValue

fun kafkaAvroProducer(): KafkaProducer<PositionKey, PositionValue> {
  val settings = Properties()
  settings[ProducerConfig.BOOTSTRAP_SERVERS_CONFIG] = "localhost:9092"
  settings[ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG] = StringSerializer::class.java
  settings[ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG] = KafkaAvroSerializer::class.java
  settings[KafkaAvroSerializerConfig.SCHEMA_REGISTRY_URL_CONFIG] = "http://schema-registry:8081"
  settings[KafkaAvroSerializerConfig.VALUE_SUBJECT_NAME_STRATEGY] = TopicRecordNameStrategy::class.java
  return KafkaProducer(settings)
}
```

To send records, it's the same as any other producer, build the record with the avro objects and use `producer.send(record)`
and off it goes.
The [schema registry][5] is hardcoded for the sake of this example, but you need to pass the url for the producer to use it.

Since we're using avro, we set the value serializer to the `KafkaAvroSerializer`, which will serialize the data using
the schema's id from the register. The `VALUE_SUBJECT_NAME_STRATEGY` does not necessarily need to be set, but we will be
talking about the different strategies later, so it's important to know which option it matches to.

### Consumer

We're going to use the schema registry in this example as well, we should have all the dependencies from before.
The construction of the consumer is similar to the producer one.

```kotlin
fun kafkaAvroConsumer(): KafkaConsumer<PositionKey, PositionValue> {
  val settings = Properties()
  settings[ProducerConfig.BOOTSTRAP_SERVERS_CONFIG] = "localhost:9092"
  settings[ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG] = StringSerializer::class.java
  settings[ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG] = KafkaAvroDeserializer::class.java
  settings[KafkaAvroDeserializerConfig.SPECIFIC_AVRO_READER_CONFIG] = "true"
  settings[KafkaAvroDeserializerConfig.SCHEMA_REGISTRY_URL_CONFIG] = "http://schema-registry:8081"

  return KafkaConsumer(settings)
}
```

The `SPECIFIC_AVRO_READER_CONFIG` is to parse it to the correct Java object generated by the plugin from the avro schema
when you only expect one type, without it, it will be treated as a `GenericRecord` which can then be cast to another
object.

For the consumer, if integrated with spring kafka, you can use a `@KafkaListener` as we looked before, or you can just
use a `consumer.poll(Duration.ofMillis(100)).forEach { printf("${it.value()}") }` which is more low level from the
kafka library.

## How does the schema registry work?

The avro schema registry is to ensure compliance, but you could use [avro schema][8] without it and serialize/deserialize as
bytes with a `ByteArraySerializer`/`ByteArrayDeserializer`, you can build the avro's POJO from the bytes using a method
from the generated class: `PositionValue.fromByteBuffer(ByteBuffer.wrap(record.value));`.

The other way around is true. You could use a registry without avro, only using json (which is compatible with the
confluent registry)

Let's first have a diagram of the flow, then highlight the interesting parts.

### Diagram

Let's say we have a producer, a consumer, a schema registry and a kafka broker, here's the sequence diagram of how a 
message would be sent using an avro schema and the registry (like we learned how to configure above in kotlin):

<div class="mermaid">
sequenceDiagram
    participant P as Producer
    participant R as Schema Registry
    participant K as Kafka
    participant C as Consumer
    P -->> R: Register schema
    R -->> P: Send schema id
    Note Right of R: The schema is uploaded<br>in the registry
    P ->> K: Send message (Using schema id)
    Note Right of P: The schema itself<br>is not sent.<br>Only the id and payload.
    K ->> C: Consume message
    C --> R: Check schema compatibility
    Note right of C: Record is processed<br>successfully.
</div>

The schema registry has a [REST endpoint][9] to interact with it. 
This is used under the hood by both producer and consumer. So it might be a bit slower on the first run, but then once
register the producer does not need to re-register for each new message to send.

The registered schema id is used for the avro serialization and deserialization.

### Schemas in the registry

The registry saves the schema resource, which consists of the schema itself, a subject 
(the [Schema Registry][2] defines a scope in which schemas can evolve, and that scope is the subject) and
a version (which is used to check compatibility). The [REST endpoint][9] for the registry is pretty
straightforward and can be used to validate the registered resources.

The schema saved in the registry may evolve depending on your [compatibility configuration][13], that why we talked 
about versions. 
For example, setting it to `BACKWARD` means that on your schema, you can:
- add new _optional_ fields
- delete old fields 
The opposite is `FORWARD` which allows you to:
- add new fields
- delete _optional_ fields

An optional field means that it does need to be present and will fall back to a default value like `null`, 
while a not optional field must be present and have a value which can be `null`.

### Schema and topic name strategy

The naming strategy is related to how the schema's subject will be created, and drives the compatibility of a schema
in a topic for its consumption.

There are some main [strategies][14] that we explored [before][10] and can be configured using:

```yaml
# E.g. for the RecordNameStrategy strategy
value.subject.name.strategy=io.confluent.kafka.serializers.subject.RecordNameStrategy
```

The main [confluent strategies][15] are:

**TopicNameStrategy**
- To allow on one single type of message to be published on the topic (all schemas must be compatible with each other)
- The subject for the schema resource will be built as `{topic name}-value` for the payload.
- Default strategy
**RecordNameStrategy**
- To [allow multiple types of event in one topic][6] and order needs to be maintained
- Compatibility is checked on the type level regardless of the topic
- The subject for the schema will be `{namespace}.{name}` (e.g.: `com.github.avro.PositionValue` known as record's name too)
**TopicRecordNameStrategy**
- To allow multiple types of messages in one topic
- Compatibility on the current topic only, so if the schema has changed on another topic, it won't impact this topic's compatibility. 
- The subject for the schema resource will be `{topic name}-{namespace}.{name}`.

If you encounter a `SerializationException`, then it might be due to an issue with your schema, and you might either 
revise it or re-think your name strategy for that topic. In case of mistake, you could use the `DELETE` API, or go with
a v2 version of your topic/schema.

I suggest reviewing the [confluent's fundamentals][16] on the schema registry if some concepts are still fuzzy,
this should _unfizz_ them! 🙃

[1]: https://www.confluent.io/blog/creating-data-pipeline-kafka-connect-api-architecture-operations/
[2]: https://docs.confluent.io/platform/current/schema-registry/index.html
[3]: https://github.com/davidmc24/gradle-avro-plugin
[4]: https://github.com/dilipsundarraj1/kafka-for-developers-using-schema-registry#readme
[5]: https://medium.com/@stephane.maarek/how-to-use-apache-kafka-to-transform-a-batch-pipeline-into-a-real-time-one-831b48a6ad85
[6]: https://www.confluent.io/blog/multiple-event-types-in-the-same-kafka-topic/#constructs-and-constraints
[7]: https://thecodinginterface.com/blog/gradle-java-avro-kafka-clients/
[8]: https://avro.apache.org/docs/1.11.1/specification/_print/
[9]: https://docs.confluent.io/platform/current/schema-registry/develop/api.html#schemas
[13]: https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html
[14]: https://www.confluent.io/blog/put-several-event-types-kafka-topic/
[15]: https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/index.html#how-the-naming-strategies-work
[16]: https://docs.confluent.io/platform/current/schema-registry/fundamentals/index.html
[10]: {% post_url 2021/2021-09-21-How-to-avro %}
[11]: {% post_url 2023/2023-09-15-Kafka-with-springboot-in-kotlin %}
[12]: {% post_url 2020/2020-02-07-Get-started-with-Kafka %}
