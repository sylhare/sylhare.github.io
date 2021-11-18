/* FORCE EXAMPLE */

// append the svg object to the body of the page
const svg_pack = createSvg("#d3gravity");

// Initialize the circle: all located at the center of the svg area
const node_pack = appendCircleTo(svg_pack.append("g").selectAll("nodes").data(data).enter())
  .style("fill-opacity", 0.3)
  .style("stroke-width", 4);

// Features of the forces applied to the nodes:
const simulation_pack = d3.forceSimulation()
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



/* NODE UPDATE EXAMPLE */

const svg_n = d3.select("#d3NodeUpdate")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const node_n = svg_n.append("g")
  .selectAll("nodes")
  .data(data)
  .enter();

const circles = node_n.append("circle")
  .attr("cx", () => (50 + randRange(width/1.5)))
  .attr("cy",  height / 2)
  .attr("r", 30)
  .data(data)
  .style("fill", color)
  .style("fill-opacity", 0.7);

function updateNodes() {
    d3.select("#d3NodeUpdate").selectAll("circle")
      .style("fill", () => d3Color(randRange(19)))
      .attr("cy", () => (50 + randRange(height/1.5)))
      .attr("cx", () => (50 + randRange(width/1.5)))
      .attr("r", () => (10 + randRange(90)));
}

d3.interval(() => updateNodes(), 2000);



/* TOOLTIP EXAMPLE */

// Start by creating the svg area
const svg_tooltip = createSvg("#d3tooltip")
  .attr("height", height/2);

// Append a circle
appendCircleTo(svg_tooltip)
  .attr("cy", height / 2 - height / 4)
  .attr("id", "circleBasicTooltip");

const demoText = svg_tooltip.append("g");

demoText.append("text")
  .attr("x", () => (width > 800? width/2 - width/7 : 10))
  .attr("y", height / 2 - height / 4)
  .attr("dy", ".35em")
  .attr("fill", "black")
  .text("Hover ==>");

// create a tooltip
const tooltip = d3.select("#d3tooltip")
  .append("div")
  .attr("class", "tooltip")
  .text("Text here can be overwritten");

// tooltip behaviour on node
d3.select("#circleBasicTooltip")
  .on("mouseover", () => (tooltip.style("visibility", "visible").text("I'm a circle!")))
  .on("mousemove", () => (tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px")))
  .on("mouseout", () => (tooltip.style("visibility", "hidden")));



/* UPDATE SIMULATION EXAMPLE */

// Set up of the canvas
const svg_up = createSvg("#d3SimulationUpdate");
let node_up = svg_up.append("g").selectAll(".node")
  .attr("stroke", "#fff")
  .attr("stroke-width", 1.5);

// Simulation with default variables
const simultation_up = d3.forceSimulation()
  .force("charge", d3.forceManyBody().strength(-150))
  .force("forceX", d3.forceX().strength(.1)) // Distribute the force on the X axis
  .force("forceY", d3.forceY().strength(.1)) // Distribute the force on the Y axis
  .force("center", d3.forceCenter().x(width / 2).y(height / 2))
  .alphaTarget(1)
  .on("tick", () => ticked(node_up));

// Restart method
function restart(data) {
    const t = d3.transition().duration(750);
    node_up = node_up.data(data);

    // Remove the nodes that ceased to exist
    node_up.exit()
      .transition(t)
      .attr("r", 1e-6)
      .remove();

    // Add a transition to the new node to slowly grow
    node_up
      .transition(t)
      .style("fill", d3Color(randRange(19)))
      .attr("r", (d) => d.size);

    // Create the new nodes and merge
    node_up = node_up.enter()
      .append("circle")
      .attr("r", (d) => d.size)
      .style("fill", color)
      .merge(node_up);

    // Update and restart the simulation.
    simultation_up
      .nodes(data)
      .force("collide", d3.forceCollide()
        .strength(1).radius((d) => (d.size + 10)).iterations(1));
}

// Create random data
function randomizeData() {
    return [...Array(randRange(25)).keys()].map(
      element => ({name: `Element-${element}-${randRange(50)}`, size: randRange(50)})
    );
}

d3.interval(() => restart(randomizeData()), 2000);

restart(randomizeData());
