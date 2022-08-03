---
layout: post
title: React and redux
color: rgb(166,10,111)
tags: [js]
---

## Introduction

[Redux] is a self branded as "_A Predictable State Container for JS Apps_", which is fancy but cryptic.
So let's have an overview of Redux within a React application!

### A bit of redux history

To put it all into perspective, because Redux was not born out of the blue, but based on React and the 
"Flux architecture" which spawn the concepts used in Redux.

- 2013: Initial release of [React][6]
- 2014: Initial release of [FLux][8]
- 2015: Creation of [Redux][5]
- 2016: Facebook hires one of Redux' [creators][5] (Dan Abramov)
- 202: Flux gets [deprecated][7] in favor of Redux and other alternatives

Redux has an immutable store, [actions] trigger changes and [reducers] contains the logic to return a new
updated state. The redux store principle looks like an event driven architecture.
It has become lighter and easier to use compared to Flux which explains its popularity

You don't necessarily need redux in your React application, simple use case works perfectly fine
without the overhead.

[Redux] is useful when you need to modify and access data in multiple components, this way you don't have
to pass down props just to reach the grand child component.
You have more freedom on the actions you want to perform on your data through the reducers which can
match multiple use case or complex data flows.

### flow

Let's see the interaction of Redux with React-Redux within an App displayed in a web Browser.
This is a bit simplified, and very decomposed so you can see each interaction.

<div class="mermaid">
sequenceDiagram
   actor Browser as Browser/User
   Participant React
   Participant ReactRedux as React-Redux
   Participant Action
   Participant Store
   ReactRedux -->> Store: ... Subscribe
   ReactRedux ->> React: Provides selected part<br>of the state to the component
   Note left of ReactRedux: Store starts with initialState
   React ->> Browser: Render the App
   Browser ->> React: Click on Save button
   opt : Ducks pattern with Slice : 
    React ->> Action: Dispatch the SAVE_ACTION
    Action ->> Store: Picked up SAVE_ACTION
    Store ->> Reducer: Send current state <br>and action's payload
    Reducer ->> Store: Return a new state
   end
   Store ->> ReactRedux: State has changed
   ReactRedux ->> React: Tell impacted component <br>to re-render
   React ->> Browser: Re-render part of the App
</div>

In our case, we're going to use the `createSlice` later on from the toolkit, which is perfect for most usecase and hide
parts of the complexity.

### Vocabulary

- **Actions**: They represent an event happening in your app with a type (ex "_AddTodo_") to describe what is happening and sometimes
a payload as well (ex: `{ text: 'Feed the 🐕' }`) which contains extra data to describe the change.

- **Store**: It is where the state is saved, provides some hooks to get the state, subscribe to a change or dispatch new modification

- **Immutability**: It means that you can't modify it, you need to copy and replace it. This peculiarity makes it more performant
since you don't have to check what has changed.

- **Reducers**: They apply the logic to change the state, (while keeping the data immutable). The reducers need to be
"_pure_" which means they don't try to change the state directly (As specified in the [best practices]) but return 
the copy of the state with the modified data.

- **Slice**: It is a term that has been used when splitting the "_root_" state of the store, it does not only represent
the state, but also the reducer logic and actions (following the [ducks] pattern). 
They are usually bundle altogether as a separate file.

### Installation

Find the source code in GitHub, if you don't know where to get started at [sylhare/React][3],
or follow all the steps of the redux's [getting started][0] page which contain a section from scratch.
In our case, we are going to use the latest version of redux and the recommended approach is to use
the toolkit. And since we want to use it with React, we'll also add the `react-redux` which provides
some hooks to use with redux.

> Note: `redux` is a peer dependency of `react-redux` and `@reduxjs/toolkit` and would be installed automatically
> with recent version of npm. Though, having one version installed in package.json for all is useful.

In the end use [npm] or [yarn] as you see fit in your project to install/add the necessary dependencies
to our project in our package.json:

```bash
npm install @reduxjs/toolkit react-redux redux
```

And with that added, we should have our project now set to follow the [best practices] for the next steps.

## Implementation

We'll follow the redux [documentation][4], I have extracted some bits here and there to understand the structure,
but if you want to explore it on your own, you can patch up the doc's example as well, they sometime need some tweaks
to be combined, but nothing you can't overcome. 💪 

### Slice and reducers

Since we have the toolkit, we are going to [create a slice][2] which makes it all easier, less boilerplate code
to make your store work.

```ts
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: state => { state.value += 1 },
    decrement: state => { state.value -= 1 },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    }
  }
})
```

Seems like we mutate a state which is against the [best practices]!? But rest assured that the slice we're doing
is using [immer] and follow the [ducks pattern] by default which makes it all a bit magic ✨ but also much easier
to use.

In this case the pattern is made possible because the reducers are declared within the slice and the actions are the
name of the slice slash reducer, so for `increment` it's `counter/increment`.

The `createSlice` will set the initial state from the _initialState_'s value and will use the same type; `CounterState`
in this case for our counter slice.

```ts
interface CounterState { value: number }
const initialState: CounterState = { value: 0 }
```

It's Typescript, so it's better to use some types, or in this case an interface for our state.

