---
layout: post
title: Create your own eslint configuration
color: rgb(36, 64, 51)
tags: [js]
---

You may be using [typescript][1], and on top of that have an [eslint][3] configuration.
That's perfect! 🤩 But now let's say you start having multiple project under the same organisation,
wouldn't want them all of them to follow the same linting rules? Of course! Cohesion right! 🙆

However, copying and pasting the same [eslint configuration][2] from one project to another is not
scalable and definitely not what someone would call "clean" in regard to code. 
So let's see how to create a common custom eslint that you can extend from in a few lines from all of
your project.

## Eslint configuration package

If you are not familiar with typescript and eslint configuration, check this [article][1].
We're going to assume that we have an [existing configuration][4] in a `eslintrc.json` that we want to 
share with other projects.

For example here would be a simple configuration (I skipped the rules part) that uses the typescript
and jest plugins and extends from the jest recommended rules:

```json
{
  "env": {
    "es6": true,
    "node": true,
    "jest": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint",
    "jest"
  ],
  "extends": [
    "plugin:jest/recommended"
  ],
  "ignorePatterns": [
    "**/dist/*"
  ],
  "rules": {
    ... your custom rules
  },
  "overrides": [
    {
      "files": [],
      "rules": { 
        ... your custom rules overrides 
      }
    }
  ]
}
```

To create a new package you can use:

```sh
npm init
```

It will create the default `package.json` to get you started.

### Peer dependencies

For the configuration you will need to add everything as `peerDependency` so it will be easier to 
import in your project. It should contain everything used in your `.eslintrc` configuration, so 
don't forget any plugin that you may be using (like the jest one).

Your package.json should have:

```json
{
  "peerDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.59.1",
    "@typescript-eslint/parser": "^5.59.1",
    "eslint-plugin-jest": "^27.2.1",
    "eslint": "^8.39.0",
    "typescript": "^4.7.4"
  }
}
```

Everything needed for eslint to work on typescript, eslint itself and the plugin.

### Eslint configuration

By default, the `main` is `index.js` which is the entry file of your package.
It will only contain our configuration from the `.eslintrc.json` so it can be extended
in another project:

```js
const eslintrc = require("./.eslintrc.json");

module.exports = eslintrc;
```

Be mindful that your package's name needs to contain the prefix `eslint-config-` in order to be
recognized by eslint when you'll integrate it.
The package.json will look like:

```json
{
  "name": "eslint-config-my-lint",
  "version": "0.0.0",
  "description": "Linter for typescript projects",
  "main": "index.js",
  ...
}
```

My configuration called `my-lint` has now the basic information.

### Package composition

Your package should be pretty flat, in my case the `.eslintrc` is a json file, but you could also use the
javascript syntax and get rid of the `index.json`. Here are the files:

```sh
.
├── .eslintrc.json
├── .gitignore
├── .npmignore
├── README.md
├── index.js
├── package-lock.json
└── package.json
```

The `.npmignore` is for used to tell npm which file to ignore when publishing a package.
Now you can publish your package and start using it in other projects!

## Use an Eslint configuration

Make sure you install the configuration and its peer dependencies into your `devDependencies`:

```json
{
  "peerDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.59.1",
    "@typescript-eslint/parser": "^5.59.1",
    "eslint-config-my-lint": "0.0.1",
    "eslint-plugin-jest": "^27.2.1",
    "eslint": "^8.39.0",
    "typescript": "^4.7.4"
  }
}
```

Then you can extend your eslint configuration with the one from the library

```json
{
  "eslintConfig": {
    "extends": [
      "my-lint"
    ]
  }
}
```

You can then add the linting commands in the script part of your package.json:

```json
{
  "scripts": {
    "lint": "eslint --ext .js,.ts .",
    "lint:fix": "eslint --fix --ext=.js,.ts ."
  }
}
```

And now you are all set to use your new eslint configuration in all of your typescript projects.
You don't need to create your set of rules from scratch though, there are some [famous ones][5] you can use
as a base.

[1]: {% post_url 2022/2022-12-02-Configuring-typescript %}
[2]: https://docs.npmjs.com/cli/v9/using-npm/developers#publish-your-package
[3]: https://eslint.org/
[4]: https://github.com/sylhare/Typescript/blob/c2dd72e2cdfa8234882fff2c8516896fe1322562/.eslintrc.yml
[5]: https://www.npmjs.com/search?q=eslint-config
