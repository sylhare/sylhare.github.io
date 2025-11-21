---
layout: post
title: A database and usage overview
color: rgb(191 44 31)
tags: [ database ]
---

Here is a quick cheat sheet for database, when and why use them.
There's also some other section with common database questions and vocabulary.
It's none exhaustive, AI helped so use it as a starting point.
(I didn't have the opportunity to test all the use cases in production)

## Database Technologies Comparison

| Category              | Use Case                         | Technology                           | Why Use It                                                              | Specifications                                                                    |
|-----------------------|----------------------------------|--------------------------------------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| **SQL[^1]**           | High-volume transactions         | [PostgreSQL][1]                      | Strong consistency guarantees for systems needing reliable transactions | 40,000+ TPS[^2], ACID[^3] compliance, <1ms query latency on indexed columns       |
| **SQL[^1]**           | Multi-tenant SaaS[^4]            | [MySQL][2]                           | Isolates customer data while sharing infrastructure                     | 10,000+ connections, table partitioning by _tenant_id_, read replicas for scaling |
| **SQL[^1]**           | Geospatial queries               | [PostGIS][3]                         | Fast location-based queries and spatial calculations                    | Sub-100ms for radius queries, GiST[^5]/SP-GiST indexes, handles 2D/3D geometries  |
| **Cache**             | User session management          | [Redis][4]                           | Ultra-fast temporary data storage with rich data structures             | 100,000+ ops/sec, <1ms latency, in-memory storage, 5GB-512GB RAM[^9] capacity     |
| **Cache**             | Distributed cache                | [Memcached][5]                       | Reduces database load by caching frequently accessed data               | 1M+ gets/sec, <1ms latency, simple key-value, multi-threaded                      |
| **Cache**             | Configuration management         | [etcd][6]                            | Stores configuration with automatic change notifications                | 10,000 writes/sec, strong consistency via Raft[^6], watch API[^10] for changes    |
| **Document**          | Product catalog                  | [MongoDB][7]                         | Flexible schema for varying data structures without migrations          | Flexible schema, 64MB document size limit, horizontal scaling to 100+ shards      |
| **Wide-Column**       | High-write log aggregation       | [Apache Cassandra][8]                | Handles massive write loads with high availability                      | 1M+ writes/sec per node, linear scalability, 99.99% availability                  |
| **Key-Value (Cloud)** | File metadata and object storage | [DynamoDB][9] + [S3][10]             | Scalable file storage with fast metadata queries                        | 3,500 PUT/sec per prefix, 5,500 GET/sec, 11 nines durability                      |
| **Time-Series**       | IoT[^7] sensor data              | [InfluxDB][11]                       | Optimized for time-stamped data with high write throughput              | 1M+ writes/sec, 10:1 compression ratio, optimized for time-based queries          |
| **OLAP[^8]**          | Analytics on historical data     | [ClickHouse][12]                     | Fast analytical queries on large historical datasets                    | 1B+ rows/sec scan rate, columnar storage, 10-100x compression                     |
| **Graph**             | Social network                   | [Neo4j][13]                          | Fast traversal of complex relationships and connections                 | 1M+ relationship traversals/sec, native graph storage, 34B+ nodes capacity        |
| **Search**            | Full-text search                 | [Elasticsearch][14]                  | Full-text search with fuzzy matching and relevance scoring              | 2-5 second indexing latency, 100+ search queries/sec, relevance scoring           |
| **Streaming**         | Event sourcing and audit trails  | [Apache Kafka][15] + [PostgreSQL][1] | Captures and stores all events for audit and replay                     | 1M+ events/sec throughput, immutable log, partition-based parallelism             |

## Database Vocabulary: Essential Concepts

Understanding database systems requires familiarity with several fundamental concepts that define how data is
structured, accessed, and maintained.

### Transaction Properties and Consistency Models

#### ACID[^3] Properties

The foundation of reliable database transactions:

- **Atomicity**: All operations succeed or all fail. No half-completed transactions.
- **Consistency**: Data always follows defined rules and constraints.
- **Isolation**: Concurrent transactions don't interfere with each other.
- **Durability**: Completed transactions survive crashes and persist permanently.

#### Transaction Isolation Levels

Controls how concurrent transactions interact:

- **Read Uncommitted**: Fastest but allows reading uncommitted data
- **Read Committed**: Prevents reading uncommitted data
- **Repeatable Read**: Same query returns same results throughout a transaction
- **Serializable**: Strictest isolation, transactions run as if sequential

#### Eventual Consistency

An alternative to strict consistency where data copies can temporarily show different values but will eventually sync
up.
When you update data, the change spreads to all copies over time rather than instantly. During this window, different
users might see different values.

Systems like [Cassandra][8] and [DynamoDB][9] choose this approach to stay fast and available even when servers fail or
networks are slow. They prioritize speed and uptime over instant consistency.

### Data Organization and Schema Design

#### Normalization

Organizing data to reduce duplication in _SQL/relational databases_.
Normalization prevents data duplication and update errors but requires JOINs.
De-normalization duplicates data for faster reads.

Progressive levels (NF = Normal Form):

- **1NF (First Normal Form)**: Each cell contains a single atomic value (no arrays or lists). Don't store the same data
  repeatedly.
- **2NF (Second Normal Form)**: All non-key columns must depend on the complete key (a key is composed by one or more
  `id` column in the table), not just part of it. If a value stays the same for multiple rows that share only one part
  of a composite key, extract it to a separate table and reference it by ID.
- **3NF (Third Normal Form)**: Data depends directly on the key, not on other non-key columns. If two columns are
  related to each other (changing one means you should change the other), extract them to a separate table.

> NoSQL databases often intentionally break these rules (denormalize) for performance, since they don't have JOINs or
> handle them poorly.

#### Cardinality

Cardinality refers to the uniqueness of data values in a column:

- **High cardinality**: Many unique values (emails, transaction IDs). Indexes work best here.
- **Low cardinality**: Few distinct values (booleans, status flags). Less effective for indexing.

### Query Performance Optimization

#### Indexing

Creates shortcuts to find data faster.

Index types:
- **B-tree[^20]**: Supports range queries and ordering
- **Hash**: Fast equality lookups
- **GiST[^5]**: Handles complex data types (geospatial, arrays)

**Trade-off**: Faster reads but slower writes and more storage (indexes needs to be updated on write).

#### Inverted Index

An inverted index, reverses the normal document-to-words relationship.

Given these documents:
```ruby
Doc1: "database performance tuning"
Doc2: "database indexing strategies"
Doc3: "performance optimization tips"
```

The inverted index stores:
```ruby
"database"    → [Doc1, Doc2]
"performance" → [Doc1, Doc3]
"tuning"      → [Doc1]
"indexing"    → [Doc2]
"strategies"  → [Doc2]
"optimization"→ [Doc3]
"tips"        → [Doc3]
```

Instead of "_Document 1 contains words X, Y, Z_", it creates a lookup of "_Word X appears in Documents 1, 2, 3_".
This takes milliseconds instead of reading every document to check if it contains those words.

Full-text search engines like [Elasticsearch][14] use this to enable quick text searches across large document sets.
They also provide feature like exact phrase match, frequency ranking, and fuzzy matching.

**Trade-off**: Fast searches but requires storage space and rebuilding when documents change.

#### Bloom Filter

A quick test that answers: "Is this element definitely NOT in the set?"

Can say "definitely absent" or "possibly present" (but never misses an item that's actually there, no false negative).
Databases like [Cassandra][8] use this to skip checking files that definitely don't contain requested data.

**Trade-off**: Saves disk reads but uses memory and might have false positives.

### Scaling and Distribution Strategies

#### Partitioning vs Sharding

Both split data into smaller pieces for better performance. 
So you can make queries that would only scan the relevant data and not the full database, allowing for parallel processing.
Sharding also distributes load across multiple servers.
The key difference is scope:

- **Partitioning**: Splits tables within a _single database_. Improves query performance and maintenance.
- **Sharding**: Splits data across _multiple databases/servers_. Enables horizontal scaling beyond one machine's limits.

**Pitfall**: Poor key choice creates hot spots where one piece gets all the traffic. Ex: An uuid could spread evenly,
while timestamp concentrates traffic on recent data.

#### Replication

Keeps copies of data on multiple servers for backup and load balancing.

Replication modes:

- **Synchronous**: Waits for copies before confirming (no data loss, higher latency)
- **Asynchronous**: Faster but risks losing recent data on failure
- **Cascading**: Replicas copy from other replicas (reduces primary load)

**Trade-offs:**
- **Synchronous**: Waits for copies before confirming writes. No data loss but slower.
- **Asynchronous**: Faster but risks losing recent data if primary fails.

### Durability and Recovery

#### Write-Ahead Logging (WAL)

A safety mechanism where the database writes every change to a sequential log file _before_ modifying the actual data files.

**How it works:**

1. You update a record (e.g., "Set user's balance to $100")
2. Database first writes this change to the WAL file (fast sequential write)
3. Database then updates the actual data pages in memory
4. Later, modified pages are flushed to disk in the background

If the database crashes after step 2 but before step 4, no problem. 
On restart, the database replays the WAL[^15] to reconstruct any changes that didn't make it to disk. 
Without WAL, the crash would lose your transaction.

WAL also enables replication (replicas read the log) and point-in-time[^14] backups (archive old WAL files to restore to any moment).

#### Replication Recovery

Depending on the architecture, recovery strategies vary:

_Master-replica (most common):_ One write node, multiple read-only copies. When primary fails:

- **Automatic failover**: Tools like [Patroni][16] detect failures and promote replicas
- **Manual failover**: Human verifies before promoting (safer for critical systems)
- **Split-brain prevention**: Ensure only one primary exists (otherwise data conflicts)

_Multi-master (advanced):_ Multiple nodes accept writes. Enables geographic distribution but adds complexity:

- **Conflict resolution needed**: When two masters update the same data
  - Last-write-wins (timestamp decides, simple but loses data)
  - Application logic (custom rules: sum counters, keep higher version)
  - CRDTs (mathematical approach guaranteeing eventual consistency)
- Most applications avoid multi-master due to this complexity

**Trade-off**: Resilient architectures combine synchronous replication (high availability),
asynchronous replicas (read scaling),
CDC[^13] (event-driven integration), and PITR[^14] backups (Point-in-time disaster recovery) to survive hardware
failures, network partitions, and operator errors.

### Database Types and Workloads

#### Wide-Column Store

NoSQL database where each row can have different columns, and columns are grouped into **column families** (logical groupings of related columns stored together).

**How it differs from SQL:**

- Traditional SQL table (fixed columns for all rows):
  ```bash
  users table
  | id  | name  | email           | city      |
  |-----|-------|-----------------|-----------|
  | 1   | Alice | alice@email.com | NYC       |
  | 2   | Bob   | bob@email.com   | LA        |
  ```

- Wide-column store (flexible columns per row):
  ```bash
  Row key: user:1
    Column family "profile": {name: "Alice", age: 30}
    Column family "contact": {email: "alice@email.com", phone: "555-0100"}
    
  Row key: user:2
    Column family "profile": {name: "Bob"}
    Column family "contact": {email: "bob@email.com"}
    Column family "preferences": {theme: "dark", lang: "en"}
  ```

> `user:2` has a "preferences" family that `user:1` doesn't have, and `user:1` has an "age" that `user:2` doesn't. 
> Each row can have different columns without schema changes.

_Column families_ group related data so queries like "_get all contact info_" read only the "_contact_" family without loading profile or preferences data.

Systems like [Cassandra][8] excel at high-write workloads (1M+ writes/sec). 
Ideal for time-series data and sparse attributes.

#### OLAP[^8] vs OLTP[^16]

Two different database workload types with opposing optimization goals:

**OLAP (Online Analytical Processing)**: Optimized for complex queries over huge datasets. Uses columnar storage and
compression.
  - Example: [ClickHouse][12]. Good for: "Calculate year-over-year revenue by category."

**OLTP (Online Transaction Processing)**: Optimized for high-volume individual transactions. Row-based storage.
  - Examples: [PostgreSQL][1], [MySQL][2]. Good for: Processing individual orders and payments.

#### ETL (Extract, Transform, Load)

Moving data from sources to data warehouses:

1. **Extract**: Read from databases, APIs[^10], files
2. **Transform**: Clean, aggregate, reshape data
3. **Load**: Write to destination

A variation with ELT[^18] would be load raw data first, and transform later using the warehouse's processing power.
Modern data warehouses like [Snowflake][18], [BigQuery][19], or [Redshift][20] have massive parallel computing resources
that can handle large-scale transformations efficiently.

### Performance Metrics

#### TPS and QPS

You will often see these two acronyms when discussing database performance:

- **TPS (Transactions Per Second)**: Measures write throughput
- **QPS (Queries Per Second)**: Measures read throughput

Context matters: Simple lookups = higher QPS. Complex queries = lower QPS. Actual performance varies widely based on
query complexity and hardware.

## Common Database Questions

### Why Are Caches Faster Than Databases?

Caches are simpler and skip expensive operations:

**Speed advantages:**

- All data in memory (no disk access): 100-500 microseconds vs 1-5ms
- Simple hash lookups instead of tree traversals
- No query parsing or optimization
- Skip ACID guarantees (no locking or logging)

**Trade-offs:**

- No durability: restarts lose data
- Limited queries: only key-based lookups
- Cache invalidation: hard to keep in sync with source data

### Why Can't Databases Be Optimized for Both Reads and Writes?

Fundamental architectural conflict:

**Write-optimized** ([Cassandra][8]):

- Use LSM (Log-Structured Merge) trees: writes go to memory first, then flush to disk in batches as sorted files.
  Converts random writes to fast sequential appends.
- Achieve millions of writes/sec
- Tradeoff: data fragments across multiple files, so reads must check several files (read amplification)

**Read-optimized** ([PostgreSQL][1], [MySQL][2]):

- Use B-trees (Balanced trees): data stored in sorted order in a tree structure. Finding data is like binary search -
  eliminate half the possibilities at each step. Fast lookups even with millions of rows.
- Tradeoff: writes must find the correct sorted position, potentially reorganize the tree (node splits), and update
  indexes - all random disk access

Other conflicts:

- **Indexes**: Help reads find data instantly (like a book index), but every write must update all indexes. 5 indexes =
  5x more work per write.
- **Compression**: Packed data reads faster from disk, but writing requires decompressing, modifying, and recompressing.
- **Durability**: Syncing to disk ensures data survives crashes but adds latency. Async writes are faster but risk data
  loss.

Modern databases use hybrid approaches (buffering, caching, tunable settings) to balance read and write performance, but
can't be optimal for both simultaneously.

### When Use Document Databases vs SQL with JSON?

Choose Document DB (like [MongoDB][33]) when:

- **Schema varies significantly**: Electronics have specs (CPU[^12], RAM[^9]), clothing has sizes (S, M, L). SQL would
  need mostly empty columns or complex workarounds. Documents store only relevant fields.
- **Hierarchical data with nesting**: Store a blog post with all its comments in one document. One read gets everything.
  SQL needs multiple JOINs across tables.
- **Rapid schema changes**: Add new fields without altering tables or running migrations. Just start storing the new
  field in new documents.

Choose SQL (like [PostgreSQL][1], [MySQL][2]) with JSON[^11] when:

- **Stable core schema with occasional flexibility**: User table with standard fields (id, email, name) plus a JSON
  preferences field. Core structure stays predictable while allowing custom settings.
- **Complex queries and JOINs**: SQL excels at queries like "find all orders from users in California who bought product
  X in the last month", combining multiple tables with filters. Document DBs struggle with cross-collection queries.
- **Strong consistency and transactions**: Need to update multiple tables atomically (transfer money: deduct from one
  account, add to another). SQL guarantees both happen or neither does. Document DBs have limited multi-document
  transactions.
- **Analytics and ad-hoc queries**: SQL query optimizers handle complex aggregations, grouping, and filtering
  efficiently. You can write new queries without restructuring data.

### What Is Pre-Computing?

Calculate expensive queries once, store results, serve repeatedly. Can speed up queries 100-1000x.

Common implementations include:

- **Materialized views**: Store query results, refresh periodically
- **Aggregation tables**: Daily/weekly/monthly summaries
- **Denormalization**: Duplicate data to avoid JOINs
- **Computed columns**: Auto-calculated fields
- **Cache warming**: Pre-generate results before requests

**Trade-offs:**

- Uses 3-5x more storage
- Complex to keep in sync with source data
- Stale data until next update

**When to use**: High read/write ratio. Otherwise, compute on-demand.

## Change Data Capture (CDC)

Publishes database changes as events for other systems to consume in near-real-time. Bridges databases
with [event-driven architectures][32].

Approaches:

- **Log-based**: Reads database logs via tools like [Debezium][17]. Captures everything, minimal performance impact. (
  See [this post][30] for details.)
- **Trigger-based**: Database triggers write changes to tables. Simpler but slower, may miss bulk operations.
- **Timestamp-based**: Polls for `updated_at` changes. Simple but misses deletions, has polling delay.

**Common uses:**

- Sync data across microservices
- Update search indexes ([Elasticsearch][14])
- Stream data to analytics warehouses (like [ClickHouse][12])
- Invalidate caches when source data changes

[Kafka][31] is usually involved in this type of architecture for [streaming][34] data.

**Challenges:**

- Schema changes need coordination
- Additional infrastructure complexity
- Initial data snapshots need special handling
- Consumers must handle duplicate events (idempotency)

## Footnotes

There's a lot of acronyms, find the meaning from the footnote below.

[^1]: SQL = Structured Query Language
[^2]: TPS = Transactions Per Second
[^3]: ACID = Atomicity, Consistency, Isolation, Durability
[^4]: SaaS = Software as a Service
[^5]: GiST = Generalized Search Tree
[^6]: Raft = Consensus algorithm for distributed systems
[^7]: IoT = Internet of Things
[^8]: OLAP = Online Analytical Processing
[^9]: RAM = Random Access Memory
[^10]: API = Application Programming Interface
[^11]: JSON = JavaScript Object Notation
[^12]: CPU = Central Processing Unit
[^13]: CDC = Change Data Capture
[^14]: PITR = Point-In-Time Recovery
[^15]: WAL = Write-Ahead Logging
[^16]: OLTP = Online Transaction Processing
[^17]: ETL = Extract, Transform, Load
[^18]: ELT = Extract, Load, Transform
[^19]: LSM = Log-Structured Merge
[^20]: B-tree = Balanced tree

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
[16]: https://patroni.readthedocs.io/
[17]: https://debezium.io/
[18]: https://www.snowflake.com/
[19]: https://cloud.google.com/bigquery
[20]: https://aws.amazon.com/redshift/
[30]: {% post_url 2022/2022-11-07-Database-sync-with-debezium %}
[31]: {% post_url 2020/2020-02-07-Get-started-with-Kafka %}
[32]: {% post_url 2021/2021-10-25-Event-sourcing-101 %}
[33]: {% post_url 2018/2018-06-13-MongoDB %}
[34]: {% post_url 2024/2024-01-16-How-to-use-kafkastreams %}