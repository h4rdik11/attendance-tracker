app.controller('UserController', function($scope, $http, $auth, $location, $q, $sce){

    var host = location.host;
    var protocol = location.protocol;
    $scope.Math = window.Math;

    if(! $auth.isAuthenticated()) window.location.href = protocol+"//"+host;

    $scope.logout = function(){
      $auth.logout();
      window.location.href = protocol+"//"+host;
    }


    $scope.callSnack = function(msg){
      var snackbarContainer = document.querySelector('#demo-toast-example');
      var data = {message: msg};
      snackbarContainer.MaterialSnackbar.showSnackbar(data);
    };

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
        $scope.userDetails = response.data;

        var att = [];
        att = $scope.getAtt(qry_date, $scope.userDetails.sem);
        $scope.attendance_home = att;
      });

    };

    $scope.setSemEdit = function(val){
      $scope.userDetails.sem = val;
    };

    $scope.editDemos = function(){
      $http.post(protocol+"//"+host+"/api/edit-user-demographics?token="+$auth.getToken(),$scope.userDetails).then(function(response){
        $scope.initFun();
        $scope.callSnack(response.data);
      });
    };

    $scope.userDetailsPass = {};
    $scope.changePass = function(){
      if($scope.userDetailsPass.new_pass !== $scope.userDetailsPass.confirm) $scope.errMsg = "Password do not match.";
      else {
        $scope.errMsg = "";
        $http.post(protocol+"//"+host+"/api/change-password?token="+$auth.getToken()+"&user="+$scope.loggedUser._id, $scope.userDetailsPass).then(function(response){
          $scope.initFun();
          $scope.callSnack(response.data);
        });
      }
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


    $scope.getAtt = function(date,sem){
      var att = [];
      $scope.theory = $http.get(protocol+"//"+host+"/api/get-home-theory?sem="+sem+"&date="+date+"&user="+$scope.loggedUser._id+"&token="+$auth.getToken());
      $scope.lab = $http.get(protocol+"//"+host+"/api/get-home-lab?sem="+sem+"&date="+date+"&user="+$scope.loggedUser._id+"&token="+$auth.getToken());
      $q.all([$scope.theory,$scope.lab]).then(function(response){
        for(var i =0; i<response.length; i++){
          var total = 0;
          var attended = 0;
          for(var j = 0; j<response[i].data.length; j++){
            total += response[i].data[j].total;
            attended += response[i].data[j].attended;
          }
          var data = {
            "att": response[i].data,
            "attended": attended,
            "total": total
          };
          att.push(data);
        }
        $scope.progress = false;
      });
      return att;
    };

    $scope.addUser = function(){
      $http.post(protocol+"//"+host+"/api/add-user", $scope.user).then(function(response){
        alert(response.data);
      });
    };

    $scope.checkUnschduledTheory = function(index){
      $scope.attendance_theory[index].status = false;
    };

    $scope.checkStatusTheory = function(index,type){
      $scope.attendance_theory[index].unscheduled = false;
    };

    $scope.checkUnschduledLab = function(index){
        $scope.attendance_lab[index].status = false;
    };

    $scope.checkStatusLab = function(index){
        $scope.attendance_lab[index].unscheduled = false;
    };

    $scope.markAttendance = function(){
      if($("#mark_attendance").hasClass("ng-submitted")){
        if($("#datepicker").hasClass("ng-invalid")){
          $("#datepicker").parent().addClass("has-error");
          $scope.callSnack("Please select a date.");
        }
        else{
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
              $scope.callSnack("Attendance already marked for the day.");
            }
            else{
              $http.post(protocol+"//"+host+"/api/mark-attendance?token="+$auth.getToken(), att).then(function(response){
                $scope.callSnack(response.data);
              });
            }
          });
        }
      }
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
      //alert(Math.round((attended/total)*100));
      var per = Math.round((attended/total)*100);
      if(per < 75){
        return "#CC3508";
      }
      else if(per > 75){
        return "#4A81CB";
      }
      else{
        return "#DF9308";
      }
    };

    $scope.getBunk = function(attended, total){
      if(Math.round((attended/total)*100) > 75){
        var p = Math.round((attended/75)*100);
        var b = p-total;
        return "You can bunk "+b+" classes.";
      }else if(Math.round((attended/total)*100) < 75){
        var b = Math.round((total*3)-(attended*4));
        return "You have to attend "+b+" classes.";
      }else{
        return "Whoops! Your on the border lad."
      }
    };

    $scope.success = false;
    $scope.error = false;
    $scope.attendance_monthly = [];
    $scope.progress = false;
    $scope.attendanceMonthly = function(month){
      var m = parseInt(month);
      $scope.progress = true;
      $scope.month_name = $scope.month_arr[m-1];
      var year = new Date().getFullYear();
      var date = year+"-"+month;
      $scope.attendance_monthly = $scope.getAtt(date);
    };

    $scope.getPercent = function(attended, total){
      return Math.round((attended/total)*100);
    };

    $scope.dailyAttendance = [];
    $scope.getDaily = function(){
      $scope.dailyAttendance = [];
      var dt = $scope.user.check_daily_date.split("/");
      var date = dt[2]+"-"+dt[1]+"-"+dt[0];
      // console.log($auth.getToken());
      var q1 = $http.get(protocol+"//"+host+"/api/get-daily-theory?date="+date+"&user="+$scope.loggedUser._id+"&token="+$auth.getToken());
      var q2 = $http.get(protocol+"//"+host+"/api/get-daily-lab?&date="+date+"&user="+$scope.loggedUser._id+"&token="+$auth.getToken());
      $q.all([q1,q2]).then(function(response){
        for(var i=0; i<response.length; i++){
          $scope.dailyAttendance.push(response[i].data);
        }
      });
    };

    $scope.getStatusIcon = function(status, unscheduled){
      if(unscheduled === true) return $sce.trustAsHtml('<i data-toggle="tooltip" title="No Class" data-placement="bottom" class="fa fa-ban text-warning" aria-hidden="true" style="color:#d32f2f"></i>');
      else{
        if(status === true) return $sce.trustAsHtml('<i data-toggle="tooltip" title="Present" data-placement="bottom" class="fa fa-user" aria-hidden="true" style="color:#4caf50"></i>');
        else return $sce.trustAsHtml('<i data-toggle="tooltip" title="Absent" data-placement="bottom" class="fa fa-user-o " aria-hidden="true" style="color:#d32f2f"></i>');
      }
    };

    $scope.freshMark = true;
    $scope.setMarkAttendance = function(val){
      if(val == "edit"){
        $scope.freshMark = false;
      }else{
        $scope.freshMark = true;
      }
    };

    $scope.edit_theory = [];
    $scope.edit_lab = [];
    $scope.getEditSubjects = function(date){

      var dt = date.split("/");
      date = dt[2]+"-"+dt[1]+"-"+dt[0];

      var q1 = $http.get(protocol+"//"+host+"/api/get-edit-theory?date="+date+"&user="+$scope.loggedUser._id+"&token="+$auth.getToken());
      var q2 = $http.get(protocol+"//"+host+"/api/get-edit-lab?date="+date+"&user="+$scope.loggedUser._id+"&token="+$auth.getToken());

      $q.all([q1, q2]).then(function(response){
        $scope.edit_theory = response[0].data;
        $scope.edit_lab = response[1].data;
      });

      $scope.checkStatusTheoryEdit = function(index){
        $scope.edit_theory[index].unscheduled = false;
      };
      $scope.checkUnschduledTheoryEdit = function(index){
        $scope.edit_theory[index].status = false;
      };

      $scope.checkStatusLabEdit = function(index){
        $scope.edit_lab[index].unscheduled = false;
      };
      $scope.checkUnschduledLabEdit = function(index){
        $scope.edit_lab[index].status = false;
      };
    };

    $scope.updateAttendance = function(){
      var dt = $scope.user.edit_date.split("/");
      date = dt[2]+"-"+dt[1]+"-"+dt[0];
      var data = [];
      for(var i = 0; i<$scope.edit_theory.length; i++){
        data.push({
          "_id":$scope.edit_theory[i]._id,
          "stud_id":$scope.edit_theory[i].stud_id,
          "sub_id":$scope.edit_theory[i].sub_id,
          "status":$scope.edit_theory[i].status,
          "unscheduled":$scope.edit_theory[i].unscheduled,
          "date":$scope.edit_theory[i].date
        });
      }
      for(var i = 0; i<$scope.edit_lab.length; i++){
        data.push({
          "_id":$scope.edit_lab[i]._id,
          "stud_id":$scope.edit_lab[i].stud_id,
          "sub_id":$scope.edit_lab[i].sub_id,
          "status":$scope.edit_lab[i].status,
          "unscheduled":$scope.edit_lab[i].unscheduled,
          "date":$scope.edit_lab[i].date
        });
      }
      $http.post("/api/update-attendance?token="+$auth.getToken(), {
        "data" : data
      }).then(function(response){
        $scope.callSnack(response.data);
       });
    };

    $scope.getOverall = function(sem){
      $http.get(protocol+"//"+host+"/api/get-overall-theory?user="+$scope.loggedUser._id+"&sem="+sem+"&token="+$auth.getToken()).then(function(response){
        $scope.theory_overall = response.data;
        $scope.theory_overall_attended = 0;
        $scope.theory_overall_total = 0;
        for(var i = 0;i < $scope.theory_overall.length; i++ ){
          $scope.theory_overall_attended += parseInt($scope.theory_overall[i].attended);
          $scope.theory_overall_total += parseInt($scope.theory_overall[i].total);
        }
      });
      $http.get(protocol+"//"+host+"/api/get-overall-lab?user="+$scope.loggedUser._id+"&sem="+sem+"&token="+$auth.getToken()).then(function(response){
        $scope.lab_overall = response.data;
        $scope.lab_overall_attended = 0;
        $scope.lab_overall_total = 0;
        for(var i = 0;i < $scope.lab_overall.length; i++ ){
          $scope.lab_overall_attended += parseInt($scope.lab_overall[i].attended);
          $scope.lab_overall_total += parseInt($scope.lab_overall[i].total);
        }
      });
    };

});
