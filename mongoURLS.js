//sudo mongod --config /etc/mongod.conf
"use strict";
const collectionName = "urls";
require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = process.env['MONGODB_URI'];

module.exports = {
  connect: function(cb) {
    MongoClient.connect(MONGODB_URI, (cb));
    console.log("connected to mongo");
  },

//creates the full database in useable form, passes it off to the callback fn
  all: function(cb) {
    var urls = {}
    this.connect(function(err, db){
      if (err){
        console.log("Error getting all urls");
        return;
      }
      db.collection(collectionName).find().toArray((err, urlArray) => {
        urlArray.forEach(function(obj){
          urls[obj.shortURL] = obj.longURL;
        });
        cb(urls);
      });
    });
  },

  //retrieve the long url when you request the short form
  getLongURL: function(shortURL, cb) {
    let query = {"shortURL": shortURL};
    this.connect(function(err, db) {
      db.collection(collectionName).findOne(query, (err, result) => {
        if (err) {
          return cb(err);
        } else if (result === null) {
          // no longURL found
          return cb("no results", result);
        }
        return cb(null, result.longURL);
      });
    });
  },
  //make a new URL (by inserting)
  create: function(longURL, cb) {
    this.connect(function(err, db) {
      let shortURL = generateRandomString();
      db.collection(collectionName).insert({shortURL: shortURL, longURL: longURL}, cb);
    });
  },

  delete: function(shortURL, cb) {
    this.connect(function(err, db) {
      if (err) return cb(err);
      db.collection(collectionName).deleteOne({shortURL: shortURL }, function(){
      });
      cb(null);
    });
  },

  update: function(longURLold, longURLnew, cb) {
    this.connect(function(err, db) {
      if (err) return cb(err);
      db.collection(collectionName).update({longURL: longURLold}, {$set: {longURL: longURLnew }}, function(){
          console.log("updated " + longURLold);
        });
        cb(null);
    });
  }


}


//////////////////////////not for export
function generateRandomString() {
  let randomStr = ""
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    randomStr += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomStr;
};