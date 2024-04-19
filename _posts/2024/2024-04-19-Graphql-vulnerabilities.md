---
layout: post
title: Tackle GraphQL vulnerabilities 🕵️‍♂️💻
color: rgb(109,96,84)
tags: [ctf]
---

You can test your GraphQL API with [graphql-cop][1] which is a command-line tool to check 
for common security vulnerabilities.

Let's explore some of the tests it can run and how to prevent them.

## Types of attacks

There are different types of attacks that the [graphql-cop][1] tool can help you prevent.

### Cross-Site Request Forgery (CSRF)

A Cross-Site Request Forgery (CSRF) is a type of attack where a user is tricked and has unwanted actions being performed
unbeknownst to them on an application they are authenticated to.
For example, in GraphQL, allowing a mutation to be performed via a GET request.

### Denial of Service (DoS)

A Denial of Service (DoS) is a type of attack that aims to make a server or network resource unavailable to users.
It usually tries to overload the server with malicious or superfluous requests to prevent it from responding to legitimate requests.
For DDoS, the first D is for Distributed, meaning that it is the same type of attack but coming from multiple sources.

We'll be talking about those in this article.

### Information Leakage

An information leakage is a type of attack that occurs when an attacker 
gains unauthorized access to some resources or sensitive information from the server.

For example, with the introspection query or via unwanted and very descriptive error messages from your backend
exposing the internals of the database or application.

## DOS GraphQL Attacks

Find on the [OWASP][3] website a cheat sheet of [DOS prevention][2], or follow along for some examples.

### Directive Overloading

#### Example

Directive Overloading occurs when a user can send a query with many consecutive directives and overload the engine 
handling those directives.

Here is an example from the [graphql-cop][1] tool:
```graphql
  query {
    book(id: 1) {
      __typename
      @aa@aa@aa@aa@aa@aa@aa@aa@aa@aa
    }
  }
```

The issue can be spotted when the returned error (because obviously `@aa` is not a valid directive) will be composed of
an array of one error per directive. This can scale quickly.

> Why allow directives at all in the query? 

In some case the `@includes` or `@skip` directives are useful to further fine-tune the query and could be used by a client.
Like we've seen in this previous [article][22] about advanced resolvers.

#### Protection

The recommendation for this one is to implement a limit on the number of directives allowed in a query.
To measure how many directives are needed, you can check the current usage of directive in your existing queries.

This should be handled before or by the GraphQL engine while parsing the document, otherwise, this can lead to a heap overflow.

By default, in Apollo GraphQL tries to resolve as many fields as possible and will go through each directive and generate
a new error for each one.

### Field Duplication

#### Example

Field Duplication occurs when a user can send a query with excessively duplicated fields hoping that the API will have
 inefficient processing of those fields.

```graphql
book(id: 1) { 
  __typename __typename __typename __typename __typename __typename __typename 
}
```

It can also happen with fragments:

```graphql
  fragment book on Book {
    __typename
    __typename
  }
  query {
    book(id: 1) {
      __typename
      __typename
      # FragmentSpread
      ...book
      # InlineFragment
      ... on Book {
        __typename
        __typename
      }
    }
  }
```

By default, some popular frameworks like Apollo GraphQL will not allow duplicated fields in the response,
but it will not consider as a _bad request_ multiple fields in the query.

#### Protection

The suggestion for this one is to implement a middleware that will clean out the duplicated fields before it reaches
the graphql engine.
However, de-duplicating means an additional parsing and traversing of the GraphQL query tree which can impact performance.
Find out how to transform the received GraphQL with [Apollo GraphQL][6].

### Alias Overloading

Alias Overloading occurs when a user can send a query with many consecutive aliases, hoping that the API will have
inefficient processing of those aliases (try it out on your API and find the [resolving difference][4] with 10 and 100 aliases).
Constructed with field duplication and batch queries (multiple queries in one using aliases),
you can craft resource heavy queries.

Using aliases for multiple fields:

```graphql
query {
  book(id: 1) {
    __typename
    alias: __typename
    alias2: __typename
    alias3: __typename
    alias4: __typename
  }
}
```

Using aliases for multiple queries within one:

```graphql
query {
  book(id: 1) {
    __typename
  }
  book2: book(id: 1) {
    __typename
  }
}
```

Aliases are useful to rename fields in the response or to query the same field multiple times with different arguments.
As we've seen in this [article][24] about how to bulk mutate with multiple mutation in one call in GraphQL.
This is a plus which can save some post-processing of the response on the client side.

#### Protection

