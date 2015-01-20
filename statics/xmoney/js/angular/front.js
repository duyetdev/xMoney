var app = angular.module('xmoneyApp', ["ngRoute", "ngTouch", "mobile-angular-ui"]);

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/',			{templateUrl: xmoney._baseUrl + '/site/index/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/about',		{templateUrl: xmoney._baseUrl + '/about/?key='+xmoney._hashkeySecurity}); 
	$routeProvider.when('/help',		{templateUrl: xmoney._baseUrl + '/help/?key='+xmoney._hashkeySecurity}); 
});

app.controller('xmoneyMainController', function($rootScope, $scope){
	$rootScope.$on("$routeChangeStart", function() {
		$rootScope.loading = true;
	})

	$rootScope.$on("$routeChangeSuccess", function(){
		$rootScope.loading = false;
	})
});