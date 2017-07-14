app.controller('HomeController', function($scope, $http, $auth, $location){

  var protocol = location.protocol;
  var host = location.host;

  if($auth.isAuthenticated()) window.location.href = protocol+"//"+host+"/user?token="+$auth.getToken();

  $scope.callSnack = function(msg){
    var snackbarContainer = document.querySelector('#demo-toast-example');
    var data = {message: msg};
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
  };

  $scope.user = {};
  $scope.addUser = function(){
    $auth.signup($scope.user).then(function(response){
      if(response.data.msg == "1"){
        $auth.setToken(response.data.token);
        $scope.callSnack("User created successfully.");
      }else{
        $scope.callSnack("User already exists.");
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
        $scope.callSnack(response.data.msg);
      }
    });
  };

  $scope.authenticate = function(provider){
    $auth.authenticate(provider);
  }

});
