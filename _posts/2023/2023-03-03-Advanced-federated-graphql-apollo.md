---
layout: post
title: Advanced GraphQL federation with Apollo
color: rgb(190, 107, 191)
tags: [graphql]
---

If you are unfamiliar with GraphQL or Federation, click on the links and there should be enough content to get you up
to speed for this topic.
In this context we're working in a multi-services complex GraphQL environment with multiple subgraph using some
new directives from Apollo Federation v2 (it's [backward compatible with v1][2] but the syntax has been updated). Let's have a 
recap on how to integrate with it.

## Federated entity

Now let's imagine you have an external service which resolve a `Blog`, a federated GraphQL type:

```graphql
type Blog @key(fields: "id") {
    id: ID!
    name: String!
    about: Pages!
    posts: [BlogPosts]!
}
```

You can see the `@key` directive which tells you that you only need its id to resolve it by federation. 
Then within that same external service you can have another federated type `BlogPost` which could be defined as:

```graphql
type BlogPost @key(fields: "id blog { id }") {
    blog: Blog!
    id: ID!
    category: String
    content: String
}
```

For the `BlogPost` type, it only lives attached to a blog, so you need the blog's id and for that we are using the 
compound key `blog { id }` so the user needs both the blog and the post key to resolve it.

## Extending the entity

### Difference between Federation v1 and v2

Let's extend the `Blog` type via a stats service that will resolve some `BlogStats` to get the number of visitors for
example.

With Federation v2 you don't need to use `extend` because each [subgraph can define an entity][2] and contribute fields to
it. So unlike v1 there's no main entity which other subgraph extends from. The previous definition of the `Blog` type 
does not change, but here is how the extended type would look like in both v1 and v2 🍌:

```graphql
## Extended entity in Federation v1
extend type Blog @key(fields: "id") {
  id: ID! @external
  stats: BlogStats!
}

## Extended entity in Federation v2
type Blog @key(fields: "id") {
    id: ID!
    stats: BlogStats!
}
```

As you can see the `@external` is also no longer needed for the `@key` fields of the extended entity. 

### Federation with compound key

Let's say now that you want to have a feed service that will show for user a list of posts from any available blog in the
platform. For that we'll resolve the BlogPosts via federation inside the feed. The GraphQL should be:

```graphql
type PostFeed {
    id: ID!
    user: ID!
    posts: [BlogPost]!
}

type BlogPost @key(fields: "id blog { id }") {
    id: ID!
    blog: Blog!
    feedPosition: Int!
}

type Blog @key(fields: "id", resolvable: false) {
    id: ID!
}
```

In this particular case we do have `Blog` as part of the `BlogPost` since it is within the key's fields.
And thus for the graph to be valid we would need to define the type for it.
By using `resolvable: false` we can _stub_ the definition saying that the service [does not define a reference
resolver][3] for teh Blog entity. And we will only include the id of the blog via the `BlogPost` entity since it's part
of the key fields.

You can see that this subgraph is extending the `BlogPost` and will add one new field the `feedPosition` in this subgraph.
This means that assuming we have queries for the blog and the feed, then the `feedPostion` will only be resolved from:

```graphql
# ✅ resolved with feed query
{
    postFeed(id: "postFeedId") {
        posts {
            feedPosition
        }
    }
}
# ❌ not resolved with blog query
{
    blog(id: "blogId") {
        posts {
            feedPosition
        }
    }
}
```

GraphQL as the name says is a graph and in graph theory you have a concept called "_path_" and depending on the path you
take from the query, some fields can or cannot be resolved. Having the `feedPosition` defined in the resolver for the 
blog in the Blog service is not necessary.

### Querying with federated fields

Let's have a look back at our postFeed query type, as you can see you pass an id, and you can get the full `PostFeed` 
object matching that id:

```graphql
 type Query {
    postFeed(id: ID!): PostFeed 
}
```

Now let's enhance our query to fetch more information, for example we see that the _blog_ is available within the _post_
in our `postFeed` query.

```graphql
query ($id: ID!){
    postFeed(id: $id) {
        post {
            feedPosition
            blog {
                id
                name
            }
        }
    }    
}
```

The blog is not resolved by the same application in the `postFeed` query. As you can see before in the graphQL
type definition, we only described blog by its id. However, that does not we don't return anything. For the federation
to work we need at least the id to find the correct blog.

Now concretely what it means is that the actual resolved object for `PostFeed` should look like:

```json
[
  {
    "post": {
      "feedPosition": 1,
      "blog": {
        "id": "blog-id"
      }
    }
  }
]
```

Then by federation, postFeed app won't be targeted to resolve blog at all since we put `resolvable: false` and will 
directly use the `blog.id` to call the blog resolver from the blog app to resolve the name.
To test locally, or without federation, you need to make sure that the returned `post` object does
have the id.

Validating your federated schema can be tough, fortunately Apollo made some useful tools to assert that your graph keeps
on working. Try [Apollo Studio][5] or the [rover CLI][4].

[1]: https://www.apollographql.com/docs/federation/entities-advanced
[2]: https://www.apollographql.com/docs/federation/federation-2/moving-to-federation-2
[3]: https://www.apollographql.com/docs/federation/entities/#referencing-an-entity-without-contributing-fields
[4]: https://www.apollographql.com/docs/graphos/delivery/schema-checks/
[5]: https://studio.apollographql.com/login?from=%2F
