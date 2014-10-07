var xmoneyApplication = angular.module('xmoneyApp', ["ngRoute"]);
var requestUpdate = function(h, u, d) { return h({ method: "POST",  url: u, data:d, headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'} })}
xmoneyApplication.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {templateUrl: xmoney._baseUrl + '/dashboard/dashboardmain'}); 
  $routeProvider.when('/home', {templateUrl: xmoney._baseUrl + '/dashboard/dashboardmain'}); 
  $routeProvider.when('/feedback', {templateUrl: xmoney._baseUrl + '/dashboard/feedback'}); 
  $routeProvider.when('/help', {templateUrl: xmoney._baseUrl + '/help'}); 
  $routeProvider.when('/saving', {templateUrl: xmoney._baseUrl + '/dashboard/help'}); 
  $routeProvider.when('/events', {templateUrl: xmoney._baseUrl + '/dashboard/help'}); 
  $routeProvider.when('/me', {templateUrl: xmoney._baseUrl + '/me/mainpage'}); 
  $routeProvider.when('/me/editphone', {templateUrl: xmoney._baseUrl + '/me/phone'}); 
  $routeProvider.when('/me/password', {templateUrl: xmoney._baseUrl + '/me/password'}); 
  $routeProvider.when('/add', {templateUrl: xmoney._baseUrl + '/dashboard/add'}); 
  $routeProvider.when('/adjust-balance', {templateUrl: xmoney._baseUrl + '/dashboard/adjustbalance'}); 
  $routeProvider.when('/edit/:transactionId', {templateUrl: xmoney._baseUrl + '/dashboard/add'}); 
  $routeProvider.when('/me/language', {templateUrl: xmoney._baseUrl + '/me/language'}); 
  $routeProvider.when('/setup-new-account', {templateUrl: xmoney._baseUrl + '/dashboard/addAccount/?key='+xmoney._hashkeySecurity + '&setupNew=1'}); 
  $routeProvider.when('/add-account', {templateUrl: xmoney._baseUrl + '/dashboard/addAccount'}); 
  $routeProvider.when('/notes', {templateUrl: xmoney._baseUrl + '/notes/main'}); 
  $routeProvider.when('/notes/add', {templateUrl: xmoney._baseUrl + '/notes/add'}); 
  $routeProvider.when('/notes/list', {templateUrl: xmoney._baseUrl + '/notes/list'}); 
  $routeProvider.when('/tools', {templateUrl: xmoney._baseUrl + '/tools/loadtools'}); 
  $routeProvider.when('/tools/import-export', {templateUrl: xmoney._baseUrl + '/tools/importexport'}); 
  $routeProvider.when('/tools/atm', {templateUrl: xmoney._baseUrl + '/tools/findatm'}); 
  $routeProvider.when('/import-export', {templateUrl: xmoney._baseUrl + '/tools/importexport'}); 
  $routeProvider.when('/report', {templateUrl: xmoney._baseUrl + '/site/report'}); 
});

xmoneyApplication.run(function($window, $rootScope) {
  $rootScope.online = navigator.onLine;
  $rootScope.$apply();
  if (window.addEventListener) {
    $window.addEventListener("offline", function() {
      $rootScope.$apply(function() {
        $rootScope.online = false;
      })
    }, false);
    $window.addEventListener("online", function() {
      $rootScope.$apply(function() {
        $rootScope.online = true;
      })
    }, false);
  } else {
    document.body.ononline = function() {
      $rootScope.$apply(function(){
        $rootScope.online = true;
      });
    };
    document.body.onoffline = function() {
      $rootScope.$apply(function(){
        $rootScope.online = false;
      });
    };
  }
  console.log("Online status: " + $rootScope.online);
});

xmoneyApplication.controller('xmoneyMainController', function($rootScope, $scope){
  $rootScope.$on("$routeChangeStart", function() {
    $rootScope.loading = true;
  });

  $rootScope.$on("$routeChangeSuccess", function(){
    $rootScope.loading = false;
  });
});


