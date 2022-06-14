---
layout: post
title: GraphQL API client 📡 in a React component
color: rgb(215, 132, 217)
tags: [graphql]
---

Now that we've seen how to create a GraphQL API from [Apollo Server][10], [Advanced Queries][11] and [Mutation][12] to
[Bulk Mutations][13], [custom Scalars][14] and [advanced Resolvers][15], you should have the hang of it by now.
So let's start using it in our front-end.
The technology of choice here is React to display the info, but that's just a personal choice since my 
[journey in React ⚛ territory][16], but you could use Angular, VueJS as well.

## 📦 Key libraries

We'll be using typescript and on a React base project (from the [tutorial][1]):

- [react][3]: for the whole frontend ecosystem
- [react-query][4]: to make queries (any http call) within a React component.
- [graphql-request][5]: to actually interact with some GraphQL query or mutation.
- [nock][6]: for e2e tests, to mock http response.

Everything is open source obviously, those libraries are well maintained as of now, but if you see after some time that
they don't receive any updates, feel free to switch to whichever new one is out there.
If you like one, you can give back to the community by contributing to it. 💛

## ⚙️ Implementation

We're assuming here, that you have a working GraphQL server that is advertising the used query and mutations, in our
case it would be an [Apollo GraphQL server][10].

> "Apollo to React?, ...Apollo to React! Do you copy?"

Let's see how we can bring the two together!

### Add a simple GraphQL Query

The `gql` is from graphql, so it shouldn't be anything new if you have worked with GraphQL before.
Import it from `graphql-request`, so you can define your query with a graphql fragment such as:

```ts
import { gql } from 'graphql-request';

const bookQuery = gql`
    query book($title: String!) {
        book(title: $title) {
            title
        }
    }
`
```

Then you can use `request` and your query to create an asynchronous method to execute the graphql query.
This is actually the interesting part where you call the API with the library:

```ts
import request from 'graphql-request';

const queryBook = async (title: string): Promise<BookData> => request(endpoint, bookQuery, { title })
```

The last parameters is to pass _variables_ which will then be interpreted in the query fragment.
The `request` will return the value within `data` defined as `BookData`:

```ts
interface BookData {
  book: Book;
}
```

Now we just need to add this query into a hook in order to use it efficiently within our React component.
The hook is almost mandatory, because it makes it so much easier to handle asynchronous call in our component.

### Create a hook

For the hook, we'll use `react-query` which is a wrapper for asynchronous call like GraphQL queries, for that all we
need to do is call our GraphQL query within the `useQuery` method:

```ts
import { useQuery, UseQueryResult } from 'react-query';

export const useQueryBook = (title: string): UseQueryResult<BookData | undefined> => {
  return useQuery<BookData, Error>(`query book ${title}`, () => queryBook(title), {});
};
```

With that you can use the hook within a component!
For [mutations][7] which you may want to trigger at the click of a button, you can wrap them with `useMutation` instead, 
and then call the `mutate` asynchronous function to make the actual call.

### Add it to your component

Let's create a basic React component that will render our book:

```tsx
export function BookDisplay(): JSX.Element {
  const { data, isLoading, isError } = useQueryBook('Book 1');
  if (!data) return (<div> No books </div>)
  if (isError) return (<div> Error! 📖 + 🔥 = 😵 </div>)
  if (isLoading) return (<div> Loading... </div>)

  return (
    <div>
      <ul>
        <li key={1}>{data.book.title}</li>
      </ul>
    </div>
  );
}
```

As you can see the wrapper gives us some nice features like `isLoading` and `isError` so that you can render your
component accordingly.
Once the data is fetched successfully, it will render your component with it.

## 🔬 Testing

The hook should be pretty basic, any other logic should be unit tested within the component tests, or some helper 
functions.
Consider this one more as a contract test. I kept it simple here.

### Use nock for e2e tests

For some really basic e2e tests, you can use `nock` which is a library providing some simple tools to mock your 
backend apis.
This is an alternative to mocking the whole hook with [jest][8], at least here you can test the basic functionality of 
your hook.

### Create a simple mock server 

There are a lot of other ways you can fake a web server, like having an actual _fake_ GraphQL server. But in our case,
we'll use `nock` as a dummy web server that sends back some pre-entered data:

```ts
import nock from 'nock';

nock('http://localhost')
  .post('/graphql')
  .reply(200, {
    data: { book: { title: 'title', author: { name: 'author' } } }
  });
```

As you can see, there are no checks on the schema since we mock the answer, this solution is more for a simple test.

### Create a test wrapper for your hook

The hook is supposed to be used within a component, so the best way to test it would be while it's being used within it.
And for that you'll need the react-query's `QueryClientProvider` component and a `queryClient`.

You can leave it as the bare minimum for `react-query`, the goal here is to test the hook, no need to add any extra 
components:

```tsx
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
});

const wrapper = ({ children }: { children: React.ReactNode}): JSX.Element => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
```

I found that the `{ suspense: true }` option for the query client makes the test more predictable when testing for the
fetched data.
Let's see how this wrapper will be used when writing the test!

