---
layout: post
title: Configuring Typescript
color: rgb(18, 89, 71)
tags: [js]
---

All Typescript configuration tips that you may need. Think of it as a cheat sheet to remember which without re-reading 
all the documentation regarding typescript compilation will tell you some configuration settings that work for some
particular use cases.

### Project configuration

To configure you typescript project, you will need a [tsconfig.json][1] which will be used by default by [tsc]
(The typescript CLI) to transpile and build your project. 

Let's use this one as an example:

```json
{
  "compilerOptions": {
    "target": "ES2020", 
    "module": "commonjs",
    "outDir": "dist",     
    "rootDir": "."
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "tests/**/*"]
}
```

For a bit of explanation on what it does in the compiler option, (even though typescript transpile to javascript, first
it does some compilation):

- The **target** is to configure the javascript version that is going to be outputted by the typescript build 
(some feature may be down-leveled to match the target). 
- The **module** is used to determine how the code module loader to use (refers to [Javascript Module][1])
- The **outDir** is the where the build is going to be (transpiled javascript files)
- The **rootDir** is the root of your typescript project

Then you have the **include** and **exclude** which specify which file to include and exclude in the build.

The inside your **package.json** you will need to specify the right dependencies and some typescript scripts:

```json
{
  "scripts": {
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "4.5.4"
  }
}
```

The [typescript] package can be set as a dev dependencies since once built as javascript you won't need it to run your
code. To build use the [tsc] command as is (or check the possible flags to fit your needs).
Now you have the base pretty much set.

### Run typescript locally

If you need to run locally your typescript project, instead of building it and then running:

```shell
node dist/index.js
```

You can use [ts-node] which is a Typescript execution engine for Node, update your **package.json** to add this 
configuration, assuming you have the above configured as well for your typescript project to work:

```json
{
  "main": "index.js",
  "scripts": {
    "start": "ts-node src/index.ts"
  },
  "devDependencies": {
    "ts-node": "^10.9.1"
  }
}
```

Now you can just use `npm start` to run your "_index.ts_" file, see that the main file is still in javascript as it is
used when the project is built. 
This is a dev dependencies as you'll only work with typescript files during development.

### WebWorker vs dom

In the `tsconfig` you can find those two inside the library to be included in the compilation:

```json
{
  "compilerOptions": {
    "lib": ["WebWorker","es6", "es2019"]
  }
}
```

With [lib], if your typescript application is supposed to be a backend application, then it's better to configure it as
a [WebWorker], else if it's a frontend application running in a browser, you should go with [dom].
Web worker can perform tasks in background threads and supports I/O (input/output communications with other services,
file systems). While dom api have everything to interact with the HTML page and the Document Object Model API.

You can also add some high level libraries like **es6** to get support for certain new API or syntax compatibility.
For example **es2019** brings `array.flat`, `array.flatMap`, `Object.fromEntries`.

### Using node libraries

In the case where you need to reach for `fs`, `path` and other packages from Node (for a backend app obviously), you 
may have encountered this error:

> **TS2307**: Cannot find module 'fs' or its corresponding type declarations.

Update your **tsconfig.json** to add node in the types within the compiler options, the `@types` for those modules
inside `node_modules/@types` should already be included by default:

```json
{
  "compilerOptions": {
    "typeRoots": ["node_modules/@types"], /* Already included by default */
    "types": ["node"]
  }
}
```

Now with that setting it should work properly.

### Using jest

#### With ts-jest

All good developers want to be able to easily create tests within their projects, so jest is often a must-have.
To use jest in a Typescript project, you need those dependencies in your **package.json**

```json
{
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "@types/jest": "^27.4.0",
    "jest": "^27.4.7",
    "ts-jest": "^27.1.2"
  }
}
```

To add [jest] and its type definition [@types/jest], plus [ts-jest] the jest transformer for typescript files to work
with jest.

Then configure your **jest.config.json** (which is the default configuration file that jest will pick up). 
Use these values to make it work with your typescript project:

```json
{
  "preset": "ts-jest",
  "testRegex": "\\.(test|e2e)\\.ts$",
  "moduleFileExtensions": ["ts", "js", "json"],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  }
}
```

For what it means:
- **preset** to enable [ts-jest configuration]
- **testRegex** to match the test files
- **moduleFileExtensions** is an array of file extensions your modules use. We put to the left the most used to the less used.
- **transform** the files to process with ts-jest.

For the syntax and to be recognized and avoid problems at compilation time, update your **tsconfig.json** to add [jest]
as types in the compiler options:

```json
{
  "compilerOptions": {
    "types": ["jest"]
  }
}
```

Now by running `npm test`, you will be able to use jest and run your tests.

#### With jest-extended

If you have jest setup for typescript as described above, and you want to use [jest-extended] for additional jest matchers
(for example to compare arrays). Then you will need to add some configuration with newer version of [jest] and [ts-jest].

First install the dependency in your **package.json**:

```json
{
  "devDependencies": {
    "jest-extended": "^3.1.0"
  }
}
```

Then update your **jest.config.json** to include the setup file to add all the matchers prior to running the tests in
the "_setupFilesAfterEnv_" setting:

```json
{
  "setupFilesAfterEnv": [
    "jest-extended/all"
  ]
}
```

Finally, update the compiler option to include in **tsconfig.json** the new type:

```json
{
  "compilerOptions": {
    "types": ["jest", "jest-extended"]
  }
}
```

With that, the jest extended matchers should also be recognized by your IDE and for compilation.

### Eslint and plugins

To enhance your project, you'll want to integrate the [eslint] static analyzer to keep your codebase consistent.
While there are some configuration available in the tsconfig's [compiler option], eslint provides and extended range
of rules and plugins.

Let's update your **package.json** with the required settings:

```json
{
  "scripts": {
    "lint": "eslint --ext .ts src",
    "lint:fix": "eslint --fix src tests --ext=.ts"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.9.1",
    "@typescript-eslint/parser": "^5.9.1",
    "eslint": "^7.32.0"
  }
}
```

This will add the typescript eslint [plugin] for Typescript eslint rules as well as the [eslint][3] dependency and the
eslint typescript [parser]. Plus don't forget to set up the linting script for ease of use.

Then in your eslint configuration file, for example **.eslint.yml** add the following configuration:

```yml
{
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    # Your custom rules      
  }
}
```

With that configuration eslint will use the parser and apply the recommended rules from the eslint typescript plugin.
You can add additional custom rules in the `rules` section.


[tsc]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
[compiler option]: https://www.typescriptlang.org/tsconfig
[typescript]: https://www.npmjs.com/package/typescript
[lib]: https://www.typescriptlang.org/tsconfig#lib
[WebWorker]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
[dom]: https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API
[eslint]: https://eslint.org/
[plugin]: https://www.npmjs.com/package/@typescript-eslint/eslint-plugin
[parser]: https://www.npmjs.com/package/@typescript-eslint/parser
[ts-node]: https://www.npmjs.com/package/ts-node
[ts-jest]: https://www.npmjs.com/package/ts-jest
[ts-jest configuration]: https://kulshekhar.github.io/ts-jest/docs/getting-started/installation/#jest-config-file
[jest]: https://www.npmjs.com/package/jest
[jest-extended]: https://www.npmjs.com/package/jest-extended
[@types/jest]: https://www.npmjs.com/package/@types/jest
[typeRoots]: https://www.typescriptlang.org/tsconfig#typeRoots
[1]: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html
[2]: {% post_url 2021/2021-02-21-Modern-era-js %}
[3]: https://www.npmjs.com/package/eslint

