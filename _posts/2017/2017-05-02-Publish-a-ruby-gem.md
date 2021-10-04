---
layout: post
title: Publish a jekyll themed Ruby Gem 💎
color: rgb(187, 10, 30)
tags: [jekyll]
excerpt_separator: <!--more-->
---

Let's see how to make a ruby gem using the right format and specs, 
using the `type-on-strap` jekyll-theme gem as an example.

<!--more-->

## Prepare the gemspec

Find an example of the [`type-on-strap.gempsec`](https://github.com/sylhare/Type-on-Strap/blob/master/type-on-strap.gemspec)
It's all straightforward, the only tricky part is to make sure that your gem has everything you need.

To do that I am using this regex:

```ruby
spec.files = Dir.glob("**/{*,.*}").select do |f|
    f.match(%r{^(assets|pages|_(includes|layouts|sass)/|(Gemfile|index.html)((\.(txt|md|markdown)|$)))}i)
  end
```

Here it uses a complex regex to select folder and files from all folder and sub folders.

> I could have used a `.reject` to remove some files, or a `&` after `end` to add manually a directory/page with `Dir["file", "directory/**/*"]`.

## Check the gem

First to test that the gem gets all the required documents:

```bash
# Build the gem
gem build type-on-strap.gemspec
# Unpack the built gem 
gem unpack type-on-strap-x.x.gem 
```

You can check in the unpacked gem folder all the files included in your gem.

## Run the gem locally

Here I had a jekyll gem, so I updated my Gemfile with the current gem version I wanted to test:

```ruby
source "https://rubygems.org"
gem "type-on-strap", "1.x.x", path: "." # or gemspec
```

Then did the usual `bundle exec jekyll serve`.

## Deploy the gem

Now I want to push the gem online and test it from there. 

```bash
# Push the gem online
gem push type-on-strap-x.x.gem 
# Delete the gem online
gem yank type-on-strap -v x-x 
```

Observe the result on [https://rubygems.org/](https://rubygems.org/gems/type-on-strap)
