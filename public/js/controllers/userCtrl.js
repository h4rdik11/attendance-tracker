app.controller('UserController', function($scope, $http, $auth, $location, $q){

    var host = location.host;
    var protocol = location.protocol;
    $scope.Math = window.Math;

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

    $scope.attendance_home = [];

    $scope.hello = null;
    $scope.initFun = function(){

      //getting user info
      $http.get(protocol+"//"+host+"/api/get-user?token="+$auth.getToken()).then(function(response){
        $scope.loggedUser = response.data;
        $scope.getSubTheory();
        $scope.getSubLab();
        //getting attendance for home screen
        var d = new Date();
        var yr = d.getFullYear();
        var mn = d.getMonth();
        if(parseInt(mn)+1 < 10) mn = 0+""+parseInt(parseInt(mn)+1);
        else mn = parseInt(mn);
        var qry_date = yr+"-"+mn;

        var att = [];
        att = $scope.getAtt(qry_date);
        $scope.attendance_home = att;
        // $scope.lab_home = att[1];
        // for(var i=0; i<att[0].length; i++){
        //   $scope.theory_attended_home += att[0][i].attended;
        //   $scope.theory_total_home += att[0][i].total;
        // }
        // $scope.theory_avg = Math.round(($scope.theory_attended_home/$scope.theory_total_home)*100);
      });

    };

    $scope.getSubTheory = function(){
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
    };

    $scope.getSubLab = function(){
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
    };

    $scope.getAtt = function(date){
      var att = [];
      $scope.theory = $http.get(protocol+"//"+host+"/api/get-home-theory?date="+date+"&user="+$scope.loggedUser._id+"&token="+$auth.getToken());
      $scope.lab = $http.get(protocol+"//"+host+"/api/get-home-lab?date="+date+"&user="+$scope.loggedUser._id+"&token="+$auth.getToken());
      $q.all([$scope.theory,$scope.lab]).then(function(response){
        for(var i =0; i<response.length; i++)
          att.push(response[i].data);
        console.log(att);
      });
      return att;
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
      if(val === "home"){
        $scope.showMain = true;
        $scope.showClassmates = false;
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

    $scope.getColor = function(attended, total){
      var per = (attended/total)*100;
      if(per > 75){
        return "#4A81CB";
      }
      else if(per == 75){
        return "#DF9308";
      }
      else{
        return "#CC3508";
      }
    };

    $scope.getBunk = function(attended, total){
      if(Math.round((attended/total)*100) > 75){
        var p = Match.round((attended/75)*100);
        var b = p-total;
        return "You can bunk "+b+" classes.";
      }else if(Math.round((attended/total)*100) < 75){
        var b = Math.round((total*3)-(attended*4));
        return "You have to attend "+b+" classes.";
      }else{
        return "Whoops! Your on the border lad."
      }
    };

    $scope.attendance_monthly = [];
    $scope.attendanceMonthly = function(month){
      var year = new Date().getFullYear();
      var date = year+"-"+month;
      $scope.attendance_monthly = $scope.getAtt(date);
      console.log($scope.attendance_monthly);
    };

});
