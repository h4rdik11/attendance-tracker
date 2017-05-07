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

    $scope.showMain = true;
    $scope.showClassmates = false;
    $scope.showDaily = false;
    $scope.showMonthly = false;
    $scope.showOverall = false;
    $scope.changeView = function(val){
      if(val === "classmate"){
        $scope.showMain = false;
        $scope.showClassmates = true;
        $scope.showDaily = false;
        $scope.showMonthly = false;
        $scope.showOverall = false;
      }else if(val === "daily"){
        $scope.showMain = false;
        $scope.showClassmates = false;
        $scope.showDaily = true;
        $scope.showMonthly = false;
        $scope.showOverall = false;
      }else if(val === "monthly"){
        $scope.showMain = false;
        $scope.showClassmates = false;
        $scope.showDaily = false;
        $scope.showMonthly = true;
        $scope.showOverall = false;
      }else{
        $scope.showMain = false;
        $scope.showClassmates = false;
        $scope.showDaily = false;
        $scope.showMonthly = false;
        $scope.showOverall = true;
      }
    }
});
