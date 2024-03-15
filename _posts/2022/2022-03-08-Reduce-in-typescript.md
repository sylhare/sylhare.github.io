---
layout: post
title: Use .reduce() in typescript
color: rgb(0, 117, 143)
tags: [js]
---

As per the [mozilla reference][1], [reduce][2] or `Array.prototype.reduce()` is a method that 
executes a "_reducer_" callback function on each element of the array passing the result 
of the reducer on the next element for calculation until it went through all the elements.

The typescript version is about the same as the javascript one, but with types ...
Find the code in [sylhare/Typescript][3] and now let's go with some examples. 

## 1. The Data

For our examples, let's create the `SeaCreature` type to get started. More types will surely be needed, but for now
that's what we are working with:

```ts
export type SeaCreature = { emoji: string, deadly: boolean, type: string };
```

We are defining a type, but it would work with an Interface or a class too.

And here is an array with some objects that will be useful for most of the examples, as you may already know `.reduce()`
is short for `Array.prototype.reduce()` which as the name states best used with arrays.

```ts
export const sea: SeaCreature[] = [
  { emoji: '🦐', deadly: true, type: 'crustacean' },
  { emoji: '🐡', deadly: false, type: 'fish' },
  { emoji: '🐠', deadly: false, type: 'fish' },
  { emoji: '🦈', deadly: false, type: 'shark' },
  { emoji: '🦀', deadly: false, type: 'crustacean' },
];
```

Our data is set up and as you all know, the deadliest creature `deadliestCreature` is the shrimp 🦐 !
Now that you have that set up, you can start playing with `.reduce()`.

## 2. Reduce Introduction 

### 2.1. The `.reduce` Structure

The reduce function can be written such as:

```ts
array.reduce((result, current) => { /* ... */ }, initialValue)
```

I have added the data to give some context, hopefully it will help you understand when and how you can use it.
If you feel unfamiliar with the notation, this article about [javascript ES6 notation][9] may 
help you. 👍

The expected value can be set from the `initialValue` type or added next to the `result` parameter using `:` followed by
the expected typescript type.

### 2.2. With initial value

Let's set `deadliestCreature` as the initial value:

```ts
const deadliestCreature = '🦐';
sea.reduce((result, _) => result, deadliestCreature)
// returns the deadliestCreature -> '🦐'
```

In this example, if you only return the result, there's no computation the `current` value is not used hence the `_` name.
(not to be confused with [lodash][4] or [underscore][5] libraries).
In the end nothing happens and the result is the initial value: `deadliestCreature`.

If you don't set the initial value, the result of the reduction will be the **first** element of the array.

### 2.3. Inferring types 

In typescript, the type of the `reduce` produced result is [inferred][10] from the initial value, 
if not set it will be taken from the first element of the reduced array.
To avoid unnecessary casting for the initial value working with objects you can use `<>` in front of the `reduce` function
to infer the type of the initial value. 
Which by extension is the returned type of the computation:

```ts
type Creature = { name: string };
const creatures: Creature[] = sea
  .reduce<Creature[]>(
    (result, current) => [...result, { name: current.emoji }],
    []);
```

Without the inferred type `<Creature[]>`, it wouldn't compile, as `name` does not exist on `SeaCreature`.
By specifying the type, the compiler knows that the result is an array of `Creature` and not `SeaCreature`.
The other option is to cast the array or create a typed initial value as `Creature[]`.

### 2.4. Sum of elements in an array

One of the most practical uses when reducing to a value is to do the sum of elements
in one array such as:

```ts
const array = [1, 1, 1, 1];
array.reduce((a, b) => a + b); // 4
```

Putting a default value `0` will make it go through another iteration.
In here, `a` represents the sum and `b` the current element of the array.

## 3. Using `.reduce` with an array of objects

### 3.1. Reduce an array to a value

Another usage is when you want to reduce an array to one value.
For example, if your program wants to know if it's safe to swim, 
it will want to know if there are any deadly animals in the sea (the name of our dataset):

```ts
const isDangerous = sea.reduce((a, b) => a || b.deadly, false);
// returns true because there is a deadly animal (🦐) in the "sea" 
```

The `b` is the current creature and the `a` is the result, `a` can be viewed as:

```ts
const isDangerous = sea[0].isDeadly || sea[1].isDeadly || ... || sea[sea.length - 1].isDeadly 
```

