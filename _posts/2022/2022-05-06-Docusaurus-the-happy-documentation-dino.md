---
layout: post
title: Docusaurus the happy documentation dino
color: rgb(62, 204, 95)
tags: [open source]
---

[Docusaurus][1] 🦖 is a static-site generator based on Node.js with react components and made by Facebook. 
It has been open sourced now the v2 is in beta, so we'll check out this new alternative.

You may already have seen it while browsing in the [jest][2], [react native][3] or [gitlab documentation website][4].
It provides, web page, documentation and blogging features with plugin, layout and component customization. So let’s
take a quick tour in Docurassik World!

{% include aligner.html images="docusaurus.svg" %}

## Installation

For the [installation][1], I’ll use the typescript version using:

```shell
# create website
npx create-docusaurus@latest my-website classic --typescript
# Typescript required installation
npm install --save-dev typescript @docusaurus/module-type-aliases @tsconfig/docusaurus
```

This will create the project shell with a couple of pages, blog and some tutorial in the docs to get started.
If you want to see how it looks like check [sylhare/Docusaurus][10].

## Get started

### Config

The config is quite complex to follow when you are used to more traditional yaml format, but here are the main parts we
should be focused on:

```js
const config = {
  title: 'My Site',
  tagline: 'Dinosaurs are cool',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  themes: [],
  presets: [[ 'classic', ({}) ]],
  plugins: [],
  themeConfig: ({}),
};
```
Simplified like that you can see at the base we have the same basic information like the url, favicon title and other
thing for the website, then we have four other attributes used for further customization:

- The `themes` to add additional theme to the website (for functionality that might be added via a plugin)
- The `presets` is based on the `@docusaurus/preset-classic` with its specific option to customize the theme's features, 
  here it's using the classic one.
- The `plugins` to add the different plugins
- The `themeConfigs` which is where you should find most of the generic option to customize the theme.

```js
const themeConfig = ({
  navbar: {
    title: 'Docusaurus!',
    logo: { alt: 'My Site Logo', src: 'img/logo.svg' },
    items: [
      { type: 'doc', docId: 'intro', position: 'left', label: 'Tutorial' },
      { to: '/blog', label: 'Blog', position: 'left' },
      { href: 'https://github.com/facebook/docusaurus', label: 'GitHub', position: 'right' },
    ],
  },
  footer: {
    style: 'dark',
    links: [{ title: 'Docs', items: [{ label: 'Tutorial', to: '/docs/intro' }] }],
    copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
  },
  prism: { theme: lightCodeTheme, darkTheme: darkCodeTheme },
})
```

Decomposed this way you can see that the `themeConfigs` allows the customization of the navigation bar, the footer and
the dark/light css theme.

It can be a bit confusing honestly those themes, presets and themeConfigs with the settings at the root like favicon 
which are also generic config.
Also, the `({})` syntax makes it a bit heavy to read through, however the javascript is a plus to allow a more
dynamic configuration.


### Content

To customize your content you can use [MDX][9] file which are markdown files in which you can use React components.

There’s also the metadata which is the metadata of each “page” some can be defined in the yaml at the top of the file.
It’s called `frontMatter` as well. You can explore what they do in the [Docusaurus Client API][7].

For documentation, there’s the `__category__.json` (instead of a markdown file) which act as the configuration for the
folder you’re in:

```json
{
  "label": "Example",
  "position": 3,
  "link": {
    "type": "generated-index",
    "slug": "/example"
  }
}
```
The files in the folder will be place at the third position on the sidebar, under the name "Example" with the link `/example`.
The files will be displayed as boxes as well.

You can display items differently depending on your needs. I suggest you check the [docusaurus test
website][5] where most of the combination are displayed, find it also on GitHub to see how it’s made.

## Plugins

### Docusaurus made

I recommend using these docusaurus made plugin to enhance the experience, you can find a list of existing ones with
their information:

```shell
# Install base plugins
npm install --save @docusaurus/plugin-content-blog
npm install --save @docusaurus/plugin-content-docs
```

For blogging and documentation, you can enable some feature in `docusaurus.config.js`
Update the settings in the preset in the options:

```js
const config = {
  // other configs
  presets: [
    ['classic', /** @type {import('@docusaurus/preset-classic').Options} */
      ({ docs: {
          // With the plugin
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
        }
      })
    ]
  ]
}
```

You can have the author (as in by last git commit) and last update time in the documentation section.
The "reading time" of the blog post for blogs. Author are by default enabled via the front matter on the blog side.