### Store and hooks

Now that our slice is ready, let's configure a store:

```ts
import { configureStore } from '@reduxjs/toolkit';
import { counterReducer } from './counter/slice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
```

The type exports are to make our lives easier in typescript, as well as those hooks
that we will be using in our components later on:

```ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

Let's describe them, the name should be good indication as to what they are supposed to do. 
Since those are hooks, we have the prefix `use` which is common in React:

- `useAppDispatch`: takes a reducer as parameter to modify our state.
- `useAppSelector`: takes a method as parameter to select and return part of the state.

### Add a Provider to your App

The _Provider_ is a React-redux component that will enable you to use the store within your app.
Put it at the root of your React application, where you render it:

```tsx
import { Provider } from 'react-redux';

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App/>
    </Provider>
  </React.StrictMode>
);
```

You pass as props the single redux store of your application, the one we have created just before.

### Use the store in a component

Let's create a _Counter_ component like in the [documentation][4] that will show both the counter 
saved value from the store and a button to update it:

```tsx
export const Counter = (): JSX.Element => {
  const count = useAppSelector(state => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <h2>Counter is at {count}</h2>
      <button onClick={() => dispatch(increment())}>+1</button>
    </div>
  );
}
```

On each click the button is going to call the dispatch hook and increment the counter's value by one
as designed in our reducer. Once updated the component will re-render and use the app selector hook
to get and display the counter's new value from the store. 

## Test

### Render wrapper

To test our components correctly, we'll need to have the store while rendering them. Instead of adding
a Provider component each time, we're going to create a render method that will extend the current test 
render function.

It will take as an argument a store and a preloaded state to ease the testing based on the store's state
and wrap the component with the necessary Provider one:

```tsx
export function renderWithProvider(
  ui,
  {
    preloadedState = { counter: { value: 0 } },
    store = configureStore({
      reducer: { counter: counterReducer },
      preloadedState,
    }), ...renderOptions
  } = {}
): RenderResult {
  const Wrapper = ({ children }: PropsWithChildren<{}>): JSX.Element => (
    <Provider store={store}>{children}</Provider>
  );

  return testRender(ui, { wrapper: Wrapper, ...renderOptions });
}
```

As you can see, we're not using the actual store, but fear not with a bit of refactor you could use the 
same `setupStore` function in both the test render and the prod code. Check it out in the [test documentation][1].

But for now, I am leaving as is because it makes it easier to integrate with what we've been doing so far.
You can use this wrapper trick with if you are using [React router][10] as well. 👍

### Component test

Now let's write our first test to see if the store gets read correctly:

```tsx
it('renders the counter page with the correct value', () => {
  renderWithProviders(<Counter/>, { preloadedState: { counter: { value: 42 } } });
  expect(screen.getByText(/42/)).toBeInTheDocument();
});
```

We set the preloaded state to have a counter value of `42`, then we are checking that 42 is in the page.
Obviously the test pass, depending on your use case, you may want to have something less vague than
looking for a text in the page for your test. 😅 

Now let's test our button to make sure it does work when clicking on the button:

```tsx
it('increment by one the counter', () => {
  renderWithProviders(<Counter/>, { preloadedState: { counter: { value: 1 } } });
  const incrementButton = screen.getByRole('button', { name: '+1' })
  fireEvent.click(incrementButton);
  expect(screen.getByText(/2/)).toBeInTheDocument();
});
```

Here we render the store with a different value, then we find the _+1_ button to and click on it to increment
the value of our counter.
Then same as before we see that the value when from 1 to 2. 

### Reducer test

Our reducers are pretty basic, but in the case where they grow you should have dedicated tests for them as well,
testing each reducer use case through the React render way may become very hard to maintain.

```ts
it('decrements', () => {
  expect(counterReducer(initialState, decrement()))
    .toMatchObject({ value: -1 });
});
```

For example here we are testing our `counterReducer` from our store. We pass it a state like it the store would do, 
with an action here the `decrement` on, and we assert that it returns an updated state.
The initial state has a value of _0_, decrementing yield _-1_ and our test is passing!


[0]: https://redux.js.org/introduction/getting-started
[1]: https://redux.js.org/usage/writing-tests
[2]: https://redux-toolkit.js.org/api/createslice
[3]: https://github.com/sylhare/React
[4]: https://redux.js.org/usage/usage-with-typescript
[5]: https://en.wikipedia.org/wiki/Redux_(JavaScript_library)
[6]: https://en.wikipedia.org/wiki/React_(JavaScript_library)
[7]: https://github.com/facebook/flux/releases/tag/4.0.0
[8]: https://github.com/facebook/flux
[10]: {% post_url 2022/2022-07-08-React-router %}
[npm]: https://docs.npmjs.com/getting-started
[yarn]: https://classic.yarnpkg.com/en/docs/getting-started
[slice]: https://redux-toolkit.js.org/usage/usage-guide#creating-slices-of-state
[immer]: https://immerjs.github.io/immer/
[Redux]: https://redux.js.org/
[ducks pattern]: https://github.com/erikras/ducks-modular-redux
[best practices]: https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic
[actions]: https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers#designing-actions
[reducers]: https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers#writing-reducers
