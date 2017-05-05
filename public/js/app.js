var app = angular.module('attendanceApp',['ui.router'])
.config(['$urlRouterProvider','$stateProvider',function($urlRouterProvider, $stateProvider){
  $urlRouterProvider.otherwise('/');
  $stateProvider
  .state('/add-user', {
    url: '/add-user',
    templateUrl: '../views/user/index.html'
  });
}]);
