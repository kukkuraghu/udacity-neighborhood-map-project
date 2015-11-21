/*
This file contains all of the code required to display the google map and locations. 
*/

var internationalizeButton = '<button>Internationalize</button>';
var googleMap = '<div id="map"></div>';
var infoWindow = new google.maps.InfoWindow({
});
var map;    // declares a global map variable

/*
Start here! initializeMap() is called when page is loaded.
*/
function initializeMap() {

  var locations;

  var mapOptions = {
    zoom: 16,
    disableDefaultUI: true
  };

  // This next line makes `map` a new Google Map JavaScript Object and attaches it to
  // <div id="map">, which is appended as part of an exercise late in the course.
  map = new google.maps.Map(document.querySelector('#mapdiv'), mapOptions);
  window.mapBounds = new google.maps.LatLngBounds();
}



// Vanilla JS way to listen for resizing of the window
// and adjust map bounds
window.addEventListener('resize', function(e) {
  // Make sure the map bounds get updated on page resize
  map.fitBounds(mapBounds);
  map.setCenter(mapBounds.getCenter());
});

document.addEventListener('fullscreenchange', function(e) {
  // Make sure the map bounds get updated on page resize
  map.fitBounds(mapBounds);
  map.setCenter(mapBounds.getCenter());
});

function getMoreInfo(location){
  //console.log(location.location);
  var service = new google.maps.places.PlacesService(map);
  var request = {
    query: location.location
  };
      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
  //console.log('request query location : ' + request.query);
  service.textSearch(request, callback);
  function callback(placeData, status) {
    //console.log('status : ' + status);
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      location.lat = placeData[0].geometry.location.lat();  // latitude from the place service
      //console.log(location.location);
      //console.log('location lat :' + location.lat);
      location.lon = placeData[0].geometry.location.lng();  // longitude from the place service
      location.name = placeData[0].formatted_address; 
      getAdditionalInfo(location.lat, location.lon, processAdditionalInfo);
    }
    function processAdditionalInfo(info) {
      location.additionalInfo = info.response.groups[0].items[0].venue.name;
      //console.log('loc name : ' + location.name );
      //console.log('addi info : ' + location.additionalInfo);
      makeMapMarker(location);
      localStorage(location.location, JSON.stringify(location));
    }
  }
}

function  getAdditionalInfo(lat,lon,callback) {
    var request = new XMLHttpRequest();
    var baseUrl = 'https://api.foursquare.com/v2/venues/explore';
    var clientId = 'YAFHOBF2NGR5UJJS4NLNWXCNZBGEMQUBCFA00SFRZLIRM5JO';
    var clientSecret = 'CX2WYTMBELLDEAVQJB3BFFPDWL315NPQK1GYJKL1JZRPBBZX';
    var url = baseUrl + '?' + 'll' + '=' + lat + ',' + lon + '&' + 'client_id' +  '=' + clientId + '&' + 'client_secret' + '=' + clientSecret + '&v=20151118';
    request.open('GET', url);
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        var data = JSON.parse(request.responseText);
        callback(data);
      } 
    }
    request.send(null);
}

function makeMapMarker(loc) {
    // The next lines save location data from the search result object to local variables
  var lat = loc.lat;  // latitude from the place service
  var lon = loc.lon;  // longitude from the place service
  var location = {
    lat : lat,
    lng : lon
  };
  var name = loc.name;   // name of the place from the place service
  var bounds = window.mapBounds;            // current boundaries of the map window

  // marker is an object with additional data about the pin for a single location
  var marker = new google.maps.Marker({
    map: map,
    position: location,
    title: name
  });
  loc.marker = marker;
  //markers.push(marker);
  bounds.extend(new google.maps.LatLng(lat, lon));
  // fit the map to the new marker

  window.mapBounds = bounds;
    
  map.fitBounds(bounds);
  // center the map
  map.setCenter(bounds.getCenter());
  
  google.maps.event.addListener(marker, 'click', function() {
    openInfoView(loc);
  });

}
function openInfoView(loc) {
    infoWindow.close();
    map.setCenter(window.mapBounds.getCenter());
    var htmlString = '<div>' + loc.name + '</div>' + '<p>' + loc.additionalInfo + '</p>';
    infoWindow.setContent(htmlString);
    loc.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() { loc.marker.setAnimation(null);},1000);
    infoWindow.open(map, loc.marker);
}

