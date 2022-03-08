---
layout: post
title: Use reduce() in typescript
color: rgb(0, 117, 143)
tags: [js]
---

As per the [mozilla reference][1], [reduce][2] or `Array.prototype.reduce()` is a method that 
execute a "_reducer_" callback function on each element of the array passing the result 
of the reducer on the next element for calculation until it went through all the elements.

The typescript version is about the same as the javascript one, but with types ...
Find the code in [sylhare/Typescript][3] and now let's go with some examples. 

## Data

For our examples let's create a small array with some objects:

```ts
export const sea: SeaCreature[] = [
  { emoji: '🦐', deadly: true, type: 'crustacean' }
  { emoji: '🐡', deadly: false, type: 'fish' },
  { emoji: '🐠', deadly: false, type: 'fish' },
  { emoji: '🦈', deadly: false, type: 'shark' },
  { emoji: '🦀', deadly: false, type: 'crustacean' },
];
```

As you all know, the deadliest creature `deadliestCreature` is the 🦐 !
Now that you have that set up, you can start playing with reduce.

## Reduce examples

The reduce function can be written such as:

```ts
array.reduce((result, current) => { ... }, initialValue)
```

I have added the data to give some context, hopefully it will help you understand when,
and how you can use it.
If you feel unfamiliar with the notation, this article about [javascript ES6 notation][9] may 
help you. 👍

### With initial value

Let's set `deadliestCreature` as the initial value:

```ts
sea.reduce((result, _) => result, deadliestCreature)
// returns deadliestCreature
```

If you only return the result, there's no computation the `current` value is not used hence the `_` name.
(not to be confused with [lodash][4] or [underscore][5] libraries).
In the end nothing happens and the result is the initial value: `deadliestCreature`.

If you don't set the initial value, result will be the first element of the array.

### Reduce array to a value

Another usage, is when you want to reduce an array to one value.
For example, if your program wants to know if it's safe to swim, it will want to know
if there are any deadly animal in the sea:

```ts
const isDangerous = sea.reduce((a, b) => a || b.deadly, false);
// returns true because the deadly 🦐 is in the "sea" 
```

The `b` is the current creature and the `a` can be viewed as:

```ts
const isDangerous = sea[0].isDeadly || sea[1].isDeadly || ... || sea[sea.length - 1].isDeadly 
```

If there is nothing in the see, it will return false, but as soon as one element is deadly `b.deadly`,
then it will return true.

#### Sum of elements in an array

One of the most practical use when reducing to a value is to do the sum of elements
in one array such as:

```ts
const array = [1, 1, 1, 1];
array.reduce((a, b) => a + b); // 4
```

Putting a default value `0` will make it go through another iteration.
In here, `a` represents the sum and `b` the current element of the array.

### Reduce array to an object

The same way you can reduce an array to a value, you can do it to an object as well.
Something that can't be done with a [map][6] function

```ts
const reducedCreatures = sea.reduce((result, creature) => {
  return creature.deadly ?
    { ...result, deadly: [...result.deadly, creature] } :
    { ...result, safe: [...result.safe, creature] }
}, { deadly: [] as SeaCreature[], safe: [] as SeaCreature[] });
```

In this case we transform an array based on the attribute of its values (that are `SeaCreature` objects).
In the end we have an object with all creatures filtered in deadly and safe arrays.

When the _reducer_ method gets too complicated, you can extract it, for that,
declare the type of the result and create the reducer function such as:

```ts
type DeadlySafe = { deadly: SeaCreature[], safe: SeaCreature[] };
const creatureReducer = (result: DeadlySafe, creature: SeaCreature) => creature.deadly ?
  { ...result, deadly: [...result.deadly, creature] } :
  { ...result, safe: [...result.safe, creature] };
```

Now it will be much simpler to read:

```ts
sea.reduce(creatureReducer, { deadly: [], safe: [] });
```

This trick can be useful is you need to process your data in multiple chained commands,
making the reduce operation easier to read.
This way you can test your reducer function and make sure it behaves how you wish it to.

### Group an array of objects by key

For this one we are going to use the `type` of our previous object.
We want to have an object with the types as key such as:

```ts
const groupedCreatures = {
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
}
```

For that we're just going to change the initial value of our reducer to an object `{}`
and use the [computed property names][7] notation `[keyName]:value` to create our object.
We're using the destructuring notation (`...`) to get all previous creature of the same type
if any (thus the `|| []`) and adding the current one.

```ts
const groupedCreatures = sea.reduce((result: any, creature) => ({
  ...result,
  [creature.type]: [...(result[creature.type] || []), creature]
}), {});
```

With that you'll have `groupedCreatures.fish` that will return a list of all the fish.
Find out more about the notation used in a previous article about [javascript ES6 notation][9].
Or you can achieve the same result with a map instead:

```ts
const groupedCreatures = sea.reduce((typedCreatures, creature) =>
    typedCreatures.set(creature.type, [...typedCreatures.get(creature.type) || [], creature]),
  new Map());
```

Where you will be able to get the fish by doing `groupedCreatures.get('fish')`. 
Whatever rocks your boat, choose the way you prefer. 

### Group an object

You can also apply the reduce function to an object thanks to `Object.entries()`,
that we saw in the [last article][8], let say instead of a `sea` array like before we have a
sea object such as:

```ts
const seaObject = {
  shrimp: { deadly: true, emoji: '🦐', type: 'crustacean' },
  blowfish: { deadly: false, emoji: '🐡', type: 'fish' },
  // ...other objects
}
```

If we wanted to group them by `type` we would need to get the object's entries first.
This would yield an array of key, value array such as:

```ts
[key, value] = ['shrimp', { deadly: true, emoji: '🦐', type: 'crustacean' }]
Object.entries(seaObject) // => [[key1, value1], [key2, value2], ..., [keyN, valueN]]
```

With that in mind, we can adjust our reducer's input to take on the elements of the array
from the _seaObject_'s entries which are key, value pairs. 
And group that in an object using the type as the new object's key:

```ts
const grouped = Object.entries(seaObject).reduce((result: any, [key, value]) => ({
  ...result,
  [value.type]: [...(result[value.type] || []), ({ ...value, name: key })]
}), {});
```

Since we want to keep the key which is not part of the value, I am adding it using `name`.
Now we should have something similar to the previous `groupedCreatures` with the addition
of the name 👌

Reduce is not that easy at first, but once you get the fundamentals, it can become a really
powerful tools to achieve your goals. 😎

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
[3]: https://github.com/sylhare/Typescript
[4]: https://lodash.com/
[5]: https://underscorejs.org/
[6]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
[7]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#computed_property_names
[8]: {% post_url 2022/2022-02-24-Javascript-objects %}
[9]: {% post_url 2021/2021-02-21-Modern-era-js %}
