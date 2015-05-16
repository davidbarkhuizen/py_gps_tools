function WaypointsController($scope, $http, $timeout) {

	var model = $scope.$parent.model; 

	$scope.editing = false;
	$scope.deleting = false;

	$scope.filteredOrAll = function() {

		return (model.filteredWaypoints.length > 0)
			? model.filteredWaypoints
			: model.waypoints;
	};

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

		if (!model.selectedPoint) return;

		$scope.editCopy = JSON.parse(JSON.stringify(model.selectedPoint)); 

		$timeout(function() { focusOnId('EditWayPointName'); }, 10);

		$scope.deleting = false;
		$scope.editing = true;
	};

	$scope.showSaveEdit = function() { 

		var x =   
			(
			($scope.editing == true) 
			&& 
			(JSON.stringify($scope.editCopy) !== JSON.stringify(model.selectedPoint))
			);

		return x;
	};
	$scope.saveEdit = function() {

		var successFn = function() {

			model.selectedPoint.name = $scope.editCopy.name;
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



	$scope.selectPointById = function(id) {

	    model.waypoints.forEach(function(x) { if (x.id == id) model.selectedPoint = x;  });
	};

	$scope.selectPoint = function(point) {
		model.selectedPoint = point;
	};

	$scope.selectFirstWayPoint = function() {

		model.selectedPoint = (model.waypoints.length > 0)
			? model.waypoints[0]
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
		return (model.selectedPoint) && ($scope.userRequestedToDeleteId == model.selectedPoint.id);
	};

	$scope.deleteLocal = function(id) {

		model.waypoints
			.xRemoveWhere(function(x){ return x.id == id; });

		if ((model.selectedPoint !== undefined) && (model.selectedPoint.id == id)) {
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

			if (!model.waypoints.xContainsWhere(exists)) {
				model.waypoints.push(newPoint);
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

			if ((model.selectedPoint == undefined) || (model.selectedPoint == null))
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
		$scope.$emit(Event.WAYPOINTS_EXPORT_REQUESTED, model.waypoints);
	};

	// UNLOAD

	$scope.unloadAllWaypoints = function() {
		model.waypoints.length = 0;
		$scope.$emit(Event.WAYPOINT_UNLOADED);
	};	

	// RELOAD
	
	$scope.reloadWaypointsForTracks = function() {
		model.waypoints.length = 0;

		$scope.$parent.tracks.forEach(function(track) {
			$scope.loadWaypointsForTrack(track.id);
		});
	};	

	// EVENT HANDLERS ----------------------------------------

	$scope.$on(Command.LOAD_WAYPOINTS_FOR_TRACK, function(evt, id) {
		$scope.loadWaypointsForTrack(id);
	});	
}