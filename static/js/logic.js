
var e_json;
const API_KEY = "pk.eyJ1IjoiY2tzYW5kYWwiLCJhIjoiY2s5ZnZqODlpMGd5OTNlcDljeHE3bmE1dyJ9.goVu2G2UFoD74YaS02ixyA"
var e_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var f_json;
var f_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


// parallel processing - one of them, the one that finishes last based
// on the counter will trip the drawMap() function...
var cnt = 2;
d3.json(e_url, function(data) {
  e_json = data;
  cnt--;
  if (cnt == 0) drawMap();
});
d3.json(f_url, function(data) {
  f_json = data;
  cnt--;
  if (cnt == 0) drawMap();
});

// this is where the rubber meets the road
function drawMap() { 

  // three different map styles
  var satMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY  
  });
  var gryMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY  
  });
  var outMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY  
  });

  // combine them together
  var baseMaps = { 
    "Satellite": satMap,
    "Grayscale": gryMap,
    "Outdoors": outMap
  };

  // need this for earthquake popups
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      "<b>Where:     </b>" + feature.properties.place + "<br>" + 
      "<b>When:      </b>" + new Date(feature.properties.time)+ "<br>" + 
      "<b>Magnitude: </b>" + feature.properties.mag);
    layer.on('mouseover', function(d){ this.openPopup()});
    layer.on('mouseout', function(d){ this.closePopup()});
  }
  
  // need this for colored circles based on eq. magnitude
  function circleColor(magnitude) { 
      return magnitude > 5 ? '#F6412D' :
             magnitude > 4 ? '#FF5607' :
             magnitude > 3 ? '#FF9800' :
             magnitude > 2 ? '#FFC100' :
             magnitude > 1 ? '#206934' :
                             '#4FFF80';  
  }
   
  // and this to stitch in the circles for various eq.s
  function pointToLayer(feature, latlng) { 
    return new L.CircleMarker(latlng, {
      radius: 6*feature.properties.mag,
      fillColor: circleColor(feature.properties.mag),
      color: circleColor(feature.properties.mag),
      weight: 1,
      fillOpacity: 0.5});
  }
  
  // make the earthquake overlay
  var earthquakes = L.geoJSON(e_json.features, { 
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer,
  });

  // make the faultlines overlay - no need to tune anything for this
  // even the default color is OK. 
  var faultlines = L.geoJSON(f_json.features, {
  });

  // combine all overlays
  var overlayMaps = {
    Earthquakes: earthquakes,
    Faultlines: faultlines
  };

  // make a map - I like the outdoor variety as the default
  var myMap = L.map('map', {
    center: [37.09, -98.71], 
    zoom:4.65,
    layers: [outMap, faultlines, earthquakes]
  });   

  // add the overlay selectors
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // legend for the colored circles - this needed CSS assist 
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
			  grades = [0, 1, 2, 3, 5],
			  labels = [],
			  from, to;
		for (var i = 0; i < grades.length; i++) {
			from = grades[i]; 	to = grades[i + 1];
			labels.push(
				'<i style="background:' + circleColor(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}
		div.innerHTML = labels.join('<br>');
		return div;
	};
  legend.addTo(myMap);
}

























  
