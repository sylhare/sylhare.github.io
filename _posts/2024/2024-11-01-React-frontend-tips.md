---
layout: post
title: Tips for building React components
color: rgb(191 153 153)
tags: [react]
---

Here are some tips that I missed in my previous [React venture][12], 
I go over some React essentials, refactoring tips, testing tips illustrated with some code examples.

Now let's get to it! 🤓

## 🧰 React Functional component

In typescript, you can create functional components (FC) which can be written as:

```ts
export const Hello: React.FC<HelloProps> = ({ name }): React.JSX.Element => {
  return <div>Hello {name}</div>;
}
```

No need for a class, it's a function! The syntax might be leaner that way.
See that the `props` type is inferred using `React.FC<HelloProps>` directly from within the type of the function, 
which makes reading the parameter props straightforward, in my opinion.

For the type, it is usually written in an outside file called `types.ts` so each component files `.tsx` is only about
the component itself. 
Also, since you may have multiple components, some of them extending or implementing the same props, 
having the one used for that context in the same file makes it easier.

> ⚠️ Don't have all your components in one folder with just one `types.ts` file, try to keep the file size fairly small.

It's better to make small testable reusable components rather than try to test the whole page. 
As the page's design and button might change over time, 
the smaller components will be the building blocks of your UI and shouldn't change too much.

Check down below for some test tips!

## 🛠️ Refactor similar components

> Have you ever written (or copy/pasted) similar component with just a few strings of difference?

Annoying, isn't it? Besides the duplication in code (probably test as well), it makes the maintaining effort double!

To avoid that, there are multiple solutions which depending on the context and complexity of your component might help you reduce code waste.

### 1. Parametrised components

This pattern can be useful for very similar components.
You can use parametrised components, the aim is simple:

- Find similarities between components
- Extract them as props for each component
- Use the now refactored generic component with the differences passed as props

In the case, we can't extract the similarities as props. 
Or when that kind of refactor yields to added complexity, try out the next pattern.

### 2. Strategy pattern

You can use a strategy pattern with a bit of preparation, so I am going to add some example, so it's easier to follow.

1. First create the different strategies as an enum:
```tsx
export enum Strategy {
  EXAMPLE = 'example',
  OTHER = 'other',
} 
```
2. Create the type that will correspond to the differences between the two components that will be chosen based on the strategy:
```tsx
export type StrategyType = {
  [key in Strategy]: {
    label: string;
    component: React.JSX.Element;
    onAction: () => void;
  };
};
````
3. Now let's define the actions per components:
```tsx
export const strategyProps: StrategyType = {
  [Strategy.EXAMPLE]: {
    label: 'example',
    component: <Example/>,
    onAction: () => console.log('Example'),
  },
  [Strategy.OTHER]: {
    label: 'other',
    component: <Other/>,
    onAction: () => console.log('Other'),
  },
};
```
4. Finally, refactor the two components into a more generic one using the declared strategy:

```tsx
export interface GenericProps {
  strategy: Strategy;
}

export const Generic: React.FC<GenericProps> = ({ strategy }) => {
  const { label, component, onAction } = strategyProps[strategy];

  return (<>{component}<button onClick={onAction}>{label}</button></>);
};
```

As the previous one, this still aims to make a more generic component out of the two, but using a third object to define
the behaviour instead of passing them as props.


### 3. Extract into smaller pieces

In the case where you don't have the time, courage or confidence to refactor an old possibly complex component.
You will prefer to take smaller steps.

In this case, focus on smaller parts of the components that are similar and extract them to make smaller ones.
Components are like russian dolls, you can have one in another one and so on.
This will help reduce the size of both and possibly allow you in the future to perform an even better refactor.

In the face of a legacy, hard to maintain codebase, 
it's ok to take it slow and improve during one feature at a time the codebase. Better than doing nothing!


## 📚 React hooks

Here are some of the main built-in react hooks, and they can be a bit confusing, 
so I wanted to dig a bit deeper into them.

### With `useState`

The `useState` hook allows you to add state to your functional components in a manner similar to `this.state` in a class component, 
but with less boilerplate.
You can update state values using the function returned by useState, and re-render your component with the new state:

```ts
const [count, setCount] = useState(0);

