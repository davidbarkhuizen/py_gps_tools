function ActiveTrackListController($scope, $http, $timeout) {

	$scope.removeTrack = function(id) {
		$scope.$emit(Command.REMOVE_TRACK, id);
	};
}