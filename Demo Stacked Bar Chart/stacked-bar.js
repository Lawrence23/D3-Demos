
var margin = {top: 20, right: 100, bottom: 30, left: 40},
    width = 1060 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

/*var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);*/

var color = d3.scale.category20b();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".0%"));

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var barTooltip = d3.select("body")            
    .append('div')                             
    .attr('class', 'barTooltip');                

barTooltip.append('div')                        
    .attr('class', 'state');  

barTooltip.append('div')                        
    .attr('class', 'value');

d3.json("data.json", function(error, data) {
    if (error) throw error;

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "State"; }));

    data.forEach(function(d) {
        var y0 = 0;
        d.ages = color.domain().map(function(name) { 
            return {name: name, y0: y0, y1: y0 += +d[name], y2: d[name]}; 
        });
        d.ages.forEach(function(d) { d.y0 /= y0; d.y1 /= y0; });
    });

    data.sort(function(a, b) { return b.ages[0].y1 - a.ages[0].y1; });

    x.domain(data.map(function(d) { return d.State; }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var state = svg.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("class", "state")
        .attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; });

    var rects = state.selectAll("rect")
        .data(function(d) { return d.ages; })
        .enter().append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.y1); })
        .attr("height", 0);

    rects.on('mouseover', function(d,data,i) {
        barTooltip.select('.state').html("Category: " + d.name);
        barTooltip.select('.value').html("Population: " + d.y2.toLocaleString());  
        barTooltip.style('display', 'block');
        barTooltip.style('background-color', color(d.name));
    });

    rects.on('mouseout', function() {
        barTooltip.style('display', 'none');
    });

    rects.on('mousemove', function(d) {
        barTooltip.style('top', (d3.event.pageY - 50) + 'px')
        .style('left', (d3.event.pageX - 50) + 'px');
    });

    rects.transition()
        .delay(function (d, i) { return i*200; })
        .attr("height", function(d) { return y(d.y0) - y(d.y1); })
        .style("fill", function(d) { return color(d.name); });

    var legend = svg.select(".state:last-child").selectAll(".legend")
        .data(function(d) { return d.ages; })
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d) { 
            return "translate(" + x.rangeBand() / 2 + "," + y((d.y0 + d.y1) / 2) + ")"; 
        });

    legend.append("line")
        .attr("x2", 10);

    legend.append("text")
        .attr("x", 13)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });

});