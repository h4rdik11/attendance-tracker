/* Including modules */
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var mongoose = require("mongoose");

/* Configurations */
var db = require("./config/db");
var port = 3030;
mongoose.connect(db.url, function(err, db){
  if(!err){
    console.log("Connection to database established.");
  }else{
    console.log(err);
  }
}); //connecting to database

//tit-bits
app.use(bodyParser.json());
app.use(cors());

//adding path to static files
app.use(express.static(__dirname+'/public'));

//adding routes
require('./app/routes')(app);

//start app
app.listen(port, function(){
  console.log(`Server listening at port ${port}`);
});

//expose app
exports = module.exports = app;
