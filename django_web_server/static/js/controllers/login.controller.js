function LoginController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;

	$scope.updateAuthenticationState = function() {

		var authenticatedFn = function(email) {

			model.user.authenticated = true;
			model.user.email = email;

			if ($scope.$parent.view === Views.LOGIN) {
				$rootScope.$emit(Command.GOTO_VIEW, Views.HOME);
			}
		}

		var notAuthenticatedFn = function(msg) {
			model.user.authenticated = false;

			if ($scope.$parent.view === Views.LOGOUT) {
				$rootScope.$emit(Command.GOTO_VIEW, Views.LOGIN);
			}
		}

		httpGET($http, 'login', { }, authenticatedFn, notAuthenticatedFn, $scope.globalDebug);
	};

	$scope.logout = function() {

		var returnFn = function() {
			$scope.updateAuthenticationState();		
		}

		httpDELETE($http, 'login', { }, returnFn, returnFn, $scope.globalDebug);			
	};

	$scope.login = function() {

		if (model.user.infoIsValid() == false)
			return;

		var loginSucceeded = function(msg) {
			model.user.password = '';			
			$scope.updateAuthenticationState();
		}

		var loginFailed = function(msg) {
			console.log('failed');
			console.log(msg);
		}

		login($http, model.user.email, model.user.password, loginSucceeded, loginFailed, $scope.$parent.globalDebug);
	};	

	$scope.updateAuthenticationState();
}