### Search

You can use multiple ones, like the [algolia][11] one which is free for opensource on a separate server, or for example the
_lunr_ one which I am familiar with since it’s also available for jekyll website.
Add it to your project using:

```shell
# search
npm install --save docusaurus-lunr-search
```

Enable it in the config via the plugins option:

```js
const config = {
  // other configs
  plugins: [
    require.resolve('docusaurus-lunr-search'),
  ],
}
```

The interchanging of search provider is pretty seamless.
Like some other features, it will only fully work when building the site then serving it, so it’s normal if the search
appear broken when testing it with npm start only.

### Homemade

You can also create your own [plugin][6], the documentation is a bit challenging, because there are a lot of [things][6]
happening under the hood. It does not load automatically the static content, if you need it for your plugin, you'll
have to load it yourself in the `loadContent` hook to use it in your `contentLoaded`.

It uses a system of hooks and while their name seems speaking, I found them also a bit misleading at [first][6].
Here is a plugin example wrote in javascript as I did not see how to make it work in typescript:

```js
function friendsPlugin(context, options) {
  return {
    name: 'docusaurus-friend-plugin',

    async loadContent() {
      return { friends: ['Georg', 'Simon'] };
    },

    async contentLoaded({ content, actions }) {
      const { createData, addRoute } = actions;
      const friendsJsonPath = await createData(         // Create friends.json
        'friends.json',
        JSON.stringify(content.friends),
      );

      addRoute({
        path: '/friends', // Add the '/friends' routes, and ensure it receives the friends props
        component: '@site/src/components/Friend', // Simple component displaying the 'friends' passed in props
        modules: { friends: friendsJsonPath }, // propName -> JSON file path
        exact: true,
      });
    },
  }
}

module.exports = friendsPlugin
```

Then you can use your own plugin from within your repository, which must be place in _src/plugins_, ours is named
friend 🙆‍♀️ we use `path` to resolve it:

```js
const path = require("path");

const config = {
  // other fields
  plugins: [
    path.resolve(__dirname, 'src', 'plugins', 'friend'),
  ],
}
```

And since we created a page, let’s add it to our navigation bar as well, to easily check it out (using `navbar` in the
`themeConfig` as shown previously).
You would need to customize the component you created (referred in the plugin as `@site/src/components/Friend`) 
to make it look better.

## Themes

### Extra components

You can create components to use in your [MDX][9] files within a page, a blog or doc file, they’ll be rendered as a react
component. You can follow the same example as the home page and create a simple one:

```tsx
import React from 'react';

export default function Hello({name}) {
  return <span className="badge badge--primary">Hello {name}</span>;
}
```

Use [infima][9] to style your component in the `className`, it's the official one used in docusaurus' theme.
Then display it in a [MDX][9] file using:

```js
import Hello from "../../src/components/Hello";
<Hello name={"world"}/>
```

And that's it! If you only need the component once, you can also create it directly in the MDX file as well.

### Swizzle

You can [swizzle][12] the theme, which means extract by:
- **ejecting** part of the theme (the full code of the React layout component will be saved into your local repository)
- **wrapping** the component in a newly created wrapper one. (So most of the logic of the component stay hidden) 

When you swizzle the “swizzled” component will be used as part of the theme, you can also install components and set
them via the config. [Swizzling][12] in typescript can be done via:

```shell
# Swizzle
npm run swizzle @docusaurus/theme-classic -- --typescript
```

You can select the components you want to extract, some are safer than others. Unsafe means that the component will
likely change in a breaking manner which will cause you to update when updating docusaurus. It’s to use with caution if
you want low maintenance on your theme.

The swizzled components are stored in _src/theme_ and not in _src/components_ like the other extra components.


[1]: https://docusaurus.io/docs
[2]: https://jestjs.io/
[3]: https://reactnative.dev/
[4]: https://docs.gitlab.com/ee/
[5]: https://docusaurus.io/tests/docs/category/tests "Docusaurus test site"
[6]: https://docusaurus.io/docs/advanced/plugins "Docusaurus plugins"
[7]: https://docusaurus.io/docs/docusaurus-core#link "Docusaurus Client API"
[8]: https://infima.dev/docs/components "Infima (Docusaurus theme}"
[9]: https://mdxjs.com/
[10]: https://github.com/sylhare/Docusaurus
[11]: https://www.algolia.com/
[12]: https://docusaurus.io/docs/swizzling
