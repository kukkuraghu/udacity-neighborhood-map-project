var markers = [];
var mapViewModel;
var Locations = [];
function Location(location){
    this.location = location;
    this.name = '';
    this.lat = 0;
    this.lon = 0;
    this.marker = null;
    this.additionalInfo = '';
}
Location.prototype = {
    collectMoreInfo : function() {
        getMoreInfo(this);
    },
    displayInfoWindow : function(loc) {
        openInfoView(loc);
    }
};
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}
function getLocations(){
    var locations = ["Chennai, TamilNadu, India", "Delhi, India", "Mumbai, India", "Kolkotta, India", "Kochi, India"];
    return locations;
}
var ViewModel = function() {
    var self = this;
    this.filterText = ko.observable('');
    //this.locations  = ko.observableArray(Locations);
    this.locations  = ko.observableArray();
    this.filteredLocations = ko.observableArray(this.locations());
    

    this.setFilteredLocations = function() {
        self.filteredLocations(self.locations().filter(function(item){
            var containsStr = item.location.indexOf(self.filterText()) > -1;
            if (item.marker) {
                containsStr ?  item.marker.setMap(map) : item.marker.setMap(null);
            }
            return containsStr;
        }));
        //return self.filteredLocations();
    }
    this.filterText.subscribe(self.setFilteredLocations);
    this.locations.subscribe(self.setFilteredLocations);
}
window.addEventListener('load', function() {
    mapViewModel = new ViewModel();
    ko.applyBindings(mapViewModel);
    initializeMap();
    var locations = getLocations();
    var baseLocation = 'Chennai, TamilNadu, India';
    getPlacesAndDetail(baseLocation);
    /*
    locations.forEach(function(item){
        var loc = new Location(item);
        loc.collectMoreInfo();
        //Locations.push(loc);
        mapViewModel.locations.push(loc);
    });
    */
});