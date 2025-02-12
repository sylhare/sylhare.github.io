---
layout: post
title: Static React Testing
color: rgb(242,62,61)
tags: [react]
---

In this article we'll have a look at the React [testing library], some of its packages and the main APIs to use in
your test to simulate any situation in our App.

The [testing library] that can be identified in your _package.json_ as [@testing-library] is not a React only library,
they have packages for angular and vue as well.
I have compiled into this cheat sheet all you need to know about it, so you become a master test ninja 🥷 with React!

### The testing library

There are some packages from [@testing-library] that I usually use in my React apps, let's give them a small
introduction before we get started:

- **[@testing-library/react]** → The backbone library for our test which will hold all the functions to interact with our
  React components
- **[@testing-library/jest-dom]** → To use with jest (the test framework) and to provide useful matchers to assert the state
  of the DOM in our tests.
- **[@testing-library/user-event]** → A bit experimental, this is to mimic a user's actual input on the keyboard when
  interacting with a component.
- **[@testing-library/dom]** → It's a peer dependency of the above packages which contains DOM testing utilities

There are also some packages for the React hooks, that may come later in this article or in a future one.

### Testing API

Let's dig into the testing API, how the component should look like and what are those [queries] we can use to find
nodes in our DOM.

#### Set up

Some information about the setup if you want to reproduce it at home. You can always find some live example in
[sylhare/React], but it might be a bit messy in there as it's a repository I use for experimentation.
In our example instead of extracting the query from the `RenderResult`, we will use `screen`
from [@testing-library/react]
to do the job. It works because we are rendering our test component before each test:

```tsx
beforeEach(() => render(<Example/>));
```

Good / Bad practice depends on how and what you test, if you are using the _eslint_
plugin [eslint-plugin-testing-library],
you might see that some example from the testing library may raise some error. If the rule does not make sense in the
context you override it in:

```json
{
  "eslintConfig": {
    "rules": {
      "testing-library/no-render-in-setup": ["error", { "allowTestingFrameworkSetupHook": "beforeEach" }]
    }
  }  
}
```

If you find yourself overriding too may rule then either remove the plugin or start an introspection on the code you 
are writing 😅

#### getByTestId

With html attributes, you can add extra custom ones with `data-*`. The [data] attribute is the standardized way of 
attributes customization. For example, a famous one for tests is the `data-testId` to add a test id on a node.
Let's have a demo component to showcase it:

```tsx
const Component = (): JSX.Element => {
  return (
    <div>
      <div data-testid='example-test-id'> hello </div>
    </div>
  );
}
```

Now you can use `getByTestId` to query this test id and have the corresponding element. Usually we use a different test
id per component, ids are meant to be unique. And you would want to use test id only as a last resort when you can't
use other query from the testing API as they do tend to crowd the html in your component:

```ts
it('gets by data-testid', () =>
  expect(screen.getByTestId('example-test-id')).toHaveTextContent('hello'));
```

#### getByLabelText

In this example component you can see _aria-label_, which means it's an "aria" attributes. The acronym [aria] stands for
Accessible Rich Internet Applications to make web content more accessible to people with disabilities.

```tsx
const Component = (): JSX.Element => {
  return (
    <div>
      <div aria-label='example-label'> world </div>
    </div>
  );
}
```

To test an element with an `aria-label` you can use the `getByLabelText` query which will look through the document to 
select a node with a matching label name:

```ts
it('gets by aria-label', () =>
  expect(screen.getByLabelText('example-label')).toHaveTextContent('world'));
```

#### getByAltText

The `alt` for "alternative" is usually found on images when not loaded, the page will display the _alt_ernative text.
It's useful to have something descriptive of the image:

```tsx
const Component = (): JSX.Element => {
  return (
    <div>
      <img alt='nothing' />
    </div>
  );
}
```

To test it, use the `getByAltText` query to find the node containing it:

```ts
it('gets by alt', () =>
  expect(screen.getByAltText('nothing')).toBeInTheDocument());
```

