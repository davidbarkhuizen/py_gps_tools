function WaypointsController($scope, $http, $timeout) {

	$scope.waypoints = [];
	$scope.selectedPoint = undefined;

	$scope.promptForDeleteConfirmation = false;

	$scope.timeString = function(dateVal) {
		var d = new Date(dateVal);
		return d.toString();
	};

	$scope.selectPoint = function(point) {
		$scope.selectedPoint = point;
	};

	$scope.delete = function(id) {
		console.log(id);
	}
	
	$scope.fetchAndAggregateTrackWaypoints = function() {
		
		$scope.$parent.tracks.forEach(function (track) {
			track.waypoints.forEach(
				function(wp) {

					if ($scope.waypoints.filter(function(x) { return x.id == wp.id}).length == 0)
						$scope.waypoints.push(wp);
				}
			);
		});

		if ($scope.waypoints.length == 0) {
			$scope.selectedPoint = undefined;
			return;
		}

		$scope.waypoints.sort(function(a,b) { return a.name == b.name ? 0 : a.name > b.name });
	
		$scope.selectedPoint = $scope.waypoints[0];
	};

	$scope.$on(Event.TRACK_LOADED, function(evt, data) {
		$scope.fetchAndAggregateTrackWaypoints();
	});
}