### Write a simple test

We're using [jest][8] for the base syntax with extra things from the React [testing library][9], nothing out of the
ordinary in the React world.
You can test your hook with `renderHook` which will wrap the hook with our `wrapper` inside a React component:

```ts
import { renderHook, waitFor } from '@testing-library/react';

it('should query a book', async () => {
  const { result } = renderHook(() => useQueryBook('title'), { wrapper });
  await waitFor(() => result.current.isSuccess);
  expect(result.current.data?.book).toEqual({ title: 'title', author: { name: 'author' } });
});
```

Since you are making a http call, you need to wait for the result. Make sure your test is asynchronous and is waiting for
the call to be successful before asserting anything, or you'll get `undefined`.

If you are working with GraphQL data, the best would be to have everything built from the schema you are consuming, so
that your tests can be created from it ensuring you're dealing with the right interface.

## 🚚 Batching request

When you need to combine, or merge multiple graphql operation into one call.
There's no need to add a new library or make complex manipulation of the GraphQL schemas because it's already included
in the `graphql-request` library, and it's pretty neat.

You can use it with `useQuery` or `useMutation`, the only difference if you want the call to happen on mount or
triggered by an event. Bottom line, for query; _useQuery_, for mutation; _useMutation_.
You could mix them but the `useQuery` has a cache by default which might produce some undesirable behaviour 
when trying to mutate something.

### GraphQL query

Here's an example creating multiple books on our API in a React hook using `react-query` and `batchRequests` from 
`graphql-request` in typescript.
First we need our mutation gql such as:

```ts
const addBook = gql`
    mutation addBook($input: AddBookInput){
        addBook(input: $input) {
            book { title, author { name } }
        }
    }`
```

Here we'll use only one mutation to create book, we could define other mutation, like create author or update book in
different fragments.
It all depend on your use case and the granularity of your mutations.

### Create the hook

For our batch creation, it's better to have `useMutation` so we have control as to when we want those books 📚 to be
created.
As you see, there's no need to alter the mutation for the batch request, it will be done by the library dynamically, now
you can create multiple book via the hook:

```ts
export const useAddBooks = (): useMutationResult<AddBookData[] | undefined, Error, void> => {
  return useMutation<AddBookData[], Error>('addBooks',
    async () => batchRequests(endpoint, [
      { document: addBook, variables: { input: { title: "book A", authorName: "author A" } } },
      { document: addBook, variables: { input: { title: "book B", authorName: "author B" } } },
      { document: addBook, variables: { input: { title: "book C", authorName: "author C" } } },
    ]),
    {}
  );
};
```

As you can expect the result will be a list of the result of each mutation, like we've seen for the [bulk mutation][13],
I have defined `AddBookData` such as:

```ts
interface AddBookData {
    data: { addBook: { book: Book } };
}
```

The type can be a bit complicated, but well-defined interfaces will help us keep track of what is happening in the 
long run.
We keep it simple for the example, but instead of static input (here I am creating always the same three books), 
you could pass it in the hook to make it smarter. 

Now let's see how we're going to use it!

### In your component

Now that you have your hook set up, tested and ready to use, let's add it to a simple componentL

```tsx
export function AddBooksItems(): JSX.Element {
  const addBooks = useAddBooks();

  return (
    <div>
      <button onClick={() => addBooks.mutate()}> Click to add Books!</button>
      <ul>
        {addBooks.isSuccess && addBooks.data?.map(d => (
          <li>{d.data.addBook.book.title + ' by ' + d.data.addBook.book.author.name}</li>
          ))}
      </ul>
    </div>);
}
```

In this example, you'll see a button, once clicked, it will create the three books defined by the input in the hook.
This happens thanks to the `mutate()` function from the hook which is the asynchronous call to the API.

Then the mutation will be marked as _succeeded_ and will display the created book from the mutation's queried payload. 
With our type defined earlier, it's easy to navigate through the bulk response's data.

Give it a like on [stackoverflow][2] though if that helped you 🍪 It's always cheering me up!  

[1]: https://reactjs.org/docs/create-a-new-react-app.html
[2]: https://stackoverflow.com/a/72319499/7747942
[3]: https://reactjs.org/
[4]: https://react-query.tanstack.com/overview
[5]: https://github.com/prisma-labs/graphql-request
[6]: https://github.com/nock/nock
[7]: https://react-query.tanstack.com/guides/mutations
[8]: https://jestjs.io/docs
[9]: https://testing-library.com/docs
[10]: {% post_url 2021/2021-07-26-Apollo-and-graphql %}
[11]: {% post_url 2021/2021-11-06-Advance-apollo-graphql-queries %}
[12]: {% post_url 2021/2021-12-06-Apollo-graphql-mutations %}
[13]: {% post_url 2022/2022-04-26-How-to-bulk-mutate-in-graphql %}
[14]: {% post_url 2022/2022-04-08-Custom-graphql-scalar %}
[15]: {% post_url 2022/2022-05-27-Graphql-advanced-resolver %}
[16]: {% post_url 2021/2021-02-12-React-venture %}
