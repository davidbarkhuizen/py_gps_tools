function WaypointsController($scope, $http, $timeout) {

	$scope.selectFirstWayPoint = function() {

		$scope.selectedPoint = ($scope.waypoints.length > 0)
			? $scope.waypoints[0]
			: undefined;
	};

	$scope.deleteLocal = function(id) {

		$scope.$emit(Event.WAYPOINT_DELETED, id);

		var toRetain = $scope.waypoints.filter(function(x) { return x.id !== id; });
		$scope.waypoints.length = 0;
		toRetain.forEach(function(x) { $scope.waypoints.push(x); });		

		if (($scope.selectedPoint !== undefined) && ($scope.selectedPoint.id == id)) {
			$scope.selectFirstWayPoint();
		}
	};

	$scope.delete = function(id) {

		var successFn = function() { 
			$scope.deleteLocal(id);
		};

		var failureFn = function(message) { 
			console.log(message) 
		};

		var errorFn = function(error){
			console.log(error);
		};

		httpDelete($http, 'waypoint', id, successFn, failureFn, errorFn);
	};

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