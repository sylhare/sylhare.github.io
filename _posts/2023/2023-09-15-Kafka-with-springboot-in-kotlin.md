---
layout: post
title: Kafka with springboot in Kotlin
color: rgb(44, 150, 191)
tags: [kotlin]
---

In this article, we will have an overview of how to set up kafka in a spring boot project in kotlin.
From the configuration to the consumer and producer, and how to make sure it works properly with 
an integration test.

## Installation

Since we are using Kafka with springboot, you will need to add those libraries to your project in 
your `build.gradle.kts` file in addition to the other junit and spring dependencies.

```kotlin
dependencies {
    implementation("org.springframework.kafka:spring-kafka")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    testImplementation("org.springframework.kafka:spring-kafka-test:2.6.5")
}
```

To get the regular spring project dependency, create a project with the [spring initializer][1].
As you can see there are two kafka dependencies one for the implementation and the other for the tests.

## Kafka configuration

For the config, we're using the default, and updating any value necessary.
For the serializer, the default is string else you can use an Avro one (if you have set it up with the registry).
For json, if it can't deserialize it will fail in loop, it's called the _poison pill_ pattern.
So you may want to log it and discard so your consumer doesn't get stuck.

Here is the configuration for a consumerFactory that will be used to create our kafka consumer.

```kotlin
@Configuration
open class Config {

    @Autowired
    private lateinit var kafkaProperties: KafkaProperties

    private fun consumerFactory(): ConsumerFactory<String, Foo> {
        val configs = kafkaProperties.buildConsumerProperties()
        configs[ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG] = StringDeserializer::class.java
        configs[ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG] = JsonDeserializer::class.java

        return DefaultKafkaConsumerFactory(configs, StringDeserializer(), JsonDeserializer<Foo>())
    }

    @Bean(name=["fooKafkaListenerContainerFactory"])
    open fun kafkaListenerContainerFactory(): ConcurrentKafkaListenerContainerFactory<String, Foo>? {
        val factory: ConcurrentKafkaListenerContainerFactory<String, Foo> = ConcurrentKafkaListenerContainerFactory()
        factory.consumerFactory = consumerFactory()
        return factory
    }
}
```

With springboot you can have specific kafka configuration (broker ip and such) that can be picked up automatically,
so you can just autowire it without any config (it'll use the default plus what's in the config).
Here is an example of the configuration you may have inside your application.yml file:

```yaml
kafka:
  security-protocol: "${KAFKA_SECURITY_PROTOCOL:PLAINTEXT}"
  username: "${KAFKA_USERNAME:user}"
  password: "${KAFKA_PASSWORD:password}"
  bootstrap-servers: "${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}"
  sasl:
    mechanism: "${KAFKA_SASL_MECHANISM:PLAIN}"
  ssl:
    enabled: false
    protocol: "TLS"
    enabled-protocols: "TLSv1.2,TLSv1.1,TLSv1"
```

But that level of "magic" that spring is known for, might not be the best to the best understanding of what is being used
nor does it make it stable in case something is dropped in the future.
I'd rather be explicit with configuration on the items that matters, this
way you know where urls and credential are taken from to ease integration issues investigation.

The sensitive information is passed via environment variables, and we have a default value for local development.

## Create a consumer

### From a Class

We use a KafkaHandler annotation in a kafkaListener annotated class to handle different records.
You must use the `@Payload` annotation for the consumed type.

Additional configuration can be set within the `@KafkaListener` annotation:

- **groupId**: Consumers with the same group id will share the load of the topic (they will divide the partitions
  between themselves). If you set different group ids, they'll consume the same message.
- **topics**: The topic to consume from, set via the application.yml file.
- **containerFactory**: The factory to use to create the consumer.

```kotlin
@KafkaListener(
    groupId = "foo-group",
    topics = ["\${app.topic.consumer}"],
    containerFactory = "fooKafkaListenerContainerFactory"
)
@Component
class FooConsumer {

    val foos = mutableListOf<Foo>()

    @KafkaHandler
    fun consume(@Header(KafkaHeaders.RECEIVED_TIMESTAMP) received: Long, @Payload foo: Foo) {
        println("Consuming Request: $foo received at $received")
        foos.add(foo)
        println("All received: $foos")
    }

}
```

