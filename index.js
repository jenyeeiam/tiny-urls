"use strict";
require('dotenv').config();
var express = require("express");
var app = express();
var mongoURLS = require('./mongoURLS');
var methodOverride = require('method-override');
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded());
app.use(methodOverride('_method'));


//homepage
app.get("/urls", (req, res) => {
  mongoURLS.all(function(data){
    let templateVars = {
      urls: data
    };
    res.render("urls_index", templateVars);
  });
});

//the form to create a new link
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//redirects you to the long url (the actual link)
app.get("/u/:shortURL", (req, res) => {
  mongoURLS.getLongURL(req.params.shortURL, function(err, longURL){
    if (err && longURL === null) {
      console.log(err);
      res.render("error-page");
      return;
    }
    res.redirect(longURL);
  });
});

//renders the page to update the long url
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
  };
  res.render("urls_show", templateVars);
});

//post request to create new url - redirects to the homepage
app.post("/urls", (req, res) => {
  mongoURLS.create(req.body.longURL, function(err){
    if (err) return res.render(err);
    res.redirect("/urls");
  });
});

app.delete('/urls/:id', function (req, res) {
  mongoURLS.delete(req.params.id, function(err){
    if (err) return res.send(err);
    res.redirect("/urls");
  });
});

app.put('/urls/:id', function (req, res) {
  mongoURLS.getLongURL(req.params.id, function(err, oldLongURL){
    mongoURLS.update(oldLongURL, req.body.updatedLongURL, function(){
      res.redirect("/urls");
    });
  })
});


//////////code from tutorials
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.end("Hello!");
});
//////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


