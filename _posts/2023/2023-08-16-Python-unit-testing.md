---
layout: post
title: TDD with Python's unittest
color: rgb(254,215,65)
tags: [python]
---

Let's get started with **[Python 3][1]** from scratch using the built-in libraries to lean Test Driven Development (TDD).
Assuming you have python 3 installed on your machine, you can check the version with `python --version` or `python3 --version`.
Feel free to follow this article to set up your python environment: [Manage your **python environments**][12].

This is _beginner level_, I may write another article with some more advanced tips and tricks requiring some cool 
libraries to scale your tests for your project. Let me know in the comment section if you are interested.

## Create a project

You would normally have your code and tests in different files.
Let's have our tests in a folder named "_test_".
Here an example of what the folder directory would look like:

```coffee
package
├──__init__.py
├── math
│   ├──  square.py
│   └── __init__.py
└── test
    ├──  square_test.py
    └── __init__.py
```    

The `__init__.py` tells python that the folder is a python module. This is also handy when you need to import a file from
another folder. Python will know where to look for on `import`.

## Implementation

### The test file

Let's start with `square_test.py` in the `test` folder which should contain the test class in which we will implement
our tests:

```python
#!/usr/bin/env python3
 
import unittest

class SquareTest(unittest.TestCase):
"""
SquareTest class to test the square function.
"""

if __name__ == "__main__":
unittest.main()
```

Let's describe what we have here:
- `#!/usr/bin/env python3` is the shebang, it tells the shell which interpreter to use to run the script.
- `unittest` is the default python library for unit testing
- `unittest.main()` under the if statement is so that we can run the test using `python test/square_test.py`

Then we have the `SquareTest` class which inherits from the class `unittest.TestCase`. With that, it offers
all the assertion methods that you will use to test your code.

### Writing the test

We have already talked about [**TDD**][10] (**T**est **D**riven **D**evelopment) in a previous python article about 
[**BDD**][10] (Behaviour Driven Development) but let's review the steps, it's pretty simple:

1. Write a failing test
2. Make the test pass with some non-trivial code (don't go hard coding the result)
3. Finally, you would [refactor][11] your code to reduce duplication, enhance readability, so it's easier to maintain.

So let's write our first test:

```python
class SquareTest(unittest.TestCase):
    def test_square_returns_squared_nummber(self):
        """
        The square method should return the squared value of the number
        """
        self.assertEqual(4, square(2))
        self.assertEqual(9, square(-3))
```

As you can see, we won't go with a complicated method to implement, it's plain simple math for this example.
In the test, the `self` refers to the object (like `this` in Java), 
you need to use it to access the assertion methods provided from the `unittest.TestCase` class.

> **tips**: Don't test the internals of the method, but the result.

This is a simple case, but as your projects gets bigger you might be tempted to verify that some actions were performed
or called during the test. While they may not be always avoidable, it's more relevant to test for the result, or
expected behaviour, so if the implementation change, the tests don't.

### Implementation

Let's make the test pass by implementing the square function:

```python
def square(number):
    return number * number
```

And here we have our `square` function that returns the squared value $$number^2$$ of the number passed in parameter.

> **tips**: The second step of TDD is not to write the best code, but to make the test pass. So you don't need to fall
> into an analysis paralysis phase thinking about the best way to implement it.

There's not a lot of code here which is good for a start. So [refactoring][11] is trivial, but as you add use cases
and features, the code will become more complex, and you will need to refactor it to keep it clean and maintainable.

### Refactoring

As we said, the last step of TDD is trivial on the first test case of a new feature in a new project. Which is rather
the exception! For the first step you should watch out for format, naming, and see if the code can be _reasonably_ 
reduced to fewer lines. Reasonably, because you don't want to go too far and make it unreadable. Check this [article][11]
for some more advices on refactoring.

For the next features, if you want to go further, you may want to make it possible to:
- handle any none number with a specific `NotANumber` exception
- Square a number from a string `"2"` -> `4`
  - You will want to convert the input as number, so be mindful of repeated conversion (using the exponent operator
  instead of the multiplication `int(number) ** 2`)
- have cubic, quartic, etc. functions
  - Once implemented, you will see a pattern, so you may want to refactor using a power function instead with
  `pow(number, exponent)` from the built-in `math` library.

## Conclusion

Well done on implementing your first test case in python! 🎉

And now that you are done with  all the test cases you could add a docstring `"""` to describe what
it is doing (e.g. `""" :return: the square of the input number """`).

They are _not_ mandatory, and can be used like _javadocs_ to describe the function and its parameters.
Some python library like [sphinx][2] use this documentation to write test directly within the documentation, so it's
easier to maintain and show how to use the library.

Now that you've learned the basics, you may want to try out a more extended testing framework like [pytest][3] which
could be an equivalent to _Jest_ in javascript or _JUnit_ in java for python.

[1]: https://www.python.org/
[2]: https://www.sphinx-doc.org/en/master/usage/extensions/doctest.html
[3]: https://docs.pytest.org/en/7.4.x/
[10]: {% post_url 2017/2017-12-28-Python-bdd-with-lettuce %}
[11]: {% post_url 2022/2022-09-14-Software-engineering-refactor-tips %}
[12]: {% post_url 2021/2021-05-19-Manage-your-python-environments %}
