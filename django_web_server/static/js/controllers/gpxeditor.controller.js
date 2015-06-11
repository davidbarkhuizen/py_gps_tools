var GpxEditorCommand = Object.freeze({

	DELETE_TRKSEG_SECTION: guid(),
});

function GpxEditorController($rootScope, $scope, $http, $timeout) {

	// init
	var model = $scope.$parent.model;
	var tracks = $scope.$parent.tracks;
	$scope.gpxEditor = new GPXEditor(model.gpxs, tracks, model.waypoints);

	$rootScope.$on(GpxEditorCommand.DELETE_TRKSEG_SECTION, function(evt, data) {

		$scope.gpxEditor.deleteTrackSegmentSection(data.pathSelectionType, data.endPoints);

		switch (pathSelectionType) {
			case PathSelectionType.BEFORE:
				break;
			case PathSelectionType.BEFORE:
				break;
		}

		/*
		var lengthBefore = $scope.selectedSegment.points.length;

		$scope.selectedSegment.points.removeWhere(function(p){
			return ($scope.selectedSegmentSectionPoints.indexOf(p) !== -1);
		});

		if ($scope.selectedSegment.points.length !== lengthBefore)
			$scope.selectedSegmentTrack.edited = true;

		$scope.drawMap();
		*/

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

	// DELETE_TRACK
	//
	$scope.deleteTrack = function(track) {	

		$scope.gpxEditor.deleteTrack(track);
		$rootScope.$emit(Event.TRACK_DELETED, track);
	};
	$rootScope.$on(Command.DELETE_TRACK, function(evt, track) {

		$scope.deleteTrack(track);
	});
}