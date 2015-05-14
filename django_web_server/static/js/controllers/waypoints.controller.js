function WaypointsController($scope, $http, $timeout) {

	var waypoints = $scope.$parent.model.waypoints;

	// selection
	//
	$scope.selectedPoint = undefined;

	$scope.selectPoint = function(point) {
		$scope.selectedPoint = point;
	};

	$scope.selectFirstWayPoint = function() {

		$scope.selectedPoint = (waypoints.length > 0)
			? waypoints[0]
			: undefined;
	};

	// delete --------------------------------------

	$scope.promptForDeleteConfirmation = false;

	$scope.deleteLocal = function(id) {

		$scope.$emit(Event.WAYPOINT_DELETED, id);

		waypoints
			.xRemoveWhere(function(x){ return x.id == id; });

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

	// --------------------------------------------

	$scope.timeString = function(dateVal) {

		var d = new Date(dateVal);
		return d.toString();
	};

	$scope.mergeNewPoints = function(newPoints) {

		var changed = false;

		newPoints.forEach(function(newPoint) {

			var exists  = function(existing) { 
				return existing.id == newPoint.id; 
			};

			if (!waypoints.xContainsWhere(exists)) {
				waypoints.push(newPoint);
				changed = true;
			}
		});

		if (changed)  {
			$scope.$emit(Event.WAYPOINT_ADDED);
		}
	};

	$scope.getAndMergeForArea = function(minLat, maxLat, minLon, maxLon) {

		var successFn = function(data) {	

			var resultPoints = [];	

			data.waypoints.forEach(function(wpd){
				var wp = parseWaypointDict(wpd);
				resultPoints.push(wp);
			});

			$scope.mergeNewPoints(resultPoints);
		};

		var failureFn = function(message) { 
			console.log(message) 
		};

		var errorFn = function(error){
			$scope.$emit(Event.AJAX_ERROR, error);
		};

		query = {
			'minLat' : minLat,
			'maxLat' : maxLat,
			'minLon' : minLon,
			'maxLon' : maxLon
		};

		httpGet($http, 'waypoints', query, successFn, failureFn, errorFn);
	};

	// EVENT HANDLERS ----------------------------------------

	$scope.$on(Command.LOAD_WAYPOINTS_FOR_TRACK, function(evt, id) {

		var track = $scope.$parent.tracks.filter(function(x) {return x.id == id;})[0];
		if (track) {
			$scope.getAndMergeForArea(track.minMaxLat.min, track.minMaxLat.max, track.minMaxLon.min, track.minMaxLon.max);
		}
	});	
}