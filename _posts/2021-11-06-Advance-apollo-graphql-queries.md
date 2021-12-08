---
layout: post
title: Advanced 🛰 Apollo Graphql queries
color: rgb(0, 114, 181)
tags: [graphQL]
---

In this article, we'll dive in some more advanced concepts for query types and resolvers.
If you are still new, or would like to review the basics, 
check out the [Apollo 🚀 and GraphQL]({% post_url 2021-07-26-Apollo-and-graphql %}) article.

## Query Resolvers

The [resolvers][1] are at the root of the query mechanism. 
A resolver is a _function_ that's responsible for populating the data for a _single field_ in your schema.

### GraphQL Query `books`

The GraphQL schema is a graph connecting types (which have fields) together.
The most obvious type is `Query` which contains multiple fields which would correspond to the base query.

```graphql
type Query {
  books: [Book!]
}
```

### Resolver structure

So nothing new, the resolver for `books` will be an imported method for simplicity:

```typescript
import { books } from './resolvers/Query/books';

const Resolvers = {
    Query: {
        books
    }
}
```

You can see that the field books has been mapped to a `books` folder.
When querying, the resolver will hit the `Query` type then look for the `books` function.

## Type Resolvers

### GraphQL Query with more types

Now let's say we define the Book object having an `author` field of type `Author`.

```graphql
type Book {
  title: String!
  author: Author!
}

type Author {
  name: String!
}
```

Now we can also add a resolver on `Book` so that the `author` field when queried will be called.

For example with a query:
```graphql
query {
    books {
        title 
        author {
            name
        }
    }
}
```

This will get all the books, their title and their author's name. <br>
For the sake of the example, the books and the authors are two separate data entities.
A new resolver on a field is only useful when you need to apply some logic, use some input 
to find the correct value.

### Implementation of `author` resolver

Now when querying the fields in Book, we want to use the specific resolver we're assigning
to that field.

The new resolver would look like:

```typescript
import { author } from './resolvers/Book/author';

const Resolvers = {
    Query: { books },
    Book: {
        author
    }
}
```

You can see that we added a new resolver for the type `Book` on the field `author`.
Which means the `author` function will be called when querying the author of a book.

Let's see how the resolver function for `author` will look like:

```typescript
export function author(parent: Book, _: any, context: any) {
    return context.authorDataSource.find(author => author.books.includes(parent.title) );
}
```

The first argument is the parent, which in this case is a `Book`, since you always query the author
from a book. <br>
In the context, you usually have everything you need like a dataSource which is an adapter to access
your data (e.g. from a database).
In this case we could have all the others that are stored with a list of books title in `author.books`.

## Filtered fields 

### GraphQL `authors` query

For example having a new `authors` query to query all the authors and their books like:

```graphql
type Query {
    authors: [Authors!]
}

type Author {
  name(name: String): String!
  books: [Book!]!  
}
```

In here, we put an input on one of the field within the `Author` type that can be queried.
Meaning we can filter for author's name (or part of the name like firstname/lastname).

```graphql
query {
    authors {
        name(name: "Edgar")
    }
}
```

It would yield all authors whose name contains _"Edgar"_.

### Implementation of the `name` resolver

We would have a `name` resolver in the `Author` type that will handle the arguments and the logic.

Here is an updated view of the resolvers:

```typescript
import { authors } from './resolvers/Query/authors';
import { name } from './resolvers/Author/name';

const Resolvers = {
    Query: { books, authors },
    Book: { author },
    Author: {
        name
    }
}
```

In this case the `name` resolver will look like:

```typescript
export function author(_: any, { name }:{ name: string }, context: any) {
    return context.authorDataSource.find(author => author.name.includes(name) );
}
```

We don't use the information of the parent, instead we use the argument that was passed
is an object containing the name of the author to filter on.

## Circular resolver

Adding the `books` field to the `Author` type we created a _circular resolver_ in our graph.
Circular dependency is not recommended, because it can break your app with infinite query loop.
You could query it ever and ever:

```graphql
query {
    books {
        title
        author {
            title
            books {
                title
                author {
                    ...
                }
            }
        }
    }
}
```

In this case, you would need a depth limiter, that will throw an error when you go on too many level in your query.
Here there are already more than 4 levels in depth.

There are more caveat to look after in the [Apollo Federation][2]
documentation. For this particular problem, you can use the [_graphql-depth-limit_][3] library which fix it for you.


[1]: https://www.apollographql.com/docs/apollo-server/data/resolvers/ "resolver"
[2]: https://www.apollographql.com/docs/federation/enterprise-guide/graph-security/#limit-query-depth "Apollo doc pbs"
[3]: https://www.npmjs.com/package/graphql-depth-limit "graphql-depth-limit"
