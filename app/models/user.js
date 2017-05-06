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
  college : { type : String, default : '' },
  course : { type : String, default : '' },
  sem : { type : Number, default : '' },
  uname : { type : String, required : true, unique : true, dropDups : true },
  email : { type : String, required : true, unique : true, dropDups : true },
  password : { type : String, required : true }
});
module.exports = mongoose.model('User', schema);
