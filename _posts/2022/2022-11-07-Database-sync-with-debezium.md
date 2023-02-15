---
layout: post
title: Database sync with Debezium
color: rgb(110,201,152)
tags: [database]
---

[Debezium] is an open source project. Once deployed and started it will capture change in data within a database
and advertise it through [Kafka].
Let's have a look at what we can do with this new technology!

## Concept

It uses the [change data capture] pattern aka _cdc_ to determine and track changes in the data to send it
over Kafka.
With Debezium, you can react on db changes and propagate those as events via kafka messages on a topic. 
You could have application listening to those messages, but in our case we'll use it to synchronize two
databases.

### Connect

Debezium is built on top of [Kafka Connect] which is a system for moving data with Kafka 
using connectors.

You can either use the debezium/connect docker image which has already debezium installed, or
start from a kafka-connect image and install debezium within the Dockerfile.

Obviously you will need to have an instance of kafka running (check out this [tutorial][1]).

#### Source Connector

Debezium's strength is that it provides a range of source connectors for the most 
used Databases (SQL and NoSQL) out of the box and ready to use.
Since Kafka Connect offers a framework to create connectors, most database do have basic 
open sourced connectors which are the foundation of the Debezium connectors.

The connectors provided by Debezium can detect changes in the database and propagate those
using kafka events on a certain topic.

> Example: The [Debezium MySQL connector] reads the MySQL binlog which is an ordered record of all operations
> committed to the database.

#### Sink Connector

The sink connector is the consumer of the kafka event that will be sent by your source connector, 
it is responsible for handling the information and write it to the other database.

There's no involvement from Debezium on this side, the sink connector is usually available as well
as an open source library. (ex: [Mongo sink connector]).
You can use the sink connector to transform the received data with post processors or using a change
data capture handler (cdc handler).

### Diagram

Let's use a MySQL database as the source and a MongoDB as a destination for our example:

<div class="mermaid">
graph LR
    MySQL -->|Debezium <br>detects changes| DC(MySQL <br>Connector Source)
    DC -->|send changes on<br>topic: db.table| K(Kafka)
    K -->|read on <br>topic: db.table| MS(Mongo <br>Connector sink)
    MS -->|write <br>changes on| Mongo
</div>

## Implementation

Let's implement the MySQL to MongoDB sync as presented in the previous diagram.

### Debezium and Kafka

A pre-requisite is to have debezium and Kafka set up following this [tutorial][1],
using the debezium docker images.

I'll leave here the main commands, but be sure to read it, so you're not lost:

```shell
# Start Zookeeper
docker run -it --rm --name zookeeper -p 2181:2181 -p 2888:2888 -p 3888:3888 quay.io/debezium/zookeeper:2.0
# Start Kafka
docker run -it --rm --name kafka -p 9092:9092 --link zookeeper:zookeeper quay.io/debezium/kafka:2.0
```

For Debezium, you'll need to have the source database up (MySQL in our case) using the same docker link `mysql`,
so it can connect to it:

```shell
# Start Debezium and Kafka-Connect
docker run -it --rm --name connect -p 8083:8083 -e GROUP_ID=1 
  -e CONFIG_STORAGE_TOPIC=my_connect_configs 
  -e OFFSET_STORAGE_TOPIC=my_connect_offsets 
  -e STATUS_STORAGE_TOPIC=my_connect_statuses 
  --link kafka:kafka 
  --link mysql:mysql quay.io/debezium/connect:2.0
```

A docker-compose.yaml can be useful when dealing with multiple images.

### Source and target

#### MySQL DB

The source is going to be the MySQL db, for that you'll need to spawn one, here is a snipper from the docker compose:

```yaml
  mysql:
    image: mysql
    hostname: mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_USER: debezium
      MYSQL_PASSWORD: password
    ports:
      - 3306:3306
```

Then once up and running, we'll update the `debezium` user to give it the proper rights.
For that let's use the console to log into the db via the root user:

