---
layout: post
title: Testing js with 🃏 Jest
color: rgb(239, 192, 80)
tags: [js]
---

## Introduction

[Jest](https://jestjs.io/) is an Open source test framework developed by Facebook and compatible
with a lot of framework.

Jest is fast, and already pre-configured to get started with it. So it simply works for javascript. For typescript, you 
may need to add some types and update your tsconfig.json, but nothing too rough.

It adapts to run your test in parallel to reduce the total amount it takes to run them.

### Basic test

The syntax is pretty standard if you are accustomed to the [jasmine](https://jasmine.github.io/) test framework, since
it was based on it.

Jest by default will consider as test files anything in a `test/` folder or ending with `.spec.js` or `.test.js`.
You can restrict that by overriding the basic configurations.

```js
describe("Jest tests", function () {
  test.todo('Add todo on what needs to be tested next'); 
  
  it('is a simple test', () => {
    test('adds 1 + 2 to equal 3', () => {
      expect(function() { return 1 + 2; }).toBe(3);
    });
  });
  
});
```

### With snapshot

You can also test using snapshots. Very useful with legacy code with no tests.
It basically keeps in a file what the output was, be sure to commit the snapshot files for your integrated tests on your
CI/CD to run properly.
When failing, it will ask you either to update the snapshot or not.

Testing only with snapshot is not recommended because you can let bug pass in tests by mistake, like updating with an 
error the snapshot when the test was actually failing for real.

```js
it('will fail every time', () => {
  const user = {
    createdAt: new Date(),
    id: Math.floor(Math.random() * 20),
    name: 'LeBron James',
  };

  // You can tweak the snapshot not to fail on trivial changes  
  expect(user).toMatchSnapshot({
    createdAt: expect.any(Date),
    id: expect.any(Number),
  }); 
});
```

### Jest Tips and tricks

Here are some commands you can add in your package.json to work with jest:

```json
{
  "scripts": {
    "test": "jest",
    "debug": "jest --watch",
    "coverage": "jest --coverage",
    "clear_jest": "jest --clearCache"
  }
}
```

Just `jest` runs the test, but you might want to use:
  - `--watch` to run the tests automatically at each modification. 
    You can also specify in the watch which tests to re-run in case you have a lot.
  - `--coverage` to get the coverage right from the testing tool.
  - `--clearCache` when jest gets jammed, a bit of last resort when tests are failing for no reasons. 


One last tip. Add some linting to your project's scripts to easy fix trailing spaces and other noise errors. 
Install `eslint` first so that it runs properly:

```json
"lint": "eslint --fix . --ext .js src test/unit test/e2e/specs"
```

That should keep some obvious typo out of the reason why your tests are failing, so you can concentrate on debugging
the real problem.