The suggestion to avoid this type of attack is to implement a limit on the number of aliases allowed in a query.
Same as for the directive, the number of aliases should be measured and checked against the current usage in your existing queries.
The goal is to prevent attacks while allowing your client to use aliases for their queries as usual.

Another one is applying a rate limit to the client requests, limiting the number of requests per client in a given time frame.
The rate limit usually works with attributed points during a time frame, and when the limit is reached, the client is blocked.
Find out how [GitHub][5] is handling rate limits for their GraphQL API based on the type of operation and total number of nodes
in a call.

### Query Depth Attack

#### Example

We talked about the problem of having circular dependencies in the GraphQL schema in a previous [article][21].
The Query Depth Attack will use those to create a query that never ends.
It can _snowball_ ☃️ as the deeper the query goes the more resources it will likely consume.

Here is how the depth is calculated for a query that can be vulnerable to this attack:

```graphql
query {                       # Depth: 0
  books {                     # Depth: 1
    title
    author {                  # Depth: 2
      title
      books {                 # Depth: 3
        title 
        author {              # Depth: 4
          ...                 # Depth: ...
        }
      }
    }
  }
}
```

The `books` resolver here is not paginated, so there's no limit on the number of books to fetch!
That means for each iteration we return all the books and their authors and so on!
This problem can be mitigated with some performance improvements on the resolver as we've discussed in this [article][25].
But even the best API can avoid the risks of a perfectly tailored malicious query.

#### Protection

To protect your API against this type of attack, you can implement a limit on the depth of the query.
This can be done by setting a maximum depth allowed for a query, and if the query exceeds that depth, it will be rejected.
The depth should be calculated before it reaches the GraphQL engine, so it doesn't even try to resolve it.

### Query batching

#### Example

Array Batching in Apollo GraphQL is usually not enabled by default. When disabled, your API is safe from this type of attack.

Array-based query batching occurs when a user sends an array of queries (a batch) to the service in a single request.
If there are no limits on the batch side, you could overload the server, which will have a hard time processing all the
queries.

An array-based query:

```ts
[
  { query: 'query { book(id: 1) { __typename } }' },
  { query: 'query { book(id: 1) { __typename } }' },
]
```

> Why enable batching at all?

Array-based query batching can be useful when you have multiple queries that are not dependent on each other.
This often occurs when working in UI, and you'd rather make one call to the backend instead of multiple.
Either to fetch all the data you need or start multiple asynchronous processes at once.
Check out this [article][23] about how to batch queries in a React component.

#### Protection

The suggestion to prevent this type of attack is to implement restrictions on the number of allowed queries in a single batch request.
This means that for example, if you have a limit of 10 queries per batch, the service will either only process the first
10 queries or reject the whole batch with a specific error.

This suggestion with the implementation of a rate limiter based on the query per batch should be enough to protect the 
API from a Denial of Service attack.

## Implementation

Now that we've seen the different vector of attacks and the recommendation, let's dive a bit into how to implement
them in your GraphQL API.

## Overload Protection

From the documentation of Apollo GraphQL, you can find a [Overload protection][6] middleware that can be used to protect
your application from heap overflow.

The package [`overload-protection`][7] will return a 503 and a `Retry-After` header when key metrics set within the 
middleware for the server are being exceeded.
Those metrics are:
- `maxHeapUsedBytes`: The amount of bytes used by the application's heap.
- `maxRssBytes`: The amount of bytes used by Resident Set Size (RSS) which encompass the heap and all allocated memory for the process execution. 
- `maxEventLoopDelay`: The maximum delay in milliseconds for the event loop to process the request.

