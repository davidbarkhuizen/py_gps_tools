function GpxEditorController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;
	var gpxEditor = $scope.$parent.gpxEditor;

	$rootScope.$on(Command.DELETE_TRKSEG_SECTION, function(evt, data) {

		gpxEditor.deleteTrackSegmentSection(data.pathSelectionType, data.endPoints);
		$rootScope.$emit(Event.GPX_EDITED);
	});

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
		$rootScope.$emit(Event.WAYPOINT_EDITED);
	};
	$rootScope.$on(Command.UPDATE_WAYPOINT_NAME, function(evt, data) {

		$scope.updateWaypointName(data.waypoint, data.name);
	});

	// DELETE_WAYPOINT
	//
	$scope.deleteWaypoint = function(waypoint) {	

		gpxEditor.deleteWaypoint(waypoint);
		$rootScope.$emit(Event.WAYPOINT_DELETED, waypoint);
	};
	$rootScope.$on(Command.DELETE_WAYPOINT, function(evt, waypoint) {

		$scope.deleteWaypoint(waypoint);
	});

	// UNLOAD_TRACK
	//
	$scope.unloadTrack = function(track) {	

		gpxEditor.deleteTrack(track);
		$rootScope.$emit(Event.TRACKS_UNLOADED, track);
	};
	$rootScope.$on(Command.UNLOAD_TRACK, function(evt, track) {

		$scope.unloadTrack(track);
	});

	// COPY TRACK
	//
	$scope.copyTrackToGpx = function(track, gpx) {

		gpxEditor.copyTrackToGpx(track, gpx);
		$rootScope.$emit(Event.GPX_EDITED);	
	};
	$rootScope.$on(Command.COPY_TRACK_TO_GPX, function(evt, data) {

		$scope.copyTrackToGpx(data.track, data.gpx);
	});

	// UNLOAD_GPX
	//
	$scope.unloadGPX = function(gpx) {

		gpxEditor.unloadGPX(gpx);
		$rootScope.$emit(Event.GPXS_UNLOADED);
	};
	$rootScope.$on(Command.UNLOAD_GPX, function(evt, gpx) {

		$scope.unloadGPX(gpx);
	});
}