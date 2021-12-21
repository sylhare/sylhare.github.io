---
layout: post 
title: Ruby setup from test to deploy 
color: rgb(205,33,42)
tags: [misc]
---

For this article I created an example gem [sylhare/Vermelinho](https://github.com/sylhare/Vermelinho), obviously based
on the [Make your own gem](https://guides.rubygems.org/make-your-own-gem/) from the ruby gem guide.

Let's check the set up, tests, and how to deploy the gem

## Create Gem

You don't need much to create a gem, only create a `*.gemspec` file at the root of your project. Here is an example Gem
tree structure for the gem _vermelinho_:

```groovy
.
├── Gemfile                                 // Gem necessary to install for it
├── Gemfile.lock                            // Lockfile of the installed dependant gems
├── Rakefile                                // For the test
├── bin
│   └── vermelinho                          // Executable
├── lib
│   ├── lingo
│   │   └── translator.rb                   // Gem module
│   └── vermelinho.rb                       // Gem main class
├── test
│   └── test_vermelinho.rb                  // tests
└── vermelinho.gemspec                      // Gem specifications
```

For the _gemspec_ file you can use something like:

```ruby
Gem::Specification.new do |s|
  s.name = 'vermelinho'
  s.version = '0.0.1'
  s.summary = "vermelinho!"
  s.description = "Vermilinho attempts to translate 'hello world' in multiple languages"
  s.authors = ["sylhare"]
  s.files = Dir["lib/**//*"]
  s.homepage = 'https://github.com/sylhare/Vermelinho'
  s.license = 'MIT'
  s.executables << 'vermelinho'
end
```

With _s_ that can be referred as the _"spec"_ of the gem. Once deployed, the information set is displayed in the Gem
package host.

## Tests

### Install the dependencies

To run the tests, you will need some dependencies, that you can put in your _Gemfile_:

```ruby
source "https://rubygems.org"

gem "rake"
gem "minitest"

gemspec
```

The _source_ specifies where the gems will be "looked for", and the _gempsec_ will reference the gem that you put in
your `*.gemspec` file.

> Your gemspec can also include development dependencies:
> ```
> spec.add_development_dependency 'example', '~> 1.1', '>= 1.1.4'
> ```

You can use [`bundler`](https://bundler.io/) which facilitates the management of your gems with:

```shell
gem install bundler   # to install bundler
bundle install        # to install the dependencies
```

### Write the test

Let's write a test class with a first test inside, we'll use _require_ to specify the necessary package:

```ruby
require 'minitest/autorun'
require 'vermelinho'

class VermelinhoTest < Minitest::Test
  def test_english_hello
    assert_equal "hello world", Vermelinho.hi("english")
  end
end
```

This is a basic test making sure that _hi_ in english is _"hello world"_. Now to run the tests you need to modify your _
Rakefile_ with:

```ruby
require 'rake/testtask'

Rake::TestTask.new do |t|
  t.libs << 'test'
end

desc "Run tests"
task :default => :test
```

With that set, now when we run:

```shell
rake test
```

We get the result of our test 🎉

### Using GitHub action

There's nothing to do on this step, the [`Ruby`](https://github.com/actions/starter-workflows/blob/main/ci/ruby.yml)
template workflow already does everything for you. Just go to Actions > New Workflow > Ruby and you should be set.

Check [Building and testing ruby](https://docs.github.com/en/actions/guides/building-and-testing-ruby) on GitHub for
more info.

## Implementation

So much TDD (Test Driven Development) going on 😛 now we're going to actually implement the logic. Here the
implementation does not really matter, let's have a look at a simplified version for our use case.

First the main class:

```ruby
class Vermelinho
  def self.hi(language = "english")
    translator = Translator.new(language)
    hi = translator.hi
    return hi
  end
end

require 'lingo/translator'
```

You can see at the end that we have a `require 'lingo/translator'` which is mandatory to be at the bottom. It references
the code in the lingo module where the translator class named `class Vermelinho::Translator` is located.

Let's pretend that `translator.hi` always return _"hello world"_ as there is nothing else of interest in it for us.

## Deploy

Now that you have nice gem packaged, tested and implemented you will want to deploy it to a package host so that other
people can enjoy it.

### Naming convention

Naming is key, you can't have two gems under the same name, so verify that the name you have chosen is available!
Also depending on the name of your gem, you may "_require_" them differently in your code.

Check the rubygem guide on [how to name your gem](https://guides.rubygems.org/name-your-gem/), tl;dr:

- The `_` doesn't change in require and gets "CamelCased" in class name:
    - e.g. gem ruby_parser:
        - `require 'ruby_parser'`
        - Main class: _RubyParser_
- The `-` are replaced by `/` in require and `::` in class name:
    - e.g. gem rdoc-data:
        - `require 'rdoc/data'`
        - Main class: _RDoc::Data_

The name of the gem is specified by the _name_ attribute in the _gemspec_.

### Using GitHub Action

The GitHub action already exists to deploy the gem, go to: Actions > New Workflow > Ruby Gem. By default, it is
available for both [GPR](https://github.com/features/packages) (GitHub packages registry) and RubyGem.

In order to only push on release, I added:

```yaml
on:
  push:
    tags:
      - v*
```

So it only pushes on new tagged commits tagged with a name starting with `v`. Also you can
have `continue-on-error: true` if you're okay with the task failing for now.

#### Github GPR

The only requirement to push a gem to the GitHub Package Registry is to make sure that the gem name is the same as the
repository name. In our case:

- repo: [sylhare/Vermelinho](https://github.com/sylhare/Vermelinho)
- gem: [vermelinho](https://github.com/sylhare/Vermelinho/packages/)

You can see it deployed in the [project](https://github.com/sylhare/Vermelinho/packages/).
The `secrets.GITHUB_TOKEN` doesn't need to be created since it's already within the action's environment.

#### Rubygem

To deploy on [Rubygems](https://rubygems.org/) you will need to create an api key in _Settings > Api keys > New Api Key_.
I suggest using the gem's name as key identifier and use those permissions:

- Index rubygems 
- Push rubygem

After that create a [GitHub secrets](https://docs.github.com/en/actions/reference/encrypted-secrets) in _Settings >
Secrets > Add New Repository Secret_ with name `RUBYGEMS_AUTH_TOKEN` and value your rubygem api key.

You can see it deployed on [rubygem](https://rubygems.org/gems/vermelinho) 💎
