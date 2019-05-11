---
layout: post
title: Publish a pyhton package
color: #00539C
tags: [python]
---

# Creating Python packages

A Python package is simply an organized collection of python modules. A python module is simply a single python file.

To create a python package, create a directory and then add a `__init__.py` file. 
Creating a package with `__init__.py` is all about making it easier to develop large Python projects. It provides an easy way for you to group large folders of many seperate python scripts into a single importable module.


## Use PyPI to distribute your package

[PyPI](https://pypi.org/) is the Python Package Index a repository of software for the Python programming language. 
To upload your project you will need:

- Create an account on Pypi
- Structure your code:
    
```bash
package-name             # Root repository folder
├── package-name
|   ├── __init__.py	     # To make a python directory, for imports                           
|   └── module.py	     # Module of the package	  
├── tests
|   ├── __init__.py	     
|   └── test.py          # Tests of the module
└── setup.py
```

- Create a `setup.py` using the [guidelines on how to package and distribute your project](https://packaging.python.org/tutorials/distributing-packages/).

## Create `setup.py`

This is the key file that discribe your python package.

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

## Package and upload

- Package your project into a `.tar`:

```bash
python setup.py sdist
```
    
- Download and install `twine` which will allow you to safely upload your project

```bash
pip install twine
```
    
- Upload your project

```bash
python -m twine upload dist/*
```

When you upload your project, it might be refused due to naming problem. If that's the case you will have to rename your project.

> More python example at [sylhare/Python](https://github.com/sylhare/Python)
