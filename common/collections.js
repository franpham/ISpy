Markers = new Mongo.Collection('markers');
// Markers fields: _id, lat, lng, img, userId, username
// #, float, float, string, number, string

ImageData = new Mongo.Collection('imageData');
// ImageData fields: _id, markerId, userId, username, upvotes: {userId: Boolean}, downvotes {userID: Boolean}
//                  number, number, number, string, (number:true},object(numer: true))