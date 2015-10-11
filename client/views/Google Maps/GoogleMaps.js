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
  }
});
var mapInstance = null;
var mapListener = null;

Template.map.events({
  'click #addMarker' : function (event) {
    if (!Meteor.userId())
      return;
    else if (!mapListener) {
      mapListener = google.maps.event.addListener(mapInstance, 'click', function(event) {
        Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });
    }
    else {
      google.maps.event.removeListener(mapListener);
      mapListener = null;
    }
  }
});

Template.map.events({
  'click #deleteMarker' : function (event) {
    if (Meteor.userId() === event.userId) {
      Markers.remove({ '_id': event.id });
    } // the removed function in the observe() below will remove Marker from the map;
  }
});

Template.map.onCreated(function() {
  GoogleMaps.ready('map', function(map) {
    console.log("GoogleMaps is ready!");
    mapInstance = map.instance;
    var markers = {};     // -----------------  MARKERS ARE INSERTED WHENEVER USER CLICKS ON THE MAP  ------------------

    Markers.find().observe({
      added: function(document) {
        // Create a marker for this document
        var marker = new google.maps.Marker({
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng(document.lat, document.lng),
          map: map.instance,
          id: document._id,
          userId: Meteor.userId()
          // Store the document _id on the marker to update the document in the 'dragend' event;
        });
        // This listener lets us drag markers on the map and update their corresponding document.
        google.maps.event.addListener(marker, 'dragend', function(event) {
          Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
        });
        // ---------------------------    MARKERS ARE UPDATED WHENEVER USER FINISH DRAGGING IT    ---------------------
        markers[document._id] = marker;
      },  // Store this marker instance within the markers object.

      changed: function(newDocument, oldDocument) {
        markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
      },

      removed: function(oldDocument) {
        // Remove the marker from the map
        markers[oldDocument._id].setMap(null);

        // Clear the event listener
        google.maps.event.clearInstanceListeners(markers[oldDocument._id]);

        // Remove the reference to this marker instance
        delete markers[oldDocument._id];
      }
    });
  });
});