If there is nothing in the sea, it will return false, but as soon as one element is deadly `b.deadly`,
then it will return true.

### 3.2. Reduce an array to an object

When you have an object like this:
- `[{ a: 'a1', b: 'b1' }, { a: 'a2', b: 'b2' }]` 
and you want to transform it into:
- `{ a: ['a1', 'a2'], b: ['b1', 'b2'] }`.

You can apply `.reduce` to an array of an object to transform it into another object of arrays.
Here is how to do it in typescript.

First, let's define the type we expect at the end:

```ts
export type SortedCreatures = { deadly: SeaCreature[], safe: SeaCreature[] };
```

Something that can't be done with a [map][6] function. Let's use our sea data and convert that list of
`SeaCreatures` into an object containing an array of the safe ones and an array of the deadly ones.

```ts
const reducedCreatures: SortedCreatures = sea
  .reduce((result: SortedCreatures, creature: SeaCreature) => {
      return creature.deadly ?
        { ...result, deadly: [...result.deadly, creature] }
        : { ...result, safe: [...result.safe, creature] }
    },
    { deadly: [], safe: [] }
  );
```

In this case we transform an array based on the attribute of its values (that are `SeaCreature` objects).
In the end, we have an object with all creatures filtered in deadly and safe arrays.

When the _reducer_ method gets too complicated, you can extract it, for that,
declare the type of the result and create the reducer function such as:

```ts
const sortReducer = (result: SortedCreatures, creature: SeaCreature) => creature.deadly ?
  { ...result, deadly: [...result.deadly, creature] } 
  : { ...result, safe: [...result.safe, creature] };
```

Now it will be much simpler to read:

```ts
sea.reduce(sortReducer, { deadly: [], safe: [] });
```

This trick can be useful is you need to process your data in multiple chained commands,
making the reduce operation easier to read.
This way you can test your _reducer function_ and make sure it behaves how you wish it to.

## 4. Group an array of objects to an object

### 4.1 Group an array to an object 

For this one we are going to use the `type` of our previous object.
We want to have an object with the types as keys such as:

```ts
const groupedCreatures: { [key: string]: SeaCreature[] } = {
  crustacean: [
    { deadly: true, emoji: '🦐', type: 'crustacean' },
    { deadly: false, emoji: '🦀', type: 'crustacean' },
  ],
  fish: [
    { deadly: false, emoji: '🐡', type: 'fish' },
    { deadly: false, emoji: '🐠', type: 'fish' },
  ],
  shark: [
    { deadly: false, emoji: '🦈', type: 'shark' },
  ],
  // ...other groups?
}
```

The above is the expected from what we can see in the `sea`, however, there might be some more animals down there we
don't know about. The `type` we are grouping on is a string and can be anything.

For that we're just going to change the initial value of our reducer to an object `{}`
and use the [computed property names][7] notation `[keyName]:value` to create our object.

```ts
const groupedCreatures = sea
  .reduce<{ [key: string]: SeaCreature[] }>((result, creature) => ({
    ...result,
    [creature.type]: [...(result[creature.type] || []), creature]
  }), {});
```

We're using the destructuring notation (`...`) to get all previous creatures of the same type
if any (thus the `|| []`) and adding the current one.
With that you'll have `groupedCreatures.fish` that will return a list of all the fish.

Since we don't know what value the type of the `SeaCreature` can be, only that it's a string.
So we're using `[key: string]` and not a more specific type.
I inferred the type via the reducer `<>`, 
so it knows that the default value `{}` is of type `{ [key: string]: SeaCreature[] }`.

### 4.2. Group an array to a typed object

In the case, we know what we expect, even if the object has unexpected types, they can be filtered out in the reducer.
But for simplicity sack, let's assume you know the keys of the object you are grouping. 
Let's create a sea ecosystem with only 3 possible types. 
We are going to use an enum for the type and create a new `MarineType` enum:

```ts
enum MarineType {
  CRUSTACEAN = 'crustacean',
  FISH = 'fish',
  SHARK = 'shark',
}

type MarineCreature = {
  type: MarineType,
  emoji: string,
  deadly: boolean,
};

type SeaEcosystem = {
  crustacean: MarineCreature[],
  fish: MarineCreature[],
  shark: MarineCreature[],
};
```

Now if you don't want `enum`, you could resort to use `keyof SeaEcosystem` for the type of the `MarineCreature`,
but an `enum` seems more readable in this particular case.

