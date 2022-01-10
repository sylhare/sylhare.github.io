---
layout: post
title: Manage your Python environments
color: rgb(0,155,119)
tags: [python]
---

One of the most frustrating source of errors with Python is a result of environment mismanagement.
So let's review some pain points, and how to correctly set up Python on macOS, and use virtual environments.

## Examples

### Mixing Python version 

One could be about mixing python2 and python3 environment which leads to weird error:

For example on exception can exist in Python3:

```bash
# Python 3.9.4 
>>> FileNotFoundError
<class 'FileNotFoundError'>
```

However, yield an error in Python2:

```bash
# Python 2.7.16 
>>> FileNotFoundError
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'FileNotFoundError' is not defined
```

Since python2 is getting deprecated it should occur less.

### Mixing python environment 

Even within the same python distribution it can happen, when you multiply the virtual environment:
When you install a module but get:

```python
Traceback (most recent call last):
File "./test.py", line 3, in <module>
  import matplotlib.pyplot as plt
ImportError: No module named matplotlib.pyplot
```

In fact, you may have installed it in your global python environment instead of the current virtual one.
In that case, it's always helpful to run: 

```bash
which python
/may/not/be/the/one/you/expect/bin/python
```

To see who you're calling, because `python3` could not be the same as `python` or `python2`.<br>
Same as when you install a package:
```bash
python -m pip install <package>
pip3 install <package>
```
Those two may not be the same depending on your environment.

## Managing your python environments 🌍

### Python Installation (macOS)

I would recommend a python version Manager like [pyenv](https://github.com/pyenv/pyenv) that will allow us to manage multiple versions of python on Mac.
It works great, and you'll have a definite knowledge of which python you are actually using.

Here is the installation process, with python _3.9.4_:

```coffee
brew install pyenv
pyenv install 3.9.4
pyenv global 3.9.4

echo -e 'eval "$(pyenv init -)"' >> ~/.zshrc
```

To see the versions installed you can use, and see with the _*_ which version is installed:

```bash
$ pyenv versions
  system
  3.7.3
* 3.9.4 (set by /Users/sylhare/.pyenv/version)
```

You can set a new version using the `pyenv global <version>` if you have it already installed.

> Remember that if you have installed a package on _3.7.3_, you will need to reinstall it when you switch to _3.9.4_ to have access to it.

Typing `pyenv` will list the help, and you can better see for yourself all you can do with it.


### Set up the Virtual Environment 

Virtual environment are great, because you can install weird package or more experimental packages that require you to change some internal mechanisms.
You can then just discard it without messing your whole system.

To create a python virtual environment you can use [venv](https://docs.python.org/3/library/venv.html) which is a core component of Python3:

```coffee
python -m venv venv
source venv/bin/activate
```

This way you create a virtual environment in a folder named _venv_, then you can activate that environment.
You can make sure it's activated by your terminal having `(venv)` prefixed:

```bash
(venv) which python
~/project/venv/bin/python
```

To stop the virtual environment just type `deactivate`, and your shell will turn back to normal.
