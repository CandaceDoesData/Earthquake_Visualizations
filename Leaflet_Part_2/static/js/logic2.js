let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

// Perform a GET request to the query URL.
d3.json(url).then(function (data) {
    console.log(data.features);
    // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.
  
    // 1.
    // Pass the features to a createFeatures() function:
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

function getColor (depth) {

    let color = ""; // Assign the default value

    if (depth <= 10) {
        color = "Green";
    } else if (depth <= 30) {
        color = "Lightgreen";
    } else if (depth <= 50) {
        color = "Yellow";
    } else if (depth <= 70) {
        color = "Orange";
    } else if (depth <= 90) {
        color = "Orangered" ; 
    } else {
        color = "Red";
    }

    return color; // Add return statement
}
  
// 2.
function createFeatures(earthquakeData) {
  
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }
  
    // Save the earthquake data in a variable.
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature : onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 5, // Adjust as needed
                fillColor: getColor(feature.geometry.coordinates[2]), // Get color based on depth
                color: "#000",
                weight: 1,
                opacity: 1, 
                fillOpacity: 0.8
            });
        }
    });
  
    // Pass the earthquake data to a createMap() function.
    createMap(earthquakes);
}
  
// 3.
// createMap() takes the earthquake data and incorporates it into the visualization:
  
function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
    });

    let terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://stamen.com">Stamen</a>'
    });

    // Create a baseMaps object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo,
        "Terrain Map": terrain
    };

    // Create a tectonic plates layer
    let tectonicPlates = new L.LayerGroup();

    // Perform a GET request to fetch the tectonic plates data
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (data) {
        // Create a GeoJSON layer for the tectonic plates and add it to the tectonicPlates layer group
        L.geoJSON(data, {
            style: {
                color: "orange",
                weight: 2
            }
        }).addTo(tectonicPlates);
    });
  
    // Create an overlays object.
    let overlayMaps = {
      Earthquakes : earthquakes,
      "Tectonic Plates": tectonicPlates
    };
  
    // Create a new map.
    // Edit the code to add the earthquake data to the layers.
    let myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 2.5,
        layers: [street, earthquakes, tectonicPlates]
    });
  
    // Create a layer control that contains our baseMaps.
    // Be sure to add an overlay Layer that contains the earthquake GeoJSON.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add legend
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend"),
        depth = [-10, 10, 30, 50, 70, 90];
        
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
        for (let i =0; i < depth.length; i++) {
            div.innerHTML += 
                '<i style="background:' + getColor(depth[i] + 1) + '"></i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
}