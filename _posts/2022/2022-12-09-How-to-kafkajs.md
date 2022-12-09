---
layout: post
title: How to kafka in Typescript
color: rgb(243, 132, 173)
tags: [js]
---

If you are not familiar with [Kafka] then I suggest this [article][10] to get the basics. But if you've landed here, it's 
either because you are curious 🤓 or you want to know more about [KafkaJS] and how to implement it with typescript.

I am assuming in this article that you have your application already created and working, so we don't start everything
from scratch otherwise check this [article][11] to configure your typescript project.

Let's dig in! 👷‍

## KafkaJS

[KafkaJS] is a node.js library to integrate with the apache [Kafka] message bus. 
It's well maintained, well-built library that can be used in your project. 

Start by installing it in your project using:

```shell
npm i kafkajs
```

Now you should be ready to start implementing the key elements to product and consume messages in Kafka.
You can also follow up the Kafka JS [getting started] procedure for additional information.

## Implementation

Let's review the consumer and producer implementation.

### Kafka

Before creating a producer and a consumer, you'll need to create a `kafka` which will hold all the information necessary
to create a producer and consumer that will be integrated with it.

If you need some `SASL_SSL` or other settings to connect to your Kafka cluster, you'll need to pass all this configuration
within the `KafkaConfig`, the mandatory setting is the brokers' address:

```ts
import { Kafka, KafkaConfig } from 'kafkajs';

const kafkaConfig: KafkaConfig = { brokers: ['localhost:9092'] }
const kafka = new Kafka(kafkaConfig)
```

With that we have our kafka object setup, and we will be able to use it for the next part.

### Producer

The producer will be in charge of sending your messages to Kafka, first you'll need to connect, then send.
The only case you'll need to disconnect is when the app needs to switch off.

```ts
import { Producer } from 'kafkajs';

const producer = kafka.producer()
await producer.connect()
await producer.send({
  topic: 'test-topic',
  messages: [
    { headers: { source: 'test-app' } },
    { value: 'Hello KafkaJS user!' },
  ],
})
```

The value here in the messages can be either a string or a Buffer (bytes) which is used with [avro][12]. In our case we
don't encode or use schema, it's plain raw string.
The message follow the `Message` type, you have flexibility there to customized the record being sent.

### Consumer

For the customer, it comes from the kafka object and can connect and disconnect, its main feature is to handle the 
message it will receive on the subscribed topics:

```ts
import { Consumer, EachMessagePayload } from 'kafkajs';

const consumer = kafka.consumer({ groupId: 'test-group' })

await consumer.connect()
await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })
await consumer.run({
  eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
    console.log({
      value: message.value?.toString(),
    })
  },
})
```

Here the previous producer sends record on _test-topic_ which can be consumed by this consumer which will log the record's
message value.
There's no decoding since we know in this case that the value will be a string.
You can pass more kafka settings within the consumer using the `ConsumerConfig` interface.

## Recommendation

A list of recommendation on how to use those newly learnt skills within your project.

### Wrapper

Use a wrapper class around your producer and consumer, so you can have more control of what happens when it connects, 
disconnects.
You can also implement and catch exception when it fails to connect or send a message that way to make your producer more
robust.

```ts
export class MyConsumer {
  private readonly consumer: Consumer;
  
  // Encapsulate the kafkajs consumer from the rest of your application
}
```

Using a wrapper, you can have a `isConnected` value that gets set upon connection to true, and to false if it crashes or
anything happen. This can be useful for a healthcheck or other.

Having a Wrapper class will also make it easier to integrate within your project.

### Interface

You want to create interface for multiple reason, one of them is that if you switch from Kafka to another message bus, 
then you don't need to rewrite too much code, just change the consumer class.

The second is that it will be easier to stub or mock in your class. As you may know, [jest][13] is not the best when it
comes to mock classes, so having an interface will make your like much easier:

