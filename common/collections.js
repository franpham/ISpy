
Markers = new Mongo.Collection('markers');
// Markers fields: _id, lat, lng, userId, username, createdAt
// createdAt is used to match Markers and ImageData when markerId is not known;

ImageData = new Mongo.Collection('imageData');
// ImageData fields: _id, markerId, userId, username, createdAt, upCount, downCount

// Posts fields: _id, imageId, userId, username, comments: {userId: username+String}
// comments are deletable, but not editable like tweets
