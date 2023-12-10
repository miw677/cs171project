class BostonMap {

    constructor(parentElement, displayData, latLong, mbta) {
        this.parentElement = parentElement;
        this.displayData = displayData;
        this.latLong = latLong;
        this.mbta = mbta;
        this.userMarker = null;

        console.log(this.parentElement)
        console.log(this.displayData)
        console.log(this.latLong)
        console.log(this.mbta)

        this.initVis();
    }


    initVis () {
        let vis = this;

        vis.map = L.map(vis.parentElement).setView(vis.latLong, 15)

        L.Icon.Default.imagePath = 'img/';

        L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(vis.map);

        // Init empty layer group
        vis.markerLayer = L.layerGroup().addTo(vis.map);

        vis.wrangleData();
    }



    wrangleData () {
        let vis = this;

        // No data wrangling/filtering needed

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Clear marker layer group
        vis.markerLayer.clearLayers();

        // Loop through all items
        vis.displayData.forEach(d => {
            let marker = L.marker([d.lat, d.lon]);
            marker.bindPopup(`<b>${d.restaurant_name}</b><br/>Address: ${d.restaurant_address}`);
            vis.markerLayer.addLayer(marker);
        })


        // MBTA Mapping
        vis.subway = L.geoJson(vis.mbta, {
            style: d => ({color: d.properties.LINE}),
            weight: 5,
            fillOpacity: 0.7
        }).addTo(this.map);



        // Extra: Obtain the user's current location
        let showLocationButton = document.getElementById('showLocationButton');

        showLocationButton.addEventListener('click', function () {

            navigator.geolocation.getCurrentPosition(function(position) {
                let userLat = position.coords.latitude;
                let userLon = position.coords.longitude;
                let accuracy = position.coords.accuracy;

                if (vis.userMarker) {vis.map.removeLayer(vis.userMarker);}

                vis.userMarker = L.circle([userLat, userLon], {radius: accuracy + 1000}).addTo(vis.map);
                vis.userMarker.bindPopup("Your Location");

                console.log(vis.userMarker.getBounds())

                //vis.map.fitBounds(vis.userMarker.getBounds());
                vis.map.flyToBounds(vis.userMarker.getBounds(), {
                    animate: true,
                    duration: 2
                });

            });
        });


        // Backup: Show SEC location
        let showSECButton = document.getElementById('showSECButton');

        showSECButton.addEventListener('click', function () {

            let userLat = 42.3632914;
            let userLon = -71.1255948;

            if (vis.userMarker) {vis.map.removeLayer(vis.userMarker);}

            vis.userMarker = L.circle([userLat, userLon], {radius: 1000}).addTo(vis.map);
            vis.userMarker.bindPopup("Harvard SEC");

            vis.map.flyTo([userLat, userLon], 14, {
                animate: true,
                duration: 2
            });

        });

    }
}

