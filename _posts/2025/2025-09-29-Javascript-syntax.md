---
layout: post
title: Handy Javascript Syntax
color: rgb(3,74,166)
tags: [js]
---

## JavaScript Basics

Quick cheat sheet for the most common JavaScript syntax and methods.

### 1. Variable Declaration

```javascript
// Using let and const
let x = 10;        // Mutable
const y = 20;      // Immutable
```

- **Type checking**

```javascript
console.log(typeof x);           // "number"
console.log(Array.isArray([])); // true
console.log(Number.isInteger(5)); // true
```

- **Quick conversions**

```javascript
console.log(+"123");    // 123 (string to number)
console.log(123 + "");  // "123" (number to string)
console.log(!!0);       // false (truthy/falsy check)
```

### 2. Function Definition

- **Function declaration**

```javascript
function add(a, b) {
    return a + b;
}

console.log(add(2, 3)); // Expected: 5
```

- **Function expression**

```javascript
const multiply = function (a, b) {
    return a * b;
};
console.log(multiply(4, 5)); // Expected: 20
```

- **Arrow functions**

```javascript
const subtract = (a, b) => a - b;
const square = x => x * x;           // Single parameter
const greet = () => "Hello!";        // No parameters

console.log(subtract(10, 3)); // Expected: 7
console.log(square(4));       // Expected: 16
console.log(greet());         // Expected: "Hello!"
```

### 3. Loops

- **For loop**

```javascript
for (let i = 0; i < 3; i++) {
    console.log(i * 2); // Prints: 0, 2, 4
}
```

- **For...of loop (values)**

```javascript
const arr = [10, 20, 30];
for (const num of arr) {
    console.log(num); // Prints: 10, 20, 30
}
```

- **For...in loop (keys)**

```javascript
const obj = {a: 1, b: 2, c: 3};
for (const key in obj) {
    console.log(key, obj[key]); // Prints: a 1, b 2, c 3
}
```

- **While loop**

```javascript
let i = 0;
while (i < 3) {
    console.log(i++); // Prints: 0, 1, 2
}
```

### 4. Array Manipulation

- **Basic array operations**
  - **Time Complexity**:
    - `push` (add to the end): $$O(1)$$
    - `pop` (remove from the end): $$O(1)$$
    - `shift` (remove from the start): $$O(n)$$
    - `unshift` (add to the start): $$O(n)$$
  - **Space Complexity**: $$O(n)$$ (proportional to the number of elements)

```javascript
const arr = [1, 2, 3, 4, 5];

// Add/remove elements
arr.push(6);    // [1, 2, 3, 4, 5, 6]
arr.pop();      // [1, 2, 3, 4, 5]
arr.shift();    // [2, 3, 4, 5]
arr.unshift(0); // [0, 2, 3, 4, 5]
```

- **Slice and splice**
    - `slice` (non-mutating): $$O(k)$$, where `k` is the size of the sliced portion.
    - `splice` (mutating): $$O(n)$$, where `n` is the size of the array.

```javascript
const original = [1, 2, 3, 4, 5];
const sliced = original.slice(1, 3);  // [2, 3] (non-mutating)
original.splice(2, 1);                // Removes 1 element at index 2 (mutating)
```

- **Iteration methods**
    - `forEach`, `map`, `filter`: $$O(n)$$

```javascript
const nums = [1, 2, 3, 4, 5];
nums.forEach((num, index) => console.log(`Index: ${index}, Value: ${num}`));
const doubled = nums.map(num => num * 2);        // [2, 4, 6, 8, 10]
const evens = nums.filter(num => num % 2 === 0); // [2, 4]
```

- **Searching**
    - `includes`, `indexOf`, `find`: $$O(n)$$

```javascript
const arr = [1, 2, 3, 4, 5];
arr.includes(3);        // true
arr.indexOf(3);         // 2
arr.find(num => num > 3); // 4
```

- **Sorting**
    - `sort`: $$O(n \log n)$$

```javascript
const unsorted = [3, 1, 4, 1, 5];
unsorted.sort((a, b) => a - b); // [1, 1, 3, 4, 5] (ascending)
unsorted.sort((a, b) => b - a); // [5, 4, 3, 1, 1] (descending)
```

### 5. String Manipulation

- **Character access**
  - Accessing a specific character or the length of a string is constant time $$O(1)$$.

```javascript
const str = "hello world";
console.log(str[0]);     // 'h' 
console.log(str.length); // 11 
```

- **Substring methods** 
  - $$O(k)$$, where `k` is the length of the substring.
  - Extracting a substring involves iterating over the characters in the substring.

```javascript
console.log(str.slice(0, 5));     // 'hello' 
console.log(str.substring(0, 5));  // 'hello' 
```

- **Splitting and joining**: 
  - $$O(n)$$, where `n` is the length of the string or the total length of the array elements.  
    Splitting iterates through the string, and joining iterates through the array.

```javascript
const words = str.split(" ");      // ['hello', 'world'] 
const joined = words.join("-");    // 'hello-world' 
```

- **Searching**: 
  - $$O(n)$$, where `n` is the length of the string.  
    Searching for a substring involves scanning the string.

