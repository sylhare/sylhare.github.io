---
layout: post
title: State management with React Context Provider
color: rgb(97, 136, 140)
tags: [ react ]
---

## React Context Provider

### History

The Context API became a stable public API in **React 16.3** ([March 2018][1]). Before that, an experimental context
mechanism existed, but it was undocumented and strongly discouraged because it could break between minor versions.

The `useContext` hook arrived in **React 16.8** ([February 2019][2]) with the rest of Hooks. Before Hooks, context
consumption relied on either `<Context.Consumer>` (render-prop) or `static contextType` in class components, both of
which were more verbose and harder to compose.

The pattern used in this document (`createContext` + `useContext` + custom hook) has been the recommended approach since
React 16.8 and remains valid through React 19.

### What is a Provider?

A [React Context Provider][3] is a component that makes a value available to every component in its subtree, 
without passing props through intermediate layers. This avoids prop drilling[^1].

The mechanism has three parts:

1. **Context** — the container created with [`createContext()`][4]. It defines the shape of the shared value.
2. **Provider** — a component that wraps part of the tree and supplies the actual value.
3. **Consumer** — any component inside the tree that reads that value, typically via [`useContext`][5].

```jsx
<ValueProvider>          ← supplies { value, setValue }
  <ParentContent />      ← reads it via useValue()
    <ChildComponent />   ← reads it via useValue() too
```

Both `ParentContent` and `ChildComponent` read the same state. When either calls `setValue`, both re-render with the
updated value.

### How to Create a Provider

#### 1. Define the context shape

Create a context with values that will be passed by the provider.

```tsx
// ValueContext.tsx
import { createContext, useContext, useState } from 'react';

interface ValueContextType {
  value: string;
  setValue: (v: string) => void;
}

export const ValueContext = createContext<ValueContextType | null>(null);
```

Initialize with `null` instead of a default object. This allows the custom hook guard to fail fast when a component is
rendered outside the provider.

#### 2. Write the Provider component

The provider owns the state and exposes it through context:

{% raw %}
```tsx
export function ValueProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState('');
  return (
    <ValueContext.Provider value={{ value, setValue }}>
      {children}
    </ValueContext.Provider>
  );
}
```
{% endraw %}

#### 3. Export a custom hook

Wrap `useContext` in a named hook. This keeps imports clean and gives one place for safety checks:

```tsx
export function useValue(): ValueContextType {
  const ctx = useContext(ValueContext);
  if (!ctx) throw new Error('useValue must be used within a ValueProvider');
  return ctx;
}
```

This guard turns a silent `undefined` bug into an immediate, explicit error.

### How to Use It

#### Wrap the subtree with the Provider

Only wrap the part of the tree that needs shared state. The provider does not need to live at the app root.

```tsx
// page.tsx
import { ValueProvider } from './ValueContext';
import { ParentContent } from './ParentContent';

export default function ContextDemoPage() {
  return (
    <ValueProvider>
      <Component />
    </ValueProvider>
  );
}
```

You can also wrap providers around providers.

#### Consume in a component

Any component under `<ValueProvider>` can call `useValue()`, no matter how deep it is:

```tsx
// Component.tsx
import { useValue } from './ValueContext';

function Component() {
  const { value, setValue } = useValue();

  return (
    <div>
      <p>Current value: {value}</p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Update shared value from parent..."
      />
    </div>
  );
}
```

When the component's input changes, `setValue` updates the state inside `ValueProvider`. 
React then re-renders all subscribers, so all components reading from the context stay in sync.

### Testing

Testing context-connected components is straightforward: render them with the real provider. 
No mocking is required.
This validates initialization, updates, and re-renders through the exact production path. Examples below use
[`@testing-library/react`][9] and [`@testing-library/user-event`][10].

#### Testing a component in isolation

Wrap the component in `ValueProvider` directly in the test. The provider starts with an empty string.

```tsx
// tests/context-demo/Component.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from '@/app/context-demo/Component';
import { ValueProvider } from '@/app/context-demo/ValueContext';

describe('Component', () => {
  it('updates the shared context value when the input changes', async () => {
    const user = userEvent.setup();
    render(
      <ValueProvider>
        <Component />
      </ValueProvider>
    );
    const input = screen.getByTestId('child-input');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
    expect(screen.getByTestId('child-value-display')).toHaveTextContent('hello');
  });
});
```

Mocking context is possible, but it replaces the real `useValue` implementation with a stub.
We would rather avoid it since using the real `ValueProvider` means:

- Tests execute the same behavior as production.
- Provider bugs (bad initial state, missed updates) are detectable.
- Tests stay stable across internal refactors (no need to update the provider's mock)

## React Context vs. Redux

Both approaches solve shared state, but they differ in scope, structure, and tooling.

We could wonder if it means [Redux][20] which is close to a _state database_
(one global tree with explicit updates through actions and reducers) is becoming obsolete.

### Quick comparison

| Feature               | Context                                                    | Redux                                                             |
|:----------------------|:-----------------------------------------------------------|:------------------------------------------------------------------|
| **Setup**             | Lightweight, no extra dependency.                          | Additional setup (store, reducers, actions, selectors).           |
| **DevTools**          | No built-in time travel or action log.                     | Mature debugging and action history.                              |
| **Performance model** | All consumers re-render when the provided value changes.   | Selectors support fine-grained subscriptions.                     |
| **Async workflows**   | Manual orchestration (useEffect, custom hooks).            | Middleware patterns.                                              |
| **Typical scope**     | Feature-local or subtree-local state.                      | Application-wide shared domain state.                             |
| **Best fit**          | UI state (theme, local feature state, simple auth wiring). | Complex domain state and larger teams needing strong conventions. |


There are also some libraries in between the React context and [Redux][8], for example:
- [Zustand][6] which is a lightweight store: define state and actions once, then use a hook to read and update from any component.
- [Jotai][7] which uses atoms: define small independent pieces of state and combine them into complex structures.


[^1]: Prop drilling is the process of passing props down through multiple layers of components.

[1]: https://legacy.reactjs.org/blog/2018/03/29/react-v-16-3.html "React v16.3 release notes — introduction of the stable Context API"
[2]: https://legacy.reactjs.org/blog/2019/02/06/react-v16.8.0.html "React v16.8 release notes — introduction of hooks including useContext"
[3]: https://react.dev/reference/react/createContext "React docs — createContext"
[4]: https://react.dev/reference/react/createContext "React docs — createContext"
[5]: https://react.dev/reference/react/useContext "React docs — useContext hook"
[6]: https://zustand.docs.pmnd.rs "Zustand documentation"
[7]: https://jotai.org/docs/introduction "Jotai documentation"
[8]: https://redux.js.org/introduction/getting-started "Redux documentation"
[9]: https://testing-library.com/docs/react-testing-library/intro "React Testing Library documentation"
[10]: https://testing-library.com/docs/user-event/intro "user-event documentation"
[20]: {% post_url 2022/2022-08-03-React-and-redux %}