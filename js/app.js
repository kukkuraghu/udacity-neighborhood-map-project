var mapViewModel;
function Location(location){
    this.location = location;
    this.name = '';
    this.lat = 0;
    this.lon = 0;
    this.phone = '';
    this.category = '';
    this.marker = null;
}
Location.prototype = {
    displayInfoWindow : function(loc) {
        openInfoView(loc);
    }
};
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}
var ViewModel = function() {
    var self = this;
    this.menuVisibility = ko.observable(true);
    this.filterText = ko.observable('');
    //this.locations  = ko.observableArray(Locations);
    this.locations  = ko.observableArray();
    this.filteredLocations = ko.observableArray(this.locations());
    

    this.setFilteredLocations = function() {
        var filterText = self.filterText().toLowerCase();
        self.filteredLocations(self.locations().filter(function(item){
            var locCategory = item.category.toLowerCase();
            var location = item.location.toLowerCase();
            var containsStr = (locCategory.indexOf(filterText) > -1) || (location.indexOf(filterText) > -1);
            containsStr ?  item.marker.setMap(map) : item.marker.setMap(null);
            return containsStr;
        }));
    }
    this.toggleMenuVisibility = function() {
        this.menuVisibility(!this.menuVisibility());
        map.setCenter(mapBounds.getCenter());
    }
    this.filterText.subscribe(self.setFilteredLocations);
    this.locations.subscribe(self.setFilteredLocations);
}
window.addEventListener('load', function() {
    mapViewModel = new ViewModel();
    ko.applyBindings(mapViewModel);
    initializeMap();
    //var baseLocation = 'Chennai, TamilNadu, India';
    var baseLocation = 'London, UK';
    getPlacesAndDetail(baseLocation);
});