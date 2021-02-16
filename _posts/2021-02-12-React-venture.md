---
layout: post
title: A journey in React ⚛ territory
color: rgb(96,216,251)
tags: [js]
---

[React](https://reactjs.org/) is a well known javascript library for building user interfaces.
React is part of the Facebook Open source, and has very good documentation to [learn](https://reactjs.org/docs/introducing-jsx.html) 📚!

You can get started with your own React application using [Create React App](https://github.com/facebook/create-react-app).
It is a boilerplate app creator, you can use it via:

```bash
npx create-react-app <your app name>
```

And here you go, a folder with your app name has been created and you can start running the default page!

## Concept

### React, JSX and Components

Basically like many other libraries, framework out there, _components_ are abstracted part containing their own logic using javascript and viw using HTML markups. 

React goes further with **JSX** (Javascript XML), because even inside of the component markup and logic are intertwined.
The example given is:

```js
const element = <h1>Hello, world!</h1>;
```

It is a perfectly valid React component, there's no real logic into it. However it's mixing **javascript** notation with **HTML markups**.
When used in browser this kind of _"new era javascript"_ is not always understood by the browser. Heck even the color highlighting is bugging here!

> That's why there are some "compiler" like [babel](https://babeljs.io/) that transforms it into a more "vanilla javascript"

To bring it back to our point.
The concept is fairly simple, React will compute the DOM (Document Object model, the web page) based on the component logic and markup and rewrite the updated parts.

### Render with ReactDOM

Here would be another example of how to render something with React if you haven't already checked the
better ones at [React doc - rendering elements](https://reactjs.org/docs/rendering-elements.html)
First we'll define another tiny component that takes a parameter:

```js
const Greeting = ({ greeting }) => <h1>{greeting.text}</h1>;
```

Great, it will render the text into what's commonly known as a title with the `<h1>` markup.
To render it we would do:

{% raw %}
```js
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <React.StrictMode>
    <Greeting greeting={{ text: 'Welcome to React' }} />
  </React.StrictMode>,
  document.getElementById('root')
);
```
{% endraw %}

That means, ReactDOM will look for an element with the `root` id and attach our component to it.
In the end it will amount to something like:

```html
<div id='root'>
    <h1>Welcome to React</h1>
</div>
```

It doesn't do anything impressive yet, so let's dive further into the possibilities of React components.

## Components

While exploring React and stumbling upon issues, I came across [Robin Wieruch's blog](https://www.robinwieruch.de/react-component-types) 
and it is full of nice article on how to do about anything in React 👌 so check it out for some real cool stuff.
Now let's see how to write some components.

### Vocabulary

Here is to layout some of the vocabulary around components that are peculiar to [javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript) or React.
So let's just add some simple definition on those:

  - **props**: Props are like the parameters you pass down a function, or component. It stands for property.
  In React they must be [read only](https://reactjs.org/docs/components-and-props.html#props-are-read-only), you don't modify the props directly.
  - **state**: Talking about stateful and stateless, state represents the current value(s) of a component. The state is like a "private value" and can't be updated [directly](https://reactjs.org/docs/state-and-lifecycle.html#using-state-correctly).
  You need to use something like `setState()` so each time you update the state, it will render your component with its new value.
  - **arrow function**: Arrow function is used to define anonymous lambda function with less [syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).
    - You can do it with:
    ```js
     let sum = (a, b) => ( a + b );
     sum(1, 3) // returns 4
    ```
    
  - **high order function**: They take a functions as parameter and return a function as a result (like map, reduce or filter). 
  They pertain to the functional programming world. 
    - You could take the above example and turn it into:
    ```js
    const sum = (x) => (y) => x + y;
    sum(1)(3); // returns 4 
    ```
    
    - Or for another example:
    ```js
    let square = (x) => (x * x);
    const twice = (f) => (x) => (f(f(x)));
    twice(square)(3) // returns 81
    ```
    
  - **export and import**: To use function, components from other file you need to `import` them. 
  But for those to be "importable" you first need to `export` them. Basically making them "public" and visible from outside their file.
  There can be only one `export default` that will get referenced as the file name.
    - If you want to export more than one function, you can always do:
    
    ```js
    const NamelessService = {
      doStuff,
      makeThings,
    };
    
    export default NamelessService;
    ```
    
    - And use it in another file like:
    
    ```js
    import NamelessService from '../NamelessService';

    NamelessService.doStuff()
    ```
    
  - **destructuring arrays**: Behind this name is hidden the `{ }` brackets notation and `...` three dot notation. They are very common while manipulating react components.
  Basically you can cherry pick from an array, the data you want using the brackets. The three dots will is an accessor to the array to take all or what's left in it.
    - Here some [examples](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) on how to use those operators.
    ```js
    let values = {a: 10, b: 20, c: 30, d: 40};
    let {a, b, ...rest} = values;
    // returns a = 10, b = 20 and rest = { c: 30, d: 40 }
    console.log({ rest });
    // { rest: { c: 30, d: 40 } }
    ```

That's a lot to digest, you can click on the links for more examples, or documentation.

### Example components

So now that we know what we are talking about let's dive into the main type of components,
how do we create and them and why should we do it that way.

#### Functional components

Usually those components are pretty straightforward and doesn't require much logic to them.
They leverage the abstraction / encapsulation permitted by react to reduce the size of bigger component by breaking them down into small pieces.

If you remember, the `Greeting` was an example of a very simple functional component in the first part.
But you can make it a bit more intelligent by leveraging some react tools such as the [hooks](https://reactjs.org/docs/hooks-rules.html#gatsby-focus-wrapper):

```js
import React, {useEffect, useState} from 'react';

export default function FunctionalComponent() {
  const [value, setValue] = useState('default value');

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts/')
      .then(res => res.json())
      .then((result) => {
        setValue(result[0].title);
        }
      )
  }, []);

  return <p>{value ? value : 'not received'}</p>
}
```

This component use the `useEffect` hook to update itself (via fetching some info) and we use `useState` hook to create and save the state of the component.

You can also have high order component when for example you have a list for data for which each will be rendered via another component.
So once you mastered the syntax, you'll be able to go fancy with those.


#### React Class Component

The class component makes up for more controlled (handle props, state and lifecyle methods) and verbose component.
Here is an example component with it's most used capabilities:


```js
import React from 'react';

export default class ClassComponent extends React.Component {
  constructor(props) {
    super(props); //Copy the received props to this.props
    this.state = {
      value: 'default value'
    };
  }

  componentDidMount() {
    console.log('I was mounted on screen');
    // props.value needs to exist, like props = { value: 'props value' }
    this.setState({value: this.props.value});
  }

  componentWillUnmount() {
    console.log('better do some clean up to avoid a memory leak')
  }

  render() {
    return <p> Render my {this.state.value} </p>
  }

}
```

The props, and state gets to be managed within the constructor. And you have access to the _lifecycle methods_, those methods
are called automatically. A component is said to be mounted when it's in the DOM.

You can use this component easily passing down some props name value using:

```html
<ClassComponent value={'props value'}/>
```

You can see how to convert a functional component to a class component on the [react doc](https://reactjs.org/docs/state-and-lifecycle.html#converting-a-function-to-a-class)
And the best way to learn is always to try it out by yourself so let's get coding 👩‍💻👨‍💻!
