//responsive funciton

function makeResponsive() {

    var svgArea = d3.select("div").select('svg');

    

    if (!svgArea.empty()){
        svgArea.remove();
    }

    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 50,
        bottom: 90,
        right: 50,
        left: 100
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;
    var svg = d3.select(".chart").append('svg').attr('width', svgWidth).attr('height', svgHeight)

    var chartGroup = svg.append("g")
                        .attr("transform", `translate(${margin.left}, ${margin.top})`);


// xScale function 
    function xScale(demoData, chosenXaxis) {
        var xlinear = d3.scaleLinear()
                        .domain([d3.min(demoData, d => d[chosenXaxis]) - ((d3.max(demoData, d => d[chosenXaxis] - d3.min(demoData, d => d[chosenXaxis]))/20)),
                    d3.max(demoData, d => d[chosenXaxis]) + ((d3.max(demoData, d => d[chosenXaxis] - d3.min(demoData, d => d[chosenXaxis]))/20))])
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
function renderCircles(circlesGroup, newXscale, newYscale, chosenXAxis, chosenYaxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr('cx', d=> newXscale(d[chosenXAxis]))
    .attr('cy', d => newYscale(d[chosenYaxis]))
    .attr('r', 20);

    

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
function updateToolTip(chosenXAxis, chosenYaxis, circlesGroup) {
    switch (chosenXAxis) {
        case "poverty":
        var xlabel = "Poverty : ";
        break;
        case "age":
            var xlabel = "Age (median): "
            break;
        case "income":
            var xlabel = 'Household Income (median): ';
            break;
    }

    switch (chosenYaxis) {
        case "healthcare":
            var ylabel = "Lacks Healthcare (%): ";
            break;
        case "smokes":
            var ylabel = "Smokes (%): "
            break;
        case "obesity":
            var ylabel = "Obese (%): ";
            break;
    }

    var toolTip = d3.tip()
                    .attr('class','tooltip')
                    .offset([80,-60])
                    .html(function (d){
                        return (`${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYaxis]}<br>State: ${d.abbr}`)
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
                            .classed('y-axis', true)
                            .call(leftAxis);

    var circleText = chartGroup.append("g").selectAll('text')
                            .data(demoData)
                            .enter()
                            .append('text')
                            .classed('circle-text', true)
                            .attr('x', d => xLinScale(d[chosenXAxis]))
                            .attr('y', d => yLinScale(d[chosenYaxis]))
                            .text(d => d.abbr)
                            .attr('dy', 4);

    var circlesGroup = chartGroup.selectAll("circle")
                                    .data(demoData)
                                    .enter()
                                    .append("circle")
                                    .attr('cx', d => xLinScale(d[chosenXAxis]))
                                    .attr('cy', d => yLinScale(d[chosenYaxis]))
                                    .attr('r', 20)
                                    .attr('fill','blue')
                                    .attr('opacity', "0.5");

    

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
                                .classed('active', true)
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
                                .attr('transform', 'rotate(-90)')
                                .attr('y', 0 - (margin.left - 40))
                                .attr('x', 0 - (height / 2))
                                .attr('value', 'healthcare')
                                .attr('dy', '1em')
                                .classed('axis-text', true)
                                .classed('inactive', true)
                                .text("Lacks Healthcare (%)");

    var obeseLabel = chartGroup.append('text')
                                .attr('transform', 'rotate(-90)')
                                .attr('y', 0 - (margin.left - 20))
                                .attr('x', 0 - (height / 2))
                                .attr('value', 'obesity')
                                .attr('dy', '1em')
                                .classed('axis-text', true)
                                .classed('active', true)
                                .text("Obese (%)");

    var smokeLabel = chartGroup.append('text')
                                .attr('transform', 'rotate(-90)')
                                .attr('y', 0 - (margin.left - 60))
                                .attr('x', 0 - (height / 2))
                                .attr('value', 'smokes')
                                .attr('dy', '1em')
                                .classed('axis-text', true)
                                .classed('inactive', true)
                                .text("Smokes (%)");

    var circlesGroup = updateToolTip(chosenXAxis, chosenYaxis, circlesGroup);


    d3.select('.chart').selectAll('.axis-text')
        .on('click', function (){
            var value = d3.select(this).attr('value');
            var xitems = ['age', 'poverty', 'income']
            var yitems = ['healthcare', 'smokes', 'obesity']
            if (xitems.includes(value)) {
                if (value !== chosenXAxis) {
                chosenXAxis = value;

                xLinScale = xScale(demoData, chosenXAxis);
                xAxis = renderXAxis(xLinScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinScale, yLinScale, chosenXAxis, chosenYaxis);
                circleText = renderTextCircles(circleText,xLinScale,yLinScale, chosenXAxis, chosenYaxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYaxis, circlesGroup);
                
                
                switch (chosenXAxis) {
                    case "age":
                        ageLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        povertyLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        incomeLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        break;
                    case "poverty":
                        povertyLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        ageLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        incomeLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        break;
                    case "income":
                       incomeLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        povertyLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        ageLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        break;
                }
            }
        }
        if (yitems.includes(value)) {
            if (value !== chosenYaxis) {
            chosenYaxis = value;
            yLinScale = yScale(demoData, chosenYaxis);
            yAxis = renderYAxis(yLinScale, yAxis);
            circlesGroup = renderCircles(circlesGroup, xLinScale, yLinScale, chosenXAxis, chosenYaxis);
            circleText = renderTextCircles(circleText,xLinScale,yLinScale, chosenXAxis, chosenYaxis);
            circlesGroup = updateToolTip(chosenXAxis, chosenYaxis, circlesGroup);
            

            switch(chosenYaxis){
                case "smokes":
                    smokeLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        healthLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        obeseLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        break;
                case "healthcare":
                    healthLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        smokeLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        obeseLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        break;
                case "obesity":
                    obeseLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        healthLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        smokeLabel
                            .classed('active', false)
                            .classed('inactive', true);
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