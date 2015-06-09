function WaypointsController($rootScope, $scope, $http, $timeout) {

	$scope.model = $scope.$parent.model; 

	$scope.dateValToTimeString = dateValToTimeString;

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	var timeCellTemplate = '<span>{{ row.entity.time.toISOString() }}</span>';

	$scope.gridOptions = {

		data: $scope.$parent.model.waypoints,

		enableRowSelection: true,
		multiSelect:false,
		enableSelectionBatchEvent: false, // single event only
		enableRowHeaderSelection: false, // no header, click row to select

		enableFiltering: true,

		columnDefs: [
			{
				name: 'gpx',
				enableHiding: false,
				enableFiltering: false,
				cellTemplate: '<span>{{ grid.appScope.$parent.gpxEditor.gpxForWaypoint(row.entity).label() }}</span>'
			},
			{
				name: 'time',
				field: 'time',
				cellTemplate: timeCellTemplate,

				enableHiding: false,
				enableFiltering: false,
			},
			{
				name: 'latitude',
				field: 'lat',

				enableHiding: false,
				enableFiltering: false,
			},
			{
				name: 'longitude',
				field: 'lon',

				enableHiding: false,
				enableFiltering: false,
			},
			{
				name: 'name',
				field: 'name',

				enableHiding: false,
				enableFiltering: true,
			}
		],

		onRegisterApi: function(gridApi) {

			gridApi.selection.on.rowSelectionChanged($scope, function(row){

				if ((row === undefined) || (row.entity=== undefined))
					return;

				$scope.selectWaypoint(row.entity);
			});
	    },
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// SELECT

	$scope.selectWaypoint = function(waypoint) {
		$scope.model.selectedPoint = waypoint;
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
	$scope.edit = function() { 

		if (!$scope.model.selectedPoint) return;

		$scope.editCopy = JSON.parse(JSON.stringify($scope.model.selectedPoint)); 

		$timeout(function() { focusOnId('EditWaypointName'); }, 10);

		$scope.deleting = false;
		$scope.editing = true;
	};

	$scope.showSaveEdit = function() { 

		var x =   
			(
			($scope.editing == true) 
			&& 
			(JSON.stringify($scope.editCopy) !== JSON.stringify($scope.model.selectedPoint))
			);

		return x;
	};

	$scope.saveEdit = function() {

		//$scope.model.selectedPoint.name = $scope.editCopy.name;
		$scope.editing = false;

		$rootScope.$emit(Command.UPDATE_WAYPOINT_NAME, { waypoint: $scope.model.selectedPoint, name: $scope.editCopy.name});
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

	$scope.getDeletionConfirmation = function() {
		$scope.deleting = true;
	};
	$scope.showDeleteConfirmationPrompt = function() {
		return ($scope.model.selectedPoint) && ($scope.deleting == true);
	};
	$scope.delete = function() {

		$scope.deleting = false;
		$rootScope.$emit(Event.WAYPOINT_DELETED);

		$rootScope.$emit(Command.DELETE_WAYPOINT, $scope.model.selectedPoint);
	};

	$rootScope.$on(Event.WAYPOINT_DELETED, function(evt, waypoint) {
		if ($scope.model.selectedPoint == waypoint) {
			$scope.model.selectedPoint = ($scope.model.waypoints.length > 0)
				? $scope.model.waypoints[0]
				: undefined;
		}
	});

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// SELECT

	$scope.selectFirstWaypoint = function() {

		$scope.model.selectedPoint = ($scope.model.filteredWaypoints.length > 0)
			? $scope.model.filteredWaypoints[0]
			: undefined;

		if ($scope.model.selectedPoint !== undefined)
			return;

		$scope.model.selectedPoint = ($scope.model.waypoints.length > 0)
			? $scope.model.waypoints[0]
			: undefined;
	};

	// UNLOAD

	$scope.unloadAllWaypoints = function() {
		$scope.model.waypoints.length = 0;
		$rootScope.$emit(Event.WAYPOINTS_UNLOADED);
	};	

	// LOAD

	$rootScope.$on(Command.LOAD_WAYPOINTS, function(evt, waypoints){
		$scope.mergeNewPoints(waypoints);
	});

	// RELOAD FOR ALL TRACKS
	
	$scope.reloadWaypointsForTracks = function() {
		$scope.model.waypoints.length = 0;

		$scope.$parent.tracks.forEach(function(track) {
			$scope.loadWaypointsForTrack(track.id);
		});
	};	

	$scope.mergeNewPoints = function(newPoints) {

		var changed = false;

		newPoints.forEach(function(newPoint) {

			var exists  = function(existing) { 
				return false;s
			};

			if (!$scope.model.waypoints.containsWhere(exists)) {
				$scope.model.waypoints.push(newPoint);
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

			if (($scope.model.selectedPoint === undefined) || ($scope.model.selectedPoint === null))
				$scope.selectFirstWaypoint();
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
		var data = { waypoints : $scope.model.waypoints, fileName : fileName };
		$rootScope.$emit(Command.EXPORT_WAYPOINTS, data);
	};
}