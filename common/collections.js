
Markers = new Mongo.Collection('markers');
// Markers fields: _id, lat, lng, img, userId, username

// Posts fields: _id, imageId, userId, username, comments: {userId: username+String}
// comments are deletable, but not editable like tweets

ImageData = new Mongo.Collection('imageData');
// ImageData fields: _id, markerId, userId, username, createdAt, upCount, downCount, upvotes: {userId: Boolean}, downvotes {userID: Boolean}
