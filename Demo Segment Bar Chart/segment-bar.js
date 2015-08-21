
var m = [30, 10, 10, 30],
    w = 960 - m[1] - m[3],
    h = 930 - m[0] - m[2];

var format = d3.format(",.0f");

var x = d3.scale.linear().range([0, w]),

    y = d3.scale.ordinal().rangeRoundBands([0, h], .1),

    xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h),
    
    yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);  

var color = d3.scale.category20c();

var svg = d3.select("body").append("svg")
    .attr("width", w + m[1] + m[3] +m[0] + m[2] + 100)
    .attr("height", h + m[0] + m[2])
    .append("g")
    .attr("transform", "translate(" + (m[3]+50) + "," + m[0] + ")");

var segTooltip = d3.select("body")            
    .append('div')                             
    .attr('class', 'segTooltip');                

segTooltip.append('div')                        
    .attr('class', 'state');  

segTooltip.append('div')                        
    .attr('class', 'value');

d3.json("data.json", function(data) {

    // Parse numbers, and sort by value.
    data.forEach(function(d) { 
        d.value = +d.value; 
        d.enabled = true;
    });
    data.sort(function(a, b) { return b.value - a.value; });

    // Set the scale domain.
    x.domain([0, d3.max(data, function(d) { return d.value; })]);
    y.domain(data.map(function(d) { return d.name; }));

    var bar = svg.selectAll("g.bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(0," + y(d.name) + ")"; });

    var rects = bar.append("rect")
        .attr("width", 0)
        .attr("height", y.rangeBand());
    
    rects.on('mouseover', function(d) {
        segTooltip.select('.state').html("State: " + d.name);
        segTooltip.select('.value').html("Population: " + d.value.toLocaleString());  
        segTooltip.style('display', 'block');
        segTooltip.style('background-color', color(d.value));
    });

    rects.on('mouseout', function() {
        segTooltip.style('display', 'none');
    });

    rects.on('mousemove', function(d) {
        segTooltip.style('top', (d3.event.pageY - 50) + 'px')
        .style('left', (d3.event.pageX - 50) + 'px');
    }); 
    
    rects.transition()
        .delay(function (d, i) { return i*100; })
        .attr("width", function(d) { return x(d.value); })
        .attr("fill", function(d){ return color(d.value); });

    bar.append("text")
        .attr("class", "value")
        .attr("x", function(d) { return x(d.value); })
        .attr("y", y.rangeBand() / 2)
        .attr("dx", 50)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function(d) { return format(d.value); });

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Draw segLegend
   /* var legendRectSize = 13,
        legendSpacing  = 4,
        padding = 0;

    var segLegend = svg.selectAll('.segLegend')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            var offset = padding;
            padding = padding + 16;
            return 'translate(1000,' + offset + ')';
        });
     
    segLegend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', function (d) { return color(d.value); })
        .style('stroke', function (d) { return color(d.value); })
        .on('click', function(label) {
            var rect = d3.select(this);
            var enabled = true;
            var totalEnabled = d3.sum(data.map(function(d) {
                return (d.enabled) ? 1 : 0;
            }));

            if (rect.attr('class') === 'disabled') {
                rect.attr('class', '');
            } else {
                if (totalEnabled < 2) return;
                rect.attr('class', 'disabled');
                enabled = false;
            }

            bar.data(function(data) {
                console.log(data)
                if (d === label) d.enabled = enabled;
                return (d.enabled) ? d.count : 0;
            });

            bar = bar.data(bar(data));

            bar.transition()
                .duration(750)
                .attrTween('d', function(d) {
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                };
            });
        });

    segLegend.append('text')
        .attr('class', 'segLegend')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .style('cursor','pointer')
        .text(function (d) { return d.name; });*/

});   