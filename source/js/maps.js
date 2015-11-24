/*
This file contains all of the code required 
1. To display the google map.
2. To fetch location information.
3. To create marker for locations
3. To persist and read locations data to/from localStorage 
*/

var map;    //The global map variable

//only one infoWindow can be present on the map. 
//The var "infoWindow" will hold the visible infoWindow.
var infoWindow = new google.maps.InfoWindow();

//initializes the google map. The global variable "map" will refer to the google map.
function initializeMap() {
  var mapOptions = {
    zoom: 10,
    disableDefaultUI: true
  };

  //html should have a div with id 'mapdiv'
  map = new google.maps.Map(document.querySelector('#mapdiv'), mapOptions); 

  //winodw.mapBound will always hold the map bounds.
  window.mapBounds = new google.maps.LatLngBounds();
}

//This functions gets the interesting places around baseLoc.
//If places data is already available in the localStorgae, it is fetched from there.
//Else fetches from third party data provider (FOURSQUARE) through an API call.
function getPlacesAndDetail(baseLoc) {
  var  locs;
  //check if locations are available in the localStorage
  //if available in LocalStorage, call 'generateLocations' to load data as an array of Objects
  //if not available in LocalStorage, call 'getLocations' to fetch from data provider
  (locs = JSON.parse(localStorage.getItem(baseLoc))) ? generateLocations(locs) : getLocations(baseLoc, processInfo);

  //loads the location info to mapViewModel.locations
  function generateLocations(locs) {
    var noOfLocs = locs.length;
    for (i = 0; i < noOfLocs; i++) {
      var loc = new Location(locs[i]);
      mapViewModel.locations.push(loc);
    }
  }

  //this is the callback for getLocations
  function processInfo(error, result) {
    //if getLocations returns error, try to display the map alone centered at baseLoc
    if (error) {
      getGeocode(baseLoc, centerMap);
      return;
    }

    //no error from getLocations. Process data
    var resultLength = result.response.groups[0].items.length;
    for (var i = 0; i < resultLength; i++) {
        var item = result.response.groups[0].items[i];
        var loc = new Location();
        loc.name  = item.venue.name;
        loc.address   = item.venue.location.address ? item.venue.location.address : 'Address not available';
        loc.lat       = item.venue.location.lat;
        loc.lon       = item.venue.location.lng;
        loc.phone     = item.venue.contact.formattedPhone ? item.venue.contact.formattedPhone : 'Not Available';
        loc.category  = item.venue.categories[0].name ? item.venue.categories[0].name : 'Category not available';
        loc.marker    = makeMapMarker(loc);
        mapViewModel.locations.push(loc);
    }

    //store the locations in localStorage
    localStorage.setItem(baseLoc, JSON.stringify(mapViewModel.locations(), replacer));
    
    //this is for JSON.stringify.
    //to ensure location.marker to have null value.
    //otherwise stringify will throw error.
    function replacer(i, obj) {
      if (i == 'marker') {
        return null;
      }
      return obj;
    }

    //callback for getGeocode
    //centers the map using the data returned from getGeocode
    function centerMap(error, data) {
      var centre = {lat: -34.397, lng: 150.644}; //default map center
      
      //if getGeocode returns a valid location, center the map using that location
      if (!error  && data.status === 'OK' ) { 
        centre = data.results[0].geometry.location;
      }
      map.setCenter(centre);
    }
  }
}

//listen for resizing of the window  and adjust map bounds
window.addEventListener('resize', function(e) {
  // Make sure the map bounds get updated on page resize
  map.fitBounds(mapBounds);
  map.setCenter(mapBounds.getCenter());
});

//gets places from foursquare api for 'place'
//calls 'callback' with data/error
function  getLocations(place, callback) {
  var request = new XMLHttpRequest();
  var baseUrl = 'https://api.foursquare.com/v2/venues/explore';
  var clientId = 'YAFHOBF2NGR5UJJS4NLNWXCNZBGEMQUBCFA00SFRZLIRM5JO';
  var clientSecret = 'CX2WYTMBELLDEAVQJB3BFFPDWL315NPQK1GYJKL1JZRPBBZX';
  var queryParams = [];
  queryParams[0] = 'near=' + place;
  queryParams[1] = 'client_id=' + clientId;
  queryParams[2] = 'client_secret=' + clientSecret;
  queryParams[3] = 'radius=' + 2000; //finds places in a circle with radius 2000 metetes.
  queryParams[4] = 'v=' + (new Date()).toISOString().slice(0,10).replace(/-/g,"");
  var url = baseUrl + '?' + queryParams.join('&');
  request.open('GET', url);
  request.onreadystatechange = function() {
    var requestError = false;
    var data;
    if (request.readyState === 4) {
      //if there is no error, parse the returned data.
      //if error, set the error status to true.
      request.status === 200? data = JSON.parse(request.responseText) : requestError = true;
      callback(requestError, data);
    } 
  }
  request.send(null);
}

//generates a marker from Location object
//assigs the generated marker to loc.marker
//adds an event handler for the click on marker
function makeMapMarker(loc) {
  var lat   = loc.lat;  // latitude
  var lon   = loc.lon;  // longitude
  var name  = loc.name;
  var location = {
    lat : lat,
    lng : lon
  };
  var bounds = window.mapBounds;            // current boundaries of the map window

  var marker = new google.maps.Marker({
    map: map,
    position: location,
    title: name
  });
  loc.marker = marker;
  bounds.extend(new google.maps.LatLng(lat, lon));// fit the map to the new marker
  map.fitBounds(bounds);
  map.setCenter(bounds.getCenter());// center the map
  window.mapBounds = bounds; //ensure window.mapBounds has the latest bounds.
  
  //adds the click event handler to the marker
  google.maps.event.addListener(marker, 'click', function() {
    openInfoView(loc); //opens the InfoView
  });
  return marker;

}

//opens infoview window at the marker mentioned in Location object 'loc'
//uses the global variable 'infoWindow'
function openInfoView(loc) {
  infoWindow.close(); //closes currently displayed infoView (if it is there). 
  
  //center the map at the marker for which infoView is displayed.
  map.setCenter(new google.maps.LatLng(loc.lat, loc.lon)); 
  var htmlStrings = [];
  htmlStrings[0] = '<div>' + '<strong>' + loc.name + '</strong>' + '</div>';
  htmlStrings[1] = '<p>' + loc.category + '</p>';
  htmlStrings[2] = '<p>' + loc.address + '</p>';
  htmlStrings[3] = '<p>' + 'Phone No. ' + loc.phone + '</p>';
  var html = htmlStrings.join('');
  infoWindow.setContent(html);//'html' has the infoView content
  
  //sets the BOUNCE animation on marker
  loc.marker.setAnimation(google.maps.Animation.BOUNCE);
  
  //switch off the animation after 1second.
  setTimeout(function() { loc.marker.setAnimation(null);},1000);
  infoWindow.open(map, loc.marker);
}

//this function gets the geocodes (latitude and longitude) using 'place' - a string.
//it calls the 'callback' with two values 'requestError' and 'data'
//'requestError' is true if there is an error in getting geocodes.
//'data' will have the geocodes, if there is no error - data.results[0].geometry.location
function getGeocode(place, callback){
  var request = new XMLHttpRequest();
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + place;
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