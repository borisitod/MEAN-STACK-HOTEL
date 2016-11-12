var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');


var runGeoQuery = function(req, res) {

  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);

  // A geoJSON point
  var point = {
    type : "Point",
    coordinates : [lng, lat]
  };

  var geoOptions = {
    spherical : true,
    maxDistance : 2000,
    num : 5
  };

  Hotel
    .geoNear(point, geoOptions, function(err, results, stats) {
      console.log('Geo Results', results);
      console.log('Geo stats', stats);
      res
        .status(200)
        .json(results);
    });

};

module.exports.hotelsGetAll = function(req, res) {
    
  var offset = 0;
  var count = 5;
  var maxCount = 10;

  if (req.query && req.query.lat && req.query.lng) {
    runGeoQuery(req, res);
    return;
  }

  if (req.query && req.query.offset) {
    offset = parseInt(req.query.offset, 10);
  }

  if (req.query && req.query.count) {
    count = parseInt(req.query.count, 10);
  }
    
  if(isNaN(offset) || isNaN(count)){
      res
        .status(400)
          .json({
             "message" : "If supplied in querystring, the offset and count should be number format." 
          });
      return;
  }

  if(count > maxCount){
      res
        .status(400)
        .json({
             "message" : "Count limit of " + maxCount + " exceeded"
          });
       return;
  }

  Hotel
    .find()
    .skip(offset)
    .limit(count)
    .exec(function(err, hotels) {
      if(err){
          console.log("Error finding hotels")
          res
            .status(500)
            .json(err);
      }else{
           console.log("Found hotels", hotels.length);
           res
            .json(hotels);
      }
     
    });

};

module.exports.hotelsGetOne = function(req, res) {
  var id = req.params.hotelId;
  console.log('GET hotelId', id);

  Hotel
    .findById(id)
    .exec(function(err, doc) {
      if(err){
          console.log("Error finding hotels");
          res
            .status(500)
            .json(err);
      }else if(!doc){
       res
        .status(404)
        .json({
           "message" : "Hotel Id not found"
       });
      }else{
          res
            .status(200)
            .json(doc);
      }
    });

};

var _splitArray = function(input){
    var output;
    if(input && input.length > 0){
        output = input.split(";");
    }else{
        output=[];
    }
    return output;
}

module.exports.hotelsAddOne = function(req, res) {
  Hotel
   .create({
      name: req.body.name,
      description: req.body.description,
      stars: parseInt(req.body.stars,10),
      services: _splitArray(req.body.services),
      photos: _splitArray(req.body.photos),
      currency: req.body.currency,
      location: {
          address: req.body.address,
          coordinates: [
              parseFloat(req.body.lng), 
              parseFloat(req.body.lat)
          ]
      }
      
  },function(err, hotel){
      if(err){
          console.log("Error creating hotel");
          res
            .status(400)
            .json(err);
      }else{
          console.log("Hotel created", hotel);
          res
            .status(200)
            .json(hotel);
      }
  });
    
    
};