```shell
mysql -h 127.0.0.1 -P 3306 -u root -p
# The password is root
```

And here are the commands to run, first to enable password-based authentication for the debezium user, then to grant the
[necessary permissions] to manage the db's data.
```sql
ALTER USER debezium IDENTIFIED WITH mysql_native_password BY 'password';

GRANT RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO debezium;
GRANT SELECT, INSERT, UPDATE, DELETE ON company.* TO debezium;
```

For the writes requested most of them are to perform a snapshot of the DB and the `REPLICATION` ones are to be able to 
read the binlog.
let's create the database and table:

```sql
CREATE DATABASE company;

CREATE TABLE company.user (
    id INT PRIMARY KEY NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
);
```

So that if we need to add or update some value we'll be able to do it via those commands:

```sql
INSERT INTO company.user (id, first_name, last_name) VALUES (100, 'John', 'Doe');
UPDATE company.user SET last_name = 'Oliver' WHERE id = 100;
```

This will prove useful when trying out the effect of a _create_ vs an _update_ with the connectors.
With that done your MySQL source database should be all set.

#### Mongo DB

First we need to spawn a docker with our MongoDB, take a look at this snipper from my docker-compose.yaml:

```yaml
  mongo:
    image: mongo:latest
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: root
    ports:
      - 27017:27017
```

For MongoDB, you can follow the [installation documentation][4]. I like to use the MongoDB Compass client, but you 
could log using `nongosh` like we did with mysql via the console.
For the client use `mongodb://root:root@localhost:27017/?authMechanism=DEFAULT` as the uri to login.

We are going to create a new database and collection for our sink:

```js
use company-sync
show dbs                        // to show the created databases
db.createCollection("user")
show collections                // to show the created collections
```

Now that we have the source (_MySQL_) and the target (_MongoDB_) set up, we can start configuring our connectors for the
data sync using debezium.

### Connectors

#### Setup

Locally you can add a connector via sending its configuration to kafka-connect via a POST request, for example:

```bash
curl --location --request POST 'http://localhost:8083/connectors' \
--header 'Content-Type: application/json' \
--data @source.json
```

Once correctly added, you chan check the status of the connector using its name:

```bash
curl http://localhost:8083/connectors/{connector name}/status
```

The connector's name is defined in the json file with the configuration, they need to be unique. The endpoint will let
you know if the connector is _running_, _paused_ or _degraded_ with some information about its status.
If you need to remove it, use the connector's name from the configuration file and send a DELETE request such as:

```bash
curl -X DELETE localhost:8083/connectors/source-mysql
```

If you are using some custom jar for the connector class, post processor or the CDC handler, be sure to have it available
within the Kafka-Connect docker in _/usr/local/share/kafka/plugins/_.
In our case we would need:
- [debezium-connector-mysql][3] for our MySQL source connector class
- [mongo-kafka-connect][2] for our MongoDB sink connector class (and more...)

#### Connectors Source

Let's examine have a look at the configuration for our MySQL source:

```json
{
  "name": "source-mysql",
  "config": {
    "name": "source-mysql",
    "tasks.max": "1",
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "password",
    "database.server.id": "101010",
    "database.server.name": "mysql",
    "database.connectionTimeZone": "UTC",
    "database.allowPublicKeyRetrieval":"true",
    "topic.prefix": "db.sync",
    "schema.history.internal.kafka.bootstrap.servers": "broker:9092",
    "schema.history.internal.skip.unparseable.ddl": "true",
    "schema.history.internal.kafka.topic": "db.sync._schema_history",
    "database.include.list": "company",
    "table.include.list": "company.user",
    "column.include.list": "company.user.id, company.user.first_name, company.user.last_name"
  }
}
```

I don't need to be too thorough, the [Debezium MySQL connector properties] are well documented. Let's review the most
important ones:
- `database.*`: contains all the information of the source database, mostly how to connect to it.
- `database.include.list`: is to filter the dbs and only send changes for a database within that list.
- `table.include.list`: to filter based on the tables include in that list.
- `column.include.list`: even more specific to filter changes only from the columns from a table from a database in that list.
  - No need for `database.include` or `table.include` when using this one.
