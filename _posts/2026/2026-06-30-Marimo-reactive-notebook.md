---
layout: post
title: The Notebook ⎘ Marimo's take
color: rgb(28, 115, 96)
tags: [ python ]
---

A while back I wrote about [Jupyter notebooks][10] and all the little tricks that make them pleasant to work with.
They're great for poking at data and keeping code, notes and plots in one place. But if you've lived with notebooks
for long enough, you know they also have a darker side: cells run in whatever order you click them, variables linger
after you delete the cell that made them, and the `.ipynb` file on disk is a wall of JSON that no code review tool
enjoys.

[Marimo][1] is a newer Python notebook alternative, and it makes a few different bets. 
The main one is that the notebook should behave like a spreadsheet,
change a value and everything that depends on it updates on its own.

## Introduction

A marimo notebook is a plain Python `.py` file with each cell being a function decorated with `@app.cell`.
So it's a clean diff compare to the cryptic `.ipynb` files.
You never click "_Run all_" and pray, and you never end up with a chart drawn from a variable you've
since changed three cells below.

The way it works, is that it analyzes the cells and creates a dependency graph and based on that determines the order
in which the cells are run based on where constants are initialized and used. 

> So you could technically have imports in the last cell and it would still work.

This prevents _out-of-order results_ or cell computation based on cached obsolete results. 
Marimo still caches the result of earlier untouched cells, 
so if you only change one cell, it will only re-run that cell and its dependent but not its parent by default.
You can still re-run all if needed.

Another consequence of this design is that you can't have multiple variable named the same in multiple cells.
I do find that as a plus so there's no ambiguity when using variables.

## Get started with a marimo notebook

Install it and open the editor:

```bash
pip install marimo
marimo edit notebook.py.  # open and edit the notebook
```

The editor runs in the browser like Jupyter, you could also run it with python directly since it's a Python file, 
but nobody really do that since we have such a convenient CLI.

### What a cell looks like

Since you'll probably be editing the notebook via the UI, you don't need to type that by hand, 
but it's worth seeing what ends up on disk:

```python
import marimo

app = marimo.App()

@app.cell
def _():
    import marimo as mo
    import polars as pl
    return mo, pl


@app.cell
def _(pl):
    df = pl.read_csv("sales.csv")
    df
    return (df,)
```

Notice the function arguments and the return tuple: marimo writes those signatures to record
what each cell needs and what it hands off.

Here, the second cell takes `pl` as an argument because it uses it, and returns `df` because the next cells will want it.
This is managed automatically when updating the notebook via the editor.

Also _Marimo_ don't bother giving actual function name, all are named `_`, 
because we never really call the cell within other cells. 
Marimo uses the argument and returns for its graph, not the function name. 
It's written in Python, but that's not a pattern to follow outside the notebook.

### Markdown cells

While the UI may seems like it, there's no separate "markdown cell" type. 
Text is just a cell that returns rendered Markdown through `mo.md`:

```python
@app.cell
def _(mo):
    mo.md(
        """
        ## Sales report

        The numbers below come straight from the CSV.
        Move the slider to filter by minimum revenue.
        """
    )
    return
```

Since it's a function call, you can build the Markdown from variables, which is where it gets interesting.

#### Add variables

Let's make reactive Markdown that will update automatically with formatted value, based on variable:

```python
@app.cell
def _(pl):
    # ...Calculation to get tea revenue
    return (tea_revenue,)


@app.cell(hide_code=True)
def _(mo, tea_revenue):
    mo.md(rf"""
    Tea revenue is {tea_revenue}$
    """)
    return
```

For it to work in the UI make sure to click on `f` at the bottom of the Markdown cell, so it formats the `{tea_revenue}`
with the actual value calculated from the previous cell.

#### Use sliders

Create an interactive slider with `mo.ui.slider` and map it to a variable to make it reactive.

