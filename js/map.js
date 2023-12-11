
/*
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

class LeafMap {

    /*
     *  Constructor method
     */
    constructor(parentElement, displayData, mapCenter) {
        this.parentElement = parentElement;
        this.displayData = displayData;
        this.mapCenter = mapCenter

        this.initVis();

    }

    /*
     *  Initialize station map
     */
    initVis () {
        let vis = this;
        console.log('center', vis.mapCenter)
        console.log('map', vis.map)


        vis.map = L.map('leafMapDiv').setView(vis.mapCenter, 5);
        L.Icon.Default.imagePath = 'img/';

        // add a layer
        L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(vis.map);

        // Initialize marker cluster group
        vis.markersCluster = L.markerClusterGroup();

        // add layer group
        vis.markerLayer = L.layerGroup().addTo(vis.map);

        console.log('Container Size:', document.getElementById(vis.parentElement).offsetHeight);

        // Add a circle for California
        var californiaCircle = L.circle([36.7783, -119.4179], {
            color: '#e6550d',
            fillColor: '#fdae6b',
            fillOpacity: 0.3,
            radius: 500000
        }).addTo(vis.map);

        // Reset map to zoom level
        L.Control.resetZoomButton = L.Control.extend({
            options: {
                position: 'topright'
            },
            onAdd: function(map) {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control-custom');
                container.innerHTML = '<button id="resetZoomButton" class="leaflet-bar-part leaflet-bar-part-single" title="Reset Zoom">Reset Zoom</button>';

                container.querySelector('#resetZoomButton').addEventListener('click', function() {
                    map.setView(vis.mapCenter, 5);
                });

                return container;
            }
        });

        vis.map.addControl(new L.Control.resetZoomButton());


        // search function
        // L.Control.geocoder({
        //     defaultMarkGeocode: false
        // })
        //     .on('markgeocode', function(e) {
        //         var bbox = e.geocode.bbox;
        //         var poly = L.polygon([
        //             [bbox.getSouthEast().lat, bbox.getSouthEast().lng],
        //             [bbox.getNorthEast().lat, bbox.getNorthEast().lng],
        //             [bbox.getNorthWest().lat, bbox.getNorthWest().lng],
        //             [bbox.getSouthWest().lat, bbox.getSouthWest().lng]
        //         ]);
        //         vis.map.fitBounds(poly.getBounds());
        //     })
        //     .addTo(vis.map);

        vis.wrangleData();
    }


    /*
     *  Data wrangling
     */
    wrangleData (selectedAward, selectedRegion) {
        let vis = this;

        vis.filteredData = this.displayData.filter(d =>
            (selectedAward ? d.Award === selectedAward : true) &&
            (selectedRegion ? d.region === selectedRegion : true)
        );

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Clear existing markers from the cluster group
        vis.markersCluster.clearLayers();

        // Loop through the dataset and append a marker for each restaurant
        vis.filteredData.forEach(restaurant => {
            // Create a marker for each restaurant
            let marker = L.marker([restaurant.Latitude, restaurant.Longitude])
                .bindPopup(`<b>${restaurant.Name}</b><br>${restaurant.Address}<br><a href="${restaurant.WebsiteUrl}" target="_blank">${restaurant.WebsiteUrl}</a>`);

            // Add marker to the cluster group instead of the map
            vis.markersCluster.addLayer(marker);
        });

        // Add the cluster group to the map
        vis.map.addLayer(vis.markersCluster);

    }

    // search for specific restaurant
    searchRestaurantByName(searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const restaurant = this.displayData.find(r => r.Name.toLowerCase().includes(lowerSearchTerm));

        if (restaurant) {
            this.map.setView([restaurant.Latitude, restaurant.Longitude], 17);
        } else {
            alert("Restaurant not found");
        }
    }
}
