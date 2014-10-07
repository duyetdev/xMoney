var xm = angular.module('xMoney', []);

xm.controller('xmoneyRegisterController', function($scope, $http){
	$scope.onError = false;
	$scope.errorMessage = '';
	$scope.loading = false;

	$scope.register = function() {
		$scope.loading = true;
		
		if ($scope._username && $scope._password && $scope._repassword) {
			if ($scope._repassword !== $scope._password) {
				$scope.loading = false;
				$scope.onError = true; $scope.errorMessage = 'Password and repassword must be the same!';
				return false;
			}
			var _requestDataString = 'username=' + encodeURIComponent($scope._username) + '&email='+ encodeURIComponent($scope._email) +'&password=' + encodeURIComponent($scope._password) + '&repassword=' + encodeURIComponent($scope._repassword);
			var _requestData = {username: encodeURIComponent($scope._username), 
					password: encodeURIComponent($scope._password)};
			$scope.onError = false;
			var req = $http({
					method: "POST", 
					url: reqUrl,// (reqUrl + '&' + _requestDataString), 
					data:_requestDataString,
					headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
				});

			req.success(function(data){
				$scope.loading = false;
				if (data.register == 'false') { $scope.onError = true; $scope.errorMessage = data.message; }
				else if (data.register == 'true') {
					$scope.loading = true;
					console.log('Register success!');
					return window.location = data.returnUrl;
				} else {
					alert('Network error!');
				}
			});

			req.error(function(e){console.log(e)});
		}
	}
});