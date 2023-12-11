new fullpage('#fullpage', {
    navigation: 'true'
    // Get your license at https://alvarotrigo.com/fullPage/pricing/
    //licenseKey: 'YOUR LICENSE KEY HERE '
});


// init global variables, switches, helper functions
let myMapVis, wordCloud, myStarPick, mySankey, mySunburstVis;



// Event Listeners
// for map
function filterData() {
    let selectedAward = document.getElementById("awardDropdown").value;
    let selectedRegion = document.getElementById("regionDropdown").value;
    myMapVis.wrangleData(selectedAward, selectedRegion);
}

// for sankey
// we have a selectedCategory global variable to wrangle the visualization
let leftCategory =  document.getElementById('leftSelection').value;
let rightCategory =  document.getElementById('rightSelection').value;

document.getElementById('leftSelection').addEventListener('change', function() {
    mySankey.updateLeftCategory(this.value);
});
document.getElementById('rightSelection').addEventListener('change', function() {
    mySankey.updateRightCategory(this.value);
});

// for starpick
// we have a selectedCategory global variable to wrangle the visualization
let category =  document.getElementById('selection').value;


function categoryChange() {
    category =  document.getElementById('selection').value;
    myStarPick.wrangleData();
}


// load data using promises
let promises = [
    d3.csv("data/michelin_us_processed_subcat.csv"),
    d3.json("data/MBTA-Lines.json"),
    d3.csv("data/YELP.Restaurants.MA.csv")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(allDataArray) {

    // log data
    console.log(allDataArray);

    // create empty data structure
    let displayData = []

    // Prepare data
    allDataArray[0].forEach(restaurant => {
        const restaurantInfo = {
            Address: restaurant.Address,
            AveragePrice: parseFloat(restaurant.AveragePrice),
            Award: restaurant.Award,
            Cuisine: restaurant.Cuisine,
            Currency: restaurant.Currency,
            Latitude: parseFloat(restaurant.Latitude),
            Location: restaurant.Location,
            Longitude: parseFloat(restaurant.Longitude),
            MaxPrice: parseFloat(restaurant.MaxPrice),
            MinPrice: parseFloat(restaurant.MinPrice),
            Name: restaurant.Name,
            PhoneNumber: restaurant.PhoneNumber,
            Url: restaurant.Url,
            WebsiteUrl: restaurant.WebsiteUrl,
            Zip: parseInt(restaurant.Zip),
            region: restaurant.region,
            state_id: restaurant.state_id,
            state_name: restaurant.state_name
        };

        displayData.push(restaurantInfo);

    });

    console.log('display data', displayData)

    // Init Visualizations
    myMapVis = new LeafMap("leafMapDiv", displayData, [39.8283, -98.5795]);
    wordCloud = new WordCloud('wordCloud', allDataArray[0]);
    mySankey = new SankeyVis('sankeyDiv', allDataArray[0]);
    myStarPick = new StarPickVis('starPickDiv', allDataArray[0]);
    // mySunburstVis = new sunburst("sunburstDiv", allDataArray[0]);
    mySunburstVis = new newSunburst("sunburstDiv", allDataArray[0]);
    myBostonMap = new BostonMap("bochelinDiv", allDataArray[2], [42.360082, -71.058880], allDataArray[1])

    // Add event listener for the search button
    document.getElementById('searchButton').addEventListener('click', () => {
        const searchTerm = document.getElementById('searchInput').value;
        myMapVis.searchRestaurantByName(searchTerm);
    });
}
