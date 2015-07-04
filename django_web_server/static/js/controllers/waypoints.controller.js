function WaypointsController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;
	$scope.model = $scope.$parent.model; 

	$scope.dateValToTimeString = dateValToTimeString;

	// COPY ONE, ALL TO GPX ------------------------------------------

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

	$scope.copyToGpx = function(waypoint, gpx) {

		if ((model.gpxs.length == 1) || (gpx === null) || (gpx === undefined))
			return;

		$rootScope.$emit(Command.COPY_WAYPOINTS_TO_GPX, {
			waypoints: [waypoint],
			gpx: $scope.copyInfo.gpxToCopyTo
		});

		$scope.copyInfo.showCopyToGpx = false;
	};

	// COPY SINGLE WAYPOINT TO CLIPBOARD ------------------------------------------
	//

	$scope.copySelectedWaypointCoordinatesToClipBoard = function() {
		
		if (($scope.model.selectedPoint === null) || ($scope.model.selectedPoint === undefined))
			return;

		var s = $scope.model.selectedPoint.toStr();
		copyToClipboard(s);
	}

	// SELECT ------------------------------------------
	//
	$rootScope.$on(Command.SELECT_WAYPOINTS, function(evt, waypoints) { 
		$scope.selectGridRowsForWaypoints(waypoints); 
	});

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

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// DELETE

	$scope.delete = function(waypoint) {
		$rootScope.$emit(Command.DELETE_WAYPOINT, waypoint);
	};

	// ---------------------------------------

	$rootScope.$on(Event.DATA_MODEL_CHANGED, function(evt) {

		var waypoints = model.getWaypoints();

		if ((model.selectedPoint === undefined) || (model.selectedPoint === null) &&  (waypoints.length > 0)) {

			$scope.selectFirstGridRowDelayed();
		}
	});

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

	$scope.selectGridRowsForWaypoints = function(waypoints) {

		$scope.gridApi.selection.clearSelectedRows();

		waypoints.forEach(function(x){
			$scope.gridApi.selection.toggleRowSelection(x);
		});
	};

	// DELETE WAYPOINT
	//
	var deleteIconSrcRef = '/static/img/icon/black_button/button_black_delete_16.png';
	var deleteIconImgTemplate = '<img ng-src="' + deleteIconSrcRef + '">';
	var deleteCellTemplate = '<div style="padding-top:5px;"><a href="#" title="delete waypoint" ng-click="grid.appScope.delete(row.entity)" ">' + deleteIconImgTemplate + '</a></div>';

	$scope.gridOptions = {

		data: $scope.$parent.model.getWaypoints(),

		enableRowSelection: true,
		//multiSelect:false,
		enableSelectionBatchEvent: false, // single event only
		enableRowHeaderSelection: false, // no header, click row to select

		enableFiltering: true,

		columnDefs: [
			{ 	
				name: 'delete',
				width: '40', 
				cellTemplate: deleteCellTemplate,
				headerCellTemplate: '<span></span>',
				enableSorting: false, 
				enableHiding: false,
				enableFiltering: false,
				enableCellEdit: false,
			},
			{
				name: 'gpx',
				enableHiding: false,
				enableFiltering: false,
				cellTemplate: '<span>{{ grid.appScope.$parent.gpxEditor.gpxForWaypoint(row.entity).label() }}</span>',
				enableCellEdit: false,
			},
			{
				name: 'time',
				field: 'time',
				cellTemplate: timeCellTemplate,

				enableHiding: false,
				enableFiltering: false,
				enableCellEdit: false,
			},
			{
				name: 'latitude',
				field: 'lat',

				enableHiding: false,
				enableFiltering: false,
				enableCellEdit: false,
			},
			{
				name: 'longitude',
				field: 'lon',

				enableHiding: false,
				enableFiltering: false,
				enableCellEdit: false,
			},
			{
				name: 'name',
				field: 'name',

				enableHiding: false,
				enableFiltering: true,
				filter: { condition: basicFilter },
				enableCellEdit: true,
			}
		],

		onRegisterApi: function(gridApi) {

			$scope.gridApi = gridApi;

			// selection.on.rowSelectionChanged
			//
			gridApi.selection.on.rowSelectionChanged($scope, function(row){

				// update model
				//
				model.selectedPoint = ((row !== undefined) && (row !== null))
					? row.entity
					: null;
			});

			// edit.on.afterCellEdit
			//
          	gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
	            
          		var editable = ['name'];
          		if (editable.indexOf(colDef.field) == -1)
          			return;

      			switch (colDef.field) {
					case 'name':
						$rootScope.$emit(Command.UPDATE_WAYPOINT_NAME, { waypoint: rowEntity, name: newValue });
						break;
				}
          	});
	    },
	};

	// ----------
}