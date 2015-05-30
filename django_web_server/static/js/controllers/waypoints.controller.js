function WaypointsController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model; 

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.timeString = function(dateVal) {

		var d = new Date(dateVal);
		return d.toString();
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// FILTERING

	$scope.showAll = function() {
		model.filteredWaypoints.length = 0;
	};

	$scope.filteredOrAll = function() {

		if (model.waypoints.length == 0) {
			model.filteredWaypoints.length = 0; 
		}

		var set = (model.filteredWaypoints.length > 0)
			? model.filteredWaypoints
			: model.waypoints;

		set = set.sort(function(a, b) { return a.name.localeCompare(b.name); });

		return set;
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// EDIT

	$scope.editing = false;
	$scope.editCopy = null;

	var kcEnter = 13, kcEsc = 27;
	$scope.editKeyPress = function(evt) {
		if (evt.charCode == 0) {
			if (evt.keyCode == kcEnter) $scope.saveEdit();
			else if (evt.keyCode == kcEsc) $scope.cancelEdit();
		}
	};

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
			$rootScope.$emit(Event.WAYPOINT_EDITED);
		};

		var failureFn = function() {
			console.log('failed');
		};

		var errorFn = function(error) {
			$rootScope.$emit(Event.DEBUG_ERROR, error);
		};

		httpPATCH($http, 'waypoint', $scope.editCopy, successFn, failureFn, errorFn);	
	};

	$scope.showCancelEdit = function() {
		return $scope.editing;
	};

	$scope.cancelEdit = function() {
		$scope.editing = false;
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// DELETE

	$scope.deleting = false;

	$scope.showDelete = function() { return !($scope.editing || $scope.deleting) };

	$scope.cancelDelete = function() {
		$scope.deleting = false;
	};

	$scope.getDeletionConfirmation = function(id) {

		model.waypoints.forEach(function(pt) {
			if (pt.id == id) {
				model.selectedPoint = pt;
				$scope.deleting = true;
			}
		});		
	};
	$scope.showDeleteConfirmationPrompt = function() {
		return (model.selectedPoint) && ($scope.deleting == true);
	};
	$scope.deleteLocal = function(id) {

		model.filteredWaypoints
			.removeWhere(function(x){ return x.id == id; });

		model.waypoints
			.removeWhere(function(x){ return x.id == id; });

		if ((model.selectedPoint !== undefined) && (model.selectedPoint.id == id)) {
			$scope.selectFirstWayPoint();
		}

		$scope.deleting = false;
	};

	$scope.delete = function(id) {

		var successFn = function() { 
			$scope.deleteLocal(id);
			$rootScope.$emit(Event.WAYPOINT_DELETED, id);
		};

		var failureFn = function(message) { 
			console.log(message) 
		};

		var errorFn = function(error){
			console.log(error);
		};

		httpDELETE($http, 'waypoint', id, successFn, failureFn, errorFn);
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// SELECT

	$scope.selectPointById = function(id) {

	    model.waypoints.forEach(function(x) { if (x.id == id) model.selectedPoint = x;  });
	};

	$scope.selectPoint = function(point) {
		model.selectedPoint = point;
	};

	$scope.selectFirstWayPoint = function() {

		model.selectedPoint = (model.filteredWaypoints.length > 0)
			? model.filteredWaypoints[0]
			: undefined;

		if (model.selectedPoint !== undefined)
			return;

		model.selectedPoint = (model.waypoints.length > 0)
			? model.waypoints[0]
			: undefined;
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// LOAD

	$rootScope.$on(Event.TRACK_LOADED, function(evt, id) {
		$scope.loadWaypointsForTrack(id);
	});	

	// UNLOAD

	$scope.unloadAllWaypoints = function() {
		model.waypoints.length = 0;
		$rootScope.$emit(Event.WAYPOINTS_UNLOADED);
	};	

	// RELOAD FOR ALL TRACKS
	
	$scope.reloadWaypointsForTracks = function() {
		model.waypoints.length = 0;

		$scope.$parent.tracks.forEach(function(track) {
			$scope.loadWaypointsForTrack(track.id);
		});
	};	

	$scope.mergeNewPoints = function(newPoints) {

		var changed = false;

		newPoints.forEach(function(newPoint) {

			var exists  = function(existing) { 
				return existing.id == newPoint.id; 
			};

			if (!model.waypoints.containsWhere(exists)) {
				model.waypoints.push(newPoint);
				changed = true;
			}
		});

		if (changed)  {
			$rootScope.$emit(Event.WAYPOINTS_LOADED);
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
			$rootScope.$emit(Event.DEBUG_ERROR, error);
		};

		query = {
			'minLat' : minLat,
			'maxLat' : maxLat,
			'minLon' : minLon,
			'maxLon' : maxLon
		};

		httpGET($http, 'waypoints', query, successFn, failureFn, errorFn);
	};

	$scope.loadWaypointsForTrack = function(id) {

		var track = $scope.$parent.tracks.filter(function(x) {return x.id == id;})[0];
		if (track) {
			$scope.getAndMergeForArea(track.minMaxLat.min, track.minMaxLat.max, track.minMaxLon.min, track.minMaxLon.max);
		}
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// EXPORT

	$scope.exportAllWaypoints = function(fileName) {
		var data = { waypoints : model.waypoints, fileName : fileName };
		$rootScope.$emit(Command.EXPORT_WAYPOINTS, data);
	};
}