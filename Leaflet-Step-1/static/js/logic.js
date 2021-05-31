// Assemble API query URL
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

function choose_colour(mag){
    if (mag >5)
        return "red"
    else if (mag >4)
        return "darkorange"
    else if (mag >3)
        return "orange"
    else if (mag >2)
        return "yellow"
    else if (mag >1)
        return "lightgreen"
    else
        return "green"
}
  
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });
  
  function createFeatures(earthquakeData) {
  
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature, 
        pointToLayer : function(feature, latlng) {
            return L.circleMarker (latlng)
    
        },
        style: function(feature, latlng) {
            return {radius: feature.properties.mag *5, color: "grey",weight: 1, fillOpacity: 0.75, fillColor: choose_colour(feature.properties.mag)}
        },
        
      });
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }
  
  function createMap(earthquakes) {
    
    //Define satellitte layer 
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v11",
        accessToken: API_KEY
    });

    // Define light layer
    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        //size of image-set to default 
        tileSize: 512,
        //how many times you can zoom into
        maxZoom: 18,
        zoomOffset: -1,
        //tpye of map
        id: "mapbox/light-v10",
        //API Key
        accessToken: API_KEY
    });

    // Deine outdoors layer 
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Satellite Map": satellite,
      "Light Map": lightMap,
      "Outdoors Map": outdoors
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the satellite and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [satellite, earthquakes]
    });

    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //Create Legend 
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        var mag = [0, 1, 2, 3, 4, 5];

        for (var i = 0; i < mag.length; i++) {
            div.innerHTML +=
                "<i style='background-color: " + choose_colour(mag[i] + 1) + "'></i> " +
                mag[i] + (mag[i + 1] ? "&ndash;" + mag[i + 1] + "<br>" : "+");
        }

        return div;
    };
    
    // Adding legend to the map
    legend.addTo(myMap);

}
  