---
layout: post
title: Advanced Jest testing
color: rgb(21,194,19)
tags: [js]
---

We have talked briefly about [Jest][4] before in this [blog][10] before, 
but only on how to write a basic test and set it up within your project.

Let's dive a bit further with some interesting cases and advanced features that jest has to offer. If I didn't talk 
about your favourite jest feature, let me know in the comment. 🧡

### Timeout and retries

When testing asynchronous connection or with a unique setup, 
you may encounter flaky tests which will fail in the pipeline due to timeout issues
(jest's default timeout is 5seconds). 

Although the test can be flaky by design. 
The ideal solution would be to spend the required amount of time and fix the codebase and its tests, 
but that's not always possible or realistic. On those occasions you can use:

```js
jest.retryTimes(3);
jest.setTimeout(10000);
describe('', () => {
  // your tests
})
```

A bit like annotation to add above a `describe` like in the example to extend the timeout from 5seconds to 10 and 
retry up to 3 times in case there's a test failing in the suit.
That's some ducktape 🦆 but it does the job when you need to patch stuff quickly.

### `toBe` vs `toEqual`

This one is not really an advanced feature, but can give you a hard time debugging when you don't know about it.
The `.toBe` and `toEqual` do not react the same way in front of equality.

I prefer `toEqual` as it yields results corresponding to my expectation. Let's take this constant as an example and
write two tests in typescript to demonstrate the differences between the two:

```ts
const hello = { hello: 'world' };
```

I am testing against the constant using [toEqual] with the same value it should have, so I am expecting this test 
to pass:

```ts
it('should work', () => {
  // ✅ works
  expect(hello).toEqual({ hello: 'world' });
});
```

Which is true, it matches my expectation, that's because with [toEqual] is doing a deep equality comparing the value of
both objects.
However, when trying with `toBe` I get with Jest v27.4.7 a different response.
I specify the jest library version as the response I get may have evolved or is evolving:

```ts
it('should work', () => {
  // ❌
  // Expected: {"hello": "world"}
  // Received: serializes to the same string
  expect(hello).toBe({ hello: 'world' });
});  
```

Here the test does not pass even-though the two variables expected look similar to our value. 
That's because [toBe] compares the reference of the object, 
the only way it can be true is if we do `expect(hello).toBe(hello);`.
It should only be used if you want to test that the object has the same reference and is the same still.

I also had with typescript the case where the use of [toBe] lead to cryptic errors such as:

```bash
(0 , _jestGetType.default) is not a function
TypeError: (0 , _jestGetType.default) is not a function
```

Which seems to be occurring within the internal of jest, replacing it with a [toEqual] fixed it. 
I could replace one by the other because I didn't care for it to be the same object, just the same value. 

Hopefully, these kinds of unhelpful error messages get fixed/caught as jest evolves.

### Using `.each` in tests

This is particularly useful when you need to do the same test for multiple input instead of duplicating the tests or
the suite.

#### With `it`

When you need to reiterate only on one test:

```ts
it.each([null, undefined, ''])('"%s" should be falsy', (input: any) => {
  expect(input).toBeFalsy();
});
```

Note the `%s` which is going to be populated with the current "_stringified_" version of the variable tested from the
[.each] method. 
Useful to identify which use case has failed.

#### With `describe`

When you need to reiterate on a test suite:

```ts
  describe.each([
    { user: 'dev' },
    { user: 'admin' },
    { user: 'customer' }
  ])('API', (current: { user: string }) => {

    it(`${current.user} can read`, () => {
      expect(checkRights(current)).toBeTruthy();
    });
  });
```

Each test within the _describe_ method will be run with the current variable.
Useful if you need to test multiple inputs yielding the same output.

## Extend expects matchers

This is useful to reduce the extra syntax used to verify one use case. 
You can also use it to customise the error message to more helpful to future contributors working on the project.

### Matcher

Let's have a custom matcher that tests that what is received is a Date object:

```ts
export const toBeDate = (received: any): jest.CustomMatcherResult => {
  const pass = received instanceof Date;

  return {
    message: () => `expected "${received}"${pass ? ' not' : ''} to be a date`,
    pass
  };
};
```

As it's a custom matcher it should return `pass` which is the criteria if the extended expect matcher "matches" or not.
And a `message` that will be display when it's not passing.

### With typescript

With Typescript, your new custom matcher won't be recognised unless you tell jest it exists. 
To do so, you need to have in another file (by that I mean not a file with tests in it):

```ts
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDate(): R;
    }
  }
}

export {}; // <-- Optional trick, if you have a TS error.
```

You can also use custom interfaces if you need to create multiple custom matchers (check jest's [documentation][1])
The `export {}` is only necessary if you are not exporting anything else in the file. 

You'll see a typescript error:

> **TS2669**: Augmentations for the global scope can only be directly nested in external modules or ambient module declarations.

If you export your matcher and have the global scope augmentation in the same file, then it should not be an issue.

### Extended matcher in a test

Now that you are all set, let's use your new matcher already! Use the [extend] on the `expect` at the beginning of your
test file, so it can be used:

```ts
expect.extend({
  toBeDate,
});

it('should be a date', () => {
  expect(new Date()).toBeDate();
  expect('hello').not.toBeDate();
});
```

It works with the `not` by default, and if you try to make it fail, the message adjusts:

> - `expect('hello').toBeDate();` → expected "_hello_" to be a date
> - `expect(new Date()).not.toBeDate();` → expected "_Fri Aug 30 2022 22:19:40 GMT-0400 (Eastern Daylight Time)_" not to be a date

That's because the `not` have an effect on the `pass` in our matcher. It is passed so that the proper error message
can be displayed for the user based on our implementation.

## Mocks

A couple of examples for the main use-cases you may encounter when trying to mock stuff in typescript. 
Check this [jest mocking strategies][2]' article for an even finer depictions of the jest possibilities in terms of mocking.

### `clearAllMocks` vs `resetAllMocks`

Mokcs can be re-used, but they do keep their state in between tests which may cause interference between tests.
Fortunately clearing or resetting mocks can be done all at once using `jest.clearAllMocks()` or `jest.resetAllMocks()`.
Let's see what each do, so you can use them wisely:

- _ClearAllMocks_: This is to clear the invocation data (calls and instances on the mock) but leave the mocked value.

```ts
cont mock = jest.fn().mockReturnValue('hello');
expect(mock()).toEqual('hello');
expect(mock).toHaveBeenCalledTimes(1);
jest.clearAllMocks();
expect(mock).not.toHaveBeenCalled();         // Invocation data is cleared
expect(mock()).toEqual('hello');             // Mocked value is still there
```        

- _ResetAllMocks_: This is to reset the mock to its initial state, so it will remove the mocked value and clear the invocation data.

```ts
const mock = jest.fn().mockReturnValue('Hello World!');
expect(mock()).toEqual('Hello World!');
expect(mock).toHaveBeenCalledTimes(1);
jest.resetAllMocks();
expect(mock).not.toHaveBeenCalled();        // Invocation data is cleared
expect(mock()).toBeUndefined();             // Mocked value is removed
````

If the mocked value never needs to change, it's better to use `clearAllMocks`, if you need to use `resetAllMocks`,
it might create some problem with [react][11] and make sure you add the mocked value back when needed.

### Mock a class

When mocking, a limitation with Typescript, is that the object's type must match (it can't be a "relaxed" mock). 
In the case of your own objects, you may not have too many fields to mock, making it manageable. 
But once you start creating classes inherited from others or libraries, 
you might find yourself forced to add private method to your mocks.

This is less than ideal, and the only way to prevent it is to use an interface for your object.
A lesser evil to avoid painful creation of unnecessary fields.

```ts
const marketServiceMock: jest.Mocked<MarketService> = {
  url: '', // Example of a field that is not necessary in our mock
  buy: jest.fn().mockResolvedValue('ok'), // Mocking the call to an external dependency
  info: jest.fn().mockImplementation(() => new MarketService().info()), // using the actual value
};
```

Now that we have created our custom mock, for our use case, we can now use it in our test. In this case we're not 
really testing the `MarketService`, only the mocked version of it. Just to show that it works.

```ts
describe('with mock service', () => {
  it('gives the info', () => {
    expect(marketServiceMock.info()).toMatch(/buy and sell items/);
  });

  it('mocks the service', async () => {
    const response = await marketServiceMock.buy({ name: 'orange juice' });
    expect(response).toEqual('ok');
  });
});
```

In an actual use case, you might have another object or service using the mocked one. So you don't test the mock, but the
actual service.

### Mock part of a class

If you just need to mock that one particular function calling an external dependency, then it's best advised to use the
`spy` which will let you use the real implementation of your object for the rest.

To create it, use [jest.spyOn] and pass the object and the method's name as a string which you want to "spy" on. Here 
are two examples, by default, the spied method rejects (like for a missing dependencies), but with the spy you can change 
the behaviour and make it resolve to what you want for your test.

Same as before, we're here testing the mock. 
I do hope you see the potential for a real use case when you need to mock one of your dependencies.

```ts
describe('with spy on service', () => {
  const marketService = new MarketService();
  
  // without spy
  it('rejects by default', async () => {
    await expect(marketService.buy({ name: 'orange juice' })).rejects.toMatch(/rejects by default/);
  });

  // with spy
  it('works when spied', async () => {
    const spy = jest.spyOn(marketService, 'buy').mockImplementation(() => Promise.resolve('ok'));
    const response = await marketService.buy({ name: 'orange juice' });
    expect(response).toEqual('ok');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
```

The `spy` can be extended with the same method as a mock or a `jest.fn()`, which leaves you space to mock the implementation
of the spied method or check if it was called or not.
It's less messy, and you have better control on what the internal method should return.

### Mock bits of a library

If you work with multiple functions or a library, and they are being called by one of the objects you are testing, you
can use the `jest.mock` on the library itself to mock part of it. The [jest.requireActual] allows you not to have
to mock everything and use the actual values for the rest.

```ts
jest.mock('../../src/service/Calculator', () => ({
  ...jest.requireActual('../../src/service/Calculator'), // use actual the rest
  mSum: jest.fn().mockImplementation(() => 'mocked')
}));

describe('Calculator', () => {
  it('sums', () => expect(mSum(3, 2)).toEqual('mocked'));
  it('multiplies', () => expect(mMultiply(3, 2)).toEqual(6));
});
```

You can see here in this example that only the one I defined is mocked and the rest works as expected. 
You don't have to believe me, it's all available [there][3] for you to test if you need.

### Mock with export and export default

Export and an export default get compiled and imported a bit differently, so when mocking a file, you might be
surprised by the behaviour of your mock.

Let's say you had:

```ts
const defaultMethod = () => {
  doStuff: () => {}
}
export default defaultMethod

// import
import defaultMethod from 'module';
```

So the [jest.mock] is directly `defaultMethod` you have in your file, so you can do:

```ts
jest.mock('module', () => ({
  doStuff: jest.fn()
}));
```

And that will work, the `doStuff` method inside will be mocked as expected. However, if you had a slightly different file,
like this one:

```ts
export const method = () => {
  doStuff: () => {}
}

// import
import { method } from 'module';
```

The import is slightly different, so you will need to modify the mock to reflect that as well:

```ts
jest.mock('module', () => ({
  method: {
    doStuff: jest.fn()
  }
}));
```

This way your `doStuff` method will be mocked and behave as expected, it's a bit lengthier that the first version, but
it also highlights one of the key differences when you `export` and when you `export default`. 
So be aware of those tiny details as they can through you into a debugging rabbit hole. 🐇

[1]: https://jestjs.io/docs/expect#expectextendmatchers
[2]: https://mercedesbernard.com/blog/jest-mocking-strategies
[3]: https://github.com/sylhare/Typescript
[4]: https://jestjs.io/fr/
[toBe]: https://jestjs.io/docs/expect#tobevalue
[toEqual]: https://jestjs.io/docs/expect#toequalvalue
[.each]: https://jestjs.io/docs/api#each
[extend]: https://jestjs.io/docs/expect#expectextendmatchers
[jest.spyOn]: https://jestjs.io/docs/jest-object#jestspyonobject-methodname
[jest.requireActual]: https://jestjs.io/docs/jest-object#jestrequireactualmodulename
[jest.mock]: https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
[10]: {% post_url 2020/2020-03-24-Testing-with-js-with-jest %}
[11]: {% post_url 2022/2022-10-18-React-testing-static %}