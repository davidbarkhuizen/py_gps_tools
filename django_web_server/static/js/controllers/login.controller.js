function LoginController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;

	$scope.loginAttemptFailed = false;
	$scope.loginAttemptFailureErrorMessage = [];

	$scope.updateAuthenticationState = function() {

		var authenticatedFn = function(email) {

			model.user.authenticated = true;
			model.user.email = email;

			if ($scope.$parent.view === Views.LOGIN) {
				$rootScope.$emit(Command.GOTO_VIEW, Views.HOME);
			}

			$rootScope.$emit(Event.AUTH_STATE_CHANGED);
		}

		var notAuthenticatedFn = function(msg) {
			model.user.authenticated = false;

			if ($scope.$parent.view === Views.LOGOUT) {
				$rootScope.$emit(Command.GOTO_VIEW, Views.LOGIN);
			}

			$rootScope.$emit(Event.AUTH_STATE_CHANGED);
		}

		httpGET($http, 'login', { }, authenticatedFn, notAuthenticatedFn, $scope.globalDebug);
	};

	$scope.logout = function() {

		var discardChangesAndLogout = function() {

			var returnFn = function() {
				$scope.updateAuthenticationState();		
			}

			httpDELETE($http, 'login', { }, returnFn, returnFn, $scope.globalDebug);	
		};

		var saveChangesAndLogout = function() {

			model.gpxs.forEach(function(gpx){
				if (gpx.edited === true)
					$rootScope.$emit(Command.SAVE_GPX, gpx);
			});

			var returnFn = function() {
				$scope.updateAuthenticationState();		
			};			

			// so that save requests get there before logout req
			//
			$timeout(function(evt, data) {
				httpDELETE($http, 'login', { }, returnFn, returnFn, $scope.globalDebug);
			}, 5);	
		};

		if (model.isEdited() == true) {
			data = {
				onSave: saveChangesAndLogout,
				onDiscard:  discardChangesAndLogout
			};
			$rootScope.$emit(Command.OPEN_UNSAVED_CHANGES_MODAL, data);
		}
		else {
			discardChangesAndLogout();
		}
	};

	$scope.login = function() {

		if (model.user.infoIsValid() == false)
			return;

		var loginSucceeded = function(msg) {
			$scope.loginAttemptFailed = false;
			$scope.loginAttemptFailureErrorMessage.length = 0;

			model.user.password = '';			
			$scope.updateAuthenticationState();
		}

		var loginFailed = function(msg) {

			var lines = msg.split('\n');
			$scope.loginAttemptFailureErrorMessage.length = 0;
			for(var i = 0; i <  lines.length; i++)
				$scope.loginAttemptFailureErrorMessage.push(lines[i]);

			$scope.loginAttemptFailed = true;
		}

		login($http, model.user.email, model.user.password, loginSucceeded, loginFailed, $scope.$parent.globalDebug);
	};	

	$scope.updateAuthenticationState();

	$rootScope.$on(Command.LOGOUT, function(evt, data){ $scope.logout(); });
}