This basic example will add the consumed Foo records to a list and print the output.
If you have an issue with trusted packages for the json deserialization check this [answer][2] 💬,
and upvote if it helped you or leave me a comment if it didn't.

### From a method

Using the class is great, to give fine grain control over the consumption, but if you have multiple
messages or topic you want to consume from you may be interested to set up the consumer on a method
in a component class.

The `@KafkaListener` works the same way as for class:

```kotlin
@Component
class FooListener {

    @Autowired
    lateinit var fooService: FooService

    @KafkaListener(
        groupId = "foo-listener-group",
        topics = ["\${app.topic.consumer}"],
        containerFactory = "fooKafkaListenerContainerFactory"
    )
    fun consume(foo: Foo) {
        fooService.handle(foo);
    }
}
```

This small listener component has a kafka consumer that calls the `fooService` to handle the received _foo_
records.

## Create a producer

The configuration will work similarly to the consumer, both will be using the same configuration
to connect to kafka.
Since we're using the default json configuration, it's fairly straightforward, and we can now use
our `kafkaTemplate` (to follow the naming pattern like the `restTemplate` in spring) to send message to kafka:

```kotlin
@Configuration
open class Config {

    @Autowired
    private lateinit var kafkaProperties: KafkaProperties

    @Bean
    open fun kafkaTemplate(): KafkaTemplate<String, Foo> {
        return KafkaTemplate(DefaultKafkaProducerFactory(kafkaProperties.buildProducerProperties()), true)
    }
}
```

Once everything is configured properly, 
you can autowire the kafka template in your producer to send the record on the specified topic.

```kotlin
@Component
class FooProducer {

    @Autowired
    private lateinit var kafkaTemplate: KafkaTemplate<String, Foo>

    @Value("\${app.topic.producer}")
    private lateinit var topic: String

    fun send(@Payload data: Foo) {
        println("sending data:$data to topic:'$topic'")
        kafkaTemplate.send(topic, "key", data)
    }
}
```

Here I have created a dummy producer component that can send `Foo` records on a specific topic in kafka.
The topic is passed via the configuration in the application.yml file.

## Integration test

To test it out you can use the embedded kafka in an integration test. 
However, the only way to test the actual configuration will be against the actual topic. 
But at least if it works with locale config, you'll know that it's not a code issue but a config issue if it fails in prod.

Whether it's on the class or the method, the consuming logic can be tested the same way.
I will be mocking the `FooService` dependency, because it doesn't do anything, but ideally you
should not. Because there should be some business logic happening allowing you to make a worthwhile test. 

```kotlin
@SpringBootTest(
    properties = [
        "spring.kafka.producer.bootstrap-servers=localhost:3392",
        "spring.kafka.consumer.bootstrap-servers=localhost:3392",
        "app.topic.consumer=test-topic",
        "app.topic.producer=test-topic"
    ]
)
@EmbeddedKafka(partitions = 1, brokerProperties = ["listeners=PLAINTEXT://localhost:3392", "port=3392"])
@DirtiesContext
internal class FooListenerTest {

    @TestConfiguration
    open class TestConfig {
        @Bean
        open fun fooService() = mockk<FooService>()
    }

    @Autowired
    private lateinit var fooService: FooService

    @Autowired
    private lateinit var fooProducer: FooProducer

    @Test
    fun consumeFoo() {
        every { fooService.handle(any()) } just runs
        val foo = Foo("example", "description")
        fooProducer.send(foo)
        verify(timeout = 1000, atMost = 5) { fooService.handle(foo) }
    }
}
```

In this case I am using my own producer to test my consumer, because it produces Foo records.
So I don't need in this case to create a test producer and I can validate both producer and consumer in one shot.

In this test, I am using the `@SpringBootTest` to specify the configuration so the application will
connect to the embedded kafka that is spawned for the test.
I use the `@EmbeddedKafka` and specify matching configuration. The `@DirtiesContext` is used to clean the 
cached context after the test.

[1]: https://start.spring.io/
[2]: https://stackoverflow.com/a/61963869/7747942
