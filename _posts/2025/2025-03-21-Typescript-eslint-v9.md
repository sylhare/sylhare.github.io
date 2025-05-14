---
layout: post
title: Migrating to eslint v9 (typescript)
color: rgb(217, 85, 120)
tags: [js]
---

Eslint had a major update which caused a lot of problems with the existing configuration I had in different projects.
This led me to postpone the migration until things settled down a bit.
Hoping that others had time to find fixes, workaround or examples to follow.

And it worked since the [migration guide][1] got created and is now better than ever. 
In this article I'll show how I updated my old config to the new one so it works with typescript.

## Eslint v8 Previous config

We talked already about [configuring typescript][10] which mentions how to set up eslint (v8) with typescript.
As well as how to create your own [eslint configuration][11] with custom rules.

Here is an old (now deprecated) `.eslintrc.json` configuration file for eslint with the basics for jest and typescript:

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
    "jest"
  ],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "env": {
    "es6": true,
    "node": true,
    "jest": true
  },
  "extends": ["plugin:jest/recommended"],
  "rules": {}
}
```

In this configuration we have:
- the `parser` and `parserOptions` to use the typescript parser.
- the `plugins` to load the typescript and jest plugins, 
- the `extends` to use the jest recommended rules (imported from the plugin).
- the `rules` for additional custom eslint rules.

Now let's see how this looks with eslint v9.

## Eslint v9 New config

### Migrated config

With the newer eslint version, the configuration file format has changed.
I am using the cjs (commonjs) format for the configuration file as `eslint.config.cjs`.
It is similar to the `.eslintrc.js` which I used before. 

But all in all, the config as `js, mjs, ts` are all pretty similar. 
With v9 eslint uses a _flat config system_ which is a single array of configuration objects.

The same configuration as above can now be written as:

```js
// eslint.config.cjs
const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const jest = require('eslint-plugin-jest');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'jest': jest,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...jest.configs.recommended.rules,
    },
  },
];
```

If you were familiar with the deprecated [overrides][2] feature, then this new format will be similar.
The configuration can be specified for different file groups, and the rules can be extended from the plugin's recommended rules.

Here we have two elements in the configuration:
- the first one
  - It only has `ignores` for the generic files to ignore with eslint.
- the second one 
  - the `files` for the typescript files and within the associated plugins and rules.
    - the `plugins` to load the typescript and jest plugins,
    - the `rules` to extend from the recommended rules of the plugins and add custom rules.
  - We could set another `ignores` to ignore specific _files_ matched by the glob pattern.

No need to extend any more, just use the `rules` for the plugin rules and your own on the selected files.

### With React

Let's say we have some React components in the project.
That means we have some `tsx` files and eslint react plugin we'd like to include in our configuration.

Let's update the configuration to include the React plugin and the recommended rules:

```js
// eslint.config.cjs
// ...previous imports
const reactPlugin = require('eslint-plugin-react');

module.exports = [
    // ...previous config from above
    {
        files: ['**/*.ts', '**/*.tsx'], // add tsx files for common typescript rules
        // ...previous config from above
    },
    {
        files: ['**/*.tsx'], // create a new config for tsx files only
        ignores: ['build', 'public/build'],
        plugins: {
            'react': reactPlugin,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'no-trailing-spaces': 'error',
            'no-irregular-whitespace': 'error',
            'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1, 'maxBOF': 0 }],
            ...reactPlugin.configs.recommended.rules,
            'react/jsx-tag-spacing': ['error', { 'beforeSelfClosing': 'always' }],
        },
    }
]
```

In this configuration we use the React plugin and extend it with some custom rules that can be both:
- default Eslint rules like `no trailing spaces` or `no irregular whitespace`
- plugin rules like `react/jsx-tag-spacing` which is a rule from the React plugin.

We also updated the previous file configuration to include `tsx` files as well, so the typescript rules apply to them.
This simplifies and encapsulate the configuration for the different file types.



[1]: https://eslint.org/docs/latest/use/configure/migration-guide
[2]: https://eslint.org/docs/latest/use/configure/configuration-files-deprecated#how-do-overrides-work
[10]: {% post_url 2022/2022-12-02-Configuring-typescript %}
[11]: {% post_url 2023/2023-05-05-Eslint-configuration %}