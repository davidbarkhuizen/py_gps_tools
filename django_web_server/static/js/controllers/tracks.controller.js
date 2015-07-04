function TracksController($rootScope, $scope, $http, $timeout) {

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

		var ids = $scope.$parent.tracks.map(function(track) { return track.id; });		
		$rootScope.$emit(Command.EXPORT_TRACKS, { ids : ids });
	};

	// --------------------------------------------------------------------
	// GRID

	// DELETE TRACK
	//
	var deleteIconSrcRef = '/static/img/icon/black_button/button_black_delete_16.png';
	var deleteIconImgTemplate = '<img ng-src="' + deleteIconSrcRef + '">';
	var deleteCellTemplate = '<div style="padding-top:5px;"><a href="#" title="delete track" ng-click="grid.appScope.deleteTrack(row.entity);" ">' + deleteIconImgTemplate + '</a></div>';

	$scope.gridOptions = {

		data: $scope.$parent.model.getTracks(),

		enableRowSelection: true,
		multiSelect:false,
		enableSelectionBatchEvent: false, // single event only
		enableRowHeaderSelection: false, // no header, click row to select

		enableFiltering: false,

		// {{ track.segments.length }} Track Segments
		// <div ng-repeat='segment in track.segments'>
		// 	{{ track.segments.indexOf(segment) + 1 }} - {{ segment.points.length }} points
		// </div>

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
				width: '150',
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
				headerCellTemplate: '<span>Min Ele<br/>m</span>',
				cellTemplate: '<span>{{ row.entity.minMaxEle.min.toFixed(0) }}</span>',
				enableCellEdit: false,
			},
			{
				name: 'MaxElevation',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>Max Ele<br/>m</span>',
				cellTemplate: '<span>{{ row.entity.minMaxEle.max.toFixed(0) }}</span>',
				enableCellEdit: false,
			},
		]
	};
};