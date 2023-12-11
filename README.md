# Project README

**Project Title: Finding your next Michelin star, or Bo-chelin!**

**Description:** We are a group of three foodies who are genuinely passionate about tasty and memorable restaurants. When we arrived in Boston, we realized that the city does not have any Michelin restaurants. Motivated by a curiosity as to why this is the case, we want to explore current Michelin restaurants as well as top-rated restaurants in Boston.

**Screencast Video:** https://harvard.zoom.us/rec/share/Qcskqjk_eWMdr2WOEZ2b_jhVxzgbVB6AaImCU_NRxYqgrSJ_P3extq3GZ3AKeKJ9.X__UhYddvOY7W6Sp?startTime=1702310839000

**Live Site:** https://miw677.github.io/cs171project 


## Prerequisites

1. HTML and JavaScript Environment
2. Web Browser: Chrome, Firefox, or Edge
3. Bootstrap CSS
4. Leaflet and Leaflet Plugins
5. D3.js
6. Google Fonts
7. fullpage.js
8. Stadia Maps API


## Project files

|–––>css
      |–––>fullpage.css
      |–––>style.css
      |–––>leaflet.css
|–––>data
      |–––>MBTA-Lines.json
      |–––>YELP.Restaurants.MA.csv
      |–––>michelin_us_processed_subcat.csv
|–––>img
      |–––> ...
|–––>js
|–––>js
|–––>index.html


### CSS:
fullpage.css: library. enables horizontal scrolling view of our website
style.css: our stylesheet for the website
leaflet.css: library. stylesheet for map drawing  (Michelin US map & Bochelin map)

### data:
MBTA-Lines.json: for drawing the MBTA lines in Boston for Bochelin map
YELP.Restaurants.MA.csv: Yelp Restaurant information in MA, for Bochelin map
Michelin_us_processed_subcat.csv: data for Michelin restaurants in the US; used across Word cloud, Michelin US map, Sunburst, Sankey, Star Pick bar plot

### Img
Contains marker image for maps (Michelin US map & Bochelin map)

### JS
D3.layout.cloud.js: library for word cloud 
Fullpage.js: library for horizontal scrolling view of our website page
Leaflet.js: library for leaflet map 
Main.js: our code for loading all data and initiate all instances 
cloud.js: our code for the WordCloud class that wrangles data and draws the word cloud visualization.
Map.js: our code for the US map for all michelin restaurants 
newSunburst.js: our code for visualizing sunburst in a hierarchical data structure
sankeyVis.js: our code for the SankeyVis class that wrangles data and draws the Sankey visualization.
starPickVis.js: our code for the StarPick class that wrangles data and draws the word Star Pick barplot visualization.
Bostonmap.js: our code for the BostonMap class that wrangles data and draws the Bochelin map visualization.


### Index.html: 
includes css libraries in the beginning marked by “<!-- Load CSS libraries -->”  
includes bootstrap libraries marked by “<!-- BOOTSTRAP -->”
includes javascript libraries marked by “<!-- D3 and Libraries -->”
includes our own Javascript files marked by “<!-- OWN JS -->”  


## Initiation

1. Clone the project repository: https://github.com/miw677/cs171project
2. Change into the project directory
3. Start localhost server environment
4. Open index.html


## Features
- The web page is formatted into multiple full pages. Users will browse the content in a slide style.
- Each visualization is designed with interactions. But interactions are optional. Users will benefit from interacting with each visualization to get more detailed information.
- Map visualization will request browser permission for the device’s current physical location, but it is optional.


## Known Issues
User experience is not optimized for mobile devices and touch controls. They are mainly designed for desktop environments.


## License
D3.js is licensed under the BSD 3-Clause License. For details, please refer to the license file provided with the D3.js source code.
Bootstrap is licensed under the MIT License. For details, please refer to the license file provided with the Bootstrap source code.
Google Fonts are subject to the Open Font License (OFL). For details, please refer to the individual font's OFL.txt file available on the Google Fonts website.
fullPage.js is licensed under the MIT License. For details, please refer to the license file provided with the fullPage.js source code.
Leaflet is licensed under the 2-Clause BSD License. For details, please refer to the license file provided with the Leaflet source code.
