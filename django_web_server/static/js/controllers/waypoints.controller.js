function WaypointsController($scope, $http, $timeout) {

	var waypoints = $scope.$parent.model.waypoints;

	$scope.editing = false;
	$scope.deleting = false;

	// edit
	//

	$scope.editCopy = null;

	$scope.showEdit = function() { 
		return !($scope.editing || $scope.deleting) 
	};
	$scope.edit = function(id) { 
		if (id) {
			$scope.selectPointById(id);
		} 

		if (!$scope.selectedPoint) return;

		$scope.editCopy = JSON.parse(JSON.stringify($scope.selectedPoint)); 

		$timeout(function() { focusOnId('EditWayPointName'); }, 10);

		$scope.deleting = false;
		$scope.editing = true;
	};

	$scope.showSaveEdit = function() { 

		var x =   
			(
			($scope.editing == true) 
			&& 
			(JSON.stringify($scope.editCopy) !== JSON.stringify($scope.selectedPoint))
			);

		return x;
	};
	$scope.saveEdit = function() {

		var successFn = function() {

			$scope.selectedPoint.name = $scope.editCopy.name;
			$scope.editing = false;
			$scope.$emit(Event.WAYPOINT_EDITED);
		};

		var failureFn = function() {
			console.log('failed');
		};

		var errorFn = function(error) {
			$scope.$emit(Event.AJAX_ERROR, error);
		};

		httpPATCH($http, 'waypoint', $scope.editCopy, successFn, failureFn, errorFn);	
	};

	$scope.showCancelEdit = function() {
		return $scope.editing;
	};
	$scope.cancelEdit = function() {
		$scope.editing = false;
	};

	$scope.showDelete = function() { return !($scope.editing || $scope.deleting) };


	// selection
	//
	$scope.selectedPoint = undefined;

	$scope.selectPointById = function(id) {

	    waypoints.forEach(function(x) { if (x.id == id) $scope.selectedPoint = x;  });
	};

	$scope.selectPoint = function(point) {
		$scope.selectedPoint = point;
	};

	$scope.selectFirstWayPoint = function() {

		$scope.selectedPoint = (waypoints.length > 0)
			? waypoints[0]
			: undefined;
	};

	// delete --------------------------------------

	$scope.clearDeletionRequest = function() {
		$scope.userRequestedToDeleteId = null;
	};

	$scope.userRequestedToDeleteId = null;
	$scope.confirmDeletion = function(id) {
		$scope.userRequestedToDeleteId = id;
	};
	$scope.showDeleteConfirmationPrompt = function() {
		return ($scope.selectedPoint) && ($scope.userRequestedToDeleteId == $scope.selectedPoint.id);
	};

	$scope.deleteLocal = function(id) {

		waypoints
			.xRemoveWhere(function(x){ return x.id == id; });

		if (($scope.selectedPoint !== undefined) && ($scope.selectedPoint.id == id)) {
			$scope.selectFirstWayPoint();
		}
	};

	$scope.delete = function(id) {

		var successFn = function() { 
			$scope.deleteLocal(id);
			$scope.$emit(Event.WAYPOINT_DELETED, id);
		};

		var failureFn = function(message) { 
			console.log(message) 
		};

		var errorFn = function(error){
			console.log(error);
		};

		httpDELETE($http, 'waypoint', id, successFn, failureFn, errorFn);
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

			if (($scope.selectedPoint == undefined) || ($scope.selectedPoint == null))
				$scope.selectFirstWayPoint();
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

		httpGET($http, 'waypoints', query, successFn, failureFn, errorFn);
	};

	// LOAD

	$scope.loadWaypointsForTrack = function(id) {

		var track = $scope.$parent.tracks.filter(function(x) {return x.id == id;})[0];
		if (track) {
			$scope.getAndMergeForArea(track.minMaxLat.min, track.minMaxLat.max, track.minMaxLon.min, track.minMaxLon.max);
		}
	};

	// EXPORT

	$scope.exportAllWaypoints = function() {
		$scope.$emit(Event.WAYPOINTS_EXPORT_REQUESTED, $scope.model.waypoints);
	};

	// UNLOAD

	$scope.unloadAllWaypoints = function() {
		$scope.model.waypoints.length = 0;
		$scope.$emit(Event.WAYPOINT_UNLOADED);
	};	

	// RELOAD
	
	$scope.reloadWaypointsForTracks = function() {
		$scope.model.waypoints.length = 0;

		$scope.$parent.tracks.forEach(function(track) {
			$scope.loadWaypointsForTrack(track.id);
		});
	};	

	// EVENT HANDLERS ----------------------------------------



	$scope.$on(Command.LOAD_WAYPOINTS_FOR_TRACK, function(evt, id) {
		$scope.loadWaypointsForTrack(id);
	});	
}