You can find those metrics in the `process.memoryUsage()` object in Node.js. 
This approach doesn't prevent the Denial of Service because the request is still being processed, but it should recover
faster since the server will return a 503 when it starts to be overloaded (instead of when it's too late).

### Custom protection via GraphQL AST traversal

In this custom approach, we will traverse the GraphQL AST and check for the number of directives, aliases, fields, and depth.
That way, we can implement a middleware to reject the query if deemed malicious or heavy before we even try to resolve it.

For that we will use some out-of-the-box methods from the `graphql` package to parse and traverse the AST (Abstract Syntax Tree).
The [AST][22] is a tree representation of the query that can be traversed to extract information about the query.
You can find it in the [resolver][22] as the `info` object:

```ts
import { visit, parse } from 'graphql';
import { ASTNode, DirectiveNode, DocumentNode } from 'graphql/index';
import { ASTVisitor } from 'graphql/language/visitor';

function traverse(query: string): void {
  const ast: DocumentNode = parse(query);
  let directiveCount = 0;
  let aliasCount = 0;
  let maxDepth = 0;
  let depth = 0;

  const visitor: ASTVisitor = {
    Directive(node: DirectiveNode) {
      directiveCount++;
    },
    enter(node: ASTNode) {
      if (node.kind === 'Field') {
        depth++;
        if(depth > maxDepth) maxDepth = depth;
        if (node.alias) aliasCount++;
      }
    },
    leave(node: ASTNode) {
      if (node.kind === 'Field') {
        depth--;
      }
    },
  };
  const resultingDocument: DocumentNode = visit(ast, visitor);
}
```

This is a simple example of how you can traverse the AST and count the number of directives, aliases, and depth.
Let's break it down a bit:

- We parse the query into an AST with `parse(query)` as `DocumentNode` which is a usable representation of the query.
- We define a `visitor` which is a `ASTVisitor` where you can define custom behaviour that will be executed when traversing the AST.
  - The `Directive` method will be called each time a directive is found in the query.
  - The `enter` method will be called each time a node is entered
    - We look for nodes of type `Field` which are the fields in the query and increment the alias count if one, or calculate the current depth.
  - The `leave` method will be called each time a node is left
    - We decrement the depth when leaving a `Field` node.
- The result of the `visit` method will be a new `DocumentNode` with the visitor applied to it.

By using this method, you can also modify the tree by returning `null` on a field to remove it from the tree if it is a
duplicate (you would need to check in the `SelectionSet` the fields that are already present and remove duplicates as you
go in the `Fields`).

#### Rate Limiter

To implement a rate limiter, there are many options available.
You can use [`rate-limiter-flexible`][9] with `ioredis` to store the rate limit information in a Redis database.
Other options than redis are available, including an in-memory store to test it out (not meant for production).

Here is an example:

```ts
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import * as Redis from 'ioredis';

class RateLimiter {
  private readonly limiter: RateLimiterRedis;

  constructor() {
    this.limiter = new RateLimiterRedis({
      storeClient: new Redis({ options: { /* Redis options */ } }),
      points: 100,                        // allowed max points per duration
      duration: 10,                      // point reset frequency in seconds
      blockDuration: 60,                // block nest requests for 60 seconds if all points consumed in duration
    });
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await this.limiter.consume(req.ip, 1);     // Consume 1 point for the request for this IP
        next();
      } catch (rejRes) {
        res.status(429).send('Too Many Requests'); // too many requests -> send HTTP 429 status code
      }
    };
  }
}
```

In this example, we have a simple rate limiter class, we create a `RateLimiterRedis` with a `ioredis` client (assuming
you have run and configured through the redis options, otherwise use the `RateLimiterMemory` without redis).
Then I set up the rate limiter options, I left some comments, so you know what each option does.

When a graphql call is issued to the API, as a middleware, it will `consume` a point for the request's IP. 
Which means that if the rate limit is reached for one IP, it won't impact another IP. 
Better yet, if you have authenticated users using your API, you can apply the rate limit per user instead of IP.
The rate limit throws an exception when the limit is reached, letting you know the number of points consumed, and the 
time remaining before the blocking period expires.

To use it in an express `app`, you could do for the graphql API on `/graphql` route:

```ts
const rateLimiter = new RateLimiter();
app.use('/graphql', rateLimiter.middleware());
```

Or you can find other examples on the [rate-limiter-flexible][9] documentation. They have a wiki with examples of
the rate limiter usage within different frameworks or situations.

Now you should be all set to defend your GraphQL API against evil DoS threats 
...if we omit other potential attack vectors (that were not mentioned) and until the next vulnerabilities are discovered. 🙃

[1]: https://github.com/dolevf/graphql-cop/tree/main
[2]: https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html#dos-prevention
[3]: https://owasp.org/
[4]: https://checkmarx.com/blog/alias-and-directive-overloading-in-graphql/
[5]: https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api
[6]: https://www.apollographql.com/docs/react/data/document-transforms/
[7]: https://www.apollographql.com/docs/technotes/TN0005-overload-protection/
[8]: https://www.npmjs.com/package/overload-protection
[9]: https://www.npmjs.com/package/rate-limiter-flexible
[21]: {% post_url 2021/2021-11-06-Advance-apollo-graphql-queries %}
[22]: {% post_url 2022/2022-05-27-Graphql-advanced-resolver %}
[23]: {% post_url 2022/2022-06-13-Graphql-api-client-in-react-component %}
[24]: {% post_url 2022/2022-04-26-How-to-bulk-mutate-in-graphql %}
[25]: {% post_url 2023/2023-01-03-Graphql-optimization %}