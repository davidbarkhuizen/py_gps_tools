function UserController($rootScope, $scope, $http, $timeout) {

	$scope.model = $scope.$parent.model;

	$scope.prospectiveUser = new ProspectiveUser();

	$scope.registerProspectiveUser = function() {

		if ($scope.prospectiveUser.infoIsValid() == false)
			return;

		// make POST call to /prospectiveuser

	};
}
