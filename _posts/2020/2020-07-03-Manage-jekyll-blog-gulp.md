---
layout: post
title: Gulp 🥤 to manage your jekyll assets
color: rgb(255, 99, 71)
tags: [jekyll]
---

As per the website says, [gulp.js](https://gulpjs.com/) is: 

> A toolkit to automate & enhance your workflow.
> Leverage gulp and the flexibility of JavaScript to automate slow, 
> repetitive workflows and compose them into efficient build pipelines."

You can follow the get started process [guide](https://gulpjs.com/docs/en/getting-started/quick-start/), but
if you already have node, it's as easy as:

```bash
npm install --global gulp-cli

# Test it with
gulp --version
```

The perfect kind of tool, that can be used when working with a static blog, css, js and jekyll I believe.
Let me share the experience, I had using it with the jekyll theme [Type-on-Strap](https://github.com/sylhare/Type-on-Strap).


## Images

### Minify image size 

This one use [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin).
It works great on a lot of format (those not supported are simply ignored).
You can pass configuration option like `imagemin({ ... })`.

```js
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');

gulp.task("img", function imging() {
  return gulp.src('img/**/*.{png,svg,jpg,webp,jpeg,gif}')
    .pipe(imagemin())
    .on('error', (err) => { console.log(err.toString()) })
    .pipe(gulp.dest('img/'))
});
```

This tasks takes all of the images in the folder and sub folder under _img/_ minify them and then put them back 
where they were.

### Thumbnails

For this one, I tried [gulp-responsive](https://www.npmjs.com/package/gulp-responsive) which is based on [sharp](https://github.com/lovell/sharp).
Sharp is a powerful image toolset for images built running solely with Node. 
However it does not provide stream capabilities yet which makes it hard to work with gulp right out of the box.

Go gulp-responsive is a gulp wrapper around sharp. And I had some issue with it. 
For instance, you need to set a settings for the responsiveness and when you go through the folder and sub folders, the `'*': settings` does not work, you need to select also `**/* : settings` to select also all sub folders.  
If no file is found, it generates an exception which is rather annoying. A simple info message would suffice.
Nevertheless the settings can be highly customized and provide some great features.

```js
// Supported formats: heic, heif, jpeg, jpg, png, raw, tiff, webp
const responsive = require('gulp-responsive'); 

gulp.task('thumbnails', function () {
  let settings = { width: '50%' };

  return gulp.src('img/**/*.{png,jpg,jpeg,webp}')
    .pipe(responsive({
      '**/*.*': settings,
      '*.*': settings,
    }))
    .pipe(gulp.dest('thumbnails'))
});
```

This task basically takes all of the images in _img/_ reduce the size by half and put them into a _thumbnails/_ folder at the same level as _img/_.

## Uglify JS

This one is a simple uglify / minify the javascript. It takes all of the partials and the create one big `main.min.js` file.
It's useful so that you can keep nice and separated each js parts of your website, and concat everything into one at the end.

```js
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

gulp.task('js', function minijs() {
  return gulp.src(['js/partials/**.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .on('error', (err) => { console.log(err.toString()) })
    .pipe(gulp.dest("js/"))
});
```

I chose [gulp-uglify](https://www.npmjs.com/package/gulp-uglify) because it seemed maintained and highly used.

## CSS tasks

### Clean CSS

This one was a particular task for some css handling.

```js
const cleanCSS = require('gulp-clean-css');

gulp.task('css', function minicss() {
  return gulp.src('css/vendor/bootstrap-iso.css')
    .pipe(cleanCSS())
    .on('error', (err) => { console.log(err.toString()) })
    .pipe(concat('bootstrap-iso.min.css'))
    .pipe(gulp.dest('css/vendor/'));
});
```

Basically it uses [gulp-clean-css](https://www.npmjs.com/package/gulp-clean-css) (a wrapper around clean-css), to clean the css.
Which means minify, and make sure that there's no issue with it.

### Process with Less

Then amazingly you can gulp your less tasks to process you css.
```js
const less = require('gulp-less');
const replace = require('gulp-replace');

gulp.task('isolate', function isolateBootstrap() {
  return gulp.src('css/bootstrap-iso.less')
    .pipe(less({strictMath: 'on'}))
    .pipe(replace('.bootstrap-iso html', ''))
    .pipe(replace('.bootstrap-iso body', ''))
    .pipe(gulp.dest('css/vendor/'));
});
```

This one was to isolate bootstrap css using less to wrap it all around the `.bootstrap-iso` class.
But then because of some conflicts, I had to replace html and body with nothing so it doesn't alter the overall css of the blog.
It's quite an annoying manual task that go automated in a couple of lines.  

### Serializing tasking

Finally you can serialize tasks, have them executed one after the other.
Which is good when you don't want to have to type multiple times the same gulp methods.

```js
gulp.task("isolate-bootstrap-css", gulp.series('isolate', 'css'));
```

You can also have a _"default"_ that runs all of your very used tasks (js, css, img, ...). 
So you run it all at once.

## Issues

The only issues I have, are not directly with Gulp, but rather the javascript eco system with its
millions of libraries.

It's a good point to have options, but when they get out dated, or out of support. 
You end up with security alert for outdated dependencies in your package lock (it's hard to track the dependencies of your dependencies of their dependencies ..).
Or sometime it just stops working.

