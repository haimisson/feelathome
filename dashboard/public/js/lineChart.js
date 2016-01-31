// on mouse over

var focus = graph.append("svg:g")
    .attr("class", "focus")
    .style("display", "none");

focus.append("circle")
    .attr("r", 4.5);

focus.append("text")
    .attr("x", 9)
    .attr("dy", ".35em");

graph.append("rect")
    .attr("class", "overlay")
    .attr("width", w)
    .attr("height", h)
    .on("mouseover", function() { focus.style("display", null); })
    .on("mouseout", function() { focus.style("display", "none"); })
    .on("mousemove", mousemove);

var bisectDate = d3.bisector(function(d) { return new Date(d.timestamp); }).left;
var time = d3.time.format("%X");
var date = d3.time.format("%x")

function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(x_dim_accessor(d)) + "," + y(d.tempIn) + ")");
    focus.select("text").text(date(new Date(d.timestamp)) + " " + time(new Date(d.timestamp)) + ": " + d.tempIn);
}