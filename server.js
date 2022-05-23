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
      // route to encrypt the message 
      app.get("/encrypt/:message", async function(request, result) {
        // get message from URL 
        const message = request.params.message;
        // encrypt the string using encyption algorithm , private key and initialization vector
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedData = cipher.update(message, "utf-8", "hex")
        encryptedData += cipher.final("hex");

        // convert the initialization vector to base64 string 
        const base64data = Buffer.from(iv, 'binary').toString('base64');
        // save encrypted string along with initialization vector in database
        await db.collection("string").insertOne({
          iv: base64data,
          encryptedData: encryptedData
        });
        // show the encrypted message in the browser 
        result.send(encryptedData);
      })

    })

})