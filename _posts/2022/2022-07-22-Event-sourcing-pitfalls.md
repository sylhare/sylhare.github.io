---
layout: post
title: Event sourcing pitfalls
color: rgb(64,8,8)
tags: [tips]
---

Having implemented and experience the benefits of event sourcing, I wanted to talk about the pitfalls that could make
your event journey a nightmare.
If you are not familiar with event sourcing or event driven architecture, I recommend reading this [article][10],
try the concept out and come back here to see if you fall into one of those pitfalls.

In this case, I am mainly talking about a microservice with its own domain events. But the madness can apply on a 
distributed event driven architecture through the use of message bus.

## Pitfalls

### 1. Hidden event logs 🕵️‍♀️

If you can't see what is happening with your events, then you lose one of the major benefit of your event sourcing
architecture: the auditing.

The events are what's constituting the basic blocks of your data, you should be able to easily access them for
troubleshooting purposes and alerting mechanism.

Once your production is stable and in product, you should expect a certain amount per event per hour, minutes, seconds
which makes a perfect indicator for your system health or degradation. If the `ItemPurchasedEvent` is no sent anymore,
it could mean that your user can't buy anymore on your platform, a major red flag if you want to make money! 💸

So make sure they are accessible with an identifiable trace id, so you can work the callflow of your application. With 
a thousand or more event per minute, you won't be possibly able to identify which `UserCreatedEvent` was part of the 
bug you are working on. 😅

### 2. Impure handlers

The concept of purity in a function in software, means that each time your execute the function, it should always yield
the same result for the same input. An impure one is then the opposite and changes all the time. 🎲
A pure function should be predictable and is key in our handler for our event driven architecture where you build your
entities based on the event you receive and handle.

For example, you could be saving an event to create a user:

```ts
eventStore.save(new UserCreatedEvent(user));
```

Then handling it, you'll copy over the new information to the empty user entity, and while at it, you might be
tempted to be adding an id (using a uuid) for internal usage, like for faster queries:

```ts
import { v4 } from 'uuid';

function userCreatedHandlerEventHandler(event: UserCreatedEvent, user: User) {
  user = event.user;
  user.id = uuid.v4(); // ❌ it will return a random uuid each time
}
```

But doing so, you're making the handler impure and each time you read the event, it will have a different id, which is 
less than ideal.

```ts
import { v4 } from 'uuid';
eventStore.save(new UserCreatedEvent(v4(), user)); // ✅ The id is generated once at the event creation
```

Things such as ids or random data must be set at the creation of the event, so that it stays the same the when handler.

If your handler aren't pure then each time you go through the events the result will be different causing potential chaos
in your application.

### 3. Spread logic

Now that you've noticed that some data can and should be set outside the handler to be passed through the event, that
does not mean you should overstretch it by spreading around all the logic for those events outside.

For example, you have a default language on your user, if they don't have any language associated to their profile, 
then the first added language should be the User's default.
You could do it via the event:

```ts
function processNewLanguage(userId: string, isDefault: Boolean, language: Language): void {
  const user = userDataSource.fetchBy(userId)
  // ❌ Subject to concurrency issue
  eventStore.save(new LanguageAddedEvent({ isDefault: !user.languages || isDefault, language }));
}
```

But in that case, if you add two language or more at the same time, then the retrieved user in both case will still
be without language, so only the latest one processed will be saved as the default one, which is not what we want.
Instead, we handle it via the handler:

```ts
// ✅ The handler will know if it's the only language or not
eventStore.save(new LanguageAddedEvent({ isDefault, language }));  
```

The events are handled chronically so when handling the event, the user that is matched with the event passed in the 
handler will be the up to date one. If there are multiple almost simultaneous events, they'll still be ordered up to the
ms or ns, which makes for a more accurate representation of the data.

Keeping the logic around the data within the handler will make your system less error-prone and faster.

### 4. Async call in handler

After the last two pitfalls, you know that the handler is a key place of your architecture, but also a possible weak
spot if you're not careful.

Since you'll build your entities using the events and handler, you will want this process to go fast. So whichever
interaction or computation rendering your handler slow is to avoid.

For example if you want to add a group to a user by calling an external service:
```ts
async function userCreatedHandlerEventHandler(event: UserCreatedEvent, user: User) {
  user = event.user;
  
  user.group = await groupService.addUserToGroup(user); // ❌ Slow http call, might error out
}
```

Apart from the fact that you might break your whole system if the groupService is down because you won't be able to 
build any entities, you may also make your handler as slow as the http call ⏱. An asynchronous handler does not really
match since the events need to be handled sequentially. You could have such behaviour if you are using some kind of
eventHooks which gets handled only once, but this can get tricky fast.

```ts
// ✅ The request can be taylored before creating the event
user.group = await groupService.addUserToGroup(user);
eventStore.save(new UserCreatedEvent(user));  
```

We're still calling the groupService via a http call, which is better than before but not optimal considering nowadays
possibilities.
Another option would be to leverage a "message bus" (like Kafka) to produce a `UserCreatedEvent` which can then be 
consumed by the groupService which in return will produce a `UserAddedToGroupEvent` consumed by our service which will
then save a `UserGroupAddedEvent` on the user. So we keep it all asynchronous, reliable and fast.

At this point, it's really up to you to decide how you want to tackle any sign of "slow-down" in your handler and 
overall implementation.

### 5. Enormous events

This one appear when you don't size your events correctly, it becomes a problem because each time you require the last
updated state of an entity, under the hood you are most likely fetching all the events related to the entity and 
rebuilding it.
Fortunately you have your entity cached so you don't need to go back from the end of time to build it back, however on 
the long run it's better to groom your events to the essential.

For example, you could want to save new permissions on your user, so you go and fetch the whole user entity to update
it:

```ts
// ❌ Will create an event with the full user
const user = userDataSource.fetchBy(userId);
eventStore.save(new UserUpdatedEvent(user, { permission: newPermissions }));

// ✅ Only keeps the necessary information in the event
eventStore.save(new UserPermissionUpdatedEvent(userId, newPermissions));
```

One tip is to use more fine grain events so you're less likely to shove them with unnecessary data.
Failing to appropriately size your events will slowly add a couple of milliseconds to fetch each event, which can 
quickly add up if you are generating hundreds of events per entities.

## And more!

The list is not exhaustive, I might add up to it as I get feedback or find the need to say more. There should be more
at a larger scale if you consider an event driven architecture on some distributed services. 
Using an event format that could not be de-serialized from one language to another due to some library limitations. 
Or the one about data being structured differently in each event making it a nightmare to consume or interpret 
because it could mean something different from one service to another.

Anyway, if you have some other pitfalls or a painful experience of broken production system, 
please share it in the comments, it's always nice to hear those and have a laugh about it. 

Who's never broken prod anyway? 🙃



[10]: {% post_url 2021/2021-10-25-Event-sourcing-101 %}