```python
@app.cell
def _(mo):
    threshold = mo.ui.slider(0, 1000, value=200, label="Minimum revenue")
    threshold
    return (threshold,)


@app.cell
def _(df, mo, threshold):
    filtered = df.filter(df["revenue"] >= threshold.value)
    mo.md(f"**{len(filtered)} rows** above {threshold.value}")
    return (filtered,)
```

Drag the slider and the cell reading `threshold.value` re-runs by itself, along with anything downstream of
`filtered`. No callbacks to wire up, no `observe` handlers. The slider is a variable like any other, and the graph
takes care of the rest. Put the slider, the count, a table and a chart together and the whole thing reacts as one.

To move it further, you can even group related controls side by side keeps things tidy on the same line.

```python
@app.cell
def _(func, lower, upper, mo):
    mo.hstack([func, lower, upper], justify="center")
    return
```

Which renders as one neat row instead of three stacked inputs:

![marimo-controls]({{ "assets/img/marimo-controls.png" | relative_url }})

The `hstack` for horizontal stack should be a familiar concept if you've worked in frontend before.

#### Use LaTeX

Out of the box, `mo.md(r"...")` renders LaTeX, so equations filled notebook can have both theory and experimentation side by side.
This is really useful for any type of research work.

```python
@app.cell
def _(mo):
    mo.md(r"Energy and mass are the same thing: $$E = mc^2$$")
    return
```

The `$$...$$` comes out as typeset maths, sitting in the flow of the prose:

## Miscellaneous

### Hide noise

Use `hide_code=True` keeps a cell's code out of the editor, you can still edit the cell via a double click on it, but
it makes the code tidier

```python
@app.cell(hide_code=True)
```

This is usually added by default on Markdown cells, so you don't see both rendered and not rendered text.

### Serve several notebooks as one app

Marimo ships an ASGI[^1] helper, so a single `serve.py` can mount a handful of notebooks under one server, handy for a
small internal dashboard rather than one link per notebook.

```python
import marimo

server = (
    marimo.create_asgi_app()
    .with_app(path="/sales", root="./sales_analysis.py")
    .with_app(path="/", root="./executive_summary.py")
    .build()
)
```

It has never been easier to go from notebook to simple data app. 
Not necessarily production grade, but enough to get the point across during a demonstration.

### Declare dependencies inline

marimo understands the [`# /// script`][4] metadata block at the top of the file, so a
notebook can list its own packages and a tool like `uv` will spin up an environment for it, no separate
`requirements.txt` to keep in sync.

```python
# /// script
# requires-python = ">=3.11"
# dependencies = ["marimo", "polars", "plotly"]
# ///
```

With it also prompts you to run in a sandboxed venv and setup and install the dependencies with `uv` automatically,
which makes it very easy to share with most people.

### Export your notebook

Talking about sharing, Marimo does provide a way to export a rendered notebook that would allow anyone to enjoy.
Using the `--no-include-code` flag it can only keep the cell's output.

```bash
marimo export html notebook.py -o notebook.html --no-include-code   # static report, code hidden
marimo export html-wasm notebook.py -o site/ --mode run             # interactive, runs in the browser via WebAssembly
```

The static report is just a HTML file, you can see a [live read-only version][11] hosted here from the example.
Since there's no kernel behind it, the slider and everything aren't responsive, 
so prefer this method for none-interactive notebooks.

If you want the interactivity to survive, the second command compiles the whole thing to WebAssembly: the notebook
runs in the reader's browser through [Pyodide][3], so the sliders recompute for real with no server behind them. 

The full `.py` source lives in [_/assets/notebook/_][11] next to the Jupyter example, so you can `marimo edit` it
yourself, or `python` it as a plain script.


[^1]: Asynchronous Server Gateway Interface (ASGI)
[1]: https://marimo.io/
[2]: https://github.com/sylhare/sylhare.github.io/tree/master/assets/notebook
[3]: https://pyodide.org/en/stable/
[4]: https://packaging.python.org/en/latest/specifications/inline-script-metadata/
[10]: {% post_url 2021/2021-07-05-Jupyter-interactive-python %}
[11]: {{ "assets/notebook/marimo_notebook_example.html" | relative_url }}
