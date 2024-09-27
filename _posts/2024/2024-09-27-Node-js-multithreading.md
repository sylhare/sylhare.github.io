---
layout: post
title: Node.js and multi-threading, is it possible?
color: rgb(242, 143, 121)
tags: [js]
---

Wait, is Node.js _multi-threaded_? A question you might be asking yourself. 🤓
Le's have an in-depth look at how Node.js works, then dive into how to run multiple tasks concurrently in Node.js. 

## Node.js engine

### Introduction

[Node.js][4] is single-threaded because it's built on the V8 JavaScript engine, which is also single-threaded. 
This is due to JavaScript's origins in web browsers, where it was primarily used for user-interface tasks like responding to user interactions, 
manipulating the DOM, and making AJAX requests (**A**synchronous **J**avaScript **a**nd **X**ML). 

These tasks are typically I/O-bound (input/output as waiting for user input, waiting for network or disk data) rather than CPU-bound (performing complex computations),
so a single-threaded, event-driven model was a good fit.

However, not all javascript is run on [V8][1], but it's used in Chromium (Chrome and Edge) and Node.js.

### Event Loop

The [event loop][5] is the core of Node.js' asynchronous, non-blocking behavior.  
When Node.js starts, it initialises the event loop. Each iteration of the event loop is called a "_tick_". 
Within each tick, the event loop processes a series of callbacks based on different types of events 
(like timer expiration, I/O events, or immediate callbacks).

For example, when an asynchronous operation is initiated, a callback function is provided to handle the result. 
This operation is offloaded to the system, allowing Node.js to continue executing other code (like processing additional callbacks). 
When the async operation completes, its callback is put into a queue to be executed in a future tick of the event loop.

The event loop continues to process callbacks on each tick until there are no more callbacks to process. 
At that point, Node.js exits.

### V8 Engine

The [V8 engine][1] is Google's open-source high-performance JavaScript and WebAssembly engine. 
It's written in C++ and is used in Google Chrome and other Chromium-based browsers, 
as well as in Node.js.  

The name "V8" comes from the fact that it was the eighth in a line of JavaScript engines developed by the Chromium project.
The previous engines were all named after car engines, 
so V8 was named after the V8 engine (the one with eight cylinders and internal combustion 🏎️ engine).

Node.js has always used the V8 engine since its creation. It is what allows Node.js to execute JavaScript code.
The specific version of V8 used by Node.js is typically updated with each [major release][2]
to incorporate the latest improvements and features from it.

## Asynchronous execution

### With promises

Let's have multiple functions that return promises, and we want to execute them concurrently.
In this example, `asyncTask1` and `asyncTask2` are both asynchronous tasks that are simulated with setTimeout.
The _asyncTask2_ is faster than _asyncTask1_ with the set timeout delay:

```ts
function asyncTask1() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Task 1 is complete');
            resolve('1');
        }, 2000);
    });
}

/** will execute faster than asyncTask1 */
function asyncTask2() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Task 2 is complete');
            resolve('2');
        }, 1000);
    });
}
```

If both triggered at the same time, they would not truly be running in parallel (as JavaScript is single-threaded), 
but they are non-blocking, other code can run while waiting for these tasks to complete.
This gives the impression that both tasks are running concurrently.

Now, to get the result out of these tasks, you could use:

- The `Promise.all` which waits for all the provided promises to resolve.
  ```ts
  const result = new Promise.race([asyncTask1(), asyncTask2()]);
  // result = ['1', '2'] after 2000ms once both tasks have completed
  ```
- The `Promise.race` which waits for the first promise to resolve or reject.
  ```ts
  const result = new Promise.race([asyncTask1, asyncTask2])
  // result = '2' after 1000ms once the second task has completed
  ```
  
However, if a process is CPU-intensive, it will block the event loop and prevent other tasks from running.
So it wouldn't run both tasks in concurrently but sequentially
(meaning the first task would still be executed first even if the second task is faster).

### Using workers

#### Introduction

In Node.js, you can create [workers][3] which will run js file in separate V8 engine instances.
So it's _multi-threaded_ but it's not as performant as native multithreading nor the most convenient.
Here is how you would create a worker:

```js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // This code is executed in the main thread and not in the worker.

  // Create an instance of Worker
  const worker = new Worker(__filename, { workerData: { value: 'bar' } });

  // Listen for messages from the worker and print them.
  worker.on('message', (msg) => {
    console.log(msg);
  });
} else {
  // This code is executed in the worker and not in the main thread.
  parentPort?.postMessage(`Hello, ${workerData.value}!`);
}
```

I have written it as a commonJS module, because it makes it easier to run as one file in node.
As you can see the worker takes the file path and an optional object with the `workerData` that you want to pass to
the worker thread.
  - The `__filename` is the name of the file that contains the code.
  - The `isMainThread` is a boolean which detects if the code is running in the main thread.

As it's two different V8 engine instances, you can't share memory between the main thread and the worker thread.
A const defined in the worker thread will not be defined in the main thread and vice versa.
You can only communicate through messages.
  - The `parentPort` is a reference to the MessagePort object that allows communication between the parent thread and the worker thread.
  - The `worker.on('message', ... )` listens for messages from the worker thread and prints them.
  - The worker can also listen for `error` and `exit` events.

### Conclusion

Don't let yourself foul by _Promises_, which are asynchronous but not _multi-threaded_, 
like in other languages where you could run processes while moving on with the main thread.

The only way to mimic multithreading in Node.js is via using multiple single-threaded processes.
With the tick of the event loop, they may run concurrently, but they are not truly running in parallel.

On the other hand, with workers which are running in separate V8 engine instances, it's more similar to actual multithreading.
Although you could have runner methods that would spawn workers executing the tasks in parallel 
who'd return the result to the main thread, it's not a common pattern.

Usually, when in need of alleviating the load instead of worker thread, a microservice architecture can be adopted.
Breaking down the logic into microservices, effectively creating _worker_ application instead of worker threads.
This makes for a more reliable and scalable solution.

Let me know in the comment if I missed something out, or if you have some more recommendations or tips using
multi-threading in Node.js.



[1]: https://github.com/v8/v8
[2]: https://nodejs.org/en/about/previous-releases
[3]: https://nodejs.org/api/worker_threads.html
[4]: https://nodejs.org/en/learn/getting-started/the-v8-javascript-engine
[5]: https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick#event-loop-explained