var User = require("./models/user");
var Attendance = require("./models/attendance");
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
          else res.status(200).send({token : createToken(result), msg:"1"});
        });
      }
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
    Subject.find({"course" : req.query.course, "sem" : req.query.sem, "abv" : {$not:/LAB.*/}}, function(err, result){
      if(err){
        res.send("No subject found");
      }else{
        res.json(result);
      }
    });
  });
  //getting sunjects (Lab)
  app.get('/api/get-subject-lab',function(req, res){
    Subject.find({"course" : req.query.course, "sem" : req.query.sem, "abv": {$regex:"LAB"}}, function(err, result){
      if(err) res.send("No subject found");
      else res.json(result);
    });
  });

  //marking attendance
  app.get('/api/check-attendance', function(req, res){
    var date = req.query.date.split("/");
    var dt = date[2]+"-"+date[1]+"-"+date[0];
    var user = req.query.user;
    //Attendance.aggregate([{$lookup:{from:"users",localField:"stud_id",foreignField:"_id",as:"user"}}]).forEach(printjson)
    Attendance.find({$and:[{"stud_id":user},{"date":dt}]}, function(err, exists){
      if(exists.length > 0) res.send("exists");
      else res.send("you can enter");
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
        if(err) success = false;
        else success = true;
      });
    }
    if(success == false) res.send("error");
    else res.send("success");
  });

  // app.get('/api/get-date', function(req, res){
  //   var dtArr = req.query.date.split("/");
  //   var temp = parseInt(dtArr[0])+1;
  //   dtArr[0] = dtArr[2];
  //   dtArr[2] = temp;
  //   dtArr.join();
  //   var dt = new Date(dtArr);
  //   console.log(dt);
  // });

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
              "status":1,
              "unscheduled":1,
              "date":1,
              "abv":"$subjects.abv",
              "name":"$subjects.name"
            }
          },
          {
            $match:{
              $and:[
                {"stud_id":new ObjectId(req.query.user)},
                {"unscheduled":false},
                {"abv":{$not:/LAB.*/}},
                {"date":{$regex:"^"+req.query.date}}
              ]
            }
          },
          {
            $group:{
              _id: "$sub_id",
              details:{$push:"$$ROOT"},
              attended:{$sum:{$cond:{if:{$eq:["$status",true]}, then:1, else:0}}},
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
            "sub_id":1,
            "stud_id":1,
            "status":1,
            "unscheduled":1,
            "date":1,
            "abv":"$subjects.abv",
            "name":"$subjects.name"
          }
        },
        {
          $match:{
            $and:[
              {"stud_id": new ObjectId(req.query.user)},
              {"date":{$regex:"^"+req.query.date}},
              {"unscheduled":false},
              {"abv":{$regex:"LAB"}}
            ]
          }
        },
        {
          $group:{
            _id:"$sub_id",
            details:{$push:"$$ROOT"},
            attended:{$sum:{$cond:{if:{$eq:["$status",true]}, then:1, else:0}}},
            total:{$sum:1}
          }
        }
      ], function(err, result){
        if(result) res.json(result);
        else res.send(err);
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
