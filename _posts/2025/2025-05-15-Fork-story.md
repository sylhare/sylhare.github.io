---
layout: post
title: "Reviving Simple-Jekyll-Search: A Fork Story"
color: rgb(156 31 153)
tags: [jekyll]
---

With [Type-on-Strap][7], I was using the [Simple-Jekyll-Search][1] for search functionality.
But in 2022, the maintainer, Christian Lei archived the project.

So I decided to make my own fork of the project to keep it alive for my theme.
I made quite some change to bring the code to a more modern stack, or rather, one that I am more familiar with,
and I wanted to document here some of the changes I made.

The main functionality is still the same, 
and you can absolutely use my version of the [Simple-Jekyll-Search][2] as a drop-in replacement for the original one.
I do plan on deprecating a feature, but there should be no breaking change for the time being.

## The Fork

### Context

I wanted at first to remain in the fork network of the original project, but then I decided not to in order to have more
freedom over what to do with the project.
It makes it less discoverable, 
as people (or maybe just me) would normally look for most recent and updated forks of an archived project when looking for an alternative.

{% include aligner.html images="simple-jekyll-search.png" caption="Original simple-jekyll-search banner from Christian Lei" %}

I kept the same name, and updated the project, while making sure I wasn't breaking the MIT licence.
Like for example, if I rewrite the project, but it's based on the fork, I need to keep the original author in the licence.
What you can do, is add yourself under the original author with the date

```shell
Copyright (c) 2015 Christian Fei
Copyright (c) 2025 Sylhare
```

Which is what I did! I mean with my GitHub username, which might not be the most legally viable way to do it...
Now I am not a licencing expert, so if you know better than I do, feel free to share.
Or reach out before suing me for copyright infringement. I swear I didn't mean to!

### New Features

What I wanted to work on was experimenting with more search algorithms and how to make the search more relevant.
The fuzzy algorithm that was existing was too _fuzzy_ to my test (you could match any article with `aaaa`).

I also didn't want this package to have hard dependencies on anything else for its main purpose (i.e. not counting the dev deps).
So I got rid of the few that existed and modified the option for the search so it can take a search strategy as a parameter instead.
Find out more on how to make it work in the [demo site][6]!

```js
window.simpleJekyllSearch = new SimpleJekyllSearch({
  searchInput: document.getElementById('search-input'),
  resultsContainer: document.getElementById('results-container'),
  json: '{{ "/assets/data/search.json" | relative_url }}',
  searchResultTemplate: '<li><a href="{url}?query={query}" title="{desc}">{title}</a></li>',
  noResultsText: 'No results found',
  //fuzzy: true, // Deprecated  
  strategy: 'fuzzy',
  exclude: ['Welcome'],
});
```

This is more in the line of a hobby project as having too many strategies might end up bloating the library for no reason.
A single good one is better than a dozen.
So I'll probably be experimenting with [trie][8] data structure or named algorithm like the [Aho-Corasick][9] algorithm,
[Boyer-Moore][12] string-search algorithm or [Levenshtein distance][11].

## Technology Stack changes

That was my main beef with the project, I didn't like the Javascript lack of type,
it makes it hard to see what argument is needed or not and where.

So I decided to convert the whole codebase to TypeScript for this reason and because I am used to it.

### Build System

I changed the whole browserify build system, the previous one used `browserify` which seemed overcomplicated and apparently broken. 
Since I needed one able to minify and possibly have a _polyfill_ed (browser compatible) version of the library, 
I had to chose carefully one that could do all that with the least configuration pain.

Out of the candidates, I decided to go with [vite][3] which has a reputation for being fast, 
modern and unlike `webpack` the configuration seemed straightforward.
We use the `umd` format (Universal Module Definition) for the library, 
so it can be used in the browser or with a module loader.

```ts
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    outDir: 'dest',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SimpleJekyllSearch',
      fileName: (_format) => 'simple-jekyll-search.js',
      formats: ['umd'],
    },
    minify: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        generatedCode: {
          preset: 'es2015',
          symbols: true
        },
        exports: 'named'
      }
    }
  },
})
```

