/* * * * * * * * * * * * * *
 *      class SankeyVis    *
 * * * * * * * * * * * * * */

class SankeyVis {

    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;
        this.originalData = data;
        this.tooltipData = data;
        this.currentView = 'general';

        this.initVis();
    }

    initVis(){
        let vis = this;

        // Set the dimensions and margins of the graph
        vis.margin = { top: 40, right: 40, bottom: 10, left: 20 };
        vis.width = 900 - vis.margin.left - vis.margin.right;
        vis.height = 700 - vis.margin.top - vis.margin.bottom;

        // append the svg object to the body of the page
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Color scale for nodes
        vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);


        // Initialize the Sankey diagram
        vis.sankey = d3.sankey()
            .nodeWidth(200)
            .nodePadding(10)
            .size([vis.width, vis.height])
            .nodeAlign(d3.sankeyJustify);

        vis.links = vis.svg.append("g")
            .attr('class', 'links')
            .attr("fill", "none")
            .attr("stroke-opacity", 0.5);

        vis.nodes = vis.svg.append("g").attr('class', 'nodes')

        vis.nodeLabels = vis.svg.append("g").attr('class', 'node-labels')

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'sankeyTooltip')

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        // Process the data to fit the Sankey diagram requirements
        vis.nodes = [];
        vis.links = [];

        console.log(vis.currentView)

        console.log(leftCategory)
        console.log(rightCategory)

        // Create nodes for each unique award and region
        let leftSet = new Set(vis.data.map(d => d[leftCategory]));
        let rightSet = new Set(vis.data.map(d => d[rightCategory]));

        // Add the awards and regions as distinct nodes
        leftSet.forEach(a => vis.nodes.push({name: a}));
        rightSet.forEach(r => vis.nodes.push({name: r}));

        vis.nodeIndex = name => vis.nodes.findIndex(n => n.name === name);

        //Create links for each entry, ensuring no circular references
        vis.data.forEach(d => {
            let target = vis.nodeIndex(d[rightCategory]);
            let source = vis.nodeIndex(d[leftCategory]);

            // connect source and target
            if (source >= 0 && target >= 0 && source !== target) {
                let existingLink = vis.links.find(l => l.source === source && l.target === target);
                if(existingLink) {
                    existingLink.value += 1;
                } else {
                    vis.links.push({source, target, value: 1});
                }
            }
        });


        // group data by the selected left category
        let restaurantByLeftCategory = Array.from(d3.group(vis.data, d => d[leftCategory]), ([key, value]) => ({key, value}))

        vis.tooltipData = restaurantByLeftCategory

        console.log(vis.tooltipData)

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        // if (leftCategory === 'Cuisine') {
        //     // Show the button when General_Category is being visualized
        //     document.getElementById('switchView').style.display = 'inline-block';
        // } else{
        //     document.getElementById('switchView').style.display = 'none';
        // }


        // Constructs the Sankey graph
        vis.graph = vis.sankey({
            nodes: vis.nodes.map(d => Object.assign({}, d)),
            links: vis.links.map(d => Object.assign({}, d))
        });

        // Draw the links
        vis.link = vis.svg.selectAll('.links')
            .selectAll("path")
            .data(vis.graph.links)

        vis.link.enter().append("path").merge(vis.link)
            .transition() // Add transitions to the bars/rectangles of your chart
            .duration(500)
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", d=>d3.rgb(vis.colorScale(d.source.name)))
            .attr("stroke-width", d => Math.max(1, d.width))

        vis.svg.selectAll('path').on("mouseover", function(event, d) {
            let selectedLeftNode = d.source.name;


            let restaurantCount = vis.tooltipData.filter(d => d.key === selectedLeftNode)[0].value.length
            let regionCounts = d3.rollup(vis.data.filter(d => d[leftCategory] === selectedLeftNode), v => v.length, d => d[rightCategory]);
            let regionPercents = Array.from(regionCounts, ([region, count]) => ({
                region: region,
                percent: (count / restaurantCount * 100).toFixed(2)
            }));


            let tooltipHtml = `<div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px"><h3>${d.source.name}<h3><h4> Total restaurants: ${JSON.stringify(restaurantCount)}</h4>`;
            regionPercents.forEach(rp => {
                tooltipHtml += `<h4>${rp.region}: ${rp.percent}%</h4>`;
            });
            tooltipHtml += '</div>';

            vis.tooltip.style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(tooltipHtml);

            // set non-selected links grey
            vis.svg.selectAll('path')
                .style('stroke', '#ccc');

            // MUST-HAVE Sankey: improve highlighting features - highlight the hovered link only
            d3.select(this)
                .style('stroke', d3.select(this).attr('stroke'))
                .style('stroke-opacity', 0.8);


        })
            .on("mouseout", function(d) {
                // set links to original color
                vis.svg.selectAll('path')
                    .style('stroke', null)  // Reset to original color
                    .style('stroke-opacity', null);  // Reset to original opacity

                // hide tooltip info
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        vis.link.exit().remove();

        if (vis.currentView === 'general' && leftCategory ==='General_Category'){
            document.getElementById('sankey-instruction').innerHTML = '<span style="color: #cc0000;">Click on a link</span> to view sub-category distribution';
        } else{
            document.getElementById('sankey-instruction').innerHTML = '<span style="color: #cc0000;">Choose relationships</span> to visualize from the select box. <span style="color: #cc0000;">Hover over a specific link</span> to see the restaurant distribution in detail.';
        }

        // add on click functions so user can click on a link
        if ((vis.currentView ==='general' && leftCategory === 'General_Category') || (vis.currentView ==='general' && leftCategory === 'Cuisine') ) {
            vis.svg.selectAll('path').on('click', function(event, d) {
                vis.switchView(d.source.name);
            });
        }

        // Draw the nodes
        vis.node = vis.svg.selectAll('.nodes')
            .selectAll("rect")
            .data(vis.graph.nodes);

        vis.node.enter().append("rect").merge(vis.node)
            .transition() // Add transitions to the bars/rectangles of your chart
            .duration(500)
            .attr("x", d => d.x0)
            .attr("y", d => d.y0 - 5)
            .attr("height", d => d.y1 - d.y0 + 10)
            .attr("width", vis.sankey.nodeWidth())
            .attr("fill", d => d3.rgb(vis.colorScale(d.name)).brighter(0.5))
            .attr('opacity', 0.6)
            .attr("stroke", d => d3.rgb(vis.colorScale(d.name)).darker(0.5));

        vis.node.exit().remove();

        // Add titles for hover interaction
        vis.node_titles = vis.svg.selectAll('.nodes')
            .selectAll("title");

        vis.node_titles.append("title").merge(vis.node_titles)
            .transition() // Add transitions to the bars/rectangles of your chart
            .duration(800)
            .text(d => `${d.name}\n${d.value}`);

        vis.node_titles.exit().remove();

        // Add node labels
        vis.nodeLabel = vis.svg.selectAll('.node-labels')
            .selectAll("text")
            .data(vis.graph.nodes);

        vis.nodeLabel.enter().append("text").merge(vis.nodeLabel)
            .transition() // Add transitions to the bars/rectangles of your chart
            .duration(1000)
            .attr("x", d => (d.x0 + d.x1) / 2)
            .attr("y", function(d){
                return (d.y1 + d.y0+ 10 ) / 2 -5

            })
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(d => d.name)
            .style("fill", d => d3.rgb(vis.colorScale(d.name)).darker(7))
            .style('font-size', function(){
                if(leftCategory === 'General_Category' || leftCategory === 'Cuisine'){
                    return '10px';
                }
                else{
                    return '13px';
                }
            });

        vis.nodeLabel.exit().remove();
    }
    switchView(generalCategory) {
        let vis = this;

        if (vis.currentView === 'general') { // if it's general view
            // filter data to a specific general Category
            let subCategoryData = vis.originalData.filter(d => d['General_Category'] === generalCategory);
            vis.data = subCategoryData;

            // change the current view type & the left category to specific sub-cuisines
            leftCategory = 'Cuisine';
            vis.currentView = 'subcategory';
        }
        vis.wrangleData();
    }
    updateRightCategory(newRightCategory) {
        let vis = this;
        rightCategory = newRightCategory;
        vis.determineView()
        vis.wrangleData();
    }
    updateLeftCategory(newLeftCategory) {
        let vis = this;
        leftCategory = newLeftCategory;
        vis.determineView()
        vis.wrangleData();
    }
    determineView(){
        // handling complex changes to form a closed-loop visuailization experience
        let vis = this;
        if (vis.currentView === 'subcategory' && leftCategory === 'Award'){
            vis.currentView = 'general'
            vis.data = vis.originalData
        } else if (vis.currentView === 'general' && leftCategory === 'Award'){
            vis.currentView = 'general'
            vis.data = vis.originalData
        } else if (vis.currentView === 'subcategory' && leftCategory === 'Cuisine'){
            leftCategory = 'General_Category'
            vis.currentView = 'general'
            vis.data = vis.originalData
        }
    }
}