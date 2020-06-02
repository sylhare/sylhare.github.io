// set the dimensions of the svg canvas dynamically or not
const width = window.innerWidth * (window.innerWidth < 460 ? 0.9 : 0.7);
const height = 450;

// create dummy data -> just one element per circle
const data = [{"name": "A"}, {"name": "B"}, {"name": "C"}, {"name": "D"}, {"name": "E"}, {"name": "F"}, {"name": "G"}, {"name": "H"}];

const d3Color = d3.scaleOrdinal(d3.schemeCategory20);

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
