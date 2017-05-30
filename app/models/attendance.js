var mongoose = require("mongoose");

var sc = mongoose.Schema;
var schema = mongoose.Schema({
  stud_id : sc.ObjectId,
  sub_id : sc.ObjectId,
  date : {type : String, default : ''},
  status : {type : Boolean, default : '0'},
  unscheduled : {type : Boolean, default : '0'}
});

module.exports = mongoose.model('Attendance', schema);
