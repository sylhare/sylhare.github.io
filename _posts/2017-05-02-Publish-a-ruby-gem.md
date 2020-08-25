---
layout: post
title: Publish a Ruby Gem 💎
color: rgb(187, 10, 30)
tags: [ruby]
excerpt_separator: <!--more-->
---

Let's see how to make a ruby gem using the right format and specs, 
using the `type-on-strap` gem as an example.

<!--more-->

## Prepare the gemspec

I make sure the gem encompass all the files that I want using this regex in my `gemspec`:

```ruby
spec.files = Dir.glob("**/{*,.*}").select do |f|
    f.match(%r{^(assets|pages|_(includes|layouts|sass)/|(Gemfile|index.html)((\.(txt|md|markdown)|$)))}i)
  end
```

Here it uses a complex regex to select folder and files from all folder and sub folders.

> I could have used a `.reject` to remove some files, or a `&` after `end` to add manually a directory/page with `Dir[file, directory/**]`.

## Check the gem

First to test that the gem gets all the required documents:
```bash
gem build type-on-strap.gemspec 
gem unpack type-on-strap-x.x.gem 
```

## Run the gem locally

Here I had a jekyll gem so I updated my Gemfile with the current gem version I wanted to test:

```ruby
source "https://rubygems.org"
gem "type-on-strap", "1.x.x", path: "."
```

And the did the usual `bundle exec jekyll serve`.

## Deploy the gem

No I want to push the gem online and test it from there. 

```bash
# Push the gem online
gem push type-on-strap-x.x.gem 
# Delete the gem online
gem yank type-on-strap -v x-x 
```

Observe the result on [https://rubygems.org/](https://rubygems.org/gems/type-on-strap)
