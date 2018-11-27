var Product = require('../models/product');
var uri = "mongodb://macismail:macismail@macismail-shard-00-00-xzraf.mongodb.net:27017,macismail-shard-00-01-xzraf.mongodb.net:27017,macismail-shard-00-02-xzraf.mongodb.net:27017/shopping"
  + "?authSource=admin&w=1";
// MongoClient.connect(uri, function(err, db) {
//    if(err)
//     console.log(err);
//    db.close();
// });

var dbOptions = {
    db: {native_parser: true},
    replset: {
      auto_reconnect:true,
      rs_name: 'macismail-shard-0',
      poolSize: 10,
      socketOptions: {
        keepAlive: 1000,
        connectTimeoutMS: 30000
      }
    },
    server: {
      poolSize: 5,
      socketOptions: {
        keepAlive: 1000,
        connectTimeoutMS: 30000
      }
    },
    mongos: {
      "ssl": true,
      "sslValidate": false
    }
  };

var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/shopping');
mongoose.connect(uri, dbOptions);
var products = [
    new Product({
        imagePath : "/images/IDLYRICE.jpg",
        title : "Rice",
        description : "Rice is good for healths",
        price : 144
    }),
    new Product({
        imagePath : "/images/HONEY.jpg",
        title : "Honey",
        description : "Honey is good for health",
        price : 310
    }),
    new Product({
        imagePath : "/images/oilcoco.jpg",
        title : "Coconut Oil",
        description : "Coconut Oil is good for hair",
        price : 86
    }),
    new Product({
        imagePath : "/images/GROUNDNUT.jpg",
        title : "Ground Nut",
        description : "Ground Nut is good for health",
        price : 22
    }),
    new Product({
        imagePath : "/images/PONDS_PDR.jpg",
        title : "Ponds Powder",
        description : "Ponds is good for face",
        price : 75
    })
];

var done = 0;
for(var i=0; i<products.length; i++){
  products[i].save(
    function(err, result){
      done++;
      if(done === products.length){
          exit();
      }
    }
  );
}

function exit(){
  mongoose.disconnect();
}