The build script in the package.json was well thought, so I kept it pretty much as is.
It has multiple phases, lint, test, build, minify, stamp,
then copy over the files for the test website that is use as an example/documentation.
For the minification, I went with [terser][4].

```json
{
  "script": {
    "build": "tsc && vite build && terser dest/simple-jekyll-search.js -o dest/simple-jekyll-search.min.js",
    "prebuild": "yarn run test",
    "postbuild": "node scripts/stamp.js < dest/simple-jekyll-search.min.js > dest/simple-jekyll-search.min.js.tmp && mv dest/simple-jekyll-search.min.js.tmp dest/simple-jekyll-search.min.js && yarn run copy-example-code",
    "copy-example-code": "cp dest/simple-jekyll-search.min.js docs/assets/js/",
  }
}
```

I kept the `stamp` script which is used to add the version number and maintainer as a comment on top of the minified file.


### Development Environment

I have re-used the CI/CD pipeline made with GitHub Actions, but I am not pushing the library to npm.
Since I use it for my own theme where it's self-hosted, there was no need.
But in hindsight, it may reduce "_share-ability_".

For the rest I followed the same pattern as I do for my other projects.
You can find my [typescript seed boilerplate project][5] as an example.
I set up [eslint][10] with the typescript plugin and some custom rules and went with `yarn` instead of `npm` for the package manager

I find the `package-lock.json` file a just too big compared to the `yarn.lock` one.
Plus I find `yarn` to give a better experience when installing packages.

#### Unit Testing Framework

I went from `mocha` to `vitest`, which sounds like quite a change, but the API is somewhat similar so it wasn't too bad.
Since I was using vite for the build system, I figured it would be easier to use the same test framework. 
It is very close to `jest` which I am used to.

I like running the test with `vitest`, it looks crisp in the terminal.
Here how it looks in the CI for example:

{% include aligner.html images="vitest.png" caption="Vitest run with coverage" %}

I also added the unit test coverage and some simple JS DOM tests to check the search functionality.
So I could raise the coverage level to a higher level.

### Integration Testing Framework

I fixed and updated the cypress framework, and migrated it to typescript as well to be matching with the rest.

Also now we have some _pre_/_post_ action to start the server to run the tests.
(But I don't stop the ci in the test, or it will consider the exit signal as a failure when it actually passes,
something to fix eventually).

```json
{
  "scripts": {
    "cypress:run": "cypress run",
    "precypress:run": "node scripts/start-jekyll.js",
    "postcypress:run": "node scripts/kill-jekyll.js"
  }
}
```

I also added more tests since I was at it, because who doesn't love some more robust integration tests?
Also, it's more in lined with how I use the search for my theme, 
which reduce the friction when making an update to the search plugin.
If it passes on cypress, it will work on my theme.

### Documentation & Examples

Revamp the [Jekyll website][6] so that it doesn't live on a separate branch, but directly in main.
It's now in the `/docs` and provide an example and specific documentation for the library.

I also updated the jekyll website to be compatible with the latest version of Jekyll, 
and fixed some minor UI issues that I had with it.
I could have used Type-on-Strap for the documentation, but that could have created some circular dependency or interferences.
I kept the example site simple, less work on my side too.


[1]: https://github.com/christian-fei/Simple-Jekyll-Search
[2]: https://github.com/sylhare/Simple-Jekyll-Search
[3]: https://vitejs.dev/
[4]: https://terser.org/
[5]: https://github.com/sylhare/typescript-seed
[6]: https://sylhare.github.io/Simple-Jekyll-Search/
[7]: https://github.com/sylhare/Type-on-Strap
[8]: https://en.wikipedia.org/wiki/Trie
[9]: https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm
[11]: https://en.wikipedia.org/wiki/Levenshtein_distance
[12]: https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_string-search_algorithm
[10]: {% post_url 2025/2025-03-21-Typescript-eslint-v9 %}