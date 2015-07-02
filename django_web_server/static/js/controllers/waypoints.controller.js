function WaypointsController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;
	$scope.model = $scope.$parent.model; 

	$scope.dateValToTimeString = dateValToTimeString;

	// COPY

	$scope.copyInfo = {
		showCopyAll: false,
		gpxToCopyTo: null
	};

	$scope.copyAllToGpx = function() {

		if ((model.gpxs.length == 1) || ($scope.copyInfo.gpxToCopyTo === null))
			return;

		$rootScope.$emit(Command.COPY_WAYPOINTS_TO_GPX, {
			waypoints: model.getWaypoints(),
			gpx: $scope.copyInfo.gpxToCopyTo
		});

		$scope.copyInfo.showCopyAll = false;
	};

	$scope.copySelectedWaypointCoordinatesToClipBoard = function() {
		
		if (($scope.model.selectedPoint === null) || ($scope.model.selectedPoint === undefined))
			return;

		var s = $scope.model.selectedPoint.toStr();
		copyToClipboard(s);
	}

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// SELECT

	$scope.selectWaypoint = function(waypoint) {

		$scope.model.selectedPoint = waypoint;
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// GRID

	var timeCellTemplate = '<span>{{ row.entity.time.toISOString() }}</span>';

	$scope.gridApi = undefined;

	$scope.selectFirstGridRow = function() {
		$scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
	}
	$scope.selectFirstGridRowDelayed = function() {
		$timeout($scope.selectFirstGridRow, 0);
	};

	$scope.gridOptions = {

		data: $scope.$parent.model.getWaypoints(),

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
				filter: { condition: basicFilter }
			}
		],

		onRegisterApi: function(gridApi) {

			$scope.gridApi = gridApi;

			gridApi.selection.on.rowSelectionChanged($scope, function(row){

				$scope.selectWaypoint(row.entity);
			});
	    },
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
		$rootScope.$emit(Command.DELETE_WAYPOINT, $scope.model.selectedPoint);
	};

	// UNLOAD

	$scope.unloadAllWaypoints = function() {
		$scope.model.waypoints.length = 0;
		$rootScope.$emit(Event.WAYPOINTS_UNLOADED);
	};	

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// EXPORT

	$scope.exportAllWaypoints = function(fileName) {
		var data = { waypoints : $scope.model.waypoints, fileName : fileName, format : 'GPX' };
		$rootScope.$emit(Command.EXPORT_WAYPOINTS, data);
	};

	$scope.exportAllWaypointsAsTxt = function(fileName) {
		var data = { waypoints : $scope.model.waypoints, fileName : fileName, format : 'TXT' };
		$rootScope.$emit(Command.EXPORT_WAYPOINTS, data);
	};

	// DATA MODEL CHANGED

	$rootScope.$on(Event.WAYPOINT_DELETED, function(evt, waypoint) {

		if ($scope.model.selectedPoint == waypoint) {
			
			var waypoints = $scope.model.getWaypoints(); 

			$scope.model.selectedPoint = (waypoints.length > 0)
				? waypoints[0]
				: undefined;
		}
	});

	$rootScope.$on(Event.WAYPOINTS_LOADED, function(evt, data){

		$scope.selectFirstGridRowDelayed();
	});
}