function TracksController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;
	$scope.model = $scope.$parent.model;

	// DELETE

	$scope.deleteTrack = function(track) {
 		$rootScope.$emit(Command.DELETE_TRACK, track);
 	};

	// COPY TRACK

	$scope.copyInfo = {
		trackToCopy: null,
		gpxIdToCopyTo: null
	};

 	$scope.setTrackToCopy = function(track) {
 		$scope.trackToCopy = track;
 	};

	$scope.copyTrackToGpx = function() {

		var data = { gpx: $scope.copyInfo.gpxToCopyTo, track: $scope.copyInfo.trackToCopy };
		$rootScope.$emit(Command.COPY_TRACK_TO_GPX, data);
		$scope.copyInfo.trackToCopy = undefined;
	};

 	// UNLOAD

	$scope.deleteTrack = function(track) {

		$rootScope.$emit(Command.DELETE_TRACK, track);
	};

	// EXPORT

	$scope.exportTrack = function(track) {
		
		var name = (track.name !== undefined)
			? track.name
			: 'track';

		var fileName = name + '.gpx'
	
		$rootScope.$emit(Command.EXPORT_TRACKS, { tracks : [track], fileName : fileName});
	};

	$scope.exportAllTracks = function() {

		var tracks = model.getTracks();
		
		if (tracks.length == 0)
			return;

		var track = tracks[0];

		var name = (track.name !== undefined)
			? track.name
			: 'gpxmaps.net.tracks';

		var fileName = name + '.gpx'

		$rootScope.$emit(Command.EXPORT_TRACKS, { tracks: tracks });
	};

	// SELECT

	$scope.selectFirstGridRow = function() {
		$scope.gridApi.selection.clearSelectedRows();
		$scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
	};
	$scope.selectFirstGridRowDelayed = function() {
		$timeout($scope.selectFirstGridRow, 0);
	};

	$rootScope.$on(Event.DATA_MODEL_CHANGED, function(evt){

		// console.dir($scope.gridApi.selection);

		var tracks = model.getTracks();
		var alreadySelectedTracks = $scope.gridApi.selection.getSelectedRows();

		if ((model.selectedTrack !== undefined) && (model.selectedTrack !== null)) {

			// selected track no longer exists
			// 
			if (tracks.indexOf(model.selectedTrack) == -1) {
				
				model.selectedTrack = null;
				$scope.selectFirstGridRowDelayed();
			}
			else {

				// already selected
				//
				if (alreadySelectedTracks.indexOf(model.selectedTrack) !== -1)
					return;

				// not yet selected
				//
				$timeout(function() {

					$scope.gridApi.selection.clearSelectedRows();
					$scope.gridApi.selection.toggleRowSelection(model.selectedTrack);
				}, 0);

				return;
			}
		} 
		// update selection
		//
		else {			
			$scope.selectFirstGridRowDelayed();
		}
	});

	// --------------------------------------------------------------------
	// GRID

	// DELETE TRACK
	//
	var deleteIconSrcRef = '/static/img/icon/black_button/button_black_delete_16.png';
	var deleteIconImgTemplate = '<img ng-src="' + deleteIconSrcRef + '">';
	var deleteCellTemplate = '<div style="padding-top:5px;"><a href="#" title="delete track" ng-click="grid.appScope.deleteTrack(row.entity);" ">' + deleteIconImgTemplate + '</a></div>';

	// GRID EXPORT
	//
	var exportIconSrcRef = '/static/img/icon/black_button/button_black_down_16.png';
	var exportIconImgTemplate = '<img ng-src="' + exportIconSrcRef + '">';
	var exportCellTemplate = '<div style="padding-top:5px;"><a href="#" title="export track" ng-click="grid.appScope.exportTrack(row.entity)" ">' + exportIconImgTemplate + '</a></div>';

	$scope.gridOptions = {

		data: $scope.$parent.model.getTracks(),

		enableRowSelection: true,
		multiSelect:false,
		enableSelectionBatchEvent: false, // single event only
		enableRowHeaderSelection: false, // no header, click row to select

		enableFiltering: false,

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
				name: 'export',
				width: '40', 
				cellTemplate: exportCellTemplate,
				headerCellTemplate: '<span></span>',
				enableSorting: false, 
				enableHiding: false,
				enableFiltering: false,
				enableCellEdit: false,
			},
			{
				name: 'gpx',
				width: '300',
				enableHiding: false,
				enableFiltering: false,
				cellTemplate: '<span title="{{grid.appScope.model.gpxForTrack(row.entity).label()}}">{{ grid.appScope.model.gpxForTrack(row.entity).label() }}</span>',
				enableCellEdit: false,
			},
			{
				field: 'name',
				width: '300',
				enableHiding: false,
				enableFiltering: false,
				enableCellEdit: true,
				cellTooltip: true,
				headerCellTemplate: '<span>Track Name</span>',
			},
			{
				name: 'SegmentCount',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>Segments</span>',
				cellTemplate: '<span>{{ row.entity.segments.length }}</span>',
				enableCellEdit: false,
			},
			{
				name: 'TotalDistKM',
				field: 'totalDistanceM',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>Total Dist<br/>km</span>',
				cellTemplate: '<span>{{ (row.entity.totalDistanceM / 1000).toFixed(2) }}</span>',
				enableCellEdit: false,
			},
			{
				field: 'durationTotalHours',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>Duration<br/>hours</span>',
				cellTemplate: '<span>{{ row.entity.durationTotalHours.toFixed(2) }}</span>',
				enableCellEdit: false,
			},
			{
				name: 'ElevationRangeM',
				field: 'eleDiff',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>Ele Range<br/>m</span>',
				cellTemplate: '<span>{{ (row.entity.eleDiff).toFixed(0) }}</span>',
				enableCellEdit: false,
			},
			{
				name: 'MinElevation',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>Min Ele<br/>MSL</span>',
				cellTemplate: '<span>{{ row.entity.minMaxEle.min.toFixed(0) }}</span>',
				enableCellEdit: false,
			},
			{
				name: 'MaxElevation',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>Max Ele<br/>MSL</span>',
				cellTemplate: '<span>{{ row.entity.minMaxEle.max.toFixed(0) }}</span>',
				enableCellEdit: false,
			},
		],

		onRegisterApi: function(gridApi) {

			$scope.gridApi = gridApi;

			// selection.on.rowSelectionChanged
			//
			gridApi.selection.on.rowSelectionChanged($scope, function(row){

				// update model
				//
				model.selectedTrack = ((row !== undefined) && (row !== null))
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
						$rootScope.$emit(Command.UPDATE_TRACK_NAME, { track: rowEntity, name: newValue });
						break;
				}
          	});
	    },
	};
};