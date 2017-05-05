var user = require("./models/user");

module.exports = function(app){

  /* Server Routes */

  //getting user
  app.get('/api/get-user', function(req, res){
    user.find({}).exec(function(err, user){
      if(err){
        res.send("Cannot find the user.");
      }else{
        res.json(user);
      }
    });
  });

  //creating user
  app.post('/api/create-user', function(req, res){
    var u = new user(req.body);
    u.save();
    res.status(200);
  });

  /* Frontend Routes */
  app.get('*', function(req, res){
    res.sendfile("./public/views/index.html");
  });

}
