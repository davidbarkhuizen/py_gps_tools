function UserController($rootScope, $scope, $http, $timeout) {

	$scope.model = $scope.$parent.model;

	// -------------------------------------------------------------
	// SIGN-UP / PROSPECTIVE USER

	$scope.prospectiveUser = new ProspectiveUser();

	$scope.userRegistrationAttemptFailed = false;
	$scope.userRegistrationAttemptFailureErrorMessage = [];

	$scope.prospectiveUserRegistered = false;

	$scope.registerProspectiveUser = function() {

		if ($scope.prospectiveUser.infoIsValid() == false)
			return;

		var data = {
			email: $scope.prospectiveUser.email,
			password: $scope.prospectiveUser.password
		};

		var successFn = function(data, status, headers, config) {

			// TODO
			// inform user that
			// - prospective user was registered
			// - confirmation email will be sent
			// - embedded link needs to be clicked within x hours 

			// prevent further attempts
			//
			$scope.prospectiveUserRegistered = true;
		};

		var failureFn = function(message) {

			var lines = message.split('\n');
			$scope.userRegistrationAttemptFailureErrorMessage.length = 0;
			for(var i = 0; i <  lines.length; i++)
				$scope.userRegistrationAttemptFailureErrorMessage.push(lines[i]);

			console.log($scope.userRegistrationAttemptFailureErrorMessage);

			$scope.userRegistrationAttemptFailed = true;
		};

		var errorFn = function(error) {
		    $rootScope.$emit(Event.DEBUG_ERROR, error);
		};

		httpPOST($http, 'useractivation', data, successFn, failureFn, errorFn);
	};
}
