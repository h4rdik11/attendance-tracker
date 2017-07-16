var config={
  apiKey: "AIzaSyAqq9E9XQbdqdr1gu0gAOBTRMKcYIDvuDM",
  authDomain: "attendance-tracker-a747a.firebaseapp.com",
  databaseURL: "https://attendance-tracker-a747a.firebaseio.com",
  projectId: "attendance-tracker-a747a",
  storageBucket: "attendance-tracker-a747a.appspot.com",
  messagingSenderId: "847288723598"
};
firebase.initializeApp(config);
var app = angular.module('attendanceApp',['ui.router','satellizer','angular-svg-round-progressbar','ngSanitize','firebase']);
