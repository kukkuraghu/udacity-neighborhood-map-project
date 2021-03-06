var mapViewModel; //this will hold the ViewModel. 

//Declares the View MOdel
var ViewModel = function() {
    var self = this;
    this.menuVisibility = ko.observable(true);//by default the location menu is visbile
    this.filterText = ko.observable(''); 
    this.locations  = ko.observableArray(); //obervable array contains all the locations
    this.filteredLocations = ko.observableArray(); //observable array contains locations filtered. The menu and markers show locations in this array.

    //routine to load filteredLocations
    //called for locations array  and filterText changes
    this.setFilteredLocations = function() {
        var filterText = self.filterText().toLowerCase();//the filtering is case insesitive
        //locations filtered from locations
        //matches against category and location name
        self.filteredLocations(self.locations().filter(function(item){
            var locCategory = item.category.toLowerCase();
            var location = item.name.toLowerCase();
            var containsStr = (locCategory.indexOf(filterText) > -1) || (location.indexOf(filterText) > -1);
            //if the location is filtered out, the corresponding marker is hidden
            //if the location is filtered in, the marker is made visible
            containsStr ?  item.marker.setMap(map) : item.marker.setMap(null);
            return containsStr;
        }));
    };

    //routine to toggle menu visibility
    //when the hamburger icon is clicked, this routine is called
    this.toggleMenuVisibility = function() {
        this.menuVisibility(!this.menuVisibility());
        map.setCenter(mapBounds.getCenter());
    };
    //register the routine for fliterText changes
    this.filterText.subscribe(self.setFilteredLocations);
    //register the routine for locations array changes
    this.locations.subscribe(self.setFilteredLocations);
};

window.addEventListener('load', function() {
    mapViewModel = new ViewModel();
    ko.applyBindings(mapViewModel);
    //the app will display locations around the baseLocation
    var baseLocation = 'Manhattan, NY, US';
    //loads the places and markers
    getPlacesAndDetail(baseLocation);
});