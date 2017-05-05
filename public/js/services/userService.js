angular.module('UserService',[]).factory('User', ['$http', function($http){
  return{
    get: function(){
      return $http.get("/api/get-user");
    },
    create: function(userData){
      return $http.post('/api/create-user',userData);
    },
    delete: function(id){
      return $http.delete("/api/delete-user" + id);
    }
  }
}]);
