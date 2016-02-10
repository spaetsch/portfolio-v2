"use strict";

//Error handling - checks if Google Maps has loaded
if (!window.google || !window.google.maps){
  $('#map-container').text('Error: Google Maps data could not be loaded');
  $('#map-list').text('Error: Google Maps data could not be loaded');
}

// --------- MODEL ---------------

var markersModel = [
  {
    title: "5 Spot",
    category: "restaurant",                         // category for search field
    address: "1502 Queen Anne Ave N., Seattle, WA", // street address for use by Google Maps geocoder
    phone: "(206) 285-7768",                         // phone number for use by Yelp API
    status: ko.observable("OK"),                    // change status if error message received from Yelp
    marker: new google.maps.Marker({               // google maps marker object
      position: new google.maps.LatLng(0,0),          // set initial position to (0,0)
      icon: "img/pins/restaurant.png"                 // category icon for map pin
    })
  },
  {
    title: "Bustle on Queen Anne",
    category: "coffee",
    address: "535 W. McGraw St., Seattle, WA",
    phone: "(206) 453-4285",
    status: ko.observable("OK"),
    marker: new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/coffee.png"
    })
  },
  {
    title: "Cafe Ladro",
    category: "coffee",
    address: "2205 Queen Anne Ave N, Seattle, WA",
    phone: "(206) 282-5313",
    status: ko.observable("OK"),
    marker: new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/coffee.png"
    })
  },
  {
    title: "Homegrown",
    category: "restaurant",
    address: "2201 Queen Anne Ave N., Seattle, WA",
    phone: "(206) 217-4745",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/restaurant.png"
    })
  },
  {
    title: "Hommage",
    category: "restaurant",
    address: "198 Nickerson St, Seattle, WA",
    phone: "(206) 283-2665",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/restaurant.png"
    })
  },
  {
    title: "Nickerson Street Saloon",
    category: "pub",
    address: "318 Nickerson St, Seattle, WA",
    phone: "(206) 284-8819",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/bar.png"
    })
  },
  {
    title: "Paragon Seattle",
    category: "pub",
    address: "2125 Queen Anne Ave N, Seattle, WA",
    phone: "(206) 283-4548",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/bar.png"
    })
  },
  {
    title: "Storyville Coffee Company",
    category: "coffee",
    address: "2128 Queen Anne Ave N, Seattle, WA",
    phone:"(206) 780-5777",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/coffee.png"
    })
  },
  {
    title: "Sully's Lounge",
    category: "pub",
    address: "1625 Queen Anne Ave N, Seattle, WA",
    phone: "(206) 283-3900",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/bar.png"
    })
  },
  {
    title: "Tenth West",
    category: "restaurant",
    address: "1903 10th Ave W, Seattle, WA",
    phone: "(206) 708-6742",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/restaurant.png"
    })
  },
  {
    title: "Trader Joe's",
    category: "grocery",
    address: "1916 Queen Anne Ave., Seattle, WA",
    phone: "(206) 284-2546",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/supermarket.png"
    })
  },
  {
    title: 'Whole Foods',
    category: "grocery",
    address: "2001 15th Ave. W., Seattle, WA",
    phone:"(206) 352-5440",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/supermarket.png"
    })
  }
];
// ---------------------------------- VIEWMODEL ------------------------------

var resultMarkers = function(members){
  var self = this;

  self.mapOptions = {
    center: new google.maps.LatLng(47.641437, -122.360834), //set map center in Queen Anne
    zoom: 15
  };

  var mapCont = document.getElementsByClassName('map-container');

  self.map = new google.maps.Map(mapCont[0], self.mapOptions);

  self.infowindow = new google.maps.InfoWindow({ maxWidth:250 });

  self.searchReq = ko.observable('');     //user input to Search box

  // Filtered version of data model, based on Search input
  self.filteredMarkers = ko.computed(function() {
    //Remove all markers from map
    var len = members.length;
    for (var i = 0; i < len; i++) {
      members[i].marker.setMap(null);
      clearTimeout(members[i].timer);
    }
    //Place only the markers that match search request
    var arrayResults = [];
    arrayResults =  $.grep(members, function(a) {
      var titleSearch = a.title.toLowerCase().indexOf(self.searchReq().toLowerCase());
      var catSearch = a.category.toLowerCase().indexOf(self.searchReq().toLowerCase());
      return ((titleSearch > -1 || catSearch > -1) && a.status() === 'OK');
    });
    //Iterate thru results, set animation timeout for each
    var len = arrayResults.length;
    for (var i = 0; i < len; i++){
      (function f(){
        var current = i;
        var animTimer = setTimeout(function(){arrayResults[current].marker.setMap(self.map);}, i * 300);
        arrayResults[current].timer = animTimer;
      }());
    }
    //Return list of locations that match search request, for button list
    return arrayResults;
  });

  //Use street address in model to find LatLng
  self.setPosition = function(location){
    var geocoder = new google.maps.Geocoder();
    //use address to find LatLng with geocoder
    geocoder.geocode({ 'address': location.address }, function(results, status) {
      if (status === 'OK'){
        location.marker.position = results[0].geometry.location;
        location.marker.setAnimation(google.maps.Animation.DROP);
      } else if (status === 'OVER_QUERY_LIMIT'){
        // If status is OVER_QUERY_LIMIT, then wait and re-request
        setTimeout(function(){
          geocoder.geocode({ 'address': location.address }, function(results, status) {
              location.marker.position = results[0].geometry.location;
            });
        }, 3000);

      } else {
        //If status is any other error code, then set status to Error, which will remove it from list and map
        location.status('ERROR');
        //Log error information to console
        console.log('Error code: ', status, 'for Location:', location.title);
      }
    });
  };

  //Adds infowindows to each marker and populates them with Yelp API request data
  self.setBubble = function(index){
    //Add event listener to each map marker to trigger the corresponding infowindow on click
    google.maps.event.addListener(members[index].marker, 'click', function () {

      //Request Yelp info, then format it, and place it in infowindow
      yelpRequest(members[index].phone, function(data){

        var contentString = "<div id='yelpWindow'>" +
                            "<h5>" +  "<a href='" + data.mobile_url + "' target='_blank'>" +data.name + "</a>" + "</h5>" +
                            "<p>" + data.location.address + "</p>" +
                            "<p>" + data.display_phone + "</p>" +
                            "<img src='" + data.rating_img_url_large + "'>" +
                            "<p>" + data.snippet_text + "</p>" +
                            "</div>";
        self.infowindow.setContent(contentString);
      });

      self.infowindow.open(self.map, members[index].marker);
  });
};

  //Iterate through data model, get LatLng location then set up infowindow
  self.initialize = function(){
    for (var current in members){
      self.setPosition(members[current]);
      self.setBubble(current);
    }
  };

  //Toggle bounce animation for map marker on click of Location list button (via data-binding)
  self.toggleBounce = function(currentMarker) {
    if (currentMarker.marker.getAnimation() !== null) {
      currentMarker.marker.setAnimation(null);
    } else {
      self.map.setCenter(currentMarker.marker.position);       //center map on bouncing marker
      currentMarker.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){currentMarker.marker.setAnimation(null);}, 2800); //bounce for 2800 ms
    }
  };
};

//----

var myMarkers = new resultMarkers(markersModel);
ko.applyBindings(myMarkers);
google.maps.event.addDomListener(window, 'load', myMarkers.initialize);
