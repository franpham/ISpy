
Markers = new Mongo.Collection('markers');
// Markers fields: _id, lat, lng, img, userId, username

ImageData = new Mongo.Collection('imageData');
// ImageData fields: _id, markerId, userId, username, createdAt, upCount, downCount, upvotes: {userId: Boolean}, downvotes {userID: Boolean}
