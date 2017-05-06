app.controller('UserController', function($scope, $http, $auth, $location){

    if(! $auth.isAuthenticated()) $location.url('/');
    $scope.user = {};
    $scope.user.token = $auth.getToken();
    $scope.addUser = function(){
      // alert($scope.user.name);
      $http.post("http://localhost:3030/api/add-user", $scope.user).then(function(response){
        alert(response.data);
      });
    };

    $scope.loggedUser = {};
    $scope.getUser = function(){
      $http.get("http://localhost:3030/api/get-user?token="+$auth.getToken()).then(function(response){
        $scope.loggedUser = response.data;
      });
    };

    $scope.logout = function(){
      $auth.logout();
      $location.url("/");
    }

});
