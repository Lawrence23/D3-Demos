var width = 520;
var height = 520;
var radius = Math.min(width, height) / 2;
var donutWidth = 125;     
var legendRectSize = 18;                                  
var legendSpacing = 4;  
var color = d3.scale.category20b();
//var color = d3.scale.ordinal().range(['#A60F2B', '#648C85', '#B3F2C9', '#528C18', '#C3F25C']); 

var svg = d3.select('#chart')
	.append('svg')
	.attr('class','donut')
  	.attr('width', width)
  	.attr('height', height)
  	.append('g')
  	.attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

//For PIE
// var arc = d3.svg.arc()
//   .outerRadius(radius);

var arc = d3.svg.arc()
  	.innerRadius(radius - donutWidth)  
  	.outerRadius(radius);

var pie = d3.layout.pie()
  	.sort(null)
  	.startAngle(1.1*Math.PI)
    .endAngle(3.1*Math.PI)
    .value(function(d) { return d.count; });

var tooltip	 = d3.select('#chart')            
  	.append('div')                             
  	.attr('class', 'tooltip');        

tooltip.append('div')                        
  	.attr('class', 'label');                

tooltip.append('div')                        
  	.attr('class', 'count');                   

tooltip.append('div')                        
  	.attr('class', 'percent');   

  

d3.json('weekdays.json', function(error, dataset) {  
  	dataset.forEach(function(d) {                    
		d.count = +d.count;
		d.enabled = true;                            
  	});                                              

	var path = svg.selectAll('path')
	  	.data(pie(dataset))
	  	.enter()
	  	.append('path');

	path.on('mouseover', function(d) {
	  	var total = d3.sum(dataset.map(function(d) {
		    return (d.enabled) ? d.count : 0;
	  	}));
	  	var percent = Math.round(1000 * d.data.count / total) / 10;
	  	tooltip.select('.label').html(d.data.label);
	  	tooltip.select('.count').html(d.data.count); 
	  	tooltip.select('.percent').html(percent + '%'); 
	  	tooltip.style('background-color', color(d.data.label));
	  	tooltip.style('display', 'block');
	});

	path.on('mouseout', function() {
	  	tooltip.style('display', 'none');
	});

	path.on('mousemove', function(d) {
	  	tooltip.style('top', (d3.event.pageY - 75) + 'px')
	    .style('left', (d3.event.pageX - 500) + 'px');
	});

	path.transition()
		.delay(function(d, i) { return i * 500; })
		.duration(500)		
	  	.attr('d', arc)
		.attr('fill', function(d, i) { return color(d.data.label); })
	  	.each(function(d) { this._current = d; })
  		.attrTween('d', function(d) {
       		var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
       		return function(t) {
           		d.endAngle = i(t);
         		return arc(d);
       		}
  		});	  	
/*path.on('mouseout', function() {
  tooltip.style('display', 'none');
});*/  

	var legend = svg.selectAll('.legend')                     
	    .data(color.domain())                                   
	    .enter()                                                
	    .append('g')                                            
	    .attr('class', 'legend')                                
	    .attr('transform', function(d, i) {                     
	    	var height = legendRectSize + legendSpacing;         
	        var offset =  height * color.domain().length / 2;     
	        var horz = -2 * legendRectSize;                      
	        var vert = i * height - offset;                      
	        return 'translate(' + horz + ',' + vert + ')';        
	    });                                                     

    legend.append('rect')                                     
        .attr('width', legendRectSize)                          
        .attr('height', legendRectSize)                         
        .style('fill', color)                                   
        .style('stroke', color)
        .on('click', function(label) {
			var rect = d3.select(this);
			var enabled = true;
			var totalEnabled = d3.sum(dataset.map(function(d) {
				return (d.enabled) ? 1 : 0;
			}));

			if (rect.attr('class') === 'disabled') {
				rect.attr('class', '');
			} else {
				if (totalEnabled < 2) return;
				rect.attr('class', 'disabled');
				enabled = false;
			}

			pie.value(function(d) {
				if (d.label === label) d.enabled = enabled;
				return (d.enabled) ? d.count : 0;
			});

			path = path.data(pie(dataset));

			path.transition()
			.duration(750)
			.attrTween('d', function(d) {
			  	var interpolate = d3.interpolate(this._current, d);
			  	this._current = interpolate(0);
			  	return function(t) {
				    return arc(interpolate(t));
			  	};
			});
		});                                
          
    legend.append('text')                                     
        .attr('x', legendRectSize + legendSpacing)              
        .attr('y', legendRectSize - legendSpacing)              
        .text(function(d) { return d; });                       
});  