xmoneyApplication.factory('$offlineMod', function($window, $rootScope) {
  return {
      isOffline: function() {
        return !navigator.onLine;
      },
      set: function(key, value, type) {
        type = type || "json";
        if (typeof(value) == 'number' || typeof(value) == 'string') return $window.localStorage && $window.localStorage.setItem('xmoney.' + key,value);
        // if (type == "json")
        return $window.localStorage && $window.localStorage.setItem('xmoney.' + key,JSON.stringify(value));
      },
      get: function(key, type) {
        type = type || "json";
        if (type == "json")
          return $window.localStorage &&  JSON.parse($window.localStorage.getItem('xmoney.' + key));
        else return $window.localStorage &&  $window.localStorage.getItem('xmoney.' + key);
      }
    };
});

// ADD NEW TRANSACTION
xmoneyApplication.controller('xmoneyDashboardController', function($rootScope, $scope, $http, $routeParams) {
  $scope.showMainStat = true;
  $scope.isMainStat = true;
  $scope.dataView = false;
  $scope.showMonthStat = {month:0, year:0};
  $scope.amountData = {income: 0, expense: 0, total: 0};
  var currentTime = new Date();
  $scope.timeData = {year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDay()};
  $scope.yearData = false;
  $scope.accountName;
  
  $scope.loadDataView = function(month, year, type) {
    $scope.dataView = false;
    $scope.totalData = false;

    if (month == null) month = $scope.timeData.month;
    if (year == null) year = $scope.timeData.year;
    if (type == null) type = 'bills';


      var req = $http({method: "GET", url: xmoney.reqApi.dashboard_loadDataView+'?month='+month+'&year='+year+'&type='+type+'&user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash});
      req.error(function(){ alert(xmoney.lang.network_error); return false; });
      req.success(function(d) {
        $scope.accountName = d.accountName;
        $scope.dataView = d.dataView; 
        $scope.amountData = d.amountData; 
      });
  }
  $scope.loadDataView($scope.timeData.month, $scope.timeData.year);




  $scope.yearDataCurrentSession = false;
  (function() {
    $rootScope.loading = true;
    var year = $scope.timeData.year;


      var req = $http({method: "GET", url: xmoney.reqApi.dashboard_loadYearDataView+'?year='+year});
      req.error(function(){ alert(xmoney.lang.network_error); return false; });
      req.success(function(d) {
        $scope.yearData = d.dataView;


      });
    $rootScope.loading = false;
  })();

  $scope.showStatAt = function (month, year) {
    $rootScope.loading = true;
    var req = $http({method: "GET", url: xmoney.reqApi.dashboard_loadDataView+'?month='+month+'&year='+year+'&type=bills'});
    req.error(function(){ alert(xmoney.lang.network_error); return false; });
    req.success(function(d) {
      $scope.dataView = d.dataView; 
      console.log(d.dataView);
       $scope.amountData = d.amountData; 
    });
    $scope.showMonthStat = {month:month, year:year};
    $scope.showMainStat = false;
    $scope.isMainStat = false;
     $rootScope.loading = false;
  }

  $scope.showShareBox = false;
  $scope.shareWith = 'everyone';
  $scope.linkToShare = 'Loading link ....';
  $scope.reportTitle = '';
  $scope.getLinkToShare = function(type) {
    $scope.linkToShare = 'Loading link ....';
    if (type == 'month') 
      var reqLink = xmoney.reqApi.dashboard_getLinkToShare + '?type='+type+'&month=' + $scope.showMonthStat.month + '&year=' + $scope.showMonthStat.year + '&share_with=' + $scope.shareWith + '&report_title=' + encodeURIComponent($scope.reportTitle);
    else return;

    var req = $http.get(reqLink);
    req.success(function(d){ return $scope.linkToShare = d.link; });
    req.error(function() { return $scope.linkToShare = '###error###'; });
  }

  $scope.viewShareBoxLink = false;
  $scope.loadShareBox = function() {
     $scope.getLinkToShare('month');
    $scope.viewShareBoxLink = true;
  }

  $scope.shareReport = function() {
    $scope.showShareBox = true;  
  }

  $scope.getNewMonthShareLink = function(mode) {
    $scope.shareWith = mode;
    $scope.getLinkToShare('month');
  }
});


xmoneyApplication.controller('xmoneyAddController', function($rootScope, $scope, $http, $routeParams) {
  $scope.req = {};
  $scope.req.date = new Date();
  $scope.transacAmount = 0;
  $scope.transacType = '+';

  $scope.changeType = function() {
    if ($scope.transacType == '+') $scope.transacType = '-';
    else $scope.transacType = '+';
  }


});


xmoneyApplication.controller('xmoneyMeController', function($rootScope, $scope, $http, $routeParams) {
  $scope.user = {};
  $scope.updateAnnounce = false;
  $scope.updateMsg = '';
  $scope.user.language = "English";
  $scope.user.unit = "VND";
  $scope._listLanguage = {"en":xmoney.lang.en, "vi":xmoney.lang.vi};
  $scope._listUnit = {"vnd":"VND"};

  $http.get(xmoney.reqApi.me_dataView+'?user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash).success(function(d) {
    $scope.user = d.user;
  });

  $scope.actionSavePhoneNumber = function() {
    var r = requestUpdate($http, xmoney.reqApi.me_updateDataPhone, 'phone='+encodeURIComponent($scope.user.phone_number)+'&user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash);
    $scope.viewEditPhone = false;
    $scope.updateAnnounce = true; $scope.updateMsg = xmoney.lang.phone_number_changed+' (close)';
    r.error(function(e) { alert(xmoney.lang.network_error);});
  }

  $scope.actionSaveBirthday = function() {
    var r = requestUpdate($http, xmoney.reqApi.me_updateDataPhone, 'birthday='+encodeURIComponent($scope.user.birthday)+'&user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash);
    $scope.viewEditPhone = false;
    r.error(function(e) { alert(xmoney.lang.network_error);});
  }

  $scope.changeLanguage = function(language) {
    $scope.updateAnnounce = true; $scope.updateMsg = 'Updating...';
    var req = requestUpdate($http, xmoney.reqApi.me_update, 
      'update=language&new_language=' + $scope.user.language);
    req.success(function(data){
      if (data.update == 'true') {
        $scope.updateAnnounce = true; $scope.updateMsg = xmoney.lang.language_changed+' (close)';
      } else if (data.update == 'false') {
        $scope.updateAnnounce = true; $scope.updateMsg = 'Network error!';
      }
    });
  }
});

xmoneyApplication.controller('xmoneyPasswordController', function($rootScope, $scope, $http) {
  $scope.error = {'isError': false, 'errorMessage': ''};
  $scope._req = {};
  $scope._req.currentPassword = '';
  $scope._req.newPassword = '';
  $scope._req.rePassword = '';
  $scope.actionSaveNewPassword = function() {
    $rootScope.loading = true;
    setError(false);
    if ($scope._req.currentPassword.length <= 6 
      || $scope._req.newPassword.length <= 6) {
      setError(xmoney.lang.error_password_len);
      return false;
    } 
    if ($scope._req.newPassword != $scope._req.rePassword) {
      setError(xmoney.lang.error_password_not_match);
      return false;
    }
    if ($scope._req.newPassword == $scope._req.currentPassword) {
      setError(xmoney.lang.error_newpassword_must_be_diff_with_currentpassword);
      return false;
    }
    var req = $http({ method: "POST", url: xmoney.reqApi.me_changePassword,headers: {'Content-Type': xmoney.postContentType},
      data:'password='+encodeURIComponent($scope._req.currentPassword)+'&newpassword='+encodeURIComponent($scope._req.newPassword)+'&repassword='+encodeURIComponent($scope._req.rePassword)+'&user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash});
    req.error(function(){ alert(xmoney.lang.network_error); return false; });
    req.success(function(data){
      if (data.save == 'false') {
        $rootScope.loading = false;
        return setError(data.message);
      }
      if (data.save == 'true') {
        $scope.error.isSuccess = true;
        $scope.error.errorMessage = xmoney.lang.password_changed;
        $rootScope.loading = false;
      }
    })
  }

  var setError = function(msg) {
    if (msg == false) {
      return $scope.error.isError = false;
    } 
    $scope.error.isSuccess = false;
    $scope.error.isError = true;
    $scope.error.errorMessage = msg;
    $rootScope.loading = false;
  }
})