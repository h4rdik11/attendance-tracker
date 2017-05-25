app.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider){
  $urlRouterProvider.otherwise('/');
  $stateProvider
  .state('/', {
    url: '/',
    templateUrl : '../views/user/home.html'
  })
  .state('/mark-attendance',{
    url: '/mark-attendance',
    templateUrl: '../views/user/mark_attendance.html'
  });
}]);

app.config(['$authProvider', function($authProvider){
  var host = location.host;
  var protocol = location.protocol;

  $authProvider.signupUrl = protocol+"//"+host+"/api/add-user";
  $authProvider.loginUrl = protocol+"//"+host+"/api/login";
  $authProvider.google({
    clientId: 'Google Client ID'
  });

  $authProvider.oauth2({
    name: 'foursquare',
    url: '/auth/foursquare',
    clientId: 'Foursquare Client ID',
    redirectUri: window.location.origin,
    authorizationEndpoint: 'https://foursquare.com/oauth2/authenticate'
  });

}]);
