---
layout: post
title: Federation and generated GraphQL types
color: rgb(89,11,140)
tags: [graphql]
---

We talked before in this blog about [federation][10], and its [advanced possibilities][11]. We also covered
the topic of [generating the typescript objects][12] from your GraphQL files using [codegen][1].
So in this article we will be talking about both, generating typescript objects from Federated GraphQL!

It's not as straightforward, because federation depending on your use case may add some circular references
to your types. So the default generated type won't cut it.

## GraphQL Schema

### GraphQL types

We will go with the `Book` type that has an `Editor` linked to it which is resolved externally via federation with 
another API.

```graphql
# Federation
directive @key(fields: String) on OBJECT
directive @external on FIELD_DEFINITION
directive @extends on OBJECT

type Book @key(fields: "id") {
    id: ID!
    title: String!
    author: String!
    category: BookCategory!
    pages: [Page]!
    editor: Editor!
}

type Editor @key(fields: "id") @extends {
    id: ID! @external
}

type Page {
    number: Int!
    content: String!
    book: Book!
}

enum BookCategory {
    FICTION,
    BIOGRAPHY,
    POETRY,
    HISTORY,
    EDUCATION,
}
```

I am using some federation-specific directives that we seen in the [graphql federation][10] article. 
We also have the `Page` type with a back-link to its book and an enum for the `BookCategory` for interesting use cases.

### Mutations and Queries

To add onto that, we will have a couple of queries and mutation. The mutation's input and response are pretty much
irrelevant in this example, they would take some book information and return the `Book` type in the response:

```graphql
type Query {
    books: [Book!]!
    pages(bookId: ID!): [Page!]!
}

type Mutation {
    addBook(input: AddBookInput): AddBookResponse
}
```

This should be enough preparations to get started on the code generation.

## GraphQL Codegen

### Configuration

If you are using the [typescript version][1], rather than with the yaml configuration, the configuration keys and values
are the same. I leave the default example for federation, Find the full [installation and configuration][12] of 
the codegen tool in the previous article.

```yml
schema:
  - "./src/graphql/schema.graphql"
generates:
  ./src/__generated__/resolvers-types.ts:
    plugins:
      - "typescript"
      - "typescript-resolvers"
      - "typescript-operations"
    config:
      federation: true
      wrapFieldDefinitions: true
      useIndexSignature: true
      skipTypename: true
      typesPrefix: GraphQL
      defaultMapper: Partial<{T}>
      mappers:
        BookCategory: ../app/models#BookCategory
      enumValues:
        BookCategory: ../app/models#BookCategory
```

Let's review the configuration we're using:
- `federation`: To create the `ReferenceResolver` for the `__resolveReference` used by federated objects.
- `useIndexSignature`: To create the types in an index object, so you can do `ResolversTypes['Book']` to get the type.
- `wrapFieldDefinitions`: Adds a `FieldWrapper` type around the returned objects, for flexibility (not actually needed in the examples).
- `skipTypename`: To remove the `__typename` from the GraphQL type, since they're not necessary and added by Apollo automatically.
- `typesPrefix`: To prefix `GraphQL` in front of all generated types
- `mappers`, `enumValues`: So it doesn't generate a new GraphQL enum when I have one already setup in the code (easier casting).
- `defaultMapper`: Using `Partial` types since some fields can be resolved by different resolvers.

Let's have a closer look at the generated objects.

### Generated Objects

#### Circular dependency

This is how the type is being generated if `page` as a reference to its `book` in GraphQL or not. This kind of 
circular dependency in GraphQL can be common, having the generated types makes it easier to deal with.
Usually the back link (page -> book) is handled via a dedicated resolver, so the resolving logic doesn't spiral out:

```ts
export type GraphQLResolversTypes = ResolversObject<{
  // With Circular dependency
  Page: ResolverTypeWrapper<Omit<GraphQLPage, 'book'> & { book?: Maybe<GraphQLResolversTypes['Book']> }>;
  // Without Circular dependency
  Page: ResolverTypeWrapper<GraphQLPage>;
}>
```