#### getByRole

The [role] is also part of the attributes for accessibility and can be set or is inherent to the html object used.
Let's check this example component:

```tsx
const Component = (): JSX.Element => {
  return (
    <div>
      <h1 aria-label='heading-label'>Example</h1>
      <div aria-label='custom' role='button'> Click Me! </div>
      <button aria-label='genuine'>No Me!</button>
    </div>
  );
}
```

As you can see there are no explicit _role_ for the `h1` tag, however you can query it by its implicit _heading_ role
and its level (1 -> h1 to 5 -> h5) and its name which is in fact its _aria-label_, this makes the query much more 
precise that just by text content and less obnoxious than with a test id:

```ts
it('gets by role:heading', () =>
      expect(screen.getByRole('heading', { level: 1, name: 'heading-label' })).toHaveTextContent('Example'));
```

It is the same for the `button` tag, it has an implicit `button` role, but you can create your own button from a `div` 
tag and specify its role using the _button_ role. 

```ts
it('gets by role:button', () =>
  expect(screen.getByRole('button', { name: 'custom' })).toHaveTextContent('Click Me!'));

it('gets by role with button tag', () =>
  expect(screen.getByRole('button', { name: 'genuine' })).toHaveTextContent('No Me!'));
```

#### getByText

When you don't have implicit attributes or need to add extra attributes like in the component below, 
you can still get and validate elements:

```tsx
const Component = (): JSX.Element => {
  return (
    <div>
      <p>Example</p>
    </div>
  );
}
```

The _getByText_ will look for the text content within html tags. As for the previous query you can either look for 
an exact match `'Example'` or using a Regex `/Example/` to match the text against it.
The regex is very useful when the text is rendered on multiple lines:

```ts
it('gets by text', () =>
  expect(screen.getByText(/Example/)).toBeVisible());
```

#### getByTitle

The _title_ is different from the _heading_ role, we're talking about the title attribute which can be confusing.
This one might not be the most useful query, but it's important to know it's not for headings 😅
For example in this component:

```tsx
const Component = (): JSX.Element => {
  return (
    <div>
      <span title='ExampleTitle'></span>
    </div>
  );
}
```

And like the other queries you can get the element by passing its value:

```ts
it('gets by title', () =>
   expect(screen.getByTitle('ExampleTitle')).toBeVisible());
```

### Caveat

When using the testing library with React and jest, I encountered some unexpected behaviours when wanting to reset mocks.
Let's say you pass a `jest.fn()` to a component, in one of the _before_ function you'd like put then back to their
initial state for your next test.
Jest lets you use two functions:

```js
// May break mocked child components rendered by React
jest.resetAllMocks();
// To clear out any `jest.fn()` mocks you've been using, no after effects
jest.clearAllMocks();
```

The `resetAllMocks` replace the `jest.fn()` by a new one while the `clearAllMocks` replaces the `fn.mock.calls` and
`fn.mock.instances` only.
Used while rendering a component, it's better to _clear_ than to _reset_ as the reset seems to impact nested components
and might make your test fail with strange errors (e.g. component or label can't be found).

That's it for now! For more tips on React Testing check out this [blog article] about some "common mistakes" with the 
testing library.


[testing library]: https://testing-library.com/docs/
[@testing-library]: https://www.npmjs.com/org/testing-library
[@testing-library/react]: https://www.npmjs.com/package/@testing-library/react
[@testing-library/jest-dom]: https://www.npmjs.com/package/@testing-library/jest-dom
[@testing-library/user-event]: https://www.npmjs.com/package/@testing-library/user-event
[@testing-library/dom]: https://www.npmjs.com/package/@testing-library/dom
[queries]: https://testing-library.com/docs/queries/about
[eslint-plugin-testing-library]: https://github.com/testing-library/eslint-plugin-testing-library
[sylhare/React]: https://github.com/sylhare/React
[data]: https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
[aria]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
[role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles
[blog article]: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