```javascript
console.log(str.indexOf("world"));  // 6 
console.log(str.includes("hello")); // true 
```

- **Replacing**
  - $$O(n)$$, where `n` is the length of the string.  
    Replacing involves searching for the substring and creating a new string.

```javascript
console.log(str.replace("world", "JavaScript")); // 'hello JavaScript' 
```

- **Case transformation**:
  - $$O(n)$$, where `n` is the length of the string.  
    Transforming the case requires iterating through all characters.

```javascript
console.log(str.toUpperCase()); // 'HELLO WORLD' 
console.log(str.toLowerCase()); // 'hello world' 
```

### 6. Useful Built-in Methods

- **Math functions**

```javascript
Math.max(1, 2, 3);  // 3
Math.min(1, 2, 3);  // 1
Math.floor(4.7);    // 4
Math.ceil(4.2);     // 5
Math.round(4.5);    // 5
Math.random();      // Random number between 0 and 1
```

- **Number parsing**

```javascript
parseInt("123px");    // 123
parseFloat("123.45"); // 123.45
```

### 7. Data Structures

- **Set (unique values)**
    - **Time Complexity**:
        - `add`: $$O(1)$$ (average case), $$O(n)$$ (worst case, due to resizing)
        - `delete`: $$O(1)$$ (average case)
        - `has`: $$O(1)$$
        - Iteration (e.g., spreading with `...`): $$O(n)$$
    - **Space Complexity**: $$O(n)$$ (proportional to the number of elements)

```javascript
const set = new Set([1, 2, 3, 3]);
set.add(4);
set.delete(2);
console.log(set.has(3)); // true
console.log([...set]);   // [1, 3, 4]
```

- **Map (key-value pairs)**
    - **Time Complexity**:
        - `set`: $$O(1)$$ (average case), $$O(n)$$ (worst case, due to resizing)
        - `get`: $$O(1)$$
        - `delete`: $$O(1)$$
        - `has`: $$O(1)$$
        - Iteration (e.g., `for...of`): $$O(n)$$
    - **Space Complexity**: $$O(n)$$ (proportional to the number of key-value pairs)

```javascript
const map = new Map();
map.set("a", 1); // key, value
map.set("b", 2);
console.log(map.get("a")); // 1
map.delete("b");
console.log(map.has("b")); // false
```

### 8. Object Manipulation

- **Property access**:
    - $$O(1)$$ (direct access by key).

```javascript
const obj = {a: 1, b: 2, c: 3};
console.log(obj.a);    // 1 
console.log(obj["b"]); // 2 
```

- **Adding or updating properties**:
    - $$O(1)$$ (average case).

```javascript
obj.d = 4;        // Add property 
obj["e"] = 5;     // Add with bracket notation 
```

- **Deleting properties**:
    - $$O(1)$$ (average case).

```javascript
delete obj.a;      // 
console.log("a" in obj); // false
```

- **Object methods**:
    - **Time Complexity**:
        - `Object.keys`, `Object.values`, `Object.entries`: $$O(n)$$, where `n` is the number of properties.
    - **Space Complexity**: $$O(n)$$ (proportional to the number of properties).

```javascript
const keys = Object.keys(obj);      // ['b', 'c', 'd', 'e'] 
const values = Object.values(obj);  // [2, 3, 4, 5] 
const entries = Object.entries(obj); // [['b', 2], ['c', 3], ...] 
```

- **Iterating over objects**:
    - **Time Complexity**: $$O(n)$$, where `n` is the number of properties.

```javascript
for (const key in obj) {
    console.log(key, obj[key]); // 
}
```

### 9. Conditional Statements

- **Basic if-else**

```javascript
const num = 10;

if (num > 5) {
    console.log("Greater than 5");
} else if (num === 5) {
    console.log("Equal to 5");
} else {
    console.log("Less than 5");
}
```

- **Ternary operator**

```javascript
const result = num > 5 ? "Greater" : "Smaller";
```

- **Switch statement**

```javascript
const day = "monday";
switch (day) {
    case "monday":
    case "tuesday":
        console.log("Weekday");
        break;
    case "saturday":
    case "sunday":
        console.log("Weekend");
        break;
    default:
        console.log("Unknown");
}
```

### 10. Error Handling

```javascript
try {
    throw new Error("Something went wrong");
} catch (error) {
    console.log(error.message);
} finally {
    console.log("Cleanup code");
}
```

### 11. Recursion

- The time complexity of a recursive function is determined by:
  - Number of recursive calls: How many times the function is called. (i.e. (n + 1) (from (n) down to 0))
  - Work done per call: The amount of computation performed in each call (excluding the recursive calls). (i.e. a single multiplication operation)
  - Time Complexity here is $$O(n)$$.
- The space complexity of recursion is determined by the call stack:
  - Each recursive call adds a new frame to the stack. (i.e. (n + 1) frames for n calls)
  - The maximum depth of the recursion determines the space used. (i.e. n frames for n calls)
  - Space Complexity here is $$O(n)$$.

```javascript
function factorial(n) {
    if (n === 0) return 1;
    return n * factorial(n - 1);
}

console.log(factorial(5)); // 120
```

This should give enough information to get back into your javascript game.