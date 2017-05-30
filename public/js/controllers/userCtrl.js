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

    $scope.subject_theory = [];
    $scope.subject_lab= [];
    $scope.loggedUser = {};
    $scope.attendance_theory = [];
    $scope.attendance_lab = [];

    $scope.initFun = function(){

      //getting user info
      $http.get(protocol+"//"+host+"/api/get-user?token="+$auth.getToken()).then(function(response){
        $scope.loggedUser = response.data;
        //getting theory subjects
        $http.get(protocol+"//"+host+"/api/get-subject-theory?course="+$scope.loggedUser.course+"&sem="+$scope.loggedUser.sem+"&token="+$auth.getToken()).then(function(response){
          $scope.subject_theory = response.data;
          for(var i = 0; i < $scope.subject_theory.length; i++){
              $scope.attendance_theory.push({
                  "stud_id" : $scope.loggedUser._id,
                  "sub_id" : $scope.subject_theory[i]._id,
                  "date"  : $scope.user.date,
                  "status" : false,
                  "unscheduled" : false
              });
          }
        });

        //getting lab subjects
        $http.get(protocol+"//"+host+"/api/get-subject-lab?course="+$scope.loggedUser.course+"&sem="+$scope.loggedUser.sem+"&token="+$auth.getToken()).then(function(response){
          $scope.subject_lab = response.data;
          for(var i = 0; i < $scope.subject_lab.length; i++){
              $scope.attendance_lab.push({
                  "stud_id" : $scope.loggedUser._id,
                  "sub_id" : $scope.subject_lab[i]._id,
                  "date"  : $scope.user.date,
                  "status" : 0,
                  "unscheduled" : 0
              });
          }
        });

        //getting attendance for home screen
        $scope.theory_home = [];
        $scope.lab_home = [];
        var d = new Date();
        var yr = d.getFullYear();
        var mn = d.getMonth();
        if(parseInt(mn)+1 < 10) mn = 0+""+parseInt(parseInt(mn)+1);
        else mn = parseInt(mn);
        var qry_date = yr+"-"+mn;
        //alert(qry_date);
        $http.get(protocol+"//"+host+"/api/get-home-theory?date="+qry_date+"&user="+$scope.loggedUser._id+"&token="+$auth.getToken(), function(response){
            $scope.theory_home = response.data;
            alert($scope.theory_home);
        });
      });
    };

    $scope.addUser = function(){
      $http.post(protocol+"//"+host+"/api/add-user", $scope.user).then(function(response){
        alert(response.data);
      });
    };

    $scope.checkUnschduledTheory = function(index){
      if($scope.attendance_theory[index].unscheduled) $scope.attendance_theory[index].status = false;
    };

    $scope.checkStatusTheory = function(index){
      if($scope.attendance_theory[index].status) $scope.attendance_theory[index].unscheduled = false;
    };

    $scope.checkUnschduledLab = function(index){
      if($scope.attendance_lab[index].unscheduled) $scope.attendance_lab[index].status = false;
    };

    $scope.checkStatusLab = function(index){
      if($scope.attendance_lab[index].status) $scope.attendance_lab[index].unscheduled = false;
    };

    $scope.markAttendance = function(){
      var att = [];
      for(var i = 0; i<$scope.attendance_theory.length; i++){
        $scope.attendance_theory[i].date = $scope.user.date;
        att.push($scope.attendance_theory[i]);
      }
      for(var i = 0; i<$scope.attendance_lab.length; i++){
        $scope.attendance_lab[i].date = $scope.user.date;
        att.push($scope.attendance_lab[i]);
      }

      $http.get(protocol+"//"+host+"/api/check-attendance?date="+$scope.user.date+"&user="+$scope.loggedUser._id+"&token="+$auth.getToken()).then(function(response){
        if(response.data == "exists"){
          alert("Attendance already marked for the day.");
        }
        else{
          $http.post(protocol+"//"+host+"/api/mark-attendance?token="+$auth.getToken(), att).then(function(response){
            console.log(response.data);
          });
        }
      });
    };

    var m = new Date();
    $scope.month_arr = ["January","February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    $scope.month = $scope.month_arr[m.getMonth()];

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
