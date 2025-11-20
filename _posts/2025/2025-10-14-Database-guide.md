---
layout: post
title: A database and usage overview
color: rgb(191 44 31)
tags: [database]
---

Here is a quick cheat sheet for database, when and why use them.
There's also some other section with common database questions and vocabulary.
It's none exhaustive, AI helped so use it as a starting point.
(I didn't have the opportunity to test all the use cases in production)

## Database Technologies Comparison

| Category              | Use Case                                | Technology                           | Specifications                                                                    | Why Use It                                                                                                                     |
|-----------------------|-----------------------------------------|--------------------------------------|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **SQL**               | High-volume transactions                | [PostgreSQL][1]                      | 40,000+ TPS, ACID compliance, <1ms query latency on indexed columns               | Strong consistency guarantees for financial systems (e.g., processing payments with concurrent balance updates)               |
| **SQL**               | Multi-tenant SaaS                       | [MySQL][2]                           | 10,000+ connections, table partitioning by _tenant_id_, read replicas for scaling | Isolates customer data while sharing infrastructure                                                                            |
| **SQL**               | Geospatial queries                      | [PostGIS][3]                         | Sub-100ms for radius queries, GiST/SP-GiST indexes, handles 2D/3D geometries      | Finds all restaurants within 5km radius of user location                                                                       |
| **Cache**             | User session management                 | [Redis][4]                           | 100,000+ ops/sec, <1ms latency, in-memory storage, 5GB-512GB RAM capacity         | Sub-millisecond access for storing active user sessions and shopping carts                                                     |
| **Cache**             | Distributed cache                       | [Memcached][5]                       | 1M+ gets/sec, <1ms latency, simple key-value, multi-threaded                      | Caches rendered HTML fragments to reduce database load for high-traffic pages                                                  |
| **Cache**             | Configuration management                | [etcd][6]                            | 10,000 writes/sec, strong consistency via Raft, watch API for changes             | Stores microservice configuration with automatic notification when settings change                                             |
| **Document**          | Product catalog                         | [MongoDB][7]                         | Flexible schema, 64MB document size limit, horizontal scaling to 100+ shards      | Natural fit for e-commerce products where laptops have different specs than shirts                                             |
| **Wide-Column**       | High-write log aggregation              | [Apache Cassandra][8]                | 1M+ writes/sec per node, linear scalability, 99.99% availability                  | Ingests application logs from thousands of microservices                                                                       |
| **Key-Value (Cloud)** | File metadata and object storage        | [DynamoDB][9] + [S3][10]             | 3,500 PUT/sec per prefix, 5,500 GET/sec, 11 nines durability                      | Stores image files in S3 with metadata (upload date, user ID, tags) indexed in DynamoDB for fast queries                       |
| **Time-Series**       | IoT sensor data                         | [InfluxDB][11]                       | 1M+ writes/sec, 10:1 compression ratio, optimized for time-based queries          | Purpose-built for ingesting temperature readings from thousands of smart home devices every second                             |
| **OLAP/Analytics**    | Analytics on historical data            | [ClickHouse][12]                     | 1B+ rows/sec scan rate, columnar storage, 10-100x compression                     | Executes analytical queries on years of user behavior data for business intelligence dashboards                                |
| **Graph**             | Social network                          | [Neo4j][13]                          | 1M+ relationship traversals/sec, native graph storage, 34B+ nodes capacity        | Efficiently answers "friends of friends" queries in 3 hops across millions of connections                                      |
| **Search**            | Full-text search                        | [Elasticsearch][14]                  | 2-5 second indexing latency, 100+ search queries/sec, relevance scoring           | Powers search functionality with fuzzy matching and typo tolerance                                                             |
| **Streaming**         | Event sourcing and audit trails         | [Apache Kafka][15] + [PostgreSQL][1] | 1M+ events/sec throughput, immutable log, partition-based parallelism             | Captures every state change in an order management system for compliance and replay capabilities                               |

## Database Vocabulary: Essential Concepts

Understanding database systems requires familiarity with several fundamental concepts that define how data is
structured, accessed, and maintained.

### Transaction Properties and Consistency Models

**ACID** properties form the cornerstone of reliable database transactions:

- **Atomicity**: Operations are all-or-nothing; transactions either complete entirely or fail completely with no partial
  state
- **Consistency**: Database moves from one valid state to another, respecting all constraints
- **Isolation**: Concurrent transactions don't interfere with each other, acting as if executing serially
- **Durability**: Committed transactions survive system failures via write-ahead logs persisted to disk

**Transaction Isolation Levels** define how concurrent transactions interact, balancing consistency against performance:

- **Read Uncommitted**: Allows dirty reads (lowest isolation, highest performance)
- **Read Committed**: Prevents dirty reads
- **Repeatable Read**: Ensures consistent reads within a transaction, prevents non-repeatable reads
- **Serializable**: Full isolation at the cost of throughput, prevents all anomalies including phantom reads

**Eventual Consistency** represents an alternative model where replicas may temporarily diverge but converge to the same
state given enough time without updates.
This trade-off, formalized in the CAP theorem, recognizes that distributed systems must tolerate network partitions,
forcing a choice between consistency and availability during partition events.
In practice, systems prioritize availability and partition tolerance over immediate consistency.
Systems like [Cassandra][8] and [DynamoDB][9] embrace eventual consistency to achieve massive scale and fault tolerance.

### Data Organization and Schema Design

**Normalization** is the process of organizing data to reduce redundancy and improve integrity, progressing through
increasingly strict normal forms:

- **1NF (First Normal Form)**: Eliminate repeating groups, each cell contains only atomic (single) values, no arrays or
  lists
- **2NF (Second Normal Form)**: Remove partial dependencies, non-key columns must depend on the entire primary key, not
  just part of it
- **3NF (Third Normal Form)**: Eliminate transitive dependencies, non-key columns should depend only on the primary key,
  not on other non-key columns
- **BCNF (Boyce-Codd Normal Form)**: A stricter version of 3NF addressing edge cases where determinants aren't candidate
  keys

Example: A denormalized order table with composite primary key (_order_id_, _product_id_) storing _customer_name_,
_customer_email_, _product_name_, _product_price_ violates 2NF because customer data depends only on part of the key.
Normalizing separates this into Orders (_order_id_, _customer_id_, _product_id_), Customers (_customer_id_, _name_,
_email_), and Products (_product_id_, _name_, _price_) tables (3NF).
While normalization prevents update anomalies (changing a product price updates one row, not thousands) and saves
storage, denormalization deliberately introduces redundancy to optimize read performance, reflecting the classic
space-time trade-off in database design.

**Cardinality** refers to the uniqueness of data values in a column or the relationship between tables.
High cardinality means many unique values (like email addresses or transaction IDs), while low cardinality indicates few
distinct values (like boolean flags or status enums).
Database indexes are most effective on high-cardinality columns, as they provide better selectivity for query
optimization.
In relationships, cardinality describes whether connections are one-to-one, one-to-many, or many-to-many.

### Query Performance Optimization

**Indexing** creates auxiliary data structures that dramatically accelerate data retrieval at the cost of additional
storage and slower writes.
B-tree (Balanced tree) indexes support range queries and ordering, hash indexes enable constant-time equality lookups,
and specialized indexes like GiST (Generalized Search Tree) handle complex data types.
The query optimizer uses statistics about index selectivity to determine execution plans.

**Inverted Index** is a specialized index structure mapping content (words, terms, or tokens) to their locations in
documents or records, essential for full-text search engines.
Unlike traditional indexes that map keys to records, inverted indexes map search terms to document IDs containing those
terms.
[Elasticsearch][14] and [Solr][16] rely heavily on inverted indexes. When you search for "database performance", the
inverted index quickly identifies all documents containing these terms without scanning every record.
The structure typically includes term frequency (how often a term appears) and position information for relevance
scoring and phrase matching.
While powerful for text search, inverted indexes require significant storage and rebuilding costs when documents change
frequently.

**Bloom Filter** is a space-efficient probabilistic data structure that tests whether an element is a member of a set,
with the key property that false positives are possible but false negatives are not.
A bloom filter can definitively say "definitely not present" but only "possibly present" for set membership queries.
LSM-tree databases like [Cassandra][8] and [RocksDB][21] use bloom filters to avoid checking disk files that definitely
don't contain requested keys, significantly reducing unnecessary I/O operations.
The filter uses multiple hash functions to set bits in a bit array; querying checks if all corresponding bits are set.
Trade-offs include configurable false positive rates versus memory usage; a larger bit array reduces false positives but
consumes more memory.
Bloom filters cannot be modified to remove elements without rebuilding, but counting bloom filters exist for this use
case.

### Scaling and Distribution Strategies

**Partitioning** divides large tables into smaller, more manageable pieces called partitions based on a partition key,
improving query performance and maintenance operations.
Unlike sharding which distributes data across multiple servers, partitioning typically occurs within a single database
instance.
Common partitioning strategies include range partitioning (dates: Q1-2024, Q2-2024), list partitioning (regions: US, EU,
ASIA), and hash partitioning (uniform distribution via hash function).
When querying partitioned tables, the database can skip irrelevant partitions through partition pruning, a query for
January data only scans the January partition rather than the entire year.
Partitioning enables efficient archival, parallel maintenance, and better cache utilization.
However, poor partition key choices create hot partitions that receive disproportionate load, negating the benefits.

**Sharding** is a horizontal partitioning strategy that distributes data across multiple databases or nodes based on a
shard key.
Each shard contains a subset of the total dataset, allowing systems to scale beyond single-server limitations.
Choosing the right shard key is critical, a _user_id_ might distribute data evenly, while a timestamp could create hot
spots if recent data receives disproportionate traffic.

**Replication** involves maintaining copies of data across multiple nodes for redundancy and load distribution.
Master-slave replication designates one node for writes with read-only replicas, while master-master allows
bidirectional updates.
Synchronous replication waits for replica acknowledgment before committing (ensuring consistency), whereas asynchronous
replication prioritizes performance but risks data loss during failures.

### Durability and Recovery

**Write-Ahead Logging (WAL)** is a fundamental technique where changes are first recorded to an append-only log before
modifying the actual data files.
This enables crash recovery (replaying the log), point-in-time recovery, and efficient replication.
The log serves as the source of truth, with checkpoints periodically flushing accumulated changes to data files.

### Database Types and Workloads

**Wide-Column Store** is a NoSQL database organizing data into column families where each row can have different
columns (sparse schema).
Rows are identified by keys with dynamically added columns grouped into families; data is physically stored by column
family rather than by row.
Systems like [Cassandra][8] excel at high-write workloads (1M+ writes/sec) using LSM (Log-Structured Merge) trees, ideal
for time-series data, event logging, and sparse attributes where rows can grow "wide" with thousands of columns.

**OLAP (Online Analytical Processing)** systems optimize for complex analytical queries over large datasets, contrasting
with OLTP (Online Transaction Processing) for high-volume transactions.
OLAP databases ([ClickHouse][12], [Snowflake][17], [BigQuery][18]) use columnar storage, aggressive compression, and
parallel execution to scan billions of rows efficiently.
They trade insert performance for exceptional read throughput, processing terabytes in seconds via vectorized execution
and query pushdown.
Example: calculating year-over-year revenue growth across product categories requires full table scans that would
cripple OLTP databases.

**ETL (Extract, Transform, Load)** is a data integration pattern moving data from sources to warehouses:

- **Extract**: Read from operational databases, APIs, flat files
- **Transform**: Cleanse, validate, aggregate, reshape to match target schema
- **Load**: Write transformed data to destination

Pipelines run on schedules (nightly, hourly) in batch mode.
Modern **ELT** (Extract, Load, Transform) loads raw data first, then transforms using warehouse compute power.
Example: extract daily orders from [PostgreSQL][1], transform by calculating totals and joining customer dimensions,
load to [Snowflake][17] for BI dashboards.

### Performance Metrics

**TPS (Transactions Per Second) and QPS (Queries Per Second)** are fundamental throughput metrics:

- **TPS**: Committed transactions per second for write-heavy workloads
- **QPS**: Individual query executions per second for read-heavy systems

Context matters: simple key-value lookups achieve higher QPS than complex JOINs; small transactions enable higher TPS
than large batch operations.
Benchmark tools like `sysbench` and `pgbench` measure these under various conditions.
Specifications vary widely: [PostgreSQL][1] might claim 40,000 TPS on optimized hardware but only 5,000 TPS for complex
transactions with multiple indexes and foreign key checks.

## Common Database Questions Explored

### Why Is Cache More Performant Than a Read-Enhanced Database?

Caches outperform databases through architectural simplification.
Operating entirely in-memory eliminates disk I/O: caches deliver 100-500 microsecond responses versus 1-5ms for
optimized databases.
They use hash table lookups ($$O(1)$$) instead of B-tree (Balanced tree) traversals, skip query parsing and optimization,
and avoid ACID guarantees that require locking and write-ahead logging.
While databases must maintain consistency across replicas and enforce isolation levels, caches serve data immediately
without these constraints.
The trade-off: caches lack durability (restarts lose data), offer no query flexibility (only key-based lookups), and
face cache invalidation challenges when determining staleness while maintaining consistency with source databases.

### Why Can a Database Be Read-Optimized or Write-Optimized but Not Both?

Database optimization involves opposing architectural choices.
Write-optimized systems ([Cassandra][8], [HBase][19]) use LSM (Log-Structured Merge) trees that convert random writes
into fast sequential appends, achieving millions of writes per second, but fragment data across multiple SSTables,
causing read amplification despite bloom filters.
Read-optimized systems use B-trees (Balanced trees) with sorted on-disk data and indexes for efficient lookups, but each
write requires random I/O, node splits, and index updates across multiple structures.

The divergence extends to indexing (more indexes help reads but slow writes), compression (column stores achieve 10-100x
compression benefiting reads but requiring expensive recompression on writes), and WAL handling (synchronous flushing
ensures durability but slows writes, asynchronous batching maximizes write throughput but risks data loss).
Modern hybrid approaches like [InnoDB][20]'s change buffering or [RocksDB][21]'s tunable compaction mitigate but cannot
eliminate this fundamental trade-off.

### When Is a Document Database More Interesting Than a Relational Database with JSON Compatibility?

Document databases (like [MongoDB][33]) excel when genuine schema variability exists across records.
An e-commerce platform with diverse products (electronics with specs, clothing with sizes, furniture with assembly
instructions) fits naturally: each product type has different attributes.
Modeling this relationally creates wide tables with mostly `NULL` columns or complex EAV (Entity-Attribute-Value)
patterns.
Document stores also handle hierarchical data elegantly: a blog post with nested comments requires one query, versus
multiple `JOIN` in relational systems.
Schema evolution happens without migrations, accelerating development for uncertain requirements.

Relational databases with JSON columns work better when you have a stable core schema with occasional flexibility needs,
a user profile with standard columns plus a preferences JSON field.
They provide superior ad-hoc querying, aggregations, and `JOIN` through sophisticated query planners.
Foreign key constraints maintain referential integrity automatically, and _ACID_ transactions across tables work
naturally.
If analytical queries or strong consistency matter, relational databases remain superior despite modern document
databases adding limited multi-document transactions.

### What Is Pre-Computing and How Does It Work?

Pre-computing calculates and stores query results in advance, trading storage and update complexity for 100-1000x query
speedups.
The principle is simple: compute expensive operations once and serve the result repeatedly.

Common implementations include:

- **materialized views** (physically stored query results that refresh on-demand or scheduled)
- **aggregation tables** (daily/weekly/monthly summaries updated via ETL)
- **denormalization** (storing _customer_name_ in orders to avoid JOINs)
- **computed columns** (auto-calculated fields like _quantity_ * _unit_price_)
- **cache warming** (pre-generating recommendation lists before requests arrive).

Pre-computing exploits temporal and spatial locality, queries repeat frequently and users access similar data.
A product view count changes often but everyone sees the same value.
However, challenges include cache invalidation (determining staleness), storage costs (3-5x data multiplication in
warehouses), and update complexity (maintaining source-to-computed consistency).
Pre-computing makes sense when read/write ratios are high; otherwise, on-demand computation is simpler.

## Database Synchronization and Reliability

Ensuring data persistence, handling failures gracefully, and maintaining consistency across distributed systems
represent critical challenges in production database deployments.
Organizations invest heavily in replication strategies, failover mechanisms, and change data capture to achieve
reliability.

### Replication, Failover, and Recovery Strategies

**Replication Architectures** provide high availability and read scalability through data redundancy:

- **Master-replica** (primary-secondary): Single write node with read-only replicas receiving changes via streaming
  replication
- **Synchronous replication**: Zero data loss (replica must acknowledge before commit) but adds latency
- **Asynchronous replication**: Better performance but risks data loss during failures
- **Cascading replication**: Replicas relay changes to other replicas, reducing primary load but increasing lag
- **Multi-master**: Multiple write nodes enable geographic distribution but require conflict resolution

**Failover Mechanisms** handle primary database failures:

- **Automatic failover**: Consensus protocols (Raft, Paxos) detect failures and elect new primaries via tools
  like [Patroni][22] or [MySQL][2] orchestrators; requires fencing to prevent split-brain scenarios
- **Manual failover**: Human-verified promotion, slower but reduces incorrect failover risk for systems requiring strong
  consistency

**Multi-Master Conflict Resolution** addresses concurrent writes:

- **Last-write-wins (LWW)**: Timestamp-based selection, simple but lossy
- **Application-defined**: Custom logic (sum counters, max version numbers, user prompts)
- **CRDTs**: Mathematical guarantees for eventual consistency regardless of update order
- Systems like [PostgreSQL][1] BDR and [MySQL][2] Group Replication support multi-master, though most applications
  prefer single-master simplicity

**Backup and Recovery** provide disaster recovery beyond replication:

- **Physical backups**: Copy database files and WAL segments for full restoration (requires `pg_basebackup` or similar
  tools)
- **Logical backups**: Export as SQL/CSV, portable across versions but slower restoration
- **Point-in-time recovery (PITR)**: Combines base backups with WAL archiving to restore to any moment (e.g., recover to
  1:59 PM after a 2 PM table drop)
- **Backup validation**: Regular restoration testing to verify backup integrity and measure RTO (Recovery Time
  Objective) and RPO (Recovery Point Objective)

Resilient architectures combine synchronous replication (high availability), asynchronous replicas (read scaling), CDC (
event-driven integration), and PITR backups (disaster recovery) to survive hardware failures, network partitions, and
operator errors.

### Change Data Capture (CDC)

Change Data Capture extracts and publishes database changes as events, enabling downstream systems to react to
modifications in near-real-time and bridging databases with [event-driven architectures][32].

**CDC Approaches:**

- **Log-based**: Reads WAL/binary logs via tools like [Debezium][23], minimal database impact, captures all changes,
  publishes to [Kafka][15] as JSON/[Avro][35] events
- **Trigger-based**: Database triggers write to change tables; simpler but adds write overhead and may miss admin/bulk
  operations
- **Timestamp-based**: Polls for _updated_at_ changes; simple implementation but misses deletions and introduces polling
  latency

**Common Use Cases:**

- **Microservices synchronization**: Maintain local caches across services without direct coupling
- **Search index updates**: Keep [Elasticsearch][14]/[Solr][16] synchronized with database changes
- **Analytics pipelines**: Stream operational data to warehouses for near-real-time BI
- **Cache invalidation**: Systematically purge/update caches on source data changes

The architecture typically places [Kafka][31] or similar message brokers between the CDC tool and consumers.
The database log streams to [Kafka][34] topics, providing durability, replay capability, and fan-out to multiple
consumers. (review [this post][30] for a detailed example)
Consumers process events _idempotently_ (replaying duplicate events produces the same result) since exactly-once
processing across systems remains difficult.
Schema evolution creates a challenge as it requires updating CDC configs and consumers; operational complexity of
additional infrastructure; initial snapshots need special handling.
Despite these, CDC has become foundational in modern data architectures, enabling event-driven systems while preserving
databases as sources of truth.


[1]: https://www.postgresql.org/
[2]: https://www.mysql.com/
[3]: https://postgis.net/
[4]: https://redis.io/
[5]: https://memcached.org/
[6]: https://etcd.io/
[7]: https://www.mongodb.com/
[8]: https://cassandra.apache.org/
[9]: https://aws.amazon.com/dynamodb/
[10]: https://aws.amazon.com/s3/
[11]: https://www.influxdata.com/
[12]: https://clickhouse.com/
[13]: https://neo4j.com/
[14]: https://www.elastic.co/elasticsearch/
[15]: https://kafka.apache.org/
[16]: https://solr.apache.org/
[17]: https://www.snowflake.com/
[18]: https://cloud.google.com/bigquery
[19]: https://hbase.apache.org/
[20]: https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html
[21]: https://rocksdb.org/
[22]: https://patroni.readthedocs.io/
[23]: https://debezium.io/
[30]: {% post_url 2022/2022-11-07-Database-sync-with-debezium %}
[31]: {% post_url 2020/2020-02-07-Get-started-with-Kafka %}
[32]: {% post_url 2021/2021-10-25-Event-sourcing-101 %}
[33]: {% post_url 2018/2018-06-13-MongoDB %}
[34]: {% post_url 2024/2024-01-16-How-to-use-kafkastreams %}
[35]: {% post_url 2021/2021-09-21-How-to-avro %}