app.controller('HomeController', function($scope, $http, $auth, $location){

  var protocol = location.protocol;
  var host = location.host;

  if($auth.isAuthenticated()) window.location.href = protocol+"//"+host+"/user?token="+$auth.getToken();

  $scope.user = {};
  $scope.addUser = function(){
    $auth.signup($scope.user).then(function(response){
      if(response.data.msg == "1"){
        $auth.setToken(response.data.token);
        alert("User created successfully.");
      }else{
        alert("User already exists.");
      }
    });
  };

  $scope.userLogin = {};
  $scope.login = function(){
    $auth.login($scope.userLogin).then(function(response){
      if(response.data.msg == "1"){
        $auth.setToken(response.data.token);
        // $location.url("/user-dashboard");
        window.location.href = protocol+"//"+host+"/user?token="+$auth.getToken();
        // $location.url(protocol+"//"+host+"/user?token="+$auth.getToken());
      }else{
        alert(response.data.msg);
      }
    });
  };

  $scope.authenticate = function(provider){
    $auth.authenticate(provider);
  }

});
