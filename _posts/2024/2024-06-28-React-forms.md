---
layout: post
title: Create forms in React 📋
color: rgb(241,97,150)
tags: [react]
---

Let's talk about forms in React. What do you need and how to create them?
Forms are a basic way to collect multiple data input from users, they are convenient because you can get all the data
at once and submit it.

Although nobody likes them or wants to fill them up, you might need to create one for your application.
So let's get going!

## Installation

Assuming you have an up and running React application, you only have to add the [react-hook-form][4] package to your project.
If you want to create a React app, you can check out this [article][10] for the basics.

```shell
yarn add react-hook-form
```

Now you can start using the package in your components.
Although it is enough on its own, I am going to use it with Chakra UI to make nicer looking forms.
You can ignore the Chakra Component in the following examples or find out more about it through this [previous article][11].

## Usage

### Creating the form hook

To use the form, you will first need to create an interface that will represent the different fields in your form.
Then pass it to the `useForm` hook, so it can manage the form state for you.

```tsx
interface ExampleFromValues {
  name: string;
  description: string;
  password: string;
}
```

The interface is nothing special, now let's use the hook in our component:

```tsx
import { useForm } from 'react-hook-form';

export const ExampleForm = () => {
  const {
    control,
    register,
    reset,
    formState: { isValid, errors },
    watch,
    getValues,
    setValue,
    handleSubmit,
  } = useForm<ExampleFromValues>({
    mode: 'all',
    defaultValues: { name: '', description: '', password: '' },
  });

  return (<></>);
};
```

Don't worry you won't need all of these functions from the `useForm` hook, but I wanted to show the one that would be
the most useful.

Let's dig into what we have here:
- `control`: The form control object can take care of the registering and validation of the inputs with more customization.
- `register`: The function will register the input to the form.
- `reset`: This can be called to reset all fields in the form.
- `formState`: The object that contains the form state, `isValid` if the validation pass or the `errors` for each field.
- `watch`: This is used to watch one, some or by default all values of the fields, it will return the value at each change.
  Mostly for debugging or to trigger some side effects.
- `getValues`: This function gets all the values of the form, but you can also `getValues('name')` to get only one field.
- `setValue`: The function that you can use to explicitly set the value of a field `setValue('name', 'Hello')` without the
  user interaction.
- `handleSubmit`: This function is to be used _on submit_ to pass the form values if the validation passes.

Then we have the option passed to the hook:
- `mode`: The mode determines when the validation should occur, `all` will validate the form for every event. 
  But you can set it to `onSubmit` or `onChange` and so on.  
- `defaultValues`: The default values of the form, it's also useful to let the form know which fields to manage when the
  type is not passed.

### Creating the form inputs

Now that we have the hook, let's start using it in a simple Chakra UI form.
Let's demo multiple use case of the hook.

**1.** First, let's create a simple description input for our form:

  ```tsx
<Input {...register('description')} />
  ```
**2.** Second, let's have a mandatory field for the name:

  ```tsx
<Input {...register('name', { required: 'Name is required' })} />
  ```
**3.** Third, let's have a password field with a minimum length of 6 characters:
  {% raw %}
  ```tsx
<Input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} />
  ```
  {% endraw %}

In the `register`'s option you can pass some default validation rules, like `required`, `minLength`, `maxLength`, `pattern`.
You can also pass a custom function to validate the field, but the basics should be enough for now.

### Assembling the form

Now that we have all the fields, let's put them in a form.
I will be using **@chakra-ui/input** and **@chakra-ui/react** components to create the form.

```tsx
export const ExampleForm = (): React.JSX.Element => {
  const {
    control, register, reset, formState: { isValid, errors }, handleSubmit,
  } = useForm<ExampleFromValues>({
    mode: 'all',
    defaultValues: { name: '', description: '', password: '' },
  });

  const onSubmit = (data: ExampleFromValues) => console.log(data);

  return (
    <VStack gap={5}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isRequired={true} isInvalid={!!errors.name}>
          <FormLabel>Name</FormLabel>
          <Input {...register('name', { required: 'Name is required' })} isRequired/>
          <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
        </FormControl>
        
        {/* ...other FormControl and fields */}
        
        <HStack pt={10}>
          <Button variant={'outline'} onClick={() => reset()}>Reset</Button>
          <Button type={'submit'}>Submit</Button>
        </HStack>
      </form>
    </VStack>
  );
};
```

There's quite a lot going on! I didn't put all the fields because it would be too long.
For each input, to display them nicely in Chakra UI, you will need to wrap them with a `FormControl` and a `FormLabel`.
The `FormErrorMessage` will display the error message in red under the input if the field is invalid.

This will look like the traditional form you see on the web thanks to the `FormControl`'s props:
- `isRequired`: Will add a red asterisk to the label (aka `FormLabel`).
- `isInvalid`: Will add a red border to the input and display the error message.

Then we have two buttons at the end of the form, one to reset it and the other of `type={'submit'}` that will submit the
form, we log the form data in the console here, but it could be used in a call to the server.

## Advanced form input

### With Controller

The `Controller` component from **react-hook-form** can allow more _control_ over the input and gives you flexibility to
render the input. Here is an example for our password field:
{% raw %}
```tsx
<FormControl isRequired={true} isInvalid={!!errors.password}>
  <FormLabel>Password</FormLabel>
  <Controller
    name={'password'}
    control={control}
    rules={{
      required: 'Password is required',
      minLength: { value: 6, message: 'Password must be at least 6 characters' },
      validate: {
        containsNumber: (v) => /\d/.test(v) || 'Password must contain a number',
        containsSpecialChar: (v) => /[^A-Za-z0-9]/.test(v) || 'Password must contain a special character',
      },
    }}
    render={
      ({ field }) => (<>
        <Input placeholder={'Password'} isRequired {...field} />
      </>)
    }
  />
  <FormErrorMessage>
    {errors.password && errors.password.message}
  </FormErrorMessage>
</FormControl>
```
{% endraw %}

It is still pretty similar to the use of `register`, we can see in the _rules_ that we have added a _validate_ object for
custom password validation, else it takes the same options as `register`.

### Using the watch function

Let's have an example of the `watch` function.
We can use it to act based on the watched field. 

> Modifying a watched field in a `useEffect` will re-render the component indefinitely in a loop!

With that warning out of the way, let's add a _hash_ field to our `ExampleFromValues` that will be the Base64 value of
the password.
Within the component I can have:

```tsx
export const ExampleForm = (): React.JSX.Element => {
  // ...useForm hook

  const passwordWatcher = watch("password");

  useEffect(() => {
    setValue('hash', btoa(getValues("password")))
    console.log(getValues());
  }, [passwordWatcher]);
  
  // ... rest of the component
}  
```

This will update the `hash` field every time the `password` field changes, decode the _hash_ value, and you will see
that it matches the _password_ field.
If you enter something in name or description, the `hash` field will not be updated. 
You can validate that with the `console.log(getValues())` that will log the form values.

That's it for now! This should give you the basics to get started on the forms in React.
There are other libraries available besides [react-hook-form][1], so if it doesn't match your need can pivot to
another one like [formik][2] or [react-final-form][3].


[1]: https://react-hook-form.com/
[2]: https://formik.org/
[3]: https://final-form.org/react
[4]: https://www.npmjs.com/package/react-hook-form
[10]: {% post_url 2021/2021-02-12-React-venture %}
[11]: {% post_url 2024/2024-06-18-Chakra-ui-components %}