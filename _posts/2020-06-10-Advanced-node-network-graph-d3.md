---
layout: post
title: Advanced Node Network Graph with D3.js
color: rgb(239, 192, 80)
tags: [js]
---

## Other example with D3.js

Because there was a lot of other example that I wanted to bring.
Let's say some more advanced ones.
See [part 1]({{ "/2020/05/21/Node-network-graph-d3.html" | relative_url }}) 
for all the explanation and the inspiration for all of these examples.

<script>
 color = "{{ page.color }}"
</script>

### Tooltip

A tooltip is like a little legend that you want to appear floating around 
when your mouse goes over the element.

In this example inspired by [interactivity_tooltip](https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html)
you can see that "_I'm a circle!_" is displayed when **hovering** on the circle:
 

<div id="d3tooltip" class="center"></div>

To add a tooltip, you need to append another `<div>` to the one using to display the graph
with D3.js:

```js
var tooltip = d3.select("#d3tooltip")
  .append("div")
  .attr("class", "tooltip") // define a nice css for it in class .tooltip
  .text("Text here can be overwritten");
```
  
Then on the node that will trigger the tooltip behaviour,
i.e. making the tooltip visible and at the coordinates of your mouse when you hover on it:

```js
d3.select("#circleBasicTooltip")
  .on("mouseover", () => (tooltip.style("visibility", "visible").text("I'm a circle!")))
  .on("mousemove", () => (tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px")))
  .on("mouseout", () => (tooltip.style("visibility", "hidden")));
```

### Forces

You can find the same example [here](https://www.d3-graph-gallery.com/graph/circularpacking_basic.html) and play with it

<div id="d3gravity" class="center"></div>

To make the nodes moves, you need to add some forces (check [d3-force](https://github.com/d3/d3-force) for the full info on the API).
Basically your canvas and nodes will behave like a tiny physic simulation which will be constrained by forces:

- **center**: define the "[center of mass](https://github.com/d3/d3-force#centering)", like a sun where the nodes will be attracted. (keep them centered in the canvas)
- **charge**: define the force that [interacts](https://github.com/d3/d3-force#many-body) with the nodes
  - referenced as gravity when positive -> attraction
  - referenced as electrostatic charge when negative -> repulsion
- **collide**: define a force that will stop nodes from [overlapping](https://github.com/d3/d3-force#collision) (based on the radius of the node) 


You can create the simulation with the forces:
```js
var simulation = d3.forceSimulation()
  .force("center", d3.forceCenter().x(width / 2).y(height / 2))
  .force("charge", d3.forceManyBody().strength(0.5))
  .force("collide", d3.forceCollide().strength(.01).radius(50).iterations(1));
```

Then you apply these forces to the nodes (based on the data) and update their positions.
The simulation stops once the force algorithm is done. Meaning it has found an equilibrium based on a 'alpha' value that is low enough.

```js
simulation
  .nodes(data)
  .on("tick", () => ticked(node_pack));
```

### Node Update

We can also update nodes within a graph. Let's recreate one like the first example.
And we're going to update the nodes every two seconds:

<div id="d3NodeUpdate" class="center"></div>

To do that we are just going to select the nodes we want from the canvas and 
update their attributes:

```js
function updateNodes() {
    d3.select("#d3NodeUpdate").selectAll("circle")
      .style("fill", () => {return d3Color(Math.random())})
      .attr("cx", () => { return Math.random() * width})
      .attr("r", () => {return Math.random() * 100});
}
```

We have a div with id _d3NodeUpdate_ and inside we select all of the circle,
then we apply the change. We call _updateNodes()_ every 2sec to update them.

### Force update

To update dynamically the forces within the solution, I got inspired by [adjustable link strength](https://bl.ocks.org/mbostock/aba1a8d1a484f5c5f294eebd353842da) 
which gives the idea to use the _restart()_ of the simulation.
And finally used as a base the [force update pattern](https://observablehq.com/@bryangingechen/force-update-pattern-in-observable) that also use
the [restart](https://bl.ocks.org/HarryStevens/bc938c8d45008d99faed47039fbe5d49) to update the simulation.

<div id="d3SimulationUpdate" class="center"></div>

Basically you create your simulation with the base information, and your nodes:

```js
var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(width / 2).y(height / 2))
    .alphaTarget(1)
    .on("tick", () => ticked(node));
```


Then you build a function _restart_ that will start back your simulation with new data.
The data could be a list of nodes that can be removed / added.
```js
function restart(data) {
    node = node.data(data);
    node.exit().remove();   // Remove the nodes that ceased to exist
    node = node.enter()     // Create the new nodes and merge
    .append("circle")
    .style("fill", color)
    .merge(node);
    
    simultation             // Update and restart the simulation.
    .nodes(data)
    .force("collide", d3.forceCollide().strength(1).iterations(1));
}
```

This is a simplified example, you can now call _restart()_ with your data to start and restart the simulation.

<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="{{ 'assets/js/d3.common.js' | relative_url }}"></script>
<script src="{{ 'assets/js/d3.advance.js' | relative_url }}"></script>
<!-- CSS of the tooltip -->
<style>
 .tooltip {
   background-color: white;
   padding: 5px;
   border-radius: 5px;
   position: absolute;
   visibility: hidden;
 }
 
 .center {
   display: flex;
   justify-content: center;
 }
 
 #inner {
   display: inline-block;
 }
</style>
