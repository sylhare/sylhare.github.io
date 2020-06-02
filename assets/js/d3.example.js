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
