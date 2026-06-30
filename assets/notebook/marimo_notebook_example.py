# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "marimo",
#     "polars",
#     "plotly",
# ]
# ///

import marimo

__generated_with = "0.23.11"
app = marimo.App(width="medium")


@app.cell
def _(mo):
    mo.md("""
    # 🪄 A reactive marimo notebook

    A small companion example for the marimo article.
    Everything below is plain Python in a single `.py` file, the cells are wired together by
    marimo's dependency graph, so moving the slider re-runs only what depends on it.
    """)
    return


@app.cell
def _():
    import marimo as mo
    import polars as pl
    import plotly.graph_objects as go

    return go, mo, pl


@app.cell
def _(pl):
    sales = pl.DataFrame(
        {
            "product": ["Tea", "Coffee", "Cocoa", "Matcha", "Chai", "Mate"],
            "revenue": [120, 980, 320, 540, 210, 75],
            "units": [40, 210, 64, 90, 55, 30],
        }
    )
    return (sales,)


@app.cell
def _(mo):
    threshold = mo.ui.slider(0, 1000, value=200, step=10, label="Minimum revenue")
    threshold
    return (threshold,)


@app.cell
def _(mo, sales, threshold):
    filtered = sales.filter(sales["revenue"] >= threshold.value)
    mo.md(
        f"**{len(filtered)} of {len(sales)} products** make at least "
        f"`{threshold.value}` in revenue."
    )
    return (filtered,)


@app.cell
def _(pl, sales):
    tea_revenue = sales.filter(pl.col("product") == "Tea").select("revenue").item()
    return (tea_revenue,)


@app.cell(hide_code=True)
def _(mo, tea_revenue):
    mo.md(rf"""
    Tea revenue is {tea_revenue}$
    """)
    return

@app.cell
def _(filtered, mo):
    mo.ui.table(filtered, selection=None)
    return


@app.cell
def _(filtered, go):
    go.Figure(
        data=go.Bar(
            x=filtered["product"].to_list(),
            y=filtered["revenue"].to_list(),
            marker_color="rgb(94,129,172)",
        ),
        layout=go.Layout(
            title="Revenue by product (filtered)",
            xaxis_title="product",
            yaxis_title="revenue",
        ),
    )
    return


@app.cell
def _(mo):
    mo.md("""
    ---

    Drag the slider and watch the count, the table and the chart update on their own,
    no callbacks, no *Run all*. Delete the slider cell and `filtered` disappears with it.
    """)
    return


if __name__ == "__main__":
    app.run()
