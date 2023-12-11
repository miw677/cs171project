class WordCloud{
    constructor(parentElement, restData) {
        this.parentElement = parentElement;
        this.restData = restData;
        this.displayData = {};
        this.inMainCat = true;
        this.mainCat = "";

        console.log(this.restData)

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Margin Conventions
        vis.margin = {top: 20, right: 50, bottom: 20, left: 90};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 650;

        //SVG Drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");







        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Counting occurrence of each general category
        this.categoryCounts = {};
        vis.restData.forEach(row => {
            let category = row.General_Category;
            if (category in vis.categoryCounts) { vis.categoryCounts[category] ++;}
            else{vis.categoryCounts[category] = 1;}
        })
        console.log(this.categoryCounts) // Check check check

        // Polish data array
        this.mainDisplayData = Object.keys(vis.categoryCounts).map(key => {
            return {word: key, size: vis.categoryCounts[key]};
        });
        this.displayData = this.mainDisplayData
        console.log(this.displayData) // Check check check



        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Scale for size
        vis.fontSize = d3.scaleLog()
            .domain([1, d3.max(vis.displayData, d => d.size)])
            .range([12,100]);

        // Scale for color
        vis.colorScale = d3.scaleSequential()
            .domain([0, d3.max(vis.displayData, d => d.size) * 0.2])
            .range(["#b30000", "black"]);

        // Word cloud
        vis.layout = d3.layout.cloud()
            .size([vis.width, vis.height])
            .words(vis.displayData.map(function(d) { return {text: d.word, size:d.size}; }))
            .padding(5)
            .rotate(0)
            .font("Impact")
            .fontSize(d => vis.fontSize(d.size))
            .on("end", draw);

        vis.layout.start();

        function draw(words) {
            vis.cloudGroup = vis.svg
                .append("g")
                .attr("transform", "translate(" + vis.layout.size()[0] / 2 + "," + vis.layout.size()[1] / 2 + ")");

            vis.wordLabels = vis.cloudGroup
                .selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .style("font-size", function(d) { return d.size; })
                .style("fill", (d, i) => vis.colorScale(i))
                .attr("text-anchor", "middle")
                .style("font-family", "Impact")
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(d => d.text)
                .style("opacity", 0);

            if (vis.inMainCat === true) {
                vis.wordLabels.on("click", function (event, d) {
                        vis.filterCategory(d.text)
                    });
                // Title
                vis.title = vis.svg.append("text")
                    .attr("x", vis.width / 2)
                    .attr("y", 0)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "14px")
                    .attr("font-weight", "bold")
                    .attr("fill", "darkred")
                    .text("Click on words to explore sub-cuisines!");
            } else {
                vis.title = vis.svg.append("text")
                    .attr("x", vis.width / 2)
                    .attr("y", 10)
                    .attr("text-anchor", "middle");
                vis.title.append("tspan")
                    .text("Sub-Cuisine for: " + vis.mainCat)
                    .attr("x", vis.width / 2)
                    .style("font-family", "Impact")
                    .attr("font-size", "26px")
                    .attr("fill", "darkred");
                vis.title.append("tspan")
                    .text("CLICK HERE TO RETURN")
                    .attr("x", vis.width / 2)
                    .attr("dy", "1.2em")
                    .attr("font-size", "14px")
                    .on("click", function (event, d) {
                        vis.filterCategory()
                    });
            }
        }



        vis.floatVis();
    }


    floatVis() {
        let vis = this;

        function animateCloud() {
            vis.wordLabels.transition()
                .style("opacity", 1)
                .duration(3000)
                .attr("transform", function(d) {
                    const newX = d.x + (Math.random() - 0.5) * 30;
                    const newY = d.y/* + (Math.random() - 0.5) * 30*/;
                    return "translate(" + [newX, newY] + ")rotate(" + d.rotate + ")";
                })
                .on("end", animateCloud);
        }

        animateCloud();
    }


    filterCategory(selectedCategory) {
        let vis = this;
        console.log(selectedCategory)

        if (vis.inMainCat === true) {

            let filteredData = vis.restData.filter(row => row.General_Category === selectedCategory);

            // Counting occurrence of clicked category
            let subCategoryCounts = {};
            filteredData.forEach(row => {
                let subCategory = row.Sub_Category;
                if (subCategory in subCategoryCounts) { subCategoryCounts[subCategory] ++;}
                else{subCategoryCounts[subCategory] = 1;}
            })
            console.log(subCategoryCounts) // Check check check

            // Polish data array
            this.displayData = Object.keys(subCategoryCounts).map(key => {
                return {word: key, size: subCategoryCounts[key]};
            });

            // Toggle
            vis.inMainCat = false;
            vis.mainCat = selectedCategory;

            console.log(this.displayData) // Check check check
        } else {
            vis.displayData = vis.mainDisplayData

            // Toggle
            vis.inMainCat = true;
        }


        // Remove existing cloud elements
        vis.svg.selectAll("text").transition().duration(600).style("opacity", 0)
            .attr("transform", "")
            .remove();



        vis.updateVis();
    }
}


