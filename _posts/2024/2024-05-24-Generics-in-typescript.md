---
layout: post
title: Learn Typescript generics kung fu
color: rgb(26, 81, 115)
tags: [js]
---

[Generics][1] exist in typescript, and they behave similarly to other typed languages like [Java][10], [Kotlin][11] or C#.
And they can become useful as generics do when creating function dealing with multiple types.

But that's not just it! However, the syntax can be off-putting for some uninitiated, so we'll look over some of the
generics' usage in typescript to warm up.

Then I have prepared some examples to illustrate how powerful they become, for refactoring, reducing duplication but 
also simplifying some object related computation.

## 🧰 Basics Syntax

### 1. Function

You can use the type as a variable with generics.
Let's have a function that takes a generic type `T` and returns the same type:

```typescript
export function returnAnything<T>(arg: T): T {
  return arg;
}
```

The `T` gets inferred from the argument passed to the function, so you don't need to explicitly specify the type.
The return type doesn't need to be generic and the same as the argument type.

```typescript
returnAnything([1, 2, 3]) // returns [1, 2, 3]
returnAnything<string>('hello') // Also valid, returns 'hello'
```

The `<T>` between the name and the parentheses is the key to make a function generic.

### 2. Interface

The same way you can have a generic interface, which to be implemented needs a type specified.
Let's have an example:

```typescript
export interface Walking<T> {
  walk: (arg: T) => T;
}
```

When implementing the interface, you need to add in your class a `walk` method that takes the type `T` passed to the 
interface as an argument and return the same type.
In other words, you could have that `walk` use the parametrised type in either the return or argument.

If the generic `T` of the interface is not used by any member, then it can be removed to simplify the code.

### 3. Class

Since classes can also be generic, you can have a class that takes a generic type `T` and uses it in its members.
Let's have an example:

```typescript
export class Biped<T> implements Walking<T> {
  walk(arg: T): T {
    return arg;
  }
}
```

The `Biped` class implements the `Walking` interface, so it needs to have a `walk` method that takes a type `T`.
We could use the `returnAnything` in the `walk` method is would work since it can take any type.

Now this doesn't come very close to any usable example, so let's have a class that fixes the generic.

```typescript
export class Human extends Biped<string> {
  private name: string = 'Human';
  talk(): string {
    return 'Hello';
  }
}
```

With this class, we have a `Human` that extends the `Biped` class with the type `string`. 
So the `walk` method will only take and return strings. Try with anything else and it won't compile.

```ts
human.walk('10 meters') // returns '10 meters'
```

Now we should have another class extending `Biped<T>` with different types. 
In a real life project, it would most likely be custom-made objects. 

The point of using generics is when you have a core logic that can be applied to multiple entities with common interfaces.

### 4. With constraints

Generics can be too generic, and you might want to restrict the type to a subset of types.
You can do this by constraining the type with the `extends` keyword.
Let's have a couple of examples:

```typescript
export function testLap<R, T extends Walking<R>>(walker: T, distance: R): R {
  return walker.walk(distance);
}

export function testLapWithNumber<T extends Walking>(walker: T, distance: number): number {
  return walker.walk(distance);
}
```

Let's see what we have here:
- With **testLap**: has two generics, one for the _walker_ which needs to implement `Walking<R>` and `R` the distance's type that can be walked.
  - Our _Human_ could use `walkLap<string, Human>(human, '10m')` we need the `<string, Human>` otherwise it infers it to `<'10m', Human>`.
- With **testLapWithNumber**: has only one generic, the `walker` that needs to implement `Walking` and the distance is a number.
  - Our _Human_ could not use this method, because it can only walk _strings_ 😅

A class that doesn't implement the `Walking` interface would not be able to use any of the _testLap_ method.

## 📒 Type Keywords

### 1. Using the `keyof` keyword

The `keyof` keyword is used to get the keys of an object as a union type.
This is beneficial when dealing with objects in typescript, but we will see more about that in the advanced usage section.

As an example, even if it's not very useful:

```typescript
const keys = Object.keys(new Human()) as unknown as keyof Human;
// returns ['name']
```

The `unknown` is necessary for the casting because `keys` returns an array of string `string[]`, so we use this hack for
an easier cast.
This will not be needed once we use it to loop through the object.

### 2. Using the `typeof` keyword

The `typeof` keyword is used to get the type of a variable or expression.

> But it is limited, and the return values are only:
> - _"string", "number", "bigint", "boolean", "symbol", "undefined", "object", "function"_

Which is why you may want to use `instanceof` when dealing with class.

```ts
typeof [1, 2, 3] === "object" // true
typeof "hello" === "string"   // true
```

There's no default array or list type, so it returns _object_ in that example.

### 3. Using the `instanceof` keyword

The `instanceof` keyword is used to check if an object is an instance of a class.
Let's have an example:

```ts
const human = new Human();
human instanceof Human; // true
```

Here we check if the `human` object is an instance of the `Human` class, which here is true.
The `instanceof` keyword doesn't work with interfaces or none class type. It checks only the implemented _class_.

### 4. Using the `is` keyword

The `is` keyword is used to define a type guard in TypeScript.

```ts
function isHuman(biped: any): biped is Human {
  return (biped as Human).talk !== undefined;
}
```

Now we could have that we have the `isHuman` function that checks and assert the type of the object.
We can use that in a function in a strategy pattern where depending on the type of the object, we call different methods.

```ts
export function act(biped: Human | Other): string {
  if (isHuman(biped)) {
    return biped.talk();
  } else {
    return biped.yell();
  }
}
```

