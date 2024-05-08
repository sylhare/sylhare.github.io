---
layout: post
title: NestJS and GraphQL validation decorators
color: rgb(242, 105, 56)
tags: [js]
---

In this article, we are going to delve more in the NestJS ecosystem with its built-in validation mechanism.
It integrates with the [class-validator][1] and [class-transformer][2] packages from _typestack_.
And even without NestJS, they bring a lot of value to any typescript project.

Wa have already talked about [GraphQL with NestJS][10], but feel free to get a quick refresh with this [article][10]!
I am assuming you have an up and running NestJS application with GraphQL running.
So we'll start from there

## Setup

Let's install the library we talked about in the introduction.
You can find out more information about how it's integrated and how to use it in the [official documentation][3].

```shell
npm i --save class-validator class-transformer
```

So what are those libraries for?
- `class-validator`: Adds handy decorator on top of class fields for data validation
- `class-transformer`: A toolbox to be able to transform a plain json object into a javascript class (with the methods!)
and other cool methods to handle json object and javascript classes.

In this case, the [class-transformer][2] is mandatory to be able to use the NestJS `ValidationPipe` that enables the
validator (as annotation/decorator) from the [class-validator][1] to work.

## Implementation

### Native validator

The [class-validator][1] package comes with a bundle of validator ready to use. 
(Just to name a few `IsDefined()`, `IsEmpty()`, `IsIn(...)`, ...)
That should most likely reduce some of the boilerplate to get started.

Then you can add them within your class, in this case we are going to apply them on the input for a `createAuthor` 
[mutation][11] to create an author for a book.

```ts
import { IsNotEmpty } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAuthorInput {
  @IsNotEmpty()
  @Field(() => String)
  name: string;
}
```

And as easy as that, we specify that the name is supposed to be _not empty_.
The goal will be to do some input validation before it goes to be created, so we can reject early on bad input.

But on its own, it doesn't do much; you need to configure your app to use it.
In your NestJS `main.ts` application apply the _validation pipe_:

```ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({})); // <-- This
  await app.listen(3001);
}
```

With `app.useGlobalPipes(new ValidationPipe({}))`, the mutation with a bad input will be intercepted and a payload with
the error will be returned. 
As usual in GraphQL, it will still return an HTTP `200`.

### Custom validator

To create your own validator to use as a decorator within your code, is almost as easy.
In our case, we want to validate that the created author name is not _Robert_ for some reason 🥲

For that we'll have:

```ts
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNotRobert(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotRobert',    // <-- Name of the constraint in the error
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'name must not be Robert',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          return value !== 'Robert';
        },
      },
    });
  };
}
```

As you can see, although it is not a class,
the method's name is `IsNotRobert` with a `I` to match the pattern of the other decorator.
I don't need to use the options as a variable, but it could be used to pass the message for a custom one per field, for 
example (Passing it like `@IsNotRobert({ message: 'This <field> should not be Robert })`).
Not to use it, same as the other one:

```ts
@InputType()
export class CreateAuthorInput {
  @IsNotEmpty()
  @IsNotRobert()
  @Field(() => String)
  name: string;
}
```

And now your API should be ready! But first let me show present the tests I had written to implement that.

## Testing

### Unit test validator

To be able to unit test the validators, you can use the [class-validator][1]'s own `validate` function to make sure
it errors for the right reason.

```ts
  it('can not be named Robert 🥲', async () => {
    const input = new CreateAuthorInput('Robert');

    await validate(input).then(errors => {
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotRobert', 'name must not be Robert');
    });
  });
```

You can have more than one error, meaning by stacking validation decorator you could have multiple errors triggered.
The ones we have set here do not intersect, so we are checking against the first error only.

### e2e test validator

We have seen [previously][10] how to write an e2e test for a GraphQL NestJS API in this [article][10].
So I will go to the essential!

As we added the validation pipe in our `main.ts` before, we also need to do it here for the test application.
Be sure that they match to avoid discrepancies in test.

```ts
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthorModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({})); // <-- same as in `main.ts`
    await app.init();
  });
```

While creating the test app for the `AuthorModule`, we apply the same validation pipe as our app, so we'll get the same
error behaviours on bad input.

## Error

Let's spend a bit of time analysing and refining the error from the validation to our taste.

### Initial error

The initial error is not the one that is going to be sent back to you via API call.
It is the one generated by the validation 😵‍💫
So many errors it gets confusing!

The initial validation error looks like:

```js
const ValidationError = {
  target: {
    name: ''
  },
  value: '',
  property: 'name',
  children: [],
  constraints: {
    isNotEmpty: 'name should not be empty'
  }
}
```

