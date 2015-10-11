
Markers = new Mongo.Collection('markers');
// Markers fields: _id, lat, lng, picUrl, userId, username

ImageData = new Mongo.Collection('imageData');
// ImageData fields: _id, markerId, userId, username, picUrl, topic, createdAt, upCount, downCount
// topics (camelCase keys): hot guys, hot girls, cute cats, cute dogs, cool cars, landmarks, venues, events, selfies, traffic

// Posts fields: _id, imageId, userId, username, comments: {userId: username+String}
// comments are deletable, but not editable like tweets