```ts
export interface SimpleConsumer {
  connect(): Promise<void>;
  handle(message: any): Promise<void>
  disconnect(): Promise<void>;
}

export class MyConsumer implements SimpleConsumer {
  private readonly consumer: Consumer;

  connect(): Promise<void> {
    return this.consumer.connect()
      .then(() => this.consumer.subscribe({ topic: this.config.topic }))
      .then(() => this.consumer.run({ eachMessage: payload => this.handle(payload) }))
      .catch(e => console.log(`Can't connect ${e}`));
  }
  
  handle({ topic, partition, message }: EachMessagePayload): Promise<void> {
    // handling of received message
  }

  disconnect(): Promise<void> {
    return this.consumer.disconnect()
      .catch(e => console.log(`Error on disconnect ${e}`));
  }
}
```

Now your application can just rely on `SimpleConsumer` instead of the class `MyConsumer`, so that if you add more 
methods that are peculiar to your kafka connector, you don't need to update the unit tests or the main code.

As you can see I am updating the `connect` and `disconnect` method with a bit of error catching, and on connect I am
both subscribing and running the KafkaJs consumer at the same time.

### Handlers

They are simple components to handle the messages consumed by the handler.
In the previous example the `consumer.run({ ... })` a handle method was passed, instead of declaring all the methods
directly within the run it's best to create handlers that can easily be unit tested that will take care of the message.

```ts
export function logMessageHandler(message: KafkaMessage) {
  return console.log({
    value: message.value?.toString(),
  })
}
```

You may want to have more than one handler to execute different action based on the message's value, its topic or 
whichever logic you may see fit in the `handle` method.
In this example we could test the `logMessageHandler` independently of the consumer.

### Factory

For Kafka Producer and consumer it's a very good example where the [Factory design pattern] becomes really helpful.
As you can see both producer and consumer comes from the same kafka object, they share the same basic kafka configuration
as they need to connect to it.

So since you have your wrapped consumer and producer, and your interface, you can have your own factory as well. We'll 
have an interface as well and use it to create our own KafkaFactory

```ts
export interface MessagingFactory {
  producer(configuration: ProducerConfiguration): SimpleProducer;
  consumer(configuration: ConsumerConfiguration): SimpleConsumer;
}
```

Usually the `ProducerConfiguration` and `ConsumerConfiguration` only need the topic, but you can have more settings in 
them for logging, tracing, or anything technology specific.
Your `KafkaFactory` that implements this interface will take care of creating the kafka object and create the 
_MyConsumer_ and _MyProducer_ classes for you (which will respect the _SimpleProducer_ and _SimpleConsumer_ interfaces).

Having the factory taking care of the creation of the producer and consumer will make your code easier to read since
all the configuration details are abstracted.

## Testing

### Unit tests

Producer should not have too much logic, just send to Kafka which is already tested by the library. So you don't need a
live kafka for the unit tests. Same for testing the consuming logic.

With the logic extracted and encapsulated in handler, there should not be much left in the consumer to cover within your
tests.
For extended use cases, you can use a mock kafka which will basically store the messages that were sent from the 
producer and apply them to the subscribed consumer.
[KafkaJS] has some example on how to create such a mock kafka, but you can make a simpler version of that mock on your
own.

### Integration test

The only thing you want to check, if designed properly is that the configuration you are passing to your consumer and
producer is working and that they can connect to Kafka.

That's to say, unless you're in the final environment you may not be able to replicate. In those case a smoke test
once the application is running in an integration environment where you can assert the production and consumption of
message should be a good idea.

However, you can still test basic kafka connection locally, but it requires a local kafka. Using your node application
you may be able to either connect to a containerized kafka which is a bit annoying adding an external dependency
that you need to set up prior to run the test. 😬
Or you could spawn one container using [test-containers-node] within the test, using the `KafkaContainer` but
adding a couple of minutes to your test (downloading the docker image and start it).


[Kafka]: https://kafka.apache.org/
[KafkaJS]: https://kafka.js.org/
[getting started]: https://kafka.js.org/docs/getting-started
[Factory design pattern]: https://en.wikipedia.org/wiki/Factory_method_pattern
[test-containers-node]: https://github.com/testcontainers/testcontainers-node
[10]: {% post_url 2020/2020-02-07-Get-started-with-Kafka %}
[11]: {% post_url 2022/2022-12-02-Configuring-typescript %}
[12]: {% post_url 2021/2021-09-21-How-to-avro %}
[13]: {% post_url 2022/2022-09-21-Jest-testing %}
