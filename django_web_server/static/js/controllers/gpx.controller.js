function GpxController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;
	var gpxEditor = $scope.$parent.gpxEditor;

	// ----------------------------------
	// LOAD

	$scope.loadGpx = function(id) {

		var successFn = function(data) {

			var gpx = new GPX(data.xml, data.file_name);
			gpx.id = data.id;
			gpxEditor.loadGPX(gpx);

			$rootScope.$emit(Event.GPX_LOADED);

			if (gpx.tracks.length > 0) {
				$rootScope.$emit(Event.TRACK_LOADED);
			}

			if (gpx.waypoints.length > 0) {
				$rootScope.$emit(Event.WAYPOINTS_LOADED);
			}

			// select 1st row
			//
			if (($scope.model.selectedGpx == undefined) || (model.gpxs.contains($scope.model.selectedGpx) == false)) {
				$scope.selectFirstGridRowDelayed();
			}

			// change view
			//
			$rootScope.$emit(Command.GOTO_VIEW, Views.GPX);
		};

		var failFn = function(status){
			console.log('fail');
		};

		httpGET($http, 'gpx', { 'id' : id }, successFn, failFn, $scope.globalDebug);
	};

 	$rootScope.$on(Command.LOAD_GPX, function(evt, id) {
		$scope.loadGpx(id);	
	});

	// ----------------------------------
	// UNLOAD

	$scope.unloadGpx = function(gpx) {
		
		if ($scope.model.selectedGpx == gpx)
			$scope.model.selectedGpx = undefined;

		$rootScope.$emit(Command.UNLOAD_GPX, gpx);
	};

	$scope.unloadAll = function() {

		var gpxs = model.gpxs.slice();
		gpxs.forEach(function(gpx){ $scope.unloadGpx(gpx); });
	};

	// EXPORT

	$scope.exportGpx = function(gpx) {
		$rootScope.$emit(Command.EXPORT_GPX, { gpx: gpx });
	};

	// GRID -----------------------

	$scope.selectGpx = function(id) {

		if ((id == null) || (id === undefined))
			return;

		model.gpxs.forEach(function(gpx) {
			if (gpx.id == id) {
				$scope.model.selectedGpx = gpx;
			}
		});
	};

	$scope.selectFirstGridRow = function() {
		$scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
	}
	$scope.selectFirstGridRowDelayed = function() {
		$timeout($scope.selectFirstGridRow, 0);
	};

	// GRID UNLOAD
	//
	var unloadIconSrcRef = '/static/img/icon/black_button/button_black_minus_16.png';
	var unloadIconImgTemplate = '<img ng-src="' + unloadIconSrcRef + '">';
	var unloadCellTemplate = '<div style="padding-top:5px;"><a href="#" title="unload" ng-click="grid.appScope.unloadGpx(row.entity)" ">' + unloadIconImgTemplate + '</a></div>';

	// GRID EXPORT
	//
	var exportIconSrcRef = '/static/img/icon/black_button/button_black_down_16.png';
	var exportIconImgTemplate = '<img ng-src="' + exportIconSrcRef + '">';
	var exportCellTemplate = '<div style="padding-top:5px;"><a href="#" title="export" ng-click="grid.appScope.exportGpx(row.entity)" ">' + exportIconImgTemplate + '</a></div>';

	$scope.gridApi = undefined;

	$scope.updateGpxFileName = function(gpx, newFileName) {
		$rootScope.$emit(Command.UPDATE_GPX_FILENAME, { gpx: gpx, fileName: newFileName });
	};
	$scope.updateGpxName = function(gpx, newName) {
		$rootScope.$emit(Command.UPDATE_GPX_NAME, { gpx: gpx, name: newName });
	};
	$scope.updateGpxDesc = function(gpx, newDesc) {
		$rootScope.$emit(Command.UPDATE_GPX_DESC, { gpx: gpx, desc: newDesc });
	};

	$scope.gridOptions = {

		data: $scope.$parent.model.gpxs,

		enableRowSelection: true,
		multiSelect:false,
		enableSelectionBatchEvent: false, // single event only
		enableRowHeaderSelection: false, // no header, click row to select

		columnDefs: [
			{ 	
				field: 'id', 
				width: '40', 
				cellTemplate: unloadCellTemplate,
				headerCellTemplate: '<span></span>',
				enableSorting: false, 
				enableHiding: false,
				enableFiltering: false,
				enableCellEdit: false,
			},
			{ 	
				field: 'id', 
				width: '40', 
				cellTemplate: exportCellTemplate,
				headerCellTemplate: '<span></span>',
				enableSorting: false, 
				enableHiding: false,
				enableFiltering: false,
				enableCellEdit: false,
			},
			{
				field: 'fileName',
				width: '300',
				enableHiding: false,
				enableFiltering: false,				
				headerCellTemplate: '<span>File</span>',
				cellTooltip: true,
			},
			{
				field: 'name',
				width:'300',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>Name</span>',
				cellTooltip: true,
			},
			{
				field: 'desc',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>Description</span>',
				cellTooltip: true,
			},
			{
				field: 'waypoints',
				enableHiding: false,
				enableFiltering: false,
				width:'100',
				headerCellTemplate: '<span>Waypoints</span>',
				cellTemplate: '<span>{{ row.entity.waypoints.length }}</span>',
				enableCellEdit: false,
			},
			{
				name: 'trackCount',
				enableHiding: false,
				enableFiltering: false,
				width:'100',
				headerCellTemplate: '<span>Tracks</span>',
				cellTemplate: '<span>{{ row.entity.tracks.length }}</span>',
				enableCellEdit: false,
			}
		],

		onRegisterApi: function(gridApi) {

			$scope.gridApi = gridApi;

			// selection.on.rowSelectionChanged
			//
			gridApi.selection.on.rowSelectionChanged($scope, function(row){

				if ((row === undefined) || (row.entity.id == null) || (row.entity.id === undefined))
					return;

				$scope.selectGpx(row.entity.id);
			});

			// edit.on.afterCellEdit
			//
          	gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
	            
          		var editable = ['fileName', 'name', 'desc'];

          		if (editable.indexOf(colDef.field) == -1)
          			return;

      			switch (colDef.field) {
					case 'fileName':
						$rootScope.$emit(Command.UPDATE_GPX_FILENAME, { gpx: rowEntity, fileName: newValue});
						break;
					case 'name':
						$rootScope.$emit(Command.UPDATE_GPX_NAME, { gpx: rowEntity, name: newValue});
						break;
					case 'desc':
						$rootScope.$emit(Command.UPDATE_GPX_DESC, { gpx: rowEntity, desc: newValue});
						break;
				}
          	});
	    },
	};
}