- `topic.prefix`: Will be put at the beginning of the topic for each sync events such as:
  - Topic by default **{prefix}.{db name}.{db column}**

There's also a part where you can define more information about the Kafka connection, 
but we don't need it in this example, but you can have a look in the well-made [confluent documentation].

#### Connector Sink

Now for the connector sink for MongoDB, we have this configuration:

```json
{
  "name": "sink-mongo",
  "config": {
    "name": "sink-mongo",
    "tasks.max": "1",
    "connector.class": "com.mongodb.kafka.connect.MongoSinkConnector",
    "connection.uri": "mongodb://root:root@mongo-target:27017",
    "database": "mongo",
    "collection": "sync",
    "topics": "db.sync.company.user",
    "writemodel.strategy": "com.mongodb.kafka.connect.sink.writemodel.strategy.InsertOneDefaultStrategy",
    "change.data.capture.handler": "com.mongodb.kafka.connect.sink.cdc.debezium.rdbms.mysql.MysqlHandler"
  }
}
```

Same as for the MySQL connector, we have some information on the database and how to connect to it via it's uri.
Let's have a look at the three most interesting things in this configuration:
- `topics`: This is the list (comma separated) of kafka topic the sink connector will be listening to.
- `writemodel.strategy`: The [strategy][5] used to insert the data into the MongoDB.
- `change.data.capture.handler`: The CDC handler that will interpret the MySQL data to transform it in a MongoDB format.
   It reproduces the change as if it occurred in Mongo.

In this example I didn't use the `post.processor.chain` which can be used instead of the CDC Handler to transform the
data by applying one after the other a list of post processors (to filter the fields, rename them and more with your
own custom ones).

## Conclusion

[Debezium] is fast and reliable, using the power of [Kafka connect], it proves itself as a
strong scalable solution.
Debezium can run on Kubernetes and you can use a [Kubernetes KafkaConnector] instead of a plain
json file to define your connectors.

In our example we used MySQL to MongoDB, but we could also have replicated the data to more than one
database.
Also instead of using debezium standalone, you could also use it within a microservice and have better
control over the way the data gets sent with some pre-processing.

The possibilities are very wide, besides database replication, it's the whole concept of manually sending
kafka events on data change that could be done automatically.

[1]: https://debezium.io/documentation/reference/stable/tutorial.html
[2]: https://search.maven.org/artifact/org.mongodb.kafka/mongo-kafka-connect
[3]: https://search.maven.org/search?q=debezium-connector-mysql
[4]: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/
[5]: https://www.mongodb.com/docs/kafka-connector/current/sink-connector/fundamentals/write-strategies/#update-one-timestamps-strategy
[Kafka]: https://kafka.apache.org/
[Kafka connect]: https://kafka.apache.org/documentation.html#connect
[Debezium]: https://debezium.io/
[Debezium MySQL connector]: https://debezium.io/documentation/reference/stable/connectors/mysql.html
[Debezium MySQL connector properties]: https://debezium.io/documentation/reference/connectors/mysql.html#_required_debezium_mysql_connector_configuration_properties
[debezium/connect]: https://hub.docker.com/r/debezium/connect
[Mongo sink connector]: https://www.mongodb.com/docs/kafka-connector/current/sink-connector/
[change data capture]: https://en.wikipedia.org/wiki/Change_data_capture
[Kubernetes KafkaConnector]: https://debezium.io/documentation/reference/stable/operations/kubernetes.html#_creating_a_debezium_connectoo
[necessary permissions]: https://debezium.io/documentation/reference/0.10/connectors/mysql.html#create-a-mysql-user-for-the-connector
[confluent documentation]: https://docs.confluent.io/kafka-connectors/debezium-mysql-source/current/mysql_source_connector_config.html#debezium-mysql-source-connector-configuration-properties
