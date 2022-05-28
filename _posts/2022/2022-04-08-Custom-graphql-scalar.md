---
layout: post
title: GraphQL custom scalar 🔭  
color: rgb(205, 33, 42)
tags: [GraphQL]
---

Continuing this GraphQL series, after [Apollo 🚀 and GraphQL][10] for the basics, then the [Advanced 🛰 Apollo Graphql queries][11]
article following by the [Apollo GraphQL 👩‍🚀 mutations][12], let's dive into scalars.

As said on [GraphQL.org][2], after all the types, the fields needs to resolve to some actual data!
Those are defined by the scalar.
Unless you have used a custom scalar, you should not have seen it used in GraphQL as the existing ones are already pre-defined.

### Existing scalar 

There are 5 scalar that comes out of the box in GraphQL:

- `Int`: A signed 32‐bit integer.
- `Float`: A signed double-precision floating-point value.
- `String`: A UTF‐8 character sequence.
- `ID`: The ID scalar type represents a unique identifier. It's a `String` that is not intended to be human‐readable.
- `Boolean`: true or false.

Those have serializer, deserializer and validators already implemented, so you don't need to bother with them.
Now let's check how to create a custom scalar!

## Custom scalar

For our example we are going to use [Apollo GraphQL][1] with a type script implementation.
Find the full implementation in [sylhare/Apollo 🛰][3] as you'll find it with the full context.
Let's take the `Date` example from [Apollo][1].

### Schema

If you were to define a scalar, for example `Date` which is not a default one, you would have it like:

```graphql
scalar Date
```

Now you can start using `Date` in your other types in your GraphQL schema 🎉
But for it to work you'll need to implement some logic and validation behind it. Since your scalar is special, you 
will need to enforce that whatever is defined as a Date can actually be understood as one by your back-end or client.

### GraphQLScalarType

the `GraphQLScalarType` class is used to implement a scalar in [Apollo Server][5] in typescript.
This is a condensed example from the [Apollo Docs][1], please have a look there for more explanation on how
to create a `GraphQLScalarType`. Depending on the library or language you are using, the implementation may differ.

```ts
export const DateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    // Convert outgoing Date to integer for JSON
    serialize: (value: Date) => value.getTime(),
    // Convert incoming integer to Date
    parseValue: (value: number) => new Date(value),
    // Convert hard-coded AST string as integer then to Date or return Invalid hard-coded value (not an integer)
    parseLiteral: (ast: ValueNode) => ast.kind === Kind.INT ? new Date(parseInt(ast.value, 10)) : null,
});
```

There are three methods here, the two _parse_ method are deserializer:

- **serialize**: Converts the back-end representation into a JSON format to be sent back
  - In this example `getTime` transforms the `Date` object into a number of milliseconds
- **parseValue**: Transform a JSON value into its back-end representation
  - In this example we create a new `Date` object from a number
- **parseLiteral**: Transform a query value from the AST (Abstract Syntax Tree) into its back-end representation.
  - A query in GraphQL is sent as a tree with different nodes, the query arguments are part of a ValueNode `{kind: Kind, value: string}`.
    In our case we parse the number out of the `value` into a new `Date` object.

### Custom scalar in action

It can still be a bit abstract, so let's decompose it, how and when those methods in the `GraphQLScalarType` will be used.
Let's say we have a query to fetch an event:

```graphql
type Query {
    "Query an event from an input date"
    eventAt(date: Date!): Event
}

type Event {
    id: ID!
    createdAt: Date!
    name: String!
}
```

Now that we have our example, you can use the query in two ways, either by hardcoding the date you want to fetch the
event, or by using a variable.

```graphql
query($date: Date) {
    eventAt(date: $date) {
        createdAt
    }
    eventAt(date: "1649187305183") {
        createdAt
    }
}
```

Now when the server advertising this query will be receiving it, it will use:
- the `parseValue` on the `$date` variable which is pure JSON `{ date: 1649187305183 }`
- the `parseLiteral` on the `"1649187305183"` which is a hardcoded value in the query
- the `serialize` to return the `createdAt` value in the query as JSON from the back-end.

### Resolver

For the previous example to work, don't forget to add the scalar implementation to your resolver.

Iit works a bit like the other types,
you need to add the scalar name `Date` and map it to your custom GraphQL scalar type `DateScalar`.

```ts
const resolvers = {
  //... other queries and mutations resolvers
  Date: DateScalar,
}
```

Now you can fully integrate it in your app.

### OpenSource

GraphQL has been fairly established, so in most case the scalars that you need outside from those out of the box might
already be existing in the language of your choice.

Don't bother reinventing the wheel and go check for GraphQL scalar on [GitHub][4] or other platforms for open-source 
implementations of the scalars you need.

[1]: https://www.apollographql.com/docs/apollo-server/schema/custom-scalars/
[2]: https://graphql.org/learn/schema/
[3]: https://github.com/sylhare/Apollo
[4]: https://github.com/search?q=scalar+graphql
[5]: https://www.apollographql.com/docs/apollo-server/getting-started/
[10]: {% post_url 2021/2021-07-26-Apollo-and-graphql %}
[11]: {% post_url 2021/2021-11-06-Advance-apollo-graphql-queries %}
[12]: {% post_url 2021/2021-12-06-Apollo-graphql-mutations %}
