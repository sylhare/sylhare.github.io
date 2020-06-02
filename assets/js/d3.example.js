// set the dimensions of the svg canvas dynamically or not
const width = window.innerWidth * (window.innerWidth < 460 ? 0.9 : 0.7);
const height = 450;

// create dummy data -> just one element per circle
const data = [{"name": "A"}, {"name": "B"}, {"name": "C"}, {"name": "D"}, {"name": "E"}, {"name": "F"}, {"name": "G"}, {"name": "H"}];

const d3_color = d3.scaleOrdinal(d3.schemeCategory20);

function randRange(max) {
    return Math.round(Math.random() * max)
}

// Behaviour when moved
function ticked(node) {
    node
      .attr("cx", function (d) {return d.x;})
      .attr("cy", function (d) {return d.y;})
}

// Append an SVG canvas to the div.
function createSvg(divID) {
    return d3.select(divID)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
}

function appendCircleTo(nodes) {
    return nodes.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", 40)
      .attr("stroke", color)
      .style("fill", color);

}

/* FIRST EXAMPLE */

var svg = d3.select("#d3example")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var exampleData = [{"name": "A"}, {"name": "B"}, {"name": "C"}, {"name": "D"}];
var node = svg.append("g")
  .selectAll("examples_nodes")
  .data(exampleData)
  .enter();

var circles = node.append("circle")
  .attr("cx", () => { return 70 + randRange(width - 70) })
  .attr("cy", () => { return 70 + randRange(height - 70) })
  .attr("r", 30)
  .data(exampleData)
  .style("fill", color)
  .style("fill-opacity", 0.7);


/* FORCE EXAMPLE */

// append the svg object to the body of the page
var svg_pack = createSvg("#d3gravity");

// Initialize the circle: all located at the center of the svg area
var node_pack = appendCircleTo(svg_pack.append("g").selectAll("nodes").data(data).enter())
  .style("fill-opacity", 0.3)
  .style("stroke-width", 4);

// Features of the forces applied to the nodes:
var simulation_pack = d3.forceSimulation()
// CENTER: Attraction to the center of the svg area
  .force("center", d3.forceCenter().x(width / 2).y(height / 2))
  // CHARGE: Nodes are attracted one each other of value is > 0
  .force("charge", d3.forceManyBody().strength(0.5))
  // COLLIDE: Force that avoids circle overlapping
  .force("collide", d3.forceCollide().strength(.01).radius(50).iterations(1));

// Apply these forces to the nodes and update their positions.
// Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
simulation_pack
  .nodes(data)
  .on("tick", () => ticked(node_pack));


/* UPDATE SIMULATION EXAMPLE */

var svg_up = createSvg("#d3SimulationUpdate");
var node_up = svg_up.append("g").selectAll(".node")
  .attr("stroke", "#fff")
  .attr("stroke-width", 1.5);

var simultation_up = d3.forceSimulation()
  .force("charge", d3.forceManyBody().strength(-150))
  .force("forceX", d3.forceX().strength(.1)) // Distribute the force on the X axis
  .force("forceY", d3.forceY().strength(.1)) // Distribute the force on the Y axis
  .force("center", d3.forceCenter().x(width / 2).y(height / 2))
  .alphaTarget(1)
  .on("tick", () => ticked(node_up));

function restart(data) {
    var t = d3.transition().duration(750);

    node_up = node_up.data(data);

    node_up.exit()
      .style("fill", "#b26745")
      .transition(t)
      .attr("r", 1e-6)
      .remove();

    node_up
      .transition(t)
      .style("fill", d3_color)
      .attr("r", function(d){ return d.size; });

    node_up = node_up.enter()
      .append("circle")
      .attr("r", function(d){ return d.size })
      .style("fill", color)
      .merge(node_up);

    // Update and restart the simulation.
    simultation_up
      .nodes(data)
      .force("collide", d3.forceCollide()
        .strength(1).radius((d) => { return d.size + 10; }).iterations(1));

}

function randomizeData(){
    return [...Array(randRange(25)).keys()].map(
      element => {return {name: element.toString(), size: randRange(50)}}
    );
}

d3.interval(() => restart(randomizeData()), 2000);

restart(randomizeData());

/* TOOLTIP EXAMPLE */

// Start by creating the svg area
var svg_tooltip = createSvg("#d3tooltip");

// Append a circle
appendCircleTo(svg_tooltip).attr("id", "circleBasicTooltip");

// create a tooltip
var tooltip = d3.select("#d3tooltip")
  .append("div")
  .attr("class", "tooltip")
  .text("Text here can be overwritten");

// tooltip behaviour on node
d3.select("#circleBasicTooltip")
  .on("mouseover", () => (tooltip.style("visibility", "visible").text("I'm a circle!")))
  .on("mousemove", () => (tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px")))
  .on("mouseout", () => (tooltip.style("visibility", "hidden")));
