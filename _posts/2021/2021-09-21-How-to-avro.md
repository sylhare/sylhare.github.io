---
layout: post 
title: How to avro with Kafka 
color: rgb(181, 90, 48)
tags: [database]
---

### Avro

[Apache Avro](https://avro.apache.org/docs/current/spec.html) is an open source data serialization system. You can also
find documentation on [confluent](https://www.confluent.io/blog/avro-kafka-data/) which may be more user-friendly.

- Avro is a schema format created and used with [Kafka](https://kafka.apache.org/).
- Maps to JSON (works with many programming language)
- Allow for better robustness with the evolution of the data over time (with the registry)
- Support for [logical types](https://avro.apache.org/docs/current/spec.html#Logical+Types) (for types languages like
  Java)

### With Schema Registry

The Schema registry makes sure your avro schemas stay synced between apps. The most known is the Confluent solution. the
basic idea is to provide a source of truth so that every consumer and producer understands each other.

It keeps track of the schema versioning. You can set the schema to be compatible following
some [types](https://docs.confluent.io/platform/current/schema-registry/avro.html#compatibility-types) for example:

- [BACKWARD](https://docs.confluent.io/platform/current/schema-registry/avro.html#backward-compatibility): To delete
  fields and add new optional ones
- [FULL](https://docs.confluent.io/platform/current/schema-registry/avro.html#full-compatibility): To add and delete
  optional fields

### Subject Name Strategy

When in use with a schema registry you can set your schema to follow a certain strategy:

- [TopicNameStrategy](https://docs.confluent.io/current/schema-registry/serdes-develop/index.html#overview): To set one
  schema to one topic (default)
- [RecordNameStrategy](https://docs.confluent.io/current/schema-registry/serdes-develop/index.html#overview): To put
  multiple schema on one topic based on the record name

To set it you may use those variables with `TopicNameStrategy` or `RecordNameStrategy`:

```properties
confluent.value.subject.name.strategy=io.confluent.kafka.serializers.subject.RecordNameStrategy
confluent.key.subject.name.strategy=io.confluent.kafka.serializers.subject.RecordNameStrategy
```

#### Union

You can also join your schemas in a `com.github.event.PostEvents.avsc` which contains other schema.

```json
[
  "com.github.event.PostUpdated",
  "com.github.event.PostCreated",
  "com.github.event.PostDeleted"
]
```

Using this _union_, you can use a `TopicNameStrategy` with the `com.github.event.PostEvents` schema and thus have more
than one schema available in your topic.

### Schema

#### The basis

When using avro with a jvm based language, it's better to use as a namespace the path to the schema.

```groovy
.
└── src
    └── main
        ├── avro
        |   └── com
        |       └── github
        |           └── event
        |               ├── Example.avsc
        |               └── Custom.avsc
        └── java
            └── // Your java classes
```

An avro record `Example.avsc` as an example:

```json
{
  "namespace": "com.github.event",
  "type": "record",
  "name": "Example",
  "fields": [
    {
      "name": "name",
      "type": "string"
    },
    {
      "name": "custom",
      "type": "com.github.event.Custom"
    }
  ]
}
```

That's a simple schema, with simple fields with a primitive type `string` and a custom logical
type `com.github.event.Custom`.

#### Basic fields

For custom types (e.g. `com.github.event.Custom`) or simple types (e.g. _"string"_, _"boolean"_, _"double"_), you can
define a field simply with:

```json
{
  "name": "isEnabled",
  "type": "boolean"
}
```

#### Decimal fields

For decimal fields use the type `bytes`.

```json
{
  "name": "myDecimalField",
  "type": {
    "type": "bytes",
    "logicalType": "decimal",
    "precision": 30,
    "scale": 10
  }
}
```

#### Enum fields

Enum fields only allows the values described in the schema. If you update the values of an enum it can be considered as
a breaking change.

```json
{
  "name": "enumField",
  "type": {
    "name": "EnumField",
    "type": "enum",
    "symbols": [
      "FIRST_VALUE",
      "SECOND_VALUE"
    ]
  }
}
```

#### Array fields

For arrays, you'll have to use the type `array` then specify in `item` the type of array.

```json
{
  "name": "myArraySuperField",
  "type": {
    "type": "array",
    "items": "com.github.event.MyArrayItem"
  }
}
```

Here in java it could translate to something like:

```java
import com.github.event.MyArrayItem;

List<MyArrayItem> myArraySuperField;
```

#### Nullable fields

Keep in mind that you can't set non-nullable field to null otherwise it will create a serialization / deserialization
error.

```json
{
  "name": "myNullableField",
  "type": [
    "null",
    "string"
  ]
}
```

And here you have a field that accepts null as value.

> ⚠️ Boolean fields can't be nullable
 
Deserialization error can happen with a record, you may want to use deserializers that can catch those errors, so your
consumers don't get stuck on a bad record (this is called
the [poison pill pattern](https://www.confluent.io/blog/spring-kafka-can-your-kafka-consumers-handle-a-poison-pill/)).


#### Optional fields

Optional fields can be omitted from the schema because they have a default value. Optional fields follow this syntax:

```json
{
  "name": "myOptionalField",
  "type": [
    "null",
    "string"
  ],
  "default": null
}
```

- The "default" value must be `null`

Just setting the type as `"type": ["null", "string"]` is not enough to create an optional field, because it only puts
the field as nullable. Meaning it can't be omitted from the schema, but it can be set to null.
