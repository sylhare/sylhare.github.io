---
layout: post
title: Modern JavaScript and its quirks
color: rgb(253,201,17)
tags: [js]
---


[JavaScript](https://en.wikipedia.org/wiki/JavaScript) is a very permissive (some would say multi-paradigm) programmatic language and its syntax can be quite
intriguing when you have never heard of the [EcmaScript](https://www.ecma-international.org/publications-and-standards/standards/) (ES) specification or certain programming style.

So here I have compiled some basics that you should know about.

## Functions

### Arrow Function

Arrow function is used to define anonymous lambda function with less [syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).
But what's very interesting about them it's the flexibility with witch you can declare a function, and start removing pieces of it.
```js
function hello() { return 'Hello World' }
var hello = function () { return 'Hello World' }
var hello = () => { return 'Hello World' }
var hello = () => ('Hello World')
var hello = () => 'Hello World'
``` 

Any of the above could be called using `hello()`, JavaScript is very welcoming 👋. <br>
Here is another example, taking some arguments:

```js
var sum = (a, b) => a + b;
sum(1, 3) // returns 4
```

Anonymous functions is not a JS thing, but the countless way of declaring them, might throw you off. 
    
### High Order Function

High Order Function (HOF) pertain to the functional programming world.
They take a functions as parameter and return a function as a result like map, reduce or filter. 

Let's try to make our own with the JS syntax:
 
```js
var square = (x) => (x * x);
const twice = (f) => (x) => (f(f(x)));
twice(square)(3) // returns 81
```

We can also make it overly complicated.
You could take the sum function from before and turn it into something more complicated like:

```js
const sumButler = (x, y) => (sumFunction) => (() => sumFunction(x, y));
sumButler(1, 3)(sum)(); // returns 4 
```

Let's decompose it, you have:

  - `sumButler` method that ask for the first two parameters, then the function that will apply on them.
  - `sumButler(1, 3)(sum)` returns the arrow function from the two set of parameter
  - You need `()` to execute the return function in order to yield the final result.

And of course you can even nest these bad boys and go as crazy as you like. 😈

### Immediately Invoked Function Expression (IIFE)

Those are like rare _Pokemon_, you never see them. They execute right away!
Basically the trick is to use parenthesis _...everywhere_:

```js
;(function() {
  console.log('doing stuff')
})()
```

The function has no name because it will never be called again, and the parenthesis framing it allows to execute it right away. 

> See it as another possible way of declaring and executing functions in JavaScript.

You don't really need the `;` at the beginning, but it is good practice when creating plugins to avoid unexpected behaviour
by telling the interpreter that it is a new statement.

They are mainly used when using some JavaScript Module pattern, with _"namespacing"_ or to initialize scripts on load.

## JS Modules

### Import
    
Talking about Javascript Modules, you may want to use an external package or plugin. To use function, classes or anything from other files you may be _required_ to _import_ them 🙃.

While we have been focusing on EcmaScript which has a standard for JavaScript [Modules]((https://nodejs.org/api/esm.html#esm_modules_ecmascript_modules)).
So is [CommonJS](https://nodejs.org/docs/latest/api/modules.html#modules_modules_commonjs_modules) which is another standard that has influenced the development of [Node.js](https://nodejs.org/en/) known as server-side JavaScript.

Let's not digress too much into it, only to point out the major difference you may ever hear about it:

```js
// CommonJS
const ReactRouterDOM = require('react-router-dom')
const NavLink = ReactRouterDOM.NavLink


// EcmaScript (ES6)
import { NavLink } from 'react-router-dom'
```

CommonJS uses `require` which loads everything synchronously while EcmaScript (ES6) can do selective `import` (_tree shaking_) and load asynchronously. 
We will be continuing with EcmaScript standards in this article. 

### Export
 
For those modules to be _"importable"_ you first need to `export` them. Basically making them "public" and visible from outside their file.
With some linter and to avoid interferences you'll be warned with any anonymous exports, and asked to use the `export default` on your class, function, object.

> There can be only one `export default` that will get referenced as the file name.

So if you want to export more than one function, you can always do:
    
```js
const NamelessService = {
  doStuff,
  makeThings,
};

export default NamelessService;
```
    
And use it in another file like:
    
```js
import NamelessService from '../NamelessService';

NamelessService.doStuff()
```

No more mister anonymous 🕵️ and it's always tidier when everything is under one name.
Which brings us to namespacing! 
    
### Namespacing

[Namespacing](https://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript/) is a way to encapsulate functionality under one namespace to avoid naming collision when declaring variable.
Indeed, you should keep the global variable free of unnecessary declaration.

There are multiple ways of doing it, but the preferred one would be following the _module pattern_ using an IIFE: 

```js
var App = (function() {
    var id = 0;
    return {
        name: 'App',
        next: () => ++id,
        reset: () => id = 0
    };  
})();   
```

The App will be assigned to an object that has two methods and one value that can be called: 

  - `App.next()` Will increase the private value id.
  - `App.reset()` Will reset the private value id to 0.
  - `App.name` Will return `App` initially.
    
Also, if you try to update the values:

```js
App.name = "test";
App.id = 5;
```

Then the `App.name` will change. <br>
However the private value id will remain the same (meaning `App.next` won't return _6_), instead a new field will be created `{ id: 5 }` inside `App`.

## JS Objects

### Declaration: var, let, const

When declaring a variable you can access its value based on its scope. 
The scope, is where the declared variable is accessible. Usually top level declarations used in JS modules are
scoped to the module or file.

```js
// global / module scope
function foo() {
  // foo scope 
  function bar() { 
    // bar scope
  }
}
````

As in other language, a `var` declaration inside a function is not accessible outside that same function. 
However, without a `var` the declaration could be associated with the global objects and be visible from every scope.

So you could assign it then adding a `var` to declare the variable, thanks to _hoisting_, it won't pollute the global scope.
Because JavaScript implicitly process the variable declaration before executing the code. You may have seen:

```js
"use strict";
```

The _strict mode_ is to avoid any implicit declaration, an error will be thrown if you don't declare well your variable.
Thus avoiding ill placed declaration and reduce scope pollution.

There are three keywords to declare variables:

- Using [var](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var), the default one. It is the most flexible in term of scope, can be redeclared and reassigned.
- Using [let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) which mostly used for function or private values.
They are blocked in the same scope level unlike var, needs to be declared first even without strict mode.
- Using [const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) which could be considered as static values that are declared once and immutable.
And like let they are also scope blocked.

## Other quirks

### Prototyping

To make it simple, [prototyping](https://attacomsian.com/blog/objects-prototypes-classes-javascript) consists of adding or modifying existing behaviour of an object.
JavaScript is composed of objects that have properties, those properties are stored in a prototype which also has its own properties in a prototype, and so on...
It's called the [prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain).

```js
function Country(name, size) { this.name = name; this.size = size; }
var canada = new Country('Canada', 'Big')
var panama = new Country('Panama', 'small')
```

Let's add some properties:
```js
Country.prototype.planet = 'earth'
canada.planet // returns 'earth'
delete canada.__proto__.planet
panama.planet // returns undefined
```
You can always remove one prototype using the key word `delete` like on any object.
Either on a created object or the class itself, the prototype will be deleted from the chain and so from all of the linked objects. 

Now let's add a `sortNumerically()` behaviour to an existing object like the `Array` so that it sorts numerically instead of the default `sort()` that does it alphabetically:
```js
Array.prototype.sort = function () { return this.sort((a, b) => a - b) } 
``` 

Take that JavaScript, finally the sort I wanted! _But..._ what if somebody starts messing around?! 😱 <br>
That could trigger unexpected behaviour, like modifying already existing prototypes.

So to remedy, you can use `Object.freeze(obj)` where `obj` is the object you want to block from having its prototype modified.
Usually you don't modify objects that you don't own.

### Destructuring Arrays

The destructuring assignment syntax is a JavaScript expression that makes it possible to unpack values from arrays, or properties from objects, into distinct variables.

Behind this name is hidden the `{ }` brackets notation and `...` three dot operator. 
Basically you can cherry-pick values from an array or properties from an object into variables. This is also called _unpacking_. 

Here some [examples](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) on how to use those operators:

```js
[a, b, ...rest] = [10, 20, 30, 40, 50];
console.log(a); // 10
console.log(b); // 20
console.log(rest); // [30, 40, 50]
```

The three dots is an accessor to an array or object that will unpack and take the remaining values.
You can even go further with object using:

{% raw %}
```js
let car = { brand: 'Car', size: 'Big' };
let motor = { type: 'Powerful', consumption: 'expensive' };
let muscleCar = { ...car , motor };
console.log(muscleCar)
// returns { brand: "Car", size: "Big", motor: { type: "Powerful", consumption: "expensive" } }
```
{% endraw %}

And you can just create complex objects with the possibility to nest or not the composing sub-objects.

### Null check

You can do null check with the operator `??` which can be useful when you want to set a default value
if a variable end up being `null`, `undefined`.
Let's demonstrate with this [string templating](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) example where:

```js
var a = null;
var b = undefined;
console.log(`${a ?? 'it'} ${b ?? 'works!'}`)
// Prints out "it works!"
```

For a `NaN`, which is a Number property [`Number.NaN`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/NaN) meaning _Not A Number_, the `??` will have no effects.

## Conclusion

This article ended up being far longer than expected, JavaScript is a rabbit hole full of weird syntax that just make you go _why??_ 🤯 <br>
We're just on the surface of it, I mention the things that I felt were useful in new coming JavaScript developer.

And if you were looking for real crazy JS stuff, there's already a whole repository dedicated to it!
Behold [WTF JS](https://github.com/denysdovhan/wtfjs) which was inspired by [Brian Leroux's talk](https://www.youtube.com/watch?v=et8xNAc2ic8), it is
a community made collection of the best JavaScript logic conundrum.
