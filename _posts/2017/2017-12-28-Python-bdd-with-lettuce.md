---
layout: post
title: Python BDD with lettuce
color: rgb(0,155,119)
tags: [python]
---

## Introduction

### Core concept

BDD stands for Behaviour driven development mostly used in *Agile development*, it follows the same principle as TDD (Test driven development), 
writing your test before the code.

The key point is not only to test using unit test, but also having the application tested end to end using acceptance tests.
The process can be simply defined as:

- Write a failing acceptance test
- TDD cycle (Test fails ❌, make it pass ✅, refactor the code 🏗)
- The acceptance test should pass

Acceptance tests make use of an English (or possibly alternative) language format called [Gherkin syntax](https://en.wikipedia.org/wiki/Cucumber_(software)#Gherkin_language) in the feature file,
describing what the test is covering and the individual tests themselves.

### Acceptance Tests with Gherkin Syntax

Acceptance tests were introduced with the [Cucumber Framework](https://cucumber.io/) 🥒.
The syntax is quite easy to understand, and, in the Lettuce Python package, makes use of a range of keywords to define your features and tests:

- Given
- When
- Then 
  
... and more to make more english like when stacking them up.

With this framework, the acceptance tests will be saved in a `.feature` file. 
It's decomposed into multiple blocks:

- Feature:
    - Where you write your documentation for what this group of test is cover, no code executed here. Only for comprehension
- Background:
    - Executed prior to every *Scenario* in the `.feature` file, like a setup.
- Scenario:
    - Here you define the test, the first line is for documentation and then the test (with the given syntax).

Once the `.feature` has been created  you need to have a `steps.py` that will create the test from the features (it's not just magic).
The `steps.py` uses RegEx with lettuce to read the input and execute the test.

## Example in Python

Following the tutorial from [code tutorial's plus](https://code.tutsplus.com/tutorials/behavior-driven-development-in-python--net-26547)
by [David Sale](https://tutsplus.com/authors/david-sale)

### Project Structure

The project should be structured like:

```
Root
  |_ app
  |   |_ __init__.py
  |   |_ calculator.py
  |
  |_ tests
      |_ __init__.py
      |_ features
          |_ factorial.feature
          |_ steps.py
 ```  

### Installation

For the process, once you have python **2.x** installed (because lettuce is only compatible with Python 2.x):

- Install [lettuce](http://lettuce.it/index.html) that will be used as the *Gherkin* parser.

```bash
pip install lettuce
```

- Install the same test module as in tdd such as [Nose](http://nose.readthedocs.io/en/latest/):

```bash
easy_install nose
# or
pip install nose
```

### Writing a scenario

So here would be an example of a `factorial.feature` with one scenario:

```yaml
Feature: Compute factorial
  In order to play with Lettuce
  We'll implement factorial in a calculator

Background:
  Given I am using the calculator

Scenario: Factorial of 4
  Given I have the number 4
  When I compute its factorial
  Then I see the number 24
```

The text in _Feature_ is descriptive, the _Background_ gives a step that will be used for every scenario.
Then we have the _Scenario_ which contains the actual test.

Usually the setup is done in the `Given`, then an action is triggered in the `When` and the result is validated in the `Then` phase.

### Implementing a step

In the `steps.py` you can implement the code that will be executed on a Gherkin sentence like: 

```bash
Given I have the number 4
```

The code behind it will look like:

```python
from lettuce import world

@step('I have the number (\d+)')
def have_the_number(step, number):
    world.number = int(number)
```

The `world` is a built-in lettuce tool that allow you to link all the steps together.
For example the calculator could be in `world.calculator` depending on how you set it.

You can see that the parsing is done via some regex in the `@step` the number variable passed into the method is caught via the `(/d+)`
in the regex. You can pass as many variable as you want.
Find online some BDD cheatsheet to create better steps.

### Executing the features

You can either run just one feature file, or,
if you pass a directory of feature files, you can run all of them.

```bash
lettuce tests/features/factorial.feature 
```

Then you will see each scenario and the corresponding result.
Having it available only for Python 2.x is a bit of a let down, they may make it available with Python 3.x in the future.

