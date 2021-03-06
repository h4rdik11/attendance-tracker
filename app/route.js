var User = require("./models/user");
var Attendance = require("./models/attendance");
var AttendanceLab = require("./models/attendanceLab");
var Subject = require("./models/subject");
var jwt = require("jwt-simple");
var moment = require("moment");
var config = require("../config/db");
var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;

module.exports = function(app){

  /* Frontend route befor authentication */
  app.get('/main', function(req, res){
      res.sendFile("public/views/index.html", {root: "."});
  });

  /* Server Routes */

  //authenticate user
  app.post('/api/login', function(req, res){

    User.findOne({$or:[{email : req.body.id},{uname: req.body.id}]}, function(err, user){
      if(user != null){
          if(req.body.password == user.password){
            res.status(200).send({token: createToken(user), msg : "1"});
          }else{
            res.send({msg: "Incorrect password."});
          }
      }else{
        res.send({msg: "User id or Email incorrect."});
      }
    });
  });

  //creating user
  app.post('/api/add-user', function(req, res){
    //res.send(req.body.sem);
    User.findOne({email : req.body.email, uname : req.body.uname }, function(err, exists){
      if(exists){
        res.send("2");
      }else{
        var u = new User(req.body);
        u.save(function(err, result){
          if(err) res.end(JSON.stringify(err));
          else res.status(200).send({msg:"1"});
        });
      }
    });
  });

  //token authentication middleware
  app.use( function(req, res, next){
    var token = req.body.token || req.query.token || req.header['x-access-token'];
    if(token){
      var decoded = jwt.decode(token, config.secret, true);
      if(decoded){
        req.token = token;
        req.decoded = decoded;
        next();
      }
      else res.send({success:false, message: "Failed to authenticate the token."});
    }else{
      res.status(403).send({ success:false, message:"Token exprired or no token provided." });
    }
  });

  //getting user
  app.get('/api/get-user', function(req, res){
    User.findOne({_id: req.decoded.sub,}).select('-password').exec(function(err, user){
      if(err){
        res.send("Cannot find the user.");
      }else{
        res.json(user);
      }
    });
  });

  // updating user demographics
  app.post('/api/edit-user-demographics', function(req, res){
    User.update({_id: req.body._id}, {$set:{
      "name": req.body.name,
      "email": req.body.email,
      "sem": req.body.sem
    }}).exec(function(err, result){
      if(err) res.send("Error : please contact hardik11.chauhan@gmail.com");
      else res.send("User updated successfully.");
    });
  });

  //edit password
  app.post('/api/change-password', function(req, res){
    User.update({_id: new ObjectId(req.query.user)}, {$set:{
      "password": req.body.new_pass
    }}).exec(function(err, result){
      if(err) res.send("Error : please contact hardik11.chauhan@gmail.com");
      else res.send("Password updated successfully.");
    });
  });

  //adding subjects
  app.post('/api/add-subject', function(req, res){
    var s = new Subject(req.body);
    s.save(function(err, result){
      if(err) res.send("Error");
      else res.send("Subject added");
    });
  });

  //getting subjects(theory)
  app.get('/api/get-subject-theory', function(req, res){
    Subject.find({"course" : "MCA", "sem" : req.query.sem, "abv" : {$not:/LAB.*/}}, function(err, result){
      if(err){
        res.send("No subject found");
      }else{
        res.json(result);
      }
    });
  });
  //getting subjects (Lab)
  app.get('/api/get-subject-lab',function(req, res){
    Subject.find({"course" : "MCA", "sem" : req.query.sem, "abv": {$regex:"LAB"}}, function(err, result){
      if(err) res.send("No subject found");
      else res.json(result);
    });
  });

  //marking attendance
  app.get('/api/check-attendance', function(req, res){
    var date = req.query.date.split("/");
    var dt = date[2]+"-"+date[1]+"-"+date[0];
    var user = req.query.user;
    var cool = false;
    //Attendance.aggregate([{$lookup:{from:"users",localField:"stud_id",foreignField:"_id",as:"user"}}]).forEach(printjson)
    Attendance.find({$and:[{"stud_id":user},{"date":dt}]}, function(err, exists){
      if(exists.length > 0) res.send("exists");
      else{
        AttendanceLab.find({$and:[{"stud_id":user},{"date":dt}]}, function(err, exists){
          if(exists.length > 0) res.send("exists");
          else res.send("you can enter");
        });
      }
    });
  });
  app.post('/api/mark-attendance', function(req, res){
    var success = false;
    for(var i =0; i< req.body.length; i++){
      var success = false;
      var dt = req.body[i].date.split("/");
      var date = dt[2]+"-"+dt[1]+"-"+dt[0];
      req.body[i].date = date;
      var a = new Attendance(req.body[i]);
      a.save(function(err, pass){
        if(err) res.send("Error : Contact hardik11.chauhan@gmail.com");
      });
    }
    res.send("success");
  });
  app.post('/api/mark-attendance-lab', function(req, res){
    var success = false;
    for(var i =0; i<req.body.length; i++){
      var success = false;
      var dt = req.body[i].date.split("/");
      var date = dt[2]+"-"+dt[1]+"-"+dt[0];
      req.body[i].date = date;
      var a = new AttendanceLab(req.body[i]);
      a.save(function(err, pass){
        if(err) res.send("Error : Contact hardik11.chauhan@gmail.com");
      });
    }
    res.send("success");
  });

  //update attendance
  app.post("/api/update-attendance", function(req, res){
    var success = true;
    for(var i = 0; i<req.body.data.length; i++){
      Attendance.update(
        {"_id":new ObjectId(req.body.data[i]._id)},
        {
          $set:{
            "present":req.body.data[i].present,
            "absent":req.body.data[i].absent
          }
        },
        function(err, result){
          if(err) res.send("error");;
        });
    }
    res.send("success");
  });
  app.post("/api/update-attendance-lab", function(req, res){
    var success = true;
    for(var i = 0; i<req.body.data.length; i++){
      AttendanceLab.update(
        {"_id":new ObjectId(req.body.data[i]._id)},
        {
          $set:{
            "present1":req.body.data[i].present1,
            "present2":req.body.data[i].present2,
            "absent":req.body.data[i].absent
          }
        },
        function(err, result){
          if(err) res.send("error");;
        });
    }
    res.send("success");
  });

  // deleting theory attendance
  app.get("/api/delete-att-theory", function(req, res){
    Attendance.remove({_id:req.query.id}, function(err, result){
      if(err) res.send("Error : please contact hardik11.chauhan@gmail.com");
      else res.send("Lecture deleted successfully.");
    });
  });

  // deleting lab attendance
  app.get("/api/delete-att-lab", function(req, res){
    AttendanceLab.remove({_id:req.query.id}, function(err, result){
      if(err){
        console.log(err);
        res.send("Error : please contact hardik11.chauhan@gmail.com");
      }
      else res.send("Lab deleted successfully.");
    });
  });

  //getting attendance
    /* Getting attendance for home screen */
    app.get('/api/get-home-theory', function(req, res){
        var user = req.query.user;
        Attendance.aggregate([
          {
            $lookup:{
              from:"subjects",
              localField:"sub_id",
              foreignField:"_id",
              as:"subjects"
            }
          },
          {
            $project:{
              "stud_id":1,
              "sub_id":1,
              "present":1,
              "absent":1,
              "date":1,
              "abv":"$subjects.abv",
              "name":"$subjects.name",
              "sem":"$subjects.sem"
            }
          },
          {
            $match:{
              $and:[
                {"stud_id":new ObjectId(req.query.user)},
                {"abv":{$not:/LAB.*/}},
                {"sem": {$regex:req.query.sem}},
                {"date":{$regex:"^"+req.query.date}}
              ]
            }
          },
          {
            $group:{
              _id: "$sub_id",
              details:{$push:"$$ROOT"},
              attended:{$sum:{$cond:{if:{$eq:["$present",true]}, then:1, else:0}}},
              total: {$sum:1}
            }
          }
        ], function(err, result){
          if(result){
            res.json(result);
          }else{
            res.send(err);
          }
        });
    });

    app.get("/api/get-home-lab", function(req, res){
      AttendanceLab.aggregate([
        {
          $lookup:{
            from:"subjects",
            localField:"sub_id",
            foreignField:"_id",
            as:"subjects"
          }
        },
        {
          $project:{
            "sub_id":1,
            "stud_id":1,
            "present1":1,
            "present2":1,
            "absent":1,
            "date":1,
            "abv":"$subjects.abv",
            "name":"$subjects.name",
            "sem":"$subjects.sem"
          }
        },
        {
          $match:{
            $and:[
              {"stud_id": new ObjectId(req.query.user)},
              {"date":{$regex:"^"+req.query.date}},
              {"sem": {$regex:req.query.sem}}
            ]
          }
        },
        {
          $group:{
            _id:"$sub_id",
            details:{$push:"$$ROOT"},
            attended:{
              $sum:{
                $cond:{
                  if:{
                    $and:[
                      {$eq:["$present1",true]},
                      {$eq:["$present2",true]}
                    ]
                  },
                  then:1,
                  else:{
                    $cond:{
                      if:{
                        $or:[
                          {
                            $and:[{$eq:["$present1", true]},{$eq:["$present2", false]}]
                          },
                          {
                            $and:[{$eq:["$present1", false]},{$eq:["$present2", true]}]
                          }
                        ]
                      },
                      then:0.5,
                      else:0
                    }
                  }
                }
              }
            },
            total:{$sum:1}
          }
        }
      ], function(err, result){
        if(result) res.json(result);
        else res.send(err);
      });
    });

    /* Getting Daily Attendance for theory */
    app.get("/api/get-daily-theory", function(req, res){
      Attendance.aggregate([
        {
          $lookup:{
            from:"subjects",
            localField:"sub_id",
            foreignField:"_id",
            as:"subjects"
          }
        },
        {
          $project:{
            "stud_id":1,
            "sub_id":1,
            "present":1,
            "absent":1,
            "date":1,
            "abv":"$subjects.abv",
            "sub_name":"$subjects.name"
          }
        },
        {
          $match:{
            $and:[
              {"stud_id":new ObjectId(req.query.user)},
              {"date":req.query.date}
            ]
          }
        }
      ], function(err, result){
        if(err) res.send(err);
        else res.json(result);
      });
    });

    /* Getting daily attendance for lab */
    app.get("/api/get-daily-lab", function(req, res){
      AttendanceLab.aggregate([
        {
          $lookup:{
            from:"subjects",
            localField:"sub_id",
            foreignField:"_id",
            as:"subjects"
          }
        },
        {
          $project:{
            "sub_id":1,
            "stud_id":1,
            "present1":1,
            "present2":1,
            "date":1,
            "absent":1,
            "abv":"$subjects.abv",
            "sub_name":"$subjects.name"
          }
        },
        {
          $match:{
            $and:[
              {"stud_id": new ObjectId(req.query.user)},
              {"date":req.query.date}
            ]
          }
        }
      ], function(err, result){
        if(err) res.send(err);
        else res.json(result);
      });
    });

    /* Getting Theory attendance to edit */
    app.get("/api/get-edit-theory", function(req, res){
      Attendance.aggregate([
        {
          $lookup:{
            from:"subjects",
            localField:"sub_id",
            foreignField:"_id",
            as:"subjects"
          }
        },
        {
          $project:{
            "_id":1,
            "stud_id":1,
            "sub_id":1,
            "present":1,
            "absent":1,
            "date":1,
            "abv":"$subjects.abv",
            "name":"$subjects.name"
          }
        },
        {
          $match:{
            $and:[
              {"stud_id" : new ObjectId(req.query.user)},
              {"date" : req.query.date}
            ]
          }
        }
      ], function(err, result){
        if(err) res.send("Error: please report the matter at hardik11.chauhan@gmail.com");
        else res.json(result);
      });
    });

    /* Getting lab attendance to edit */
    app.get("/api/get-edit-lab", function(req, res){
      AttendanceLab.aggregate([
        {
          $lookup:{
            from:"subjects",
            localField:"sub_id",
            foreignField:"_id",
            as:"subjects"
          }
        },
        {
          $project:{
            "_id":1,
            "stud_id":1,
            "sub_id":1,
            "present1":1,
            "present2":1,
            "absent":1,
            "date":1,
            "abv":"$subjects.abv",
            "name":"$subjects.name"
          }
        },
        {
          $match:{
            $and:[
              {"stud_id" : new ObjectId(req.query.user)},
              {"date" : req.query.date}
            ]
          }
        }
      ],function(err, result){
        if(err) res.send("Error: please report the matter at hardik11.chauhan@gmail.com");
        else res.json(result);
      });
    });

    /* Get overall attendance */
    app.get("/api/get-overall-theory", function(req, res){
      Attendance.aggregate([
        {
          $lookup:{
            from: "subjects",
            localField: "sub_id",
            foreignField: "_id",
            as: "subjects"
          }
        },
        {
          $project:{
            "_id": 1,
            "stud_id": 1,
            "sub_id": 1,
            "present": 1,
            "absent": 1,
            "date": 1,
            "abv":"$subjects.abv",
            "name":"$subjects.name",
            "sem":"$subjects.sem"
          }
        },
        {
          $match:{
            $and:[
              {"stud_id": new ObjectId(req.query.user)},
              {"sem": {$regex:req.query.sem}}
            ]
          }
        },
        {
          $group:{
            _id: "$sub_id",
            details:{$push:"$$ROOT"},
            attended:{$sum:{$cond:{if:{$eq:["$present",true]}, then:1, else:0}}},
            total: {$sum:1}
          }
        }
      ], function(err, result){
        if(err) res.send("Error : please report the matter at hardik11.chauhan@gmail.com");
        else res.json(result);
      });
    });

    /* Getting lab overall */
    app.get("/api/get-overall-lab", function(req, res){
      AttendanceLab.aggregate([
        {
          $lookup:{
            from: "subjects",
            localField:"sub_id",
            foreignField: "_id",
            as:"subjects"
          }
        },
        {
          $project:{
            "_id": 1,
            "stud_id": 1,
            "sub_id": 1,
            "present1": 1,
            "present2": 1,
            "absent": 1,
            "date": 1,
            "abv":"$subjects.abv",
            "name":"$subjects.name",
            "sem":"$subjects.sem"
          }
        },
        {
          $match:{
            $and:[
              {"stud_id":new ObjectId(req.query.user)},
              {"sem":{$regex:req.query.sem}}
            ]
          }
        },
        {
          $group:{
            _id:"$sub_id",
            details:{$push:"$$ROOT"},
            attended:{
              $sum:{
                $cond:{
                  if:{
                    $and:[
                      {$eq:["$present1",true]},
                      {$eq:["$present2",true]}
                    ]
                  },
                  then:1,
                  else:{
                    $cond:{
                      if:{
                        $or:[
                          {
                            $and:[{$eq:["$present1", true]},{$eq:["$present2", false]}]
                          },
                          {
                            $and:[{$eq:["$present1", false]},{$eq:["$present2", true]}]
                          }
                        ]
                      },
                      then:0.5,
                      else:0
                    }
                  }
                }
              }
            },
            total:{$sum:1}
          }
        }
      ], function(err, result){
        if(err) res.send("Error : please report the matter at hardik11.chauhan@gmail.com");
        else res.json(result);
      });
    });

  /* Frontend Routes */
  app.get('/user', function(req,res){
    // res.send(__dirname);
    res.sendFile("public/views/user/index.html", { root: "." });
  });

}

function createToken(user){
  var payload = {
    sub: user._id,
    ist: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.secret);
}
