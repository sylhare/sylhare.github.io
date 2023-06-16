---
layout: post
title: Typescript and express JWT validation
color: rgb(214,58,255)
tags: [js]
---

We've been talking about authorization with [Jason Web Token][1] (JWT) [previously][10] so if you are not familiar with
the whole OAuth protocol, and the authorization process, it would be nice to get a refresher first.

Not sure if you know enough, then let's test your knowledge and see if you know the answer to that question:

> What's the difference between **authentication** and **authorization**?
> 
> <details>
>    <summary><i>Click to display the answer (Spoiler ⚠️)</i></summary>
> <ul>
>   <li>Authentication (AuthN) is the process of verifying that the user is who they claim to be for login.</li>
>   <li>Authorization (AuthZ) is the process of verifying that the user has the right to access the resource.</li>
> </ul>
> </details>


Ok, now that you're still here, let's get back to the topic at hand which is to implement in typescript a "simple" jwt
validation for your web server.

## The setup

We will be using several dependencies:
- [express][6] which is a simple web framework for nodejs
- [express-jwt][5] which is a middleware to validate JWT tokens,
- [jwks-rsa][7] which is a library to retrieve RSA signing keys from a JWKS (JSON Web Key Set) endpoint
- [express-unless][4] which is a middleware to exclude some routes from the middleware.

The express-jwt, jwks-rsa and express-unless are either from the [auth0][2] organization or made by someone working
there, and they are very co-dependant. Which may cause some compatibility issues.

### The dependencies

We will be using the latest version of this library at the time of writing this article:

```bash
npm install express express-jwt jwks-rsa express-unless
```

Those projects were converted to typescript, but it was a bumpy road, and upgrading from an older version to a newer one
might be causing you some type headaches.
So I'll be putting some workaround I used for the type resolution.
Here is what I have in my package-lock.json:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "express-jwt": "^8.4.1",
    "express-unless": "^2.1.3",
    "jwks-rsa": "^3.0.1"
  }
}
```

### The server

Straight from the example which you can follow as well from [express-jwt][3], we'll create an [express application][8]
in typescript:

```typescript
import express, { Request, Response } from 'express';

export const app = express();

app.get('/', (req: Request, res: Response): void => {
  res.send('App is running');
});
```

For the example we added a response when hitting the root path `/`, so you'll see that it works when reaching it.
You can run it using:

```ts
app.listen(8080, () => {
  console.log('The application is listening on port 8080!');
});
```

Now that we have our app setup, we can start adding the [JWT][1] validation middleware.

### Validating the JWT token

I have added the import for the types, it will be useful later on. `unless` from `express-unless` is a dependency of
`express-jwt` to add validation _unless_ the route is excluded. There have been some typing issues and changes, so to
avoid changing the code, I preferred creating a type alias for the request handler using the unless function:

```ts
import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import express from 'express';
import { unless } from 'express-unless';

type UnlessRequestHandler = express.RequestHandler & { unless: typeof unless };
```

Now that we have our import set, we can start with the `jwtValidator` middleware. Using the `getToken` function which
will take jwt (without the `Bearer` part) from the `Authorization` header and use the expressJwtSecret function to
retrieve the signing key from the JWKS endpoint. We're using the standard `RS256` in this example:

```ts
export const jwtValidator = (): UnlessRequestHandler => expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    jwksUri: 'https://my-authz-server/.well-known/jwks.json'
  }) as GetVerificationKey,
  requestProperty: 'user',
  getToken: (req) => req.headers.authorization,
  algorithms: ['RS256']
});
```

The `requestProperty` is the property name where the decoded token will be stored in the request. In this example you
will be able to access the decoded token using `req.user`.

We're type casting the secret as `GetVerificationKey` because of a typing issue with the `express-jwt` library.

### Validating the user

Now that you have the decoded token in the request, you can validate the returned user and map its jwt content to a more
usable internal domain object. In this example, we're just checking if the user is present and returning a 401 if not:

```ts
export const userValidator = (req: Request, res: Response, next: NextFunction): void => {
  // ... some user mapping if needed
  if (!req.user) res.status(401).send('Unauthorized').end();
  return next();
};
```

I would wrap this middleware with the `unless` function so that it doesn't return 401 on path where authorization is not
needed.

### Use the middlewares

Now that we have created our middleware, we'll use them in our express application, but first, let's define some routes
that we don't want to be validated:

```ts
import { Params as UnlessOptions } from 'express-unless';

const unlessOptions: UnlessOptions = {
  path: ['/.well-known/health'],
};
```

The health path is a common path to check if the application is running, and we don't want to validate the token for it.
Since `Params` is a bit too unspecific, I am using an alias `UnlessOptions`, so I know what it is about.

```ts
app.use(jwtValidator().unless(unlessOptions));
app.use(userValidator().unless(unlessOptions));
```

In order to apply those middlewares to all routes, you need to use the `app.use` function before any path function like
`app.get`. In our example the `/` path is not affected by the middlewares because it was created before the `app.use`.
Now to test it, you can use some mock servers like [nock][10] for the jwks-rsa certificates and [supertest][12] to test the express
app endpoints.

That's it, now you have your middleware in your application, with the `unless` function properly setup. This 
should be enough for you to get started!

[1]: https://jwt.io/
[2]: https://github.com/auth0
[3]: https://github.com/auth0/node-jwks-rsa/blob/2fd4582d2be5f3e4fd6ed0d6f2d8bd7103f7434d/examples/express-demo/README.md
[4]: https://www.npmjs.com/package/express-unless
[5]: https://www.npmjs.com/package/express-jwt
[6]: https://www.npmjs.com/package/express
[7]: https://www.npmjs.com/package/jwks-rsa
[8]: https://expressjs.com/en/api.html
[9]: https://www.npmjs.com/package/supertest
[10]: https://www.npmjs.com/package/nock
[11]: {% post_url 2021/2021-11-30-Authorize-my-jwt %}
