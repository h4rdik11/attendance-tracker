app.controller('UserController', function($scope, $http, $auth, $location, $q, $sce, $firebaseObject, $firebaseArray){

    var host = location.host;
    var protocol = location.protocol;
    var firedb = firebase.database().ref();

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

    //$firebaseArray(firedb.child("attendancetheory").child(stud).child(sem).child(yr).child(mn)).on('value', function(){});

    $scope.initFun = function(){

      //getting user info
      $http.get(protocol+"//"+host+"/api/get-user?token="+$auth.getToken()).then(function(response){

        $scope.loggedUser = response.data;

        //getting attendance for home screen
        var d = new Date();
        var yr = d.getFullYear();
        var mn = d.getMonth();
        var dd = d.getDate();

        if(parseInt(mn)+1 < 10) mn = "0"+""+parseInt(parseInt(mn)+1);
        else mn = parseInt(mn);

        if(parseInt(dd)+1 < 10) dd = "0"+""+parseInt(parseInt(dd));
        else dd = parseInt(dd);

        var qry_date = yr+"-"+mn;
        var att = [];
        att = $scope.getAtt(yr, mn, $scope.loggedUser.sem, $scope.loggedUser._id);

        $scope.attendance_home = att;
        console.log(att);

        $scope.subject_theory = $firebaseArray(firedb.child('subjects').orderByChild('sem_type').equalTo($scope.loggedUser.sem+"_th"));
        $scope.subject_lab = $firebaseArray(firedb.child('subjects').orderByChild('sem_type').equalTo($scope.loggedUser.sem+"_lb"));
      });
    };


    $scope.marksAttTheory = [];
    $scope.addTheoryLecture = function(){
      $scope.marksAttTheory.push({
        "stud_id" : $scope.loggedUser._id,
        "sub_abv":"",
        "sub_name":"",
        "date"  : $scope.user.date,
        "present" : false,
        "absent" : false
      });
    };

    $scope.removeRowTheory = function(index){
      $scope.marksAttTheory.splice(index,1);
    };

    $scope.setThSub = function(abv, index, name){
      $scope.marksAttTheory[index].sub_abv = abv;
      $scope.marksAttTheory[index].sub_name = name;
    };

    $scope.marksAttLab = [];
    $scope.addLabLecture = function(){
      $scope.marksAttLab.push({
        "stud_id" : $scope.loggedUser._id,
        "sub_abv" : "",
        "sub_name" : "",
        "date"  : $scope.user.date,
        "present1" : false,
        "present2" : false,
        "absent" : false
      });
    };

    $scope.removeRowLab = function(index){
      $scope.marksAttLab.splice(index,1);
    };

    $scope.setThLab = function(abv, index, name){
      $scope.marksAttLab[index].sub_abv = abv;
      $scope.marksAttLab[index].sub_name = name;
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

    $scope.getAtt = function(yr,mn,sem,stud){
      var att = [];

      // Getting Theory
      $scope.theory = $firebaseArray(firedb.child("attendancetheory").child(stud).child(sem).child(yr).child(mn));

      console.log($scope.theory);
      // Finding attended and total classes for every subject
      var sub_th = [];
      for(var i=0; i<$scope.subject_theory.length; i++){
        var sub_ob = {
          "name" : "",
          "abv" : "",
          "attended" : 0,
          "total" : 0
        };
        sub_ob.name = $scope.subject_theory[i].name;
        sub_ob.abv = $scope.subject_theory[i].abv;
        for(var j = 0; j<$scope.theory.length; j++){
          for(item in result.$getRecord(result.$keyAt(j))){
            if(item == "$id" || item == "$priority") continue;
            if(result.$getRecord($scope.theory.$keyAt(j))[item].sub_abv === $scope.subject_theory[i].abv){
              sub_ob.attended += ($scope.theory.$getRecord($scope.theory.$keyAt(j))[item].present)?1:0;
              sub_ob.total += 1;
            }
          }
        }
        sub_th.push(sub_ob);
      }

      // Finding attended and total classes for all subjects
      var attended = 0;
      var total = 0;
      for(var i=0; i<$scope.theory.length; i++){
        for(item in $scope.theory.$getRecord($scope.theory.$keyAt(i))){
          if(item == "$id" || item == "$priority") continue;
          attended += ($scope.theory.$getRecord($scope.theory.$keyAt(i))[item].present)?1:0;
          total += 1;
        }
      }
      console.log(attended+"/"+total);
      att.push({
        "data" : sub_th,
        "attended": attended,
        "total": total
      });
      // $scope.theory.$loaded(function(result){
      //
      // });

      // Getting lab
      $scope.lab = $firebaseArray(firedb.child("attendancelab").child(stud).child(sem).child(yr).child(mn));
      $scope.lab.$loaded(function(result){

        // Finding attended and total classes for every subject
        var sub_lb = [];
        for(var i=0; i<$scope.subject_lab.length; i++){
          var sub_ob = {
            "name" : "",
            "abv" : "",
            "attended" : 0,
            "total" : 0
          };
          sub_ob.name = $scope.subject_lab[i].name;
          sub_ob.abv = $scope.subject_lab[i].abv;
          for(var j = 0; j<result.length; j++){
            for(item in result.$getRecord(result.$keyAt(j))){
                if(item == "$id" || item == "$priority") continue;
                if(result.$getRecord(result.$keyAt(j))[item].sub_abv === $scope.subject_lab[i].abv){
                  sub_ob.attended += (result.$getRecord(result.$keyAt(j))[item].present1)?0.5:0 + (result.$getRecord(result.$keyAt(j))[item].present2)?0.5:0;
                  sub_ob.total += 1;
                }
            }
          }
          sub_lb.push(sub_ob);
        }

        // Finding attended and total classes for all subjects
        var attended = 0;
        var total = 0;
        for(var i=0; i<result.length; i++){
          for(item in result.$getRecord(result.$keyAt(i))){
            if(item == "$id" || item == "$priority") continue;
            attended += (result.$getRecord(result.$keyAt(i))[item].present1)?0.5:0 + (result.$getRecord(result.$keyAt(i))[item].present2)?0.5:0;
            total += 1;
          }
        }
        console.log(attended+"/"+total);
        att.push({
          "data" : sub_lb,
          "attended": attended,
          "total": total
        });
      });

      return att;
    };

    $scope.addUser = function(){
      $http.post(protocol+"//"+host+"/api/add-user", $scope.user).then(function(response){
        alert(response.data);
      });
    };

    $scope.checkAbsentTheory = function(index){
      $scope.marksAttTheory[index].present = false;
    };

    $scope.checkPresentTheory = function(index,type){
      $scope.marksAttTheory[index].absent = false;
    };

    $scope.checkAbsentLab = function(index){
      $scope.marksAttLab[index].present1 = false;
      $scope.marksAttLab[index].present2 = false;
    };

    $scope.checkPresentLab = function(index){
        $scope.marksAttLab[index].absent = false;
    };

    $scope.markAttendance = function(){
      if($("#mark_attendance").hasClass("ng-submitted")){
        if($("#datepicker").hasClass("ng-invalid")){
          $("#datepicker").parent().addClass("has-error");
          $scope.callSnack("Please select a date.");
        }
        else{
          var attTheory = [];
          var attLab = [];
          for(var i = 0; i<$scope.marksAttTheory.length; i++){
            //$scope.marksAttTheory[i].date = $scope.user.date;
            attTheory.push({
              "stud_id" : $scope.loggedUser._id,
              "sem" : $scope.loggedUser.sem,
              "sub_abv" : $scope.marksAttTheory[i].sub_abv,
              "sub_name" : $scope.marksAttTheory[i].sub_name,
              "date"  : $scope.user.date,
              "present" : $scope.marksAttTheory[i].present,
              "absent" : $scope.marksAttTheory[i].absent
            });
          }
          for(var i = 0; i<$scope.marksAttLab.length; i++){
            //$scope.marksAttTheory[i].date = $scope.user.date;
            attLab.push({
              "stud_id" : $scope.loggedUser._id,
              "sem" : $scope.loggedUser.sem,
              "sub_abv" : $scope.marksAttLab[i].sub_abv,
              "sub_name" : $scope.marksAttLab[i].sub_name,
              "date"  : $scope.user.date,
              "present1" : $scope.marksAttLab[i].present1,
              "present2" : $scope.marksAttLab[i].present2,
              "absent" : $scope.marksAttLab[i].absent
            });
          }

          $http.post(protocol+"//"+host+"/api/mark-attendance?token="+$auth.getToken(), attTheory).then(function(response){
            if(response.data === "success"){
              $http.post(protocol+"//"+host+"/api/mark-attendance-lab?token="+$auth.getToken(), attLab).then(function(res){
                if(res.data === "success"){
                  $scope.user.date = "";
                  $scope.marksAttTheory = [];
                  $scope.marksAttLab = [];
                  $scope.initFun();
                  $scope.callSnack("Attendance marked successfully.");
                }
                else{
                  $scope.callSnack("Error : please contact hardik11.chauhan@gmail.com");
                }
              });
            }
            else{
              $scope.callSnack("Error : please contact hardik11.chauhan@gmail.com");
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
        return "#F44336";
      }
      else if(per > 75){
        return "#26A69A";
      }
      else{
        return "#FF9800";
      }
    };

    $scope.getBunk = function(attended, total){
      if(attended === 0 && total === 0){
        return "No class conducted this month yet.";
      }
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
      $scope.month_name = month;
      var m = parseInt(month);
      $scope.progress = true;
      $scope.month_name = $scope.month_arr[m-1];
      var year = new Date().getFullYear();
      var date = year+"-"+month;
      $scope.attendance_monthly = $scope.getAtt(year, month, $scope.loggedUser.sem, $scope.loggedUser._id);
      $scope.progress = false;
    };

    $scope.getPercent = function(attended, total){
      if(attended === 0 && total === 0) return 0;
      else return Math.round((attended/total)*100);
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

    $scope.getStatusIcon = function(present, absent){
      if(absent === true) return $sce.trustAsHtml('<i data-toggle="tooltip" title="Absent" data-placement="bottom" class="fa fa-user-o " aria-hidden="true" style="color:#d32f2f"></i>');
      if(present === true) return $sce.trustAsHtml('<i data-toggle="tooltip" title="Present" data-placement="bottom" class="fa fa-user" aria-hidden="true" style="color:#4caf50"></i>');
    };
    $scope.getStatusIconLab = function(present1, present2, absent){
      if(absent === true) return $sce.trustAsHtml('<i data-toggle="tooltip" title="Absent" data-placement="bottom" class="fa fa-user-o " aria-hidden="true" style="color:#d32f2f"></i>&nbsp;&nbsp;<i data-toggle="tooltip" title="Absent" data-placement="bottom" class="fa fa-user-o " aria-hidden="true" style="color:#d32f2f"></i>');
      else{
        if(present1 === true && present2 === true) return $sce.trustAsHtml('<i data-toggle="tooltip" title="Present" data-placement="bottom" class="fa fa-user" aria-hidden="true" style="color:#4caf50"></i>&nbsp;&nbsp;<i data-toggle="tooltip" title="Present" data-placement="bottom" class="fa fa-user" aria-hidden="true" style="color:#4caf50"></i>');
        else if(present1 === true && present2 === false) return $sce.trustAsHtml('<i data-toggle="tooltip" title="Present" data-placement="bottom" class="fa fa-user" aria-hidden="true" style="color:#4caf50"></i>&nbsp;&nbsp;<i data-toggle="tooltip" title="Absent" data-placement="bottom" class="fa fa-user-o " aria-hidden="true" style="color:#d32f2f"></i>');
        else if(present1 === false && present2 === true) return $sce.trustAsHtml('<i data-toggle="tooltip" title="Absent" data-placement="bottom" class="fa fa-user-o " aria-hidden="true" style="color:#d32f2f"></i>&nbsp;&nbsp;<i data-toggle="tooltip" title="Present" data-placement="bottom" class="fa fa-user" aria-hidden="true" style="color:#4caf50"></i>');
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

      $scope.edit_theory = $firebaseArray(firedb.child('attendancetheory').child($scope.loggedUser._id).child($scope.loggedUser.sem).child(dt[2]).child(dt[1]).child(dt[0]));
      $scope.edit_lab = $firebaseArray(firedb.child('attendancelab').child($scope.loggedUser._id).child($scope.loggedUser.sem).child(dt[2]).child(dt[1]).child(dt[0]));

      console.log($scope.edit_theory);

      $scope.checkStatusTheoryEdit = function(index){
        $scope.edit_theory[index].absent = false;
      };
      $scope.checkUnschduledTheoryEdit = function(index){
        $scope.edit_theory[index].present = false;
      };

      $scope.checkStatusLabEdit = function(index){
        $scope.edit_lab[index].absent = false;
      };
      $scope.checkUnschduledLabEdit = function(index){
        $scope.edit_lab[index].present1 = false;
        $scope.edit_lab[index].present2 = false;
      };
    };

    $scope.updateAttendance = function(){
      var dt = $scope.user.edit_date.split("/");
      date = dt[2]+"-"+dt[1]+"-"+dt[0];
      $http.post("/api/update-attendance?token="+$auth.getToken(), {
        "data" : $scope.edit_theory,
        "date" : date,
        "stud_id": $scope.loggedUser._id,
        "sem": $scope.loggedUser.sem
      }).then(function(response){
        if(response.data === "success"){
          $http.post("/api/update-attendance-lab?token="+$auth.getToken(), {
            "data" : $scope.edit_lab,
            "date" : date,
            "stud_id": $scope.loggedUser._id,
            "sem": $scope.loggedUser.sem
          }).then(function(res){
            if(res.data === "success"){
              $scope.initFun();
              $scope.callSnack("Attendance updated successfully.");
            }
          });
        }
        else{ $scope.callSnack("Error : contact hardik11.chauhan@gmail.com"); }
      });
    };

    $scope.delTheory = function(id){
      var dt = $scope.user.edit_date.split("/");
      date = dt[2]+"-"+dt[1]+"-"+dt[0];
      $http.post("/api/delete-att-theory?token="+$auth.getToken(), {
        "stud" : $scope.loggedUser._id,
        "sem"  : $scope.loggedUser.sem,
        "date" : date,
        "id"   : id
      }).then(function(response){
        $scope.callSnack(response.data);
      });
    }

    $scope.delLab = function(id){
      var dt = $scope.user.edit_date.split("/");
      date = dt[2]+"-"+dt[1]+"-"+dt[0];
      $http.post("/api/delete-att-lab?token="+$auth.getToken(), {
        "stud" : $scope.loggedUser._id,
        "sem"  : $scope.loggedUser.sem,
        "date" : date,
        "id"   : id
      }).then(function(response){
        $scope.callSnack(response.data);
      });
    }

    $scope.getOverall = function(sem){
      $scope.overall_sem = sem;
      $http.get(protocol+"//"+host+"/api/get-overall-theory?user="+$scope.loggedUser._id+"&sem="+sem+"&token="+$auth.getToken()).then(function(response){
        $scope.theory_overall = response.data;
        $scope.theory_overall_attended = 0;
        $scope.theory_overall_total = 0;
        for(var i = 0;i < $scope.theory_overall.length; i++ ){
          $scope.theory_overall_attended += parseFloat($scope.theory_overall[i].attended);
          $scope.theory_overall_total += parseFloat($scope.theory_overall[i].total);
        }
      });
      $http.get(protocol+"//"+host+"/api/get-overall-lab?user="+$scope.loggedUser._id+"&sem="+sem+"&token="+$auth.getToken()).then(function(response){
        $scope.lab_overall = response.data;
        $scope.lab_overall_attended = 0;
        $scope.lab_overall_total = 0;
        for(var i = 0;i < $scope.lab_overall.length; i++ ){
          $scope.lab_overall_attended += parseFloat($scope.lab_overall[i].attended);
          $scope.lab_overall_total += parseFloat($scope.lab_overall[i].total);
        }
      });
    };

});
