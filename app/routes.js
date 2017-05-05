var user = require("./model/user");

module.exports = function(app){

  /* Server Routes */
  api.get('/api/get-user', function(req, res){
    user.find(req.body, function(err, user){
      if(err){
        res.send("Cannot find the user.");
      }else{
        res.json(user);
      }
    });
  });

  /* Frontend Routes */
  api.get('*', function(req, res){
    res.sendfile("./public/views/index.html");
  });

}
