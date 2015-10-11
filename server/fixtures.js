"use strict";

if (Markers.find().count() === 0) {
    var markers = [
                  {_id: 0,
                  lat: 0.01,
                  lng: 0.02,
                  img: "banana",
                  userId: 123,
                  username: "Francis"
                  },
                  {_id: 1,
                  lat: 0.03,
                  lng: 0.04,
                  img: "pears",
                  userId: 121,
                  username: "Kasi"
                  },
                  {_id: 3,
                  lat: 0.05,
                  lng: 0.06,
                  img: "apples",
                  userId: 120,
                  username: "El"
                  },
                  {_id: 4,
                  lat: 0.07,
                  lng: 0.08,
                  img: "avacados",
                  userId: 125,
                  username: "Naomi"
                  },
                  {_id: 5,
                  lat: 0.09,
                  lng: 0.10,
                  img: "Cola",
                  userId: 126,
                  username: "Francis"
                  },
                  {_id: 6,
                  lat: 0.11,
                  lng: 0.12,
                  img: "Water",
                  userId: 127,
                  username: "Kasi"
                  }
    ];
    for (var i = 0; i < markers.length; i++){
      Markers.insert({_id: markers[i]._id, lat: markers[i].lat, lng: markers[i].lng,
        img: markers[i].img, userId: markers[i].userId, username: markers[i].username});
    }
};

if (ImageData.find().count() === 0) {
    var imageData = [
                  {_id: 1,
                  markerId:54,
                  userId:53,
                  username: "banana",
                  createdAt: "10/20/22",
                  upCount: 3,
                  downCount: 6,
                  downvotes:{1: true},
                  upvotes:{2: true}
                  },
                  {_id: 2,
                  markerId:54,
                  userId:57,
                  username: "pineapple",
                  downvotes:{2: true},
                  upvotes:{3:true}
                  },
                  {_id: 3,
                  markerId:54,
                  userId:59,
                  username: "grapes",
                  createdAt: "10/20/22",
                  upCount: 3,
                  downCount: 6,
                  downvotes:{1: true},
                  upvotes:{3:true}
                  },
                  {_id: 4,
                  markerId:54,
                  userId:58,
                  username: "cherries",
                  downvotes:{3:true},
                  upvotes:{1: true}
                  },
                  {_id: 5,
                  markerId:54,
                  userId:53,
                  username: "RootBeer",
                  createdAt: "10/20/22",
                  upCount: 3,
                  downCount: 6,
                  downvotes:{1: true},
                  upvotes:{3:true}
                  },
                  {_id: 6,
                  markerId:54,
                  userId: 23,
                  username: "Melon",
                  createdAt: "10/20/22",
                  upCount: 3,
                  downCount: 6,
                  downvotes:{3:true},
                  upvotes:{1: true}
                  }
    ];
    for (var i = 0; i < imageData.length; i++){
      ImageData.insert({_id: imageData[i].id, markerId: imageData[i].markerId, userId: imageData[i].userId,
        username: imageData[i].username, createdAt: imageData[i].createdAt, upCount: imageData[i].upCount,
        downCount: imageData[i].downCount, downvotes: imageData[i].downvotes, upvotes: imageData[i].upvotes});
    }
};