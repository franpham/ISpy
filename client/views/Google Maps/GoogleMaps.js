"use strict";

Meteor.startup(function() {
  GoogleMaps.load();
});
var markers = {};         // the current Markers on the map;
var mapInstance = null;   // needed to add map Marker & Listener;
var thisTopic = '';       // the currentTopic

Template.map.helpers({
  mapOptions: function() {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(21.30886, -157.80858),
        zoom: 12
      };
    }
  },
  topicPics: function() {
    var pics = ImageData.find({ topic: thisTopic });    // change to default topic after DEBUGGING;
    refreshMap(pics);
    return pics;
  }
});

// TODO: show the Markers, show the Images, add topics handler, center Marker;
// 2nd TODO: popup Image, add geolocation, upVote, downVote

Template.map.events({
  "change topicList" : function (event) {
    thisTopic = event.options[event.selectedIndex].value;
    var pics = ImageData.find({ topic: thisTopic });
    refreshMap(pics);
    topicPics = pics;         // set topicPics AFTER refreshMap to refresh the images;
  }
});

Template.map.events({   // "this" is the Marker;
  'click .coolImage' : function () {
    if (Meteor.userId() === this.name) {    // img tag has id of Marker._id and name of userId;
      Markers.remove({ '_id': this.id });
      var marker = Marker.find({ picUrl: this.src });
      marker = marker.hasNext() ? marker.next() : null;
      if (marker) {
        filepicker.remove(marker.picUrl);   // remove image from FilePicker server;
        removeMarker(marker);
      }
      else
        console.log(".coolImage click handler could not find Marker with image src");
    } // the removed function in the observe() below will remove Marker from the map;
  }
});

function refreshMap(pics) {
  var keys = Object.keys(markers);      // remove the old Markers;
  for (var i = 0; i < keys.length; i++) {
    removeMarker(markers[keys[i]]);
  }
  while (pics.hasNext()) {
    var image = pics.next();
    if (!image.markerId)    // the user not have placed a marker!
      continue;
    var marker = new google.maps.Marker({
      draggable: true,
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(image.lat, image.lng),
      map: mapInstance,
      _id: image.markerId,
      userId: image.userId
      // Store the markerId on the marker to update the Marker in the 'dragend' event;
    });
    addMarker(marker);
  }
  pics.rewind();    // MUST rewind the Cursor for template re-rendering;
}

function removeMarker(marker) {
  markers[marker._id].setMap(null);   // remove the marker from the map
  google.maps.event.clearInstanceListeners(markers[marker._id]);
  delete markers[marker._id];    // Remove the reference to this marker
}

function addMarker(marker) {
  // This listener lets us drag markers on the map and update their corresponding Marker object.
  google.maps.event.addListener(marker, 'dragend', function(event) {
    Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
  });
  // ------------------    MARKERS ARE UPDATED WHENEVER USER FINISH DRAGGING IT    --------------
  markers[marker._id] = marker;   // Store this marker instance within the markers object.
}

Template.map.onCreated(function() {
  GoogleMaps.ready('map', function(map) {
    console.log("GoogleMaps is ready!");
    mapInstance = map.instance;           // set mapInstance BEFORE trigger;
    $('#topicList').trigger('change');    // set the initial pics & markers;

    // Register an onchange listener on the filepicker to save the url;
    $("input[type='filepicker']").on('change', function (event) {
        if (!Meteor.userId())     // markerId will be updated after user selects a Marker;
          return;
        var url = event.originalEvent.fpfile.url;
        var picId = ImageData.insert({ markerId: '', userId: Meteor.userId(), username: Meteor.user().username,
                         picUrl: url, upCount: 0, downCount: 0, topic: thisTopic, createdAt: Date.now() });


            ImageData.update({ _id: picId}, { $set: { markerId: markId }});   // update the ImageData's markerId;
            google.maps.event.removeListener(mapListener);            // prevent adding multiple markers;
      }); // -----------------  MARKERS ARE INSERTED WHENEVER USER CLICKS ON THE MAP  ------------------

        var mapListener = google.maps.event.addListener(mapInstance, 'click', function(event) {
            var markId = Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng(), picUrl: '',   // change back to url;
                         userId: Meteor.userId(), username: Meteor.user().username });
  });

    Markers.find().observe({
      added: function(document) {
        // Create a marker for this document
        var marker = new google.maps.Marker({
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng(document.lat, document.lng),
          map: mapInstance,
          _id: document._id,
          userId: Meteor.userId()
          // Store the document _id on the marker to update the document in the 'dragend' event;
        });
        addMarker(marker);
      },

      changed: function(newDocument, oldDocument) {
        markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
        mapInstance.setCenter(markers[newDocument._id].getPosition());
      },

      removed: function(oldDocument) {
        removeMarker(oldDocument);
      }
    });
  });
});
