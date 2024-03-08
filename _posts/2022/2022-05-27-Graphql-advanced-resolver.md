---
layout: post
title: GraphQL 🪐 Advanced resolver
color: rgb(46, 74, 98)
tags: [graphql]
---

As you start exploring more and more the world of [GraphQL APIs][12], you may want to get more out of your resolvers.
As you decompose your business logic into multiple microservices, all advertising a GraphQL Api, you may encounter a
need
to query them.

In this article we'll look at some of the more advanced perks Apollo Server and GraphQL provides out of the box, which
would be useful for you.

### Resolver's parameters

#### Example

Let's consider this GraphQL schema:

```graphql
type Query {
    example: Example
}

type Example {
  id: ID
  user: User
}

type User {
  name: String
}
```

Now you may want to implement its resolver. 
[Resolver][1] functions are passed four arguments: `parent`, `args`, `context`, and `info` (in that order). 
Those are the apollo's convention, you could use any name.
Let's implement one in typescript with all those arguments:

```ts
export async function example(
  parent: undefined,
  args: Record<string, any>,
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<Example> {
  return new Example(); // for the example
}
```

As you can see, you can find a class for each. The parent is undefined, because it's not a nested object.
If we had a resolver on `user` its parent would be `example`. The same way we don't have any arguments like:

```graphql
type Query {
    exampleWithArgs(arg: String!): Example
}
```

In this case the argument is a `{ args: 'argument passed' }` which is a `Record<string, string>`. We don't have to 
implement all the arguments in our resolver, they are optional since we may not need them.

#### Definitions

But for the purpose of this article, let's review each of them, directly from the ApolloServer's [documentation][1]:

- **parent**: The return value of the resolver for this field's parent (i.e., the previous resolver in the resolver
  chain).
  It's `null` for mutation. For nested queries, if you know the type of the parent, you should set it.

- **args**: An object that contains all GraphQL arguments provided for this field.
  It's `null` if you don't pass argument, you can create a type for it as we've seen in the [mutation article][20].

- **context**: An object shared across all resolvers that are executing for a particular operation.
  We have created an `AppContext` where this resolver is implemented which holds any information necessary for the
  resolver. (ie: `{ _extensionStack: { extensions:[] }, dataSources: { ... } }`)

- **info**: Contains core information specified by GraphQL such as path, root, field name that qre queried and so on.
  Apollo Server extends it with a cacheControl field.

### Usage

#### Use of `parent`

Useless for mutation, it becomes relevant when querying custom type's fields.

For example, when creating a resolver for the field `user` in the GraphQL type `Example` the _parent_ will not be undefined.
Because it will first hit the `Example` and retrieves the `id` before trying to resolve the `user`.

If you look at a resolver defined like:

```ts
const Resolvers = {
  Query: { example, exampleWithArgs },
  Example: {
    user
  }
}
```

We will have for `user` a resolver that could be looking like:

```ts
export async function user(
  parent: Omit<Example, 'user'>,
  _: undefined, // No arguments here
  context: AppContext,
): Promise<User> {
  return context.findUserFrom(parent.id);
}
```

The [`Omit`][14] type in typescript allow to create a type minus some keys. 
In this case we know that the parent is of type `Example` but the `user` from this type is not yet resolved and not part
of the parent, hence using `Omit` for clarity.

You can find more about field resolvers in this [aritcle][21] about [advanced graphql queries][21].

#### Use of `info`

The [info][1] is mostly for more advanced use case as you'd normally not need it.
But it becomes particularly helpful when you want ahead of time check which fields are being queries so your application
can "manually" resolve them.

- This can happen with multiple nested objects over multiple dataSources or APIs which could grouped to save time when
fetching them.
- Another use case would be when you're using a GraphQL dataSource to fetch certain data depending on the fields being
queried. Knowing in advance what you'll need to resolve helps you identify what you need or not to fetch.

Let's take a quick look at what this info field look like, I have removed part of the information, as it can be
pretty lengthy. But you should be able to get the [gist][11] of it:

