---
layout: post 
title: Apollo GraphQL 👩‍🚀 mutations 
color: rgb(224, 129, 25)
tags: [GraphQL]
---

Let's have a look at mutations! 🔭

The type `Mutation` is where you stack all of your [mutations][1] in GraphQL. The basic mechanism stay the same as
queries, so if you have read the [Apollo 🚀 and GraphQL]({% post_url 2021/2021-07-26-Apollo-and-graphql %})
and the [Advanced 🛰 Apollo Graphql queries]({% post_url 2021/2021-11-06-Advance-apollo-graphql-queries %}) article, you
should be all set!

## Definitions

We have [mutations][1], to explicitly separate in GraphQL the calls that:

- fetch information from the API → Query
- modify information using the API → Mutation

As they say in this [Mutation vs Query][2] article from the Apollo blog, following the [CRUD][3] (Create, Read, Update,
Delete), we have the queries for the **R** and the mutations for the **CUD** operations. 😛

## In GraphQL

There are multiple [guidelines][4] out there on how to name and design your mutations.

> Overall set of graphql guidelines available at [graphql-rules.com][4] and on this [article][8]

But the basic is that you'll add a new field on the `Mutation` type that will most likely take some parameters and
return something.

### Input

The input, what the mutation takes as an argument should be one parameter of type `MutationNameInput`. It's a pattern
used for example by [GitHub][5] or [Shopify][7] on their public GraphQL API.

```graphql
type Mutation {
    addBook(input: AddBookInput)
}

input AddBookInput {
    title: String!
    authorName: String!
}
```

The input is of type `AddBookInput` here and takes the title and the author's name to create a book.

### Payload vs Result

Another [rule][4] is that we need to have one unique return type. GraphQL's mutation can become very granular with as
many mutations as action that can be performed on an entity (Add, Rename, Disable, Update, Promote, Delete, ...).

On this side we have [Zalando][6] or [Twitter][8]'s engineer that recommend using the pattern `Result`, while other
like [GitHub][5] or [Shopify][7] are talking about the `Payload` pattern:

```graphql
extend type Mutation {
    addBook(input: AddBookInput): AddBookPayload
    addAuthor(input: AddAuthorInput): AddAuthorResult
}
```

As long as there's only one type per mutation, either name is ok. What changes is the error handling is usually done
differently depending on the naming.

### Errors

[Errors][10] comes in two kinds:

- Technical errors
    - Malformed requests, e.g. wrong types or syntax.
    - Error thrown in the resolver, e.g. bad authentication, resource not found.
    - Any kind of network error.
- Business errors, that breaks the software business rules:
    - e.g. Purchase a book that is not released yet
    - e.g. Set a book title with a title that goes over the max size limit.

On the first version, all mutation would return [HTTP 200 OK][10] (now we can set up some other http codes if need). But
the [mindset][9] remains, to let the user know if there's any business error, while returning a 200 OK.

#### UserErrors in Payload

With the payload, you'll have a unique per mutation user error union that represents all the possible business failure
cases. They will all implement the [UserError][8] interface.

```graphql
interface UserError {
    "The error message."
    message: String!
    "The path to the input field that caused the error, sometime named path"
    field: [String!]
}
```

I find field more obvious, since it's to reflect which input field if any caused the issue. But it's shown as a path. If
there was something wrong with the title field for `AddBookInput`, the path would be `["input", "title"]`.

```graphql
type AddBookPayload {
    book: Book
    userError: [AddBookError]
}

union AddBookError =  InvalidBookTitle | InvalidAuthorName | DuplicatedBookError
```

The example payload have its own set of error. The `AddBookError` is a union meaning it regroups all the types
between `|` which in this case implements, the previously defined interface:

```graphql
type InvalidBookTitle implements UserError {
    message: String!
    field: [String!]
}
```

The payload's book is the created book from the mutation. Since the whole updated object is returned, you don't need to
re-query it behind.

#### Custom Errors in Results

As shown in this [article][8], the [twitter way][9] is to use Result as a union and pass down to it all diverse types
the mutation can return, be it entity, error or a mix.

```graphql
union AddAuthorResult = AuthorCreated | InvalidAuthorName | InvalidAuthorBooks

type AuthorCreated {
    author: Author!
}

type InvalidAuthorBooks implements UserError {
    message: String!
    field: [String!]
}
```

We can also use `UserError` in this case, or even go further and have another union for the errors. This is great when
the schema has been figured out and won't evolve since you can really taylor your query on each field. But it does make
evolving the graph difficult, since it'll get [tightly coupled][8] to the types and query used on the client side.

You can keep your query generic, but then you loose on the benefits of Result, so why not use the userError handling in
with Payload instead.

## Mutation on the client side

Let's have a look at how to use those mutations on the client side now.

### Mutation `addBook`

