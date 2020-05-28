// set the dimensions of the svg canvas dynamically or not
const width = window.innerWidth * (window.innerWidth < 460 ? 0.9 : 0.7);
const height = 450;

// create dummy data -> just one element per circle
const data = [{"name": "A"}, {"name": "B"}, {"name": "C"}, {"name": "D"}, {"name": "E"}, {"name": "F"}, {"name": "G"}, {"name": "H"}];

const d3_color = d3.scaleOrdinal(d3.schemeCategory20);

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
  .attr("cx", () => { return Math.random() * width })
  .attr("cy", () => { return Math.random() * height })
  .attr("r", 30)
  .data(exampleData)
  .style("fill", color)
  .style("fill-opacity", 0.7);

// UPDATE SIMULATION EXAMPLE
// let simulation = d3.forceSimulation();
//
// function setupSimulation() {
//   simulation
//     .nodes(data)
//     .force("center", d3.forceCenter())
//     .force("charge", d3.forceManyBody().strength(.01))
//     .force("collide", d3.forceCollide().strength(.01).radius(30).iterations(1))
//       .force("x", d3.forceX())
//       .force("y", d3.forceY())
//     .on("tick", () => ticked(node));
// }
//
// function updateSimulation() {
//   simulation.alpha(0.3).alphaTarget(0).restart();
// }

//setupSimulation();
//d3.interval(() => {updateSimulation()}, 2000);

/* GRAVITY EXAMPLE */

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
