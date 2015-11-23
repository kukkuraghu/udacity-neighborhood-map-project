/*
This file contains all of the code required 
1. To display the google map and locations.
2. To fetch additional information about locations
3. To persist and read location data to/from localStorage 
*/

var map;    //The global map variable
//only one infoWindow can be present on the map. The var "infoWindow" will hold the visible infoWindow.
var infoWindow = new google.maps.InfoWindow();

//initializes the google map. The global variable "map" will refer to the google map.
function initializeMap() {
  var mapOptions = {
    zoom: 20,
    disableDefaultUI: true
  };

  map = new google.maps.Map(document.querySelector('#mapdiv'), mapOptions); 
  window.mapBounds = new google.maps.LatLngBounds();
}

function getPlacesAndDetail(baseLoc){
  var  locs;
  if (locs = JSON.parse(localStorage.getItem(baseLoc))){
    generateLocation(locs);
    return;
  }
  getAdditionalInfo(baseLoc, 13.089030, 80.266793, processInfo);
  function generateLocation(locs) {
    var noOfLocs = locs.length;
    for (i = 0; i < noOfLocs; i++) {
      var loc = new Location();
      for (var j in locs[i]) {
        loc[j] = locs[i][j];
      }
      loc.marker    = makeMapMarker(loc);
      mapViewModel.locations.push(loc);
    }
  }
  function processInfo(error, result) {
    if (error) return;
    var resultLength = result.response.groups[0].items.length;
    for (var i = 0; i < resultLength; i++) {
        var item = result.response.groups[0].items[i];
        var loc = new Location();
        loc.location  = item.venue.name;
        loc.name      = item.venue.location.address ? item.venue.location.address : 'Address not available';
        loc.lat       = item.venue.location.lat;
        loc.lon       = item.venue.location.lng;
        loc.phone     = item.venue.contact.formattedPhone ? item.venue.contact.formattedPhone : 'Not Available';
        loc.category  = item.venue.categories[0].name ? item.venue.categories[0].name : 'Category not available';
        loc.marker    = makeMapMarker(loc);
        mapViewModel.locations.push(loc);
    }
    localStorage.setItem(baseLoc, JSON.stringify(mapViewModel.locations(), replacer));
    function replacer(i, obj) {
      if (i == 'marker') {
        return null;
      }
      return obj;
    }
  }
}
//listen for resizing of the window  and adjust map bounds
window.addEventListener('resize', function(e) {
  // Make sure the map bounds get updated on page resize
  map.fitBounds(mapBounds);
  map.setCenter(mapBounds.getCenter());
});
function  getAdditionalInfo(place, lat, lon, callback) {
  var request = new XMLHttpRequest();
  var baseUrl = 'https://api.foursquare.com/v2/venues/explore';
  var clientId = 'YAFHOBF2NGR5UJJS4NLNWXCNZBGEMQUBCFA00SFRZLIRM5JO';
  var clientSecret = 'CX2WYTMBELLDEAVQJB3BFFPDWL315NPQK1GYJKL1JZRPBBZX';
  var queryParam1 = place? 'near=' + place : 'll' + '=' + lat + ',' + lon;
  var queryParam2 = 'client_id=' + clientId;
  var queryParam3 = 'client_secret=' + clientSecret;
  var queryParam4 = 'radius=' + 2000;
  var queryParam5 = 'v=20151118';
  var url = baseUrl + '?' + queryParam1 + '&' + queryParam2 + '&' + queryParam3 + '&' + queryParam4 + '&' + queryParam5; 
  request.open('GET', url);
  request.onreadystatechange = function() {
    var requestError = false;
    var data;
    if (request.readyState === 4) {
      request.status === 200? data = JSON.parse(request.responseText) : requestError = true;
      callback(requestError, data);
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
  return marker;

}
function openInfoView(loc) {
  infoWindow.close();
  map.setCenter(window.mapBounds.getCenter());
  var html1 = '<div>' + '<strong>' + loc.location + '</strong>' + '</div>';
  var html2 = '<p>' + loc.category + '</p>';
  var html3 = '<p>' + loc.name + '</p>';
  var html4 = '<p>' + 'Phone No. ' + loc.phone + '</p>';
  //var htmlString = '<div>' + loc.name + '</div>' + '<p>' + loc.additionalInfo + '</p>';
  var htmlString = html1 + html2 + html3 + html4;
  infoWindow.setContent(htmlString);
  loc.marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function() { loc.marker.setAnimation(null);},1000);
  infoWindow.open(map, loc.marker);
}

