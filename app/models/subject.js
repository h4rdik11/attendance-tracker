var mongoose = require("mongoose");

var schema = mongoose.Schema({
  name : {type : String},
  abv : {type : String},
  course : {type : String},
  sem : {type : String},
  type: {type: String} 
});

module.exports = mongoose.model('Subject', schema);
