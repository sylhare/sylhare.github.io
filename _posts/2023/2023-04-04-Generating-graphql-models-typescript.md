---
layout: post
title: Generating GraphQL models in typescript
color: rgb(32, 129, 140)
tags: [graphql]
---

Having used [GraphQL][10] with typescript and [Apollo][1], you might have found yourself creating data objects for the GraphQL
resolvers. That becomes quickly tedious and even possibly chaotic if those data representations are used for more than
what they're supposed to be. 

Talking about tedious, Apollo is releasing breaking-change-major version each year while deprecating the previous one.
They also dropped support on a bunch of web server frameworks. Which makes you wonder if the library is ever going to
be stabilized.

Anyway, code generation is actually very useful to reduce that boilerplate code for GraphQL and makes the types 
directly driven by the schemas, so they're always in sync. 

## Codegen

The [codegen][2] tool that we are here using is featured on [the-guild.dev][3] which is curated list of GraphQL tools 
and solutions.
It is even mentioned on the Apollo Server v4 [official documentation][4], and that's what we are going to use as base.

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-resolvers
```

To install the necessary dependencies for the examples.

### Config

Here is a simple configuration to generate the types, save it in a file called _codegen.yml_, the path in the 
configuration is either from where you'll run the code generation command or based on the generated files.

```yaml
# Glob matching with '*' works too.
schema: "./schema.graphql"
generates:
  # Specify where our generated types should live.
  ./src/__generated__/resolvers-types.ts:
    plugins:
      - "typescript"
      - "typescript-resolvers"
    config:
      # Adds the ResolversObject type
      useIndexSignature: true
      # Generated type takes the GraphQL's schema name
      # by default, but you can specify a suffix or prefix
      typesPrefix: GraphQL
      typesSuffix: ""
      
      # Providing our context's interface ensures our
      # context's type is set for all of our resolvers.

      # This file path starts from the location of the
      # file where you generate types.
      contextType: "../index#MyContext"
```

Now if you need more flexibility on the generated types, like if your resolver partially resolve a type (in the case of
federation), or if you've using specific generated graphQL objects then you have access to more configuration option
within this plugin.

You can separate them from your domain objects. However, if you have existing
model that you would like to keep, you can use a mapper to map those and not generate extra ones using:

```yaml
    config:
      defaultMapper: Partial<{T}>
      mappers:
        User: ./models#UserModel
        Profile: ./models#UserProfile
```

Follow the [better type safety article][5] for more configuration examples.
All those configurations are optional, but that lets you see the potential of the tool, having defined types is going
to be helpful while typechecking your resolvers and the object they return automatically.

### Generated types

Generate the types with this command using the configuration file:

```bash
npx graphql-code-generator -c codegen.yml 
```

For a GraphQL Book definition we had:

```graphql
type Book {
  title: String
  author: String
}
```

Which translates into:

```ts
export type GraphQLBook = {
  __typename?: 'Book';
  author?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};
```

As you can see the typename is added as optional by default, then optional GraphQL fields are tagged with `Maybe` and 
the Scalars in now a key value typescript type (`Scalars['String']` matches the `string` type).

Same for a mutation, here for example we have the `addBook` mutation to add a book:

```graphql
type Mutation {
    addBook(title: String, author: String): AddBookMutationResponse
}
```

We can have the MutationResolvers type generated with the matching context defined in the configuration:

```ts
export type GraphQLMutationResolvers<ContextType = MyContext, ParentType extends GraphQLResolversParentTypes['Mutation'] = GraphQLResolversParentTypes['Mutation']> = ResolversObject<{
  addBook?: Resolver<Maybe<GraphQLResolversTypes['AddBookMutationResponse']>, ParentType, ContextType, Partial<GraphQLMutationAddBookArgs>>;
}>;
```

It's not very pleasing to the eye, but it does make sense once used in the code.

### Using generated types in code

Now you can use the generated types as you please, like for that book's object you can now use `GraphQLBook` for your
book query instead of creating a new type.

Also, for that mutation by using the `GraphQLMutationResolvers` type, you don't need to explicitly specify the types
of the arguments since with it's already specified with the correct context within its type definition:

```ts
import { GraphQLMutationResolvers } from '../__generated__/resolvers-types';

const mutations: GraphQLMutationResolvers = {
  addBook: (_, { title, author }, { datasources }) => datasources.books.add({ title, author }),
}

export default mutations
```

With the context passed you can destructure to get the dataSources immediately without specifying the type.

The notation is slimmer, but you may still want to have explicit types such as the `GraphQLMutationAddBookArgs` for the
argument or the `GraphQLAddBookMutationResponse` for the response available for you to use, especially if the mutation
is defined in another file.


[1]: https://www.apollographql.com/docs/apollo-server/
[2]: https://the-guild.dev/graphql/codegen
[3]: https://the-guild.dev/
[4]: https://www.apollographql.com/docs/apollo-server/workflow/generate-types/
[5]: https://the-guild.dev/blog/better-type-safety-for-resolvers-with-graphql-codegen
[10]: {% post_url 2021/2021-07-26-Apollo-and-graphql %}
[11]: {% post_url 2022/2022-10-11-Graphql-and-federation %}
