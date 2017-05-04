/* Including modules */
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");

/* Configurations */
var db = require("./config/db");
var port = 8080;
mongoose.connect(db.url, funtion(err){
  if(!err){
    console.log("Connection to database successful.");
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
exports = modeule.exports = app;
