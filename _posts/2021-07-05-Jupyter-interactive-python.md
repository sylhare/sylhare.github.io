---
layout: post 
title: The Notebook ⎘ Jupyter's version 
color: rgb(69,184,172)
tags: [python]
---

Jupyter notebook is a tool to interactively develop with python. When working with datascience, it can through the use
of different block of code, text or rich content make it all integrate smoothly in one place.

> It's called notebook a notebook because you can _run_ bits of code, _add_ any content,  _edit_ and _save_ it all as one document.

All cells or _blocks of code_ have access to the same python Kernel. Hence, what has been run in one cell can be used in
another.

### Setup

If you're not sure of your python environment, follow [how to manage your python environment]({% post_url 2021-05-19-Manage-your-python-environments %})
article. Once python3 is set up, install jupyter with:

```bash
pip install jupyter
```

Then start a jupyter notebook using:

```bash
jupyter notebook
```

This will run jupyter notebook which you can then access through your web browser. Create
a [new notebook](https://www.dataquest.io/blog/jupyter-notebook-tutorial) file ending with `.ipynb` which will contain
all the necessary information of your notebook.

You can ignore the `.ipynb_checkpoints/**` folder in your `.gitignore`.

### Customization

#### Extensions

Let's add some jupyter packages for customization, first install the dependencies:

```bash
pip install jupyter_nbextensions_configurator jupyter_contrib_nbextensions
jupyter contrib nbextensions install
```

Everytime you install a package or do an extension modification, you'll have to restart the notebook for the effect to
be taken into consideration. You should now see a range of feature in a `Nbextension` tab.

#### Looks

You can also customize your notebook looks...

```bash
pip install jupyterthemes
```

Here is a full list of the available themes
from [towardsdatascience.com](https://towardsdatascience.com/7-essential-tips-for-writing-with-jupyter-notebook-60972a1a8901)
which is a _must see_ with so many great articles about jupyter notebook and datascience!

![jupyter-theme.png]({{ "assets/notebook/jupyter-theme.png" | relative_url }})

You can modify the theme by using these commands:

```bash
jt -l                           # To list the available themes
jt -t oceans16 -T -N -kl        # To add the theme with tool bar and logo
jt -r                           # To remove the theme
```

Like before once you run those commands you will need to restart your jupyter notebook for theme to be accounted for.
Basically it adds a `custom.css` in your `~/.jupyter/` folder.

### Magic commands

Jupyter magic commands come from [IPython](https://ipython.readthedocs.io/en/stable/interactive/magics.html) and will
usually start with `%`, use `%magic` for info inside a jupyter code cell.

The notebook is not only for python, you can change the language at the beginning of a cell using:

```python
%% ruby  # This cell will output "hello world!"
puts 'hello world!'
```

You can also use other language, find the list on
the [_jupyter edu_'s book](https://jupyter4edu.github.io/jupyter-edu-book/jupyter.html#:~:text=The%20Jupyter%20system%20supports%20over,%2C%20Scala%2C%20and%20many%20more.)

Another cool magic command is the `%%capture` which will capture the output of a code cell when displaying the content
is not necessary for example.

Finally, the last one is the `!` in front of the next command allow me to execute a command directly in the terminal:

```bash
!pip install pandas
```

This way you can install packages directly from your jupyter notebook, but you can also run other bash commands or
scripts.

### Conclusion

There's so much you can do with jupyter notebook, and it makes temporary scripting with python so much easier!
Also find a fully functional example in _/assets/notebook/_ which you can see the [exported HTML]({{ "/assets/notebook/Jupyter%20Notebook%20Example.html" | relative_url }}).

I used all the tricks in this article within [that notebook](https://github.com/sylhare/sylhare.github.io/blob/master/assets/notebook/Jupyter%20Notebook%20Example.ipynb), so its look may surprise you! 🎉 