Using the Payload pattern:

```graphql
mutation($input: AddBookInput) {
    addBook(input: $input) {
        book { title }
        userErrors {
            # Interface contract
            ... on UserError {
                message
                field
            }
        }
    }
}
```

We use the interface to get all errors in this case, but we could also use `... on` each error types. You can pass
variable to the mutation using the `$` sign, here the input would look like:

```json
{
  "input": {
    "title": "Frankenstein",
    "authorName": "Mary Shelley"
  }
}
```

The variable is a json object.

### Mutation `addAuthor`

Using the Result pattern:

```graphql
mutation {
    addAuthor(input: { name: "Mary Shelley", bookTitles: ["Frankenstein"] }) {
        ... on AuthorCreated { author { name } }
        ... on InvalidAuthorName { message }
        ... on InvalidAuthorBooks { message }
    }
}
```

Each possible results needs to be addressed so that you don't miss it, which makes it hard to
maintain in case we add new fields or types.

But it does read nicely for each defined case.

## Implementation

### Resolver field

As explained in the [previous article]({% post_url 2021/2021-11-06-Advance-apollo-graphql-queries %}), 
to implement the mutation, we need to add a resolver function corresponding to the new Mutation field.
So we will now have:

```typescript
import { addBook } from './resolvers/Mutation/addBook';
import { addAuthor } from './resolvers/Mutation/addAuthor';

const Resolvers = {
    Mutation: {
        addBook,
        addAuthor
    }
}
```

For the implementation of the function, they both use the same underlying principles.
So we'll review only one of them.

### Resolver function

So we've re-created the interfaces / classes necessary to match our GraphQL schema for the entities, input,
payload and errors.
Now that the resolver's function has been set in the schema, we can create a function that will handle it.
Let's focus on `addBook`:

```typescript
export async function addBook(
    parent: null,
    { input }: { input: AddBookInput },
    { dataSources }: AppContext
): Promise<AddBookPayload> {
    const errors: AddBookError[] = validateInput(input);
    const addedBook = errors.length ? undefined : await dataSources.books.createBook(input.title, input.authorName);

    return { book: addedBook, userError: errors };
}
```

Let's recap on the input for this mutation:

- The parent is always null because this resolver is for a mutation
- The expected input needs to be an object hence the redundancy with `{ input }` not being directly an AddBookInput.

We use an async function, because the call to the dataSource to create a book returns a Promise 
that we await in the case where there are no user error detected via the `validateInput`.
The validation function is where you place your _business logic_ to run against the input, it will return
user error such as `InvalidBookTitle` or `InvalidAuthorName`.

### Context and DataSource

With mutation, you usually need a database to save permanently the changes you've made.
In Apollo, you'd need a dataSource which is an interface to your database. 
Those dataSources are accessible via the context we've seen in the mutation.
Let's see how the dataSource(s) are passed to the ApolloServer:

```typescript
const apolloServer: ApolloServer = new ApolloServer({
  schema,
  dataSources,
});
```

The dataSources could be one or more source (like multiple collection of a db).
You can also have the http context, everything is defined within the `GraphQLServerOptions` interface:

```typescript
export interface GraphQLServerOptions<
  TContext = Record<string, any>,
  TRootValue = any
> {
  schema: GraphQLSchema;
  dataSources?: () => DataSources<TContext>; // For your datasources
  context?: TContext | (() => never); // For http interceptor
  //...other attributes
}
```

In our case we would define one for the books holding all the necessary logic to create the new book in the db.
That `BookDataSource` would then be next to a `AuthorDataSource` within my `AppDataSources` which contains all the 
datasource of my apps. That I can use from the Context in the mutation.

Find the working examples in [sylhare/Apollo](https://github.com/sylhare/Apollo) in the typescript folder.


[1]: https://graphql.org/learn/queries/#mutations "mutation"
[2]: https://www.apollographql.com/blog/graphql/basics/mutation-vs-query-when-to-use-graphql-mutation/ "mutation vs query"
[3]: https://en.wikipedia.org/wiki/Create,_read,_update_and_delete "CRUD"
[4]: https://graphql-rules.com/rules "Rules"
[5]: https://docs.github.com/en/graphql/reference/mutations "GitHub Input"
[6]: https://engineering.zalando.com/posts/2021/04/modeling-errors-in-graphql.html "Zalando Result and Field"
[7]: https://shopify.dev/api/admin-graphql/2021-01/input-objects/MoneyInput
[8]: https://productionreadygraphql.com/2020-08-01-guide-to-graphql-errors "UserError Result"
[9]: https://sachee.medium.com/200-ok-error-handling-in-graphql-7ec869aec9bc "Twitter Custom Error Result"
[10]: https://www.apollographql.com/blog/graphql/error-handling/full-stack-error-handling-with-graphql-apollo/ "Apollo Error"
