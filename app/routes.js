var User = require("./models/user");

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
    var u = new User(req.body);
    u.save(function(err){
      if(err) res.end(JSON.stringify(err));
      else res.send("Done !")
    });
    res.status(200);
  });

  /* Frontend Routes */
  app.get('*', function(req, res){
    res.sendFile("./public/views/index.html");
  });

}
