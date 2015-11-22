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
  getAdditionalInfo(13.089030, 80.266793, processInfo);
  function processInfo(result) {
    //info.response.groups[0].items[0].venue.name
    var resultLength = result.response.groups[0].items.length;
    console.log(resultLength);
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
  }
  /*
  var service = new google.maps.places.PlacesService(map);
  var request = {
    location : new google.maps.LatLng(13.089030, 80.266793),
    radius : 10000,
    query : 'park'
  };
  service.textSearch(request, callback);
  function callback(result, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      var resultLength = result.length;
      var loc = new Location();
      for (var i = 0; i < resultLength; i++) {
        var loc = new Location();
        loc.location  = result[i].name;
        loc.name      = result[i].formatted_address;
        loc.lat       = result[i].geometry.location.lat();
        loc.lon       = result[i].geometry.location.lng();
        loc.marker    = makeMapMarker(loc);
        mapViewModel.locations.push(loc);
      }
      
      //location.lat = placeData[0].geometry.location.lat();  // latitude from the place service
      //location.lon = placeData[0].geometry.location.lng();  // longitude from the place service
      //location.name = placeData[0].formatted_address; 
      //getAdditionalInfo(location.lat, location.lon, processAdditionalInfo);
    }
  }
  */
}
//listen for resizing of the window  and adjust map bounds
window.addEventListener('resize', function(e) {
  // Make sure the map bounds get updated on page resize
  map.fitBounds(mapBounds);
  map.setCenter(mapBounds.getCenter());
});

function getMoreInfo(location){
  var storedLocStr;
  //check if the location details can be retrieved from local storage.
  if (storedLocStr = localStorage.getItem(location.location)) {
    //location detail available in local storage. Populate the "location" object with detail.
    var storedLoc = JSON.parse(storedLocStr);
    for (var i in storedLoc) {
      location[i] = storedLoc[i];
    }
    makeMapMarker(location);
    return;
  }
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
      //console.log('location lat :' + location.lat);
      location.lon = placeData[0].geometry.location.lng();  // longitude from the place service
      location.name = placeData[0].formatted_address; 
      getAdditionalInfo(location.lat, location.lon, processAdditionalInfo);
    }
    function processAdditionalInfo(info) {
      var locFieldFilter = [];
      location.additionalInfo = info.response.groups[0].items[0].venue.name;
      //console.log('loc name : ' + location.name );
      //console.log('addi info : ' + location.additionalInfo);
      makeMapMarker(location);
      for (var i in location) {
        if (location.hasOwnProperty(i) && (typeof location[i] !== 'object') && (typeof location[i] !== 'function')) {
          locFieldFilter.push(i);
        }
      }
      localStorage.setItem(location.location, JSON.stringify(location, locFieldFilter));
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

