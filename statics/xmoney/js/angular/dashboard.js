var xmoneyApplication = angular.module('xmoneyApp', ["ngRoute", "ngTouch", "mobile-angular-ui"]);
var requestUpdate = function(h, u, d) { return h({ method: "POST",  url: u, data:d, headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'} })}
xmoneyApplication.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {templateUrl: xmoney._baseUrl + '/dashboard/index?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/home', {templateUrl: xmoney._baseUrl + '/dashboard/index?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/about', {templateUrl: xmoney._baseUrl + '/about/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/help', {templateUrl: xmoney._baseUrl + '/help/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/saving', {templateUrl: xmoney._baseUrl + '/dashboard/help/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/events', {templateUrl: xmoney._baseUrl + '/dashboard/help/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/me', {templateUrl: xmoney._baseUrl + '/me/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/me/editphone', {templateUrl: xmoney._baseUrl + '/me/phone?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/me/password', {templateUrl: xmoney._baseUrl + '/me/password?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/add', {templateUrl: xmoney._baseUrl + '/dashboard/add/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/add/in', {templateUrl: xmoney._baseUrl + '/dashboard/add/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/add/out', {templateUrl: xmoney._baseUrl + '/dashboard/add/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/me/language', {templateUrl: xmoney._baseUrl + '/me/language/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/setup-new-account', {templateUrl: xmoney._baseUrl + '/dashboard/addAccount/?key='+xmoney._hashkeySecurity + '&setupNew=1'}); 
	$routeProvider.when('/add-account', {templateUrl: xmoney._baseUrl + '/dashboard/addAccount/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/notes', {templateUrl: xmoney._baseUrl + '/notes/main/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/notes/add', {templateUrl: xmoney._baseUrl + '/notes/add/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/notes/list', {templateUrl: xmoney._baseUrl + '/notes/list/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/tools', {templateUrl: xmoney._baseUrl + '/tools/loadtools?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/tools/import-export', {templateUrl: xmoney._baseUrl + '/tools/importexport?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/import-export', {templateUrl: xmoney._baseUrl + '/tools/importexport/?key='+xmoney._hashkeySecurity}); 
});

xmoneyApplication.controller('xmoneyMainController', function($rootScope, $scope){
	$rootScope.$on("$routeChangeStart", function() {
		$rootScope.loading = true;
	});

	$rootScope.$on("$routeChangeSuccess", function(){
		$rootScope.loading = false;
	});
});


// ADD NEW TRANSACTION
xmoneyApplication.controller('xmoneyAddController', function($rootScope, $scope, $http) {
	$scope._req = {};
	$scope._req.type = '-';
	$scope._req.account = {"id": 0, 'human_name': ''};
	$scope._req.category = {'id' : 0, 'description': ''};
	$scope._req.value;
	$scope._req.note = ''; // note
	$scope._req.date = new Date(); // current date
	$rootScope.loading = false;
	$scope._req.repeat = {'key' : 'none', 'text' : 'Repeat'};
	$scope.headerTitle = '#' + ($scope._req.type == '+' ? 'income' : 'expense');

	// Choose account
	$scope.viewChooseAccountDialog = $scope.viewChooseCategoryDialog = false;
	$scope.listAccount;
	$scope.listCategory;
	
	$scope.repeatItem = [
		{'key': 'none', 'text': xmoney.lang.repeat_no_repeat},
		{'key': 'day', 'text': xmoney.lang.repeat_every_day},
		{'key' : 'xdays', 'text': xmoney.lang.repeat_x_days},
		{'key': 'week', 'text': xmoney.lang.repeat_every_week},
		{'key': '2week', 'text': xmoney.lang.repeat_every_2week},
		{'key': 'month', 'text': xmoney.lang.repeat_every_month},
		{'key': 'xmonths', 'text': xmoney.lang.repeat_x_months},
		{'key': '2month', 'text': xmoney.lang.repeat_every_2month},
	];

	// Load DataView From API
	$scope.loadAddDataView = function() {
		var req = $http({method: "GET", url: xmoney.reqApi.dashboard_add_loadDataView+'?user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash +'&lang=' + xmoney.userConfig.language});
		req.error(function(){ alert(xmoney.lang.network_error); return false; });
		if (req.success(function(d) {
			$scope.listAccount = d.listAccount.data; 
			$scope._req.account.id=d.listAccount.defaultAccount.id;
			$scope._req.account.human_name = d.listAccount.defaultAccount.account_name; 
			$scope.listCategory = d.listCategory; 
		})) {
			 console.log($scope.listCategory);
		}
		
	}
	$scope.loadAddDataView();

	// Change Income/Expense
	$scope.changeType = function(id) {
		if (id == 0)  $scope._req.type = '+';
		else $scope._req.type = '-';
		$scope.updateSwitchButtonClass();
		$scope.headerTitle = '#' + ($scope._req.type == '+' ? 'income' : 'expense');
		$scope._req.category = {'id' : 0, 'description': ''}; // Reset category
	}

	// Switch button
	$scope.updateSwitchButtonClass = function() {
		if ($scope._req.type == '+') {
			$scope.incomeClass = 'btn-success';
			$scope.expenseClass = 'btn-default';
		} else {
			$scope.incomeClass = 'btn-default';
			$scope.expenseClass = 'btn-warning';
		}
	}
	$scope.updateSwitchButtonClass();

	$scope.chooseAccount = function(item) {
		if (item != null) {
			$scope._req.account.id = item.id;
			$scope._req.account.human_name = item.account_name;
		}
		$scope.viewChooseAccountDialog = !$scope.viewChooseAccountDialog;
	}

	$scope.chooseCategory = function(item) {
		if (item !== null) $scope._req.category = item;
		$scope.viewChooseCategoryDialog = !$scope.viewChooseCategoryDialog;
	}

	$scope.viewRepeatDialog = false;
	$scope.viewRepeatMoreOptions = false;
	$scope._req.numOfRepeat = 0;
	$scope._req.repeatX = 1;
	$scope._req.repeatStartAtFirst = false;
	$scope.setRepeat = function(item) {
		if (item) {
			$scope._req.repeat.key = item.key;
			$scope._req.repeat.text = item.text;
			
			if ($scope._req.repeat.key == 'none') {
				$scope.viewRepeatDialog = false;
				return true;	
			}

			$scope.viewRepeatMoreOptions = true;
		} else 
			$scope.viewRepeatDialog = true;
	}
	$scope.setRepeatMoreOptions = function(item) {
		// Close RepeatMoreOptions dialog 
		$scope.viewRepeatMoreOptions = false;
		// Close RepeatDialog 
		$scope.viewRepeatDialog = false;
	}

	// Save all data, request to API
	$scope.saveTransaction = function() {
		$rootScope.loading = true;
		$scope._req.value = parseInt($scope._req.value);
		if ($scope._req.value <= 0) {
			// Will change to overlay
			alert("Please enter all field!");
		}
		var _reqDataString = 'value=' + $scope._req.value 
			+ '&note=' + encodeURIComponent($scope._req.note)
			+ '&type=' + ($scope._req.type == '+' ? 'income' : 'expense')
			+ '&_submitData=true'
			+ '&date=' + encodeURIComponent($scope._req.date)
			+ '&account=' + encodeURIComponent($scope._req.account) 
			+ '&category_id=' + encodeURIComponent($scope._req.category.id)
			+ '&repeat=' + encodeURIComponent($scope._req.repeat.key)
			+ '&user_id=' + parseInt(xmoney.userConfig.id)
			+ '&lastSession=' + $scope._lastSession;

		var req = $http({
				method: "POST", 
				url: xmoney.reqApi.dashboard_add,// (reqUrl + '&' + _requestDataString), 
				data:_reqDataString,
				headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
			});

		req.success(function(data){
			$rootScope.loading = false;
			if (data.add == 'true') {
				return window.location = data.returnUrl;
			} else if (data.add == 'false') {
				alert(data.message);
			}
		
		});

		req.error(function(e){
			alert(xmoney.lang.network_error);
			console.log(e);
		});
		return true;
	}
});

// Change password
xmoneyApplication.controller('xmoneyChangePasswordontroller', function($rootScope, $scope, $http) {
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
			if (data.save == 'true') return window.location = '#/me';
			//console.log(data);
		})
	}

	var setError = function(msg) {
		if (msg == false) {
			return $scope.error.isError = false;
		} 
		$scope.error.isError = true;
		$scope.error.errorMessage = msg;
		$rootScope.loading = false;
	}
});

// Add new account 
xmoneyApplication.controller('xmoneyAddAccountController', function($rootScope, $scope, $http) {
	$scope.currency = 'VND';
	$scope.infoContact = '';
	$scope.infoNotes = '';
	$scope.infoAccountNumber = '';
	$scope.defaultTypeIncome = true; 
	$scope.isMainAccount;
	$scope.setupNew = false;
	$scope.initialBalance = 0;
	$scope.isMainAccount = true;
	
	$scope.saveNewAccount = function() {
		$rootScope.loading = true;
		var type = $scope.defaultTypeIncome ? 'income' : 'expense';
		var _reqData = 'user_id='+xmoney.userConfig.id
			+'&isNew='+($scope.setupNew ? 'true' : 'false')
			+'&accountName='+encodeURIComponent($scope.accountName)
			+'&currency='+encodeURIComponent($scope.currency)
			+'&initialBalance='+parseInt($scope.initialBalance)
			+'&type='+type
			+'&contact='+encodeURIComponent($scope.infoContact)
			+'&accountNumber='+encodeURIComponent($scope.infoAccountNumber)
			+'&note='+encodeURIComponent($scope.infoNotes)
			+'&isMainAccount='+$scope.isMainAccount;
		var req = $http({method: "POST", url: xmoney.reqApi.dashboard_addAccount, data:_reqData, headers: {'Content-Type': xmoney.postContentType}});
		req.success(function(data){if (data.save == 'true') return window.location = xmoney._baseUrl;})
		req.error(function(){ alert(xmoney.lang.network_error); return false; });
		$rootScope.loading = false;
	}

	$scope.isNewSetup = function(m) { $scope.setupNew = m; $scope.isMainAccount = m; }
});

// Me 
xmoneyApplication.controller('xmoneyMeController', function($scope, $http) {
	$scope.user = {};
	$scope.updateAnnounce = false;
	$scope.updateMsg = '';
	$scope.user.language = "English";
	$scope.user.unit = "VND";
	$scope._listLanguage = {"en":xmoney.lang.en, "vi":xmoney.lang.vi};
	$scope._listUnit = {"vnd":"VND"};

	$http.get(xmoney.reqApi.me_dataView+'&user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash).success(function(d) {
		$scope.user = d.user;
	});

	$scope.actionSavePhoneNumber = function() {
		var r = requestUpdate($http, xmoney.reqApi.me_updateDataPhone, 'phone='+encodeURIComponent($scope.user.phone_number)+'&user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash);
		$scope.viewEditPhone = false;
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
				$scope.updateAnnounce = true; $scope.updateMsg = 'Updated';
			} else if (data.update == 'false') {
				$scope.updateAnnounce = true; $scope.updateMsg = 'Network error!';
			}
		});
	}
});

// DASHBOARD --------
xmoneyApplication.controller('xmoneyMainDashboardController', function($rootScope, $scope, $http) {
	$scope.headerTitle = '#dashboard';
	$scope.loadingData = function(m) { if (m) {$scope.headerTitle = 'Loading...';} else {$scope.headerTitle = '#dashboard';}};
	$scope.viewMode = 0;
	$scope.dataView = false;
	$scope.amountData = {income: 0, expense: 0, total: 0};
	
	var currentTime = new Date();
	$scope.timeData = {year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDay()};
	$scope.monthData = false;

	// Load data
	$scope.loadDataView = function(month, year, type) {
		$scope.loadingData(true);
		$scope.dataView = false;
		if (month == null) month = $scope.timeData.month;
		if (year == null) year = $scope.timeData.year;
		if (type == null) type = 'bills';

		var req = $http({method: "GET", url: xmoney.reqApi.dashboard_loadDataView+'?month='+month+'&year='+year+'&type='+type+'&user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash});
		req.error(function(){ alert(xmoney.lang.network_error); return false; });
		if (req.success(function(d) { $scope.dataView = d.dataView; $scope.amountData = d.amountData; })) {}
		$scope.loadingData(false);
	}
	$scope.loadDataView($scope.timeData.month, $scope.timeData.year);

	$scope.loadPreMonth = function() {
		$scope.timeData.month--;
		if ($scope.timeData.month < 1) { $scope.timeData.month = 12; $scope.timeData.year--;}
		$scope.loadDataView($scope.timeData.month, $scope.timeData.year);
	}
	$scope.loadNextMonth = function() {
		$scope.timeData.month++;
		if ($scope.timeData.month > 12) { $scope.timeData.month = 1; $scope.timeData.year++; } 
		$scope.loadDataView($scope.timeData.month, $scope.timeData.year);
	}

	$scope.loadMonthData = function() {
		$rootScope.loading = true;
		var year = $scope.timeData.year;

		var req = $http({method: "GET", url: xmoney.reqApi.dashboard_loadMonthDataView+'&year='+year+'&user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash});
		req.error(function(){ alert(xmoney.lang.network_error); return false; });
		if (req.success(function(d) { $scope.monthData = d.dataView; $scope.amountData = d.amountData;})) {}
		$rootScope.loading = false;
	}
	$scope.setMode = function(mode) {
		$scope.viewMode = mode;
		if ($scope.viewMode == 3 && !$scope.monthData) $scope.loadMonthData();
		if ($scope.viewMode == 4 && $scope.totalData.length == 0) $scope.loadTotalData();
	}

	$scope.viewItemActionDialog = false;
	$scope.actionItem = [];
	$scope.itemAction = function(item) {
		$scope.actionItem = item;
		$scope.viewItemActionDialog = true;
	}
	$scope.actionDeleteTransaction = function(item) {
		if (confirm('Are you sure??')) {
			var req = $http({
				method: "POST", 
				url: xmoney.reqApi.dashboard_deleteTransaction,
				data:'user_id='+ xmoney.userConfig.id +'&transaction_id='+item.transaction_id,
				headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
			});
			$scope.loadDataView($scope.timeData.month, $scope.timeData.year);

			$scope.viewItemActionDialog = false;
		}

		return true;
	}
});