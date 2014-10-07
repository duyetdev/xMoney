var xmoneyApplication = angular.module('xmoney-app', ['ngCookies','ngResource']);
var api = '/api';
xmoneyApplication.config(function($interpolateProvider, $httpProvider) {
  $interpolateProvider.startSymbol('##');
  $interpolateProvider.endSymbol('##');

	$httpProvider.defaults.xsrfCookieName = 'csrftoken';
	$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});



xmoneyApplication.factory('UserApi', ['$resource', function(r){
	return r(api+'/user/', null, {'update': {method: 'PUT'}});
}])

/* Account Manager */
xmoneyApplication.controller('xmoney-account-controller', ['$scope', '$http', 'UserApi', function(scope, http, UserApi){
	UserApi.get(function(d){
		scope.user = d;
	});

}]);

xmoneyApplication.controller('changeUserName', ['$scope', '$http', 'UserApi', function(scope, http, UserApi){
	scope.save = function() {
		UserApi.update({}, scope.user).$promise.then(function(d){
			console.log(d);
		});
		$('#change-name').modal('hide');
		//console.log(message);
	}
}])

/* Dashboard Main */
xmoneyApplication.controller('xmoney-dashboard-controller', ['$scope', '$http', '$resource', '$cookies', function(scope, http, resource, cookie){
	scope.dashboard = {}
	scope.stat_overview_mode = 'last7day';

	http.get(api+'/user').success(function(d){
		scope.user = d;
	})
	http.get(api+'/transaction').success(function(d){
		scope.transaction = d;
		console.log(d);
	});

	scope.loadStatOverview = function(mode) {
		scope.stat_overview_mode = mode;
		http.get(api+'/stats/overview?mode='+scope.stat_overview_mode).success(function(d){
			$(function(){
				console.log(d);
				scope.dashboard.stat = d;
				var options = {type:"bar",height:"30",barWidth:"4",barSpacing:"1",barColor:"#ffffff",negBarColor:"#eeeeee"}
				
				// last 7 days
				$(".stat-num-of-transaction").sparkline(d.num_of_transaction_stat, options); 
				$(".stat-income-transaction").sparkline(d.income_stat, options); 
				$(".stat-expense-transaction").sparkline(d.expense_stat, options); 
			})

		})
	}
	scope.loadStatOverview(scope.stat_overview_mode)

	scope.openModalNewTransaction = function() {
		scope.dashboard.new_transaction = {}
		scope.dashboard.new_transaction.user = scope.user.id;

		$('.bs-add-transaction-modal-lg').modal('show');
	}
	scope.openModalNewCategory = function() {
		scope.dashboard.new_category = {}
		scope.dashboard.new_category.user = scope.user.id;

		$('.bs-add-category-modal-lg').modal('show');
		$('.bs-add-transaction-modal-lg').modal('hide');	
	}
	scope.saveNewTransaction = function() {
		http.post(api+'/transaction/', scope.dashboard.new_transaction).success(function(d) {
			console.log('Request success');
			console.log(d)
		}).error(function(e){
			console.log('Have some error');
			scope.dashboard.new_transaction_error = e;
			console.log(e);
		})
	}

	scope.saveNewCategory = function() {
		$('.bs-add-category-modal-lg').modal('hide');
		$('.bs-add-transaction-modal-lg').modal('show');
	}

	scope.loadTodayTransaction = function(limit) {
		limit = limit || 10
		http.get(api+'/transaction?limit='+limit).success(function(d) {
			scope.dashboard.transaction_today = d;
		})
	}
	scope.loadTodayTransaction(10)

	// Category switch button
	$(function(){
		$('#cattype').bootstrapSwitch();
	})

		 
}])


