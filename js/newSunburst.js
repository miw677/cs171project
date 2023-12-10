class newSunburst {
    constructor(parentElement, restData) {
        this.parentElement = parentElement;
        this.restData = restData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set size
        vis.width = 800;
        vis.height = 2000;
        vis.radius = vis.width / 4;

        // Arc Generator
        vis.arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(vis.radius * 1.5)
            .innerRadius(d => d.y0 * vis.radius)
            .outerRadius(d => Math.max(d.y0 * vis.radius, d.y1 * vis.radius - 1))

        // Init SVG
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("id", "sunbrust-svg")
            .attr("viewBox", [-vis.width, -vis.height / 2, vis.width * 2, vis.height])
            .style("font", "10px sans-serif");

        // Init tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'sunburstTooltip')

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        // Process the data into a hierarchical format
        function processData(data) {
            let hierarchy = {name: "root", children: []};
            let regions = d3.group(data, d => d.region);

            regions.forEach((states, regionName) => {
                let region = {name: regionName, children: []};
                let statesGroup = d3.group(states, d => d.state_name);

                statesGroup.forEach((awards, stateName) => {
                    let state = {name: stateName, children: []};
                    let awardsGroup = d3.group(awards, d => d.Award);

                    awardsGroup.forEach((entries, awardName) => {
                        let awardValue = entries.length;
                        state.children.push({name: awardName, value: awardValue});
                    });

                    region.children.push(state);
                });

                hierarchy.children.push(region);
            });

            return hierarchy;
        }

        // Tooltip: Calculate total value for percentage
        function calculateTotalValue(data) {
            let totalValue = 0;
            function traverse(node) {
                if (node.value) {
                    totalValue += node.value;
                }
                if (node.children) {
                    node.children.forEach(child => {
                        traverse(child);
                    });
                }
            }
            traverse(data);
            return totalValue;
        }

        // Convert data into hierarchical format
        vis.data = processData(vis.restData);
        console.log('Hierarchical Data', vis.data)

        // for Tooltip: calculate total value
        vis.totalValue = calculateTotalValue(vis.data);
        console.log("Total Value", vis.totalValue);

        vis.updateVis();
    }

    updateVis() {
        let vis = this

        // Define Helpers
        function arcVisible(d) {
            return d.y1 <= 4 && d.y0 >= 1 && d.x1 > d.x0;
        }


        function labelVisible(d) {
            return d.y1 <= 4 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        }

        function labelTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * vis.radius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        }

        // Color Scale
        //vis.color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, vis.data.children.length + 1));
        vis.color = d3.scaleOrdinal(d3.quantize(t => d3.interpolateReds(t * 0.8 + 0.3), vis.data.children.length + 1));


        // Compute Layout
        vis.hierarchy = d3.hierarchy(vis.data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
        vis.root = d3.partition()
            .size([2 * Math.PI, vis.hierarchy.height + 1])
            (vis.hierarchy);
        vis.root.each(d => d.current = d);


        // Append Arcs
        vis.path = vis.svg.append("g")
            .selectAll("path")
            .data(vis.root.descendants().slice(1))
            .join("path")
            .attr("fill", d => { while (d.depth > 1) d = d.parent; return vis.color(d.data.name); })
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
            .attr("d", d => vis.arc(d.current));

        // Make them clickable if they have children
        vis.path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);

        //vis.format = d3.format(",d");
        //vis.path.append("title")
        //    .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${vis.format(d.value)}`);


        // add tooltip
        vis.path
            .on("mouseover", function(event, d) {
                vis.tooltip.transition()
                    .duration(800)
                    .style('opacity', 0.9);

                let count = d.value;
                let percentage = ((count / vis.totalValue) * 100).toFixed(2);
                let tooltipContent = '';
                let title = d.depth === 1 ? 'Region' : d.depth === 2 ? 'State' : 'Award';

                tooltipContent = `<div style="font-size: 16px;"><strong>${title}: ${d.data.name}</strong><br>Total restaurants: ${count}<br>Percentage:${percentage}%<br></div>`;

                if (d.depth === 2) {
                    let regionData = d.parent.data.name;
                    tooltipContent += `<div style="font-size: 16px;">Region: ${regionData}<br></div>`;
                } else if (d.depth === 3) {
                    let stateData = d.parent.data.name;
                    let regionData = d.parent.parent.data.name;
                    tooltipContent += `<div style="font-size: 16px;">Region: ${regionData}<br>State: ${stateData}<br></div>`;
                }


                vis.tooltip.html(tooltipContent)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 38) + 'px')
                    .style("opacity", 1)
                    .style('width', '200px')
                    .style('background-color', 'white')
                    .style('border-radius', '5px')
                    .style('box-shadow', '0 0 5px rgba(0, 0, 0, 0.5)');
            })
            .on("mouseout", function() {
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0)
                    //.style('left', '0px')
                    //.style('top', '0px');
            });


        vis.label = vis.svg.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .selectAll("text")
            .data(vis.root.descendants().slice(1))
            .join("text")
            .attr("dy", "0.35em")
            .style("font-size", d => d.depth === 1 ? "30px" : d.depth === 2 ? "22px" : "19px")
            .attr("fill-opacity", d => +labelVisible(d.current))
            .attr("transform", d => labelTransform(d.current))
            .text(d => d.data.name);

        vis.parent = vis.svg.append("circle")
            .datum(vis.root)
            .attr("r", vis.radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);


        // Handle zoom on click.
        function clicked(event, p) {
            vis.parent.datum(p.parent || vis.root);

            vis.root.each(d => d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            });

            let t = vis.svg.transition().duration(750);

            // Transition the data on all arcs
            vis.path.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .filter(function(d) {
                    return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                })
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")

                .attrTween("d", d => () => vis.arc(d.current));

            vis.label.filter(function(d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));

            return vis.svg.node();
        }

    }



}