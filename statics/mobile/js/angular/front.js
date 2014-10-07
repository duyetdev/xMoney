var app = angular.module('xmoneyApp', ["mobile-angular-ui"]);

app.controller('xmoneyMainController', function($rootScope, $scope){
	$rootScope.$on("$routeChangeStart", function() {
		$rootScope.loading = true;
	})

	$rootScope.$on("$routeChangeSuccess", function(){
		$rootScope.loading = false;
	})
});