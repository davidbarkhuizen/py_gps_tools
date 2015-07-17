function LoginController($rootScope, $scope, $http, $timeout) {

	$scope.userCredentials = new UserCredentials();

	$scope.login = function() {

		if ($scope.userCredentials.infoIsValid() == false)
			return;

		var loginSucceeded = function(msg) {
			console.log('succeeded');
			console.log(msg);
		}

		var loginFailed = function(msg) {
			console.log('failed');
			console.log(msg);
		}

		login($http, $scope.userCredentials.email, $scope.userCredentials.password, loginSucceeded, loginFailed, $scope.$parent.globalDebug);
	};
}
