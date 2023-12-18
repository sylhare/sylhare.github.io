---
layout: post
title: Working with Jekyll collections
color: rgb(242,56,39)
tags: [jekyll]
---

Let's look at Jekyll's collections, which are a way to group information together within the static website generator
[Jekyll][1]. We've talked about jekyll before, so if you are new to it, check out this [article][10] or browse through
the related [jekyll articles][11].

Now let's go into the main subject! We are assuming you are working with Jekyll version 3.7.0 and above, for the 
demonstrated examples.

## Enabling Collections

To enable the collection feature, you can follow the [jekyll documentation][2], but let me get you a run down to set
it for two collections.

- _First_, add in your `_config.yml` file the collections:

```yaml
collections:
  portfolio:
    output: true  # For Jekyll to render the content of the collection
  conference:
    category: talk # To add metadata to all content of the collection
    output: true  
```

By default the collections' content is not rendered, so we need to specify the `output:true`. 
For the content to be picked up, the naming must match the jekyll `_` pattern.

- _Second_, add the content with the correct folder structure:

```js
.
├── _conference
│   └── // ...conference's content
├── _portfolio
│   └── // ...portfolio's content
└── _posts
    └── // ...posts
```

The `_portfolio` and `_conference` folders are now defined, and you can start adding some content into it. Same as any
page or posts, you can also create a specific layout for each collection. At this point it's up to you to make the
most of it.

## Navigating within a collection

You can use the name of the collection directly to navigate through its content, for example printing the title of
each element:

{% raw %}
```html
<h2>portfolio</h2>
<ul>
{% for item in site.portfolio  %}
  <li><a href="{{ item.url }}">{{ item.title }}</a></li>
{% endfor %}
</ul>
```
{% endraw %}

But the major drawback is that you need to access the collection by name using `site.portfolio` or `site.conference` 
which doesn't make for much flexibility.

## Going through all collections

In some cases, you would want to take care of each collection in a for loop without duplication using the previous
method. Worry not, as Jekyll has you covered!

Let's look at the `site.collections` object:

{% raw %}
```html
<p>{{ site.collection.size }}</p>
{% for collection in site.collections %}
  <p>{{ collection.label }} </p>
{% endfor %}
```
{% endraw %}

As you can see there's not **2** but **3** collections represented, `portfolio`, `conference` and `posts`! Even if there are no
posts, the collection is built-in. <br>
Now you could ignore it if you don't have posts as it won't interference, but if you do,
it's not as straightforward as you might think. 

Here's how to [loop through each collection][3] and print the collection's name and the title, url of each item:

{% raw %}
```html
{% for collection in site.collections %}
  <h2>{{ collection.label }}</h2>
  <ul>
  {% unless collection.label == "posts" %}  
    {% for item in site[collection.label] %}
      <li><a href="{{ item.url }}">{{ item.title }}</a></li>
    {% endfor %}
  {% endunless %}  
  </ul>
{% endfor %}
```
{% endraw %}

Using `unless` to display the content unless it's part of the posts collection.
Remember that if you are looping through a collection, to use metadata that is in the content of both collections or
you might get unexpected results.

## Conclusion

With this article, we've seen how to set up the basic collection features and how to push it further.
[Collections][3] can feel a bit redundant, since for the two main usages, there's already a pushed upon alternative:

- You could use collections for metadata, like in for a list of authors.
  - But you can also do that with `_data` and specify the data another yaml file.
- You could use collections for separate content, like here for different kinds of "posts" or "pages"
  - But you could also use metadata like `category` on the pages to filter them out.

But redundancy is not necessarily a bad, and collections give you some flexibility and out-of-the-box solutions
for common problems without having to deal with additional [liquid][4] markup customization in layouts.

We saw that _posts_ are a built-in collection in Jekyll. Mastering collections, means you can
leverage in the `_config.yml` file the `collections_dir: my_collections` options and put everything `_posts`
and other `_{collections}` under a new folder. Although it does trim the root of your project, for an open-source
theme that you wish to share, this might make adoption more complicated (more work for the end user to convert to your
theme).

[1]: https://jekyllrb.com/
[2]: https://jekyllrb.com/docs/collections/
[3]: https://www.emgoto.com/jekyll-loop-through-collections/
[4]: https://shopify.github.io/liquid/basics/introduction/
[10]: {% post_url 2021/2021-03-25-Run-type-on-strap-jekyll-theme-locally %}
[11]: {{ '/tags/#jekyll' | relative_url }}



