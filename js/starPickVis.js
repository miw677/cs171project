/* * * * * * * * * * * * * *
 *      class StarPickVis    *
 * * * * * * * * * * * * * */

class StarPickVis{
    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        this.initVis();
    }

    initVis(){

        let vis = this;

        // Set the dimensions and margins of the graph
        vis.margin = { top: 40, right: 40, bottom: 80, left: 20 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // append the svg object to the body of the page
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // set up scales
        vis.xScale = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
        //vis.colorScale = d3.scaleOrdinal(["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]);
        vis.colorScale =  d3.scaleOrdinal(d3.quantize(d3.interpolateReds, 15));


        // set up axes
        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(vis.xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em");
        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis y-axis");

        // set up legend
        vis.legends = vis.svg.append("g")
            .attr("class", "legend")

        vis.legend_labels = vis.svg.append("g")
            .attr("class", "legend-labels")

        // bar group initialize
        vis.bar = vis.svg.append("g").attr("class", "bar");

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'sankeyTooltip')

        vis.wrangleData();
    }
    wrangleData(){
        let vis = this;

        // filter data by user selected general cuisine category
        let filteredData = vis.data.filter(d => d['General_Category'] === category);

        console.log(filteredData)

        // nest data - group by state and cuisine
        vis.nestedData = {};
        filteredData.forEach(function(d) {
            if (!vis.nestedData[d.state_name]) {
                vis.nestedData[d.state_name] = {totalRestaurants: 0}; // to sort by total number of restaurants
            }
            if (!vis.nestedData[d.state_name][d.Cuisine]) {
                vis.nestedData[d.state_name][d.Cuisine] = { count: 0, details: [] };
            }

            vis.nestedData[d.state_name][d.Cuisine].count += 1;
            vis.nestedData[d.state_name][d.Cuisine].details.push(d); // storing the data point (restaurant) for tooltip
            vis.nestedData[d.state_name].totalRestaurants += 1;

        });


        let cuisines = filteredData.map(d => d.Cuisine);
        vis.uniqueCuisines = [...new Set(cuisines)];

        // for legend
        vis.cuisineColorPairs = vis.uniqueCuisines.map((cuisine, index) => {
            return { cuisine: cuisine, color: vis.colorScale(index) };
        });



        vis.tooltipDetails = {};



        // format data for stacking + tooltip data
        vis.displayData = Object.keys(vis.nestedData).map(function(state) {
            // for each state
            //let stateObj = { state: state };
            let stateObj = { state: state, totalRestaurants: vis.nestedData[state].totalRestaurants };


            vis.tooltipDetails[state] = {};

            // loop over uniqueCuisines in this general cuisine category
            vis.uniqueCuisines.forEach(function(cuisine) {
                // if sub-cuisine restaurant exists in the state, set its count, or 0 if doesn't exist
                stateObj[cuisine] = vis.nestedData[state][cuisine] ? vis.nestedData[state][cuisine].count : 0;
                // store sub-cuisine restaurant data point for tooltip
                vis.tooltipDetails[state][cuisine] = vis.nestedData[state][cuisine] ? vis.nestedData[state][cuisine].details : [];
            });

            return stateObj;
        });

        console.log("displayData:", vis.displayData)

        // MUST-HAVE Stacked Barchart: Sort block based on the number of restaurants
        vis.displayData.sort((a, b) => vis.nestedData[b.state].totalRestaurants - vis.nestedData[a.state].totalRestaurants);




        vis.updateVis();
    }
    updateVis(){
        let vis = this;

        // Legend setup
        vis.legend = vis.svg.selectAll(".legend")
            .data(vis.cuisineColorPairs)

        vis.legend.enter().append("g")
            .attr("class", "legend")
            .merge(vis.legend)
            .attr("transform", (d, i) => "translate(0," + i * 16 + ")"); // Stack legend items vertically

        // vis.svg.selectAll(".legend").selectAll("rect")
        //     .on("mouseover", function(event, d) {
        //         // select the proper class name (the cuisine)
        //         d3.selectAll(`.bar ${d.cuisine}`)
        //             .style("opacity", b => (b.data[d.cuisine] ? 1 : 0.2)); // Highlight matching rectangles
        //

        //         // vis.svg.selectAll(".bar").selectAll("rect")
        //         //     .style("opacity", b => (b.data[d.cuisine] ? 1 : 0.2)); // Highlight matching rectangles
        //     })
        //     .on("mouseout", function() {
        //         // Reset the style of the rectangles
        //         vis.svg.selectAll(".bar").selectAll("rect")
        //             .style("opacity", 1); // Reset opacity
        //     });

        // Draw legend colored rectangles
        vis.svg.selectAll(".legend").selectAll("rect")
            .data(d => [d]) // Bind the parent data to the child rectangle
            .join(
                enter => enter.append("rect")
                    .attr("x", vis.width - 18)
                    // assign class for the rectangle: the cuisine type
                    .attr('class', d=> d.cuisine)
                    .attr("width", 18)
                    .attr("height", 18),
                update => update,
                exit => exit.remove()
            )
            .style("fill", d => d.color);

        // Draw legend text
        vis.svg.selectAll(".legend").selectAll("text")
            .data(d => [d]) // Bind the parent data to the child text
            .join(
                enter => enter.append("text")
                    .attr("x", vis.width - 24)
                    .attr("y", 8)
                    .style("text-anchor", "end")
                    .style('font-size', '10px')
                    .attr("dy", ".5em"),
                update => update,
                exit => exit.remove()
            )
            .text(d => d.cuisine);

        // Remove any exiting legend groups
        vis.legend.exit().remove();

        // when user clicks on a legend, highlight all the bars that correspond to that cuisine type
        vis.svg.selectAll(".legend rect")
            .on("click", function(event, d) {

                event.stopPropagation();
                // set all bars to grey
                vis.svg.selectAll(".bar rect").style("opacity", 0.1);

                // highlight all the bars that correspond to the selected cuisine type in the legend
                let className = d.cuisine.replace(/[\s,]+/g, '-');
                vis.svg.selectAll(`.bar.${className} rect`).style("opacity", 1);
            })
        // reset when user clicks on anywhere else
        document.addEventListener("click", function() {
            // Reset the opacity of all bars
            vis.svg.selectAll(".bar rect").style("opacity", 1);
        });

        // update domains
        vis.xScale.domain(vis.displayData.map(d => d.state));
        let maxStackValue = d3.max(vis.displayData, d => { // find the maximum stack value for any state
            let countArray = vis.uniqueCuisines.map(cuisine => d[cuisine] || 0);
            return d3.sum(countArray);
        });
        vis.yScale.domain([0, maxStackValue]);

        // update x axis
        vis.svg.select(".x-axis")
            .transition() // Use a transition if you want a smooth update
            .duration(750) // Duration of the transition in milliseconds
            .call(d3.axisBottom(vis.xScale)); // Update the x-axis with the new scale

        // append labels for x axis
        vis.xlabels = vis.svg.select(".x-axis").selectAll("text")
            .data(vis.displayData.map(d => d.state));

        vis.xlabels.enter().append('text').merge(vis.xlabels)
            .transition()
            .duration(800)
            .style("text-anchor", "middle")
            .style('font-size', '12px')
            .attr("dx", "-.8em")
            .attr("dy", ".15em");

        // stack function
        let stack = d3.stack()
            .keys(vis.uniqueCuisines) // keys = uniqueCuisines for this general cuisine category
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);
        let series = stack(vis.displayData); // stack displayData

        series.forEach((layer, index) => {
            // for each layer in the `series` data (a single layer of the stack across all states)
            layer.forEach(segment => {
                // add index to each state segment of the layer
                segment.index = index;
            });
        });

        console.log("series", series)
        console.log("displayData", vis.displayData);
        console.log("uniqueCuisines", vis.uniqueCuisines)
        console.log("nestedData", vis.nestedData);

        // bind to bar groups the stacked data `series`
        vis.bars = vis.svg.selectAll(".bar")
            .data(series);

        vis.bars.enter().append("g")
            .merge(vis.bars)
            // set the class of the bar group as the cuisine type (d.key)
            .attr('class', d => `bar ${d.key.replace(/[\s,]+/g, '-')}`)
            .transition()
            .duration(800)
            .style("fill", (d, i) => vis.colorScale(i)); // set bar colors

        vis.bars.exit().remove();

        // draw rectangles
        vis.bar_rects = vis.svg.selectAll(".bar").selectAll("rect")
            .data(d => d); // series

        vis.bar_rects.enter().append("rect").merge(vis.bar_rects)
            .transition()
            .duration(800)
            .attr("x", d => vis.xScale(d.data.state))
            .attr("y", d => vis.yScale(d[1]))
            .attr("height", d => vis.yScale(d[0]) - vis.yScale(d[1])) // difference between layers
            .attr("width", vis.xScale.bandwidth());

        vis.svg.selectAll(".bar").selectAll('rect')
            .on('mouseover', function(event, d) {
                // prepare tooltip html
                let index = d.index; // get index of the record
                let cuisine = vis.uniqueCuisines[index]; // get the target cuisine using the index
                let details = vis.tooltipDetails[d.data.state][cuisine]; // get restaurant data points corresponding to this state's this cuisine
                let tooltip_html;
                if (details && details.length){
                    tooltip_html = `<strong>Cuisine:</strong> ${cuisine}<br><strong>Restaurants:</strong>`
                    details.forEach(restaurant =>{
                        tooltip_html += `<p>${restaurant.Name},${restaurant.Award}</p><hr>`
                    })
                }

                vis.tooltip.html(tooltip_html)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 28) + "px")
                    .style("opacity", 1)
                    .style('width', '200px')
                    .style('background-color', 'grey')
                    .style('color', 'white')
                    .style('font-size', '15px');
            })
            .on('mouseout', function() {
                vis.tooltip.style("opacity", 0);
            });

        vis.bar_rects.exit().remove();

    }
}