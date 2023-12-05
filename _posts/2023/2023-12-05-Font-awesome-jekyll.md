---
layout: post
title: Add font awesome to your jekyll blog
color: rgb(83,141,215)
tags: [jekyll]
---

## Font Awesome

Font Awesome is a popular library of icons that you can use on your websites. 
It provides access to high-quality vector images that are used for UI icon. Some of the most famous are the hamburger,
the arrows, the sun/moon to switch theme or even here at the bottom with the different logos of website to follow me on.

`{% raw %}<span class="fab fa-stack-overflow"/>{% endraw %}` &emsp; → &emsp; <span class="fab fa-stack-overflow fa-lg"/>

The stackoverflow icon, for example! ☝️You must have seen them all over the web without realizing they might all be from the same library!

### CDN Installation

If you don't want to mess with the font-awesome internals and have it ready for use, you can [create a kit][5] with only
the parts you want from the font awesome website. It will create a link for you to add in the 
`{% raw %}<head>{% endraw %}` tag of your page:

```html
<head>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/{your-personalized-font-awesome-kit}">
</head>
```

You will need either an email or an account to get the generated [CDN link][5]. Then you can just start using it. 

If you are not familiar with [CDN][6] which is short for [**C**ontent **D**elivery **N**etwork][6]. 
It's a network of servers with some geographically closer to you that helps with fetching content like this fontawesome library. 
While the CDN does not host the content, it caches it, 
so it reduces the load on the serving hosting the resource and provide [improved performance][7]. So it's good for the user, 
which may have a page loading faster, 
and for the holder of the content which is less at risks from [DDoS attacks][7] or bandwidth issues.

However, that's not what we're going to do today! Because I'd rather have the jekyll theme work with a minimum
of externally fetched dependencies.

### Self-hosted Installation

We are going to use the self-hosted version of [Font Awesome][2], the one that's compatible with sass (files `.scss`) because
Jekyll is built-in with a [sass converter][1]. Sass (Syntactically Awesome Style Sheets) is a CSS preprocessor which 
means it makes writing CSS much less verbose and have scripting capabilities (defining variables and functions).

[Donwload][3] the free version for web of Font Awesome, so we can get started. The downloaded zip should look like:

```coffee
./fontawesome-free-6.5.1-web
├── css
├── js
├── less
├── metadata
├── scss
├── sprites
├── svgs
│   ├── brands
│   ├── regular
│   └── solid
└── webfonts
```

We are only going to need what's in the `scss` and `webfonts` package folder since we're going with the sass approach.
For the jekyll theme, I am using [Type-on-strap][4] which was already including font awesome version 5, so I am taking
the chance of this update to version 6 to write a quick walkthrough of the process.

## Jekyll setup

### font awesome setup

The content of the font awesome files is installed in two folders: 
- In the `_sass/external/font-awesome` folder with all the scss files. 
- In the `assets/fonts/font-awesome`, all the related fonts from the font awesome webfonts folder.

Since there are many more fonts and scss files, I reduced the tree structure of the theme to its minimum to understand
what's needed for font awesome to work:

```coffee
./Type-on-strap
├── _sass
│   ├── external
│   │   ├── _font-awesome.scss
│   │   └── font-awesome
│   │         └── // all font-awesome .scss files
│   └── type-on-strap.scss
└── assets
    ├── css
    │   └── main.css
    └── fonts
        └── font-awesome
            └── // all font-awesome fonts files
```

For the sass setup there are a couple of files that are interesting here. Just adding the font-awesome scss in the
`_sass` folder is not enough. Let's review what needs to be added in those extra files.

### Sass setup

The theme is already configured with [sass][8], with the `_sass` folder and the correct configuration in the
config yaml file:

```yaml
sass:
  style: compressed
```

We have created some extra files for the setup to be working:

- The `_sass/external/_font-awesome.scss` is used to import the necessary font-awesome sass file and overwrite variables,
so the next time you update you just have to update the content of the `_sass/external/font-awesome` from the downloaded
file.

```scss
// Overriding variables
$fa-inverse: var(--background);  // For it to use the theme's background colour 
$fa-font-path: "../fonts/font-awesome" !default; // To define the font's path

// Importing font-awesome's main files
@import 'font-awesome/fontawesome';
@import 'font-awesome/brands';
@import 'font-awesome/regular';
@import 'font-awesome/solid';
@import 'font-awesome/v4-shims';
```

As you can see in this file, I override some font-awesome sass variables, and I import what I need from the main
font-awesome files (which imports from the other scss files).

- The `_sass/type-on-strap.scss` is used to import all the other main sass file of the theme, including font-awesome.

```scss
/* TYPE_ON_STRAP Main style sheet */

/* External */
// CSS from external sources
@import 'external/font-awesome';

// Other files ... 
```

This is so all the sass files are preprocessed into one big files that can then be used by the CSS to load the style.
Which leads us to the last important file:

- The `assets/css/main.css` which is the main style file of the theme which will be imported in the head of the page.

```css
---
---

@import "type-on-strap";
```

The structure of the file is important. Now that everything is setup, you can update the HTML file of your base layout
to include the main in the _head_ tag:

```html
<link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}">
```

And with that, you should be able to see the fonts being displayed correctly when starting the theme.

## Difference between v5 and v6

Besides the expected code changes in each file, I could notice other differences between the Font Awesome v5 installation
compared to the Font Awesome v6 one.

Some files have been changed from a version to another:
- `_brands.scss`, `_regular.scss` and `_solid.scss` have been replaced by a `brands.scss`, `regular.scss` and `solid.scss`
- The `_larger.scss` seems to have been replaced by the `_sizing.scss` file
- There's a new variable more documented for the font path: `$fa-font-path` which is highly useful!
- The fonts of type `.eot`, `.svg` and `.woff` have been decommissioned and only `.woff2` and `ttf` are now supported.

There are also some icons that are not available anymore or changed. Unlike the [Twitter][10] icon which is still a bird 
and not an [X][10] 🤷‍♂️
All in all it seems to be working as fine as before with no change of configuration on my side.
(See for yourself with the [PR][12] for the update in the type-on-strap theme)
If you want the specifics about what has changed, Font Awesome is available on [GitHub][11]! 
You can check the release details from there as well


[1]: https://jekyllrb.com/docs/configuration/sass/
[2]: https://fontawesome.com/docs/web/use-with/scss
[3]: https://fontawesome.com/download
[4]: https://github.com/sylhare/Type-on-Strap
[5]: https://fontawesome.com/start
[6]: https://www.cloudflare.com/learning/cdn/what-is-a-cdn/
[7]: https://www.cloudflare.com/learning/cdn/cdn-load-balance-reliability/
[8]: https://jekyllrb.com/docs/assets/#sassscss
[9]: https://www.codecademy.com/resources/blog/what-is-sass/
[10]: https://www.cbsnews.com/news/twitter-rebrand-x-name-change-elon-musk-what-it-means/
[11]: https://github.com/FortAwesome/Font-Awesome
[12]: https://github.com/sylhare/Type-on-Strap/pull/411
