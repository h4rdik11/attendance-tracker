app.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider){
  $urlRouterProvider.otherwise('/');
  $stateProvider
  .state('/', {
    url: '/',
    templateUrl : '../views/index.html',
    controller: 'HomeController'
  })
  .state('/register',{
    url: '/register',
    templateUrl: '../views/home/register.html',
    controller: 'HomeController'
  });
}]);

app.config(['$authProvider', function($authProvider){
  $authProvider.signupUrl = "http://localhost:3030/api/add-user";
  $authProvider.loginUrl = "http://localhost:3030/api/login";
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
