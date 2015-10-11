
Markers = new Mongo.Collection('markers');
// Markers fields: _id, lat, lng, img, userId, username
//               number, float, float, string, number, string

ImageData = new Mongo.Collection('imageData');
// ImageData fields: _id, markerId, userId, username, upvotes: {userId: Boolean}, downvotes: {userId: Boolean}
//                 number, number, number, string, {number: true, ....}, {number: true, ....}

// Posts fields: _id, imageId, userId, username, comments: {userId: username+String}
// comments are deletable, but not editable like tweets
