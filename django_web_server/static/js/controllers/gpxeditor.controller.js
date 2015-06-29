function GpxEditorController($rootScope, $scope, $http, $timeout) {

	$scope.gpxEditor = new GPXEditor($scope.$parent.model.gpxs, $scope.$parent.tracks, $scope.$parent.model.waypoints);

	// lol
	$scope.$parent.gpxEditor = $scope.gpxEditor;

	$rootScope.$on(Command.DELETE_TRKSEG_SECTION, function(evt, data) {

		$scope.gpxEditor.deleteTrackSegmentSection(data.pathSelectionType, data.endPoints);

		$rootScope.$emit(Event.GPX_EDITED);
	});

 	// UPDATE_WAYPOINT_NAME
 	//
	$scope.updateWaypointName = function(waypoint, name) {
		$scope.gpxEditor.updateWaypointName(waypoint, name);
		$rootScope.$emit(Event.WAYPOINT_EDITED);
	};
	$rootScope.$on(Command.UPDATE_WAYPOINT_NAME, function(evt, data) {
		$scope.updateWaypointName(data.waypoint, data.name);
	});

	// DELETE_WAYPOINT
	//
	$scope.deleteWaypoint = function(waypoint) {	

		$scope.gpxEditor.deleteWaypoint(waypoint);
		$rootScope.$emit(Event.WAYPOINT_DELETED, waypoint);
	};
	$rootScope.$on(Command.DELETE_WAYPOINT, function(evt, waypoint) {

		$scope.deleteWaypoint(waypoint);
	});

	// UNLOAD_TRACK
	//
	$scope.unloadTrack = function(track) {	

		$scope.gpxEditor.deleteTrack(track);
		$rootScope.$emit(Event.TRACKS_UNLOADED, track);
	};
	$rootScope.$on(Command.UNLOAD_TRACK, function(evt, track) {
		$scope.unloadTrack(track);
	});

	// COPY TRACK
	//
	$scope.copyTrackToGpx = function(track, gpx) {
		$scope.gpxEditor.copyTrackToGpx(track, gpx);
		$rootScope.$emit(Event.GPX_EDITED);	
	};
	$rootScope.$on(Command.COPY_TRACK_TO_GPX, function(evt, data) {
		$scope.copyTrackToGpx(data.track, data.gpx);
	});

	// UNLOAD_GPX
	//
	$scope.unloadGPX = function(gpx) {
		$scope.gpxEditor.unloadGPX(gpx);
		$rootScope.$emit(Event.GPXS_UNLOADED);
	};
	$rootScope.$on(Command.UNLOAD_GPX, function(evt, gpx) {
		$scope.unloadGPX(gpx);
	});
}