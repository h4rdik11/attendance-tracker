var User = require("./models/user");
var jwt = require("jwt-simple");
var moment = require("moment");

module.exports = function(app){

  /* Server Routes */

  //getting user
  app.get('/api/get-user', function(req, res){
    User.find({}).exec(function(err, user){
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

  //login user
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

  /* Frontend Routes */
  app.get('*', function(req, res){
    res.sendFile("../public/views/index.html");
  });

}

function createToken(user){
  var payload = {
    sub: user._id,
    ist: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, 'H4rdik@1781');
}
