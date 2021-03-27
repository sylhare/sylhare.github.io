---
layout: post
title: Run a jekyll theme gem locally
color: rgb(187, 10, 30)
tags: [jekyll]
---

Let's start from scratch on a macOS environment from the installation of ruby to actually running the theme.
The jekyll theme that we will be running is [Type-on-Strap](https://github.com/sylhare/Type-on-Strap).
If you are on a different operating system and have issues check out the [Jekyll docs](https://jekyllrb.com/docs/installation/).
If you have an issue you can refer to [Installation issue #57](https://github.com/sylhare/Type-on-Strap/issues/57) or open a new [one](https://github.com/sylhare/Type-on-Strap/issues/new/choose).

## Machine Setup

### Dev tools dependencies

Basically following my preferred way from the [Jekyll docs](https://jekyllrb.com/docs/installation/).
We're on macOS 10.15+, let's assume you have the [macOS developer tools](https://developer.apple.com/xcode/), and [brew](https://brew.sh/) installed using:

```bash
# Xcode is the macOS developer tool
xcode-select --install
# Check your version first
brew -v
Homebrew 3.0.8
Homebrew/homebrew-core (git revision 3f7c96754c; last commit 2021-03-22)
Homebrew/homebrew-cask (git revision a0a9782687; last commit 2021-03-22)
```

You are now a developer! 😛
So now you have met the basic requirements, let's go with the installation of Ruby. 

### Install Ruby
So Mac comes with a ruby installed:

```bash
ruby -v
ruby 2.6.3p62 (2019-04-16 revision 67580) [universal.x86_64-darwin19]
```

However, we won't be using it to avoid any weird issues. We'll use `rbenv` to install our own ruby version. 
This way we will be able to select which ruby version by default we want to use in the terminal.

```bash
# Install rbenv and ruby-build
brew install rbenv

# Set up rbenv integration with your shell
rbenv init

# At the end of the previous command, you'll need to add that to your zshrc
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
```

Once you have initialized it you can now install and use your own version of Ruby:

```bash
rbenv install 2.7.2
rbenv global 2.7.2

ruby -v
ruby 2.7.2p137 (2020-10-01 revision 5445e04352) [x86_64-darwin19]
```

Yeah, this part is done! You can use the above command to install a different version of Ruby, 
but keep in mind that the theme might not be compatible with older version. 

You can check the Ruby dependency of the gem at [rubygems.org](https://rubygems.org/gems/type-on-strap/).
There are also links for the documentation, issues and much more.

### Install Bundler gem

We will use the gem [bundler](https://bundler.io/) that is a gem manager that will allow us to install the ones we need for the jekyll theme.
Just do:

```bash
gem install bundler
```

The other necessary gem will be installed through bundler.

## Set up your Type-on-Strap theme

You don't need much for it to work as a gem.
Let's create a new folder and add the necessary files.
This is also to set up your folder structure to get started with Jekyll and blogging.

### Gemfile

Here is the gemfile that list the gem dependencies that will be installed later.

```bash
source "https://rubygems.org"
gem 'type-on-strap', ">= 2.3.3", "< 3.0"
```

### _config.yaml

You need at least the default config file in order for it to work

```yaml
baseurl: ""
theme: type-on-strap
```

Not that this is a very dry config, you may want to add the additional attributes for more customization.
It will display very basic information with just that, however the theme might look a bit different, and the blog part will not work. 

For type on strap, here are the basic customization attributes for your config file that you can add
so that most of the basic feature will work:

```yaml
# THEME-SPECIFIC CONFIGURATION
title: "My blog"
avatar: assets/img/avatar.png
favicon: assets/favicon.ico
header_text: Welcome to my blog!
header_feature_image: assets/img/banner.jpeg

# BLOG CONFIGURATION
post_navigation: true
paginate: 10
paginate_path: "blog/page:num"
plugins: [jekyll-paginate, jekyll-seo-tag, jekyll-feed]
```

With that you should have some basic configuration. 
The `jekyll-paginate` plugin is validated by Github and is used by many jekyll theme out there, you definitely need it for your blog.  

### index.html

The `index.html` is the root file, you will need to create one at the root.
In order for the file to be displayed add that into it:

```yaml
---
layout: home
---
```

This will render the home layout which is usually the main layout for a gem jekyll theme.

### Other files

Those are mostly optional depending on what you want to do with the theme:

- Create a `_posts` folder where you can put your blog articles
- Create an `_assets` folder where you can add images or other static files for your posts  
- If you want the pages shown in the Type-on-Strap demo site (About, Gallery, Portfolio, Search, Tags, Not found page 404),
you may want to copy the `pages` folder in here.
- To customize the theme you can always refer to the [documentation](https://github.com/sylhare/Type-on-Strap#configure-type-on-strap-)

## Install your dependencies and run

Now that you have your theme set up following the above, and you have added either some customization or not. 
Your folder structure should be similar to that:

```groovy
.
├── Gemfile
├── _config.yml
├── _posts
│   └── 2021-03-24-Example-blog-post.md
├── assets
│   ├── favicon.ico
│       └── img
│           ├── avatar.png
│           └── banner.jpeg
├── index.html
└── pages
    ├── search.md
    └── tags.md
```

Go in the root of your theme folder and install the dependencies using:

```bash
bundle install
```

Everything necessary for the theme will be installed (mainly jekyll and its dependencies for Type-on-Strap).
A `Gemfile.lock` will be created to track the version of the installed gems.
Then you can start running the theme using:

```bash
bundle exec jekyll serve
```

The theme should be available and running at [localhost:4000](http://localhost:4000).

The theme is built in a `_site` folder that is generated automatically. 
You can also ignore the `.jekyll-cache` folder which is used by jekyll.

## Conclusion

If you had any issue during the process you can always create an [issue](https://github.com/sylhare/Type-on-Strap/issues/new/choose) on the [Type-on-Strap](https://github.com/sylhare/Type-on-Strap) repository.

Even though we talked about this specific theme, most gem based jekyll theme should work fairly the same. This was the most default settings.
Some theme might add some more folders or pages or extra customizable stuff, so make sure you check out the doc.

Finally, if you want your theme to work the same locally and on Github-page, you can use the `remote-theme` attributes:

```bash
remote_theme: sylhare/Type-on-Strap
```

This way the theme will be built correctly on github-page as well, using directly the Type-on-Strap repository as a base like the gem would do with `theme`.
You can have both too, but you may receive a warning from Github Page if you have `theme` saying that it's not recognized as Github by default refuse all external gems.
That warning can be discarded.
