
Markers = new Mongo.Collection('markers');
// Markers fields: _id, lat, lng, picUrl, userId, username

ImageData = new Mongo.Collection('imageData');
// ImageData fields: _id, markerId, userId, username, picUrl, topic, desc, createdAt, upCount, downCount
// topics (camelCase keys): hot guys, hot girls, cute cats, cute dogs, cool cars, landmarks, venues, events, selfies, traffic

// Votes fields: {picId: {userId: 0/1, ...}}   // 0 for down, 1 for upvote;

// Comments fields: _id, picId, userId, username, comment, createdAt
// comments are deletable, but not editable like tweets