Here the `act` function will call the `talk` method if the object is a `Human`,
and `yell` if it's an object of type `Other` (which should have a `yell` method).
Without the type guard, the compiler would complain.

## ⚙️ Advanced Usage

Let's define a simple object for the examples:

```ts
export const fruitBasket = {
  apple: '🍎',
  banana: '🍌',
  kiwi: '🥝',
};
```

### 1. Iterate over an object

You might be interested to apply the same modification for multiple values of the object, 
however you can't just `map` over an object. Here are some alternatives.

#### a. Using `for...of Object.entries`

To iterate over an object to retrieve the list of values, you can use the `Object.entries` method.
To avoid compilation issues, we are using `keyof` to set the type of the value as `T[keyof T]`.
Which can be read as the value from the key of the object of type `T`.

```ts
export function valuesFrom<T extends object>(obj: T): T[keyof T][] {
  const values: T[keyof T][] = [];
  for (const [, value] of Object.entries(obj)) {
    values.push(value);
  }
  return values;
}
```

We limit `T` to be an object, as this would not work with a primitive type like `string` or `number`.
If I apply this function to the `fruitBasket` object, it will return `['🍎', '🍌', '🥝']`.

Now you don't need to save the values, you could directly apply the modification to the object and return it,
depending on the use case.

#### b. Using `for...in`

You can also loop directly over the object's keys directly with `for...in`.
The tick to make it happen is to set the key's type as `keyof typeof obj`, with `obj` being the object which is 
iterated over.

The `keyof typeof obj` returns a type that represents all possible keys of `obj`.

```ts
export function valuesOf<T extends object>(obj: T): (T[keyof T])[] {
  const values: (T[keyof T])[] = [];
  let key: keyof typeof obj;
  for (key in obj) {
    values.push(obj[key]);
  }
  return values;
}
```

This also returns all the values of an object, we could filter on the keys to loop only on a subset of the object.
It gives a bit more flexibility than the other method.
If I apply this function to the `fruitBasket` object, it will also return `['🍎', '🍌', '🥝']`.


### 2. Interact with objects

#### a. Get a property

If you need to get the same property from multiple objects, and you don't have an interface or some kind of pattern in 
place. Here we can return the object's key value:

```typescript
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}
```

We restrict the type of the key `K` to be a key of the object `T` so it compiles the type correctly.
Since `K` is a key of `T`, the value that is returned can be simply typed as `T[K]`.

If you create a `human`, you can retrieve the value of the `name` key using:

```ts
getValue(new Human(), 'name')              // assuming `name` is a public property
getValue(new Human(), 'name' keyof Human)  // when is a `private` property
```

Not that you would want to use it, it is interesting to see how you can interact with objects and their properties.

#### b. Enhance an object

If you need to add properties to an object, you can use the `Object.assign` method.
To keep the types in check, we will create a `WithProperty` which is a key `K` of type string and any value `V` that 
will be added to the object:

```ts
type WithProperty<K extends string, V> = {
  [key in K]: V;
};
```

Now as we've seen before we define the `withProperty` method that will take an object and return it with an extra 
property to it.

```ts
function withProperty<O extends object, K extends string, V>(
  obj: O, property: WithProperty<K, V>,
): O & WithProperty<K, V> {
  return Object.assign(obj, property);
}
```

The object of generic type `O` will be returned with the property `property` added to it.
With an example, we could define:

```ts
const yolo: Human & { yolo: string } = withProperty(human, { yolo: '🦄' });
```

We don't need to use the `WithProperty` when typing, because the `{ yolo: string }` matches the inferred type.
This can be useful to transform similar objects with common properties.

### 3. Dynamic type (with prefix)

I encountered this use case when working with SQL queries, on join you can prefix the table's name to avoid conflicts.
To type the output properly in typescript, you can create a dynamic type that prefixes the keys of an object.

If we have a `Person` interface that's used for an entity in our database:

```ts
interface Person {
  id: number;
  name: string;
  age: string;
}
```

With a join, we might get a prefixed object like this `{ Person_id: 1, Person_name: 'John', Person_age: 30 }`, but it
would be tedious to create a `JoinedPerson` type, instead you can create a the type dynamically:

```ts
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P & string}${string & K}`]: T[K];
}
```

The `Prefixed` type takes two generics, `T` the object type and `P` the prefix string value.

Then it defines the keys of the object of type `T` to be cast to the prefix and the key name.
With `P` defined as _Person__, you can read it as:

```ts
// Same as `PrefixedWith<Person, 'Person_'>`
type Prefixed<T> = {
  [K in keyof T as `Person_${string & K}`]: T[K];
}
```

Which translates in an example as:

```ts
const prefixedJohn: PrefixedWith<Person, 'Person_'> = { Person_id: 1, Person_name: 'John', Person_age: 30 };
```

And it works! 🤯 
It might have a niche usage, but I thought it was a nice trick to add in this article.

If you are interested in more javascript object manipulation, check the tricks in my article
about [javascript objects][12]!


[1]: https://www.typescriptlang.org/docs/handbook/2/generics.html
[2]: https://effectivetypescript.com/2020/05/26/iterate-objects/
[3]: https://fettblog.eu/typescript-iterating-over-objects/
[10]: {% post_url 2021/2021-06-04-Java-functional-interface %}
[11]: {% post_url 2021/2021-11-17-Reflection-of-kotlin %}
[12]: {% post_url 2022/2022-02-24-Javascript-objects %}