If you remember the unit test, we were checking against the `constraints`, now it makes more sense as we see it.
The `target` is the `createAuthor` input here, and the property is the one with validator that is targeted.

### By default

When doing a test trying to create an author that does not respect the rule, the validation pipe be triggered and
return an error.

By default, with GraphQL the `extensions` code will be `INTERNAL_SERVER_ERROR`, but the message will be the one defined
within the custom validator:

```json
{
  "message": "Unexpected error value: [{ property: \"name\", message: \"name must not be Robert\" }]",
  "locations": [{ "line": 1, "column": 53 }],
  "path": [
    "createAuthor"
  ],
  "extensions": {
    "code": "INTERNAL_SERVER_ERROR"
  }
}
```

As we can see it has the `locations` and `path` which are common for GraphQL. 
However, it's not actually an internal error (which in HTTP usually translates to a `5xx` error) but more of a user error
coming from the client (which in HTTP would translate to a `4xx` error).

So it's not ideal! Let's see if we can do better.

### With ValidationPipe's configuration

> We are using NestJS v10, error may slightly differ depending on the version

Now the validation pipe can use the [class-transformer][2] to try to match the error message to a class instead.
You can set it in the pipe's configuration with:

```ts
new ValidationPipe({ transform: true })
```

This will convert the validation error into a 400 (Bad Request) and appear slightly different:

```json
{
  "errors": [
    {
      "message": "Bad Request Exception",
      "locations": [{ "line": 1, "column": 53 }],
      "path": [
        "createAuthor"
      ],
      "extensions": {
        "code": "BAD_REQUEST",
        "originalError": {
          "message": ["name should not be empty"],
          "error": "Bad Request",
          "statusCode": 400
        }
      }
    }
  ],
  "data": null
}
```

No more suggestion of an internal error, it is now clear that it is a user error. 
The only downside is that the error message is now `Bad Request Exception` instead of something more explicit,
the original error message can still be found though in the `extensions` with the original error.

You can achieve a similar result as the `transform` option with the `exceptionFactory` which can be passed in the
validation pipe option.

> Using `exceptionFactory`, the `transform` option will be ignored.

It allows you fine grain control on how the exception will look like. 
It takes the initial error from the validator as an input (or any other validation error that could be thrown by the application).

But we can still go a bit further and improve the error!

### Using GraphQL Driver format error

Let's say we have the `transform: true` configuration in the validation pipe, now we can get that error and instead
of displaying as GraphQL default error, we can format it to our liking.

It is not mandatory, but having the message as the sum of the original response could improve readability.
And that can be achieved through the GraphQL driver `formatError` configuration.

```ts
GraphQLModule.forRoot({
  driver: ApolloDriver,
  formatError: (error) => ({
    message: error.extensions['originalError']?.['message'].join(', ') ?? error.message,
    path: error.path,
    locations: error.locations,
    extensions: {
      code: error.extensions['code'],
    },
  }));
})
```

Remember that `error.extensions['originalError']` might not be always there depending on the validation error you may
be throwing in the application.
So make just you adjust properly for your use case.

Unfortunately, it doesn't allow transforming one error into multiple, but it shouldn't hinder readability.
Like in this example where I added a new `name should not be empty` error, all errors are within the message instead of
being stuck away in the original error:

```json
{
  "errors": [
    {
      "message": "name is too short, name should not be empty",
      "path": ["createAuthor"],
      "locations": [{ "line": 1, "column": 53 }],
      "extensions": { "code": "BAD_REQUEST" }
    }
  ],
  "data": null
}
```

With that, you should have leeway to customize the errors how you want!
There are multiple moving pieces, so it gets confusing when the change you are making at one place getting overwritten
auto magically at another place.

In a previous [article][11], we were differentiating user errors from system errors, returning within the mutation this kind
of [Business error][11] as expected from the mutation's response type.
Here with this type of error, it's considered as a GraphQL "system" error. 
So this way is a bit of a shift in paradigm, both are correct, and NestJS does facilitate treating every error this way.
We try to [Keep it simple][12] 🤓!

[1]: https://github.com/typestack/class-validator
[2]: https://github.com/typestack/class-transformer
[3]: https://docs.nestjs.com/techniques/validation
[10]: {% post_url 2024/2024-03-18-Nestjs-with-graphql %}
[11]: {% post_url 2021/2021-12-06-Apollo-graphql-mutations %}
[12]: {% post_url 2023/2023-01-23-Code-acronyms %}