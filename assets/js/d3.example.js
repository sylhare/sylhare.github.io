/* FIRST EXAMPLE */

const svg = d3.select("#d3example")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const exampleData = [{"name": "A"}, {"name": "B"}, {"name": "C"}, {"name": "D"}];
const node = svg.append("g")
  .selectAll("examples_nodes")
  .data(exampleData)
  .enter();

const circles = node.append("circle")
  .attr("cx", () => (70 + randRange(width - 70)))
  .attr("cy", () => (0 + randRange(height - 70)))
  .attr("r", 40)
  .data(exampleData)
  .style("fill", color)
  .style("fill-opacity", 0.7);
