"use strict";
// TODO: popup Image, add geolocation, upVote, downVote

Meteor.startup(function() {
  GoogleMaps.load();
});
var markers = {};               // the current Markers on the map;
var isDragged = true;           // flag to not setMap(null) for dragged markers;
var mapInstance = null;         // needed to add map markers & listeners;
var googler = null;       // needed by outer functions;
var thisTopic = 'hotGuys';     // the currentTopic;

Template.main.helpers({
  mapOptions: function() {
    if (GoogleMaps.loaded()) {
      return { center: new google.maps.LatLng(21.30886, -157.80858), zoom: 12 };
    }
  },
  topicPics: function() {
    var subject = Router.current().params.topic;
    if (googler) {    // if googler is initialized, then page has already loaded;
       var initPics = ImageData.find({ topic: subject });
       refreshMap(initPics);          // set the images' markers;
    }
    return ImageData.find({ topic: subject ? subject : thisTopic });
  }
});

Template.main.events({
  "change #topics" : function (event) {
    thisTopic = event.originalEvent.srcElement.value;
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
      var marker = markers[this.markerId];          // delete the marker only IF user created one;
      if (marker && confirm('Are you sure you want to delete this photo and its map marker?')) {
        filepicker.remove(this.picUrl);             // DELETE IMAGE FROM FILEPICKER SERVER;
        ImageData.remove({ '_id': this._id });
        Markers.remove({ '_id': this.markerId });   // Markers.remove will trigger removeMarker() via observe();
      }
      else
        console.log("The image did not have a marker or the user cancelled deleting.");
    }
  }
});


  function refreshMap(pics) {
    var keys = Object.keys(markers);      // remove the old Markers;
    console.log('in refresh, keys = ' + keys.length);
    for (var i = 0; i < keys.length; i++) {
      if (markers[keys[i]])
        removeMarker(markers[keys[i]]);
    }
    var images = pics.fetch();
    console.log(images);
    for (var i = 0; i < images.length; i++) {
      var markerId = images[i].markerId;
      if (markerId) {    // place a marker only IF user created one;
        var data = Markers.findOne({ '_id': markerId });
        var marker = new googler.Marker({
          draggable: true,
          animation: googler.Animation.DROP,
          position: new googler.LatLng(data.lat, data.lng),
          map: mapInstance,
          _id: markerId,
          userId: images[i].userId
          // Store markerId in marker to update the database in the 'dragend' event;
        });
        addMarker(marker);    // add the new Markers;
      }
    }
  }

  // removeMarker expects a google.maps.Marker INSTANCE!
  function removeMarker(marker) {
    googler.event.clearInstanceListeners(marker);
    delete markers[marker._id];   // remove the reference to the marker
    marker.setMap(null);          // remove the marker from the map
  }

  // addMarker expects a google.maps.Marker INSTANCE!
  function addMarker(marker) {      // update the marker's coordinates after dragging;
    googler.event.addListener(marker, 'dragend', function(event) {
      Markers.update(marker._id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
      isDragged = true;
    });
    // ------------------    MARKERS ARE UPDATED WHENEVER USER FINISH DRAGGING IT    --------------
    markers[marker._id] = marker;   // Store marker instance within the markers dict;
  }

Template.main.onCreated(function() {
  var param = Router.current().params.topic;
  var subject = param ? param : thisTopic;

  GoogleMaps.ready('map', function(map) {
    console.log("GoogleMaps is ready!");
    $('#topics').prop('value', subject);
    mapInstance = map.instance;       // IMPORTANT: set mapInstance;
    googler = google.maps;

    // Register an onchange listener on the filepicker to save the url;
    $("input[type='filepicker']").on('change', function (event) {
        if (!Meteor.userId())                   // NEED TO ADD username FIELD FOR ACCOUNT CREATION;
          return;
        var url = event.originalEvent.fpfile.url;     // markerId will be updated after user clicks on the map;
        var picId = ImageData.insert({ markerId: '', userId: Meteor.userId(), username: Meteor.user().username,
                         picUrl: url, upCount: 0, downCount: 0, topic: thisTopic, createdAt: Date.now() });

      var mapListener = google.maps.event.addListener(mapInstance, 'click', function(event) {
        var markId = Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng(), picUrl: url,
                     userId: Meteor.userId(), username: Meteor.user().username });
        ImageData.update({ _id: picId}, { $set: { markerId: markId }});   // update the ImageData's markerId;
        google.maps.event.removeListener(mapListener);                    // prevent adding multiple markers;
        isDragged = false;     // MUST set to false for new marker;
      });
    }); // -----------------  MARKERS ARE INSERTED WHENEVER USER CLICKS ON THE MAP  ------------------

    Markers.find().observe({
      added: function(document) {   // Create a marker for the document;
        var marker = new google.maps.Marker({
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng(document.lat, document.lng),
          map: mapInstance,
          _id: document._id,
          userId: Meteor.userId()
          // Store _id in marker to update the database in the 'dragend' event;
        });
        addMarker(marker);
      },

      // KNOWN BUG: MARKER GETS DUPLICATED AFTER 1ST DRAG; A HACK IS TO PREVENT 1ST DRAG BY setMap(null);
      changed: function(newDocument, oldDocument) {     // newDocument is a Marker object;
        if (isDragged)
          markers[oldDocument._id].setMap(null);        // remove the old marker from the map;
        markers[oldDocument._id].setPosition(new google.maps.LatLng(newDocument.lat, newDocument.lng));
      },
      removed: function(oldDocument) {       // oldDocument is a Marker object;
        removeMarker(markers[oldDocument._id]);
      }
    });
    var initPics = ImageData.find({ topic: subject });    // GoogleMaps.ready() is only called once!
    refreshMap(initPics);          // set the images' markers;
  });
});
