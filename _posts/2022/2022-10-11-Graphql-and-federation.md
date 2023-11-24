---
layout: post
title: GraphQL and federation 🏙
color: rgb(63,32,186)
tags: [graphql]
---

With [Apollo Server], you can create an Apollo Federation for your GraphQL APIs.
The pre-requisite for [federation] would be to have at least two different GraphQL APIs that you want to advertise under
the same url. Or if you want to break down a big GraphQL schema into multiple small microservices.

This feature from Apollo GraphQL federation v1 is for scaling up your APIs, let's review how it works.

## Call-flow

Here is a brief flow chart where we have 3 APIs each having part of the graph defined and exposed.

<div class="mermaid">
graph TB
    subgraph GraphQL APIs
      B[Book API]
      U[User API]
      V[Vehicle API]
      AG[Apollo Gateway]
      B .->|Book subgraph| AG
      U .->|User subgraph| AG
      V .->|Vehicle subgraph| AG
    end  
    AG -->|Complete graph| Client
</div>

Using the Apollo Gateway (or Graph Router) we can use only one URL. The client does not need additional set up to
connect to each microservice, talking to the Gateway is enough to have access to the complete graph.

Find in the documentation [how to get started], you can try it one API at a time.

## Separation of Concerns

### Example

This is one of the most important aspect of the federation. It allows you to use types from different subgraph within
one API without having to redefine the whole domain.
Let's say we have:

```graphql
type User {
    id: ID!
    name: String!
    vehicles: [Vehicle]
}

type Vehicle {
    id: ID!
    registration: String
    driver: User
}
```

That mean the User API must know about `Vehicle` of the Vehicle API, and Vehicle API must know about `User` from the
User API. Quite a conundrum 🧐
Instead of redefining `User` and `Vehicle` you can just define the fields that belong to the API, for example in the 
User API:

```graphql
# User API
type User @key(fields: "id") {
    id: ID!
    vehicles: [Vehicle]
}

# To define the "driver" field on Vehicle
type Vehicle @extends {
    id: ID! @external
    driver: User
}
```

We define only the fields in Vehicle that belong to the User domain, and for the Vehicle API we will have:

```graphql
# Vehicle API
type Vehicle @key(fields: "id") {
    id: ID!
    registration: String
}

# To define the "vehicles" field on User
extend type User {
    id: ID! @external
    vehicles: [Vehicle]
}
```

This way we can define and declare the `vehicles` field on `User` within the Vehicle API. The reconciled graph from the
graph router in the API Gateway will allow the client to access the right resolver from the right APIs to get the data.

### Subgraph Spec

#### Directive

You may have seen some directive like `@Key` in the previous examples, those are some special directive from the 
_@apollo/federation_ package.
They are part of the [subgraph specification] that are injected in the subgraph schema for federation purpose.

First let's look at the directives we used and how they are defined:

```graphql
scalar FieldSet
directive @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE
directive @external on FIELD_DEFINITION
directive @extends on OBJECT | INTERFACE
```

There are three of them:

- `@key`: which define the key of the object, so that the gateway knows which object to retrieve when queried.
    - For example for User, you need to have the `id` key in order to resolve the correct one
- `@external`: to mean that the field is not defined within this API.
    - For example for Vehicle API the field `User.id` is only defined in the User API, it's an external field
- `@extends`: So that the Gateway understand you are not re-defining the type but extending it.
  You can either use `@extend` or the preferred built-in `extend` key word.
    - For example, by adding `driver` on the type `Vehicle` on the User API is extending the type.

The `extend` is not necessarily federation specific, since you can use it within a non-federated API where you want to
break down your schema into multiple files (like one per query), that way you can extend the `Query` type in each file.

#### Entity Query

After defining the previous directive, you might think that there's still something obscure or magic with the key.
How does the federation know how to fetch the correct entity with the defined key?

That's when the entity query comes into play! This query is part of the [subgraph specification] and defined through
the _@apollo/federation_ package as well:

```graphql
# Defined in @apollo/federation
extend type Query {
    _entities(representations: [_Any!]): _Entity!
}
```

The `representations` is the type name and the fields from the key directive, which can be anything hence the internal
`_Any` type. The `_Entity` type is a union of all the types in the Gateway. This definition is pretty generic and allow
for multiple APIs implementation, so you can implement it for multiple types in multiple APIs.

You will need to implement it via it custom resolver for the gateway to properly work, let's create one in typescript
for the `Vehicle` type in the Vehicle API:

```ts
type VehicleReference = {
  id: string
}

export function __resolveReference(
  { id }: VehicleReference,
  { VehcileDb }: VehicleContext
): Vehicle | undefined {
  return vehiclesDb.find(vehicle => vehicle.id === id);
}
```

Defining the `__resolveReference` resolver under `Vehicle` will allow you to resolve the `Vehicle` type from its id.
This query is internal to the Gateway, but you can still test it. Assuming you have a test app working with your
API, you can make this GraphQL query:

```ts
it('resolves entity by federation', async () => {
  const vehicle: Vehicle = await client.query({
    query: gql`
      query {
        _entities(representations: [{
           __typename: "Vehicle"
           id: "3"
        }]) {
          ... on Vehicle { registration }
        }
      }
    `
  }).then(result => result.data._entities[0]);
  expect(vehicle).toMatchObject({ registration: 'train' });
});
```

And you should get back the expected vehicle.
Once defined, the `__resolveReference` will always be called by the gateway when trying to resolve the object.

## Conclusion

You should have a better understanding of the concept of federation within a GraphQL APIs ecosystem. It becomes
increasingly interesting to use federation with distributed teams working on their own microservices.
Using the Gateway you can effectively scale your company API as a whole.

You can create your own gateway implementing `@apollo/gateway` or use the pre-compiled [Apollo Router] in Rust
by the Apollo team.

And for advanced usage, you can add checks of your schema with [rover] to make sure they are valid and apply some
recommended [best practices] to deploy and mange your federated schema.

[federation]: https://www.apollographql.com/docs/federation/
[how to get started]: https://www.apollographql.com/docs/federation/quickstart/setup
[subgraph specification]: https://www.apollographql.com/docs/federation/subgraph-spec/
[Apollo Router]: https://www.apollographql.com/docs/router/
[rover]: https://www.apollographql.com/docs/federation/managed-federation/federated-schema-checks
[best practices]: https://www.apollographql.com/docs/federation/managed-federation/deployment
[Apollo Server]: {% post_url 2021/2021-07-26-Apollo-and-graphql %}
