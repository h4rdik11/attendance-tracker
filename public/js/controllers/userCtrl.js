app.controller('UserController', function($scope, $http){

    alert("hello from user");
    $scope.user = {};
    $scope.addUser = function(){
      // alert($scope.user.name);
      $http.post("http://localhost:3030/api/add-user", $scope.user).then(function(response){
        alert(response.data);
      });
    };

});
