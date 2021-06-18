---
layout: post
title: Publish a python package
color: rgb(0, 83, 156)
tags: [python]
---

# Creating Python packages

A Python package is simply an organized collection of python modules. A python module is simply a single python file.

To create a python package, create a directory and then add a `__init__.py` file. Creating a package with `__init__.py`
is all about making it easier to develop large Python projects. It provides an easy way for you to group large folders
of many python scripts into a single importable module.

## Use PyPI to distribute your package

[PyPI](https://pypi.org/) is the Python Package Index a repository of software for the Python programming language. To
upload your project you will need:

- Create an account on Pypi
- Structure your code:

```groovy
Repository               # Root repository folder
├── package
|   ├── __init__.py	     # To make a python directory, for imports                           
|   └── module.py	     # Module of the package	  
├── tests
|   ├── __init__.py	     
|   └── test_module.py   # Tests of the module
├── Readme.rst
└── setup.py
```

## Create `setup.py`

This is the key file that describe your python package. You can create the `setup.py` following
the [guidelines on how to package and distribute your project](https://packaging.python.org/tutorials/distributing-packages/).

### Basic example

Here is a basic example of what you need to create your package. The minimum.

```python
from setuptools import setup

setup(name='package-name',
      version='0.1',
      description='Package description',
      url='http://link.to.the.source.code',
      author='name',
      author_email='name@example.com',
      license='MIT',
      packages=['package-name'],
      zip_safe=False)
```

### Add more information

#### Other Attributes

You can add some nice other things to your package:

- The `long_description`: Usually you put your readme there in `.rst` format
- The `classifiers`: You need to know which classifier to put, copy them
  from [pypi/classifier](https://pypi.org/classifiers/) to avoid typos.
- The `install_requires` to specify dependencies to run the project
- The `tests_require` to specify dependencies to test the project

#### Script entry point

The `entry_points` is another special attribute which is what the program will do when called a certain way depending on
the context. Here is an example from the command line:

```python
entry_points = {'console_scripts': ['package_hello = package.module:hello_world']}
```

What it does is once you've installed the `package_name`, then when you call it in bash using the
command `package_hello`:
It will execute the `hello_world` function of the module `module` that is inside the package `package`.

```bash
$ package_hello
> hello world!
```

#### Example

As for an example from my **gitlab_stats** package:

- The [`setup.py`](https://github.com/sylhare/gitlab_stats/blob/master/setup.py)
- How it looks online [gitlab-stats](https://pypi.org/project/gitlab-stats/) on pypi

## Create the Readme.rst

In PyPI, you need to use the `.rst` format for your readme which is basically the front page of your package. So if you
are more familiar with `.md`, you can always use [pandoc](https://pandoc.org/) to convert your file from `.md`
to `.rst`:

```bash
pandoc --from=markdown --to=rst --output=README.rst docs/README.md
```

## Package and upload

- Package your project into a `.tar`:

```bash
python setup.py sdist
```

- Download and install `twine` which will allow you to safely upload your project.

```bash
pip install twine
```

- Upload your project

```bash
python -m twine upload dist/*
```

When you upload your project, it might be refused due to naming problem. If that's the case you will have to rename your
project.

> Get started with a [python seed template](https://github.com/sylhare/pyhon-seed)
