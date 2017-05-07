app.controller('UserController', function($scope, $http, $auth, $location){

    var host = location.host;
    var protocol = location.protocol;

    if(! $auth.isAuthenticated()) window.location.href = protocol+"//"+host;

    $scope.logout = function(){
      $auth.logout();
      window.location.href = protocol+"//"+host;
    }

    $scope.user = {};
    $scope.user.token = $auth.getToken();
    $scope.addUser = function(){
      // alert($scope.user.name);
      $http.post(protocol+"//"+host+"/api/add-user", $scope.user).then(function(response){
        alert(response.data);
      });
    };

    $scope.loggedUser = {};
    $scope.getUser = function(){
      $http.get(protocol+"//"+host+"/api/get-user?token="+$auth.getToken()).then(function(response){
        $scope.loggedUser = response.data;
      });
    };

});
