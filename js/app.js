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
    this.locations  = ko.observableArray(Locations);
    this.filteredLocations = ko.observableArray(Locations);
    ko.computed(function() {
        self.filteredLocations(self.locations().filter(function(item){
            var containsStr = item.location.indexOf(self.filterText()) > -1;
            if (item.marker) {
                containsStr ?  item.marker.setMap(map) : item.marker.setMap(null);
            }
            return containsStr;
        }));
    });

    //this.filteredLocations.subscribe();
    this.getFilteredLocations = function() {
        return self.filteredLocations();
    }
}
window.addEventListener('load', function() {
    initializeMap();
    var locations = getLocations();
    locations.forEach(function(item){
        var loc = new Location(item);
        loc.collectMoreInfo();
        Locations.push(loc);
    });
    mapViewModel = new ViewModel();
    ko.applyBindings(mapViewModel);
});