If you hate casting like `(sea as MarineCreature[])`, then you can always refactor the `sea` from the beginning,
so it uses the correct type as `seaTyped`.
Now let's group our typed sea into one known ecosystem:

```ts
const emptyGroup: SeaEcosystem = { crustacean: [], fish: [], shark: [] };

const ecosystem: SeaEcosystem = seaTyped
  .reduce((result: SeaEcosystem, creature: MarineCreature) => ({
    ...result,
    [creature.type]: [...(result[creature.type] || []), creature]
  }), emptyGroup);
```

We have an empty group as our base, since we want a default value for each key of the `SeaEcosystem` to facilitate
the work of the reducer function.
That way, there are no more unknowns since we defined it all from the start with our types.

You don't need to set the type for the reducer parameters as it will be [inferred][10] from the default value and the
targeted array's type.

### 4.3. Group an array to a Map

Find out more about the notation used in a previous article about [javascript ES6 notation][9].
If you don't care about the types (which is not the case for most people), you can group to a map object:

```ts
const mappedCreatures = sea
  .reduce((marineCreatures, creature) => {
    return typedCreatures.set(creature.type, [...typedCreatures.get(creature.type) || [], creature])
  }, new Map<string, SeaCreature[]>());
```

Where you will be able to get the fish by doing `mappedCreatures.get('fish')`.
You don't have to set the type of the map when adding it as the initial value, 
but by doing so you can set what's expected.
Whatever rocks your boat, choose the way you prefer. 

## 5. Group from an object's values

### 5.1 Prepare the types

You can also apply the reduce function to an object thanks to `Object.entries()`,
that we saw in the [last article][11], let say instead of a `sea` array like before we have a
sea object such as:

```ts
const seaObject = {
  shrimp: { deadly: true, emoji: '🦐', type: 'crustacean' },
  blowfish: { deadly: false, emoji: '🐡', type: 'fish' },
  // ...other objects
}
```

Let's assume two cases, one where we know what's in that `seaObject` and we can have types to support it and one we don't,
but we still need to deal with it.

Let's create some of the expected types, from the one defined before:

```ts
type MarineLife = MarineCreature & { name: string };

type MarineEcosystem = {
  crustacean: MarineLife[],
  fish: MarineLife[],
  shark: MarineLife[],
};
```

Now that should take care of the new types and the expected group.

### 5.2. Use .reduce on the object

If we wanted to group them by `type` we would need to get the object's entries first.
This would yield an array of a key, value array such as:

```ts
[key, value] = ['shrimp', { deadly: true, emoji: '🦐', type: 'crustacean' }]
Object.entries(seaObject) // => [[key1, value1], [key2, value2], ..., [keyN, valueN]]
```

With that in mind, we can adjust our reducer's input to take on the elements of the array
from the _seaObject_'s entries, which are key, value pairs. 
And group that into an object using the type as the new object's key:

```ts
const emptyGroup: MarineEcosystem = { crustacean: [], fish: [], shark: [] };

const marineEcosystem: MarineEcosystem = Object.entries(seaObject)
  .reduce((result, [key, value]) => ({
    ...result,
    [value.type]: [...(result[value.type] || []), ({ ...value, name: key })],
  }), emptyGroup);
```

Since we want to keep the key which is not part of the value, I am adding it using `name`.
Now we should have something similar to the previous `ecosystem` with the addition of the name 👌.

## 6. Conclusion

I have edited the examples with more explicit typing and type declaration, 
so it is easier to follow within the article when you don't have an IDE open to try it out. I do hope it's more 
approachable that way, let me know in the comment section!
If you still feel there are not enough types, check my article about [type inference][10];
my preference leans towards a more inferred approach.  

Reduce is not that easy at first, but once you get the fundamentals, it can become a really
powerful tool to achieve your goals. 😎
It's a first step toward [functional programming][8]!
Don't hesitate to leave a comment if you have other nice reduce example, one-liner or any typescript
syntax tricks that could be used!

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
[3]: https://github.com/sylhare/Typescript
[4]: https://lodash.com/
[5]: https://underscorejs.org/
[6]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
[7]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#computed_property_names
[8]: https://en.wikipedia.org/wiki/Functional_programming
[9]: {% post_url 2021/2021-02-21-Modern-era-js %}
[10]: {% post_url 2023/2023-03-17-Type-inference %}
[11]: {% post_url 2022/2022-02-24-Javascript-objects %}