```js
const info = {
  fieldName: "example",
  fieldNodes: [],                 // Array of nodes (using fragment creates nested nodes)
  returnType: "Example",
  parentType: "Query",
  path: { key: "example", typename: "Query" },
  schema: {},                     // the whole schema
  fragments: {},                  // the fragment used
  operation: {                    // The actual operation, with the queried fields
    kind: "OperationDefinition",
    operation: "query",
    variableDefinitions: [],
    directives: [],
    selectionSet: {
      kind: "SelectionSet",
      selections: [],
      loc: { start: 0, end: 86 }  // The AST is a string, so it's the character's position
    }
  },
  variableValues: {},
  cacheControl: { cacheHint: { maxAge: 0 } }
}
```

If you need to "read" the information you might want to check out one of those
libraries; [Mikhus/graphql-fields-list][2], [robrichard/graphql-fields][3] or [graphql-parse-resolve-info][13]

### GraphQL functionalities

Out of the box, [GraphQL][4] provides [directives][5] which are annotations that can be used in the schema
like `@deprecated` or on a query like `@skip` and `@include`.

They're usually for the client side where depending on your use case you may not want to query unnecessary
information dynamically.

#### Use of `@skip` and `@include`

The [`@skip`][5] allows you to "_skip_" parts of the fields in your query. When `@skip` is true, they won't be fetched
from
the server:

```graphql
query {
  example {
    id
    user @skip(if: true) { name }
  }
}
```

If you prefer the other way around, you can decide to include or not parts of the fields from your query using the
[`@include`][5] directive. When `@include` is false, the field won't be fetched from the server:

```graphql
query {
  example {
    id
    user @include(if: false) { name }
  }
}
```

Since the directive is placed on the `user` field, none of the nested fields (like `name`) will be fetched from those
queries. [Experiment][7] online or [check][6] other use cases.

#### Fragments

[Fragments][8] in GraphQL are parts of a query. When dealing with [complex schema][9] it allows to simplify the query
notation.</br>
Let's create a fragment for a `User` in a dedicated "_fragments.ts_" file with the adequate field:

```ts
import { gql } from 'graphql-tag'

export const user = gql`
  fragment user on User {
    name
  }
`
```

In our case `User` is an actual GraphQL type and the field `name` is defined on it. </br>
Perfect, now when querying, instead of writing all the fields, we can just import and use our schema such as:

```ts
import { user } from "../fragments";

const example: Example = await client.query({
  query: gql`
    ${user}
    query {
      example {
        id
        user { ...user }
      }
    }`
}).then(result => result.data.example)
```

This way we're querying the `name` of the `User` that is passed through the fragment.

A [fragment][8] can also be made out of other fragments, making nested queries much more digest,
on more recent version parameters within fragment becomes compatible as well, as the variables gets propagated within
them.

The [apollo client][9] reads and interprets the fragments thanks to its [cache][10].


[1]: https://www.apollographql.com/docs/apollo-server/data/resolvers/
[2]: https://github.com/Mikhus/graphql-fields-list
[3]: https://github.com/robrichard/graphql-fields
[4]: https://graphql.org/learn/queries/#directives
[5]: https://www.apollographql.com/docs/apollo-server/schema/directives/
[6]: https://dgraph.io/docs/graphql/queries/skip-include/
[7]: https://graphql-api.com/guides/directives/skip-include/
[8]: https://www.apollographql.com/docs/react/data/fragments/
[9]: https://www.apollographql.com/docs/react/v2/data/fragments/#fragments-on-unions-and-interfaces
[10]: https://www.apollographql.com/docs/react/caching/cache-configuration/
[11]: https://www.prisma.io/blog/graphql-server-basics-demystifying-the-info-argument-in-graphql-resolvers-6f26249f613a
[12]: https://graphql.org/
[13]: https://www.npmjs.com/package/graphql-parse-resolve-info
[14]: https://www.typescriptlang.org/docs/handbook/utility-types.html
[20]: {% post_url 2021/2021-12-06-Apollo-graphql-mutations %}
[21]: {% post_url 2021/2021-11-06-Advance-apollo-graphql-queries %}