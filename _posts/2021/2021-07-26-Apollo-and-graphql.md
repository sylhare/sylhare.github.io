---
layout: post 
title: Apollo 🚀 and GraphQL 
color: rgb(210, 56, 108)
tags: [graphql]
---

Let's talk about [Graph QL](https://graphql.org/) which is a query language for an API. Meaning that contrary to normal
REST APIS, with GraphQL APIs you can discover and query only the data you need form a single call.

To implement a GraphQL API, let's use [Apollo server](https://www.apollographql.com/docs/apollo-server/) which is an
open source, spec-compliant GraphQL server. We'll have a look at the Apollo
Server [getting started](https://www.apollographql.com/docs/apollo-server/getting-started/).

### GraphQL Types

Before making a Query, we need to create the objects' definitions we will return. You have some standard ones like 
_String_, _Int_ or _ID_, but you can also create your own:

```graphql
type Book {
    title: String!
    author: Author
}

type Author {
    name: String
}
```

We created two objects, a `Book` 📘 and an `Author` 👽 The `!` means that the attribute can't be _null_.

### GraphQL Query

Now you will need to create the queries that will return your books and authors:

```graphql
type Query {
    allBooks: [Book]
    book(title: String!): Book
}
```

Let's define two of theme, one that will retrieve all the books, and the other one that will get one book based on its
title. The _title_ is passed as a parameter of type _String!_.

### Make a query

Check the [how to query](https://graphql.org/learn/queries/) from the official GraphQL website for more examples. Before
we start implementing anything, let's look at how to use our defined queries:

- To get all the books but only their title:

```graphql
query AllBooks {
    allBooks {
        title
    }
}
```

- To get one book, its title and its author:

```graphql
query OneBook($title: String!) {
    book(title: $title) {
        title
        author {
            name
        }
    }
}
```

This one takes a parameter and put it in our `book` query.

### Expected results

Let's use this OneBook query to call our api:

```graphql
query OneBook($title: String! = "Lord of the rings") {
    book(title: $title) {
        title
        author {
            name
        }
    }
}
```

Let's ask for the _title_ and author's _name_ or _"Lord of the rings"_. The yielded result will be:

```json
{
  "data": {
    "book": {
      "title": "The lord of the rings",
      "author": {
        "name": "J.R.R. Tolkien",
        "__typename": "Author"
      },
      "__typename": "Book"
    }
  }
}
```

As you can see Apollo will encapsulate our `book` query in a `data` object in this json file. The `__typename` is a
hidden attribute that shows the type of the queried object (it can be ignored on the client side). This field is useful
when building the response classes for typed languages like Kotlin or Java.

### Implementation

Let's implement this `book` query in Typescript, for a javascript approach, check Apollo's docs
on [resolvers](https://www.apollographql.com/docs/apollo-server/data/resolvers/). For the main steps to create
the [application](https://github.com/sylhare/Apollo/blob/main/typescript/src/server.ts), first we will need to create an
ApolloServer:

```ts
const server = new ApolloServer({
    schema: makeExecutableSchema({
        typeDefs: TypeDefs,     // Where your put your GraphQL schema
        resolvers: Resolvers,   // Where you link your queries to your logic
    });
});
```

What we showed in the GraphQL Types and Query will go in a _schema.graphql_ which will be used to feed the `TypeDefs`.
The remaining part is to do the book's resolver:

```ts
const Resolvers = {
    Query: {
        book: async (parent: any, { title }: { title: string }) => getBook(title)
    }
}
```

It's an asynchronous function that takes the title of type `{ title: string }` (because typescript). In return, we have
getBook that will fetch the book and return the correct book from a database or, let's say:

```ts
function getBook(title: string): Promise<Book> {
    return Promise.resolve({ title: "The lord of the rings", author: { name: "J.R.R. Tolkien" } })
}
```

This one that only returns _The lord of the rings_!! 🧙

### My precious... test

Without a nice test, it means nothing. To do an end-to-end test, you would need a test client to make sure that 
the GraphQL query works all the way. At the unit size we'll check the handling logic instead. 

Let's see how to unit test our resolver:

```ts
test('Query one book', async () => {
    const query = `
            query OneBook {
                book(title: "The lord of the rings") {
                    title
                    author {
                        name
                    }
                }
            }
        `;
    return graphql(schema, query).then((result: any) => {
        expect(result.data.book.author.name).toBe('J.R.R. Tolkien');
    });
});
```

The `schema` is the schema attribute used in our application to build our ApolloServer.

We can pass our parameters directly in the variable with `query OneBook($title: String! = "Atlanta")` which is a bit
silly for only one string. This will test that the resolver returns your expected value.

As usual find some working example in [sylhare/Apollo](https://github.com/sylhare/Apollo) 🛰 and see you in Space!
