---
layout: post
title: Enhance your Jekyll theme!
color: rgb(154, 139, 79)
tags: [jekyll]
---

Here are some of the "_advanced_" techniques that you can use when working with Jekyll.
It's a compilation of Jekyll tips that I have tried or used within this theme [Type-on-Strap][1].
Hopefully some of them will be useful for you too! 🧪

I am always on the lookout for new Jekyll tips, so if you have another ace up your sleeves, let me know in the comments!

## 1. Use the Jekyll folder structure

I like when my files are tidy, and when working with jekyll your `_includes` folder might start to feel a bit bloated 
once you've added multiple small parts of layout for better re-use.

But fear not! As you can create sub-folders! 🔥 This way you can separate the more "public" _includes_ intended to be used
within a markdown for blogging, from the more private one which are used for the theme's base.

```powershell
# Inside _includes
. 
├── gallery.html   # "public" include to use in a page
├── aligner.html   # "public" include to use in a blog post to align images
├── blog           # Everything related to the blog layout
│   ├── blog.liquid
│   ├── blog_nav.liquid
│   ├── post_info.liquid
│   └── post_nav.liquid
├── default        # Everything related to the overall site layout
│   ├── footer.liquid
│   ├── head.liquid
│   ├── navbar.liquid
│   └── tags_list.liquid
└── social         # Everything related to the social (comments, shares, ...)
    ├── cusdis.liquid
    ├── disqus.liquid
    ├── icons.liquid
    ├── share_buttons.liquid
    └── utterances.liquid
```

Keep in mind that having too many includes may actually slow down your build, you can verify that by using:

```bash
$> jekyll build --profile

Site Render Stats: 

| Filename                                                 | Count |    Bytes |  Time |
+----------------------------------------------------------+-------+----------+-------+
| _layouts/default.html                                    |    29 |  451.22K | 0.118 |
| _includes/default/head.liquid                            |    29 |  125.81K | 0.064 |
| _layouts/post.liquid                                     |    20 |  155.91K | 0.062 |

```

It will print the top time spender pages of your theme and how much time they've been called to render your blog.
Some solution exists for that like [`jekyll-include-cache`][3] but will not be compatible with GitHub page. 🤷 

## 2. Use _data folder

The `_data` folder allows you to keep a clean `_config.yml` while having a tidy place to save additional theme information.
It's commonly used for authors in a `authors.yaml` to be linked with the author key in a post metadata:

```md
---
title: Blog post
author: sylhare
---

... content
```

And inside the `authors.yml`, there are some information that will be used to display the author:

```yml
sylhare:
  name: Sylhare
  avatar: "assets/img/avatars/sylhare_avatar.png"
  url: "https://github.com/sylhare"
```

Access the data within your template using `site.data.authors[page.author]` where `page.author` is automatically 
resolved by Jekyll.
You may also want the html relying on data to be working when there's no data setup, for example with localisation.
For that you can set up a default using liquid:

{% raw %}
```liquid
{{ site.data.language.str_next_page | default: 'Next' }}
```
{% endraw %}

If the `str_next_page` is not defined in the language yaml file in the data folder then "_Next_" will be the value by
default.

## 3. Use advanced liquid markups

Liquid is the templating language used with Jekyll, and it can do a wild range of operation.
For example, in this snippet I loop over all the blog posts and concatenate all the tags into a `|` string, such as
`|jekyll|ruby|other tag|` and add it to a `rawtags` string containing all the tags.

{% raw %}
```liquid
{% assign rawtags = "" %}
{% for post in site.posts %}
    {% if post.tags.size > 0 %}
        {% assign post_tags = post.tags | join: '|' | append: '|' %}
        {% assign rawtags = rawtags | append: post_tags %}
    {% endif %}
{% endfor %}
```
{% endraw %}

Then you can do operation on the string itself, here I split the `rawtags` into an array of unique tags that I can then
use to display the site tag's list.

{% raw %}
```liquid
{% assign tags = rawtags | split:'|' | sort | uniq %}
````
{% endraw %}

All of that was done purely in Jekyll and is the base of the `tags.liquid` and `tag_list.liquid` of the [Type-on-Strap][1] 
theme for the tags page.

## 4. Refine your `_config.yml`

This is the main file of your theme, so you want it to be as lean as possible.
There's a balance between customization possibility and extensive configuration boilerplate.

> The theme should be working and rendering correctly with as little configuration as possible in the `_config.yml`. 

Besides, the theme's configuration, there is also the [Jekyll's configuration][4] that you can also tweak. 
Some of them can actually increase build time.
For example:

```yaml
exclude: [".jekyll-cache", "node_modules/**", "vendor/*"] # Keep jekyll out of files not used in the site
keep_files: ["assets/img"]                                # Let jekyll file know that these files are static
incremental: true                                         # When working locally to avoid rebuilding everything on change 
```

Use what makes sense in your case.

## 5. Use the github-pages gem for GitHub

If you plan on deploying your jekyll website on GitHub page, be warned that your local gem/ruby version might 
not be the one actually used in the GitHub servers to render your website.

To check compatibility, you can find it [online][6] or via the gem:

```bash
# directly
github-pages versions
# via bundler
bundle exec github-pages versions
```

And you can add that in your Gemfile, the `:jekyll_plugins` group is optional, but a cool feature offered by jekyll.
It offers a neat way to manage Jekyll's plugin dependencies, 
when you specify in your Gemfile and run `bundle install`, they will be installed and added as required when running the site:

```ruby
# Gems loaded irrespective of site configuration.
group :jekyll_plugins do
  gem 'github-pages'
end
```

It makes your Gemfile more structured with all plugins' dependencies in one place.
The `github-pages` gems are deemed "_safe_" by GitHub; hence they are the only one allowed when deploying your jekyll
website on GitHub page.

## 6. Use extra tools 🛠

As mentioned before, I use [gulp][10] to automate some blogging tasks, like minimizing images, thumbnails or do some
computation on css or js files.

You can also pre-build your jekyll site locally and push the `_site` folder, on which you may have applied some
reducing tasks to skim the size of the files. Building your site locally also means you can use some gems not allowed by
GitHub page! Once built you're just using GitHub's page as a web server.
There's also [GitHub's action][11] that you can leverage to automate part of your workflow as well.

Jekyll is compatible with [sass][5] in the `_sass` folder by default which makes css much easier to handle, 
so you can customize the look and feel with more ease. 
 

[1]: https://github.com/sylhare/Type-on-Strap
[2]: https://github.com/github/pages-gem
[3]: https://github.com/benbalter/jekyll-include-cache
[4]: https://jekyllrb.com/docs/configuration/
[5]: https://jekyllrb.com/docs/assets/#sassscss
[6]: https://pages.github.com/versions/
[10]: {% post_url 2020/2020-07-03-Manage-jekyll-blog-gulp %}
[11]: {% post_url 2021/2021-09-03-Ruby-setup-from-test-to-deploy %}
