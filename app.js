//responsive funciton

function makeResponsive() {

    var svgArea = d3.select(".chart").select('svg');

    

    if (!svgArea.empty()){
        svgArea.remove();
    }

    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight - 128;

    var margin = {
        top: 50,
        bottom: 90,
        right: svgWidth/3.5,
        left: 235
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;
    var svg = d3.select(".chart").append('svg').attr('width', svgWidth).attr('height', svgHeight)

    var chartGroup = svg.append("g")
                        .attr("transform", `translate(${margin.left}, ${margin.top})`);


// xScale function 
    function xScale(demoData, chosenXaxis) {
        var xlinear = d3.scaleLinear()
                        .domain([d3.min(demoData, d => d[chosenXaxis]) - ((d3.max(demoData, d => d[chosenXaxis] - d3.min(demoData, d => d[chosenXaxis]))/50)),
                    d3.max(demoData, d => d[chosenXaxis]) + ((d3.max(demoData, d => d[chosenXaxis] - d3.min(demoData, d => d[chosenXaxis]))/50))])
                    .range([0, width]);
        return xlinear;
    }
//yScale function
    function yScale(demoData, chosenYaxis) {
        var ylinear = d3.scaleLinear()
                        .domain([d3.min(demoData, d => d[chosenYaxis]) - ((d3.max(demoData, d => d[chosenYaxis] - d3.min(demoData, d => d[chosenYaxis]))/10)), 
                        d3.max(demoData, d=> d[chosenYaxis]) + ((d3.max(demoData, d => d[chosenYaxis] - d3.min(demoData, d => d[chosenYaxis]))/10))])
                        .range([height,0]);
        return ylinear;
    }
// renderbottomaxis function
function renderXAxis(newXscale, xAxis) {
    var bottomaxis = d3.axisBottom(newXscale);
    xAxis.transition()
    .duration(1000)
    .call(bottomaxis);

    return xAxis;
}

//redner left axis funtion
function renderYAxis(newYscale, yAxis) {
    var leftAxis = d3.axisLeft(newYscale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}
//render circles function
function renderCircles(circlesGroup, newXscale, newYscale, chosenXAxis, chosenYaxis, color) {
    circlesGroup.transition()
    .duration(1000)
    .attr('cx', d=> newXscale(d[chosenXAxis]))
    .attr('cy', d => newYscale(d[chosenYaxis]))
    .attr('r', 15)
    .attr('fill', color);

    

    return circlesGroup;
    
}

function renderTextCircles( circleText, newXscale, newYscale, chosenXaxis, chosenYaxis) {
    circleText.transition()
    .duration(1000)
    .attr('x', d=> newXscale(d[chosenXaxis]))
    .attr('y', d => newYscale(d[chosenYaxis]));
    return circleText;
}

//updatetooltip funciton
function updateToolTip(chosenXAxis, chosenYaxis, circlesGroup, ttip) {
    switch (chosenXAxis) {
        case "poverty":
        var xlabel = "<strong>Poverty (%): </strong>";
        break;
        case "age":
            var xlabel = "<strong>Age (Median): </strong>"
            break;
        case "income":
            var xlabel = '<strong>Household Income (median): $</strong>';
            break;
    }

    switch (chosenYaxis) {
        case "healthcare":
            var ylabel = "<strong>Lacks Healthcare (%): </strong>";
            break;
        case "smokes":
            var ylabel = "<strong>Smokes (%): </strong>"
            break;
        case "obesity":
            var ylabel = "<strong>Obese (%): </strong>";
            break;
    }

    var toolTip = d3.tip()
                    .attr('class',`${ttip}`)
                    .offset([90,-75])
                    .html(function (d){
                        return (`<strong>${d.state}</strong><br>${ylabel}${d[chosenYaxis]}<br>${xlabel}${d[chosenXAxis]}`)
                    });
    circlesGroup.call(toolTip);

    circlesGroup.on('mouseover', function(data) {
        toolTip.show(data);
    }).on('mouseout', function(data) {
        toolTip.hide(data)
    });

    return circlesGroup;
}

// get csv data then execute stuff below 

d3.csv('static/data/data.csv').then(function(demoData) {
    console.log(demoData);
    demoData.forEach( function (d) {
        d.poverty = +d.poverty;
        d.smokes = +d.smokes;
        d.obesity = +d.obesity;
        d.age = +d.age;
        d.income = +d.income;
        d.healthcare = +d.healthcare;
    });
    var chosenXAxis = "age";
    var chosenYaxis = "obesity";
    var xLinScale = xScale(demoData, chosenXAxis);
    var yLinScale = yScale(demoData, chosenYaxis);
    var bottomAxis = d3.axisBottom(xLinScale);
    var leftAxis = d3.axisLeft(yLinScale);

    var xAxis = chartGroup.append("g")
                            .classed("x-axis", true)
                            .attr('transform', `translate(0, ${height})`)
                            .call(bottomAxis);
    var yAxis = chartGroup.append("g")
                            .classed('obesity-y-axis', true)
                            .call(leftAxis);

    

    
    var circlesGroup = chartGroup.selectAll("circle")
                                    .data(demoData)
                                    .enter()
                                    .append("circle")
                                    .attr('cx', d => xLinScale(d[chosenXAxis]))
                                    .attr('cy', d => yLinScale(d[chosenYaxis]))
                                    .attr('r', 15)
                                    .attr('fill','blue')
                                    .attr('opacity', "0.7");
    
    var circleText = chartGroup.append("g").selectAll('text')
                                    .data(demoData)
                                    .enter()
                                    .append('text')
                                    .attr('class', 'circle-text')
                                    .attr('x', d => xLinScale(d[chosenXAxis]))
                                    .attr('y', d => yLinScale(d[chosenYaxis]))
                                    .text(d => d.abbr)
                                    .attr('dy', 4);

    

    var labelsGroup = chartGroup.append("g")
                                .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append('text')
                                    .attr('x',0)
                                    .attr('y', 60)
                                    .attr('value','poverty')
                                    .classed('inactive', true)
                                    .classed('axis-text', true)
                                    .text('Poverty Level (%)');
    var ageLabel  = labelsGroup.append('text')
                                .attr('x',0)
                                .attr('y', 40)
                                .attr('value', 'age')
                                .classed('x-active', true)
                                .classed('axis-text', true)
                                .text('Age (Median)');

    var incomeLabel = labelsGroup.append('text')
                                .attr('x',0)
                                .attr('y', 20)
                                .attr('value','income')
                                .classed('inactive', true)
                                .classed('axis-text', true)
                                .text('Household Income (Median)');

    var healthLabel = chartGroup.append('text')
                                .attr('transform', 'rotate(0)')
                                .attr('y', height/2)
                                .attr('x', -125)
                                .attr('value', 'healthcare')
                                .attr('dy', '1em')
                                .classed('axis-text', true)
                                .classed('y', true)
                                .classed('inactive', true)
                                .text("Lacks Healthcare (%)");

    var obeseLabel = chartGroup.append('text')
                                .attr('transform', 'rotate(0)')
                                .attr('y', height/2 - 22)
                                .attr('x', -125)
                                .attr('value', 'obesity')
                                .attr('dy', '1em')
                                .classed('axis-text', true)
                                .classed('y', true)
                                .classed('obese-active', true)
                                .text("Obese (%)");

    var smokeLabel = chartGroup.append('text')
                                .attr('transform', 'rotate(0)')
                                .attr('y', height/2 + 22)
                                .attr('x', -125)
                                .attr('value', 'smokes')
                                .attr('dy', '1em')
                                .classed('axis-text', true)
                                .classed('y', true)
                                .classed('inactive', true)
                                .text("Smokes (%)");

    var ttip = 'obesity-tooltip'
    var circlesGroup = updateToolTip(chosenXAxis, chosenYaxis, circlesGroup, ttip);


    var yvalue = 'obesity'
    
    d3.select('.chart').selectAll('.axis-text')
        .on('click', function (){
            var value = d3.select(this).attr('value');
            var xitems = ['age', 'poverty', 'income']
            var yitems = ['healthcare', 'smokes', 'obesity']
            
            if (yitems.includes(value)) {
                yvalue = value;
                ttip = value + '-tooltip'
            }
            switch (yvalue) {
                case "smokes":
                    var color = 'red';
                    break;
                case "healthcare":
                    var color = 'green';
                    break;
                case "obesity":
                    var color = 'blue';
                    break;
            }
            if (xitems.includes(value)) {
                if (value !== chosenXAxis) {
                chosenXAxis = value;

                xLinScale = xScale(demoData, chosenXAxis);
                xAxis = renderXAxis(xLinScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinScale, yLinScale, chosenXAxis, chosenYaxis,color);
                circleText = renderTextCircles(circleText,xLinScale,yLinScale, chosenXAxis, chosenYaxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYaxis, circlesGroup, ttip);
                
                
                switch (chosenXAxis) {
                    case "age":
                        ageLabel
                            .classed('x-active', true)
                            .classed('inactive', false);
                        povertyLabel
                            .classed('x-active', false)
                            .classed('inactive', true);
                        incomeLabel
                            .classed('x-active', false)
                            .classed('inactive', true);
                        circlesGroup = renderCircles(circlesGroup, xLinScale, yLinScale, chosenXAxis, chosenYaxis,color);
                        break;
                    case "poverty":
                        povertyLabel
                            .classed('x-active', true)
                            .classed('inactive', false);
                        ageLabel
                            .classed('x-active', false)
                            .classed('inactive', true);
                        incomeLabel
                            .classed('x-active', false)
                            .classed('inactive', true);
                        circlesGroup = renderCircles(circlesGroup, xLinScale, yLinScale, chosenXAxis, chosenYaxis,color);
                        break;
                    case "income":
                       incomeLabel
                            .classed('x-active', true)
                            .classed('inactive', false);
                        povertyLabel
                            .classed('x-active', false)
                            .classed('inactive', true);
                        ageLabel
                            .classed('x-active', false)
                            .classed('inactive', true);
                        circlesGroup = renderCircles(circlesGroup, xLinScale, yLinScale, chosenXAxis, chosenYaxis,color);
                        break;
                }
            }
        }
        if (yitems.includes(value)) {
            if (value !== chosenYaxis) {
            chosenYaxis = value;
            yLinScale = yScale(demoData, chosenYaxis);
            yAxis = renderYAxis(yLinScale, yAxis);
            
            circleText = renderTextCircles(circleText,xLinScale,yLinScale, chosenXAxis, chosenYaxis);
            
            

            switch(chosenYaxis){
                case "smokes":
                    smokeLabel
                            .classed('smoke-active', true)
                            .classed('inactive', false);
                        healthLabel
                            .classed('health-active', false)
                            .classed('inactive', true);
                        obeseLabel
                            .classed('obese-active', false)
                            .classed('inactive', true);
                        yAxis.classed('obesity-y-axis',false).classed('healthcare-y-axis', false).classed('smokes-y-axis',true);
                        circlesGroup = renderCircles(circlesGroup, xLinScale, yLinScale, chosenXAxis, chosenYaxis,color);
                        circlesGroup = updateToolTip(chosenXAxis, chosenYaxis, circlesGroup, ttip);
                        break;
                case "healthcare":
                    healthLabel
                            .classed('health-active', true)
                            .classed('inactive', false);
                        smokeLabel
                            .classed('smoke-active', false)
                            .classed('inactive', true);
                        obeseLabel
                            .classed('obese-active', false)
                            .classed('inactive', true);
                        yAxis.classed('obesity-y-axis',false).classed('healthcare-y-axis', true).classed('smokes-y-axis',false);
                        circlesGroup = updateToolTip(chosenXAxis, chosenYaxis, circlesGroup, ttip);
                        circlesGroup = renderCircles(circlesGroup, xLinScale, yLinScale, chosenXAxis, chosenYaxis, color);
                        break;
                case "obesity":
                    obeseLabel
                            .classed('obese-active', true)
                            .classed('inactive', false);
                        healthLabel
                            .classed('health-active', false)
                            .classed('inactive', true);
                        smokeLabel
                            .classed('smoke-active', false)
                            .classed('inactive', true);
                        yAxis.classed('obesity-y-axis',true).classed('healthcare-y-axis', false).classed('smokes-y-axis',false);
                        circlesGroup = updateToolTip(chosenXAxis, chosenYaxis, circlesGroup, ttip);
                        circlesGroup = renderCircles(circlesGroup, xLinScale, yLinScale, chosenXAxis, chosenYaxis, color);
                        break;
            }

        }
    }
        });
}).catch(function(error) {
    console.log(error)
});

// 
}

makeResponsive();

d3.select(window).on("resize", makeResponsive);
d3.selectAll("circle").on("mouseover", function(){
    d3.select(this).attr('stoke-width','1px').attr('stroke','black');
}).on('mouseout', function() {
    d3.select(this).attr('stoke-width','0').attr('stroke','none');
});