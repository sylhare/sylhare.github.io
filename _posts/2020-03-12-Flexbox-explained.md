---
layout: post
title: CSS Flexbox Explained
color: rgb(183, 107, 163)
tags: [css]
---

Flexbox (Flexible Box Module) was designed as a one-dimensional layout model, 
meaning that you align and distribute item through one direction (either horizontal or vertical).
It is very powerful and allow your layout to dynamically adjust based on the size of the screen.

## Introduction

### Working with HTML

Let's say you have multiple elements that are nested like this:

{% raw %}
```html
<div class="container">
    <div class="item"> ... </div>
    <div class="item"> ... </div>
    <div class="item"> ... </div>
</div>
```
{% endraw %}

And you want to make sure that they are all align, and well.
With the proper class assign like that we can now jump to the CSS part

### Flex your CSS

#### For the container

Flexbox works with a flex container which has a flex display:

```css
.container {
  display: flex; 
}
```

Other nice attributes for the container:

 - `flex-direction`: to decide which direction (`row` or `column`) the item are going to be displayed
 - `flex-wrap`: to avoid items overlaying the container, with `wrap` they'll automatically go on the next directional level
 - `justify-content` with `align-items`: To align items depending on the flex direction.

### For the items

A flex item that has different attributes:

```css
.item {
  /* default flex value, also called 'initial' */
     flex: 0 1 auto;
  /*
   * Which are the values for:
   * flex: flex-grow flex-shrink flex-basis
   */
}
```

Here are what each of them do:

  - `flex-basis`: relative size elements in the direction (`50%` means it takes half of the container)
  - `flex-grow`: with `0` stays original size, with `1` take the remaining space if any
  - `flex-shrink`: with `0` stays original size, with `1` if too big, will fit inside parents
  
The flex-grow, flex-shrink numbers can also act as a ratio, sharing a portion of what's available depending on the number.
For the size and flex-basis, there's a hierarchy between elements, conflicts are handled through that hierarchy.

## Reminder

### Flex Container

Everything to control your flex container:

{% include aligner.html images="flex-1.png,flex-2.png" %}

### Flex Item

All attributes you can use to manage your flex items:

{% include aligner.html images="flex-3.png,flex-4.png" %}

## Tips

Here are a list of problems and solution of flexbox related issues:

- Display flex makes all images stretched.
  - To fix it: `align-self: flex-start`

- Display flex text over flow on word wrap
  - To fix it: `min-width: 0` (to be in reset css file). Because it's overwritten with auto

- Display flex items width are not equal
  - Either use `width: 50%` or `flex: 1` to size components. Because model sizing is not the same.


## Sources

- [Alsa Creation](https://www.alsacreations.com/tuto/lire/1493-CSS3-Flexbox-Layout-module.html) for the images
- [Mozilla flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) for the specs.
- [CSS ticks](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) for a guide to flexbox
- [Cheat sheet](http://apps.workflower.fi/css-cheats/?name=flexbox) by @sakamies