The type uses `Omit` to remove the mandatory `book` field and replace it with a `book?` attribute that is optional.

#### Enum

Since we mapped the GraphQL enum to the typescript enum we have in the project, we can see it being imported 
in the generated types file.

```ts
import { BookCategory } from '../app/models';

export interface GraphQLBook {
  category: FieldWrapper<BookCategory>;
  // ...other fields
}
```

And we can see it being used by the `GraphQLBook` generated type for `Book`.

#### Federation resolver

For the federation resolver, we are talking about the `__resolveReference` which is used for to resolve a type by federation. 
It is not meant to be used directly by a user only for the federation framework, but needs to be implemented in the service.

The type is being wrapped with `ReferenceResolver` which is a generated help type for reference.

```ts
export type ReferenceResolver<TResult, TReference, TContext> = (
  reference: TReference,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type GraphQLBookResolvers<ContextType = MyContext, ParentType = GraphQLResolversParentTypes['Book']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<
    Maybe<GraphQLResolversTypes['Book']>, // TResult
    { __typename: 'Book' } & GraphQLRecursivePick<UnwrappedObject<ParentType>, {"id":true}>, // TReference
    ContextType>; // TContext
  pages?: Resolver<Array<Maybe<GraphQLResolversTypes['Page']>>, ParentType, ContextType>;
}>;
```

If we look closer at the type arguments, we have:

- The `TResult`: the `GraphQLResolversTypes['Book']` which is the generated type that is returned for the `Book` graphql type
- The `TReference`: the reference to find the book by federation in the `@key` directive, here `id` for `Book` graphql type.
- The `TContext`: Since we mapped the context to the one in-app `MyContext`, it's populated by default.

We can also find the `pages` resolver type that we are going to use in-app with a separate resolver for the pages. 
We have seen the `GraphQLResolversTypes` before it holds the resolver types for all GraphQL objects.


## Usage

Now let's use our generated type with a simple mock app for each query, mutation, fields and federation resolving 
use case.

### Query

We have the books query defined as field in the GraphQLQueryResolvers:

```ts
const Query: GraphQLQueryResolvers = {
  books,
}

function books(
  _parent: null,
  _args: null,
  context: MyContext,
): Array<GraphQLResolversTypes['Book']> {
  return context.dataSources.books.getBooks();
}
```

Some information regarding the type:
- We can't have `Array<GraphQLBook>` here because we don't return the `pages` with `.getBooks()` since it's handled by another resolver.
- The type `Array<GraphQLResolversTypes['Book']>` is equivalent to `GraphQLResolversTypes['Book'][]`.

### Mutation

For the mutation, we have something similar as one without federated types:

```ts
const Mutation: GraphQLMutationResolvers = {
  addBook: (
    _: null,
    { input }: GraphQLMutationAddBookArgs,
    context: MyContext,
  ): GraphQLResolversTypes['AddBookResponse'] => {
    return context.datasources.book.addBook(input);
  },
}
```

The only difference is regarding the return type, since it returns the created book.
In our case the book, doesn't have the pages on it and so we have to use this type instead of `GraphQLAddBookResponse`
directly. It's similar to the query they don't reflect the same object:

```ts
// AddBookResponse generated type
GraphQLResolversTypes['AddBookResponse']
// Maps to this type
ResolverTypeWrapper<Partial<Omit<GraphQLAddBookResponse, 'book'> & { book?: Maybe<GraphQLResolversTypes['Book']> }>>;
```

As shown above, it's better to use the type from `GraphQLResolversTypes` than its actual form, which can be pretty verbose.
The downside is that mistakes or typo can easily happen which would mean losing the type check.

### Entity resolution

#### For Book
For the federation resolver `__resolveReference`, we don't have a neat parent type that is generated.
If you look back at the resolver's definition it looks like:

- The typename plus the id: `{ __typename: 'Book' } & GraphQLRecursivePick<UnwrappedObject<ParentType>, {"id":true}>`

