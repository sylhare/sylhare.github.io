---
layout: post
title: GraphQL Optimization
color: rgb(217, 7, 122)
tags: [graphql]
---

You should already be familiar with [GraphQL][10] by now, but if you are still unsure about [queries][11] 
and [mutations][12], don't hesitate to click on the links to direct toward the article that talks about it.

In this one, we'll be looking at how to optimize our query given a specific context. Not all solution may apply to your
case, but hopefully it should give you some leads.

### GraphQL Schema

For the purpose of an example, we're going to use this schema:

```graphql
type Movie @key(fields: "id") {
    id: ID!
    title: String!
    actors: [Actor]!
}

type Actor @key(fields: "id") {
    id: ID!
    name: String!
    movies: [Movie]!
}
```

We have the Movie type which have actors of type Actor. Since it's a [federated][16] example we use the `id` as the key
field to identify the resolved objects.
In the backend the movies and actors are stored in different tables and will be resolved with different resolvers.

We also have a simple query to get the movie such as:

```graphql
query {
    movie: Movie
}
```

With that setup, it will be easier to follow the rest of the examples in this article.

## Resolver flow

### Sequence Diagram

<div class="mermaid">
sequenceDiagram
    actor U as User
    participant API as GraphQL API
    participant DB as MySQL 

    U ->> API: Query movie and actors
    opt Movie resolver
    API -->> DB: Query for movie 
    DB -->> API: Return resolved movie
    end 
    loop Actor resolver
    API -->> DB: Query actor
    DB -->> API: Return each resolved actors
    end
    API ->> U: Return resolved<br>movie and actors

</div>

The movie resolver will resolve the information and will contain the actors' ids.
The actor resolver is [federated][16] which means that for each `Actor` there's one call to the actor's resolver
which will query the DB and retrieve the information from the database.

### DB Calls

Let's look at the DB calls in the previous flow, those are MySQL DB, so we'll use the actual queries to demonstrate
what is happening in the backend.

1. First it resolves the movie:

```sql
SELECT * FROM movies WHERE id = 7
```

2. Then for each actor, we have an independent call to db each time the resolver is called with the actor's id:

```sql
SELECT * FROM movies WHERE id = 1
SELECT * FROM movies WHERE id = 2
SELECT * FROM movies WHERE id = 3
```

With a movie with many actors, the performance may decrease with the amount of calls made to the database.

### Flow Diagram

When we see how each field is getting resolved, it may become clearer. This flow diagram represents the fields
being resolved, we have `Movie` which resolve the queried one and the `actors` field on the movie type is resolved by
multiple single resolver:

<div class="mermaid">
graph TD
    M((Movie id=7)) --> id((id))
    M --> A((actors))
    A --> A1((actor id=1))
    A --> A2((actor id=2))
    A --> A3((actor id=3))
    M --> title((title))
    A1 --> aid((id))
    A1 --> name((name))
</div>

To save some details, only the first actor's resolved fields were represented (`id` and `name`), but all of them would
resolve it.

## Optimization

How can we optimize the resolving process? It will depend on how often it's queried by your users, don't over optimize
queries that are not critical as you may make it worse.
Here are some leads that may or may not fit depending on your problem.

### More resolvers?

One optimization which may not always be possible would be to have a `actors` resolver which would resolve all of them
at once.
This way, instead of resolving the actors one by one, we would make a call to the db for all of them at once.

Unfortunately in this use case the `Actor` type is federated, which means it might be resolved by an entirely other
application within a different domain and team ownership.

> For [federated][16] entities, the `__resolveReference` is always called.

In the case where we add the `actors` field is federated but within the app, we should also take into account that
the `__resolveReference` on the _Actor_ type will be called next, and might trigger another database call.

The resolver is called with its parent, so if it already contains the fetched entity, there should be some logic within
the resolve reference, so it does not call the database again.
Because it would mean that it has been resolved by its parent resolver.

In those cases, **you will have to make a choice** depending on how the users use your query:
- which fields should always be returned?
- which should be fetched on demand?
So you gain maximum performance on your GraphQL query.
(If you've turned to GraphQL that means fetching everything at once all the time is not necessary in most cases).

### Check the info?

We talked about the `info` field in the [advanced GraphQL][15] article, which can be useful to know which fields are
getting queried.

This way we can reduce the calls to make in the database, but let's see how it would work in our example with this
query:

```graphql
query Movie {
    movie {
        title
        actor {
            id
        }
    }
}
```

If we know that only the `id` are going to be resolved from the actor, then since we by default receive those by
[federation][16] on the resolver, we can skip the call to the database and return the output directly.

But when you actually need information from the database, this solution won't reduce the amount of calls made.

### Use a DataLoader?

The last solution we can leverage is the [Dataloader][1] which, as its name says, will solve the problem of calling the
database for each individual actor. 
The `dataloader` will gather the calls to the actors' database and use a bulk load function to get them all at once.

```sql
-- Transforming those queries
SELECT * FROM movies WHERE id = 1
SELECT * FROM movies WHERE id = 2
SELECT * FROM movies WHERE id = 3
-- Into this one
SELECT * FROM actors WHERE id IN (1, 2, 3)
```

This will reduce the number of calls to the database for a resolved entity in this case. Why? 🥲 Because we are making
$$n$$ number of calls depending on the amount of actors that starred in the movie. With the dataloader [pattern][13],
those calls will be caught and transformed into one call.

Here is how you would [instantiate][14] the Dataloader from [graphql/dataloader][1], you can have it defined in your
context:

```ts
import DataLoader from 'dataloader';

loader = new DataLoader(bacthFindFromIds)

function bacthFindFromIds(ids: readonly string[]): Promise<(Actor | undefined)[]> {
    return actorsDB.findAll(ids);
}
```

To simplify things a bit, we're using `actorsDB` which would be our database, and it would have a batch
function to find all ids.
Note that:

- The key for the batch function should be `readonly` (or you will have compilation errors with typescript).
- The result's order match should match the key order (or the dataloader won't return the right information).
- The number of results should match the number of keys (or it will crash).

Now instead of calling the database directly in your resolver, you can simply do:

```ts
export async function __resolveReference(
  parent: ActorReference, args: any, { loader }: AppContext
): Promise<Actor | undefined> {
  return loader.load(parent.id);
}
```

In this case, we're using the loader from the [context][11] of your Application to load the actor.

For more use case on how to use the [dataloader][1] checkout the repository, there are a lot of explanation, examples
and a video made by the creator himself that explains the inner mechanism of it.

[1]: https://github.com/graphql/dataloader
[10]: {% post_url 2021/2021-07-26-Apollo-and-graphql %}
[11]: {% post_url 2021/2021-11-06-Advance-apollo-graphql-queries %}
[12]: {% post_url 2021/2021-12-06-Apollo-graphql-mutations %}
[13]: https://xuorig.medium.com/the-graphql-dataloader-pattern-visualized-3064a00f319f
[14]: https://medium.com/the-marcy-lab-school/how-to-use-dataloader-js-9727c527efd0
[15]: {% post_url 2022/2022-05-27-Graphql-advanced-resolver %}
[16]: {% post_url 2022/2022-10-11-Graphql-and-federation %}
