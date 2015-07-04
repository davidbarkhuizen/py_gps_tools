function GpxEditorController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;
	var gpxEditor = $scope.$parent.gpxEditor;

	$rootScope.$on(Command.DELETE_TRKSEG_SECTION, function(evt, data) {

		gpxEditor.deleteTrackSegmentSection(data.pathSelectionType, data.endPoints);
		$rootScope.$emit(Event.DATA_MODEL_CHANGED);
	});

	// WAYPOINTS -----------------------------------------------------------

	// COPY_WAYPOINTS_TO_GPX
	// 
	$scope.copyWaypointsToGpx = function(waypoints, gpx) {
		gpxEditor.copyWaypointsToGpx(waypoints, gpx);
	};
	$rootScope.$on(Command.COPY_WAYPOINTS_TO_GPX, function(evt, data) {
		$scope.copyWaypointsToGpx(data.waypoints, data.gpx);
	});

 	// UPDATE_WAYPOINT_NAME
 	//
	$scope.updateWaypointName = function(waypoint, name) {

		gpxEditor.updateWaypointName(waypoint, name);
		$rootScope.$emit(Event.DATA_MODEL_CHANGED);
	};
	$rootScope.$on(Command.UPDATE_WAYPOINT_NAME, function(evt, data) {
		$scope.updateWaypointName(data.waypoint, data.name);
	});

	// DELETE_WAYPOINT
	//
	$scope.deleteWaypoint = function(waypoint) {	

		gpxEditor.deleteWaypoint(waypoint);
		$rootScope.$emit(Event.DATA_MODEL_CHANGED);
	};
	$rootScope.$on(Command.DELETE_WAYPOINT, function(evt, waypoint) {
		$scope.deleteWaypoint(waypoint);
	});

	// TRACKS -----------------------------------------------------------

	// DELET_TRACK
	//
	$scope.deleteTrack = function(track) {	

		gpxEditor.deleteTrack(track);
		$rootScope.$emit(Event.DATA_MODEL_CHANGED);
	};
	$rootScope.$on(Command.DELETE_TRACK, function(evt, track) {
		$scope.deleteTrack(track);
	});

	// COPY TRACK
	//
	$scope.copyTrackToGpx = function(track, gpx) {

		gpxEditor.copyTrackToGpx(track, gpx);
		$rootScope.$emit(Event.DATA_MODEL_CHANGED);	
	};
	$rootScope.$on(Command.COPY_TRACK_TO_GPX, function(evt, data) {
		$scope.copyTrackToGpx(data.track, data.gpx);
	});

	// GPX -----------------------------------------------------------

	// UNLOAD_GPX
	//
	$scope.unloadGPX = function(gpx) {

		gpxEditor.unloadGPX(gpx);
		$rootScope.$emit(Event.DATA_MODEL_CHANGED);
	};
	$rootScope.$on(Command.UNLOAD_GPX, function(evt, gpx) {
		$scope.unloadGPX(gpx);
	});

	// ------------------------------------------------
	// EDIT GPX

	// UPDATE_GPX_FILENAME
	//
	$scope.updateGpxFileName = function(gpx, fileName) {
		gpxEditor.updateGpxFileName(gpx, fileName);
		$rootScope.$emit(Event.DATA_MODEL_CHANGED);
	};
	$rootScope.$on(Command.UPDATE_GPX_FILENAME, function(evt, data) {
		$scope.updateGpxFileName(data.gpx, data.fileName);
	});

	// UPDATE_GPX_NAME
	//
	$scope.updateGpxName = function(gpx, name) {
		gpxEditor.updateGpxName(gpx, name);
		$rootScope.$emit(Event.DATA_MODEL_CHANGED);
	};
	$rootScope.$on(Command.UPDATE_GPX_NAME, function(evt, data) {
		$scope.updateGpxName(data.gpx, data.name);
	});

	// UPDATE_GPX_DESC
	//
	$scope.updateGpxDesc = function(gpx, desc) {
		gpxEditor.updateGpxDesc(gpx, desc);
		$rootScope.$emit(Event.DATA_MODEL_CHANGED);
	};
	$rootScope.$on(Command.UPDATE_GPX_DESC, function(evt, data) {
		$scope.updateGpxDesc(data.gpx, data.desc);
	});
}