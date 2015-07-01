function GpxController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;

	$scope.selectedGpx = undefined;

	$scope.loadGpx = function(id) {

		var successFn = function(data) {

			var gpx = new GPX(data.xml, data.file_name);
			gpx.id = data.id;

			model.gpxs.push(gpx);

			// tracks
			//
			if (gpx.tracks.length > 0) {
				$rootScope.$emit(Command.LOAD_TRACKS, gpx.tracks);
			}

			// waypoints
			//
			if (gpx.waypoints.length > 0) {
				$rootScope.$emit(Command.LOAD_WAYPOINTS, gpx.waypoints);
			}

			// select 1st row
			//
			if (($scope.selectedGpx == undefined) || (model.gpxs.contains($scope.selectedGpx) == false)) {
				$scope.selectFirstGridRowDelayed();
			}

			// change view
			//
			$rootScope.$emit(Command.GOTO_VIEW, Views.LOADED_GPXS);
		};

		var failFn = function(status){
			console.log('fail');
		};

		httpGET($http, 'gpx', { 'id' : id }, successFn, failFn, $scope.globalDebug);
	};

 	$rootScope.$on(Command.LOAD_GPX, function(evt, id) {
		$scope.loadGpx(id);	
	});

	$scope.unloadGpx = function(gpx) {
		
		if ($scope.selectedGpx == gpx)
			$scope.selectedGpx = undefined;

		$rootScope.$emit(Command.UNLOAD_GPX, gpx);
	};

	$scope.unloadAll = function() {

		var gpxs = model.gpxs.slice();
		gpxs.forEach(function(gpx){ $scope.unloadGpx(gpx); });
	};

	// GRID -----------------------

	$scope.selectGpx = function(id) {

		if ((id == null) || (id === undefined))
			return;

		model.gpxs.forEach(function(gpx) {
			if (gpx.id == id) {
				$scope.selectedGpx = gpx;
			}
		});
	};

	$scope.selectFirstGridRow = function() {
		$scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
	}
	$scope.selectFirstGridRowDelayed = function() {
		$timeout($scope.selectFirstGridRow, 0);
	};

	var unloadIconSrcRef = '/static/img/icon/delete_16.png';
	var unloadIconImgTemplate = '<img ng-src="' + unloadIconSrcRef + '">';
	var unloadCellTemplate = '<div style="padding-top:5px;"><a href="#" ng-click="grid.appScope.unloadGpx(row.entity)" ">' + unloadIconImgTemplate + '</a></div>';

	$scope.gridApi = undefined;

	$scope.gridOptions = {

		data: $scope.$parent.model.gpxs,

		enableRowSelection: true,
		multiSelect:false,
		enableSelectionBatchEvent: false, // single event only
		enableRowHeaderSelection: false, // no header, click row to select

		columnDefs: [
			{ 	
				field: 'id', 
				width: '80', 
				cellTemplate: unloadCellTemplate,
				headerCellTemplate: '<span>unload</span>',
				enableSorting: false, 
				enableHiding: false,
				enableFiltering: false,
			},
			{
				field: 'fileName',
				enableHiding: false,
				enableFiltering: false,				
				headerCellTemplate: '<span>file name</span>',
				cellTooltip: true,
			},
			{
				field: 'name',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>metadata name</span>',
				cellTooltip: true,
			},
			{
				field: 'waypoints',
				enableHiding: false,
				enableFiltering: false,
				width:'100',
				headerCellTemplate: '<span>waypoint<br/>count</span>',
				cellTemplate: '<span>{{ row.entity.waypoints.length }}</span>',
			},
			{
				name: 'trackCount',
				enableHiding: false,
				enableFiltering: false,
				width:'100',
				headerCellTemplate: '<span>track<br/>count</span>',
				cellTemplate: '<span>{{ row.entity.tracks.length }}</span>',
			},
			{
				name: 'trackNames',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>track names</span>',
				cellTemplate: "<span title={{row.entity.track_names_concat()}}>{{ row.entity.track_names_concat() }}</span>",
			},
		],

		onRegisterApi: function(gridApi) {

			$scope.gridApi = gridApi;

			gridApi.selection.on.rowSelectionChanged($scope, function(row){

				if ((row === undefined) || (row.entity.id == null) || (row.entity.id === undefined))
					return;

				$scope.selectGpx(row.entity.id);
			});
	    },
	};
}