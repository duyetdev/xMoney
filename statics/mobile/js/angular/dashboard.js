var xmoneyApplication = angular.module('xmoneyApp', ["ngRoute", "ngTouch", "mobile-angular-ui"]);
var requestUpdate = function(h, u, d) { return h({ method: "POST",  url: u, data:d, headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'} })}
xmoneyApplication.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {templateUrl: xmoney._baseUrl + '/dashboard/dashboardmain'}); 

	$routeProvider.when('/about', {templateUrl: xmoney._baseUrl + '/about'}); 
	$routeProvider.when('/help', {templateUrl: xmoney._baseUrl + '/help'}); 
	$routeProvider.when('/saving', {templateUrl: xmoney._baseUrl + '/dashboard/help'}); 
	$routeProvider.when('/events', {templateUrl: xmoney._baseUrl + '/dashboard/help'}); 
	$routeProvider.when('/me', {templateUrl: xmoney._baseUrl + '/me/loadmepage'}); 
	$routeProvider.when('/me/editphone', {templateUrl: xmoney._baseUrl + '/me/phone'}); 
	$routeProvider.when('/me/password', {templateUrl: xmoney._baseUrl + '/me/password'}); 
	$routeProvider.when('/add', {templateUrl: xmoney._baseUrl + '/dashboard/add'}); 
	$routeProvider.when('/adjust-balance', {templateUrl: xmoney._baseUrl + '/dashboard/adjustbalance'}); 
	$routeProvider.when('/edit/:transactionId', {templateUrl: xmoney._baseUrl + '/dashboard/add'}); 
	$routeProvider.when('/me/language', {templateUrl: xmoney._baseUrl + '/me/language'}); 
	$routeProvider.when('/setup-new-account', {templateUrl: xmoney._baseUrl + '/dashboard/addAccount/?setupNew=1'}); 
	$routeProvider.when('/account-manager', {templateUrl: xmoney._baseUrl + '/dashboard/accountManager'}); 
	$routeProvider.when('/add-account', {templateUrl: xmoney._baseUrl + '/dashboard/addAccount'}); 
	$routeProvider.when('/change-account', {templateUrl: xmoney._baseUrl + '/dashboard/accountManager'})
	$routeProvider.when('/edit-account/:accountId', {templateUrl: xmoney._baseUrl + '/dashboard/addAccount'}); 
	$routeProvider.when('/notes', {templateUrl: xmoney._baseUrl + '/notes/main'}); 
	$routeProvider.when('/notes/add', {templateUrl: xmoney._baseUrl + '/notes/create'}); 
	$routeProvider.when('/notes/edit/:id', {templateUrl: xmoney._baseUrl + '/notes/list'}); 
	$routeProvider.when('/tools', {templateUrl: xmoney._baseUrl + '/tools/loadtools'}); 
	$routeProvider.when('/tools/import-export', {templateUrl: xmoney._baseUrl + '/tools/importexport'}); 
	$routeProvider.when('/tools/atm', {templateUrl: xmoney._baseUrl + '/tools/findatm'}); 
	$routeProvider.when('/import-export', {templateUrl: xmoney._baseUrl + '/tools/importexport'}); 
	$routeProvider.when('/report', {templateUrl: xmoney._baseUrl + '/site/report'}); 
	$routeProvider.otherwise({templateUrl:xmoney._baseUrl+'/dashboard/dashboardmain'})
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

xmoneyApplication.factory('xmoneyNumpad', function() {
	var numpad = numpad || {};
	numpad.isShow = false;

	numpad.openNumpad = function() {

	}

	numpad.closeNumpad = function() {

	}
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
xmoneyApplication.controller('xmoneyAddController', function($rootScope, $scope, $http, $routeParams, $filter) {
	$scope._req = {};
	$scope._req.transaction_id = -1;
	$scope._req.type = '-';
	$scope._req.account = {id: xmoney.userConfig.default_account.id, human_name: xmoney.userConfig.default_account.account_name};
	$scope._req.category = {'id' : 0, 'description': 'Select category', 'icon': 'fa-question'};
	$scope._req.value = 0;
	$scope._req.note; // note
	$scope._req.addDay = new Date(); // current date
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
	(function() {
		console.log("Load Add-DataView");
		var req = $http.get(xmoney.reqApi.dashboard_add_loadDataView).success(function(_data){
			if (_data) {console.log(_data);
				$scope.listAccount = _data.listAccount.data; 
				if (_data.listAccount.defaultAccount) {
					$scope._req.account = {id: _data.listAccount.defaultAccount.id, human_name:  _data.listAccount.defaultAccount.account_name}
				}
				$scope.listCategory = _data.listCategory; 
			}
		});
	})();

	$scope.isEdit = false;
	if (typeof($routeParams.transactionId) != undefined) {
		$scope.isEdit = true;
		console.log("is edit page");

		$http.get(xmoney.reqApi.dashboard_edit_loadDataFromId + '?transaction_id='+$routeParams.transactionId).success(function(d){
			$scope._req.transaction_id = d.transaction_id;
			$scope._req.type = (d.type == 'income' ? '+' : '-');
			$scope._req.account.id = d.wallet_id;
			$scope._req.category.id = d.category_id;
			$scope._req.value = d.value;
			$scope._req.note = d.note;
			$scope._req.date = d.date;
			$scope._req.repeat.key = d.repeat_type;
			$scope.updateSwitchButtonClass();
		});

	}

	// Change Income/Expense
	$scope.changeType = function(id) {
		if (id == 0)  $scope._req.type = '+';
		else $scope._req.type = '-';
		$scope.updateSwitchButtonClass();
		$scope.headerTitle = '#' + ($scope._req.type == '+' ? 'income' : 'expense');
		$scope._req.category = {'id' : 0, 'description': 'Select category', 'icon': 'fa-question'}; // Reset category
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

	$scope.actionSelectWallet = function(item) {
		if (item && item.id && item.account_name) {
			$scope._req.account.id = item.id;
			$scope._req.account.human_name = item.account_name;
		}
		$scope.viewChooseAccountDialog = !$scope.viewChooseAccountDialog;
	}

	$scope.chooseCategory = function(item) {
		if (item !== null) $scope._req.category = item;
		$scope.viewChooseCategoryDialog = !$scope.viewChooseCategoryDialog;
		console.log("Choose category");console.log($scope._req.category);
	}

	$scope.numpadValue = 0;
	$scope.showNumpadDialog = false;
	$scope.numpadValueTemp = 0;
	$scope.numpadCalcTemp = '';
	$scope.numpadIsInTemp = false;
	$scope.actionShowNumPad = function() {
		//$scope.numpadValue = $scope._req.value;
		$scope.showNumpadDialog = !$scope.showNumpadDialog;
	}
	// Close numpad
	$scope.actionCloseNumpad = function() {
		$scope.actionNumpadTap('='); // after close numpad, calculate all to finish
		$scope._req.value = $scope.numpadValue;
		$scope.showNumpadDialog = false;
	}
	$scope.actionNumpadTap = function(key) {
		if (key in [0,1,2,3,4,5,6,7,8,9]) {
			if ($scope.numpadValue == '+' || $scope.numpadValue == '-' || $scope.numpadValue == '*' || $scope.numpadValue == '/') {
				$scope.numpadValue = key;
			} else 
				$scope.numpadValue = parseInt($scope.numpadValue) * 10 + key;
		} else if (key == '*1000') {
			if ($scope.numpadValue == '+' || $scope.numpadValue == '-' || $scope.numpadValue == '*' || $scope.numpadValue == '/') {
				$scope.numpadValue = 0;
			}	
			else $scope.numpadValue = $scope.numpadValue * 1000;
		} else if (key == 'delete') {
			$scope.numpadValue = $scope.numpadValueTemp = 0;
			$scope.numpadIsInTemp = false;
		} else if (key == '+' || key == '-' || key == '*' || key == '/') {
			if ($scope.numpadIsInTemp != true) {
				$scope.numpadValueTemp = $scope.numpadValue;
			}
			if ($scope.numpadValue > 0 && $scope.numpadValueTemp > 0 && $scope.numpadIsInTemp == true) {
				if ($scope.numpadCalcTemp == '+') $scope.numpadValueTemp += $scope.numpadValueTemp;
				else if ($scope.numpadCalcTemp == '-') $scope.numpadValueTemp = $scope.numpadValueTemp - $scope.numpadValue;
				else if ($scope.numpadCalcTemp == '*') $scope.numpadValueTemp *= $scope.numpadValueTemp;
				else if ($scope.numpadCalcTemp == '/') $scope.numpadValueTemp = $scope.numpadValueTemp / $scope.numpadValue;


			}
			$scope.numpadIsInTemp = true;
			$scope.numpadValue = $scope.numpadCalcTemp = key;
		} else if (key == '=') {
			$scope.numpadValue = parseInt($scope.numpadValue);
			if ($scope.numpadCalcTemp == '+') $scope.numpadValue += $scope.numpadValueTemp;
			else if ($scope.numpadCalcTemp == '-') $scope.numpadValue = $scope.numpadValueTemp - $scope.numpadValue;
			else if ($scope.numpadCalcTemp == '*') $scope.numpadValue *= $scope.numpadValueTemp;
			else if ($scope.numpadCalcTemp == '/') $scope.numpadValue = $scope.numpadValueTemp / $scope.numpadValue;

			$scope.numpadIsInTemp = false;
			$scope.numpadValueTemp = 0;
			$scope.numpadCalcTemp = '';

			//$scope.actionCloseNumpad();
		}

		console.log("$scope.numpadValue = " + $scope.numpadValue);
		console.log("$scope.numpadValueTemp = " + $scope.numpadValueTemp);
		console.log("$scope.numpadCalcTemp = " + $scope.numpadCalcTemp);

	}

	$scope.showTextInputDialog = false;
	$scope.viewTextInput = function() {
		$scope.showTextInputDialog = true;
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
		console.log($scope._req.value);
		if (isNaN($scope._req.value)) {
			// Will change to overlay
			alert(xmoney.lang.please_enter_amount);
			return $rootScope.loading = false;
		}

		console.log($scope);

		var _reqDataString = 
			'transactionId=' + 		parseInt($scope._req.transaction_id)
			+ '&value=' + 			parseInt($scope._req.value)
			+ '&note=' + 			encodeURIComponent($scope._req.note)
			+ '&type=' + 			($scope._req.type == '+' ? 'income' : 'expense')
			+ '&_submitData=true'
			+ '&date=' + 			$filter("date")($scope._req.addDay, 'dd-MM-yyyy')
			+ '&account_id=' + 		parseInt($scope._req.account.id)
			+ '&category_id=' + 	parseInt($scope._req.category.id)
			+ '&repeat=' + 			encodeURIComponent($scope._req.repeat.key)
			+ '&user_id=' + 		parseInt(xmoney.userConfig.id)
			+ '&lastSession=' +		$scope._lastSession;

		var req = $http({
				method: "POST", 
				url: xmoney.reqApi.dashboard_add,// (reqUrl + '&' + _requestDataString), 
				data:_reqDataString,
				headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
			});

		req.success(function(data){
			$rootScope.loading = false;
			if (data.add == 'true') return window.location = "#/home";
			else if (data.add == 'false') alert(data.message);
		});

		req.error(function(e){ alert(xmoney.lang.network_error); console.log(e); });
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
xmoneyApplication.controller('xmoneyAddAccountController', function($rootScope, $scope, $http, $routeParams) {
	$scope.isEditAccount = false;
	if (typeof($routeParams.accountId) != undefined && $routeParams.accountId > 0) {
		$scope.isEditAccount = true;
	}

	if ($scope.isEditAccount) {
		// Load account info to edit 
		(function(){
			$http.get(xmoney.reqApi.dashboard_accountManager_loadAccountInfo + '?accountId='+parseInt($routeParams.accountId)).success(function(d){
				if (d.length == 0) { alert('Not found account!'); $scope.isEditAccount = false; window.location = '#add-account'; return false; }
				$scope.accountId = d.id;
				$scope.accountName = d.account_name;
				$scope.infoContact = d.contact;
				$scope.infoNotes = d.note;
				$scope.infoAccountNumber = d.account_number;
				$scope.isMainAccount = (d.is_main == 1) ? true : false;
				$scope.defaultTypeIncome = (d.initial_balance > 0) ? true : false;
				$scope.initialBalance = Math.abs(d.initial_balance);
			});
		})();

		$scope.actionDeleteAccount = function() {
			if (confirm(xmoney.lang.are_you_sure)) {
				$http.get(xmoney.reqApi.dashboard_accountManager_deleteAccount + '?accountId='+parseInt($routeParams.accountId)).success(function(d){
					if (d.save == 'true') window.location = '#account-manager';
					else alert(d.message);
				})
			}
		}

	} else {
		$scope.currency = 'VND';
		$scope.infoContact = '';
		$scope.infoNotes = '';
		$scope.infoAccountNumber = '';
		$scope.defaultTypeIncome = true; 
		$scope.setupNew = false;
		$scope.initialBalance = 0;
		$scope.isMainAccount = true;
		$scope.accountId = 0;
	}

	$scope.saveNewAccount = function() {
		$rootScope.loading = true;
		if ($scope.accountName.length == 0) {
			alert("Please enter account name!");
			$rootScope.loading = false;
			return false;
		}
		var type = $scope.defaultTypeIncome ? 'income' : 'expense';
		var _reqData =
			'isNew='+($scope.newSetupAccount ? 'true' : 'false')
			+'&accountName='+encodeURIComponent($scope.accountName)
			+'&currency='+encodeURIComponent($scope.currency)
			+'&initialBalance='+parseInt($scope.initialBalance)
			+'&type='+type
			+'&contact='+encodeURIComponent($scope.infoContact)
			+'&accountNumber='+encodeURIComponent($scope.infoAccountNumber)
			+'&note='+encodeURIComponent($scope.infoNotes)
			+'&isMainAccount='+($scope.isMainAccount ? 'true' : 'fasle')
			+'&isEdit='+($scope.isEditAccount ? 'true' : 'false')
			+'&accountId='+$scope.accountId;
		var req = $http({method: "POST", url: xmoney.reqApi.dashboard_addAccount, data:_reqData, headers: {'Content-Type': xmoney.postContentType}});
		req.success(function(data){
			if (data.save == 'true') {
				if ($scope.newSetupAccount)
					return window.location = xmoney._baseUrl;
				else 
					return window.location = '#account-manager';
			}
		})
		
		req.error(function(){ alert(xmoney.lang.network_error); return false; });

	}
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

// DASHBOARD --------
xmoneyApplication.controller('xmoneyMainDashboardController', function($rootScope, $scope, $http, $window, $offlineMod) {
	$scope.accountName = '#dashboard';
	$scope.headerTitle = $scope.accountName + ' ' + (!$rootScope.online ? "(offline)" : "");

	$scope.loadingData = function(m) {
		$rootScope.loading = m;
	};
	$scope.viewMode = 0;
	$scope.dataView = false;
	$scope.amountData = {income: 0, expense: 0, total: 0};
	
	var currentTime = new Date();
	$scope.timeData = {year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDay()};
	$scope.yearData = false;

	// Load data
	$scope.dataViewCurrentSession = false;
	$scope.loadDataView = function(month, year, type, forceReload) {
		$scope.loadingData(true);
		$scope.dataView = false;
		$scope.totalData = false;
		forceReload = forceReload || false;

		if (month == null) month = $scope.timeData.month;
		if (year == null) year = $scope.timeData.year;
		if (type == null) type = 'bills';

		if (($rootScope.online && $scope.dataViewCurrentSession == false) || forceReload) {
			console.log("Load dataView from API and save to localStorage");
			var req = $http({method: "GET", url: xmoney.reqApi.dashboard_loadDataView+'?month='+month+'&year='+year+'&type='+type+'&user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash});
			req.error(function(){ alert(xmoney.lang.network_error); return false; });
			req.success(function(d) {
				$scope.accountName = d.accountName;
				$scope.dataView = d.dataView; 
				$scope.amountData = d.amountData; 
				$scope.headerTitle = $scope.accountName + ' ' + (!$rootScope.online ? "(offline)" : "");
				$offlineMod.set('dataView_' + month + year + type, d); 
				console.log("Save loadDataView data to localStorage"); 
			});
			$scope.dataViewCurrentSession = true;
		} else {
			console.log("I'm offline! Load dataView from localStorage.");
			var localData = $offlineMod.get('dataView_' + month + year + type);
			if (localData == null) {
				if ($rootScope.online) {
					$scope.dataViewCurrentSession = false;
					$scope.loadDataView();
				} else {
					alert(xmoney.lang.error_localStorage);
				}
			} 
			else {
				$scope.accountName = localData.accountName;
				$scope.dataView = localData.dataView; 
				$scope.amountData = localData.amountData;
				$scope.headerTitle = $scope.accountName + ' ' + (!$rootScope.online ? "(offline)" : "");
			}
			$scope.dataViewCurrentSession = true;
		}
		$scope.loadingData(false);
	}
	$scope.loadDataView($scope.timeData.month, $scope.timeData.year);

	$scope.loadPreMonth = function() {
		$scope.timeData.month--;
		if ($scope.timeData.month < 1) { $scope.timeData.month = 12; $scope.timeData.year--;}
		$scope.loadDataView($scope.timeData.month, $scope.timeData.year);
		$scope.loadYearData();
	}
	$scope.loadNextMonth = function() {
		$scope.timeData.month++;
		if ($scope.timeData.month > 12) { $scope.timeData.month = 1; $scope.timeData.year++; } 
		$scope.loadDataView($scope.timeData.month, $scope.timeData.year);
		$scope.loadYearData();
	}

	$scope.yearDataCurrentSession = false;
	$scope.loadYearData = function() {
		$rootScope.loading = true;
		var year = $scope.timeData.year;

		if ($rootScope.online && $scope.yearDataCurrentSession == false) {
			console.log("I'm online! Load yearData from API and save to localStorage.");
			var req = $http({method: "GET", url: xmoney.reqApi.dashboard_loadYearDataView+'?year='+year+'&user_id='+xmoney.userConfig.id+'&hash='+xmoney.userConfig.hash});
			req.error(function(){ alert(xmoney.lang.network_error); return false; });
			req.success(function(d) {
				$scope.yearData = d.dataView;
				$scope.amountData = d.amountData;
				$offlineMod.set('yearData_' + year, d); 
				console.log("Save yearData to localStorage."); 
			});
			$scope.yearDataCurrentSession = true;
		} else {
			$scope.yearDataCurrentSession = true;
			console.log("Load yearData from localStorage.");
			var localData = $offlineMod.get('yearData_' + year);
			if (localData == null) {
				if ($rootScope.online) { // if online, try to connect to network
					$scope.yearDataCurrentSession = false;
					$scope.loadYearData();
				} else // fail, sorry I can do more
					alert("Local Storage error! Please try reload when you connected to network!");
			} else {
				$scope.yearData = localData.dataView;
				$scope.amountData = localData.amountData;
			}
		}

		$rootScope.loading = false;
	}
	$scope.setMode = function(mode) {
		$scope.viewMode = mode;
		if ($scope.viewMode == 3) $scope.loadYearData();
		if ($scope.viewMode == 4) $scope.loadTotalData();
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

// Tools/FindAtm
xmoneyApplication.controller('xmoneyFindAtmController', function() {

});

// List account
xmoneyApplication.controller('xmoneyListAccountController', function($scope, $http) {
	$scope.listAccount = {};
	// Load DataView From API
	var loadDataView = function() {
		console.log("Load Add-DataView");
		var req = $http.get(xmoney.reqApi.dashboard_add_loadDataView).success(function(_data){
			if (_data) {
				console.log(_data);
				$scope.listAccount = _data.listAccount.data; 
			}
		});
	};
	loadDataView();

	$scope.actionSetDefaultAccount = function(id) {
		var req = $http.get(xmoney.reqApi.dashboard_accountManager_setDefaultAccount+'?default='+id).success(function(d){
			loadDataView();
		}).error(function(){});
	}

	$scope.actionEditAccount = function(id) {
		return window.location = '#edit-account/' + id;
	}
});

xmoneyApplication.controller('xmoneyReportController', function($scope, $rootScope, $http) {
	$scope.maxSend = 3;
	$scope.feedBackContent;
	$scope.responseMessage = false;
	$scope.actionSend = function() {
		$rootScope.loading = true;
		if ($scope.maxSend > 0) {
			$http.post(xmoney.reqApi.site_report_sentReport, 'data='+encodeURIComponent($scope.feedBackContent)).success(function(d){
				if (d.save == 'true')
					$scope.responseMessage = d.message;
				else 
					alert(xmoney.lang.network_error);
			}).error(function(){ alert(xmoney.lang.network_error); });
			$scope.maxSend -= 1;
		}
		$rootScope.loading = false;
	}	
})