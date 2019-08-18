---
layout: post
title: Publish a Ruby Gem
color: rgb(187, 10, 30)
tags: [ruby]
---

Using my `type-on-strap` gem as an example

## Prepare the gemspec

I make sure the gem encompass all the files that I want using this regex in my `gemspec`:

```ruby
spec.files         = Dir.glob("**/{*,.*}").select do |f|
    f.match(%r{^(assets|pages|_(portfolio|includes|layouts|sass)/|(LICENSE|Gemfile|_config.yml|index.html)((\.(txt|md|markdown)|$)))}i)
  end
```

> I could have used a `.reject` to remove some files, or a `&` after `end` to add manually a directory/page with `Dir[file, directory/**]`.

## Check the gem

First to test that the gem gets all the required documents:
```bash
gem build type-on-strap.gemspec 
gem unpack type-on-strap-x.x.gem 
```

## Deploy the gem

No I want to push the gem online and test it from there. 

```bash
# Push the gem online
gem push type-on-strap-x.x.gem 
# Delete the gem online
gem yank type-on-strap -v x-x 
```

Observe the result on [https://rubygems.org/](https://rubygems.org/gems/type-on-strap)
