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

// set templating engine as EJS
app.set("view engine", "ejs");


//start the server instance
http.listen(process.env.PORT || 3000, function() {
  console.log("Server started reunning ...");
    // [connect with MongoDB]
    MongoClient.connect("mongodb://localhost:27017", function(err, client) {
      if (err) {
        console.error("Error connecting to MongoDB")
      }
      // set database connection
      db = client.db("encrypt_decrypt_string");
      console.log("Database connected");

      
      // route to decrypt the message
      app.get("/decrypt/:encrypted", async function (request, result) {
        // get encrypted text from URL
        const encrypted = request.params.encrypted;

        // check if text exists in database
        const obj = await db.collection("strings").findOne({
            encryptedData: encrypted
        });

        if (obj == null) {
            result.status(404).send("Not found");
            return;
        }

        // convert initialize vector from base64 to buffer
        const origionalData = Buffer.from(obj.iv, 'base64') 

        // decrypt the string using encryption algorithm and private key
        const decipher = crypto.createDecipheriv(algorithm, key, origionalData);
        let decryptedData = decipher.update(obj.encryptedData, "hex", "utf-8");
        decryptedData += decipher.final("utf8");

        // display the decrypted string
        result.send(decryptedData);
      });

      // route to show all encrypted messages
      app.get("/", async function (request, result) {
        // get all data from database
        const data = await db.collection("strings")
            .find({})
            .sort({
                _id: -1
            }).toArray();

        // render index.ejs
        result.render("index", {
            data: data
        });
      });

      // route to encrypt the message
      app.get("/encrypt/:message", async function (request, result) {
        // get message from URL
        const message = request.params.message;

        // random 16 digit initialization vector
        const iv = crypto.randomBytes(16);

        // encrypt the string using encryption algorithm, private key and initialization vector
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedData = cipher.update(message, "utf-8", "hex");
        encryptedData += cipher.final("hex");

        // convert the initialization vector to base64 string
        const base64data = Buffer.from(iv, 'binary').toString('base64');
        
        // save encrypted string along wtih initialization vector in database
        await db.collection("strings").insertOne({
            iv: base64data,
            encryptedData: encryptedData
        });

        // show the encrypted message
        result.send(encryptedData);
      });

    })

})