//initialize express JS
const express = require('express');
const app = express();

// create HTTP server instance 
const http = require("http").createServer(app);

// [include Mongo DB module here]
var mongodb = require('mongodb')
// this var will be used to connect with MongoDB database 
var MongoClient = mongodb.MongoClient;

// include crypto module here
const crypto = require('crypto');
// set encryption algorithm
const algorithm = 'aes-256-cbc';

// private key for authentication, size 32 characters
const key = 'catafest-encryption-key-tutorial';

//random 16 digit initialization vector
const iv = crypto.randomBytes(16);

//start the server instance
http.listen(process.env.PORT || 3000, function() {
  console.log("Server started reunning ...");
    // [connect with MongoDB]
    MongoClient.connect("mongodb://localhost:27017", function(err, client) {
      if (err) {
        console.error("Error connecting to MongoDB")
      }
      // set database connection
      db = client.db("encrypt_decrypt_scring");
      console.log("Database connected");
      // [route goes here]

    })

})