So instead I added a custom type for it that's less complex.

```ts
const Book: GraphQLBookResolvers = {
  __resolveReference: (
    book: { id: string },
    { dataSources: { books } }: MyContext
  ): GraphQLResolversTypes['Book'] => books.getBookById(book.id),
  pages, // pages resolver for book
}
```

I didn't go into too many details for the `pages` resolver, as like the `__resolveReference`, the type used would be 
from the `GraphQLResolversTypes`.
We use the `GraphQLBookResolvers` at the top of our fields resolvers for book to ensure that the created resolver stays
consistent with the GraphQL schema.

#### For Page

The other interesting part is resolving the book from the page. In this case we use an internal value on the `page` to
match it to the book: `bookId`. This is not on the GraphQL schema and so is not generated.
It is marked as optional, so it doesn't break the `GraphQLPageResolvers` type which doesn't know about it.

```ts
const Page: GraphQLPageResolvers = {
  book: (
    page: GraphQLPage & { bookId?: string },
    _args: null,
    { dataSources: { books } }: MyContext
  ): GraphQLResolversTypes['Book'] => {
    return books.getBookById(page.bookId);
  }
}
```

This is one gimmick to be able to return the book from the pages. 
Another one could have been to return the parent book in the pages resolver of the book directly, so it's not fetched again!

```ts
const Book: GraphQLBookResolvers = {
  pages: (
    book: GraphQLBook, // The parent book
    _args: null,
    { dataSources: { books } }: MyContext
  ): GraphQLResolversTypes['Page'][] =>
    books.getPagesByBookId(book.id).map(page => ({ ...page, book })),
}
```

This sounds like an optimal solution, but can get out of hands with malicious circular queries where each time the `pages`
resolver gets called the full parent (and pages) get copied over.
A way to stop that is using rate limiter or query depth limiter on your GraphQL API as discussed in this [article][13].

## Conclusion

Using generated types with federation is not as good of an experience as you'd expect. 
Particularly for resolvers outside mutations and queries that can be either reached from outside the application
(federated), or via within the application (i.e. for fields resolved through multiple resolvers in-app).
There are no special `Federated` types, 
but they are grouped in a `ResolversParentTypes` or `ResolversTypes` object which makes accessing the right one
obnoxious:

- Making a typo while accessing the type will create a situation where the type is silently converted to `any`
  - For example, between ✅`ResolversTypes['Book']` and ❌ `ResolversTypes['book']`
- The `__resolveReference` doesn't even have a real type to use for the reference.
- Duplicates types that may not work depending on the resolving object
  - For example, ✅ `GraphQLResolversTypes['AddBookResponse']` and ❌ `GraphQLAddBookResponse`
- Missing flexibility for parent types with internal fields.
  - For example, with the `bookId` on the page which is not in GraphQL but passed by the parent resolver.
  - In this case, I don't think it can be automated, since it could be dependent on the framework.

Using those generated types is not that simple, I would rather have aliases with maybe a prefix for federation use instead.
However, it _does help_ with typing, and in the end, that's why it is being used.
The [maintainers][2] are aware of the challenges and a re-work of the federation generation is on their backlog.
All in all, it is a pretty cool tool for your graphql API and not with the new server [GraphQL generation starter pack][3],
it almost built the whole API shell for you!


[1]: https://the-guild.dev/graphql/codegen/docs/getting-started
[2]: https://github.com/dotansimha/graphql-code-generator
[3]: https://the-guild.dev/graphql/codegen/docs/guides/graphql-server-apollo-yoga-with-server-preset
[10]: {% post_url 2022/2022-10-11-Graphql-and-federation %}
[11]: {% post_url 2023/2023-03-03-Advanced-federated-graphql-apollo %}
[12]: {% post_url 2023/2023-04-04-Generating-graphql-models-typescript %}
[13]: {% post_url 2021/2021-11-06-Advance-apollo-graphql-queries %}
