---
layout: post
title: Introduction to React router
color: rgb(4,178,217)
tags: [js]
---

Assuming you have been interested in React and started creating simple apps, you now want to make it
more than a single web page by adding some routing into the mix.
So take your newly React template App and let's see how we can do some React Router magic in it. ✨

If you're new to react, check this [article][10] to learn more about it!

## Installation

Find the source code in GitHub, if you don't know where to get started at [sylhare/React][3].
Once you have you project set up, install the [react-router-dom][1] dependency via:

```bash
npm i --save react-router-dom
```

Let's then review how we can implement it, and have a simple example on how to test it.
We'll be using the code snippet from the [documentation][2].
All the example will be shown using the latest version **v6** of React router.

## Implementation

### Web Browser

Since it's a web app for a web browser, it's best to use the [BrowserRouter] which is tailored for the job.
(There's a native router for React Native app as well).
But before that, we need to create a component with the routes.

```tsx
export const RoutedApp = (): JSX.Element => (
  <div className="App">
    <h1>Welcome to React Router!</h1>
    <Routes>
      <Route path="/" element={<Learn/>}/>
      <Route path="/home" element={<Home/>}/>
      <Route path="about" element={<About/>}/>
    </Routes>
  </div>
);
```

The routes component takes multiple route component, it does not render into anything visible on the html page,
but enables you to navigate to each route's relative path.
The `element` is the component you'll land into when following the path and is passed as a props.
Here is a component example:

```tsx
export const Home = (): JSX.Element => (
  <div data-testid={'home'}>
    <h2>Welcome to the homepage!</h2>
    <nav> <Link to="/about">About</Link> </nav>
  </div>
);
```

As you can see in our component we use [Link] which is a component that lets us use the router's capabilities
to navigate to another page. It renders as a html link.

But that's not all, in order for your routes to be working, you still need to place them within a router.
Usually, you put the router at the root of your application and not directly within your component 
(it's better for tests) such as: 

```tsx
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <RoutedApp/>
    </BrowserRouter>
  </React.StrictMode>
);
```

If you need/want to test the whole app **with** the router, you can have a `Root` component to extract it and then pass 
it to the ReactDom function which is responsible to initiate the React app.

### With parameters

Now that we have seen how to make routes and a use the router, let's see how we can leverage parameters
within the path. Check this example:

```tsx
<Route path={`/profile/:id`} element={<Profile/>}/>
```

Which will redirect and associate a variable `id` to the uri's value "_/profile/...anything..._" so that you
can gather it inside the component:

```tsx
import { useParams } from 'react-router-dom';

const Profile = (): JSX.Element => {
  const { id } = useParams();

  // ...rest of the implenentation
};
```

So for "_/profile/1_" the id will be resolved as `1` using the [useParams] hook. 
If you are wondering what to do with the id, as an example you could use this id to fetch the profile
from a database. 🤷‍♀️

## Test

### With Router

For the test we are using the [Router] component which is a low-level interface shared by all router component
like the [BrowserRouter] we are using in our implementation which uses the actual `window.history` an
object that is not the easiest to work with in tests.

For this router, besides the necessary testing libraries (jest, @testing-library/...) you will also need
[history] which lets you manage your session's history and is compatible with React Router.

```bash
npm i --save-dev history
```

I use it only for my test, so I use the `--save-dev` to put it inside my `devDependencies` in my package.json
file. This is a preference, so the packages don't get mixed up.
If it is a "production" application, less dependency means less to load theoretically.

We can then create a wrapper for our component which only has the routes, so we can reduce the boilerplate
for each test:

```tsx
import { createMemoryHistory, MemoryHistory } from 'history';
import { Router } from 'react-router-dom';

const RoutedComponent = (history: MemoryHistory): JSX.Element => (
  <Router location={history.location} navigator={history}>
    <RoutedApp/>
  </Router>
);
```

Now let's write our test, for each test we'll instantiate history, so we can have it in the desired state.

```tsx
describe('Routed App', () => {
  let history: MemoryHistory;

  beforeEach(() => {
    history = createMemoryHistory();
  });

  it('renders the root page', () => {
    history.push('/')
    render(RoutedComponent(history));
    expect(screen.getByTestId('learn')).toBeInTheDocument();
  });
});  
```

### With MemoryRouter

If you do not want to install [history], you can also do the test same tests with [MemoryRouter] which
takes the path as a props.
You could wrap the component as well as before, but for the sake of simplicity here is an example:

```tsx
it.each(['home', 'about'])('routes to the correct page with MemoryRouter', (uri: string) => {
  render(
    <MemoryRouter initialEntries={[`/${uri}`]}>
      <RoutedApp/>
    </MemoryRouter>
  );
  expect(screen.getByTestId(uri)).toBeInTheDocument();
});
```

This test makes sure that the library works and direct us to the right page given the current path.
It usually gets more interesting when you have parameters in the uri that may impact your component's
rendering.

Now you should have enough information to get started, the [documentation][1] for React router is very 
well-made, rich with examples, so have a look at it whenever you feel stuck!

[history]: https://www.npmjs.com/package/history
[Router]: https://reactrouter.com/docs/en/v6/routers/router
[MemoryRouter]: https://reactrouter.com/docs/en/v6/routers/memory-router
[BrowserRouter]: https://reactrouter.com/docs/en/v6/routers/browser-router
[useParams]: https://reactrouter.com/docs/en/v6/hooks/use-params
[Link]: https://reactrouter.com/docs/en/v6/components/link
[1]: https://reactrouter.com/docs/
[2]: https://reactrouter.com/docs/en/v6/getting-started/installation#basic-installation
[3]: https://github.com/sylhare/React
[10]: {% post_url 2021/2021-02-12-React-venture %}