// somewhere in your code
setCount(count + 1); // updates count value and re-renders the component
```

⚠️ However, the `useState(props)` keeps the initial state on refresh and doesn't get re-updated when the props change.
To update the _state_ you would need to use the setter return by the hook.

Now if you need to manage a state in your application across multiple components,
you can check out my article [redux][13] which explain that into details. 😉

### With `useEffect`

The `useEffect` hook allow performing an action when one of its dependency is modified.
Let's say you have `propsCount` that is used as default value for the `count` state.

If that props is modified by a parent component, the new value will **not** update the state.
To do so, you will need to use the _useEffect_ hook:

```tsx
const [count, setCount] = useState(propsCount);

useEffect(() => {
  setCount(propsCount);
}, [propsCount]);
```

Now if the `propsCount` is modified the `count` state will be updated with that new value.
But beware, if you have both components with that propsCount as a dependency of the _useEffect_ hook, you may end up
in a re-render loop when that value gets updated by the setter.
While you could '_debounce_' to help stop the loop, it won't always give the expected behaviour. 
In those cases, you should think of a way to refactor your component and unlink those states.

### With `useMemo`

Now if you need a state for a value, but you also want it to be updated based on the props, then you can use `useMemo`!
It's like a `useState` with the corresponding `useEffect` bundled together, but even better,

This hook will only recompute its value when one of its dependencies changes.
In essence, useMemo helps optimise the component by preventing complex objects or computations from being initiated on every render if there's no need:

```ts
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

This will only re-run the computeExpensiveValue function if a or b changes.
If the values of a and b remain the same between renders, useMemo will return the memoized value without re-running the computation.

## 🧪 Testing

### Checking the test component

Sometime during test, you receive a cryptic error and would like to check the actual HTML that's rendered.
What you are looking for might not be in the returned snippet already. 

In that case you can use the `debug` command:

```ts
import React from 'react';
import { render } from '@testing-library/react';

const { debug } = render(<MyComponent />)

debug() // only the first 15000 lines
debug(document.body, 50000)
```

With this command, you can log the whole HTML of the `document.body`. 
Not sure if it's going to help you, as some framework makes it harder to read through the generated HTML, 
but at least it might help figure out what is happening in your test. 

### Mocking components

Use jest to mock complicated components that wouldn't render or is not needed in what's being tested.
This becomes useful once you have a component making API calls, instead of mocking unrelated API calls, you could mock
the entire component when it is rendered but not actually necessary for another component's test.

Here is an example, but obviously that's just to demonstrate how to mock, 
not what you should do since I will be mocking the component that is rendered in the test.

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import { Hello } from './Hello';

jest.mock('./Hello', () => {
  return {
    Hello: () => <div>Mocked Hello Component</div>,
  };
});

describe('Mock test', () => {
  it('renders when mocked', () => {
    const { getByText } = render(<Hello name={'whatever'}/>);
    expect(getByText('Mocked Hello Component')).toBeVisible();
  });
});
```

To make it worth while you would mock a hello if it was a troublesome component pertaining to some parent component. 

### Asynchronous test

Sometimes, clicking on your component will trigger some asynchronous actions, 
depending on your mock and how it is designed, it will go through a loading stage before displaying the loaded view.

In those moments, quicly using `getByText` to verify the result of that asynchronous action may become flaky.
Depending on the system or the test, the component asynchronous action might have be completed, ...or not.

To remedy, you can use `waitFor` to wait for rendering, if the condition is not met (timeout of 1s per default),
the test will fail.

```tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Hello } from './Hello';

it('renders async', async () => {
  const { getByText } = render(<Hello name={'Async'}/>);
  await waitFor(() => expect(getByText('Hello Async')).toBeVisible());
});
```

If you are looking for more tips about the render API and how to validate elements in your component, 
check my[React testing][10] article.
Or if you want to check how to interact and test your component behaviour, 
check my [interactive react testing][11]article.


[10]: {% post_url 2022/2022-10-18-React-testing-static %}
[11]: {% post_url 2022/2022-11-25-Interactive-react-testing %}
[12]: {% post_url 2021/2021-02-12-React-venture %}
[13]: {% post_url 2022/2022-08-03-React-and-redux %}