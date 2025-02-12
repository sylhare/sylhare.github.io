---
layout: post
title: Interactive React Testing
color: rgb(2, 94, 115)
tags: [react]
---

Welcome into the React Testing part 2! If you've missed out part 1, that's because it is obnoxiously but simply named:
"[Static React Testing][1]".
In the previous article we talked about the library used, the setup and some basic API offered by the [testing library].
So if you don't remember or want to check it out real quick, it's just [one click][1] away.

## Interactive testing

By interactive I mean that you are going to trigger some actions on the rendered component and expect it to behave in
a certain way.
The assertion will be the same as before, checking for a component to be visible by its label, id, etc. What's new in
the article is how we are going to interact with the component from within our unit test.

## Testing API

### Setup

The setup will be the same as the previous [article][1], we will have one component, and we are going to re-render it
before each test, so we start from a clean slate.
Don't forget the useful development dependencies we will be using (in addition to what you need in any React project):

- [jest], [@testing-library/react], [@testing-library/jest-dom], [@testing-library/user-event]

You can always find some live example in [sylhare/React], you may need to dig a bit though, I sometime refactor the
folders.

### Update an input

For this series of test, we are going to have a simple stateful component with an _input_ field.
When that field is updated, the `onChange` function will be called, and it will update the value via its setter function.

```tsx
const Example = (): JSX.Element => {
  const [value, setValue] = useState('value-1');
  return (
    <div>
      <input type='text' onChange={(e) => setValue(e.target.value)} id='input' value={value}/>
    </div>
  );
}
```

We are using the `useState` hook from React in this component and displaying within the input, the value itself.

#### With fireEvent

By default, events follow this structure:

```json
{
  "event": {
    "target": { "value": "value" }
  }
}
```

The value of the event when it's a number is usually stringified, so make sure you always send a string in your test, or
you might have some cast errors otherwise.
We will send the event directly to the `onChange` function of the input and assert that it has changed:

```ts
it('updates an input with fire event', () => {
  fireEvent.change(screen.getByDisplayValue('value-1'), { target: { value: 'new value' } });
  expect(screen.getByDisplayValue('new value')).toBeVisible();
  expect(screen.queryByDisplayValue('value-1')).toBeNull();
})
```

Now the component is displaying its "_new value_" and the old value "_value-1_" is not visible when queried.

#### With userEvent

The difference between `fireEvent` and `userEvent` is that one of them forcefully change the value by sending/firing the
expected event, while the other mimics a user and will send all the events a normal user would send to make the change.

The _userEvent_ is meant to be closer to reality, if the displayed value is `hello`, and the user types ` world`, then
the resulting value should be `hello world`:

```ts
it('updates an input with user event', () => {
  userEvent.type(screen.getByDisplayValue('value-1'), ' new value');
  expect(screen.getByDisplayValue('value-1 new value')).toBeVisible();
  expect(screen.queryByDisplayValue('value-1')).toBeNull();
})
```

That's what we can see here, because we `type` on the existing field. By typing "_ new value_" into the input field, the
user actually sent an event for each key pressed which amount to the last one being with the value "_value-1 new value_".

With `userEvent` you may find some edge case regarding your input, but you may find it cumbersome to use when wanting to
test your component with a specific input.

### Click on a component

Besides, inputting some data, you can also click on elements. Although for our examples we are going to click on HTML 
buttons, you can as well click on other HTML elements. Make sure you have an `onClick` property on them which will
handle the click event.

For this example, we are going to pass a function to the component. It is usually not necessary because you will likely
handle click event via handlers or hooks within the component. This is a synchronous call.

```tsx
const Example = ({ onSubmit }): JSX.Element => {
  return (
    <div>
      <button aria-label='reactive' onClick={onSubmit}>Submit</button>
    </div>
  );
}
```

No surprises here, when you click the "_Submit_" button, it should call the `onSubmit` method. To test that behaviour, 
we are going to mock that method. For mock techniques with jest you can refer to this [article][2].

```tsx
it('clicks on a button', () => {
  const mock = jest.fn();
  render(<Example onSubmit={mock}/>)
  fireEvent.click(screen.getByText(/submit/i))
  expect(mock).toHaveBeenCalledTimes(1)
})
```

In this test, for the article I have the render with the mock method as props of the Example component.
Using `fireEvent` I click on the selected button and assert that my mock function has been called once.

### Click with asynchronous

For that example, although we're still passing a method to be called, the important part is that now clicking on the
button should trigger an asynchronous reaction.

For example, you will need an asynchronous behaviour when you will be sending some data over to your backend service.

```tsx
const Example = ({ onSubmit }): JSX.Element => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const asyncSubmit = () => {
    setTimeout(onSubmit, 1000);
    setIsSubmitted(true);
  }
  
  return (
    <div>
      <button aria-label='async' onClick={asyncSubmit}>Send</button>
      { isSubmitted && <div>The request has been submitted!</div> }
    </div>
  );
}
```

We are also leveraging a state variable called "_visible_" which when true will display 
"_The request has been submitted!!_" phrase on your component. This syntax is used to conditionally render parts of your
component.

#### Asynchronous method has been called

First we can assess that once we clicked on the button then the mock method have been called using this test, only 
using methods from the testing library:

```ts
import { fireEvent, screen, waitFor } from '@testing-library/react';

it('clicks on a button async', async () => {
  fireEvent.click(screen.getByText(/send/i))
  await waitFor(() => expect(mock).toHaveBeenCalledTimes(1), { interval: 200, timeout: 1500 })
})
```

We need an asynchronous test since we are going to wait for the assertion to be true, checking at each 200ms interval up
to the timeout at 1.5 seconds. 

The test will only fail if at the end of the timeout the assertion is still false.

#### Component did re-rendered

Using the same component, apart from the method being called there's an element of text that should be displayed once
the button is clicked.
In this test we want to make sure that it appears correctly:

```ts
it('displays after click', async () => {
  expect(screen.queryByDisplayValue('The request has been submitted!')).toBeNull();
  fireEvent.click(screen.getByText(/send/i))
  expect(await screen.findByText('The request has been submitted!')).toBeVisible();
})
```

First we make sure we can't see it using the query, then we click on the button. Now to assert that it has appeared, 
since it's an asynchronous test we don't to use `getByText` but the `findByText` method which will wait on the component
if the text is not visible at first.

This way you don't have to manually wait for re-render, it's all encapsulated within that method.

### Conclusion

Now we have seen how to use the testing library and interact with our React component. Those are simple examples to help
you get started with your own projects.

Let me know in the comment if there's another useful API from the library that you use in your tests for other cases of
interactive testing.

[1]: {% post_url 2022/2022-10-18-React-testing-static %}
[2]: {% post_url 2022/2022-09-21-Jest-testing %}
[sylhare/React]: https://github.com/sylhare/React
[testing library]: https://testing-library.com/docs/
[@testing-library/react]: https://www.npmjs.com/package/@testing-library/react
[@testing-library/jest-dom]: https://www.npmjs.com/package/@testing-library/jest-dom
[@testing-library/user-event]: https://www.npmjs.com/package/@testing-library/user-event
[@testing-library/dom]: https://www.npmjs.com/package/@testing-library/dom
[jest]: https://www.npmjs.com/package/jest
