var mongoose = require("mongoose");
var validate = require("mongoose-validator");

var contactValid = [
  validate({
    validator : 'isLength',
    arguments : [10],
    message   : "Contact number should be 10 digit long."
  })
];

var schema = mongoose.Schema({
  name : { type : String, default : '', required : true },
  college : { type : String, default : '', required : true },
  course : { type : String, required : true, default : '' },
  sem : { type : Number, required : true, default : '' },
  email : { type : String, required : true, unique : true, dropDups : true },
  contact : {type : String, default : '', validate : contactValid },
  password : { type : String, required : true }
});
module.exports = mongoose.model('User', schema);
