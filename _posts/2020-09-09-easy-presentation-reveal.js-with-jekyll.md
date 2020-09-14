---
layout: post
title: Easy hosted presentation with Reveal.js + Jekyll
color: rgb(198, 22, 115)
tags: [jekyll]
---

{% include aligner.html images="reveal-jekyll.png" column=1 %}

[Reveal.js](https://github.com/hakimel/reveal.js) is an open source HTML presentation framework.
With [Reveal Jekyll](https://github.com/sylhare/Reveal-Jekyll), the goal is to make it easier to manage your presentation and just focus on the content in markdown.

Basically you can see it as a boiler plate for your reveal.js presentation.
You can either write your slides as separate markdown files or put everything in one.

What's more! All default plugins are pre bundled with it and almost all reveal.js features are compatible with your reveal jekyll presentation.

> Get started with your presentation in less than 5min


## Set up

Make sure to install bundle which will ease the installation of jekyll:

```bash
gem install bundle
bundle install
```

Run the presentation using:

```bash
bundle exec jekyll serve
```

## Create your presentation

Workflow of your presentation:

{% include aligner.html images="slide-explanation.png" column=1 %} 

### Raw Markdown

Take a look at the [example](https://github.com/sylhare/Reveal-Jekyll/blob/master/index.html),
In `index.html` use the `layout: raw` and then you can create your slides directly in the file using markdown:

 - `___` Makes a basement slide
 - `---` Makes the next slide

### Using Jekyll capabilities

Take a look at the [example slides](https://github.com/sylhare/Reveal-Jekyll/tree/master/_slides) and [basements](https://github.com/sylhare/Reveal-Jekyll/tree/master/_basements),
In `index.html` use the `layout: presentation`. It will use the `_slides` and `_basements` folder to create the presentation.
 
#### Slide

Use the `_slides` folder to create a file per slide in markdown. 

```yaml

---
background: ...                 # Optional to put an image or a color as the background
video: "http://video-link.mp4"  # Optional to put a video as the background
transition: slide               # Optional change the transition type for this slide
---

Slide content in markdown
```

> Don't forget to add the two `---`.

To order the presentation you can do something like `01-First-slide-title.md`, `02-Second-slide-title.md`.

#### Basement slides

Basement slides can be put in the `_basements` folder.
The Basement slides are slides that will be accessible using the down arrow when on a particular slide.

They are the sub sections of your presentation:

```yaml

---
slide: slide-title
---
 
Content of the Basement slide in markdown

```

> Don't forget to use the `slide` attribute to specify under which slide it will fit.

#### Config

Configure Reveal.js in teh `_config.yml`:

```yml
reveal:
  transition: "slide" # none/fade/slide/convex/concave/zoom
  theme: "black" # beige/blood/league/moon/night/serif/simple/sky/solarized/white
```

You can set globally the transitions and theme of your presentation.

### Export presentation

To export the presentation use `?print-pdf` at the end of the url to be able to save the page as PDF:

```html
<url>:<port>/<base url>/?print-pdf
```

Try it at [.../Reveal-Jekyll/?print-pdf](https://sylhare.github.io/Reveal-Jekyll/?print-pdf)


### Use as a gem

There is a `Dockerfile` available, check it out to see how to use the theme in a Docker.
Basically you need 4 things to make it work as a gem:

- The Gemfile with the [reveal-jekyll gem](https://rubygems.org/gems/reveal-jekyll): `gem 'reveal-jekyll', '~> 0.0.2'`
- The `index.html` which is the entrypoint of your jekyll site and presentation (with explained above configuration)
- The `_config.yml` which defines your theme configuration.
- The presentation, assets and content you want to display.

And that's it you'd be good to roll!

 
