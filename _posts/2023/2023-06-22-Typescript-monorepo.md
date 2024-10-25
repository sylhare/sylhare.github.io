---
layout: post
title: Create a multi package 📦 project in Typescript 
color: rgb(4,104,191)
tags: [js]
---

Multi package project, that's how I would call a project with multiple packages in it. For example, you have your main
application and then extract some functionalities as dependant libraries from it. To make it more manageable (dealing
with tests, vulnerabilities, and updates), or to make them available to other applications.

But there's the "_monorepo_" concept which utilises this pattern to the extreme, where an organization has a single 
repository for all its code! I like Babel's example which even explains its [reasoning][1] for this choice.

## Monorepo culture?

The [monorepo][3] culture is pretty divisive, we have players like Google and Facebook that are using it, and others that
are absolutely hate it.

In the case of Google where [95%][2] of its code is in a single repository, we can see that it can be done at a big 
scale for billions of lines of code. However, they have a dedicated team to manage it and multiple tools 
have been developed to make it work.

So we won't go too much into why too much code in one repo is hard to manage or why having all your dependencies in one 
repo is cool to make updates and have visibility. We'll just try to make our multi-package project work in Typescript,
and I'm going to call that a [monorepo][4] because it's shorter. But let me know your thoughts in the comment section 🙃.

But if you are interested, checkout [monorepo.tools][6] which has some keen insight about the question.
I have extracted those diagrams which give a good overview of the monorepo concept:

{% include aligner.html images="nx-polyrepo.png,nx-monorepo.png" column=2 caption="Representation of a poly repo setup versus a monorepo" %}

It is summarised with "_A monorepo is a single repository containing multiple distinct projects, 
with well-defined relationships._"

## Monorepo with Typescript

### The base
The base `package.json` will be at the root of the monorepo, in it, you will specify the workspaces which are the sub
packages available:

```json
{
  "workspaces": [
    "apps/*",
    "libs/*"
  ]
}
```

Since it's typescript you may have to configure the base `tsconfig.json` to specify in `compilerOptions`, the paths of
the dependant packages (like libraries used by multiple apps).

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@monorepo/*": ["libs/*/src"]
    }
  }
}
```

The file structure for the monorepo will look like this, we have the _apps_ and _libs_ folders defined in the `package.json` 
with in each a small typescript project.

```coffee
.
├── apps
│   └── express
│       ├── src
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── libs
│   └── example
│       ├── src
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── package.json
└── tsconfig.json
```

For this article, we can have the express app in the `apps` folder depend on the `example` library in the `libs` folder.

### The sub packages

Each sub packages (libraries or applications) will have their own `package.json` and `tsconfig.json` files. 
However, to avoid duplication, you can extend the main one and override only the properties you need.

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    // any option to override
  }
}
```

For the `package.json` there's no extension, but you can add internal libraries from within the monorepo as _dependencies_,
to make it simple, everything is from this example `@monorepo` organisation. Use your own organisation name using 
the `@{organisation}` in your context.

```json
{
  "name": "@monorepo/express",
  "dependencies": {
    "@monorepo/example": "~1.0.0"
  }
}
```

The `@monorepo/express` app is dependent on the `@monorepo/example` library. Since we defined the path for the library
in the main `tsconfig.json` file that we import in the app, we don't need re-specify the path to fetch the internal
dependency.

### Test it!

#### Jest dependency

Now that we have our monorepo setup, when you start writing code and tests.
And You will want to be able to run them from either one sub package (like only the one for the express app),
or for each sub packages.
In order to do that, I am going to use jest and some configuration voodoo to make it work.

Here are the version for jest are ts-jest that I am using:

```json
{
  "devDependencies": {
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

With this version, I can use a typescript file for the jest configuration file 👌 Also, since in this case I will use
jest in all my subpackages, I'll only set it as a dev dependency from the base `package.json`. I don't want to copy
and paste over the same jest dependencies in all the packages of the monorepo.

And if I need some specific library for a subpackage, I can only add them as dev dependency in those.

#### Jest configuration

Now in order for ts-jest to work properly, in the main `jest.config.ts` at the root of the monorepo I'll have a projects
value to define the sub packages that I want to run tests for:

```typescript
import { pathsToModuleNameMapper } from 'ts-jest';

const projects = [
  {
    preset: 'ts-jest',
    testEnvironment: 'node',
    displayName: 'express',
    moduleNameMapper: pathsToModuleNameMapper({
      '@monorepo/*': ['libs/*/src']
    }, {
      // This has to match the baseUrl defined in tsconfig.json.
      prefix: '<rootDir>/',
    }),
    testMatch: ['<rootDir>/apps/express/**/*.test.ts'],
  },
];
```

The `moduleNameMapper` will help jest understand and compile the internal packages in our dependencies. Then the config
will have the traditional configs for jest and the projects value:

```typescript
import type { Config } from 'jest';

const config: Config = {
  projects,
  // any other config
};

export default config;
```

#### Run the tests

From the base of the monorepo, you may want to be able to run all or just one project's test, to do so, we can 
specify those test scripts:

```json
{
  "scripts": {
    "test": "jest",
    "test:express": "jest --selectProjects=express"
  }
}
```

The test one will run all fo them, and the `test:express` will only run the tests for the express app defined by the 
project in the jest config.

To run the test from the subpackage, and only run those tests when running `npm test` without adding another configuration
file, you can use this script (for example in the express app):

```json
{
  "scripts": {
    "test": "jest --config=../../jest.config.ts --selectProjects=express"
  }
}
```

We're passing the main config to the jest command, and we use the `--selectProjects` to only run the tests for the express.
This way if you only open the subpackage you still have access to a working test command.

If you are running the tests from within the IDE, you may need to update the IDE configuration to set the base folder
(or Working directory) as the root of the monorepo instead of the sub package.

## Tools for Typescript monorepo

Now you have seen how to make your own typescript monorepo without any tools. It's not much additional configuration,
but as the repo's size increase, it may add overhead to your development process. For example when wanting to publish
only one package at a time, or manage different aspects of the project.

The good news, is that other people encountered those issues, and you have tools available to help you. The one I would
consider check is [lerna][5] which is a tool designed to help you manage and publish your different packages inside
your monorepo.

I am not going to expand too much on it now, but I might write another article about it in the future...


[1]: https://github.com/babel/babel/blob/5f74b510ff251af5bf7fbbf25c1c934ffcb6df52/doc/design/monorepo.md
[2]: https://qeunit.com/blog/how-google-does-monorepo/
[3]: https://semaphoreci.com/blog/what-is-monorepo
[4]: https://github.com/NiGhTTraX/ts-monorepo
[5]: https://lerna.js.org/
[6]: https://monorepo.tools/