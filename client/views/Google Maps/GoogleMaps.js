"use strict";

Meteor.startup(function() {
  GoogleMaps.load();
});

Template.map.helpers({
  mapOptions: function() {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(-37.8136, 144.9631),
        zoom: 8
      };
    }
  },
  topicPics: function() {
    var pics = ImageData.find();
    refreshMap(pics);
    return pics;
  }
});
var mapInstance = null;   // needed to add map Marker & Listener;
var thisTopic = '';       // the currentTopic

// TODO: show the Markers, show the Images, add topics handler, popup Image, center Marker;
// 2nd TODO: add geolocation, upVote, downVote

Template.map.events({
  "change topicList" : function (event) {
    thisTopic = event.options[event.selectedIndex].value;
    var pics = ImageData.find({ topic: thisTopic });
    refreshMap(pics);
    topicPics = pics;         // set topicPics AFTER refreshMap to refresh the images;
  }
});

Template.map.events({     // Register an onchange listener on the filepicker to save the url;
  "change input[type='filepicker']" : function (url) {     // filepicker input passes the url;
    if (!Meteor.userId())                      // ----- url or event is 1st arg -----
      return;
    var markerKey = Markers.find({ picUrl: url })._id;
    ImageData.insert({ markerId: markerKey, userId: Meteor.userId(), username: Meteor.user().username,
                     picUrl: url, upCount: 0, downCount: 0, topic: thisTopic, $currentDate: { createdAt: true } });

    var mapListener = google.maps.event.addListener(mapInstance, 'click', function(event) {
      Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng(), picUrl: url,
                       userId: Meteor.userId(), username: Meteor.user().username });
      google.maps.event.removeListener(mapListener);    // prevent new clicks after marker is added;
    }); // -----------------  MARKERS ARE INSERTED WHENEVER USER CLICKS ON THE MAP  ------------------
  }
});

Template.map.events({   // "this" is the Marker;
  'click #deleteMarker' : function () {
    if (Meteor.userId() === this.userId) {
      Markers.remove({ '_id': this.id });
    } // the removed function in the observe() below will remove Marker from the map;
  }
});

function refreshMap(pics) {
  while (pics.hasNext()) {
    var image = pics.next();
    var marker = new google.maps.Marker({
      draggable: true,
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(image.lat, image.lng),
      map: mapInstance,
      id: image.markerId,
      userId: image.userId
      // Store the markerId on the marker to update the document in the 'dragend' event;
    });
    setMarker(marker);
  }
  pics.rewind();    // MUST rewind the Cursor for template re-rendering;
}

function removeMarker(marker) {
  markers[marker._id].setMap(null);   // Remove the marker from the map
  google.maps.event.clearInstanceListeners(markers[marker._id]);
  delete markers[marker._id];    // Remove the reference to this marker
}

function setMarker(marker) {
  // This listener lets us drag markers on the map and update their corresponding document.
  google.maps.event.addListener(marker, 'dragend', function(event) {
    Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
  });
  // ------------------    MARKERS ARE UPDATED WHENEVER USER FINISH DRAGGING IT    --------------
  markers[document._id] = marker;   // Store this marker instance within the markers object.
}

Template.map.onCreated(function() {
  GoogleMaps.ready('map', function(map) {
    mapInstance = map.instance;
    var markers = {};

    console.log("GoogleMaps is ready!");
    $('#topicList').trigger('change');    // set the initial pics & markers;

    Markers.find().observe({
      added: function(document) {
        // Create a marker for this document
        var marker = new google.maps.Marker({
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng(document.lat, document.lng),
          map: mapInstance,
          id: document._id,
          userId: Meteor.userId()
          // Store the document _id on the marker to update the document in the 'dragend' event;
        });
        setMarker(marker);
      },

      changed: function(newDocument, oldDocument) {
        markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
      },

      removed: function(oldDocument) {
        removeMarker(oldDocument);
      }
    });
  });
});
