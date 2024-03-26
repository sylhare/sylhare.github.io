---
layout: post 
title: How to use GraphQL mutation in bulk 
color: rgb(220, 121, 62)
tags: [graphql]
---

In this article we will talk about bulk mutation, the desire to update multiple entities with a single input. 
Some common use case would be if we had queries or mutations that take one entity at a time, and we want to:
- Query multiple entities at once
- Create/Update/Delete multiple entities at the same time
- Enable/Disable multiple entities at once

Or whichever use-case you might have had in mind when landing here from the internet. 🌈

But first if you are not familiar with mutations, you can get a refresher with [Apollo GraphQL 👩‍🚀 mutations][10].
If you're all set, let's review how you can make a bulk mutation, then check the schema recommendation available.

### Multiple mutations in one request

We can use the already existing mutation, in this example to update an entity.
GraphQL provides the ability to send multiple mutations at once. If you need to use multiple time the same
mutation, you can use [aliases][1] (to avoid any duplicate name in the mutation).

```graphql
mutation(
    $inputOne: UpdateEntityInput!,
    $inputTwo: UpdateEntityInput!,
    $inputThree: UpdateEntityInput!,
    $inputFour: UpdateEntityInput!
) {
    updateOne: updateEntity(input: $inputOne) {
        user { id }
    }
    updateTwo: updateEntity(input: $inputTwo) {
        user { id }
    }
    updateThree: updateEntity(input: $inputThree) {
        user { id }
    }
    updateFour: updateEntity(input: $inputFour) {
        user { id }
    }
}
```

The alias is prepended to the mutation name like `updateOne`. For the input as variable, you can have them one after the other
in a big json file:

```json
{
  "inputOne": { ... },
  "inputTwo": { ... },
  "inputThree": { ... },
  "inputFour": { ... }
}
```

The downside of this method is that you might hit a gateway cap or the http timeout if you stack too many of them.
If on the back-end there's a database call, it might not be the most efficient way to interact with it.
In the end, it will depend on your system's ability to handle "_x many_" synchronous mutation at a time.

### One mutation on multiple entities

Assuming that you can't optimize your back-end in a way which makes it faster to deal with them with multiple single 
mutations.
If you have a fair amount of entities that you need to modify, 
then having a synchronous "_bulk_" mutation could do the trick.

That is useful when all the entities you are touching are indexed via a common parent id, 
or in a way where fetching as a group is actually faster than fetching them individually.

```graphql
mutation {
    enableEntities(input: EnableEntitiesInput!): EnableEntitiesPayload!
}

type EnableEntitiesInput {
    entityIds: [ID!]!
    parentId: ID!
}
```

This way you can pass a list of entities from the same parentId and update them. 
In this case we'll want to "_enable_" them, but that's just for the example.
You can then have the payload incorporating errors that should be individually linked to the entity it's coming from.

```graphql
type EnableEntitiesPayload {
    enabledEntityIds: [ID!]!
    userErrors: [EnableEntitiesError!]!
}

union EnableEntitiesError = MaxAmountOfEntityReached | InvalidEntityError | EnableEntityError
```

As describe in our previous mutation [article][10] we would have the errors as a union with that are implementing the same
`UserError` interface.

> Pagination on a mutation does not make sense; it should only be on queries where you can call the query again to get
> the next page.

You could send back a `MaxAmountOfEntityReached` to limit the number of ids, i.e. entities your bulk mutation can handle
in a single synchronous mutation. 
If you don't want to hit a gateway timeout, you need to set boundaries for your API.

### Bulk asynchronous mutation

The final example would be to use asynchronous mutations. It can either be handled by the service, or via a proxy 
system that will run the synchronous mutations in a way that don't break your system.
The second one is referred to as _bulk_ mutation.

#### Architecture

This one is based on the [shopify][2] approach where you will build your mutation based on a file with all of your input,
similar to what you need to do when sending multiple single mutations in one call.
Then it will create the bulk mutation from those data. It's not just the mutation variables, it's the type of mutation as
well which can use previous mutation output (like a flow, ex: createGroup, createUser, addUserToGroup, addPermission, etc).

<div class="mermaid">
sequenceDiagram
  autonumber
  participant U as User
  participant P as Bulk Mutation <br> Proxy System
  participant B as Back-end
  U -->> P: Load data
  U ->> P: Send Bulk Mutation 
  Note over P: Will use data loaded <br> to run the mutations
  Loop For all inputs in the loaded data
    P ->> B: createUser
    P ->> B: addUserToGroup
    Note over P: Based on previous mutation <br> to get the created User's ID
  end
  U ->> P: Query Bulk Process
  P ->> U: Give process status
</div>

The _load data_ and _send bulk mutation_, could be done in one step here. But you might have another component of the system
for that which the proxy would call. The bulk mutation would use the saved data id to retrieve it.
The proxy system will run the mutation for you on the back-end in the background.

The [shopify][2] version has more steps to load your data and is a bit less flexible,
but it provides a subscription that you can subscribe to in order to know when the bulk operation is done.

#### Schema of an asynchronous mutation

Your asynchronous mutation can be simpler as long as it returns a process id. 
With it, your system can do the processing while giving the opportunity for the user to check the status.

In the case where you don't need so much data for your mutation, you can have an asynchronous mutation that 
will handle the modification of your entities from a simpler input:

```graphql
type mutation {
    triggerEntityBulkCreation(input: TriggerEntityBulkCreationInput!): TriggerEntityBulkCreationPayload!
}

type query {
    entityBulkCreationProcess(entityBulkCreationProcessId: ID!): EntityBulkCreationProcess
}
```

This use case would be for creating/modifying multiple resources similarly or following a set logic so that the
input doesn't grow too big. 
In this case, the creation could be done via a set of rules instead of input variables.
The `TriggerEntityBulkCreationPayload` would follow the same principle as before and return an _entityBulkCreationProcessId_
which would then be used in the query to fetch the process.

```graphql
scalar Timestamp

type EntityBulkCreationProcess {
    id: ID!
    createdAt: Timestamp!
    completedAt: Timestamp
    processErrors: [EntityBulkCreationProcessError!]
    status: String!
}
```

The process would yield a timestamp for the creation and completion date, with a status to make it more visible if it is
_completed_, _completedWithErrors_, _started_, _pending_, _errored_, and so on.
The `status` is a marked as a `String` because you may want to keep the flexibility that an enum does not provide to add
new statuses as your asynchronous process flow evolves.

The `processErrors` would be similar to the `UserError` that we've seen [before][10] and could be related to the process 
itself of the entity or some problem with the input.

You may also have a paginated query to return all the entities you have created, but that's outside the scope of our bulk
mutation 🤷‍♀ So let's save it for another article!️

[1]: https://graphql.org/learn/queries/#aliases
[2]: https://shopify.dev/api/usage/bulk-operations/imports
[10]: {% post_url 2021/2021-12-06-Apollo-graphql-mutations %}
