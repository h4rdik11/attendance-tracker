var mongoose = require("mongoose");

var sc = mongoose.Schema;
var schema = mongoose.Schema({
  stud_id : sc.ObjectId,
  sub_id : sc.ObjectId,
  date : {type : String, default : ''},
  present1 : {type : Boolean, default : '0'},
  present2 : {type : Boolean, default : '0'},
  absent : {type : Boolean, default : '0'}
});

module.exports = mongoose.model('AttendanceLab', schema);
