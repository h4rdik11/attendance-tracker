app.controller('HomeController', function($scope, $http, $auth, $location){

  $scope.baseUrl = $location.host();
  alert($scope.baseUrl);

  if($auth.isAuthenticated()) $location.url("/user-dashboard");

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
        $location.url("/user-dashboard");
      }else{
        alert(response.data.msg);
      }
    });
  };

  $scope.authenticate = function(provider){
    $auth.authenticate(provider);
  }

});
