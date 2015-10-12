"use strict";

Meteor.startup(function() {
  GoogleMaps.load();
});
var markers = {};               // the current Markers on the map;
var mapInstance = null;         // needed to add map Marker & Listener;
var thisTopic = 'cuteCats';     // the currentTopic
// Template.map was renamed to Template.main since map.html was moved to Main.html;

Template.main.helpers({
  mapOptions: function() {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(21.30886, -157.80858),
        zoom: 12
      };
    }
  },
  topicPics: function() {   // refreshMap() must be called in onCreated() since Meteor will iterate the Cursor when rendering;
    return ImageData.find({ topic: Router.current().params.topic });
  }
});

// TODO: show the Markers, show the Images, add topics handler, center Marker;
// 2nd TODO: popup Image, add geolocation, upVote, downVote

Template.main.events({
  "change #topics" : function (event) {
    var index = event.originalEvent.srcElement.selectedIndex;
    thisTopic = event.originalEvent.srcElement[index].value;
    Router.go('/main/' + thisTopic);
  }
});

Template.main.events({   // "this" is the ImageData;
  'click .coolImage' : function () {
    mapInstance.setCenter(markers[this.markerId].getPosition());
  }
});

Template.main.events({   // "this" is the ImageData;
  'dblclick .coolImage' : function () {
    if (Meteor.userId() === this.userId) {
      var marker = markers[this.markerId];          // Marker exists only IF user created one;
      if (marker && confirm('Are you sure you want to delete this photo and its map marker?')) {
        filepicker.remove(this.picUrl);             // remove image from FilePicker server;
        ImageData.remove({ '_id': this._id });
        Markers.remove({ '_id': this.markerId });   // Markers.remove will triger removeMarker();
      }
      else
        console.log("The image did not have a marker or the user cancelled deleting.");
    } // the removed function in the observe() below will remove Marker from the map;
  }
});

function refreshMap(pics) {
  var keys = Object.keys(markers);      // remove the old Markers;
  for (var i = 0; i < keys.length; i++) {
    removeMarker(markers[keys[i]]);
  }
  var images = pics.fetch();
  for (var i = 0; i < images.length; i++) {
    var markerId = images[i].markerId;
    if (markerId) {    // place a marker only if user created one before;
      var data = Markers.findOne({ '_id': markerId });
      var marker = new google.maps.Marker({
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(data.lat, data.lng),
        map: mapInstance,
        _id: markerId,
        userId: images[i].userId
        // Store the markerId on the marker to update the Marker in the 'dragend' event;
      });
      addMarker(marker);
    }
  }
  pics.rewind();    // MUST rewind the Cursor for template re-rendering;
}

function removeMarker(marker) {
  markers[marker._id].setMap(null);   // remove the marker from the map
  google.maps.event.clearInstanceListeners(markers[marker._id]);
  delete markers[marker._id];    // Remove the reference to the marker
}

function addMarker(marker) {
  // This listener lets us drag markers on the map and update their corresponding Marker object.
  google.maps.event.addListener(marker, 'dragend', function(event) {
    Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
  });
  // ------------------    MARKERS ARE UPDATED WHENEVER USER FINISH DRAGGING IT    --------------
  markers[marker._id] = marker;   // Store marker instance within the markers object.
}

Template.main.onCreated(function() {
  GoogleMaps.ready('map', function(map) {
    console.log("GoogleMaps is ready!");
    mapInstance = map.instance;           // set mapInstance BEFORE trigger;
    var initPics = ImageData.find({ topic: thisTopic });
    refreshMap(initPics);   // set the initial images & markers;

    // Register an onchange listener on the filepicker to save the url;
    $("input[type='filepicker']").on('change', function (event) {
        if (!Meteor.userId())     // markerId will be updated after user selects a Marker;
          return;
        var url = event.originalEvent.fpfile.url;
        var picId = ImageData.insert({ markerId: '', userId: Meteor.userId(), username: Meteor.user().username,
                         picUrl: url, upCount: 0, downCount: 0, topic: thisTopic, createdAt: Date.now() });

    var mapListener = google.maps.event.addListener(mapInstance, 'click', function(event) {
        var markId = Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng(), picUrl: '',   // change back to url;
                     userId: Meteor.userId(), username: Meteor.user().username });
        ImageData.update({ _id: picId}, { $set: { markerId: markId }});   // update the ImageData's markerId;
        google.maps.event.removeListener(mapListener);            // prevent adding multiple markers;
    });
    }); // -----------------  MARKERS ARE INSERTED WHENEVER USER CLICKS ON THE MAP  ------------------

    Markers.find().observe({
      added: function(document) {
        // Create a marker for the document
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
      },

      removed: function(oldDocument) {
        removeMarker(oldDocument);
      }
    });
  });
});
